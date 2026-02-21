import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Set up the canvas
const canvas = document.querySelector("canvas.webgl");

// Create the camera, scene, and renderer
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// OrbitControls focusing on the selected shape
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.position.z = 3;

// Default settings for the GUI
let gui;
const settings = {
  shape: 'Box',
  wireframe: false,
  color: '#ff0000',
  length: 1,
  breadth: 1,
  height: 1,
  radius: 1,
  widthSegments: 16,
  heightSegments: 16,
  tubularSegments: 100,
  radialSegments: 8,
  p: 3, // For TorusKnot
  q: 4  // For TorusKnot
};

// Create initial Box mesh
let mesh = createBox();
scene.add(mesh);

// Shape-specific creation functions
function createBox() {
  const geometry = new THREE.BoxGeometry(settings.length, settings.breadth, settings.height);
  const material = new THREE.MeshBasicMaterial({ color: settings.color, wireframe: settings.wireframe });
  return new THREE.Mesh(geometry, material);
}

function createSphere() {
  const geometry = new THREE.SphereGeometry(settings.radius, settings.widthSegments, settings.heightSegments);
  const material = new THREE.MeshBasicMaterial({ color: settings.color, wireframe: settings.wireframe });
  return new THREE.Mesh(geometry, material);
}

function createCone() {
  const geometry = new THREE.ConeGeometry(settings.radius, settings.height, settings.radialSegments);
  const material = new THREE.MeshBasicMaterial({ color: settings.color, wireframe: settings.wireframe });
  return new THREE.Mesh(geometry, material);
}

function createOctahedron() {
  const geometry = new THREE.OctahedronGeometry(settings.radius);
  const material = new THREE.MeshBasicMaterial({ color: settings.color, wireframe: settings.wireframe });
  return new THREE.Mesh(geometry, material);
}

function createCylinder() {
  const geometry = new THREE.CylinderGeometry(settings.radius, settings.radius, settings.height, settings.radialSegments);
  const material = new THREE.MeshBasicMaterial({ color: settings.color, wireframe: settings.wireframe });
  return new THREE.Mesh(geometry, material);
}

function createTorus() {
  const geometry = new THREE.TorusGeometry(settings.radius, 0.3, settings.radialSegments, settings.tubularSegments);
  const material = new THREE.MeshBasicMaterial({ color: settings.color, wireframe: settings.wireframe });
  return new THREE.Mesh(geometry, material);
}

function createTorusKnot() {
  const geometry = new THREE.TorusKnotGeometry(settings.radius, 0.3, settings.tubularSegments, settings.radialSegments, settings.p, settings.q);
  const material = new THREE.MeshBasicMaterial({ color: settings.color, wireframe: settings.wireframe });
  return new THREE.Mesh(geometry, material);
}

// Update the mesh when the shape or settings change
function updateMesh() {
  // Remove the old mesh from the scene
  scene.remove(mesh);

  // Create a new mesh based on the selected shape
  switch (settings.shape) {
    case 'Box':
      mesh = createBox();
      break;
    case 'Sphere':
      mesh = createSphere();
      break;
    case 'Cone':
      mesh = createCone();
      break;
    case 'Octahedron':
      mesh = createOctahedron();
      break;
    case 'Cylinder':
      mesh = createCylinder();
      break;
    case 'Torus':
      mesh = createTorus();
      break;
    case 'TorusKnot':
      mesh = createTorusKnot();
      break;
  }

  // Add the new mesh to the scene
  scene.add(mesh);

  // Reset and recreate the GUI
  if (gui) gui.destroy();  // Destroy the old GUI
  createGUI();  // Create the new GUI with shape-specific options
}

// Create a new GUI with options for the selected shape
function createGUI() {
  gui = new GUI();

  // Add shape selection dropdown
  gui.add(settings, 'shape', ['Box', 'Sphere', 'Cone', 'Octahedron', 'Cylinder', 'Torus', 'TorusKnot']).name('Shape').onChange(updateMesh);

  // Add general controls (applies to all shapes)
  gui.add(settings, 'wireframe').name('Wireframe').onChange(updateMesh);
  gui.addColor(settings, 'color').name('Color').onChange(updateMesh);

  // Add shape-specific controls
  switch (settings.shape) {
    case 'Box':
      gui.add(settings, 'length', 0.1, 10, 0.1).name('Length').onChange(updateMesh);
      gui.add(settings, 'breadth', 0.1, 10, 0.1).name('Breadth').onChange(updateMesh);
      gui.add(settings, 'height', 0.1, 10, 0.1).name('Height').onChange(updateMesh);
      break;
    case 'Sphere':
      gui.add(settings, 'radius', 0.1, 10, 0.1).name('Radius').onChange(updateMesh);
      gui.add(settings, 'widthSegments', 3, 64, 1).name('Width Segments').onChange(updateMesh);
      gui.add(settings, 'heightSegments', 3, 64, 1).name('Height Segments').onChange(updateMesh);
      break;
    case 'Cone':
      gui.add(settings, 'radius', 0.1, 10, 0.1).name('Radius').onChange(updateMesh);
      gui.add(settings, 'height', 0.1, 10, 0.1).name('Height').onChange(updateMesh);
      gui.add(settings, 'radialSegments', 3, 64, 1).name('Radial Segments').onChange(updateMesh);
      break;
    case 'Octahedron':
      gui.add(settings, 'radius', 0.1, 10, 0.1).name('Radius').onChange(updateMesh);
      break;
    case 'Cylinder':
      gui.add(settings, 'radius', 0.1, 10, 0.1).name('Radius').onChange(updateMesh);
      gui.add(settings, 'height', 0.1, 10, 0.1).name('Height').onChange(updateMesh);
      gui.add(settings, 'radialSegments', 3, 64, 1).name('Radial Segments').onChange(updateMesh);
      break;
    case 'Torus':
      gui.add(settings, 'radius', 0.1, 10, 0.1).name('Radius').onChange(updateMesh);
      gui.add(settings, 'tubularSegments', 3, 200, 1).name('Tubular Segments').onChange(updateMesh);
      gui.add(settings, 'radialSegments', 3, 64, 1).name('Radial Segments').onChange(updateMesh);
      break;
    case 'TorusKnot':
      gui.add(settings, 'radius', 0.1, 10, 0.1).name('Radius').onChange(updateMesh);
      gui.add(settings, 'tubularSegments', 3, 200, 1).name('Tubular Segments').onChange(updateMesh);
      gui.add(settings, 'radialSegments', 3, 64, 1).name('Radial Segments').onChange(updateMesh);
      gui.add(settings, 'p', 1, 10, 1).name('P').onChange(updateMesh);
      gui.add(settings, 'q', 1, 10, 1).name('Q').onChange(updateMesh);
      break;
  }
}

// Initialize the GUI for the first time
createGUI();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();  // Update controls every frame
  renderer.render(scene, camera);
}

animate();
