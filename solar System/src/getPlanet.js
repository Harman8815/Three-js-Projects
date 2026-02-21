import * as THREE from 'three';

function getPlanet({ name, size, distance, img, tilt = 0, speed }) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(img);

  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ map: texture });

  const planet = new THREE.Mesh(geometry, material);
  planet.name = name;

  const tiltQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0));
  const tiltGroup = new THREE.Group();
  tiltGroup.quaternion.copy(tiltQuat);
  tiltGroup.add(planet);

  const orbitSpeed = speed !== undefined ? speed : 0.0025 * (1 / distance); // Default if speed missing

  planet.userData.update = (t) => {
    const angle = t * orbitSpeed;
    const orbitRadius = new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
    orbitRadius.applyQuaternion(tiltQuat);
    planet.position.copy(orbitRadius);
  };

  return tiltGroup;
}

export default getPlanet;
