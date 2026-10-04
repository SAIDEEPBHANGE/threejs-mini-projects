// src/2d/PadEye2DCanvas.jsx
import { createFrontProjection } from "./frontProjection.js";
import { createSideProjection } from "./sideProjection.js";
import { createFrontDimensions } from "./frontDimensions.js";
import { createSideDimensions } from "./sideDimensions.js";
import {
  calculateSharedProjectionScale,
  createProjectionBounds,
} from "./projectionUtils.js";
import { ProjectionSvg } from "./ProjectionSvg.jsx";

const canvasWidth = 1280;
const canvasHeight = 760;

function fitDrawing(primitives, dimensions) {
  const drawing = [...primitives, ...dimensions];
  const points = drawing.flatMap((item) => item.points ?? []);
  const xValues = points.map(([x]) => x);
  const yValues = points.map(([, y]) => y);
  const size = Math.max(
    Math.max(...xValues) - Math.min(...xValues),
    Math.max(...yValues) - Math.min(...yValues),
  );
  return {
    drawing,
    bounds: createProjectionBounds(drawing, Math.max(10, size * 0.08)),
  };
}

export function PadEye2DCanvas({ padEye, isDark }) {
  const background = isDark ? "#141920" : "#f4f7fa";
  const annotationColor = isDark ? "#c7c7c7" : "#3a3a3a";
  const front = createFrontProjection(padEye, background, annotationColor);
  const side = createSideProjection(padEye, annotationColor, isDark);
  const frontFit = fitDrawing(
    front.primitives,
    createFrontDimensions(padEye, annotationColor),
  );
  const sideFit = fitDrawing(
    side.primitives,
    createSideDimensions(padEye, annotationColor),
  );
  const frontFrame = { x: 24, y: 88, width: 590, height: 620 };
  const sideFrame = { x: 666, y: 88, width: 590, height: 620 };
  const sharedScale = calculateSharedProjectionScale(
    [frontFit.bounds, sideFit.bounds],
    frontFrame,
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
        <h2 className="text-lg font-semibold text-slate-700">
          2D Orthographic Views
        </h2>
        <span className="text-xs font-semibold tracking-wide text-slate-500">
          FRONT + SIDE · {padEye.units}
        </span>
      </div>
      <div className="h-180 w-full" style={{ backgroundColor: background }}>
        <svg
          role="img"
          aria-label="Pad eye front and side orthographic views with dimensions"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          style={{
            "--drawing-background": background,
            "--drawing-label": annotationColor,
          }}
        >
          <ProjectionSvg
            drawing={frontFit.drawing}
            bounds={frontFit.bounds}
            frame={frontFrame}
            label="FRONT VIEW"
            scale={sharedScale}
          />
          <ProjectionSvg
            drawing={sideFit.drawing}
            bounds={sideFit.bounds}
            frame={sideFrame}
            label="SIDE VIEW"
            scale={sharedScale}
          />
          <line
            x1="640"
            y1="64"
            x2="640"
            y2="720"
            stroke={annotationColor}
            strokeOpacity="0.35"
            strokeDasharray="4 7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </section>
  );
}
