import * as THREE from 'three';
// import "./style.css";
import bg1 from "./image/image1.jpg";
import bg2 from "./image/image2.jpg";

const container = document.querySelector('.three_bg');
const loader = new THREE.TextureLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

renderer.outputEncoding = THREE.sRGBEncoding;
// Load texture and fix potential discoloration by setting texture filters
const texture = loader.load(bg1);
texture.colorSpace = THREE.SRGBColorSpace;// Convert texture to sRGB

texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;

const geometry = new THREE.PlaneGeometry(17, 8, 75, 15); // Starting size of the plane (scaled to full screen)
const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Adjust camera to fit full screen (aspect ratio should match the screen's aspect ratio)
camera.position.z = 5;

const count = geometry.attributes.position.count;
const clock = new THREE.Clock();


// Animation loop
function animate() {
    const time = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
        const x = geometry.attributes.position.getX(i);
        const y = geometry.attributes.position.getY(i);
        const anim1 = 0.25 * Math.sin(x + time * 0.7);
        const anim2 = 0.35 * Math.sin(x * 1 + time * 0.7);
        const anim3 = 0.1 * Math.sin(y * 15 + time * 0.7);
        geometry.attributes.position.setZ(i, anim1+anim2+anim3 );
    }
    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
