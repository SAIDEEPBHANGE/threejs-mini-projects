import * as THREE from "three";

function getTangentPoint(pointX, pointY, centerX, centerY, radius, side) {
  const offsetX = pointX - centerX;
  const offsetY = pointY - centerY;
  const distanceSquared = offsetX ** 2 + offsetY ** 2;
  const effectiveRadius = Math.min(
    radius,
    Math.sqrt(distanceSquared) * (1 - Number.EPSILON),
  );
  const tangentScale = effectiveRadius ** 2 / distanceSquared;
  const perpendicularScale =
    (side *
      effectiveRadius *
      Math.sqrt(distanceSquared - effectiveRadius ** 2)) /
    distanceSquared;

  return new THREE.Vector2(
    centerX + tangentScale * offsetX - perpendicularScale * offsetY,
    centerY + tangentScale * offsetY + perpendicularScale * offsetX,
  );
}

export function createMainPlateGeometry(mainPlate) {
  const shape = new THREE.Shape();
  const leftWidth = Number(mainPlate.leftWidth) || 0;
  const rightWidth = Number(mainPlate.rightWidth) || 0;
  const radius = Number(mainPlate.outerRadius) || 0;
  const plateHeight = Number(mainPlate.height) || radius || 60;
  const holeRadius = (Number(mainPlate.holeDiameter) || 0) / 2;
  const leftTangent = getTangentPoint(
    -leftWidth,
    0,
    0,
    plateHeight,
    radius,
    -1,
  );
  const rightTangent = getTangentPoint(
    rightWidth,
    0,
    0,
    plateHeight,
    radius,
    1,
  );
  const startAngle = Math.atan2(leftTangent.y - plateHeight, leftTangent.x);
  const endAngle = Math.atan2(rightTangent.y - plateHeight, rightTangent.x);

  shape.moveTo(-leftWidth, 0);
  shape.lineTo(leftTangent.x, leftTangent.y);
  shape.absarc(0, plateHeight, radius, startAngle, endAngle, true);
  shape.lineTo(rightWidth, 0);
  shape.closePath();

  const holePath = new THREE.Path();
  holePath.absellipse(
    0,
    plateHeight,
    holeRadius,
    holeRadius,
    0,
    Math.PI * 2,
    false,
    0,
  );
  shape.holes.push(holePath);

  const thickness = Number(mainPlate.thickness) || 10;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}

export function buildPadEyeModel(padEye) {
  const group = new THREE.Group();

  const mainPlateMaterial = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.4,
    roughness: 0.65,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.25,
    roughness: 0.7,
  });

  const stiffenerMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.2,
    roughness: 0.75,
  });

  const mainPlateMesh = new THREE.Mesh(
    createMainPlateGeometry(padEye.mainPlate),
    mainPlateMaterial,
  );
  group.add(mainPlateMesh);

  padEye.cheekPlates.forEach((plate, index) => {
    const cheekShape = new THREE.Shape();
    const outerRadius = Number(plate.radius) || 0;
    const innerRadius = (Number(padEye.mainPlate.holeDiameter) || 0) / 2;

    cheekShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, false);
    cheekShape.holes.push(holePath);

    const cheekThickness = Number(plate.thickness) || 10;
    const mainThickness = Number(padEye.mainPlate.thickness) || 10;
    const cheekGeometry = new THREE.ExtrudeGeometry(cheekShape, {
      depth: cheekThickness,
      bevelEnabled: false,
    });
    cheekGeometry.translate(0, 0, -cheekThickness / 2);

    const cheekPlate = new THREE.Mesh(cheekGeometry, accentMaterial);
    cheekPlate.position.set(
      0,
      Number(padEye.mainPlate.height) || 0,
      ((index === 0 ? 1 : -1) * (mainThickness + cheekThickness)) / 2,
    );
    group.add(cheekPlate);
  });

  padEye.stiffeners.forEach((stiffener) => {
    const offset = Number(stiffener.offset) || 0;
    const positionX =
      stiffener.position === "left"
        ? -offset
        : stiffener.position === "right"
          ? offset
          : 0;
    const baseY = Math.max(40, padEye.mainPlate.height * 0.34);

    let mesh;

    if (stiffener.type === "flat") {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          stiffener.topSize,
          stiffener.bottomSize,
          stiffener.thickness,
        ),
        stiffenerMaterial,
      );
      mesh.position.set(positionX, baseY, 0);
    } else if (stiffener.type === "angled") {
      const side = new THREE.Shape();
      side.moveTo(-stiffener.topSize / 2, 0);
      side.lineTo(stiffener.topSize / 2, 0);
      side.lineTo(stiffener.bottomSize / 2, stiffener.bottomSize * 0.8);
      side.lineTo(-stiffener.bottomSize / 2, stiffener.bottomSize * 0.8);
      side.closePath();
      const geometry = new THREE.ExtrudeGeometry(side, {
        depth: stiffener.thickness,
        bevelEnabled: false,
      });
      mesh = new THREE.Mesh(geometry, stiffenerMaterial);
      mesh.position.set(positionX, baseY - 18, 0);
    } else {
      const curvedShape = new THREE.Shape();
      const top = stiffener.topSize / 2;
      const bottom = stiffener.bottomSize / 2;
      curvedShape.moveTo(-top, 0);
      curvedShape.lineTo(top, 0);
      curvedShape.quadraticCurveTo(
        bottom,
        stiffener.bottomSize * 0.45,
        0,
        stiffener.bottomSize,
      );
      curvedShape.lineTo(-bottom, stiffener.bottomSize);
      curvedShape.closePath();
      const geometry = new THREE.ExtrudeGeometry(curvedShape, {
        depth: stiffener.thickness,
        bevelEnabled: false,
      });
      mesh = new THREE.Mesh(geometry, stiffenerMaterial);
      mesh.position.set(positionX, baseY - 18, 0);
    }

    group.add(mesh);
  });

  return group;
}
