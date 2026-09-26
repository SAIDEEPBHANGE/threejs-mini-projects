# Pad Eye Design Project

## Tech Stack

- React JS
- Tailwind CSS
- Three.js / React Three Fiber

## UI Layout

- **Two-column responsive layout**
  - **Left panel:**
    - Three.js 3D canvas
    - Dynamic pad eye model preview
    - Orbit controls
    - Auto-fit camera / bounding box utility
  - **Right panel:**
    - Scrollable engineering dimension form
    - Main plate configuration
    - Cheek plate configuration (0–2 items)
    - Dynamic stiffener configuration (field array: add, edit, duplicate, remove)
- Form updates feed the single source of truth and update the Three.js model in real time.
- The form panel is vertically scrollable for longer engineering configurations.
- Main plate and cheek plate faces remain aligned and perpendicular to the design plane for consistent modeling.

---

## Pad Eye Dimension Form

### General

| Input      | Description                                 |
| :--------- | :------------------------------------------ |
| Pad Eye ID | Unique identification name or reference tag |

### Main Plate

| Input                         | Description                             |
| :---------------------------- | :-------------------------------------- |
| Main Plate Thickness ($t$)    | Total plate thickness                   |
| Main Plate Height ($h$)       | Full plate height from base to top      |
| Main Plate Left Width ($lw$)  | Distance from center axis to left edge  |
| Main Plate Right Width ($rw$) | Distance from center axis to right edge |
| Main Plate Outer Radius ($R$) | Upper profile radius                    |
| Hole Diameter ($D$)           | Pin/shackle hole clearance diameter     |

### Cheek Plates

| Input                         | Description                               |
| :---------------------------- | :---------------------------------------- |
| Cheek Plate Quantity          | Allowed range: 0 to 2                     |
| Cheek Plate Radius ($R_c$)    | Outer radius of reinforcement cheek plate |
| Cheek Plate Thickness ($t_c$) | Plate thickness per cheek plate           |

### Stiffeners

| Input                           | Description                          |
| :------------------------------ | :----------------------------------- |
| Stiffener Quantity              | Dynamic array (no hard limit)        |
| Stiffener Type                  | `flat`, `angled`, or `curved`        |
| Stiffener Position              | `center`, `left`, or `right`         |
| Stiffener Thickness ($t_s$)     | Thickness of the stiffener plate     |
| Stiffener Position Offset       | Lateral offset from center axis      |
| Top Stiffener Size              | Top edge dimension                   |
| Bottom Stiffener Size           | Base edge dimension                  |
| Bottom Stiffener Radius ($R_s$) | Corner fillet/radius on base section |

---

## Data Model (Single Source of Truth)

The engineering object holds raw user inputs. Stiffeners are stored as fully self-contained objects to allow standard dynamic field array handling (`useFieldArray`).

```json
{
  "padEye": {
    "id": "PE-001",
    "units": "mm",
    "mainPlate": {
      "thickness": 20,
      "leftWidth": 100,
      "rightWidth": 100,
      "outerRadius": 150,
      "holeDiameter": 60
    },
    "cheekPlates": [
      {
        "id": "CP-01",
        "radius": 100,
        "thickness": 10
      },
      {
        "id": "CP-02",
        "radius": 100,
        "thickness": 10
      }
    ],
    "stiffeners": [
      {
        "id": "ST-01",
        "type": "flat",
        "position": "left",
        "thickness": 10,
        "offset": 40,
        "topSize": 80,
        "bottomSize": 100,
        "bottomRadius": 0
      },
      {
        "id": "ST-02",
        "type": "curved",
        "position": "right",
        "thickness": 12,
        "offset": 40,
        "topSize": 80,
        "bottomSize": 100,
        "bottomRadius": 50
      }
    ]
  }
}
```

---

## Data Flow & Architecture

```text
Engineering Form State (Single Source of Truth)
                    │
                    ▼
       Geometry Transformation Utility
       (calculatePadEyeDrawSpec)
                    │
                    ▼
        Render Manifest JSON (Draw Spec)
                    │
                    ▼
Three.js Meshes (Extrusions, Cylinders, Transforms)
                    │
                    ▼
             3D Viewport / Canvas

```

---

## Three.js Render Manifest JSON (`padEyeDrawSpec.json`)

This derived representation translates engineering parameters into explicit geometric paths, extrusions, matrix transformations, and bounding dimensions for consumption by Three.js or React Three Fiber.

```json
{
  "units": "mm",
  "meta": {
    "padEyeId": "PE-001",
    "boundingBox": {
      "width": 200,
      "height": 270,
      "depth": 60
    }
  },
  "meshes": [
    {
      "name": "mainPlate",
      "geometryType": "ExtrudeGeometry",
      "material": "steelMatte",
      "transform": {
        "position": [0, 0, -10],
        "rotation": [0, 0, 0]
      },
      "shapeDefinition": {
        "path": [
          { "type": "moveTo", "x": -100, "y": 0 },
          { "type": "lineTo", "x": -100, "y": 120 },
          {
            "type": "absarc",
            "x": 0,
            "y": 120,
            "radius": 150,
            "startAngle": 3.14159,
            "endAngle": 0,
            "clockwise": true
          },
          { "type": "lineTo", "x": 100, "y": 0 },
          { "type": "closePath" }
        ],
        "holes": [
          {
            "type": "absarc",
            "x": 0,
            "y": 120,
            "radius": 30,
            "startAngle": 0,
            "endAngle": 6.28318,
            "clockwise": false
          }
        ]
      },
      "extrudeSettings": {
        "depth": 20,
        "bevelEnabled": true,
        "bevelSegments": 2,
        "steps": 1,
        "bevelSize": 1,
        "bevelThickness": 1
      }
    },
    {
      "name": "cheekPlate_CP-01",
      "geometryType": "CylinderGeometry",
      "material": "steelBrushed",
      "transform": {
        "position": [0, 120, 15],
        "rotation": [1.5708, 0, 0]
      },
      "parameters": {
        "radiusTop": 100,
        "radiusBottom": 100,
        "height": 10,
        "radialSegments": 48,
        "innerHoleRadius": 30
      }
    },
    {
      "name": "cheekPlate_CP-02",
      "geometryType": "CylinderGeometry",
      "material": "steelBrushed",
      "transform": {
        "position": [0, 120, -15],
        "rotation": [1.5708, 0, 0]
      },
      "parameters": {
        "radiusTop": 100,
        "radiusBottom": 100,
        "height": 10,
        "radialSegments": 48,
        "innerHoleRadius": 30
      }
    },
    {
      "name": "stiffener_ST-01",
      "geometryType": "ExtrudeGeometry",
      "material": "steelMatte",
      "transform": {
        "position": [-40, 0, 10],
        "rotation": [0, 1.5708, 0]
      },
      "shapeDefinition": {
        "path": [
          { "type": "moveTo", "x": 0, "y": 0 },
          { "type": "lineTo", "x": 100, "y": 0 },
          { "type": "lineTo", "x": 80, "y": 80 },
          { "type": "lineTo", "x": 0, "y": 80 },
          { "type": "closePath" }
        ],
        "holes": []
      },
      "extrudeSettings": {
        "depth": 10,
        "bevelEnabled": false
      }
    }
  ]
}
```
