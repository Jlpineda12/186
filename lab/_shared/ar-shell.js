/**
 * Base común de las experiencias AR de 186 Lab.
 * Se encarga de: cámara + seguimiento de imagen (MindAR), modo 3D sin cámara,
 * botones (salir, compartir, controles propios) y estados de la interfaz.
 * Cada experiencia solo aporta su escena con `build()`.
 *
 *   runExperience({
 *     target: 'targets.mind', label: 'target.png', aspect: 1.4,   // alto / ancho de la imagen
 *     controls: [{ id: 'next', label: 'Siguiente' }],
 *     build: (THREE, tools) => ({ root, update(dt), show(), hide(), control(id) })
 *   })
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const LOGO = new URL('../../models/186.glb', import.meta.url).href;

export const ease = {
  outBack: (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};
export const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Etiqueta de texto como textura (nombres, precios, datos). */
export function textCard({ lines, w = 512, h = 160, bg = '#d4ff3a', fg = '#0b0b0b' }) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(0, 0, w, h, 18);
  g.fill();
  g.fillStyle = fg;
  g.textBaseline = 'alphabetic';
  let y = 0;
  lines.forEach((l) => {
    y += l.size * 1.05 + (l.gap ?? 14);
    g.font = `${l.weight ?? 900} ${l.size}px ${l.mono ? '"JetBrains Mono Variable", monospace' : '"Archivo Variable", "Arial Black", sans-serif'}`;
    g.fillText(l.text, 24, y);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, h / w), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
  return mesh;
}

/** Sombra suave redonda para apoyar objetos sobre la imagen. */
export function softShadow(wd, ht, alpha = 0.45) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grd.addColorStop(0, `rgba(0,0,0,${alpha})`);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(wd, ht),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }),
  );
}

/** Carga un GLB y pasa sus materiales a "sin iluminación": la textura pintada a mano
 *  ya trae la luz horneada, así se ve igual que en Blender. */
const glbCache = new Map();
export function loadGLB(url) {
  if (!glbCache.has(url)) {
    glbCache.set(
      url,
      new Promise((resolve, reject) => {
        new GLTFLoader().load(
          url,
          (g) => {
            g.scene.traverse((o) => {
              if (o.isMesh) {
                const map = o.material.map || null;
                if (map) map.colorSpace = THREE.SRGBColorSpace;
                o.material = new THREE.MeshBasicMaterial({ map, color: map ? 0xffffff : o.material.color });
              }
            });
            resolve(g.scene);
          },
          undefined,
          reject,
        );
      }),
    );
  }
  return glbCache.get(url).then((s) => s.clone(true));
}

/** Contorno entintado (casco invertido): la línea oscura alrededor de cada pieza.
 *  Con `misreg`, dos líneas extra en cian y magenta ligeramente corridas: tinta fuera de registro. */
export function inkOutline(root, { color = '#1a0f14', thickness = 0.0018, misreg = false } = {}) {
  const hull = (col, t, off) =>
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(col) }, uT: { value: t }, uOff: { value: new THREE.Vector2(...off) } },
      vertexShader:
        'uniform float uT; uniform vec2 uOff; void main(){ vec4 p = projectionMatrix * modelViewMatrix * vec4(position + normal * uT, 1.0); p.xy += uOff * p.w; gl_Position = p; }',
      fragmentShader: 'uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.0); }',
      side: THREE.BackSide,
    });
  const mats = [{ m: hull(color, thickness, [0, 0]), order: -1 }];
  if (misreg) {
    mats.push({ m: hull('#00d9ff', thickness * 0.9, [-0.006, 0.003]), order: -2 });
    mats.push({ m: hull('#ff2bd6', thickness * 0.9, [0.006, -0.002]), order: -3 });
  }
  const meshes = [];
  root.traverse((o) => o.isMesh && !o.userData.ink && meshes.push(o));
  meshes.forEach((mesh) => {
    // casco con normales suaves propias (vértices unidos por posición): sin grietas en esquinas duras
    const g = mesh.geometry.clone();
    Object.keys(g.attributes).forEach((k) => k !== 'position' && g.deleteAttribute(k));
    const hullGeo = mergeVertices(g, 1e-4);
    hullGeo.computeVertexNormals();
    mats.forEach(({ m, order }) => {
      const o = new THREE.Mesh(hullGeo, m);
      o.userData.ink = true;
      o.renderOrder = order;
      mesh.add(o);
    });
  });
}

