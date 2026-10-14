"""Checks that everything derived from the LinkML schema is in sync with it."""

import json
import sys
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "model"))
sys.path.insert(0, str(ROOT / ".github" / "scripts"))

import generate_from_schema as generate_types  # noqa: E402
import process_issue  # noqa: E402


class SchemaSyncTests(unittest.TestCase):
    def setUp(self):
        self.schema = generate_types.load_schema()

    def test_typescript_types_are_up_to_date(self):
        expected = generate_types.generate(self.schema)
        actual = generate_types.OUTPUT_PATH.read_text(encoding="utf-8")
        self.assertEqual(
            actual, expected,
            "frontend/src/types/reproinventory.ts is out of date; run: python model/generate_from_schema.py",
        )

    def test_schema_docs_are_up_to_date(self):
        expected = generate_types.generate_docs(self.schema)
        actual = generate_types.DOCS_PATH.read_text(encoding="utf-8")
        self.assertEqual(actual, expected, "model/schema.md is out of date; run: python model/generate_from_schema.py")

    def test_json_matches_yaml_data(self):
        with open(ROOT / "model" / "reproinventory_data.yaml", encoding="utf-8") as f:
            yaml_data = yaml.safe_load(f)
        with open(ROOT / "frontend" / "public" / "data" / "reproinventory_data.json", encoding="utf-8") as f:
            json_data = json.load(f)
        self.assertEqual(
            json_data, yaml_data,
            "reproinventory_data.json differs from the YAML; run: python model/convert_yaml_to_json.py",
        )

    def test_issue_processor_uses_schema_values(self):
        slots = self.schema["slots"]
        for field, values in process_issue.ENUM_VALUES.items():
            enum_name = slots[field]["range"]
            self.assertEqual(values, generate_types.enum_values(self.schema, enum_name))

    def test_ids_are_unique(self):
        with open(ROOT / "model" / "reproinventory_data.yaml", encoding="utf-8") as f:
            ids = [entry["id"] for entry in yaml.safe_load(f)]
        self.assertEqual(len(ids), len(set(ids)))


if __name__ == "__main__":
    unittest.main()
