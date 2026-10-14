"""Generate files derived from the LinkML schema.

The LinkML schema (model/reproinventory_schema.yaml) is the single source of
truth for field names and allowed values. This script writes:

  - frontend/src/types/reproinventory.ts  (TypeScript types and option lists)
  - model/schema.md                       (human-readable field reference)

Run it after changing the schema; CI fails if the committed files are out of date.

    python model/generate_from_schema.py
"""

import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "model" / "reproinventory_schema.yaml"
OUTPUT_PATH = ROOT / "frontend" / "src" / "types" / "reproinventory.ts"
DOCS_PATH = ROOT / "model" / "schema.md"

TS_TYPES = {"string": "string", "integer": "number", "boolean": "boolean", "float": "number"}


def load_schema(path=SCHEMA_PATH):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def enum_values(schema, enum_name):
    return [str(v) for v in (schema["enums"][enum_name].get("permissible_values") or {})]


def ts_literal(value):
    return json.dumps(value, ensure_ascii=False)


def generate(schema):
    class_name, cls = next(iter(schema["classes"].items()))
    slots = schema["slots"]
    default_range = schema.get("default_range", "string")

    out = [
        "// GENERATED FILE - DO NOT EDIT.",
        "// Generated from model/reproinventory_schema.yaml by model/generate_from_schema.py.",
        "",
    ]

    for name in schema["enums"]:
        values = enum_values(schema, name)
        out.append(f"export type {name} = {' | '.join(ts_literal(v) for v in values)};")
        out.append(f"export const {name}Values: {name}[] = [{', '.join(ts_literal(v) for v in values)}];")
        out.append("")

    out.append(f"export interface {class_name} {{")
    for slot_name in cls["slots"]:
        spec = slots.get(slot_name) or {}
        rng = spec.get("range", default_range)
        ts = rng if rng in schema["enums"] else TS_TYPES.get(rng, "string")
        if spec.get("multivalued"):
            ts = f"{ts}[]"
        optional = "" if spec.get("identifier") or spec.get("required") else "?"
        out.append(f"  {slot_name}{optional}: {ts};")
    out.append("}")
    out.append("")
    return "\n".join(out)


def generate_docs(schema):
    class_name, cls = next(iter(schema["classes"].items()))
    slots = schema["slots"]
    default_range = schema.get("default_range", "string")
    out = [
        "<!-- GENERATED FILE - DO NOT EDIT. Run: python model/generate_from_schema.py -->",
        "",
        f"# ReproInventory schema: `{class_name}`",
        "",
        "Source: [`reproinventory_schema.yaml`](reproinventory_schema.yaml) (LinkML).",
        "",
        "| Field | Type | Multiple values | Allowed values | Description |",
        "| --- | --- | --- | --- | --- |",
    ]
    for slot_name in cls["slots"]:
        spec = slots.get(slot_name) or {}
        rng = spec.get("range", default_range)
        if rng in schema["enums"]:
            allowed = ", ".join(f"`{v}`" for v in enum_values(schema, rng))
            kind = "enum"
        else:
            allowed = ""
            kind = rng
        multi = "yes" if spec.get("multivalued") else ""
        desc = spec.get("description", "")
        out.append(f"| `{slot_name}` | {kind} | {multi} | {allowed} | {desc} |")
    out.append("")
    return "\n".join(out)


if __name__ == "__main__":
    schema = load_schema()
    OUTPUT_PATH.write_text(generate(schema), encoding="utf-8")
    DOCS_PATH.write_text(generate_docs(schema), encoding="utf-8")
    for path in (OUTPUT_PATH, DOCS_PATH):
        print(f"Wrote {path.relative_to(ROOT)}")
