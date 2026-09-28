// src/geometry/calculations/splitProfileAroundHole.js
import {
  clipProfileAtHeight,
  createShapeFromPoints,
} from "./profileClipping.js";

export function splitProfileAroundHole(shape, padEye, positionX, thickness) {
  const holeRadius = (Number(padEye.mainPlate.holeDiameter) || 0) / 2;
  const closestXToHole = Math.max(0, Math.abs(positionX) - thickness / 2);
  if (holeRadius <= closestXToHole) return [shape];

  const clearanceHalfHeight = Math.sqrt(holeRadius ** 2 - closestXToHole ** 2);
  const holeCenterY = Number(padEye.mainPlate.height) || 0;
  const points = shape.extractPoints(24).shape;
  return [
    createShapeFromPoints(
      clipProfileAtHeight(points, holeCenterY - clearanceHalfHeight, false),
    ),
    createShapeFromPoints(
      clipProfileAtHeight(points, holeCenterY + clearanceHalfHeight, true),
    ),
  ].filter(Boolean);
}
