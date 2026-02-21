import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap/gsap-core";
import { texture } from "three/webgpu";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const textures = {
  road: {
    color: textureLoader.load("/textures/road.jpeg"),
  },
  door: {
    alpha: textureLoader.load("/textures/door/alpha.jpg"),
    color: textureLoader.load("/textures/door/color.jpg"),
    ambientOcclusion: textureLoader.load("/textures/door/ambientOcclusion.jpg"),
    roughness: textureLoader.load("/textures/door/roughness.jpg"),
    height: textureLoader.load("/textures/door/height.jpg"),
    normal: textureLoader.load("/textures/door/normal.jpg"),
    metalness: textureLoader.load("/textures/door/metalness.jpg"),
  },
  bricks: {
    color: textureLoader.load("/textures/bricks/color.jpg"),
    ambientOcclusion: textureLoader.load(
      "/textures/bricks/ambientOcclusion.jpg"
    ),
    roughness: textureLoader.load("/textures/bricks/roughness.jpg"),
    normal: textureLoader.load("/textures/bricks/normal.jpg"),
  },
  grass: {
    color: textureLoader.load("/textures/grass/color.jpg"),
    ambientOcclusion: textureLoader.load(
      "/textures/grass/ambientOcclusion.jpg"
    ),
    roughness: textureLoader.load("/textures/grass/roughness.jpg"),
    normal: textureLoader.load("/textures/grass/normal.jpg"),
  },
};

// Set texture wrapping for grass color
textures.grass.color.repeat.set(10, 10);
textures.grass.color.wrapS = THREE.RepeatWrapping;
textures.grass.color.wrapT = THREE.RepeatWrapping;

// Set color space for color textures
Object.keys(textures).forEach((key) => {
  if (textures[key].color) {
    textures[key].color.colorSpace = THREE.SRGBColorSpace;
  }
});

/**
 * House
 */
const groupingHouse = new THREE.Group();
scene.add(groupingHouse);

// Wall - Using bricks texture for the wall
const wall = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: textures.bricks.color,
    aoMap: textures.bricks.ambientOcclusion,
    normalMap: textures.bricks.normal,
    roughnessMap: textures.bricks.roughness,
  })
);
groupingHouse.add(wall);
wall.position.set(0, 1.25, 0);

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(4, 2, 4),
  new THREE.MeshStandardMaterial({ color: "red" })
);
roof.position.set(0, 3.5, 0);
roof.rotation.y = Math.PI / 4;
groupingHouse.add(roof);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 32, 32),
  new THREE.MeshStandardMaterial({
    map: textures.door.color,
    aoMap: textures.door.ambientOcclusion,
    alphaMap: textures.door.alpha,
    transparent: true,
    displacementMap: textures.door.height,
    displacementScale: 0.1,
  })
);
door.position.set(0, 1, 2.001);
groupingHouse.add(door);

// Road
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 4),
  new THREE.MeshStandardMaterial({ map: textures.road.color })
);
road.receiveShadow=true;
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0.01, 7);
scene.add(road);

// Car
const groupCar = new THREE.Group();
groupCar.position.set(-9, 0, 7);
scene.add(groupCar);

// Create the wheels
const wheelBack = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: "black" })
);
wheelBack.position.set(0, 0.25, 0);
wheelBack.rotation.y = Math.PI / 2;
wheelBack.castShadow = true; // Enable shadow casting
groupCar.add(wheelBack);

const wheelFront = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: "black" })
);
wheelFront.position.set(2, 0.25, 0);
wheelFront.rotation.y = Math.PI / 2;
wheelFront.castShadow = true; // Enable shadow casting
groupCar.add(wheelFront);

// Create the main body of the car
const main = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 1.5, 3.5),
  new THREE.MeshStandardMaterial({ color: "red" })
);
main.castShadow = true; // Enable shadow casting
main.position.set(1, 1, 0);
main.rotation.y = Math.PI / 2;
groupCar.add(main);

// Create the cabin
const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 1, 2),
  new THREE.MeshStandardMaterial({ color: "white" })
);
cabin.castShadow = true; // Enable shadow casting
cabin.position.set(1, 2, 0);
cabin.rotation.y = Math.PI / 2;
groupCar.add(cabin);

gsap.to(groupCar.position, { x: 8, duration: 5, repeat: -1 });

// Tree
const groupTree = new THREE.Group();
scene.add(groupTree);
groupTree.position.set(-6, 0, 3);

const wood = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 3, 0.2),
  new THREE.MeshStandardMaterial({ color: "brown" })
);
wood.position.y = 1.5;
groupTree.add(wood);

const branch1 = new THREE.Mesh(
  new THREE.ConeGeometry(2, 1, 5),
  new THREE.MeshStandardMaterial({ color: "green" })
);
branch1.position.y = 2;
groupTree.add(branch1);

const branch2 = new THREE.Mesh(
  new THREE.ConeGeometry(1.5, 1.3, 5),
  new THREE.MeshStandardMaterial({ color: "green" })
);
branch2.position.y = 3;
groupTree.add(branch2);

const branch3 = new THREE.Mesh(
  new THREE.ConeGeometry(1.1, 1.3, 9),
  new THREE.MeshStandardMaterial({ color: "green" })
);
branch3.position.y = 4;
groupTree.add(branch3);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: textures.grass.color,
    aoMap: textures.grass.ambientOcclusion,
    roughnessMap: textures.grass.roughness,
    normalMap: textures.grass.normal,
  })
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#ffffff", 4.5);
moonLight.position.set(4, 5, 6);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);
moonLight.castShadow=true;
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled=true;
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
