import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'jsm/postprocessing/UnrealBloomPass.js';
import getSun from './src/getSun.js';
import getPlanet from './src/getPlanet.js';
import getOrbit from './src/getOrbit.js';
import { planetConfigs } from './data/planetConfigs.js';
import { createStars } from './src/star.js';
import setupEarth from './src/setupEarth.js';
import setupSaturn from './src/setupSaturn.js';

const w = window.innerWidth;
const h = window.innerHeight;
const BLOOM_LAYER = 1;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 2.5, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = false;
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// Bloom setup
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 0.2);
bloomPass.threshold = 0;
bloomPass.strength = 1.2;
bloomPass.radius = 0.5;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);

// Sun & starfield
const sun = await getSun();
scene.add(sun);
const orbit = getOrbit();
orbit.layers.set(BLOOM_LAYER); // Only orbits glow
scene.add(orbit);
scene.add(createStars());

// Planets
const mercury = getPlanet(planetConfigs[0]);
const venus = getPlanet(planetConfigs[1]);
const mars = getPlanet(planetConfigs[3]);
const jupiter = getPlanet(planetConfigs[4]);
const uranus = getPlanet(planetConfigs[6]);
const neptune = getPlanet(planetConfigs[7]);
scene.add(mercury, venus, mars, jupiter, uranus, neptune);

// Earth & Moon
const earth = setupEarth();
scene.add(earth.pivot);

// Saturn + ring
const { pivot: saturnPivot, planet: saturn } = setupSaturn();
scene.add(saturnPivot);
saturn.userData.planetPivot = saturnPivot;

// Lights
scene.add(new THREE.HemisphereLight(0xfff0dd, 0x221100, 0.3));
const sunLight = new THREE.PointLight(0xfff5cc, 50, 10000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Bloom render override
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
const materials = {};

function darkenNonBloom(obj) {
  if (obj.isMesh && obj.layers.test(camera.layers) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}

// Animate
function animate(t = 0) {
  requestAnimationFrame(animate);

  sun.userData.update(t * 0.001);
  sunLight.userData?.update?.(t * 0.001);
  mercury.children[0].userData.update(t);
  venus.children[0].userData.update(t);
  mars.children[0].userData.update(t);
  jupiter.children[0].userData.update(t);
  uranus.children[0].userData.update(t);
  neptune.children[0].userData.update(t);
  earth.pivot.rotation.y += 0.001;
  earth.moonPivot.rotation.y += 0.01;
  saturn.userData.planetPivot.rotation.y += 0.0012;

  controls.update();

  // Render bloom pass
  scene.traverse(darkenNonBloom);
  camera.layers.set(BLOOM_LAYER);
  bloomComposer.render();

  // Restore original materials
  scene.traverse(restoreMaterial);

  // Render full scene
  camera.layers.set(0);
  renderer.clearDepth();
  finalComposer.render();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  finalComposer.setSize(window.innerWidth, window.innerHeight);
});

animate();
