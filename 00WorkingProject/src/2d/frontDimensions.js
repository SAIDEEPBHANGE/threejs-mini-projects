// src/2d/frontDimensions.js
import { createLinearDimension } from "./dimensionPrimitives.js";
import { getBaseExtensions } from "../3d/geometry/calculations/mainPlateProfile.js";

export function createFrontDimensions(padEye, color) {
  const plate = padEye.mainPlate;
  const shoulderExtensions = getBaseExtensions(plate);
  const leftWidth = Number(plate.leftWidth) || 0;
  const rightWidth = Number(plate.rightWidth) || 0;
  const height = Number(plate.height) || 0;
  const radius = Number(plate.outerRadius) || 0;
  const holeRadius = (Number(plate.holeDiameter) || 0) / 2;
  const unit = Math.max(8, Math.max(leftWidth, rightWidth) * 2 * 0.018);
  const maxWidth = Math.max(leftWidth, rightWidth);
  const dimensions = [
    ...createLinearDimension(
      [-leftWidth, -unit * 1.4],
      [0, -unit * 1.4],
      `LW ${leftWidth}`,
      { color, unit },
    ),
    ...createLinearDimension(
      [0, -unit * 1.4],
      [rightWidth, -unit * 1.4],
      `RW ${rightWidth} ${padEye.units}`,
      { color, unit },
    ),
    ...createLinearDimension(
      [maxWidth + unit * 1.5, 0],
      [maxWidth + unit * 1.5, height],
      `H ${height}`,
      { color, unit, vertical: true },
    ),
    ...createLinearDimension(
      [-holeRadius, height + holeRadius + unit * 0.8],
      [holeRadius, height + holeRadius + unit * 0.8],
      `D ${holeRadius * 2} ${padEye.units}`,
      { color, unit },
    ),
    ...createLinearDimension([0, height], [0, height + radius], `R ${radius}`, {
      color,
      unit,
      vertical: true,
      labelSide: -1,
    }),
  ];

  if (shoulderExtensions.left > 0) {
    dimensions.push(
      ...createLinearDimension(
        [-leftWidth - unit, 0],
        [-leftWidth - unit, shoulderExtensions.left],
        `SH ${shoulderExtensions.left}`,
        { color, unit, vertical: true, labelSide: -1 },
      ),
    );
  }
  if (shoulderExtensions.right > 0) {
    dimensions.push(
      ...createLinearDimension(
        [rightWidth + unit, 0],
        [rightWidth + unit, shoulderExtensions.right],
        `SH ${shoulderExtensions.right}`,
        { color, unit, vertical: true },
      ),
    );
  }

  return dimensions;
}
