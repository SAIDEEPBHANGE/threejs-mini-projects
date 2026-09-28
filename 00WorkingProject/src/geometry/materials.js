// src/geometry/materials.js
import * as THREE from "three";

export function createPadEyeMaterials() {
  return {
    mainPlate: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.4,
      roughness: 0.65,
    }),
    cheekPlate: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.25,
      roughness: 0.7,
    }),
    stiffener: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.2,
      roughness: 0.75,
    }),
  };
}
