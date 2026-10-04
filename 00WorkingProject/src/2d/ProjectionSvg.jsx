// src/2d/ProjectionSvg.jsx
function mapPoint([x, y], bounds, frame, sharedScale) {
  const scale =
    sharedScale ??
    Math.min(frame.width / bounds.width, frame.height / bounds.height);
  const offsetX = frame.x + (frame.width - bounds.width * scale) / 2;
  const offsetY = frame.y + (frame.height - bounds.height * scale) / 2;
  return [
    offsetX + (x - bounds.minX) * scale,
    offsetY + (bounds.maxY - y) * scale,
    scale,
  ];
}

export function ProjectionSvg({ drawing, frame, bounds, label, scale }) {
  return (
    <g>
      <text
        x={frame.x + frame.width / 2}
        y={frame.y - 18}
        textAnchor="middle"
        fill="var(--drawing-label)"
        fontSize="18"
        fontWeight="700"
      >
        {label}
      </text>
      {drawing.map((primitive, index) => {
        if (primitive.type === "text") {
          const [x, y, pointScale] = mapPoint(
            primitive.position,
            bounds,
            frame,
            scale,
          );
          return (
            <text
              key={`label-${index}`}
              x={x}
              y={y}
              textAnchor={primitive.anchor ?? "middle"}
              dominantBaseline="middle"
              fill={primitive.color}
              fontSize={Math.max(
                11,
                Math.min(17, primitive.fontSize * pointScale),
              )}
              fontWeight="600"
              paintOrder="stroke"
              stroke="var(--drawing-background)"
              strokeWidth="3"
              strokeLinejoin="round"
            >
              {primitive.text}
            </text>
          );
        }

        const points = primitive.points
          .map((point) => mapPoint(point, bounds, frame, scale))
          .map(([x, y]) => `${x},${y}`)
          .join(" ");
        return (
          <polyline
            key={`shape-${index}`}
            points={points}
            fill={
              primitive.closed === false ? "none" : (primitive.fill ?? "none")
            }
            stroke={primitive.stroke ?? "none"}
            strokeWidth={primitive.strokeWidth ?? 0}
            strokeDasharray={primitive.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={primitive.opacity ?? 1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
}
