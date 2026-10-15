import {
  QuadrantWeightsKeys,
  QuadrantWeightsMax,
  type QuadrantWeights,
  type ReproInventoryEntry,
} from "@/types/reproinventory"

export type QuadrantKey = (typeof QuadrantWeightsKeys)[number]

export const QUADRANT_KEYS: readonly QuadrantKey[] = QuadrantWeightsKeys
export const MAX_SCORE = QuadrantWeightsMax

export const QUADRANT_INFO: Record<QuadrantKey, { label: string; hint: string }> = {
  tutorial: { label: "Tutorial", hint: "Guides a learner through doing something" },
  how_to: { label: "How-to guide", hint: "Steps to solve a specific task" },
  explanation: { label: "Explanation", hint: "Concepts, background and reasoning" },
  reference: { label: "Reference", hint: "Information to look up while working" },
}

/** Sum of all scores; 0 means the entry has no Diataxis profile. */
export function totalWeight(w?: QuadrantWeights | null): number {
  if (!w) return 0
  return QUADRANT_KEYS.reduce((sum, k) => sum + (w[k] ?? 0), 0)
}

export function hasQuadrant(entry: ReproInventoryEntry, key: QuadrantKey): boolean {
  return (entry.quadrant_weights?.[key] ?? 0) > 0
}

/**
 * Position on the two Diataxis axes, each from -1 to 1:
 *   x: theoretical (explanation, reference) -1  ...  +1 practical (tutorial, how-to)
 *   y: work (how-to, reference)             -1  ...  +1 study (tutorial, explanation)
 * Returns null when the entry has no scores.
 */
export function diataxisPosition(w?: QuadrantWeights | null): { x: number; y: number } | null {
  const total = totalWeight(w)
  if (!w || total === 0) return null
  const t = w.tutorial ?? 0, h = w.how_to ?? 0, e = w.explanation ?? 0, r = w.reference ?? 0
  return { x: (t + h - e - r) / total, y: (t + e - h - r) / total }
}

/** Quadrants with a score above 0, strongest first. */
export function rankedQuadrants(w?: QuadrantWeights | null): { key: QuadrantKey; score: number }[] {
  if (!w) return []
  return QUADRANT_KEYS.map((key) => ({ key, score: w[key] ?? 0 }))
    .filter((q) => q.score > 0)
    .sort((a, b) => b.score - a.score)
}
