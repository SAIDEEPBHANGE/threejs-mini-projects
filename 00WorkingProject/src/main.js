import "./style.css";
// ==========================================
// PROJECT TITLE
// ==========================================
document.title = "01 Interactive Solar System";
// ==========================================
// CANVAS
// ==========================================
const canvas = document.querySelector("#DrawingCanvas");
// ==========================================
// THREE.JS
// ==========================================
import * as THREE from "three";
// ==========================================
// ORBIT CONTROLS
// ==========================================
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// ==========================================
// RECT AREA LIGHT HELPER
// ==========================================
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
// ==========================================
// SCENE
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
// ==========================================
// CAMERA
// ==========================================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(5, 3, 7);
// ==========================================
// LIGHTING
// ==========================================
// ------------------------------------------
// AMBIENT LIGHT
// ------------------------------------------
// Soft overall illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
// ------------------------------------------
// KEY LIGHT
// ------------------------------------------
// Large softbox / main light
const keyLight = new THREE.RectAreaLight(0xffffff, 5, 5, 5);
keyLight.position.set(3, 5, 4);
keyLight.lookAt(0, 0, 0);
scene.add(keyLight);
// Key Light Helper
const keyLightHelper = new RectAreaLightHelper(keyLight);
scene.add(keyLightHelper);
// ------------------------------------------
// FILL LIGHT
// ------------------------------------------
// Blue-ish fill light
const fillLight = new THREE.RectAreaLight(0x9bbcff, 2, 4, 4);
fillLight.position.set(-4, 2, 2);
fillLight.lookAt(0, 0, 0);
scene.add(fillLight);
// Fill Light Helper
const fillLightHelper = new RectAreaLightHelper(fillLight);
scene.add(fillLightHelper);
// ------------------------------------------
// RIM LIGHT
// ------------------------------------------
// Back spotlight
const rimLight = new THREE.SpotLight(0xffffff, 10, 6, Math.PI / 10, 5);
rimLight.position.set(-2, 5, -4);
rimLight.castShadow = true;
// Spotlight target
rimLight.target.position.set(0, 1, 0);
scene.add(rimLight);
scene.add(rimLight.target);
// SpotLight Helper
// IMPORTANT:
// SpotLightHelper is available directly
// from THREE.
const rimLightHelper = new THREE.SpotLightHelper(rimLight, 0xffff00);
scene.add(rimLightHelper);
// ==========================================
// RENDERER
// ==========================================
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
// Renderer Size
renderer.setSize(window.innerWidth, window.innerHeight);
// Pixel Ratio
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// ==========================================
// SHADOWS
// ==========================================
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// ==========================================
// CUBE GEOMETRY
// ==========================================
const geometry = new THREE.BoxGeometry(2, 2, 2);
// ==========================================
// CUBE MATERIAL
// ==========================================
const material = new THREE.MeshStandardMaterial({
  color: 0xfff858,
  roughness: 0.1,
  metalness: 0.5,
});
// ==========================================
// CUBE
// ==========================================
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);
// ==========================================
// FLOOR
// ==========================================
const floorGeometry = new THREE.PlaneGeometry(5, 5);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.5,
  metalness: 0.2,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
// Rotate floor horizontal
floor.rotation.x = -Math.PI / 2;
// Move floor below cube
floor.position.y = -1.5;
// Floor receives shadows
floor.receiveShadow = true;
scene.add(floor);
// ==========================================
// GRID HELPER
// ==========================================
const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
scene.add(gridHelper);
// ==========================================
// AXES HELPER
// ==========================================
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);
// ==========================================
// CLOCK
// ==========================================
const clock = new THREE.Clock();
// ==========================================
// ORBIT CONTROLS
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
// Smooth camera movement
controls.enableDamping = true;
// Automatically rotate scene
controls.autoRotate = true;
controls.autoRotateSpeed = 2;
// Enable zoom
controls.enableZoom = true;
// Update controls
controls.update();
// ==========================================
// RESIZE
// ==========================================
window.addEventListener("resize", () => {
  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  // Update projection
  camera.updateProjectionMatrix();
});
// ==========================================
// ANIMATION
// ==========================================
function animate() {
  // Request next frame
  window.requestAnimationFrame(animate);
  // Get elapsed time
  const elapsedTime = clock.getElapsedTime();
  // ----------------------------------------
  // Rotate Cube
  // ----------------------------------------
  cube.rotation.x = elapsedTime * 1;
  cube.rotation.y = elapsedTime * 2;
  cube.rotation.z = elapsedTime * 3;
  // ----------------------------------------
  // Orbit Controls
  // ----------------------------------------
  controls.update();
  // ----------------------------------------
  // Update Spotlight Helper
  // ----------------------------------------
  rimLightHelper.update();
  // ----------------------------------------
  // Render Scene
  // ----------------------------------------
  renderer.render(scene, camera);
}
// ==========================================
// START ANIMATION
// ==========================================
animate();
