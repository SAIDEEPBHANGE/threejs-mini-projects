// src/dimensions/draw/padEyeDimensions.js
import * as THREE from "three";
import { calculatePadEyeDimensionLayout } from "../calculations/padEyeDimensionLayout.js";
import { addDimensionLabel, addDimensionLine } from "./dimensionPrimitives.js";

function drawDimension(group, dimension) {
  addDimensionLine(group, [dimension.start, dimension.end]);
  const tick = dimension.size * 0.22;
  [dimension.start, dimension.end].forEach((point) => {
    const before = [...point];
    const after = [...point];
    const axisIndex = dimension.tickAxis === "x" ? 0 : 1;
    before[axisIndex] -= tick;
    after[axisIndex] += tick;
    addDimensionLine(group, [before, after]);
  });
  addDimensionLabel(
    group,
    dimension.label,
    dimension.labelPosition,
    dimension.size,
  );
}

export function createPadEyeDimensionDrawing(padEye) {
  const group = new THREE.Group();
  const layout = calculatePadEyeDimensionLayout(padEye);
  layout.dimensions.forEach((dimension) => drawDimension(group, dimension));
  layout.labels.forEach(({ text, position, size }) => {
    addDimensionLabel(group, text, position, size);
  });
  return group;
}
