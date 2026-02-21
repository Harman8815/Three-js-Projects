import * as THREE from 'three';

function createSingleStar(radius, spread, color) {
  const x = (Math.random() - 0.5) * radius * spread;
  const y = (Math.random() - 0.5) * radius * spread;
  const z = (Math.random() - 0.5) * radius * spread;

  const starColor = new THREE.Color(color);
  starColor.offsetHSL(Math.random() * 0.05, 0, Math.random() * 0.1);

  return {
    position: [x, y, z],
    color: [starColor.r, starColor.g, starColor.b],
  };
}

// Helper to create a diagonal glowing rhombus texture
function generateRhombusTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Clear background
  ctx.clearRect(0, 0, size, size);

  // Diagonal gradient
  const gradient = ctx.createLinearGradient(0, size, size, 0);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;

  // Draw rhombus-like glow using skewed quad
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(Math.PI / 4); // 45 degree
  ctx.fillRect(-size / 6, -size / 6, size / 3, size / 3);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

function createStars({
  count = 3000,
  radius = 100,
  size = 0.5,
  color = 0xffffff,
  spread = 1.5,
  opacity = 0.8,
} = {}) {
  const positions = [];
  const colors = [];

  for (let i = 0; i < count; i++) {
    const star = createSingleStar(radius, spread, color);
    positions.push(...star.position);
    colors.push(...star.color);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const rhombusTexture = generateRhombusTexture();

  const material = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity,
    map: rhombusTexture,
    alphaTest: 0.01,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}


export { createStars, createSingleStar };
