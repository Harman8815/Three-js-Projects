// main.js
// ------------------------------------------------------
// THREE.js Gravity Box Scene with Mouse Interaction
// - Balls are pulled toward center
// - Mouse ball repels strongly
// - Balls bounce off glowing grid box walls
// - Bloom effects for atmosphere
// ------------------------------------------------------

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ------------------ GLOBALS ------------------
let scene, camera, renderer, composer;
let mouseBall, boxGroup;
let balls = [];
let raycaster, mouse;

// ------------------ SETTINGS ------------------
const settings = {
  boxSize: 120,
  ballCount: 80,
  ballSize: 2,
  ballColor: 0xff8844,
  centerGravityStrength: 0.05,
  mouseGravityStrength: 0.4,
  bounceDamping: 0.85,
  bloomStrength: 1.8,
  bloomThreshold: 0,
  bloomRadius: 0.6,
  backgroundColor: 0x000010,
  fogNear: 60,
  fogFar: 200,
  mouseBallSize: 1.2,
  mouseBallColor: 0x00ffcc,
  mouseBallGlow: 2.5
};

// ------------------ INIT ------------------
function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(settings.backgroundColor);
  scene.fog = new THREE.Fog(settings.backgroundColor, settings.fogNear, settings.fogFar);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.set(0, 50, 150);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Raycaster
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Lighting
  setupLights();

  // Postprocessing
  setupComposer();

  // Box with grid lines
  setupGridBox();

  // Balls
  for (let i = 0; i < settings.ballCount; i++) {
    createBall();
  }

  // Mouse ball
  createMouseBall();

  // Controls
  new OrbitControls(camera, renderer.domElement);

  // Events
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousemove", onMouseMove);

  // Start animation loop
  animate();
}

// ------------------ LIGHTS ------------------
function setupLights() {
  const ambient = new THREE.AmbientLight(0xaaaaaa, 0.5);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(50, 100, 50);
  scene.add(dirLight);

  const fillLight = new THREE.PointLight(0x4488ff, 1, 300);
  fillLight.position.set(-50, 50, -100);
  scene.add(fillLight);

  const backLight = new THREE.SpotLight(0xff3399, 1.2, 500, Math.PI / 6, 0.2, 1);
  backLight.position.set(0, -100, 150);
  scene.add(backLight);
}

// ------------------ COMPOSER ------------------
function setupComposer() {
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    settings.bloomStrength,
    settings.bloomRadius,
    settings.bloomThreshold
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
}

// ------------------ GRID BOX ------------------
function setupGridBox() {
  boxGroup = new THREE.Group();

  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });

  const geometry = new THREE.BoxGeometry(
    settings.boxSize,
    settings.boxSize,
    settings.boxSize,
    10,
    10,
    10
  );

  const gridBox = new THREE.Mesh(geometry, gridMat);
  boxGroup.add(gridBox);

  const edges = new THREE.EdgesGeometry(
    new THREE.BoxGeometry(settings.boxSize, settings.boxSize, settings.boxSize)
  );
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff });
  const lineBox = new THREE.LineSegments(edges, lineMat);
  boxGroup.add(lineBox);

  scene.add(boxGroup);
}

// ------------------ BALL CREATOR ------------------
function createBall() {
  const geo = new THREE.SphereGeometry(settings.ballSize, 24, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: settings.ballColor,
    metalness: 0.8,
    roughness: 0.2
  });

  const ball = new THREE.Mesh(geo, mat);

  // Random position
  ball.position.set(
    (Math.random() - 0.5) * settings.boxSize * 0.5,
    (Math.random() - 0.5) * settings.boxSize * 0.5,
    (Math.random() - 0.5) * settings.boxSize * 0.5
  );

  // Initial velocity
  ball.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.1,
    (Math.random() - 0.5) * 0.1,
    (Math.random() - 0.5) * 0.1
  );

  balls.push(ball);
  scene.add(ball);
}

// ------------------ MOUSE BALL ------------------
function createMouseBall() {
  const geo = new THREE.SphereGeometry(settings.mouseBallSize, 64, 64);
  const mat = new THREE.MeshBasicMaterial({
    color: settings.mouseBallColor
  });

  mouseBall = new THREE.Mesh(geo, mat);
  scene.add(mouseBall);
}

// ------------------ EVENTS ------------------
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const pos = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, pos);

  mouseBall.position.copy(pos);
}

// ------------------ PHYSICS ------------------
function applyPhysics(ball) {
  const gravityCenter = new THREE.Vector3(0, 0, 0);

  // Gravity toward center
  const dirToCenter = gravityCenter.clone().sub(ball.position);
  const distToCenter = dirToCenter.length();
  if (distToCenter > 0.1) {
    dirToCenter.normalize().multiplyScalar(settings.centerGravityStrength);
    ball.velocity.add(dirToCenter);
  }

  // Gravity from mouse ball (stronger)
  const dirToMouse = mouseBall.position.clone().sub(ball.position);
  const distToMouse = dirToMouse.length();
  if (distToMouse < 15) {
    dirToMouse.normalize().multiplyScalar(settings.mouseGravityStrength);
    ball.velocity.add(dirToMouse);
  }

  // Update position
  ball.position.add(ball.velocity);

  // Bounce from walls
  ["x", "y", "z"].forEach(axis => {
    if (ball.position[axis] > settings.boxSize / 2 - settings.ballSize ||
        ball.position[axis] < -settings.boxSize / 2 + settings.ballSize) {
      ball.velocity[axis] *= -settings.bounceDamping;
    }
  });
}

// ------------------ UPDATE LOOP ------------------
function updatePhysics() {
  balls.forEach(ball => applyPhysics(ball));
}

// ------------------ ANIMATE ------------------
function animate() {
  requestAnimationFrame(animate);

  updatePhysics();

  composer.render();
}

// ------------------ RUN ------------------
init();
