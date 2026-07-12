import { motion } from "framer-motion";

interface ScoreRingProps {
  environmental: number;
  social: number;
  governance: number;
  size?: number;
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

export function ScoreRing({ environmental, social, governance, size = 200 }: ScoreRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const total = (environmental + social + governance) / 3;

  const rings = [
    { value: environmental, color: "#0d9488", r: size * 0.46, label: "Environmental" },
    { value: social, color: "#0ea5e9", r: size * 0.37, label: "Social" },
    { value: governance, color: "#8b5cf6", r: size * 0.28, label: "Governance" },
  ];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring) => (
          <circle
            key={ring.label}
            cx={cx}
            cy={cy}
            r={ring.r}
            fill="none"
            stroke="currentColor"
            className="text-neutral-200 dark:text-neutral-800"
            strokeWidth={8}
          />
        ))}
        {rings.map((ring) => (
          <motion.path
            key={ring.label}
            d={arcPath(cx, cy, ring.r, 0, 360)}
            fill="none"
            stroke={ring.color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * ring.r}
            initial={{ strokeDashoffset: 2 * Math.PI * ring.r }}
            animate={{ strokeDashoffset: 2 * Math.PI * ring.r * (1 - ring.value / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-current font-display font-bold" fontSize={size * 0.16}>
          {Math.round(total)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-current text-neutral-400" fontSize={size * 0.06}>
          ESG SCORE
        </text>
      </svg>
      <div className="flex gap-4 mt-3 text-xs">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ring.color }} />
            {ring.label}
          </div>
        ))}
      </div>
    </div>
  );
}
