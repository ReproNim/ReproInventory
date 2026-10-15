"""
Processes a GitHub issue and updates reproinventory_data.yaml and
frontend/public/data/reproinventory_data.json accordingly.

Reads:
  /tmp/issue_body.txt  - full issue body
  /tmp/issue_title.txt - issue title

Environment variables:
  ISSUE_LABEL  - one of: new-material, edit-material, delete-material
  ISSUE_NUMBER - issue number (for logging)
  AI_API_KEY   - optional API key for an OpenAI-compatible model
  AI_API_URL   - optional base URL for an OpenAI-compatible model
  AI_MODEL     - optional model name (defaults to gpt-4o-mini)
  AI_MAX_TOKENS - optional reply length limit (defaults to 1000)
  PR_BODY_PATH - where to write the pull request description
                 (defaults to /tmp/pr_body.md)

AI enrichment only fills empty descriptive fields (see AI_FILLABLE_FIELDS),
never overwrites contributor input, and reports what it filled in the
pull request description so a maintainer can check it.
"""

import json
import os
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import requests
import yaml

YAML_PATH = "model/reproinventory_data.yaml"
JSON_PATH = "frontend/public/data/reproinventory_data.json"

SCHEMA_PATH = Path(__file__).resolve().parents[2] / "model" / "reproinventory_schema.yaml"

# Fields that are never filled automatically: the free-text quality review
# must come from a human maintainer.
NOT_AUTO_FILLED = {"review"}


def _load_schema_definitions(path=SCHEMA_PATH):
    """Derive field lists and allowed values from the LinkML schema."""
    with open(path, encoding="utf-8") as f:
        schema = yaml.safe_load(f)
    class_slots = next(iter(schema["classes"].values()))["slots"]
    slots = {name: (spec or {}) for name, spec in schema["slots"].items()}
    enums = schema["enums"]
    array_fields = [n for n in class_slots if slots.get(n, {}).get("multivalued")]
    boolean_fields = {n for n in class_slots if slots.get(n, {}).get("range") == "boolean"}
    enum_values = {
        n: [str(v) for v in (enums[slots[n]["range"]].get("permissible_values") or {})]
        for n in class_slots
        if slots.get(n, {}).get("range") in enums
    }
    schema_fields = [n for n in class_slots if n not in NOT_AUTO_FILLED]
    return array_fields, schema_fields, enum_values, boolean_fields


ARRAY_FIELDS, SCHEMA_FIELDS, ENUM_VALUES, BOOLEAN_FIELDS = _load_schema_definitions()


def field_is_missing(value):
    if value is None:
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    if isinstance(value, list) and len(value) == 0:
        return True
    return False


def normalize_entry(entry):
    """Ensure all array fields are lists, not scalars."""
    if not isinstance(entry, dict):
        return entry

    for field in ARRAY_FIELDS:
        val = entry.get(field)
        if val is not None and not isinstance(val, list):
            entry[field] = [val]
    return entry


def get_missing_fields(entry):
    missing = []
    for field in SCHEMA_FIELDS:
        if field == "id":
            continue
        if field_is_missing(entry.get(field)):
            missing.append(field)
    return missing


def _normalize_list_value(value):
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, str):
        return [value.strip()] if value.strip() else []
    return [str(value).strip()] if str(value).strip() else []


def validate_ai_payload(payload):
    """Keep only valid schema-compatible values from the AI output."""
    if not isinstance(payload, dict):
        return {}

    cleaned = {}
    for field, value in payload.items():
        if field not in SCHEMA_FIELDS:
            continue
        if field == "id":
            continue

        if field in ARRAY_FIELDS:
            cleaned_value = _normalize_list_value(value)
            if field in ENUM_VALUES:
                allowed = {str(v).strip() for v in ENUM_VALUES[field]}
                cleaned_value = [v for v in cleaned_value if str(v).strip() in allowed]
            if cleaned_value:
                cleaned[field] = cleaned_value
            continue

        if field in ENUM_VALUES:
            normalized = str(value).strip()
            if normalized in {str(v).strip() for v in ENUM_VALUES[field]}:
                cleaned[field] = value
            continue

        if field in BOOLEAN_FIELDS:
            if isinstance(value, bool):
                cleaned[field] = value
            elif isinstance(value, str):
                lowered = value.strip().lower()
                if lowered in {"true", "yes"}:
                    cleaned[field] = True
                elif lowered in {"false", "no"}:
                    cleaned[field] = False
            continue

        if value is not None and str(value).strip() != "":
            cleaned[field] = value

    return cleaned


