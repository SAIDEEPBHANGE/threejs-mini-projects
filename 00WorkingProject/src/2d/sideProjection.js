// src/2d/sideProjection.js
import { calculateStiffenerPlacement } from "../3d/geometry/calculations/stiffenerPlacement.js";
import { splitProfileAroundHole } from "../3d/geometry/calculations/splitProfileAroundHole.js";
import { createStiffenerProfile } from "../3d/geometry/calculations/stiffenerProfile.js";
import {
  createProjectionBounds,
  getProjectionPalette,
} from "./projectionUtils.js";

// Projects plate depth, cheek stacks, hidden hole edges, and stiffeners onto depth/Y.
export function createSideProjection(padEye, axisColor, isDark = false) {
  const { mainPlate } = padEye;
  const colors = getProjectionPalette(isDark);
  const mainThickness = Number(mainPlate.thickness) || 10;
  const holeRadius = (Number(mainPlate.holeDiameter) || 0) / 2;
  const centerY = Number(mainPlate.height) || 0;
  const outerRadius = Number(mainPlate.outerRadius) || 0;
  const primitives = [];
  const addMainPlateBand = (lowY, highY) => {
    if (highY <= lowY) return;
    primitives.push({
      points: [
        [-mainThickness / 2, lowY],
        [mainThickness / 2, lowY],
        [mainThickness / 2, highY],
        [-mainThickness / 2, highY],
      ],
      fill: colors.plate,
      stroke: colors.outline,
      strokeWidth: 2,
    });
  };
  addMainPlateBand(0, centerY - holeRadius);
  addMainPlateBand(centerY + holeRadius, centerY + outerRadius);

  padEye.cheekPlates.forEach((plate, index) => {
    const radius = Number(plate.radius) || 0;
    const thickness = Number(plate.thickness) || 10;
    const side = index % 2 === 0 ? 1 : -1;
    const previousThickness = padEye.cheekPlates
      .slice(0, index)
      .reduce(
        (total, cheek, cheekIndex) =>
          cheekIndex % 2 === index % 2
            ? total + (Number(cheek.thickness) || 10)
            : total,
        0,
      );
    const centerZ =
      side * (mainThickness / 2 + previousThickness + thickness / 2);
    const leftZ = centerZ - thickness / 2;
    const rightZ = centerZ + thickness / 2;
    const addBand = (lowY, highY) => {
      if (highY <= lowY) return;
      primitives.push({
        points: [
          [leftZ, lowY],
          [rightZ, lowY],
          [rightZ, highY],
          [leftZ, highY],
        ],
        fill: colors.cheek,
        stroke: colors.outline,
        strokeWidth: 1.5,
      });
    };
    addBand(centerY - radius, centerY - holeRadius);
    addBand(centerY + holeRadius, centerY + radius);
  });

  padEye.stiffeners.forEach((stiffener) => {
    const placement = calculateStiffenerPlacement(padEye, stiffener);
    const profile = createStiffenerProfile(stiffener, placement.height);
    const profiles = splitProfileAroundHole(
      profile,
      padEye,
      placement.positionX,
      placement.thickness,
    );
    [-1, 1].forEach((face) => {
      profiles.forEach((shape) => {
        const points = shape
          .getPoints(48)
          .map(([x, y]) => [face * (mainThickness / 2 + x), y]);
        primitives.push({
          points,
          fill: colors.stiffener,
          stroke: colors.outline,
          strokeWidth: 1.5,
          opacity: 0.86,
        });
      });
    });
  });

  primitives.push({
    closed: false,
    points: [
      [-mainThickness / 2, centerY - holeRadius],
      [mainThickness / 2, centerY - holeRadius],
    ],
    fill: "none",
    stroke: colors.hiddenLine,
    strokeWidth: 1.5,
    dash: "5 5",
  });
  primitives.push({
    closed: false,
    points: [
      [0, 0],
      [0, centerY + outerRadius],
    ],
    fill: "none",
    stroke: axisColor,
    strokeWidth: 1.4,
    dash: "10 4 2 4",
  });
  primitives.push({
    closed: false,
    points: [
      [-mainThickness / 2, centerY + holeRadius],
      [mainThickness / 2, centerY + holeRadius],
    ],
    fill: "none",
    stroke: colors.hiddenLine,
    strokeWidth: 1.5,
    dash: "5 5",
  });

  const maxDepth = Math.max(
    mainThickness / 2,
    ...padEye.cheekPlates.map(
      (plate) => mainThickness / 2 + (Number(plate.thickness) || 10) * 2,
    ),
    ...padEye.stiffeners.map(
      (stiffener) =>
        mainThickness / 2 +
        Math.max(
          Number(stiffener.topSize) || 0,
          Number(stiffener.bottomSize) || 0,
          Number(stiffener.bottomRadius) || 0,
        ),
    ),
  );
  const padding = Math.max(24, maxDepth * 0.3);

  return {
    bounds: createProjectionBounds(primitives, padding),
    primitives,
    summary: `MAIN T ${mainThickness} · ${padEye.cheekPlates.length} CHEEKS · ${padEye.stiffeners.length} STIFFENERS · HOLE D ${mainPlate.holeDiameter} ${padEye.units}`,
  };
}
