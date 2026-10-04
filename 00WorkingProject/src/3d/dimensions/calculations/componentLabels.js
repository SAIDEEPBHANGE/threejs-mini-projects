// src/3d/dimensions/calculations/componentLabels.js
import { calculateStiffenerPlacement } from "../../geometry/calculations/stiffenerPlacement.js";

function createStiffenerLabel(stiffener, padEye) {
  const { height } = calculateStiffenerPlacement(padEye, stiffener);
  const sizeDetails =
    stiffener.type === "curved"
      ? `TOP ${stiffener.topSize} | R ${stiffener.bottomRadius}`
      : `TOP ${stiffener.topSize} | BOT ${stiffener.bottomSize}`;

  return `${stiffener.id} | ${stiffener.type.toUpperCase()}\nOFF ${stiffener.offset} | T ${stiffener.thickness} ${padEye.units}\n${sizeDetails} | H ${height.toFixed(1)}`;
}

export function calculateComponentLabels(
  padEye,
  size,
  topY,
  frontZ,
  leftWidth,
  rightWidth,
) {
  const columns = { left: [], right: [] };
  padEye.cheekPlates.forEach((plate, index) => {
    const column = index % 2 === 0 ? "left" : "right";
    columns[column].push(
      `${plate.id}\nR ${plate.radius} | T ${plate.thickness} ${padEye.units}`,
    );
  });

  padEye.stiffeners.forEach((stiffener) => {
    const column =
      stiffener.position === "left"
        ? "left"
        : stiffener.position === "right"
          ? "right"
          : columns.left.length <= columns.right.length
            ? "left"
            : "right";
    columns[column].push(createStiffenerLabel(stiffener, padEye));
  });

  return ["left", "right"].flatMap((column) => {
    const x = column === "left" ? -leftWidth - size * 8 : rightWidth + size * 8;
    return columns[column].map((text, index) => ({
      text,
      position: [x, topY - size * (1.8 + index * 2.7), frontZ],
      size: size * 0.75,
    }));
  });
}
