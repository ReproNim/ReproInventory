import type { ReproInventoryEntry } from "@/types/reproinventory"

function toEducationalLevel(levels: ReproInventoryEntry["level"]): string | undefined {
  if (!levels || levels.length === 0) return undefined
  const filtered = levels.filter((l) => l !== "NA")
  return filtered.length > 0 ? filtered.join(", ") : undefined
}

function toLearningResourceType(media: ReproInventoryEntry["instruction_medium"]): string[] | undefined {
  if (!media || media.length === 0) return undefined
  const filtered = media.filter((m) => m !== "NA")
  return filtered.length > 0 ? filtered : undefined
}

function toInLanguage(languages: ReproInventoryEntry["language"]): string[] | undefined {
  if (!languages || languages.length === 0) return undefined
  const filtered = languages.filter((l) => l !== "NA")
  return filtered.length > 0 ? filtered : undefined
}

export function toSchemaOrgLearningResource(entry: ReproInventoryEntry): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    "@type": "LearningResource",
    "@id": entry.url ?? `urn:reproinventory:${entry.id}`,
    "identifier": `${window.location.origin}${import.meta.env.BASE_URL}#/item/${entry.id}`,
  }

  if (entry.course_name) obj["name"] = entry.course_name
  if (entry.url) obj["url"] = entry.url

  const desc = entry.description ?? entry.functionality
  if (desc) obj["description"] = desc

  if (entry.keywords?.length) {
    obj["keywords"] = entry.keywords.join(", ")
  }

  const level = toEducationalLevel(entry.level)
  if (level) obj["educationalLevel"] = level

  const resourceType = toLearningResourceType(entry.instruction_medium)
  if (resourceType) obj["learningResourceType"] = resourceType

  const lang = toInLanguage(entry.language)
  if (lang) obj["inLanguage"] = lang

  if (entry.last_updated) obj["dateModified"] = entry.last_updated
  obj["isAccessibleForFree"] = true

  return obj
}

export function buildSingleItemJsonLd(entry: ReproInventoryEntry): string {
  const ld = {
    "@context": "https://schema.org",
    ...toSchemaOrgLearningResource(entry),
  }
  return JSON.stringify(ld)
}

export function buildItemListJsonLd(entries: ReproInventoryEntry[]): string {
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": entries.map((entry, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": toSchemaOrgLearningResource(entry),
    })),
  }
  return JSON.stringify(ld)
}