def merge_ai_values(entry, ai_values):
    for field, value in ai_values.items():
        if field in {"id"}:
            continue
        if not field_is_missing(entry.get(field)):
            continue
        entry[field] = value
    return entry


# ---------------------------------------------------------------------------
# AI enrichment
# ---------------------------------------------------------------------------

# Only descriptive facts about the resource are ever filled by the AI.
# Curator information (tag_team, source, notes, review, ...) must come from people.
AI_FILLABLE_FIELDS = [
    "level",
    "platform",
    "keywords",
    "course_length",
    "instruction_medium",
    "delivery",
    "language",
    "programming_language",
    "neuroimaging_software",
    "imaging_modality",
    "open_dataset",
    "assessment",
    "prerequisite",
    "quadrants",
]

FIELD_HINTS = {
    "level": "audience level the material is written for",
    "platform": "operating systems / environments the material requires",
    "keywords": "3-8 short topic keywords",
    "course_length": "approximate total time to work through the material",
    "instruction_medium": "format(s) of the material",
    "delivery": "self-paced material vs. taught by an instructor",
    "language": "natural language of the material",
    "programming_language": "programming languages used in the material",
    "neuroimaging_software": "neuroimaging packages taught or used",
    "imaging_modality": "imaging / data modalities covered",
    "open_dataset": "true if the material uses an openly available dataset",
    "assessment": "true if the material includes exercises with answers, quizzes or other assessment",
    "prerequisite": "short list of prior knowledge the material assumes",
    "quadrants": "Diataxis type(s): tutorial, how-to guide, explanation or reference",
}

PAGE_TEXT_LIMIT = 8000

# Filled in by enrich_entry_with_ai() and used for the pull request description.
AI_REPORT: Dict[str, Any] = {"status": "not run", "filled": {}, "detail": ""}


class _TextExtractor(HTMLParser):
    """Collect visible text from an HTML page (skips scripts, styles, navigation chrome)."""

    SKIP = {"script", "style", "noscript", "svg", "head"}

    def __init__(self):
        super().__init__()
        self.parts: List[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self._skip_depth += 1

    def handle_endtag(self, tag):
        if tag in self.SKIP and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data):
        if not self._skip_depth and data.strip():
            self.parts.append(data.strip())


def html_to_text(html: str, limit: int = PAGE_TEXT_LIMIT) -> str:
    parser = _TextExtractor()
    parser.feed(html)
    text = re.sub(r"\s+", " ", " ".join(parser.parts)).strip()
    return text[:limit]


def fetch_page_text(url: Optional[str]) -> str:
    """Return the visible text of the resource's web page, or '' if it can't be fetched."""
    if not url or not str(url).startswith(("http://", "https://")):
        return ""
    try:
        response = requests.get(
            url,
            timeout=20,
            headers={"User-Agent": "ReproInventory metadata bot (+https://github.com/ReproNim/ReproInventory)"},
        )
        response.raise_for_status()
        if "html" not in response.headers.get("Content-Type", "html"):
            return ""
        return html_to_text(response.text)
    except Exception as exc:  # network problems must never block a contribution
        print(f"Could not fetch page text from {url}: {exc}")
        return ""


