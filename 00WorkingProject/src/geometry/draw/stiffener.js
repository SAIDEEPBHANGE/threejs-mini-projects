// src/geometry/draw/stiffener.js
import * as THREE from "three";
import { splitProfileAroundHole } from "../calculations/splitProfileAroundHole.js";
import { createStiffenerProfile } from "../calculations/stiffenerProfile.js";
import { calculateStiffenerPlacement } from "../calculations/stiffenerPlacement.js";

export function createStiffenerMeshes(padEye, stiffener, material) {
  const { positionX, thickness, height } = calculateStiffenerPlacement(
    padEye,
    stiffener,
  );
  const profile = createStiffenerProfile(stiffener, height);
  const profiles = splitProfileAroundHole(
    profile,
    padEye,
    positionX,
    thickness,
  );
  const mainThickness = Number(padEye.mainPlate.thickness) || 10;

  return profiles.flatMap((shape) =>
    [-1, 1].map((face) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: false,
        curveSegments: 48,
      });
      geometry.translate(0, 0, -thickness / 2);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.y = face > 0 ? -Math.PI / 2 : Math.PI / 2;
      mesh.position.set(positionX, 0, (face * mainThickness) / 2);
      return mesh;
    }),
  );
}
