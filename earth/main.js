import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Import OrbitControls
import { GUI } from 'lil-gui'; // Import lil-gui

// Import functions for starfield and Fresnel glow
import getStarfield from "./public/getStarfield.js";
import { getFresnelMat } from "./public/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();

// Setup camera with perspective projection
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;

// Initialize the WebGL renderer and add it to the DOM
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Configure color space and tone mapping for the renderer
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Create a group to hold Earth and its components
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180; // Tilt the Earth
scene.add(earthGroup);

// Enable OrbitControls for camera movement and add damping
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Enable smooth damping
controls.dampingFactor = 0.25; // Set damping factor

// Define Earth geometry and textures
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);

// Earth base material (with texture mapping)
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
material.map.colorSpace = THREE.SRGBColorSpace; // Set texture to sRGB color space

// Create Earth mesh and add it to the Earth group
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

// Create lights mesh with an emissive texture (to represent city lights)
const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending, // Use additive blending for glow effect
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

// Add cloud layer on top of the Earth mesh
const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.002);  // Scale slightly larger to overlay clouds
earthGroup.add(cloudsMesh);

// Add glow/fresnel effect around the Earth
const fresnelMat = getFresnelMat(); // Get Fresnel material for glow effect
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);  // Scale slightly larger for outer glow
earthGroup.add(glowMesh);

// Create starfield and add it to the scene
let stars = getStarfield({ numStars: 10000 });
scene.add(stars);

// Add directional light (simulating the sun)
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// Create lil-gui panel
const gui = new GUI();
const params = {
  starsCount: 10000,
  rotationSpeed: 0.002,
  tiltAngle: -23.4,
  glowScale: 1.01,
};

// Update stars count dynamically
function updateStars(numStars) {
  scene.remove(stars);
  stars = getStarfield({ numStars });
  scene.add(stars);
}

// Add GUI controls
gui.add(params, 'starsCount', 1000, 20000).step(100).name('Stars Count').onChange(updateStars);
gui.add(params, 'rotationSpeed', 0.001, 0.01).name('Planet Rotation Speed');
gui.add(params, 'tiltAngle', -90, 90).name('Planet Tilt').onChange(function(value) {
  earthGroup.rotation.z = -value * Math.PI / 180; // Update tilt dynamically
});
gui.add(params, 'glowScale', 1.01, 1.05).step(0.01).name('Glow Scale').onChange(function(value) {
  glowMesh.scale.setScalar(value);
});

// Animation loop to update and render the scene
function animate() {
  requestAnimationFrame(animate);

  // Rotate Earth, lights, clouds, and glow mesh based on control parameters
  earthMesh.rotation.y += params.rotationSpeed;
  lightsMesh.rotation.y += params.rotationSpeed;
  cloudsMesh.rotation.y += params.rotationSpeed * 1.15;  // Clouds rotate slightly faster
  glowMesh.rotation.y += params.rotationSpeed;
  stars.rotation.y -= 0.0002;

  // Update controls for damping and smooth movement
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

// Handle window resizing
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);

// Start the animation loop
animate();
