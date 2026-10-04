// src/3d/PadEyeCanvas.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ViewHelper } from "three/addons/helpers/ViewHelper.js";
import { buildPadEyeModel } from "./geometry/index.js";

export function PadEyeCanvas({ padEye, isDark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const host = canvasRef.current;
    const scene = new THREE.Scene();
    const backgroundColor = isDark ? 0x141920 : 0xf4f7fa;
    scene.background = new THREE.Color(backgroundColor);

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
    const axisStyles = {
      posX: { color: 0xff4466, label: "+X", opacity: 1 },
      negX: { color: 0xff4466, label: "-X", opacity: 0.55 },
      posY: { color: 0x88ff44, label: "+Y", opacity: 1 },
      negY: { color: 0x88ff44, label: "-Y", opacity: 0.55 },
      posZ: { color: 0x4488ff, label: "+Z", opacity: 1 },
      negZ: { color: 0x4488ff, label: "-Z", opacity: 0.55 },
    };
    const replacedAxisMaterials = new Set();
    viewHelper.children.forEach((axisPoint) => {
      const style = axisStyles[axisPoint.userData.type];
      if (!style) return;

      const originalMaterial = axisPoint.material;
      const material = originalMaterial.clone();
      replacedAxisMaterials.add(originalMaterial);
      const markerCanvas = document.createElement("canvas");
      markerCanvas.width = 128;
      markerCanvas.height = 128;
      const markerContext = markerCanvas.getContext("2d");
      markerContext.beginPath();
      markerContext.arc(64, 64, 48, 0, Math.PI * 2);
      markerContext.fillStyle = `#${style.color.toString(16).padStart(6, "0")}`;
      markerContext.fill();
      markerContext.fillStyle = "#101820";
      markerContext.font = "700 42px Arial, sans-serif";
      markerContext.textAlign = "center";
      markerContext.textBaseline = "middle";
      markerContext.fillText(style.label, 64, 66);

      const markerTexture = new THREE.CanvasTexture(markerCanvas);
      markerTexture.colorSpace = THREE.SRGBColorSpace;
      material.map = markerTexture;
      material.color.setHex(0xffffff);
      material.opacity = style.opacity;
      material.transparent = true;
      material.depthWrite = false;
      material.alphaTest = 0.02;
      material.needsUpdate = true;
      axisPoint.material = material;
    });
    replacedAxisMaterials.forEach((material) => {
      material.map?.dispose();
      material.dispose();
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
  }, [isDark, padEye]);

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
        style={{ backgroundColor: isDark ? "#141920" : "#f4f7fa" }}
      />
    </section>
  );
}
