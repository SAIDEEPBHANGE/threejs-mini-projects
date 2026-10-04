// src/3d/dimensions/calculations/mainPlateDimensionCallouts.js
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
  const shoulderDimensions = [
    {
      width: leftWidth,
      height: Math.max(0, Number(padEye.mainPlate.leftShoulderHeight) || 0),
      side: "L",
      direction: -1,
    },
    {
      width: rightWidth,
      height: Math.max(0, Number(padEye.mainPlate.rightShoulderHeight) || 0),
      side: "R",
      direction: 1,
    },
  ]
    .filter(({ height }) => height > 0)
    .map(({ width, height, side, direction }) => {
      const x = direction * (width + size * 2);
      return createDimension(
        point(x, 0),
        point(x, height),
        `${side} SH ${height} ${padEye.units}`,
        point(x + direction * size * 2, height / 2),
        size,
        "x",
      );
    });

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
    ...shoulderDimensions,
  ];
}
