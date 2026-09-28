// src/dimensions/draw/dimensionPrimitives.js
import * as THREE from "three";

export function addDimensionLine(group, points) {
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((point) => new THREE.Vector3(...point)),
  );
  const material = new THREE.LineBasicMaterial({
    color: 0xb42318,
    depthTest: false,
    transparent: true,
  });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 10;
  group.add(line);
}

export function addDimensionLabel(group, text, position, size) {
  const lines = text.split("\n");
  const canvas = document.createElement("canvas");
  const longestLine = Math.max(...lines.map((line) => line.length));
  canvas.width = Math.min(720, Math.max(360, longestLine * 21 + 48));
  canvas.height = 32 + lines.length * 52;
  const context = canvas.getContext("2d");
  context.fillStyle = "rgba(255, 255, 0, 1)";
  context.beginPath();
  context.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 14);
  context.fill();
  context.strokeStyle = "#ff0000";
  context.lineWidth = 5;
  context.stroke();
  context.fillStyle = "#ff0000";
  context.font = "bold 32px 'Segoe UI', sans-serif";
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
  sprite.position.set(...position);
  const worldHeight = size * 0.72 * lines.length;
  sprite.scale.set(
    worldHeight * (canvas.width / canvas.height),
    worldHeight,
    1,
  );
  sprite.renderOrder = 11;
  group.add(sprite);
}
