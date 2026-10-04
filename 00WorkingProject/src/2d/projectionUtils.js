// src/2d/projectionUtils.js
import { getBaseExtensions } from "../3d/geometry/calculations/mainPlateProfile.js";
import { getMainPlateTangents } from "../3d/geometry/calculations/tangent.js";

export function createMainPlateOutline(padEye) {
  const { mainPlate, stiffeners } = padEye;
  const extensions = getBaseExtensions(mainPlate, stiffeners);
  const tangents = getMainPlateTangents(mainPlate, extensions);
  const radius = Number(mainPlate.outerRadius) || 0;
  const height = Number(mainPlate.height) || 0;
  const startAngle = Math.atan2(tangents.left.y - height, tangents.left.x);
  let endAngle = Math.atan2(tangents.right.y - height, tangents.right.x);
  if (endAngle > startAngle) endAngle -= Math.PI * 2;

  const arcPoints = Array.from({ length: 65 }, (_, index) => {
    const angle = startAngle + ((endAngle - startAngle) * index) / 64;
    return [Math.cos(angle) * radius, height + Math.sin(angle) * radius];
  });
  const points = [
    [-(Number(mainPlate.leftWidth) || 0), 0],
    ...(extensions.left > 0
      ? [[-(Number(mainPlate.leftWidth) || 0), extensions.left]]
      : []),
    [tangents.left.x, tangents.left.y],
    ...arcPoints.slice(1),
    [Number(mainPlate.rightWidth) || 0, extensions.right],
    ...(extensions.right > 0 ? [[Number(mainPlate.rightWidth) || 0, 0]] : []),
  ];

  return { points, extensions };
}

export function createCirclePoints(centerX, centerY, radius, segments = 64) {
  return Array.from({ length: segments }, (_, index) => {
    const angle = (index * Math.PI * 2) / segments;
    return [
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
    ];
  });
}

export function createProjectionBounds(primitives, padding) {
  const points = primitives.flatMap((primitive) => primitive.points ?? []);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}
