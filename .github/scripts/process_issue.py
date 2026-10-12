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
"""

import json
import os
import re
from typing import Any, Dict, Iterable, List, Optional

import requests
import yaml

YAML_PATH = "model/reproinventory_data.yaml"
JSON_PATH = "frontend/public/data/reproinventory_data.json"

ARRAY_FIELDS = [
    "tag_team", "level", "platform", "keywords", "instruction_medium",
    "delivery", "language", "programming_language", "neuroimaging_software",
    "imaging_modality", "quadrants", "source", "prerequisite",
]

SCHEMA_FIELDS = [
    "id",
    "tag_team",
    "course_name",
    "url",
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
    "last_updated",
    "functionality",
    "assessment",
    "prerequisite",
    "source",
    "description",
    "exclude_from_repro_inventory",
    "alias_links",
    "notes",
    "quadrants",
]

ENUM_VALUES = {
    "level": ["Beginner", "Intermediate", "Advanced", "NA"],
    "platform": ["Mac", "Windows", "Linux", "Docker", "Jupyter", "NA"],
    "course_length": ["<1 hr", "1-4 hrs", "1 day", "1-3 days", "1 week", "1+ weeks", "NA"],
    "instruction_medium": [
        "Hands-on tutorial / notebooks",
        "lecture",
        "video",
        "notes",
        "blog post",
        "reference",
        "slides",
        "website",
        "outline",
        "meta-resource",
        "NA",
    ],
    "delivery": ["self-paced", "instructor", "Hybrid", "NA"],
    "language": ["English", "French", "Spanish", "Chinese", "German", "English, French", "English, German", "Other", "NA"],
    "programming_language": ["Python", "R", "shell scripting", "Matlab", "Git", "NA"],
    "neuroimaging_software": ["AFNI", "SPM", "FSL", "Freesurfer", "Python", "Multiple", "NA"],
    "imaging_modality": ["DWI", "Structural", "Functional", "Task-based", "Resting-State", "EEG", "Behavioral", "MEG", "MRI", "NA"],
    "quadrants": ["information-oriented (reference)", "understanding-oriented (explanation)", "learning-oriented (tutorials)", "problem-oriented (how to guides)", "NA"],
    "exclude_from_repro_inventory": ["Yes", "No", "NA"],
}


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

        if field in {"open_dataset", "assessment"}:
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


def ai_configured():
    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return False
    return True


def build_ai_prompt(entry, missing_fields):
    context = json.dumps(entry, ensure_ascii=False, indent=2)
    allowed = []
    for field in missing_fields:
        if field in ENUM_VALUES:
            allowed.append(f"- {field}: one of {ENUM_VALUES[field]}")
        elif field in {"open_dataset", "assessment"}:
            allowed.append(f"- {field}: boolean (true or false)")
        else:
            allowed.append(f"- {field}: string or list of strings as appropriate")

    return (
        "You are filling in missing metadata for a ReproInventory entry. "
        "Only fill the fields listed below. Do not overwrite existing values. "
        "Use only values from the allowed enums provided. If uncertain, set NA or false/true only when obvious.\n\n"
        f"Current entry JSON:\n{context}\n\n"
        "Return valid JSON only, with no markdown, no commentary, and only the keys requested.\n\n"
        + "\n".join(allowed)
    )


def call_ai_to_fill_missing_fields(entry, missing_fields):
    if not ai_configured() or not missing_fields:
        return {}

    try:
        api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY")
        api_url = (os.getenv("AI_API_URL") or os.getenv("OPENAI_API_URL") or "https://api.openai.com/v1").rstrip("/")
        model = os.getenv("AI_MODEL") or os.getenv("OPENAI_MODEL") or "gpt-4o-mini"
        max_tokens = int(os.getenv("AI_MAX_TOKENS") or "250")

        prompt = build_ai_prompt(entry, missing_fields)
        response = requests.post(
            f"{api_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "temperature": 0.1,
                "max_tokens": max_tokens,
                "messages": [
                    {"role": "system", "content": "You fill missing structured metadata only."},
                    {"role": "user", "content": prompt},
                ],
            },
            timeout=90,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        payload = json.loads(content)
        if not isinstance(payload, dict):
            return {}
        return validate_ai_payload(payload)
    except Exception as exc:  # pragma: no cover - defensive for runtime service issues
        print(f"AI enrichment skipped: {exc}")
        return {}


def enrich_entry_with_ai(entry):
    missing_fields = get_missing_fields(entry)
    if not missing_fields:
        return entry

    ai_values = call_ai_to_fill_missing_fields(entry, missing_fields)
    if not ai_values:
        return entry

    filtered_ai_values = {field: value for field, value in ai_values.items() if field in missing_fields}
    return merge_ai_values(entry, filtered_ai_values)


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

    print(f"Successfully processed '{label}' for issue #{issue_number}.")


if __name__ == "__main__":
    main()
