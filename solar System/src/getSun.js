import * as THREE from 'three';
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';
import { ImprovedNoise } from 'jsm/math/ImprovedNoise.js';
import { getFresnelMat } from './getFresnelMat.js';

function getCorona({
  radius = 10,
  detail = 18,
  baseColor = 0xffae42,
  noiseScale = 1,
  distortion = 20.0,
  opacity = 0.75,
} = {}) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  pos.usage = THREE.DynamicDrawUsage;

  const material = new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geo, material);
  const noise = new ImprovedNoise();
  const len = pos.count;
  const p = new THREE.Vector3();
  const v3 = new THREE.Vector3();

  mesh.userData.update = (t) => {
    for (let i = 0; i < len; i++) {
      p.fromBufferAttribute(pos, i).normalize();
      v3.copy(p).multiplyScalar(distortion);
      const ns = noise.noise(v3.x + Math.cos(t), v3.y + Math.sin(t * 0.8), v3.z + t);
      v3.copy(p)
        .setLength(radius)
        .addScaledVector(p, ns * noiseScale);
      pos.setXYZ(i, v3.x, v3.y, v3.z);
    }
    pos.needsUpdate = true;
  };

  return mesh;
}

export default async function getSun() {
  const loader = new GLTFLoader();

  const gltf = await loader.loadAsync('./models/sun.glb');
  const sun = gltf.scene;
  sun.scale.set(0.1, 0.1, 0.1);

  const corona = getCorona();
  sun.add(corona);

  const rimMat = getFresnelMat({ rimHex: 0xff4500, facingHex: 0x000000 });
  const rimGeo = new THREE.SphereGeometry(1.01, 32, 32);
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  sun.add(rimMesh);

  const light = new THREE.PointLight(0xffa500, 10, 1000);
  sun.add(light);

  sun.userData.update = (t) => {
    sun.rotation.y = t / 5;
    corona.userData.update(t);
  };

  return sun;
}
