import React, { useMemo } from "react";

// Guilloché rosette: the fine interlaced line-work engraved on banknotes,
// bonds and certificates. A fitting signature for an institute that works on
// finance and certifies projects. Drawn as SVG, deterministic.

function ring(cx: number, cy: number, R: number, amp: number, lobes: number, phase: number, steps = 720) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = R + amp * Math.sin(lobes * t + phase);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + "Z";
}

export default function Guilloche({ size = 900, className = "", color = "#c8960c", opacity = 0.5 }: { size?: number; className?: string; color?: string; opacity?: number }) {
  const paths = useMemo(() => {
    const c = size / 2;
    const out: { d: string; w: number; o: number }[] = [];
    // outer band
    for (let k = 0; k < 28; k++) out.push({ d: ring(c, c, size * 0.4, size * 0.035, 18, (k / 28) * Math.PI * 2 / 18 * 3), w: 0.7, o: 0.55 });
    // middle band
    for (let k = 0; k < 22; k++) out.push({ d: ring(c, c, size * 0.27, size * 0.045, 12, (k / 22) * Math.PI * 2 / 12 * 2), w: 0.7, o: 0.7 });
    // inner rosette
    for (let k = 0; k < 16; k++) out.push({ d: ring(c, c, size * 0.13, size * 0.05, 8, (k / 16) * Math.PI * 2 / 8 * 2), w: 0.6, o: 0.8 });
    // framing circles
    [0.445, 0.455, 0.215, 0.07].forEach((f) => out.push({ d: ring(c, c, size * f, 0, 1, 0, 180), w: 1, o: 0.9 }));
    return out;
  }, [size]);
  return (
    <svg aria-hidden viewBox={`0 0 ${size} ${size}`} className={className} style={{ opacity }}>
      <g fill="none" stroke={color}>
        {paths.map((p, i) => <path key={i} d={p.d} strokeWidth={p.w} strokeOpacity={p.o} />)}
      </g>
    </svg>
  );
}
