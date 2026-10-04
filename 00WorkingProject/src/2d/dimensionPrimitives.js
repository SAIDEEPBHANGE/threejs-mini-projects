// src/2d/dimensionPrimitives.js
export function createDimensionLine(start, end, color) {
  return {
    type: "line",
    points: [start, end],
    closed: false,
    fill: "none",
    stroke: color,
    strokeWidth: 1.25,
  };
}

export function createDimensionLabel(text, position, color, anchor = "middle") {
  return {
    type: "text",
    text,
    position,
    points: [position],
    color,
    anchor,
    fontSize: 13,
  };
}

export function createLinearDimension(start, end, label, options) {
  const { color, unit, vertical = false, labelSide = 1 } = options;
  const tickSize = unit * 0.2;
  const tickStart = vertical ? [-tickSize, 0] : [0, -tickSize];
  const tickEnd = vertical ? [tickSize, 0] : [0, tickSize];
  const middle = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  const labelPosition = vertical
    ? [middle[0] + labelSide * unit * 0.6, middle[1]]
    : [middle[0], middle[1] - labelSide * unit * 0.7];

  return [
    createDimensionLine(start, end, color),
    createDimensionLine(
      [start[0] + tickStart[0], start[1] + tickStart[1]],
      [start[0] + tickEnd[0], start[1] + tickEnd[1]],
      color,
    ),
    createDimensionLine(
      [end[0] + tickStart[0], end[1] + tickStart[1]],
      [end[0] + tickEnd[0], end[1] + tickEnd[1]],
      color,
    ),
    createDimensionLabel(label, labelPosition, color),
  ];
}
