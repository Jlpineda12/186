/**
 * Torre 186 en la mesa
 * Apuntas al folleto y la maqueta se levanta piso por piso. Los pisos con
 * departamentos disponibles se marcan; "Ver depa tipo" abre la torre y muestra
 * el interior. Modelos: blender/ar_assets.py (grupo "torre"), 100 % quads,
 * color horneado y sombreado de cómic en vivo (estilo Spider-Verse).
 */
import * as THREE from 'three';
import { runExperience, loadGLB, comicify, inkOutline, ease, clamp01, textCard, softShadow } from '../_shared/ar-shell.js';

const BASE = new URL('./', import.meta.url);
const FLOORS = 12;
const FH = 0.05;
const OPEN_AT = 6; // piso que se abre para mostrar el depa tipo
const AVAILABLE = new Set([2, 4, 5, 7, 9, 10]);

async function build() {
  const root = new THREE.Group();
  const world = new THREE.Group();
  world.rotation.x = Math.PI / 2;
  root.add(world);

  const [entorno, piso, remate, interior] = await Promise.all(
    ['entorno', 'piso', 'remate', 'interior'].map((n) => loadGLB(new URL(`models/${n}.glb`, BASE).href)),
  );
  [entorno, piso, remate, interior].forEach((m) => {
    comicify(m);
    inkOutline(m, { thickness: 0.0016, misreg: true });
  });
  const site = new THREE.Group();
  site.scale.setScalar(0.92);
  site.position.y = 0.012; // la plataforma queda sobre el folleto, no en el mismo plano
  world.add(site);
  site.add(entorno);

  // 12 pisos (mismo modelo clonado; cada uno con su material para poder marcarlo)
  const floors = [];
  for (let i = 0; i < FLOORS; i++) {
    const f = piso.clone(true);
    f.traverse((o) => {
      if (o.isMesh && o.material.uniforms?.uTint) o.material = o.material.clone();
    });
    f.position.y = i * FH;
    f.userData.baseY = i * FH;
    site.add(f);
    floors.push(f);
  }
  remate.position.y = FLOORS * FH;
  site.add(remate);
  interior.position.y = OPEN_AT * FH + 0.004;
  interior.visible = false;
  site.add(interior);

  const shadow = softShadow(1.0, 0.8, 0.5);
  shadow.position.z = 0.002;
  root.add(shadow);

  const info = textCard({
    lines: [
      { text: 'TORRE 186', size: 64 },
      { text: '12 NIVELES · ENTREGA 2028', size: 24, mono: true, weight: 700, gap: 18 },
    ],
    w: 560,
    h: 170,
    bg: '#2f3bff',
    fg: '#efede6',
  });
  info.scale.setScalar(0.32);
  info.position.set(-0.28, FLOORS * FH + 0.2, 0);
  site.add(info);

  const legend = textCard({
    lines: [{ text: '■ DISPONIBLE   ■ VENDIDO', size: 26, mono: true, weight: 700, gap: 22 }],
    w: 560,
    h: 70,
    bg: '#efede6',
    fg: '#0b0b0b',
  });
  legend.scale.setScalar(0.3);
  legend.position.set(0.3, FLOORS * FH + 0.1, 0);
  legend.visible = false;
  site.add(legend);

  const tint = { avail: new THREE.Color('#b9c0ff'), sold: new THREE.Color('#9a9a9a'), none: new THREE.Color('#ffffff') };
  let showAvail = false;
  let open = false;
  let openK = 0;
  let shown = false;
  let t0 = 0;
  let clock = 0;

  function paintFloors() {
    floors.forEach((f, i) => {
      const c = !showAvail ? tint.none : AVAILABLE.has(i) ? tint.avail : tint.sold;
      f.traverse((o) => o.isMesh && o.material.uniforms?.uTint && o.material.uniforms.uTint.value.copy(c));
    });
    legend.visible = showAvail;
  }

  return {
    root,
    show() {
      shown = true;
      t0 = clock;
    },
    hide() {
      shown = false;
    },
    control(id, btn) {
      if (id === 'open') {
        open = !open;
        btn?.classList.toggle('is-on', open);
        if (btn) btn.textContent = open ? 'Cerrar torre' : 'Ver depa tipo';
      }
      if (id === 'avail') {
        showAvail = !showAvail;
        btn?.classList.toggle('is-on', showAvail);
        paintFloors();
      }
    },
    update(dt) {
      clock += dt;
      const t = shown ? clock - t0 : 0;
      site.visible = shown;
      shadow.visible = shown;
      // aparece: plataforma → pisos uno a uno → remate → tarjeta
      entorno.scale.setScalar(Math.max(0.0001, ease.outBack(clamp01(t / 0.6))));
      shadow.scale.setScalar(Math.max(0.0001, ease.outExpo(clamp01(t / 0.6))));
      openK += ((open ? 1 : 0) - openK) * Math.min(1, dt * 6);
      floors.forEach((f, i) => {
        const k = clamp01((t - 0.45 - i * 0.09) / 0.45);
        f.visible = k > 0;
        const lift = i >= OPEN_AT ? ease.inOut(openK) * (0.32 + (i - OPEN_AT) * 0.02) : 0;
        f.position.y = f.userData.baseY + (1 - ease.outExpo(k)) * 0.35 + lift;
        f.scale.setScalar(0.85 + 0.15 * ease.outBack(k));
      });
      const rk = clamp01((t - 0.45 - FLOORS * 0.09) / 0.5);
      remate.visible = rk > 0;
      remate.position.y = FLOORS * FH + (1 - ease.outExpo(rk)) * 0.3 + ease.inOut(openK) * (0.32 + (FLOORS - OPEN_AT) * 0.02);
      interior.visible = openK > 0.02;
      interior.scale.setScalar(Math.max(0.0001, ease.outBack(openK)));
      const ik = clamp01((t - 1.9) / 0.5);
      info.visible = ik > 0;
      info.scale.setScalar(Math.max(0.0001, 0.32 * ease.outBack(ik)));
      info.position.y = FLOORS * FH + 0.2 + ease.inOut(openK) * 0.32 + Math.sin(clock * 1.6) * 0.006;
      legend.position.y = info.position.y - 0.1;
    },
  };
}

runExperience({
  target: new URL('targets.mind', BASE).href,
  label: new URL('target.png', BASE).href,
  aspect: 1,
  title: 'Torre 186 en la mesa',
  shareText: 'Apunta tu celular al folleto y la torre se levanta sobre la mesa.',
  controls: [
    { id: 'open', label: 'Ver depa tipo' },
    { id: 'avail', label: 'Disponibles' },
  ],
  footprint: 0.55, // la maqueta es más ancha: se adelanta más si el folleto está vertical
  build,
});
