import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ReproInventoryEntry } from "@/types/reproinventory"
import { diataxisPosition, rankedQuadrants, QUADRANT_INFO } from "@/lib/diataxis"

const SIZE = 600
const PAD = 84 // room for the quadrant and axis labels outside the plot area
const INNER = SIZE - 2 * PAD
const INSET = 0.8 // extreme positions sit inside the box, leaving room for spread-out dots
const DOT = 7

const LEVELS = [
  { key: "Beginner", className: "fill-emerald-500" },
  { key: "Intermediate", className: "fill-sky-500" },
  { key: "Advanced", className: "fill-violet-500" },
  { key: "Not specified", className: "fill-gray-400" },
] as const

function levelOf(entry: ReproInventoryEntry): (typeof LEVELS)[number]["key"] {
  const levels = entry.level ?? []
  for (const l of ["Beginner", "Intermediate", "Advanced"] as const) if (levels.includes(l)) return l
  return "Not specified"
}

// data coordinates (-1..1) -> svg pixels; y grows upwards in the data
const toX = (x: number) => SIZE / 2 + x * INSET * (INNER / 2)
const toY = (y: number) => SIZE / 2 - y * INSET * (INNER / 2)

interface Point {
  entry: ReproInventoryEntry
  cx: number
  cy: number
  level: (typeof LEVELS)[number]["key"]
}

/** Entries placed on the two Diataxis axes; entries at the same spot are spread in a small spiral. */
export default function DiataxisMap({ entries }: { entries: ReproInventoryEntry[] }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<Point | null>(null)

  const { points, unplaced } = useMemo(() => {
    const groups = new Map<string, { x: number; y: number; items: ReproInventoryEntry[] }>()
    let unplaced = 0
    for (const entry of [...entries].sort((a, b) => a.id - b.id)) {
      const pos = diataxisPosition(entry.quadrant_weights)
      if (!pos) { unplaced++; continue }
      const key = `${pos.x.toFixed(3)},${pos.y.toFixed(3)}`
      if (!groups.has(key)) groups.set(key, { ...pos, items: [] })
      groups.get(key)!.items.push(entry)
    }
    const points: Point[] = []
    for (const g of groups.values()) {
      g.items.forEach((entry, i) => {
        // sunflower spiral around the shared position, so dots don't overlap
        const r = i === 0 ? 0 : 2.2 * DOT * Math.sqrt(i)
        const a = i * 2.39996
        points.push({ entry, cx: toX(g.x) + r * Math.cos(a), cy: toY(g.y) + r * Math.sin(a), level: levelOf(entry) })
      })
    }
    return { points, unplaced }
  }, [entries])

  const mid = SIZE / 2
  // quadrant names sit outside the plot box, above (study) and below (work) it
  const corner = (x: number, y: number, title: string, sub: string, anchor: "start" | "end") => (
    <g>
      <text x={x} y={y} textAnchor={anchor} className="fill-foreground text-[14px] font-semibold">{title}</text>
      <text x={x} y={y + 16} textAnchor={anchor} className="fill-muted-foreground text-[12px]">{sub}</text>
    </g>
  )

  return (
    <div className="space-y-3">
      <div className="relative mx-auto max-w-[640px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Map of training materials by Diataxis type" className="w-full h-auto">
          <rect x={PAD} y={PAD} width={INNER} height={INNER} rx={8} className="fill-muted/40 stroke-border" />
          <line x1={mid} y1={PAD} x2={mid} y2={SIZE - PAD} className="stroke-border" strokeDasharray="4 4" />
          <line x1={PAD} y1={mid} x2={SIZE - PAD} y2={mid} className="stroke-border" strokeDasharray="4 4" />

          {corner(SIZE - PAD, PAD - 30, "Tutorials", "learning by doing", "end")}
          {corner(PAD, PAD - 30, "Explanation", "understanding", "start")}
          {corner(SIZE - PAD, SIZE - PAD + 24, "How-to guides", "solving a task", "end")}
          {corner(PAD, SIZE - PAD + 24, "Reference", "looking things up", "start")}

          <g className="fill-muted-foreground text-[12px]">
            <text x={mid} y={SIZE - PAD + 24} textAnchor="middle">← theoretical · practical →</text>
            <text x={PAD - 16} y={mid} textAnchor="middle" transform={`rotate(-90 ${PAD - 16} ${mid})`}>← work · study →</text>
          </g>

          {points.map((p) => (
            <circle
              key={p.entry.id}
              cx={p.cx}
              cy={p.cy}
              r={hovered?.entry.id === p.entry.id ? DOT + 2 : DOT}
              className={`${LEVELS.find((l) => l.key === p.level)!.className} stroke-background cursor-pointer transition-[r]`}
              strokeWidth={1.5}
              tabIndex={0}
              role="link"
              aria-label={p.entry.course_name}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(p)}
              onBlur={() => setHovered(null)}
              onClick={() => navigate(`/item/${p.entry.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/item/${p.entry.id}`) }}
            />
          ))}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 w-max max-w-[280px] rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
            style={{
              left: `${(hovered.cx / SIZE) * 100}%`,
              top: `${(hovered.cy / SIZE) * 100}%`,
              transform: `translate(${hovered.cx > SIZE / 2 ? "-105%" : "5%"}, -50%)`,
            }}
          >
            <p className="font-medium text-sm">{hovered.entry.course_name}</p>
            <p className="text-muted-foreground">
              {rankedQuadrants(hovered.entry.quadrant_weights)
                .map((q) => `${QUADRANT_INFO[q.key].label} ${q.score}`)
                .join(" · ")}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        {LEVELS.map((l) => (
          <span key={l.key} className="flex items-center gap-1.5">
            <svg width="10" height="10" aria-hidden><circle cx="5" cy="5" r="5" className={l.className} /></svg>
            {l.key}
          </span>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Each dot is a resource, placed by its Diataxis scores. Click a dot to open it.
        {unplaced > 0 && ` ${unplaced} of the filtered resources have no Diataxis profile yet and are not shown.`}
      </p>
    </div>
  )
}
