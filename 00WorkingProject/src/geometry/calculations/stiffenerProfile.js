import * as THREE from "three";
import { getTangentPoint } from "./tangent.js";

export function createStiffenerProfile(stiffener, height) {
  const topSize = Math.max(0, Number(stiffener.topSize) || 0);
  const bottomSize = Math.max(0, Number(stiffener.bottomSize) || 0);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);

  if (stiffener.type === "curved") {
    const radius = Math.max(0, Number(stiffener.bottomRadius) || 0);
    if (radius > 0) {
      const tangent = getTangentPoint(topSize, height, 0, -radius, radius, -1);
      const tangentAngle = Math.atan2(tangent.y + radius, tangent.x);
      shape.absarc(0, -radius, radius, Math.PI / 2, tangentAngle, true);
      shape.lineTo(topSize, height);
    } else {
      shape.lineTo(topSize, 0);
      shape.lineTo(topSize, height);
    }
  } else {
    shape.lineTo(bottomSize, 0);
    shape.lineTo(topSize, height);
  }

  shape.lineTo(0, height);
  shape.closePath();
  return shape;
}
