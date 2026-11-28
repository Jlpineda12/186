/**
 * Etiqueta viva · Café 186°
 * Al reconocer la etiqueta, brota encima el volcán donde crece el café.
 * Modelos: blender/ar_assets.py (grupo "cafe") → models/volcan.glb
 *   malla 100 % quads, color horneado y sombreado de cómic en vivo (estilo Spider-Verse).
 */
import * as THREE from 'three';
import { runExperience, loadGLB, comicify, inkOutline, ease, clamp01, textCard, softShadow } from '../_shared/ar-shell.js';

const BASE = new URL('./', import.meta.url);

async function buildDiorama(_THREE, { logo }) {
  const root = new THREE.Group(); // plano de la etiqueta (XY), +Z hacia afuera
  const world = new THREE.Group(); // Y hacia arriba
  world.rotation.x = Math.PI / 2;
  root.add(world);

  const model = await loadGLB(new URL('models/volcan.glb', BASE).href);
  const volcan = model.getObjectByName('volcan');
  const cafetal = model.getObjectByName('cafetal');
  const nubes = model.getObjectByName('nubes');
  comicify(model);
  inkOutline(model, { thickness: 0.0018, misreg: true });
  world.add(model);
  const top = 0.32; // altura aproximada del cráter

  const parts = [
    { obj: volcan, delay: 0.05, kind: 'grow' },
    { obj: cafetal, delay: 0.7, kind: 'pop' },
    { obj: nubes, delay: 0.85, kind: 'pop' },
  ];

  // aroma que sube del cráter
  const steamN = 80;
  const steamSeed = Float32Array.from({ length: steamN }, () => Math.random());
  const steamGeo = new THREE.BufferGeometry();
  steamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(steamN * 3), 3));
  const steam = new THREE.Points(steamGeo, new THREE.PointsMaterial({ color: '#efede6', size: 0.012, transparent: true, opacity: 0.85, depthWrite: false }));
  world.add(steam);
  parts.push({ obj: steam, delay: 1.0, kind: 'pop' });

  // banderín "1.860 msnm"
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.22, 6), new THREE.MeshBasicMaterial({ color: '#0b0b0b' }));
  pole.position.y = 0.11;
  const banner = textCard({ lines: [{ text: '1.860', size: 86 }, { text: 'MSNM · CAFÉ 186°', size: 30, mono: true, weight: 700 }], w: 512, h: 170 });
  banner.scale.setScalar(0.2);
  banner.position.set(0.1, 0.19, 0);
  flag.add(pole, banner);
  flag.position.set(0.13, top - 0.1, 0.05);
  world.add(flag);
  parts.push({ obj: flag, delay: 1.15, kind: 'pop' });

  // el 186 (malla en quads) flotando sobre el cráter
  let spinner = null;
  if (logo) {
    spinner = new THREE.Group();
    logo.traverse((o) => {
      if (o.isMesh) {
        const m = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ color: '#d4ff3a' }));
        m.applyMatrix4(o.matrixWorld);
        spinner.add(m);
      }
    });
    comicify(spinner);
    inkOutline(spinner, { thickness: 0.014, misreg: true });
    const box = new THREE.Box3().setFromObject(spinner);
    const c = box.getCenter(new THREE.Vector3());
    spinner.children.forEach((ch) => ch.position.sub(c));
    const holder = new THREE.Group();
    holder.add(spinner);
    holder.scale.setScalar(0.4 / box.getSize(new THREE.Vector3()).x);
    holder.position.y = top + 0.2;
    world.add(holder);
    parts.push({ obj: holder, delay: 1.25, kind: 'drop', y: top + 0.2 });
  }

  const shadow = softShadow(0.95, 0.75);
  shadow.position.z = 0.002;
  root.add(shadow);

  let shown = false;
  let t0 = 0;
  let clock = 0;
  const reset = () => {
    parts.forEach((p) => {
      if (p.kind === 'grow') p.obj.scale.y = 0.0001;
      else if (p.kind === 'drop') p.obj.position.y = p.y + 0.5;
      else p.obj.scale.setScalar(0.0001);
      p.obj.visible = false;
    });
    shadow.scale.setScalar(0.0001);
  };
  reset();

  return {
    root,
    show() {
      shown = true;
      t0 = clock;
    },
    hide() {
      shown = false;
      reset();
    },
    update(dt) {
      clock += dt;
      if (shown) {
        const t = clock - t0;
        shadow.scale.setScalar(Math.max(0.0001, ease.outExpo(clamp01(t / 0.6))));
        parts.forEach((p) => {
          const k = clamp01((t - p.delay) / 0.6);
          p.obj.visible = k > 0;
          if (p.kind === 'grow') p.obj.scale.y = Math.max(0.0001, ease.outBack(k));
          else if (p.kind === 'drop') p.obj.position.y = p.y + (1 - ease.outExpo(k)) * 0.5;
          else p.obj.scale.setScalar(Math.max(0.0001, ease.outBack(k)));
        });
      }
      nubes.rotation.y += dt * 0.22;
      if (spinner) spinner.rotation.y += dt * 0.9;
      const pos = steamGeo.attributes.position.array;
      for (let k = 0; k < steamN; k++) {
        const life = (clock * 0.25 + steamSeed[k]) % 1;
        const ang = steamSeed[k] * 40 + life * 3;
        const rad = 0.012 + life * 0.05;
        pos[k * 3] = Math.cos(ang) * rad;
        pos[k * 3 + 1] = top + life * 0.3;
        pos[k * 3 + 2] = Math.sin(ang) * rad;
      }
      steamGeo.attributes.position.needsUpdate = true;
    },
  };
}

runExperience({
  target: new URL('targets.mind', BASE).href,
  label: new URL('etiqueta.png', BASE).href,
  aspect: 1,
  needsLogo: true,
  title: 'Etiqueta viva · Café 186°',
  shareText: 'Apunta tu celular a la etiqueta y mira lo que pasa.',
  build: buildDiorama,
});
