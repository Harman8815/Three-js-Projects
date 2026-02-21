import * as THREE from 'three'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 1;
camera.rotation.set(1.16, -0.12, 0.27);

const ambient = new THREE.AmbientLight(0x555555);
scene.add(ambient);

const directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

const flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
flash.position.set(200, 300, 100);
scene.add(flash);

const renderer = new THREE.WebGLRenderer();
scene.fog = new THREE.FogExp2(0x11111f, 0.002);
renderer.setClearColor(scene.fog.color);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const positions = [];
const sizes = [];
const rainGeo = new THREE.BufferGeometry();
const rainCount = 15000;

for (let i = 0; i < rainCount; i++) {
  const rainDrop = new THREE.Vector3(
    Math.random() * 400 - 200,
    Math.random() * 500 - 250,
    Math.random() * 400 - 200
  );
  positions.push(Math.random() * 400 - 200);
  positions.push(Math.random() * 500 - 250);
  positions.push(Math.random() * 400 - 200);
  sizes.push(30);
}

rainGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
rainGeo.setAttribute("size", new THREE.BufferAttribute(new Float32Array(sizes), 1));

const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
  transparent: true,
});

const rain = new THREE.Points(rainGeo, rainMaterial);
scene.add(rain);

const loader = new THREE.TextureLoader();
let cloudParticles=[]
loader.load(
  "./smoke.png",
  function (texture) {
    const cloudGeo  =new THREE.PlaneGeometry(500, 500);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
    });

    for (let p = 0; p < 25; p++) {
      const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(Math.random() * 800 - 400, 500, Math.random() * 500 - 450);
      cloud.rotation.set(1.16, -0.12, Math.random() * 360);
      cloud.material.opacity = 0.6;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }

    animate();
    window.addEventListener("resize", onWindowResize);
  }
);

function animate() {
  cloudParticles.forEach((p) => {
    p.rotation.z -= 0.002;
  });

  rainGeo.attributes.size.array.forEach((r, i) => {
    r += 0.3;
  });

  rainGeo.verticesNeedUpdate = true;

  rain.position.z -= 0.222;
  if (rain.position.z < -200) {
    rain.position.z = 0;
  }

  if (Math.random() > 0.93 || flash.power > 100) {
    if (flash.power < 100)
      flash.position.set(Math.random() * 400, 300 + Math.random() * 200, 100);
    flash.power = 50 + Math.random() * 500;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
