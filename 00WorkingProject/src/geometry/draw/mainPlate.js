// src/geometry/draw/mainPlate.js
import * as THREE from "three";
import { getBaseExtensions } from "../calculations/mainPlateProfile.js";
import { getMainPlateTangents } from "../calculations/tangent.js";

export function createMainPlateGeometry(mainPlate, stiffeners = []) {
  const shape = new THREE.Shape();
  const leftWidth = Number(mainPlate.leftWidth) || 0;
  const rightWidth = Number(mainPlate.rightWidth) || 0;
  const radius = Number(mainPlate.outerRadius) || 0;
  const plateHeight = Number(mainPlate.height) || radius || 60;
  const holeRadius = (Number(mainPlate.holeDiameter) || 0) / 2;
  const extensions = getBaseExtensions(mainPlate, stiffeners);
  const { left: leftTangent, right: rightTangent } = getMainPlateTangents(
    mainPlate,
    extensions,
  );
  const startAngle = Math.atan2(leftTangent.y - plateHeight, leftTangent.x);
  const endAngle = Math.atan2(rightTangent.y - plateHeight, rightTangent.x);

  shape.moveTo(-leftWidth, 0);
  if (extensions.left > 0) shape.lineTo(-leftWidth, extensions.left);
  shape.lineTo(leftTangent.x, leftTangent.y);
  shape.absarc(0, plateHeight, radius, startAngle, endAngle, true);
  shape.lineTo(rightWidth, extensions.right);
  if (extensions.right > 0) shape.lineTo(rightWidth, 0);
  shape.closePath();

  const holePath = new THREE.Path();
  holePath.absellipse(
    0,
    plateHeight,
    holeRadius,
    holeRadius,
    0,
    Math.PI * 2,
    false,
    0,
  );
  shape.holes.push(holePath);

  const thickness = Number(mainPlate.thickness) || 10;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}
