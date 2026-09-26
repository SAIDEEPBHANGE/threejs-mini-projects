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

function getMainPlateTangents(mainPlate) {
  const plateHeight = Number(mainPlate.height) || 0;
  const radius = Number(mainPlate.outerRadius) || 0;

  return {
    left: getTangentPoint(
      -(Number(mainPlate.leftWidth) || 0),
      0,
      0,
      plateHeight,
      radius,
      -1,
    ),
    right: getTangentPoint(
      Number(mainPlate.rightWidth) || 0,
      0,
      0,
      plateHeight,
      radius,
      1,
    ),
  };
}

function getMainPlateHeightAtX(mainPlate, x) {
  const plateHeight = Number(mainPlate.height) || 0;
  const leftWidth = Number(mainPlate.leftWidth) || 0;
  const rightWidth = Number(mainPlate.rightWidth) || 0;
  const radius = Number(mainPlate.outerRadius) || 0;
  const { left: leftTangent, right: rightTangent } =
    getMainPlateTangents(mainPlate);

  if (x < leftTangent.x) {
    if (x < -leftWidth || leftTangent.x === -leftWidth) return 0;
    return ((x + leftWidth) / (leftTangent.x + leftWidth)) * leftTangent.y;
  }

  if (x > rightTangent.x) {
    if (x > rightWidth || rightWidth === rightTangent.x) return 0;
    return ((rightWidth - x) / (rightWidth - rightTangent.x)) * rightTangent.y;
  }

  return plateHeight + Math.sqrt(Math.max(0, radius ** 2 - x ** 2));
}

function clipProfileAtHeight(points, height, keepAbove) {
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

function createShapeFromPoints(points) {
  if (points.length < 3) return null;

  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
  shape.closePath();
  return shape;
}

export function createMainPlateGeometry(mainPlate) {
  const shape = new THREE.Shape();
  const leftWidth = Number(mainPlate.leftWidth) || 0;
  const rightWidth = Number(mainPlate.rightWidth) || 0;
  const radius = Number(mainPlate.outerRadius) || 0;
  const plateHeight = Number(mainPlate.height) || radius || 60;
  const holeRadius = (Number(mainPlate.holeDiameter) || 0) / 2;
  const { left: leftTangent, right: rightTangent } =
    getMainPlateTangents(mainPlate);
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
    const topSize = Math.max(0, Number(stiffener.topSize) || 0);
    const bottomSize = Math.max(0, Number(stiffener.bottomSize) || 0);
    const thickness = Math.max(0, Number(stiffener.thickness) || 0);
    const halfThickness = thickness / 2;
    const height = Math.max(
      0,
      Math.min(
        getMainPlateHeightAtX(padEye.mainPlate, positionX - halfThickness),
        getMainPlateHeightAtX(padEye.mainPlate, positionX + halfThickness),
      ),
    );
    const shape = new THREE.Shape();

    shape.moveTo(0, 0);

    if (stiffener.type === "curved") {
      const radius = Math.max(0, Number(stiffener.bottomRadius) || 0);
      if (radius > 0) {
        shape.absarc(0, -radius, radius, Math.PI / 2, 0, true);
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

    let profiles = [shape];
    const holeRadius = (Number(padEye.mainPlate.holeDiameter) || 0) / 2;
    const closestXToHole = Math.max(0, Math.abs(positionX) - thickness / 2);
    if (holeRadius > closestXToHole) {
      const clearanceHalfHeight = Math.sqrt(
        holeRadius ** 2 - closestXToHole ** 2,
      );
      const holeCenterY = Number(padEye.mainPlate.height) || 0;
      const points = shape.extractPoints(24).shape;
      profiles = [
        createShapeFromPoints(
          clipProfileAtHeight(points, holeCenterY - clearanceHalfHeight, false),
        ),
        createShapeFromPoints(
          clipProfileAtHeight(points, holeCenterY + clearanceHalfHeight, true),
        ),
      ].filter(Boolean);
    }

    const mainThickness = Number(padEye.mainPlate.thickness) || 10;
    profiles.forEach((profile) => {
      [-1, 1].forEach((face) => {
        const geometry = new THREE.ExtrudeGeometry(profile, {
          depth: thickness,
          bevelEnabled: false,
        });
        geometry.translate(0, 0, -thickness / 2);

        const mesh = new THREE.Mesh(geometry, stiffenerMaterial);
        mesh.rotation.y = face > 0 ? -Math.PI / 2 : Math.PI / 2;
        mesh.position.set(positionX, 0, (face * mainThickness) / 2);
        group.add(mesh);
      });
    });
  });

  return group;
}