def ai_configured():
    return bool(os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY"))


def build_ai_prompt(entry, missing_fields, page_text=""):
    known = {k: v for k, v in entry.items() if not field_is_missing(v) and k != "id"}
    lines = []
    for field in missing_fields:
        hint = FIELD_HINTS.get(field, "")
        if field in ENUM_VALUES:
            kind = "list of values from" if field in ARRAY_FIELDS else "one value from"
            lines.append(f'- "{field}" ({hint}): {kind} {json.dumps(ENUM_VALUES[field])}')
        elif field in BOOLEAN_FIELDS:
            lines.append(f'- "{field}" ({hint}): true or false')
        else:
            kind = "list of short strings" if field in ARRAY_FIELDS else "short string"
            lines.append(f'- "{field}" ({hint}): {kind}')

    page = page_text or "(the page could not be retrieved; use only the information above)"
    return (
        "You help curate ReproInventory, a catalogue of neuroimaging training materials.\n"
        "Fill in missing metadata for the resource below, based on the information given and the text of its web page.\n\n"
        "Rules:\n"
        "- Only include a field if the page or the entry clearly supports a value. Leave out any field you are unsure about; do not guess.\n"
        "- Use only the allowed values listed for each field, spelled exactly as given.\n"
        "- Respond with a single JSON object containing only the requested keys, and nothing else.\n\n"
        f"Resource:\n{json.dumps(known, ensure_ascii=False, indent=2)}\n\n"
        f"Fields to fill:\n" + "\n".join(lines) + "\n\n"
        f"Web page text (truncated):\n{page}\n"
    )


def parse_ai_json(content: str) -> Dict[str, Any]:
    """Parse the model's reply, tolerating code fences or text around the JSON object."""
    text = (content or "").strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1).strip()
    if not text.startswith("{"):
        start, end = text.find("{"), text.rfind("}")
        if start == -1 or end <= start:
            raise ValueError(f"no JSON object in reply: {content[:200]!r}")
        text = text[start:end + 1]
    payload = json.loads(text)
    if not isinstance(payload, dict):
        raise ValueError("reply is not a JSON object")
    return payload


def _post_with_retry(url, headers, body, attempts=3):
    for attempt in range(1, attempts + 1):
        response = requests.post(url, headers=headers, json=body, timeout=90)
        if response.status_code in (429, 500, 502, 503) and attempt < attempts:
            wait = 5 * attempt
            print(f"AI request returned {response.status_code}; retrying in {wait}s")
            time.sleep(wait)
            continue
        if response.status_code >= 400:
            raise RuntimeError(f"HTTP {response.status_code} from {url}: {response.text[:300]}")
        return response.json()
    raise RuntimeError("AI request failed after retries")


def call_ai_to_fill_missing_fields(entry, missing_fields, page_text=""):
    """Ask the model for the missing fields. Raises on any failure."""
    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY")
    api_url = (os.getenv("AI_API_URL") or os.getenv("OPENAI_API_URL") or "https://api.openai.com/v1").rstrip("/")
    model = os.getenv("AI_MODEL") or os.getenv("OPENAI_MODEL") or "gpt-4o-mini"
    max_tokens = int(os.getenv("AI_MAX_TOKENS") or "1000")

    body = {
        "model": model,
        "temperature": 0,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": "You fill in missing structured metadata and reply with JSON only."},
            {"role": "user", "content": build_ai_prompt(entry, missing_fields, page_text)},
        ],
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    try:
        data = _post_with_retry(f"{api_url}/chat/completions", headers, body)
    except RuntimeError as exc:
        # Some models reject response_format; retry once without it (the reply parser tolerates fences).
        if "HTTP 400" not in str(exc):
            raise
        print(f"Retrying without response_format after: {exc}")
        body.pop("response_format")
        data = _post_with_retry(f"{api_url}/chat/completions", headers, body)
    content = data["choices"][0]["message"]["content"]
    return validate_ai_payload(parse_ai_json(content)), model


def enrich_entry_with_ai(entry):
    """Fill empty descriptive fields with AI suggestions. Never overwrites contributor input."""
    AI_REPORT.update({"status": "not run", "filled": {}, "detail": ""})
    missing = [f for f in get_missing_fields(entry) if f in AI_FILLABLE_FIELDS]
    if not missing:
        AI_REPORT.update(status="nothing to fill")
        return entry
    if not ai_configured():
        AI_REPORT.update(status="skipped", detail="no AI_API_KEY configured")
        print("AI enrichment skipped: no AI_API_KEY configured")
        return entry

    page_text = fetch_page_text(entry.get("url"))
    try:
        ai_values, model = call_ai_to_fill_missing_fields(entry, missing, page_text)
    except Exception as exc:
        AI_REPORT.update(status="skipped", detail=str(exc))
        print(f"AI enrichment skipped: {exc}")
        return entry

    filled = {f: v for f, v in ai_values.items() if f in missing}
    merge_ai_values(entry, filled)
    AI_REPORT.update(
        status="filled" if filled else "no values returned",
        filled=filled,
        detail=f"model {model}; page text {'used' if page_text else 'not available'}",
    )
    print(f"AI filled {len(filled)} field(s): {', '.join(filled) or '-'} ({AI_REPORT['detail']})")
    return entry


