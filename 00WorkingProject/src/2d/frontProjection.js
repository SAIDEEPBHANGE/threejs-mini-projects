// src/2d/frontProjection.js
import { calculateStiffenerPlacement } from "../3d/geometry/calculations/stiffenerPlacement.js";
import {
  createCirclePoints,
  createMainPlateOutline,
  createProjectionBounds,
  getProjectionPalette,
} from "./projectionUtils.js";

export function createFrontProjection(padEye, background, axisColor) {
  const { mainPlate } = padEye;
  const colors = getProjectionPalette(background === "#141920");
  const width = Math.max(
    Number(mainPlate.leftWidth) || 0,
    Number(mainPlate.rightWidth) || 0,
  );
  const primitives = [];
  const { points: outline } = createMainPlateOutline(padEye);

  primitives.push({
    points: outline,
    fill: colors.plate,
    stroke: colors.outline,
    strokeWidth: 2,
  });

  padEye.stiffeners.forEach((stiffener) => {
    const placement = calculateStiffenerPlacement(padEye, stiffener);
    const holeRadius = (Number(mainPlate.holeDiameter) || 0) / 2;
    const nearestX = Math.max(
      0,
      Math.abs(placement.positionX) - placement.thickness / 2,
    );
    const halfGap =
      nearestX < holeRadius ? Math.sqrt(holeRadius ** 2 - nearestX ** 2) : 0;
    const makeBand = (bottom, top) => {
      if (top <= bottom) return;
      const halfThickness = placement.thickness / 2;
      primitives.push({
        points: [
          [placement.positionX - halfThickness, bottom],
          [placement.positionX + halfThickness, bottom],
          [placement.positionX + halfThickness, top],
          [placement.positionX - halfThickness, top],
        ],
        fill: colors.stiffener,
        stroke: colors.outline,
        strokeWidth: 1.5,
        opacity: 0.9,
      });
    };

    if (halfGap > 0) {
      makeBand(0, Math.min(placement.height, mainPlate.height - halfGap));
      makeBand(mainPlate.height + halfGap, placement.height);
    } else {
      makeBand(0, placement.height);
    }
  });

  padEye.cheekPlates.forEach((plate) => {
    primitives.push({
      points: createCirclePoints(
        0,
        mainPlate.height,
        Number(plate.radius) || 0,
      ),
      fill: "none",
      stroke: colors.cheek,
      strokeWidth: 2,
      opacity: 0.95,
    });
  });

  const holeRadius = (Number(mainPlate.holeDiameter) || 0) / 2;
  primitives.push({
    points: createCirclePoints(0, mainPlate.height, holeRadius),
    fill: background,
    stroke: colors.outline,
    strokeWidth: 2,
  });
  primitives.push({
    closed: false,
    points: [
      [0, 0],
      [0, mainPlate.height + (Number(mainPlate.outerRadius) || 0)],
    ],
    fill: "none",
    stroke: axisColor,
    strokeWidth: 1.4,
    dash: "10 4 2 4",
  });

  const padding = Math.max(24, width * 0.12);
  return {
    bounds: createProjectionBounds(primitives, padding),
    primitives,
    summary: `LW ${mainPlate.leftWidth} · RW ${mainPlate.rightWidth} · H ${mainPlate.height} · R ${mainPlate.outerRadius} · D ${mainPlate.holeDiameter} ${padEye.units}`,
  };
}
