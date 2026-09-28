// src/geometry/calculations/tangent.js
import * as THREE from "three";

export function getTangentPoint(
  pointX,
  pointY,
  centerX,
  centerY,
  radius,
  side,
) {
  const offsetX = pointX - centerX;
  const offsetY = pointY - centerY;
  const distanceSquared = offsetX ** 2 + offsetY ** 2;
  const effectiveRadius = Math.min(
    radius,
    Math.sqrt(distanceSquared) * (1 - Number.EPSILON),
  );
  const tangentScale = effectiveRadius ** 2 / distanceSquared;
  const perpendicularScale =
    (side *
      effectiveRadius *
      Math.sqrt(distanceSquared - effectiveRadius ** 2)) /
    distanceSquared;

  return new THREE.Vector2(
    centerX + tangentScale * offsetX - perpendicularScale * offsetY,
    centerY + tangentScale * offsetY + perpendicularScale * offsetX,
  );
}

export function getMainPlateTangents(
  mainPlate,
  extensions = { left: 0, right: 0 },
) {
  const plateHeight = Number(mainPlate.height) || 0;
  const radius = Number(mainPlate.outerRadius) || 0;

  return {
    left: getTangentPoint(
      -(Number(mainPlate.leftWidth) || 0),
      extensions.left,
      0,
      plateHeight,
      radius,
      -1,
    ),
    right: getTangentPoint(
      Number(mainPlate.rightWidth) || 0,
      extensions.right,
      0,
      plateHeight,
      radius,
      1,
    ),
  };
}