def format_pr_body(issue_number, label):
    lines = [f"Closes #{issue_number}", "", f"Automatically generated from issue #{issue_number} (`{label}`).", ""]
    status = AI_REPORT["status"]
    if status == "filled":
        lines += [
            "### Fields suggested by AI - please check before merging",
            "",
            f"_{AI_REPORT['detail']}_",
            "",
            "| Field | Suggested value |",
            "| --- | --- |",
        ]
        for field, value in AI_REPORT["filled"].items():
            if isinstance(value, bool):
                shown = "yes" if value else "no"
            elif isinstance(value, list):
                shown = ", ".join(map(str, value))
            else:
                shown = str(value)
            lines.append(f"| `{field}` | {shown} |")
        lines += ["", "All other fields are exactly as submitted by the contributor."]
    elif status == "skipped":
        lines += [f"**AI enrichment skipped:** {AI_REPORT['detail']}", "", "Empty fields need to be filled in by hand."]
    elif status == "no values returned":
        lines += ["AI enrichment ran but could not determine any of the empty fields.", f"_{AI_REPORT['detail']}_"]
    return "\n".join(lines) + "\n"


def extract_yaml_block(body):
    """Extract the first ```yaml ... ``` block from the issue body."""
    match = re.search(r"```yaml\s*\n(.*?)\n```", body, re.DOTALL)
    if not match:
        raise ValueError("No YAML block found in issue body.")
    return yaml.safe_load(match.group(1))


def main():
    label = os.environ.get("ISSUE_LABEL")
    issue_number = os.environ.get("ISSUE_NUMBER")

    with open("/tmp/issue_body.txt", "r", encoding="utf-8") as f:
        issue_body = f.read()

    with open("/tmp/issue_title.txt", "r", encoding="utf-8") as f:
        issue_title = f.read().strip()

    # Load current data
    with open(YAML_PATH, "r", encoding="utf-8") as f:
        data = [normalize_entry(e) for e in (yaml.safe_load(f) or [])]

    if label == "new-material":
        entry = normalize_entry(extract_yaml_block(issue_body))
        entry = enrich_entry_with_ai(entry)

        # Assign a new numeric ID
        numeric_ids = [e["id"] for e in data if isinstance(e.get("id"), int)]
        entry["id"] = max(numeric_ids, default=0) + 1

        data.append(entry)
        print(f"Added new entry with ID {entry['id']}: {entry.get('course_name')}")

    elif label == "edit-material":
        entry = normalize_entry(extract_yaml_block(issue_body))
        entry = enrich_entry_with_ai(entry)
        entry_id = entry.get("id")

        replaced = False
        for i, e in enumerate(data):
            if str(e.get("id")) == str(entry_id):
                data[i] = entry
                replaced = True
                break

        if not replaced:
            raise ValueError(f"Entry with ID '{entry_id}' not found in data.")
        print(f"Updated entry ID {entry_id}: {entry.get('course_name')}")

    elif label == "delete-material":
        # Extract ID from issue title: "Delete material: Name (ID: 123)"
        match = re.search(r"ID:\s*(\S+?)\)", issue_title)
        if not match:
            raise ValueError(f"Could not extract ID from issue title: {issue_title!r}")

        raw_id = match.group(1)
        try:
            entry_id = int(raw_id)
        except ValueError:
            entry_id = raw_id

        original_len = len(data)
        data = [e for e in data if str(e.get("id")) != str(entry_id)]

        if len(data) == original_len:
            raise ValueError(f"Entry with ID '{entry_id}' not found in data.")
        print(f"Deleted entry with ID {entry_id}")

    else:
        raise ValueError(f"Unknown label: {label!r}")

    # Write updated YAML
    with open(YAML_PATH, "w", encoding="utf-8") as f:
        yaml.dump(data, f, sort_keys=False, default_flow_style=False, allow_unicode=True)

    # Write updated JSON
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    pr_body_path = os.environ.get("PR_BODY_PATH", "/tmp/pr_body.md")
    with open(pr_body_path, "w", encoding="utf-8") as f:
        f.write(format_pr_body(issue_number, label))

    print(f"Successfully processed '{label}' for issue #{issue_number}.")


if __name__ == "__main__":
    main()
