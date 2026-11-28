/**
 * Menú vivo · Cocina 186
 * Apuntas a la carta y el plato aparece servido sobre ella, con nombre y precio.
 * Los botones cambian de plato. Modelos: blender/ar_assets.py (grupo "menu"):
 * malla 100 % quads, color horneado y sombreado de cómic en vivo (estilo Spider-Verse):
 * trama de puntos, achurado, tinta gruesa y desfase cian/magenta.
 */
import * as THREE from 'three';
import { runExperience, loadGLB, inkOutline, comicify, ease, clamp01, textCard, softShadow } from '../_shared/ar-shell.js';

const BASE = new URL('./', import.meta.url);
const DISHES = [
  { file: 'tacos.glb', name: 'TACOS AL PASTOR', desc: 'TROMPO · PIÑA · CILANTRO', price: '$95', steam: false },
  { file: 'ramen.glb', name: 'RAMEN DE LA CASA', desc: 'CALDO DE 12 H · HUEVO MARINADO', price: '$180', steam: true },
  { file: 'flan.glb', name: 'FLAN DE CAJETA', desc: 'CAJETA · SAL DE MAR · MENTA', price: '$75', steam: false },
];

async function build() {
  const root = new THREE.Group();
  const world = new THREE.Group();
  world.rotation.x = Math.PI / 2;
  root.add(world);

  // el plato se sirve sobre la carta, un poco por encima del centro (zona de los platos)
  const stage = new THREE.Group();
  stage.position.set(0, 0.0, 0.03); // sobre la zona de los platos (centro de la carta, un poco abajo)
  stage.scale.setScalar(1.35);
  world.add(stage);

  const models = await Promise.all(DISHES.map((d) => loadGLB(new URL(`models/${d.file}`, BASE).href)));
  const holders = models.map((m) => {
    comicify(m); // tonos planos + trama de puntos + achurado, en vivo
    inkOutline(m, { thickness: 0.0022, misreg: true }); // tinta gruesa y fuera de registro
    const h = new THREE.Group();
    h.add(m);
    h.visible = false;
    stage.add(h);
    return h;
  });

  const shadow = softShadow(0.62, 0.62, 0.5);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  stage.add(shadow);

  // tarjeta con nombre y precio
  const cards = DISHES.map((d) => {
    const c = textCard({
      lines: [
        { text: d.name, size: 54 },
        { text: d.desc, size: 22, mono: true, weight: 700, gap: 18 },
        { text: d.price, size: 64, gap: 22 },
      ],
      w: 640,
      h: 250,
      bg: '#ff4a1c',
      fg: '#0b0b0b',
    });
    c.scale.setScalar(0.3);
    c.position.set(0, 0.3, -0.24); // detrás del plato, mirando a la cámara
    c.visible = false;
    stage.add(c);
    return c;
  });

  // vapor (solo para el ramen)
  const steamN = 60;
  const seed = Float32Array.from({ length: steamN }, () => Math.random());
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(steamN * 3), 3));
  const steam = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.01, transparent: true, opacity: 0.8, depthWrite: false }));
  stage.add(steam);

  let current = 0;
  let prev = -1;
  let switchT = 0;
  let shown = false;
  let t0 = 0;
  let clock = 0;

  function select(i) {
    prev = current;
    current = (i + DISHES.length) % DISHES.length;
    switchT = clock;
  }

  return {
    root,
    show() {
      shown = true;
      t0 = clock;
      prev = -1;
      switchT = clock;
    },
    hide() {
      shown = false;
      holders.forEach((h) => (h.visible = false));
      cards.forEach((c) => (c.visible = false));
    },
    control(id) {
      if (id === 'next') select(current + 1);
      if (id === 'prev') select(current - 1);
    },
    update(dt, camera) {
      clock += dt;
      const k = shown ? clamp01((clock - switchT) / 0.7) : 0;
      holders.forEach((h, i) => {
        if (i === current && shown) {
          h.visible = true;
          const s = Math.max(0.0001, ease.outBack(k));
          h.scale.setScalar(s);
          h.rotation.y = (1 - ease.outExpo(k)) * Math.PI * 1.5 + clock * 0.25;
        } else if (i === prev && shown && k < 1) {
          h.visible = true;
          h.scale.setScalar(Math.max(0.0001, 1 - ease.outExpo(k * 1.6)));
          h.rotation.y += dt * 6;
        } else {
          h.visible = false;
        }
      });
      cards.forEach((c, i) => {
        c.visible = shown && i === current;
        if (c.visible) {
          const ck = clamp01((clock - switchT - 0.25) / 0.5);
          c.scale.setScalar(Math.max(0.0001, 0.3 * ease.outBack(ck)));
          c.position.y = 0.3 + Math.sin(clock * 2) * 0.006;
        }
      });
      shadow.scale.setScalar(shown ? ease.outExpo(clamp01((clock - t0) / 0.5)) : 0.0001);
      steam.visible = shown && DISHES[current].steam && k > 0.6;
      const p = sGeo.attributes.position.array;
      for (let j = 0; j < steamN; j++) {
        const life = (clock * 0.3 + seed[j]) % 1;
        const a = seed[j] * 30 + life * 2.5;
        p[j * 3] = Math.cos(a) * (0.02 + life * 0.06);
        p[j * 3 + 1] = 0.12 + life * 0.22;
        p[j * 3 + 2] = Math.sin(a) * (0.02 + life * 0.06);
      }
      sGeo.attributes.position.needsUpdate = true;
    },
  };
}

runExperience({
  target: new URL('targets.mind', BASE).href,
  label: new URL('target.png', BASE).href,
  aspect: 1.4,
  title: 'Menú vivo · Cocina 186',
  shareText: 'Apunta tu celular a la carta y el plato se sirve solo.',
  controls: [
    { id: 'prev', label: 'Anterior', icon: 'prev' },
    { id: 'next', label: 'Siguiente plato', icon: 'next', iconAfter: true },
  ],
  build,
});
