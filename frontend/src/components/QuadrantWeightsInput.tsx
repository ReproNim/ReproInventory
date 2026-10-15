import type { QuadrantWeights } from "@/types/reproinventory"
import { MAX_SCORE, QUADRANT_INFO, QUADRANT_KEYS } from "@/lib/diataxis"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Props {
  value?: QuadrantWeights
  onChange: (value: QuadrantWeights) => void
  idPrefix: string
}

const SCORES = Array.from({ length: MAX_SCORE + 1 }, (_, i) => i)
const SCORE_LABELS = ["not at all", "a little", "partly", "mainly"]

/** Four rows of 0-3 score buttons, one per Diataxis quadrant. */
export default function QuadrantWeightsInput({ value, onChange, idPrefix }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        How much is this resource each of these? 0 = not at all, {MAX_SCORE} = mainly.
      </p>
      {QUADRANT_KEYS.map((key) => {
        const current = value?.[key] ?? 0
        return (
          <div key={key} className="flex items-center justify-between gap-3">
            <Label id={`${idPrefix}-${key}`} className="text-sm" title={QUADRANT_INFO[key].hint}>
              {QUADRANT_INFO[key].label}
            </Label>
            <div role="radiogroup" aria-labelledby={`${idPrefix}-${key}`} className="flex gap-1">
              {SCORES.map((score) => (
                <button
                  key={score}
                  type="button"
                  role="radio"
                  aria-checked={current === score}
                  title={SCORE_LABELS[score] ?? String(score)}
                  onClick={() => onChange({ ...value, [key]: score })}
                  className={cn(
                    "h-7 w-7 rounded-md border text-xs font-medium transition-colors",
                    current === score
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-accent",
                  )}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
