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
  const extensions = getBaseExtensions(padEye.mainPlate);
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
    height: outlineHeight,
  };
}
