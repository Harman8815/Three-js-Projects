import * as THREE from 'three';
import { getFresnelMat } from "./getFresnelMat.js";
import { ImprovedNoise } from 'jsm/math/ImprovedNoise.js';
// sun

function getCorona({
  radius = 0.9,
  detail = 18,
  baseColor = 0xffae42	,
  noiseScale = 0.34,
  distortion = 7.0,
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


function getSun() {
    
    const sunMat = new THREE.MeshStandardMaterial({
        emissive: 0xff0000,
    });
    const geo = new THREE.IcosahedronGeometry(1, 6);
    const sun = new THREE.Mesh(geo, sunMat);

    const sunRimMat = getFresnelMat({ rimHex: 0xff4500	, facingHex: 0x000000 });
    const rimMesh = new THREE.Mesh(geo, sunRimMat);
    rimMesh.scale.setScalar(1.01);
    sun.add(rimMesh);

    const coronaMesh = getCorona();
    sun.add(coronaMesh);

    const sunLight = new THREE.PointLight(0xffa500, 10);
    sun.add(sunLight);
    sun.userData.update = (t) => {
        sun.rotation.y = t/5;
        coronaMesh.userData.update(t);
    };
    return sun;
}
export default getSun;