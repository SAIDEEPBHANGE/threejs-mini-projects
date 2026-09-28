// src/geometry/buildPadEyeModel.js
import * as THREE from "three";
import { createPadEyeDimensionDrawing } from "../dimensions/index.js";
import { createCheekPlateMesh } from "./draw/cheekPlate.js";
import { createMainPlateGeometry } from "./draw/mainPlate.js";
import { createStiffenerMeshes } from "./draw/stiffener.js";
import { createPadEyeMaterials } from "./materials.js";

export function buildPadEyeModel(padEye) {
  const group = new THREE.Group();
  const materials = createPadEyeMaterials();
  const mainPlate = new THREE.Mesh(
    createMainPlateGeometry(padEye.mainPlate, padEye.stiffeners),
    materials.mainPlate,
  );
  group.add(mainPlate);

  padEye.cheekPlates.forEach((plate, index) => {
    group.add(createCheekPlateMesh(plate, index, padEye, materials.cheekPlate));
  });

  padEye.stiffeners.forEach((stiffener) => {
    createStiffenerMeshes(padEye, stiffener, materials.stiffener).forEach(
      (mesh) => group.add(mesh),
    );
  });

  group.add(createPadEyeDimensionDrawing(padEye));
  return group;
}