/** Sombreado de cómic en vivo (estilo Spider-Verse): tonos planos, trama de puntos
 *  Ben-Day en las sombras medias (en pantalla, como impreso), achurado en la sombra
 *  profunda y brillo plano. La textura trae solo el color de cada ingrediente. */
export function comicify(root, { dot = 5.5, light = [-0.45, 0.65, 0.6], shadow = '#6a5bb0', ink = '#1a0f14' } = {}) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  root.traverse((o) => {
    if (!o.isMesh || o.userData.ink) return;
    const map = o.material.map || null;
    const base = o.material.color ? o.material.color.clone() : new THREE.Color('#ffffff');
    o.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: map },
        uHasMap: { value: map ? 1 : 0 },
        uBase: { value: base },
        uTint: { value: new THREE.Color('#ffffff') },
        uDot: { value: dot * dpr },
        uLight: { value: new THREE.Vector3(...light).normalize() },
        uShadow: { value: new THREE.Color(shadow) },
        uInk: { value: new THREE.Color(ink) },
      },
      vertexShader: `
        varying vec2 vUv; varying vec3 vN;
        void main(){ vUv = uv; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform sampler2D map; uniform float uHasMap; uniform vec3 uBase; uniform vec3 uTint;
        uniform float uDot; uniform vec3 uLight; uniform vec3 uShadow; uniform vec3 uInk;
        varying vec2 vUv; varying vec3 vN;
        void main(){
          vec3 albedo = (uHasMap > 0.5 ? texture2D(map, vUv).rgb : uBase) * uTint;
          float lit = dot(normalize(vN), uLight) * 0.5 + 0.5;
          vec3 shade = albedo * mix(vec3(1.0), uShadow * 1.5, 0.6);
          vec2 p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * (gl_FragCoord.xy / uDot);
          vec2 c = fract(p) - 0.5;
          float tone = clamp((0.72 - lit) / 0.42, 0.0, 1.0);
          float r = sqrt(tone) * 0.64;
          float dots = 1.0 - smoothstep(r - 0.05, r + 0.05, length(c));
          vec3 col = mix(albedo, shade, dots);
          float deep = step(lit, 0.3);
          col = mix(col, shade * 0.82, deep);
          float hatch = step(0.6, fract((gl_FragCoord.x - gl_FragCoord.y) / (uDot * 0.85)));
          col = mix(col, uInk, deep * hatch * 0.5);
          col = mix(col, mix(albedo, vec3(1.0), 0.5), step(0.9, lit));
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    });
  });
}

let logoP = null;
export function loadLogo() {
  return (logoP ??= new Promise((resolve) => {
    new GLTFLoader().load(
      LOGO,
      (g) => {
        g.scene.updateMatrixWorld(true);
        resolve(g.scene);
      },
      undefined,
      () => resolve(null),
    );
  }));
}

/* ───────────── orientación con la gravedad ─────────────
   Las escenas se diseñan para una imagen apoyada en la mesa (+Z de la imagen = arriba).
   Si la imagen está vertical (bolsa de café, carta en la mano, folleto en la pared o en
   un monitor), la escena saldría acostada hacia la cámara. Con el sensor del teléfono
   sabemos dónde es "arriba" de verdad y giramos la escena entera para que se pare
   derecha, apoyada en el borde inferior de la imagen y adelantada para no atravesarla. */

const gravity = { ok: false, beta: 0, gamma: 0 };
let gravityOn = false;
function listenGravity() {
  if (gravityOn) return;
  gravityOn = true;
  addEventListener('deviceorientation', (e) => {
    if (e.beta == null || e.gamma == null) return;
    gravity.ok = true;
    gravity.beta = e.beta;
    gravity.gamma = e.gamma;
  });
}
/** iOS pide permiso para el sensor; tiene que llamarse dentro del toque del usuario. */
function askGravity() {
  const D = window.DeviceOrientationEvent;
  if (D && typeof D.requestPermission === 'function') {
    D.requestPermission().then((r) => r === 'granted' && listenGravity()).catch(() => {});
  } else listenGravity();
}

/** "Arriba" real en coordenadas de la pantalla (x derecha, y arriba, z hacia el usuario). */
export function upFromSensor(beta, gamma, screenAngle = 0, out = new THREE.Vector3()) {
  const b = THREE.MathUtils.degToRad(beta);
  const g = THREE.MathUtils.degToRad(gamma);
  // R = Rz(alpha)·Rx(beta)·Ry(gamma) (spec W3C); arriba en el equipo = Rᵀ·(0,0,1)
  const x = -Math.sin(g) * Math.cos(b);
  const y = Math.sin(b);
  const z = Math.cos(g) * Math.cos(b);
  const a = THREE.MathUtils.degToRad(screenAngle);
  return out.set(x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z).normalize();
}

const SNAP = { flat: Math.cos(THREE.MathUtils.degToRad(22)), wall: Math.sin(THREE.MathUtils.degToRad(22)) };
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _qi = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fr = new THREE.Vector3();
const _rt = new THREE.Vector3();
const AX = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };

/**
 * Pose de corrección (en el espacio de la imagen) para que la escena quede derecha.
 * upLocal: "arriba" real expresado en el espacio de la imagen.
 * Devuelve { q, pos } a aplicar al root de la experiencia.
 */
export function uprightPose(upLocal, { aspect = 1, footprint = 0.42 } = {}, out = { q: new THREE.Quaternion(), pos: new THREE.Vector3() }) {
  const up = _up.copy(upLocal).normalize();
  const c = up.dot(AX.z);
  // imanes: casi en la mesa → exactamente plano; casi vertical → exactamente vertical
  if (c > SNAP.flat || c < -0.2) up.copy(AX.z);
  else if (Math.abs(c) < SNAP.wall) up.addScaledVector(AX.z, -c).normalize();
  // frente: el borde inferior de la imagen si está plana, la cara de la imagen si está vertical
  const fr = _fr.copy(AX.z).addScaledVector(AX.y, -Math.max(0, up.dot(AX.z)));
  fr.addScaledVector(up, -fr.dot(up));
  if (fr.lengthSq() < 1e-6) fr.copy(AX.z).addScaledVector(up, -up.dot(AX.z));
  fr.normalize();
  const rt = _rt.crossVectors(up, fr);
  // diseño: derecha = X, arriba = Z, frente = −Y  →  destino: rt, up, fr
  _m.makeBasis(rt, fr.clone().negate(), up); // columnas: dónde van X, Y y Z del diseño
  out.q.setFromRotationMatrix(_m);
  const v = 1 - Math.abs(up.dot(AX.z)); // 0 plano · 1 vertical
  out.pos.set(0, 0, 0).addScaledVector(fr, footprint * v).addScaledVector(up, -(aspect / 2) * v);
  return out;
}

const svg = (d) => `<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="${d}"/></svg>`;
const ICONS = { prev: svg('M20.5 12h-16M10.5 5.5 4 12l6.5 6.5'), next: svg('M3.5 12h16M13.5 5.5 20 12l-6.5 6.5') };

export function runExperience({ target, label, aspect = 1, controls = [], build, needsLogo = false, title = '186 Lab', shareText = '', footprint = 0.42 }) {
  const $ = (s) => document.querySelector(s);
  const ui = {
    ar: $('[data-ar-stage]'),
    arView: $('[data-ar-view]'),
    status: $('[data-ar-status]'),
    preview: $('[data-ar-preview]'),
    previewCanvas: $('[data-ar-preview] canvas'),
    startAR: $('[data-ar-start]'),
    start3D: $('[data-ar-3d]'),
    exits: document.querySelectorAll('[data-ar-exit]'),
    share: $('[data-ar-share]'),
    fallback: $('[data-ar-fallback]'),
    ctrlBoxes: document.querySelectorAll('[data-ar-controls]'),
  };
  const setStatus = (txt, state) => {
    if (ui.status) ui.status.textContent = txt;
    ui.ar?.setAttribute('data-state', state);
  };

  let exp = null;
  let stopCurrent = null;

  // controles propios de cada experiencia (cambiar plato, abrir pisos, noche…)
  ui.ctrlBoxes.forEach((box) => {
    box.innerHTML = '';
    controls.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'pill stage__ctrl';
      // íconos en SVG: los caracteres ◀ ▶ salen como emoji en iPhone
      const ico = ICONS[c.icon] || '';
      b.innerHTML = c.iconAfter ? `<span></span>${ico}` : `${ico}<span></span>`;
      b.querySelector('span').textContent = c.label;
      b.addEventListener('click', () => {
        exp?.control?.(c.id, b);
        navigator.vibrate?.(8);
      });
      box.appendChild(b);
    });
  });

  async function make() {
    const logo = needsLogo ? await loadLogo() : null;
    return build(THREE, { logo: logo?.clone(true) ?? null, aspect });
  }

  async function startAR() {
    askGravity(); // antes de cualquier await: iOS solo lo permite dentro del toque
    ui.ar.hidden = false;
    document.documentElement.classList.add('ar-open');
    setStatus('Abriendo la cámara…', 'loading');
    try {
      const { MindARThree } = await import('mindar-image-three');
      const mind = new MindARThree({
        container: ui.arView,
        imageTargetSrc: target,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
        filterMinCF: 0.0001,
        filterBeta: 0.004,
        warmupTolerance: 3,
        missTolerance: 8,
      });
      const { renderer, scene, camera } = mind;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      exp = await make();
      const anchor = mind.addAnchor(0);
      anchor.group.add(exp.root);
      let snapPose = true;
      anchor.onTargetFound = () => {
        snapPose = true;
        exp.show();
        setStatus('¡Ahí está! Muévete alrededor', 'found');
        navigator.vibrate?.(20);
      };
      anchor.onTargetLost = () => {
        exp.hide();
        setStatus('Apunta a la imagen', 'scanning');
      };
      await mind.start();
      setStatus('Apunta a la imagen', 'scanning');
      const clock = new THREE.Clock();
      const pose = { q: new THREE.Quaternion(), pos: new THREE.Vector3() };
      const upCam = new THREE.Vector3();
      const screenAngle = () => screen.orientation?.angle ?? window.orientation ?? 0;
      renderer.setAnimationLoop(() => {
        const dt = Math.min(0.05, clock.getDelta());
        if (gravity.ok && anchor.group.visible) {
          // "arriba" real → espacio de la cámara → espacio de la imagen
          upFromSensor(gravity.beta, gravity.gamma, screenAngle(), upCam);
          upCam.applyQuaternion(camera.quaternion);
          anchor.group.updateMatrixWorld();
          anchor.group.matrixWorld.decompose(_p, _q, _s);
          upCam.applyQuaternion(_qi.copy(_q).invert());
          uprightPose(upCam, { aspect, footprint }, pose);
          const k = snapPose ? 1 : 1 - Math.exp(-dt * 5); // suave, sin temblar
          exp.root.quaternion.slerp(pose.q, k);
          exp.root.position.lerp(pose.pos, k);
          snapPose = false;
        }
        exp.update(dt, camera);
        renderer.render(scene, camera);
      });
      stopCurrent = () => {
        renderer.setAnimationLoop(null);
        mind.stop();
        ui.arView.innerHTML = '';
      };
    } catch (err) {
      console.error(err);
      setStatus('No pudimos abrir la cámara. Revisa el permiso o prueba el modo 3D.', 'error');
    }
  }

  async function start3D() {
    ui.preview.hidden = false;
    document.documentElement.classList.add('ar-open');
    const canvas = ui.previewCanvas;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 50);
    camera.up.set(0, 0, 1);
    const far = 1.25 + aspect * 0.55;
    camera.position.set(0.18, -far * 1.2, far * 0.95);

    const tex = await new THREE.TextureLoader().loadAsync(label);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, aspect), new THREE.MeshBasicMaterial({ map: tex })));
    const table = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: '#1b1b1b' }));
    table.position.z = -0.002;
    scene.add(table);

    exp = await make();
    scene.add(exp.root);
    exp.show();

    const orbit = new OrbitControls(camera, canvas);
    orbit.target.set(0, 0, 0.16);
    orbit.enableDamping = true;
    orbit.autoRotate = true;
    orbit.autoRotateSpeed = 1;
    orbit.minDistance = 0.7;
    orbit.maxDistance = 5;
    orbit.maxPolarAngle = Math.PI * 0.48;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    addEventListener('resize', resize);
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      exp.update(Math.min(0.05, clock.getDelta()));
      orbit.update();
      renderer.render(scene, camera);
    });
    canvas.addEventListener('dblclick', () => {
      exp.hide();
      exp.show();
    });
    stopCurrent = () => {
      removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      orbit.dispose();
    };
  }

  function exit() {
    stopCurrent?.();
    stopCurrent = null;
    exp = null;
    ui.ar.hidden = true;
    ui.preview.hidden = true;
    document.documentElement.classList.remove('ar-open');
  }

  ui.startAR?.addEventListener('click', startAR);
  ui.start3D?.addEventListener('click', start3D);
  ui.fallback?.addEventListener('click', () => {
    exit();
    start3D();
  });
  ui.exits.forEach((b) => b.addEventListener('click', exit));
  ui.share?.addEventListener('click', async () => {
    const data = { title, text: shareText, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        ui.share.textContent = 'Link copiado ✓';
      }
    } catch {}
  });
  addEventListener('keydown', (e) => e.key === 'Escape' && exit());
  if (needsLogo) setTimeout(loadLogo, 1200);
}
