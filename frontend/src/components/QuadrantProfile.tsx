import type { QuadrantWeights } from "@/types/reproinventory"
import { MAX_SCORE, QUADRANT_INFO, QUADRANT_KEYS } from "@/lib/diataxis"

/** Read-only Diataxis profile: one row per quadrant with filled score pips. */
export default function QuadrantProfile({ weights }: { weights: QuadrantWeights }) {
  return (
    <dl className="space-y-1">
      {QUADRANT_KEYS.map((key) => {
        const score = weights[key] ?? 0
        return (
          <div key={key} className="flex items-center justify-between gap-3 text-sm">
            <dt className={score ? "" : "text-muted-foreground"} title={QUADRANT_INFO[key].hint}>
              {QUADRANT_INFO[key].label}
            </dt>
            <dd className="flex gap-1" aria-label={`${score} of ${MAX_SCORE}`}>
              {Array.from({ length: MAX_SCORE }, (_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-5 rounded-sm ${i < score ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
