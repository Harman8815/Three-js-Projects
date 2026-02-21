import * as THREE from 'three';
import getPlanet from './getPlanet.js';

export default function setupSaturn() {
  const pivot = new THREE.Object3D();

  const saturn = getPlanet({
    name: 'Saturn',
    size: 0.37,
    distance: 7.4,
    img: './textures/saturn.png',
    tilt: -0.01,
    speed: 0.00012
  });

  saturn.position.set(9, 0, 0);
  pivot.add(saturn);

  const ring = createRing();
  saturn.add(ring);

  return { pivot, planet: saturn };
}

function createRing() {
  const positions = [];
  const count = 2500;
  const inner = 0.8;
  const outer = 1.6;
  const thickness = 0.09;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const r = inner + Math.random() * (outer - inner);
    const x = Math.cos(angle) * r + (Math.random() - 0.5) * thickness;
    const y = (Math.random() - 0.5) * 0.02;
    const z = Math.sin(angle) * r + (Math.random() - 0.5) * thickness;
    positions.push(x, y, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xaaaaff,
    size: 0.01,
    transparent: true,
    opacity: 0.7,
    depthWrite: false
  });

  return new THREE.Points(geometry, material);
}
