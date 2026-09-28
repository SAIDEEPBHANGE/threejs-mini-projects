// src/dimensions/calculations/mainPlateDimensionCallouts.js
function createDimension(start, end, label, labelPosition, size, tickAxis) {
  return { start, end, label, labelPosition, size, tickAxis };
}

export function calculateMainPlateDimensionCallouts(
  padEye,
  {
    leftWidth,
    rightWidth,
    plateHeight,
    radius,
    holeRadius,
    mainThickness,
    size,
    frontZ,
  },
) {
  const maxWidth = Math.max(leftWidth, rightWidth);
  const topY = plateHeight + radius;
  const point = (x, y, z = frontZ) => [x, y, z];

  return [
    createDimension(
      point(-leftWidth, -size * 2),
      point(0, -size * 2),
      `LW ${leftWidth} ${padEye.units}`,
      point(-leftWidth / 2, -size * 3.3),
      size,
      "y",
    ),
    createDimension(
      point(0, -size * 2),
      point(rightWidth, -size * 2),
      `RW ${rightWidth} ${padEye.units}`,
      point(rightWidth / 2, -size * 3.3),
      size,
      "y",
    ),
    createDimension(
      point(maxWidth + size * 2, 0),
      point(maxWidth + size * 2, plateHeight),
      `H ${plateHeight} ${padEye.units}`,
      point(maxWidth + size * 5, plateHeight / 2),
      size,
      "x",
    ),
    createDimension(
      point(0, plateHeight),
      point(0, topY),
      `R ${radius} ${padEye.units}`,
      point(size * 3, plateHeight + radius / 2),
      size,
      "x",
    ),
    createDimension(
      point(holeRadius + size, plateHeight - holeRadius),
      point(holeRadius + size, plateHeight + holeRadius),
      `D ${holeRadius * 2} ${padEye.units}`,
      point(holeRadius + size * 4, plateHeight),
      size,
      "x",
    ),
    createDimension(
      [rightWidth + size * 3, size, -mainThickness / 2],
      [rightWidth + size * 3, size, mainThickness / 2],
      `T ${mainThickness} ${padEye.units}`,
      point(rightWidth + size * 6, size * 2),
      size,
      "y",
    ),
  ];
}
