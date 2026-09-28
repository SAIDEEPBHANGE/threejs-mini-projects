// src/geometry/materials.js
import * as THREE from "three";

export function createPadEyeMaterials() {
  return {
    mainPlate: new THREE.MeshPhysicalMaterial({
      color: 0xc3cbd0,
      metalness: 0.82,
      roughness: 0.28,
      clearcoat: 0.28,
      clearcoatRoughness: 0.24,
    }),
    cheekPlate: new THREE.MeshPhysicalMaterial({
      color: 0x657d8c,
      metalness: 0.78,
      roughness: 0.36,
      clearcoat: 0.2,
      clearcoatRoughness: 0.3,
    }),
    stiffener: new THREE.MeshPhysicalMaterial({
      color: 0xb88752,
      metalness: 0.84,
      roughness: 0.3,
      clearcoat: 0.24,
      clearcoatRoughness: 0.26,
    }),
  };
}
