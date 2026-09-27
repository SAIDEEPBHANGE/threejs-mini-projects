function createStiffenerLabel(stiffener, mainPlate, units) {
  const leftWidth = Number(mainPlate.leftWidth) || 0;
  const rightWidth = Number(mainPlate.rightWidth) || 0;
  const baseWidth =
    stiffener.position === "left"
      ? leftWidth
      : stiffener.position === "right"
        ? rightWidth
        : null;
  const atBase =
    baseWidth !== null &&
    Math.abs(Number(stiffener.offset) - baseWidth) <=
      (Number(stiffener.thickness) || 0) / 2;
  const height = atBase ? `${Number(stiffener.height) || 0}` : "auto";
  const sizeDetails =
    stiffener.type === "curved"
      ? `TOP ${stiffener.topSize} | R ${stiffener.bottomRadius}`
      : `TOP ${stiffener.topSize} | BOT ${stiffener.bottomSize}`;

  return `${stiffener.id} | ${stiffener.type.toUpperCase()}\nOFF ${stiffener.offset} | T ${stiffener.thickness} ${units}\n${sizeDetails} | H ${height}`;
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
    columns[column].push(
      createStiffenerLabel(stiffener, padEye.mainPlate, padEye.units),
    );
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
