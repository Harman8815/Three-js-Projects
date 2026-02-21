import * as THREE from 'three';
import getPlanet from './getPlanet.js';

export default function setupEarth() {
  const earth = getPlanet({
    name: 'Earth',
    size: 0.2,
    distance: 3.4,
    img: './textures/earth.png',
    tilt: 0.04,
    speed: 0.0004
  });

  const pivot = new THREE.Object3D();
  earth.position.set(3.4, 0, 0);
  pivot.add(earth);

  const moon = getPlanet({
    name: 'Moon',
    size: 0.08,
    img: './textures/moon.png'
  });

  const moonPivot = new THREE.Object3D();
  moon.position.set(0.5, 0, 0);
  moonPivot.add(moon);
  earth.add(moonPivot);

  const orbit = new THREE.Line(
    createOrbitGeometry(0.5, 128),
    new THREE.LineDashedMaterial({
      color: 0xffffff,
      dashSize: 0.05,
      gapSize: 0.03,
      linewidth: 1,
      transparent: true,
      opacity: 0.4
    })
  );
  orbit.computeLineDistances();
  earth.add(orbit);

  return { pivot, moonPivot };
}

function createOrbitGeometry(radius, segments) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}
