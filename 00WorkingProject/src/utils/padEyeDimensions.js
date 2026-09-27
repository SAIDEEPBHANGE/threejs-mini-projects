import * as THREE from "three";

function addLine(group, points) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xb42318,
    depthTest: false,
    transparent: true,
  });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 10;
  group.add(line);
}

function addLabel(group, text, position, size) {
  const lines = text.split("\n");
  const canvas = document.createElement("canvas");
  const longestLine = Math.max(...lines.map((line) => line.length));
  canvas.width = Math.min(720, Math.max(360, longestLine * 21 + 48));
  canvas.height = 32 + lines.length * 52;
  const context = canvas.getContext("2d");
  context.fillStyle = "rgba(255, 255, 255, 0.92)";
  context.beginPath();
  context.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 14);
  context.fill();
  context.strokeStyle = "#b42318";
  context.lineWidth = 5;
  context.stroke();
  context.fillStyle = "#7f1d1d";
  context.font = "600 32px Segoe UI, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const lineHeight = 44;
  const firstLineY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, firstLineY + index * lineHeight);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  const worldHeight = size * 0.72 * lines.length;
  sprite.scale.set(
    worldHeight * (canvas.width / canvas.height),
    worldHeight,
    1,
  );
  sprite.renderOrder = 11;
  group.add(sprite);
}

function addDimension(group, start, end, label, labelPosition, size, tickAxis) {
  addLine(group, [start, end]);
  const tick = size * 0.22;
  [start, end].forEach((point) => {
    const before = point.clone();
    const after = point.clone();
    before[tickAxis] -= tick;
    after[tickAxis] += tick;
    addLine(group, [before, after]);
  });
  addLabel(group, label, labelPosition, size);
}

export function createPadEyeDimensions(padEye) {
  const group = new THREE.Group();
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
  const point = (x, y, z = frontZ) => new THREE.Vector3(x, y, z);

  addDimension(
    group,
    point(-leftWidth, -size * 2),
    point(0, -size * 2),
    `LW ${leftWidth}`,
    point(-leftWidth / 2, -size * 3.3),
    size,
    "y",
  );
  addDimension(
    group,
    point(0, -size * 2),
    point(rightWidth, -size * 2),
    `RW ${rightWidth}`,
    point(rightWidth / 2, -size * 3.3),
    size,
    "y",
  );
  addDimension(
    group,
    point(maxWidth + size * 2, 0),
    point(maxWidth + size * 2, plateHeight),
    `H ${plateHeight} ${padEye.units}`,
    point(maxWidth + size * 5, plateHeight / 2),
    size,
    "x",
  );
  addDimension(
    group,
    point(0, plateHeight),
    point(0, topY),
    `R ${radius}`,
    point(size * 3, plateHeight + radius / 2),
    size,
    "x",
  );
  addDimension(
    group,
    point(holeRadius + size, plateHeight - holeRadius),
    point(holeRadius + size, plateHeight + holeRadius),
    `D ${holeRadius * 2}`,
    point(holeRadius + size * 4, plateHeight),
    size,
    "x",
  );
  addDimension(
    group,
    new THREE.Vector3(rightWidth + size * 3, size, -mainThickness / 2),
    new THREE.Vector3(rightWidth + size * 3, size, mainThickness / 2),
    `T ${mainThickness}`,
    point(rightWidth + size * 6, size * 2),
    size,
    "y",
  );

  const detailColumns = { left: [], right: [] };
  padEye.cheekPlates.forEach((plate, index) => {
    const column = index % 2 === 0 ? "left" : "right";
    detailColumns[column].push(
      `${plate.id}\nR ${plate.radius}  |  T ${plate.thickness} ${padEye.units}`,
    );
  });

  padEye.stiffeners.forEach((stiffener) => {
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
        ? `TOP ${stiffener.topSize}  |  R ${stiffener.bottomRadius}`
        : `TOP ${stiffener.topSize}  |  BOT ${stiffener.bottomSize}`;
    const details = `${stiffener.id}  |  ${stiffener.type.toUpperCase()}\nOFF ${stiffener.offset}  |  T ${stiffener.thickness}\n${sizeDetails}  |  H ${height}`;
    const column =
      stiffener.position === "left"
        ? "left"
        : stiffener.position === "right"
          ? "right"
          : detailColumns.left.length <= detailColumns.right.length
            ? "left"
            : "right";
    detailColumns[column].push(details);
  });

  ["left", "right"].forEach((column) => {
    const x = column === "left" ? -leftWidth - size * 8 : rightWidth + size * 8;
    detailColumns[column].forEach((detail, index) => {
      addLabel(
        group,
        detail,
        point(x, topY - size * (1.8 + index * 2.7)),
        size * 0.75,
      );
    });
  });

  return group;
}
