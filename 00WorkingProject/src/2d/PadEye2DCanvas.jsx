// src/2d/PadEye2DCanvas.jsx
import { createFrontProjection } from "./frontProjection.js";
import { createSideProjection } from "./sideProjection.js";

function projectPoint([x, y], bounds) {
  return `${x - bounds.minX},${bounds.maxY - y}`;
}

function primitivePath(points, bounds, closePath) {
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${projectPoint(point, bounds)}`,
    )
    .join(" ");
  return closePath ? `${path} Z` : path;
}

export function PadEye2DCanvas({ padEye, projection, isDark }) {
  const background = isDark ? "#141920" : "#f4f7fa";
  const drawing =
    projection === "front"
      ? createFrontProjection(padEye, background)
      : createSideProjection(padEye);
  const { bounds } = drawing;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
        <h2 className="text-lg font-semibold text-slate-700">
          2D {projection === "front" ? "Front" : "Side"} View
        </h2>
        <span className="text-xs font-semibold tracking-wide text-slate-500">
          {drawing.summary}
        </span>
      </div>
      <div className="h-150 w-full" style={{ backgroundColor: background }}>
        <svg
          role="img"
          aria-label={`Pad eye ${projection} orthographic projection`}
          viewBox={`0 0 ${bounds.width} ${bounds.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
        >
          {drawing.primitives.map((primitive, index) => (
            <path
              key={`${primitive.fill}-${index}`}
              d={primitivePath(
                primitive.points,
                bounds,
                primitive.closed !== false,
              )}
              fill={primitive.fill ?? "none"}
              fillRule={primitive.fillRule}
              stroke={primitive.stroke ?? "none"}
              strokeWidth={primitive.strokeWidth ?? 0}
              strokeDasharray={primitive.dash}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={primitive.opacity ?? 1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
    </section>
  );
}
