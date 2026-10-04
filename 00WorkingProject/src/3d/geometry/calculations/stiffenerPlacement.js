// src/3d/geometry/calculations/stiffenerPlacement.js
import {
  getBaseExtensions,
  getMainPlateHeightAtX,
} from "./mainPlateProfile.js";

export function calculateStiffenerPlacement(padEye, stiffener) {
  const offset = Number(stiffener.offset) || 0;
  const positionX =
    stiffener.position === "left"
      ? -offset
      : stiffener.position === "right"
        ? offset
        : 0;
  const thickness = Math.max(0, Number(stiffener.thickness) || 0);
  const halfThickness = thickness / 2;
  const extensions = getBaseExtensions(padEye.mainPlate, padEye.stiffeners);
  const baseWidth =
    stiffener.position === "left"
      ? Number(padEye.mainPlate.leftWidth)
      : stiffener.position === "right"
        ? Number(padEye.mainPlate.rightWidth)
        : null;
  const isAtMainPlateBase =
    baseWidth !== null && Math.abs(offset - baseWidth) <= halfThickness;
  const outlineHeight = Math.max(
    0,
    Math.min(
      getMainPlateHeightAtX(
        padEye.mainPlate,
        positionX - halfThickness,
        extensions,
      ),
      getMainPlateHeightAtX(
        padEye.mainPlate,
        positionX + halfThickness,
        extensions,
      ),
    ),
  );

  return {
    positionX,
    thickness,
    height: isAtMainPlateBase
      ? Math.max(0, Number(stiffener.height) || 0)
      : outlineHeight,
  };
}
