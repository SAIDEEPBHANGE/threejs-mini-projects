// src/3d/geometry/materials.js
import * as THREE from "three";

export function createPadEyeMaterials() {
  return {
    mainPlate: new THREE.MeshPhysicalMaterial({
      color: 0xc3cbd0,
      metalness: 0.82,
      roughness: 0.4,
      clearcoat: 0.12,
      clearcoatRoughness: 0.36,
    }),
    cheekPlate: new THREE.MeshPhysicalMaterial({
      color: 0x657d8c,
      metalness: 0.78,
      roughness: 0.46,
      clearcoat: 0.1,
      clearcoatRoughness: 0.4,
    }),
    stiffener: new THREE.MeshPhysicalMaterial({
      color: 0xb88752,
      metalness: 0.84,
      roughness: 0.42,
      clearcoat: 0.12,
      clearcoatRoughness: 0.38,
    }),
  };
}
