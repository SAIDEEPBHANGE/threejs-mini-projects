<!-- 00WorkingProject/AGENTS.md -->

# Pad-Eye Modeling Instructions

These instructions apply to `00WorkingProject`. Preserve the engineering behavior below when changing geometry, forms, dimensions, or the Three.js viewport. Read the owning calculation module before changing its corresponding draw module.

## Architecture

- `src/hooks/usePadEyeState.js` owns the editable pad-eye object and immutable form updates. Its current starter model is `src/data/Tests/01defaultPadEye.json`.
- `src/3d/geometry/calculations/` contains tangent, profile, placement, and clipping calculations. Keep Three.js mesh construction out of these modules where practical.
- `src/3d/geometry/draw/` converts calculated profiles to Three.js geometries and meshes.
- `src/3d/geometry/buildPadEyeModel.js` assembles the main plate, cheek plates, stiffeners, and dimension drawing.
- `src/3d/dimensions/calculations/` calculates dimension callouts and component-label positions. `src/3d/dimensions/draw/` renders their lines and label sprites.
- `src/3d/PadEyeCanvas.jsx` owns the Three.js scene, camera, lights, renderer, controls, axis view helper, animation loop, and GPU cleanup.
- `src/2d/` owns one SVG canvas containing simultaneous front and side orthographic projections, their dimension callouts, and dashed-dot center axes. Reuse geometry calculations from `src/3d/geometry/calculations/` instead of reimplementing tangent or stiffener-height rules.
- There is no render-manifest JSON layer and no configured test-runner script. Geometry is built directly from the current form-state object.

## Coordinate System

- The main plate's 2D profile is in the XY plane. X is width, Y is height, and Z is plate depth/thickness.
- `mainPlate.height` is the Y coordinate of the upper-circle center and the hole center, not the uppermost plate height. The unextended uppermost point is `height + outerRadius`.
- `mainPlate.leftShoulderHeight` and `mainPlate.rightShoulderHeight` are independent user inputs exposed by the Main Plate form. Both default to zero in starter/test data; missing or nonpositive values must behave as zero.
- A zero shoulder height keeps its base endpoint on `y = 0` (the ordinary pointy/tangent profile). A positive value raises only that side's endpoint vertically to `( -leftWidth, leftShoulderHeight )` or `( rightWidth, rightShoulderHeight )`, then draws a recomputed true tangent from that raised endpoint to the existing upper circle.
- Shoulder height does not change `mainPlate.height`, the upper-circle center, or the pin-hole center. Do not translate or resize the crown to implement a shoulder.
- Main-plate thickness is extruded symmetrically around `z = 0`.
- Cheek plates are circular XY profiles at the same hole center, extruded along Z and positioned outside the main plate.
- Stiffener profiles are drawn in a local width/height plane, extruded by stiffener thickness, rotated onto the main-plate faces, and attached at `z = +/- mainPlate.thickness / 2`.
- Keep dimensions in the pad-eye's declared units (the supplied fixtures use millimeters). Do not silently mix units or move the hole center when extending the plate base.

## Main-Plate Profile

The owning code is `src/3d/geometry/calculations/tangent.js`, `src/3d/geometry/calculations/mainPlateProfile.js`, and `src/3d/geometry/draw/mainPlate.js`.

- The two base endpoints are `(-leftWidth, leftExtension)` and `(rightWidth, rightExtension)`.
- Calculate a true tangent from each base endpoint to the circle centered at `(0, height)` with radius `outerRadius`. Connect each endpoint to its tangent point, then draw the circular arc between tangent points. Do not replace these tangent sides with vertical or arbitrary diagonal approximations.
- The pin hole is centered at `(0, height)` and has radius `holeDiameter / 2`.
- `getMainPlateHeightAtX` returns the tangent-line height outside the tangent points and the upper circle height `height + sqrt(radius^2 - x^2)` over the arc. Keep the tangent and arc profile consistent with `createMainPlateGeometry`.
- `getBaseExtensions` returns only the configured left/right shoulder heights. Endpoint stiffeners never extend the main plate.
- Do not add endpoint-only stiffener height overrides. Every stiffener, including one at a base endpoint, gets its height from `getMainPlateHeightAtX` at both X edges of its thickness and uses the lower result.
- When adding or renaming shoulder inputs, update the form, active model data, profile calculation, dimension callouts, and focused fixture together. The dimension callout should show a shoulder-height dimension only when that side's resulting configured shoulder height is positive.
- `src/data/Tests/11-shoulder-heights.json` covers unequal left/right shoulder values alongside endpoint stiffeners. Shoulder values alone define the base extensions, and both tangent lines must remain tangent to the original crown circle.

## Cheek Plates

The owning code is `src/3d/geometry/draw/cheekPlate.js`.

