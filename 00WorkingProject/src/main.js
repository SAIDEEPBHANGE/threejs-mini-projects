import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import GUI from "lil-gui";
// ==========================================
// PROJECT TITLE
// ==========================================
document.title = "01 Interactive Solar System";
// ==========================================
// CANVAS
// ==========================================
const canvas = document.querySelector("#DrawingCanvas");
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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
// ------------------------------------------
// KEY LIGHT - RECT AREA LIGHT
// ------------------------------------------
const keyLight = new THREE.RectAreaLight(0xffffff, 5, 5, 5);
keyLight.position.set(3, 5, 4);
keyLight.lookAt(0, 0, 0);
scene.add(keyLight);
// Key Light Helper
const keyLightHelper = new RectAreaLightHelper(keyLight);
scene.add(keyLightHelper);
// ------------------------------------------
// FILL LIGHT - RECT AREA LIGHT
// ------------------------------------------
const fillLight = new THREE.RectAreaLight(0x9bbcff, 2, 4, 4);
fillLight.position.set(-4, 2, 2);
fillLight.lookAt(0, 0, 0);
scene.add(fillLight);
// Fill Light Helper
const fillLightHelper = new RectAreaLightHelper(fillLight);
scene.add(fillLightHelper);
// ------------------------------------------
// RIM LIGHT - SPOT LIGHT
// ------------------------------------------
const rimLight = new THREE.SpotLight(0xffffff, 10, 6, Math.PI / 10, 0.5, 2);
rimLight.position.set(-2, 5, -4);
rimLight.castShadow = true;
// Spotlight target
rimLight.target.position.set(0, 1, 0);
scene.add(rimLight);
scene.add(rimLight.target);
// Spotlight Helper
const rimLightHelper = new THREE.SpotLightHelper(rimLight, 0xffff00);
scene.add(rimLightHelper);
// ==========================================
// LIL GUI
// ==========================================
const gui = new GUI({
  title: "Lighting Controls",
});
// ==========================================
// AMBIENT LIGHT GUI
// ==========================================
const ambientFolder = gui.addFolder("Ambient Light");
const ambientSettings = {
  color: "#ffffff",
};
ambientFolder
  .addColor(ambientSettings, "color")
  .name("Color")
  .onChange((value) => {
    ambientLight.color.set(value);
  });
ambientFolder.add(ambientLight, "intensity", 0, 2, 0.01).name("Intensity");
// ==========================================
// KEY LIGHT GUI
// ==========================================
const keyFolder = gui.addFolder("Key Light");
const keySettings = {
  color: "#ffffff",
};
keyFolder
  .addColor(keySettings, "color")
  .name("Color")
  .onChange((value) => {
    keyLight.color.set(value);
  });
keyFolder.add(keyLight, "intensity", 0, 20, 0.1).name("Intensity");
keyFolder.add(keyLight, "width", 0.1, 20, 0.1).name("Width");
keyFolder.add(keyLight, "height", 0.1, 20, 0.1).name("Height");
// Key Position
const keyPosition = keyFolder.addFolder("Position");
keyPosition.add(keyLight.position, "x", -10, 10, 0.1).name("X");
keyPosition.add(keyLight.position, "y", -10, 10, 0.1).name("Y");
keyPosition.add(keyLight.position, "z", -10, 10, 0.1).name("Z");
// ==========================================
// FILL LIGHT GUI
// ==========================================
const fillFolder = gui.addFolder("Fill Light");
const fillSettings = {
  color: "#9bbcff",
};
fillFolder
  .addColor(fillSettings, "color")
  .name("Color")
  .onChange((value) => {
    fillLight.color.set(value);
  });
fillFolder.add(fillLight, "intensity", 0, 20, 0.1).name("Intensity");
fillFolder.add(fillLight, "width", 0.1, 20, 0.1).name("Width");
fillFolder.add(fillLight, "height", 0.1, 20, 0.1).name("Height");
// Fill Position
const fillPosition = fillFolder.addFolder("Position");
fillPosition.add(fillLight.position, "x", -10, 10, 0.1).name("X");
fillPosition.add(fillLight.position, "y", -10, 10, 0.1).name("Y");
fillPosition.add(fillLight.position, "z", -10, 10, 0.1).name("Z");
// ==========================================
// RIM LIGHT GUI
// ==========================================
const rimFolder = gui.addFolder("Rim Light");
const rimSettings = {
  color: "#ffffff",
};
rimFolder
  .addColor(rimSettings, "color")
  .name("Color")
  .onChange((value) => {
    rimLight.color.set(value);
  });
rimFolder.add(rimLight, "intensity", 0, 50, 0.1).name("Intensity");
rimFolder.add(rimLight, "distance", 0, 30, 0.1).name("Distance");
rimFolder.add(rimLight, "angle", 0.01, Math.PI / 2, 0.01).name("Angle");
rimFolder.add(rimLight, "penumbra", 0, 1, 0.01).name("Penumbra");
rimFolder.add(rimLight, "decay", 0, 5, 0.1).name("Decay");
// Rim Position
const rimPosition = rimFolder.addFolder("Position");
rimPosition.add(rimLight.position, "x", -10, 10, 0.1).name("X");
rimPosition.add(rimLight.position, "y", -10, 10, 0.1).name("Y");
rimPosition.add(rimLight.position, "z", -10, 10, 0.1).name("Z");
// Rim Target
const rimTarget = rimFolder.addFolder("Target");
rimTarget.add(rimLight.target.position, "x", -5, 5, 0.1).name("X");
rimTarget.add(rimLight.target.position, "y", -5, 5, 0.1).name("Y");
rimTarget.add(rimLight.target.position, "z", -5, 5, 0.1).name("Z");
// ==========================================
// RENDERER
// ==========================================
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
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
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 2;
controls.enableZoom = true;
controls.update();
// ==========================================
// RESIZE
// ==========================================
window.addEventListener("resize", () => {
  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Update camera aspect
  camera.aspect = window.innerWidth / window.innerHeight;
  // Update projection
  camera.updateProjectionMatrix();
});
// ==========================================
// ANIMATION
// ==========================================
function animate() {
  window.requestAnimationFrame(animate);

  // Get elapsed time
  const elapsedTime = clock.getElapsedTime();

  // Rotate Cube
  cube.rotation.x = elapsedTime * 1;
  cube.rotation.y = elapsedTime * 2;
  cube.rotation.z = elapsedTime * 3;

  // Keep RectAreaLights pointing at the cube
  keyLight.lookAt(0, 0, 0);
  fillLight.lookAt(0, 0, 0);

  // Orbit Controls
  controls.update();

  // Update SpotLight Helper
  rimLightHelper.update();

  // Render
  renderer.render(scene, camera);
}

animate();
// ==========================================
// START ANIMATION
// ==========================================
animate();
