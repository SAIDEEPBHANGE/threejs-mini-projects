// src/geometry/draw/cheekPlate.js
import * as THREE from "three";

export function createCheekPlateMesh(plate, index, padEye, material) {
  const cheekShape = new THREE.Shape();
  const outerRadius = Number(plate.radius) || 0;
  const innerRadius = (Number(padEye.mainPlate.holeDiameter) || 0) / 2;

  cheekShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, false);
  cheekShape.holes.push(holePath);

  const cheekThickness = Number(plate.thickness) || 10;
  const mainThickness = Number(padEye.mainPlate.thickness) || 10;
  const geometry = new THREE.ExtrudeGeometry(cheekShape, {
    depth: cheekThickness,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -cheekThickness / 2);

  const side = index % 2 === 0 ? 1 : -1;
  const previousPlateThickness = padEye.cheekPlates
    .slice(0, index)
    .reduce(
      (total, cheek, cheekIndex) =>
        cheekIndex % 2 === index % 2
          ? total + (Number(cheek.thickness) || 10)
          : total,
      0,
    );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    0,
    Number(padEye.mainPlate.height) || 0,
    side * (mainThickness / 2 + previousPlateThickness + cheekThickness / 2),
  );
  return mesh;
}
