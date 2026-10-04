<!-- README.md -->

# Pad Eye Design Tool

A browser-based engineering configurator for building a pad-eye plate assembly and inspecting its dimensions in a live Three.js viewport.

## Technology

- React 19 and Vite
- Three.js with `OrbitControls` (direct Three.js; not React Three Fiber)
- Tailwind CSS 4

## Run Locally

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run build
```

## Features

- Responsive layout with a scrollable engineering form and interactive 3D preview.
- Switch between an interactive Three.js 3D canvas and SVG 2D orthographic projections.
- In 2D mode, select a front view (plate profile) or side view (thickness and plate stacking).
- Live model updates as form values change.
- Orbit controls, automatic camera fit, and a model-scaled zoom-out limit.
- Light/dark theme toggle; the selection is stored in local storage.
- Viewport backgrounds use `#f4f7fa` in light theme and `#141920` in dark theme.
- 3D callouts for main-plate dimensions and cheek/stiffener values.
- Main plate has tangent side connections to its circular upper profile and a centered pin hole.
- Cheek plates share the main hole center. Up to four can be configured, stacked two per face.
- Stiffeners support flat, angled, and curved profiles. They are placed on both main-plate faces, derive height from the plate outline, and are split around the hole when needed.
- Endpoint stiffeners can define a base height; the main-plate base and tangent-to-arc outline extend to match.

## Engineering Inputs

| Section        | Inputs and behavior                                                                                                                                                        |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| General        | Pad-eye ID and units. The supplied defaults use millimeters.                                                                                                               |
| Main plate     | Thickness, arc-center height, left/right base widths, outer radius, and hole diameter. The hole center is at the arc center. The uppermost point is at height plus radius. |
| Cheek plates   | Zero to four plates total, distributed two per face. Each plate has an outer radius and thickness; its inner hole matches the main-plate hole.                             |
| Stiffeners     | Unlimited dynamic list with type, side/center position, offset, thickness, and top size. Flat and angled profiles also use bottom size; curved profiles use bottom radius. |
| Base stiffener | When a left/right stiffener reaches the corresponding main-plate base edge, a Base Height input is shown and the main-plate side extends to that height.                   |

## Project Structure

```text
src/
  components/       React form and reusable fields
  2d/               SVG front/side projection calculations and renderer
  3d/               Three.js canvas, model assembly, geometry, and dimensions
    geometry/
      calculations/ Tangents, profiles, placement, and hole clipping
      draw/         Main plate, cheek plate, and stiffener mesh construction
    dimensions/
      calculations/ Dimension callout layout and component labels
      draw/         Three.js lines, label sprites, and dimension drawing
  data/             Default pad-eye JSON
  hooks/             Pad-eye form state and update operations
```

## Function Flow

```mermaid
flowchart TD
    User[User edits form or theme] --> Form[PadEyeForm / App]
    Form --> State[usePadEyeState]
    State -->|updated padEye| App[App]
    App --> Mode{View mode}
    Mode -->|3D| Canvas[3D / PadEyeCanvas]
    Mode -->|2D| Projection[2D / PadEye2DCanvas]
    Projection --> View{Projection}
    View -->|Front| Front[XY front profile SVG]
    View -->|Side| Side[ZY side profile SVG]
    App --> Form
    Canvas -->|padEye| Builder[buildPadEyeModel]
    Builder --> Main[createMainPlateGeometry]
    Main --> Profile[mainPlateProfile and tangent calculations]
    Builder --> Cheek[createCheekPlateMesh]
    Builder --> Rib[createStiffenerMeshes]
    Rib --> Place[calculateStiffenerPlacement]
    Rib --> Shape[createStiffenerProfile]
    Rib --> Hole[splitProfileAroundHole]
    Builder --> Layout[calculatePadEyeDimensionLayout]
    Layout --> Callouts[calculateMainPlateDimensionCallouts]
    Layout --> Labels[calculateComponentLabels]
    Callouts --> DimensionDraw[createPadEyeDimensionDrawing]
    Labels --> DimensionDraw
    Main --> Model[Three.js meshes and dimension annotations]
    Cheek --> Model
    Hole --> Model
    DimensionDraw --> Model
    Model --> Scene[Three.js scene, camera, and OrbitControls]
    Scene --> Renderer[WebGLRenderer]
    Projection --> SharedCalc[Shared 3D geometry calculations]
```

## State and Geometry

`src/data/Tests/01defaultPadEye.json` provides the initial engineering values. `usePadEyeState` owns the editable pad-eye object and immutable update operations. The selected canvas rebuilds its 3D model or 2D projection from that state.

Geometry calculations are kept separate from mesh drawing. Dimension layout calculations are likewise separate from the code that draws Three.js lines and text sprites. The project does not generate a separate render-manifest JSON file.
