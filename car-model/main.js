import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.001,
  100000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const hlight = new THREE.AmbientLight(0x404040);
scene.add(hlight);
camera.position.x = 15;
camera.position.z = 5;
camera.position.y = 5;
// camera.lookAt(5, 5, 5);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
loader.load(
  "./scene.gltf",
  (gltf) => {
    gltf.scene.scale.set(2, 2, 2);
    scene.add(gltf.scene);

    const carPosition = new THREE.Vector3();
    gltf.scene.getWorldPosition(carPosition);
    console.log("Car Position:", carPosition);
    camera.lookAt(carPosition.x-15,carPosition.y+15,carPosition.z-15);
    gltf.scene.position.set(16, 20, -10);
    // gltf.scene.position.set(carPosition.x+15,carPosition.y+15,carPosition.z-15)
    const yellowLight = new THREE.DirectionalLight(0xffffff, 5);
    yellowLight.position.set(carPosition.x, carPosition.y + 100, carPosition.z);
    scene.add(yellowLight);

    const blueLight = new THREE.DirectionalLight(0xffffff, 1);
    blueLight.position.set(carPosition.x - 100, carPosition.y + 100, carPosition.z);
    scene.add(blueLight);

    const orangeLight = new THREE.DirectionalLight(0xffffff, 2);
    orangeLight.position.set(carPosition.x, carPosition.y + 100, carPosition.z + 100);
    scene.add(orangeLight);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
