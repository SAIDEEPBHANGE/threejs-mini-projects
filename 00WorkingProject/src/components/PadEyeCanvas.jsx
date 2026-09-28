// src/components/PadEyeCanvas.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ViewHelper } from "three/addons/helpers/ViewHelper.js";
import { buildPadEyeModel } from "../geometry/index.js";

export function PadEyeCanvas({ padEye }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const host = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      35,
      host.clientWidth / host.clientHeight,
      0.1,
      10000,
    );
    camera.position.set(260, 180, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.autoClear = false;
    host.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const environmentTarget = pmremGenerator.fromScene(environment, 0.04);
    scene.environment = environmentTarget.texture;
    scene.environmentIntensity = 0.55;
    environment.dispose();
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 120;
    controls.maxDistance = 900;

    const viewHelper = new ViewHelper(camera, renderer.domElement);
    viewHelper.location.top = 16;
    viewHelper.location.right = 16;
    const negativeAxisColors = {
      negX: 0xff4466,
      negY: 0x88ff44,
      negZ: 0x4488ff,
    };
    viewHelper.children.forEach((axisPoint) => {
      const color = negativeAxisColors[axisPoint.userData.type];
      if (color === undefined) return;

      axisPoint.material = axisPoint.material.clone();
      const markerCanvas = document.createElement("canvas");
      markerCanvas.width = 64;
      markerCanvas.height = 64;
      const markerContext = markerCanvas.getContext("2d");
      markerContext.beginPath();
      markerContext.arc(32, 32, 14, 0, Math.PI * 2);
      markerContext.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
      markerContext.fill();

      const markerTexture = new THREE.CanvasTexture(markerCanvas);
      markerTexture.colorSpace = THREE.SRGBColorSpace;
      axisPoint.material.map = markerTexture;
      axisPoint.material.color.setHex(0xffffff);
      axisPoint.material.opacity = 0.55;
      axisPoint.material.transparent = true;
      axisPoint.material.needsUpdate = true;
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(220, 260, 180);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.7);
    fillLight.position.set(-180, 120, -160);
    scene.add(fillLight);

    const padEyeGroup = buildPadEyeModel(padEye);
    scene.add(padEyeGroup);

    const boundingBox = new THREE.Box3().setFromObject(padEyeGroup);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z, 1);
    const distance =
      maxDimension / (2 * Math.tan((camera.fov * Math.PI) / 360)) + 90;
    controls.maxDistance = distance * 1;
    camera.far = Math.max(10000, maxDimension * 100);
    camera.updateProjectionMatrix();

    camera.position.set(
      center.x + distance * 0.9,
      center.y + distance * 0.5,
      center.z + distance,
    );
    controls.target.copy(center);
    viewHelper.center.copy(center);
    controls.update();

    const handleViewHelperClick = (event) => {
      if (!viewHelper.handleClick(event)) return;
      event.stopImmediatePropagation();
      controls.enabled = false;
    };
    renderer.domElement.addEventListener(
      "pointerdown",
      handleViewHelperClick,
      true,
    );

    const handlePointerMove = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      const overHelper =
        event.clientX >= bounds.right - 144 &&
        event.clientY <= bounds.top + 144;
      renderer.domElement.style.cursor = overHelper ? "pointer" : "";
    };
    renderer.domElement.addEventListener("pointermove", handlePointerMove);

    const handleResize = () => {
      if (!host) return;
      const width = host.clientWidth;
      const height = host.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    const timer = new THREE.Timer();
    timer.connect(document);
    let rafId = 0;
    const tick = (timestamp) => {
      timer.update(timestamp);
      if (viewHelper.animating) {
        viewHelper.update(timer.getDelta());
        if (!viewHelper.animating) controls.enabled = true;
      }
      controls.update();
      renderer.clear();
      renderer.render(scene, camera);
      viewHelper.render(renderer);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener(
        "pointerdown",
        handleViewHelperClick,
        true,
      );
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      controls.dispose();
      timer.dispose();
      environmentTarget.dispose();
      const disposedGeometries = new Set();
      const disposedMaterials = new Set();
      viewHelper.traverse((child) => {
        if (child.geometry && !disposedGeometries.has(child.geometry)) {
          child.geometry.dispose();
          disposedGeometries.add(child.geometry);
        }
        const materials = Array.isArray(child.material)
          ? child.material
          : child.material
            ? [child.material]
            : [];
        materials.forEach((material) => {
          if (disposedMaterials.has(material)) return;
          material.map?.dispose();
          material.dispose();
          disposedMaterials.add(material);
        });
      });
      renderer.dispose();
      host.removeChild(renderer.domElement);
      padEyeGroup.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              material.map?.dispose();
              material.dispose();
            });
          } else {
            child.material.map?.dispose();
            child.material.dispose();
          }
        }
      });
    };
  }, [padEye]);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
        <h2 className="text-lg font-semibold text-slate-700">3D Viewport</h2>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Live model
        </span>
      </div>
      <div
        ref={canvasRef}
        className="h-150 w-full"
        style={{ background: "#000000" }}
      />
    </section>
  );
}
