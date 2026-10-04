// src/3d/geometry/calculations/mainPlateProfile.js
import { getMainPlateTangents } from "./tangent.js";

export function getBaseExtensions(mainPlate) {
  return {
    left: Math.max(0, Number(mainPlate.leftShoulderHeight) || 0),
    right: Math.max(0, Number(mainPlate.rightShoulderHeight) || 0),
  };
}

export function getMainPlateHeightAtX(
  mainPlate,
  x,
  extensions = { left: 0, right: 0 },
) {
  const plateHeight = Number(mainPlate.height) || 0;
  const leftWidth = Number(mainPlate.leftWidth) || 0;
  const rightWidth = Number(mainPlate.rightWidth) || 0;
  const radius = Number(mainPlate.outerRadius) || 0;
  const { left: leftTangent, right: rightTangent } = getMainPlateTangents(
    mainPlate,
    extensions,
  );

  if (x < leftTangent.x) {
    if (x < -leftWidth || leftTangent.x === -leftWidth) return 0;
    return (
      extensions.left +
      ((x + leftWidth) / (leftTangent.x + leftWidth)) *
        (leftTangent.y - extensions.left)
    );
  }

  if (x > rightTangent.x) {
    if (x > rightWidth || rightWidth === rightTangent.x) return 0;
    return (
      extensions.right +
      ((rightWidth - x) / (rightWidth - rightTangent.x)) *
        (rightTangent.y - extensions.right)
    );
  }

  return plateHeight + Math.sqrt(Math.max(0, radius ** 2 - x ** 2));
}
