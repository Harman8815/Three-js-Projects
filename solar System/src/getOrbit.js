import * as THREE from 'three';

// Optionally import the config if it's stored externally
import { planetConfigs } from '../data/planetConfigs.js';

function createOrbit(radius, color, rotation = [0, 0, 0]) {
  const segments = 180;
  const curve = new THREE.EllipseCurve(
    0, 0,
    radius, radius,
    0,
    2 * Math.PI,
    false,
    0
  );

  const points = curve.getPoints(segments);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(p => new THREE.Vector3(p.x, 0, p.y))
  );

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.4,
  });

  const line = new THREE.LineLoop(geometry, material);
  line.rotation.set(...rotation);
  return line;
}

function getOrbits() {
  const group = new THREE.Group();

  planetConfigs.forEach((planet, i) => {
    const radius = planet.distance;
    const hue = 0.05 + i * 0.08;
    const color = new THREE.Color().setHSL(hue, 1, 0.6);
    const tilt = i % 2 === 0 ? 0.05 : -0.05;

    const orbit = createOrbit(radius, color, [tilt, 0, 0]);
    group.add(orbit);
  });

  return group;
}

export default getOrbits;