- Allow at most four cheek plates total, stacked as two on each face.
- Even cheek indices go on positive Z; odd indices go on negative Z. Stack each plate outside previously placed plates on its own face using actual thicknesses so they do not overlap.
- Center each cheek circle at `(0, mainPlate.height)` and cut its hole using the main-plate hole diameter.
- Preserve concentric hole alignment when changing cheek radius, thickness, or count.

## Stiffeners and Special Cases

The owning code is `src/3d/geometry/calculations/stiffenerPlacement.js`, `stiffenerProfile.js`, `splitProfileAroundHole.js`, and `src/3d/geometry/draw/stiffener.js`.

- `position` selects X: left is `-offset`, right is `+offset`, and center is `0`.
- For an ordinary stiffener, calculate the top height at both X edges of its thickness and use the lower result. This keeps its full thickness within the main-plate outline.
- At a left/right base endpoint, use the same outline-derived stiffener height rule as everywhere else. Never add a manual endpoint height or extend the main plate from a stiffener.
- Flat and angled types currently share the four-point profile construction driven by bottom size, top size, and calculated height. Curved type uses a circular arc below its baseline with radius `bottomRadius`, then a mathematically tangent segment to its top point. Preserve tangency when adjusting that profile.
- Stiffeners are generated on both main-plate faces. Keep the two meshes symmetric about the main plate's center plane. Endpoint stiffeners have no special height input and never alter the plate outline.
- When the stiffener's thickness strip overlaps the hole's projected circle, split its 2D profile above and below the hole clearance. For closest X distance `d < holeRadius`, the half-clearance is `sqrt(holeRadius^2 - d^2)`. Do not fill or reduce the pin-hole opening.
- Continue using the higher curve subdivision used by the plate, cheek, and stiffener extrusions so circular edges remain smooth.

## Dimensions and Labels

- Keep dimension calculations in `src/3d/dimensions/calculations/` and Three.js line/sprite construction in `src/3d/dimensions/draw/`.
- Main callouts cover left/right widths, main-plate height, outer radius, hole diameter, shoulder heights, and main thickness. Component labels include cheek radius/thickness and stiffener type, offset, thickness, sizes/radius, and outline-derived height.
- Place labels outside the model, balance cheek/stiffener details across both sides, and preserve canvas aspect ratio when sizing sprites so text does not stretch.
- If adding canvas-textured sprites, dispose their textures during viewport cleanup.

## Viewport and Materials

- Keep metallic part materials in `src/3d/geometry/materials.js`: main plate is stainless silver, cheeks are blue-gray steel, and stiffeners are bronze titanium. The viewport uses a `RoomEnvironment`, reduced environment intensity, physical materials, and softened reflections; preserve enough lighting to read the metal colors.
- The viewport background is `#f4f7fa` in light theme and `#141920` in dark theme. Keep antialiasing, scene lighting, automatic model framing, OrbitControls, and a model-relative zoom limit.
- The corner `ViewHelper` has six signed endpoints (`+/-X`, `+/-Y`, `+/-Z`). Its CanvasTexture markers need transparent corners; negative endpoints use the same axis hue at lower opacity. Keep labels centered inside circular markers and keep the helper clickable.
- The renderer uses `autoClear = false` because the helper renders as an overlay. Each frame must clear once, render the pad-eye scene, then render the helper; otherwise the helper pass can erase the model.
- Use `THREE.Timer`, update it once per animation frame, and dispose it with event handlers, OrbitControls, environment target, geometries, materials, and textures on effect cleanup.

## Data and Verification

- `App` switches between the Three.js view and a combined SVG drawing. The SVG canvas must show front and side projections at the same time.
- Front projection uses X/Y: show the tangent/crown outline, hole, cheek outlines, stiffener silhouettes, and width/height/radius/hole/shoulder dimensions. Side projection uses depth/Y: show main thickness, the hole section gap, cheek stacking, stiffener profiles, and thickness callouts.
- Both 2D views show a dashed-dot vertical center axis. Do not draw a horizontal center axis through the cheek/hole center; hidden hole edges in side view remain dashed. Keep front and side views on one physical scale so matching plate heights render equally, and fit annotation points inside the view bounds.
- 2D parts use grayscale fills only. Curved stiffener side profiles must retain their geometry below the main-plate baseline.

- Pad-eye JSON has top-level `id`, `units`, `mainPlate`, `cheekPlates`, and `stiffeners` fields. Keep fixtures structurally compatible with the object consumed by `buildPadEyeModel`.
- Assign unique IDs to new cheek plates and stiffeners, including test fixtures.
- Keep focused geometry fixtures in `src/data/Tests/`; they are input examples, not automatically run tests.
- After geometry or viewport changes, run `npm run build` and `npm run lint`. For special cases, load the corresponding JSON fixture through `buildPadEyeModel` and verify mesh count, positions, bounds, and hole clearance.
