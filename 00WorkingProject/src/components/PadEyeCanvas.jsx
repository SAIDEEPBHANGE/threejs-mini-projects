import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildPadEyeModel } from "../utils/padEyeGeometry";

export function PadEyeCanvas({ padEye }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const host = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

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
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 120;
    controls.maxDistance = 900;

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
    controls.maxDistance = Math.max(900, distance * 20);
    camera.far = Math.max(10000, maxDimension * 100);
    camera.updateProjectionMatrix();

    camera.position.set(
      center.x + distance * 0.9,
      center.y + distance * 0.5,
      center.z + distance,
    );
    controls.target.copy(center);
    controls.update();

    const handleResize = () => {
      if (!host) return;
      const width = host.clientWidth;
      const height = host.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    let rafId = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      padEyeGroup.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
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
        className="h-150 w-full bg-[radial-gradient(circle_at_top,#f8fafc,#e2e8f0_55%,#cbd5e1)],_#f8fafc,_#e2e8f0_55%,_#cbd5e1)]"
      />
    </section>
  );
}
