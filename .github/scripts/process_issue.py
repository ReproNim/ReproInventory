"""
Processes a GitHub issue and updates reproinventory_data.yaml and
frontend/public/data/reproinventory_data.json accordingly.

Reads:
  /tmp/issue_body.txt  - full issue body
  /tmp/issue_title.txt - issue title

Environment variables:
  ISSUE_LABEL  - one of: new-material, edit-material, delete-material
  ISSUE_NUMBER - issue number (for logging)
"""

import os
import re
import json
import yaml

YAML_PATH = "model/reproinventory_data.yaml"
JSON_PATH = "frontend/public/data/reproinventory_data.json"

label = os.environ["ISSUE_LABEL"]
issue_number = os.environ["ISSUE_NUMBER"]

with open("/tmp/issue_body.txt", "r", encoding="utf-8") as f:
    issue_body = f.read()

with open("/tmp/issue_title.txt", "r", encoding="utf-8") as f:
    issue_title = f.read().strip()

# Load current data
with open(YAML_PATH, "r", encoding="utf-8") as f:
    data = yaml.safe_load(f) or []


def extract_yaml_block(body):
    """Extract the first ```yaml ... ``` block from the issue body."""
    match = re.search(r"```yaml\s*\n(.*?)\n```", body, re.DOTALL)
    if not match:
        raise ValueError("No YAML block found in issue body.")
    return yaml.safe_load(match.group(1))


if label == "new-material":
    entry = extract_yaml_block(issue_body)

    # Assign a new numeric ID
    numeric_ids = [e["id"] for e in data if isinstance(e.get("id"), int)]
    entry["id"] = max(numeric_ids, default=0) + 1

    data.append(entry)
    print(f"Added new entry with ID {entry['id']}: {entry.get('course_name')}")

elif label == "edit-material":
    entry = extract_yaml_block(issue_body)
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
