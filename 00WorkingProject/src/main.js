import "./style.css";
// Giving Project Title
document.title = "01 Interactive Solar System";
// Main Page Canvas
const canvas = document.querySelector("#DrawingCanvas");
// Import Three JS
import * as THREE from "three";
// animation & my controls
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// Create Scene : Mean Complete 3D World
const scene = new THREE.Scene();
// Create Camera : Means Perspective
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

// Asking GPU to Render
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
// Created Geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0xfff858,
  wireframe: true,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
// handling resize issue
window.addEventListener("resize", () => {
  // render size changes
  renderer.setSize(window.innerWidth, window.innerHeight);
  // camera perpective also chages
  camera.aspect = window.innerWidth / window.innerHeight;
  // shape of size will be constant
  camera.updateProjectionMatrix();
  console.log("resizing...", camera, renderer);
});
camera.position.z = 5;
// time is constant so we will remove dependecy from GPU
let clock = new THREE.Clock();
// adding orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
// controls.update() must be called after any manual changes to the camera's transform
controls.update();
function animate() {
  window.requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  cube.rotation.x = clock.getElapsedTime();
  cube.rotation.y = clock.getElapsedTime();
  cube.rotation.z = clock.getElapsedTime();
}
animate();
