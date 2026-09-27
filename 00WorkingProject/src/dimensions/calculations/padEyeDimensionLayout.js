import { calculateComponentLabels } from "./componentLabels.js";
import { calculateMainPlateDimensionCallouts } from "./mainPlateDimensionCallouts.js";

export function calculatePadEyeDimensionLayout(padEye) {
  const { mainPlate } = padEye;
  const leftWidth = Number(mainPlate.leftWidth) || 0;
  const rightWidth = Number(mainPlate.rightWidth) || 0;
  const plateHeight = Number(mainPlate.height) || 0;
  const radius = Number(mainPlate.outerRadius) || 0;
  const holeRadius = (Number(mainPlate.holeDiameter) || 0) / 2;
  const mainThickness = Number(mainPlate.thickness) || 10;
  const maxWidth = Math.max(leftWidth, rightWidth);
  const topY = plateHeight + radius;
  const size = Math.max(8, (maxWidth * 2 + topY) * 0.018);
  const positiveCheekThickness = padEye.cheekPlates
    .filter((_, index) => index % 2 === 0)
    .reduce((total, plate) => total + (Number(plate.thickness) || 10), 0);
  const frontZ = mainThickness / 2 + positiveCheekThickness + size * 0.4;

  const metrics = {
    leftWidth,
    rightWidth,
    plateHeight,
    radius,
    holeRadius,
    mainThickness,
    size,
    frontZ,
  };
  return {
    dimensions: calculateMainPlateDimensionCallouts(padEye, metrics),
    labels: calculateComponentLabels(
      padEye,
      size,
      topY,
      frontZ,
      leftWidth,
      rightWidth,
    ),
  };
}
