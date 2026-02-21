import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createStars } from './stars.js';

let scene, camera, renderer, controls;
let planets = [];
let paused = false;
let texturesEnabled = true;
let darkMode = true;

let raycaster, mouse;
let tooltip;

const textureLoader = new THREE.TextureLoader();

// ---- PLANET DATA ----
const planetData = [
  { name: "Mercury", color: 0xaaaaaa, size: 0.5, distance: 8, orbitSpeed: 0.02, rotationSpeed: 0.01, texture: './textures/mercury.jpg' },
  { name: "Venus", color: 0xffcc66, size: 1, distance: 12, orbitSpeed: 0.015, rotationSpeed: 0.008, texture: './textures/venus.jpg' },
  { name: "Earth", color: 0x3399ff, size: 1.2, distance: 16, orbitSpeed: 0.01, rotationSpeed: 0.02, texture: './textures/earth.jpg' },
  { name: "Mars", color: 0xff3300, size: 1, distance: 20, orbitSpeed: 0.008, rotationSpeed: 0.018, texture: './textures/mars.jpg' },
  { name: "Jupiter", color: 0xff9966, size: 3, distance: 28, orbitSpeed: 0.006, rotationSpeed: 0.04, texture: './textures/jupiter.jpg' },
  { name: "Saturn", color: 0xffcc99, size: 2.5, distance: 36, orbitSpeed: 0.004, rotationSpeed: 0.038, texture: './textures/saturn.jpg' },
  { name: "Uranus", color: 0x66ccff, size: 2, distance: 44, orbitSpeed: 0.003, rotationSpeed: 0.03, texture: './textures/uranus.jpg' },
  { name: "Neptune", color: 0x3333ff, size: 2, distance: 52, orbitSpeed: 0.002, rotationSpeed: 0.028, texture: './textures/neptune.jpg' }
];

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(80, 60, 100);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createLights();
  createOrbitControls();
  createStars(scene, 3000);
  createSun();
  createPlanets();
  createUI();
  createTooltip();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
}

function createLights() {
  const pointLight = new THREE.PointLight(0xffffff, 3, 3000);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);
  scene.add(new THREE.AmbientLight(0x404040, 1.2));
}

function createOrbitControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;
  controls.enableZoom = true;
}

function createSun() {
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('./textures/sun.jpg') });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);
}

function createPlanets() {
  planets = [];
  planetData.forEach(p => {
    const geometry = new THREE.SphereGeometry(p.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: p.color, shininess: 30 });
    material.map = textureLoader.load(p.texture);

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const orbitGeometry = new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    planets.push({ mesh, angle: 0, orbitSpeed: p.orbitSpeed, rotationSpeed: p.rotationSpeed, distance: p.distance, material, color: p.color });
  });
}

function createUI() {
  const controlsDiv = document.getElementById("controls");
  controlsDiv.style.position = "absolute";
  controlsDiv.style.top = "20px";
  controlsDiv.style.right = "20px";
  controlsDiv.style.background = "rgba(0,0,0,0.5)";
  controlsDiv.style.padding = "10px";
  controlsDiv.style.color = "white";
  controlsDiv.innerHTML = "<h3>Controls</h3>";

  // Pause/Resume Button
  const pauseBtn = document.createElement("button");
  pauseBtn.textContent = "Pause";
  pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  };
  controlsDiv.appendChild(pauseBtn);
  controlsDiv.appendChild(document.createElement("br"));

  // Dark/Light Toggle
  const darkBtn = document.createElement("button");
  darkBtn.textContent = "Toggle Dark/Light";
  darkBtn.onclick = toggleDarkLight;
  controlsDiv.appendChild(darkBtn);
  controlsDiv.appendChild(document.createElement("hr"));

  // Texture Toggle
  const textureBtn = document.createElement("button");
  textureBtn.textContent = "Toggle Textures";
  textureBtn.onclick = () => {
    texturesEnabled = !texturesEnabled;
    planets.forEach(p => {
      p.mesh.material.map = texturesEnabled ? p.mesh.material.map : null;
      p.mesh.material.needsUpdate = true;
    });
  };
  controlsDiv.appendChild(textureBtn);
  controlsDiv.appendChild(document.createElement("hr"));

  // Show/Hide Checkboxes
  planetData.forEach((p, i) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.onchange = () => {
      planets[i].mesh.visible = checkbox.checked;
    };
    controlsDiv.appendChild(checkbox);

    const label = document.createElement("label");
    label.textContent = p.name;
    controlsDiv.appendChild(label);
    controlsDiv.appendChild(document.createElement("br"));
  });
}

function createTooltip() {
  tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.padding = "5px";
  tooltip.style.background = "rgba(0,0,0,0.7)";
  tooltip.style.color = "white";
  tooltip.style.borderRadius = "4px";
  tooltip.style.fontSize = "12px";
  tooltip.style.pointerEvents = "none";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);
}

function toggleDarkLight() {
  darkMode = !darkMode;
  scene.background = new THREE.Color(darkMode ? 0x000000 : 0xffffff);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planet = planetData.find(p => p.name === intersects[0].object.name) || intersects[0].object;
    tooltip.style.display = "block";
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
    tooltip.textContent = intersects[0].object.uuid.substring(0, 6); // or planet name if stored
  } else {
    tooltip.style.display = "none";
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (!paused) {
    planets.forEach(p => {
      p.angle += p.orbitSpeed;
      p.mesh.rotation.y += p.rotationSpeed;
      p.mesh.position.x = Math.cos(p.angle) * p.distance;
      p.mesh.position.z = Math.sin(p.angle) * p.distance;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

initScene();
animate();
