import * as THREE from "three";

export function clipProfileAtHeight(points, height, keepAbove) {
  const clipped = [];
  const isInside = (point) =>
    keepAbove ? point.y >= height : point.y <= height;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const currentInside = isInside(current);
    const nextInside = isInside(next);

    if (currentInside) clipped.push(current);
    if (currentInside !== nextInside) {
      const ratio = (height - current.y) / (next.y - current.y);
      clipped.push(
        new THREE.Vector2(current.x + (next.x - current.x) * ratio, height),
      );
    }
  }

  return clipped;
}

export function createShapeFromPoints(points) {
  if (points.length < 3) return null;

  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
  shape.closePath();
  return shape;
}
