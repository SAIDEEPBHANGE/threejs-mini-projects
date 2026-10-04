// src/2d/sideDimensions.js
import { createLinearDimension } from "./dimensionPrimitives.js";

export function createSideDimensions(padEye, color) {
  const mainThickness = Number(padEye.mainPlate.thickness) || 10;
  const mainHeight = Number(padEye.mainPlate.height) || 0;
  const unit = Math.max(8, mainThickness * 0.55);
  const negativeCheeks = padEye.cheekPlates
    .filter((_, index) => index % 2 === 1)
    .reduce((total, plate) => total + (Number(plate.thickness) || 10), 0);
  const positiveCheeks = padEye.cheekPlates
    .filter((_, index) => index % 2 === 0)
    .reduce((total, plate) => total + (Number(plate.thickness) || 10), 0);
  const stiffenerDepth = Math.max(
    0,
    ...padEye.stiffeners.map((stiffener) =>
      Math.max(
        Number(stiffener.topSize) || 0,
        Number(stiffener.bottomSize) || 0,
        Number(stiffener.bottomRadius) || 0,
      ),
    ),
  );
  const bottomY = -unit * 2;
  const heightX =
    -Math.max(mainThickness, positiveCheeks, negativeCheeks, stiffenerDepth) -
    unit * 2;

  return [
    ...createLinearDimension(
      [heightX, 0],
      [heightX, mainHeight],
      `H ${mainHeight} ${padEye.units}`,
      { color, unit, vertical: true, labelSide: -1 },
    ),
    ...createLinearDimension(
      [-mainThickness / 2, bottomY],
      [mainThickness / 2, bottomY],
      `MAIN T ${mainThickness} ${padEye.units}`,
      { color, unit },
    ),
    ...(negativeCheeks > 0
      ? createLinearDimension(
          [-mainThickness / 2 - negativeCheeks, bottomY - unit * 1.6],
          [-mainThickness / 2, bottomY - unit * 1.6],
          `CHEEK -Z ${negativeCheeks}`,
          { color, unit },
        )
      : []),
    ...(positiveCheeks > 0
      ? createLinearDimension(
          [mainThickness / 2, bottomY - unit * 1.6],
          [mainThickness / 2 + positiveCheeks, bottomY - unit * 1.6],
          `CHEEK +Z ${positiveCheeks}`,
          { color, unit },
        )
      : []),
    ...(stiffenerDepth > 0
      ? createLinearDimension(
          [mainThickness / 2, bottomY - unit * 3.2],
          [mainThickness / 2 + stiffenerDepth, bottomY - unit * 3.2],
          `STIFFENER DEPTH ${stiffenerDepth}`,
          { color, unit },
        )
      : []),
  ];
}
