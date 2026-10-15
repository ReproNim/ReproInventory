import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / ".github" / "scripts"))

import process_issue


class ProcessIssueAiTests(unittest.TestCase):
    def test_missing_fields_are_identified(self):
        entry = {
            "course_name": "Intro to fMRI",
            "url": "https://example.org/course",
            "level": [],
            "platform": ["Jupyter"],
            "keywords": ["python"],
            "programming_language": [],
        }

        missing = process_issue.get_missing_fields(entry)
        self.assertIn("level", missing)
        self.assertIn("programming_language", missing)
        self.assertNotIn("course_name", missing)
        self.assertNotIn("url", missing)

    def test_ai_payload_is_validated_against_schema(self):
        payload = {
            "level": ["Beginner"],
            "platform": ["Jupyter"],
            "course_length": "1-4 hrs",
            "delivery": ["self-paced"],
            "language": ["English"],
            "programming_language": ["Python"],
            "neuroimaging_software": ["FSL"],
            "imaging_modality": ["Functional"],
            "open_dataset": True,
            "quadrant_weights": {"tutorial": 3, "how_to": "1", "explanation": 9, "unknown": 2},
        }

        cleaned = process_issue.validate_ai_payload(payload)
        self.assertEqual(cleaned["level"], ["Beginner"])
        self.assertEqual(cleaned["course_length"], "1-4 hrs")
        self.assertTrue(cleaned["open_dataset"])
        # scores are coerced to int, out-of-range and unknown keys dropped, all keys present
        self.assertEqual(cleaned["quadrant_weights"], {"tutorial": 3, "how_to": 1, "explanation": 0, "reference": 0})

    def test_all_zero_quadrant_weights_count_as_missing(self):
        entry = {"course_name": "X", "quadrant_weights": {"tutorial": 0, "how_to": 0, "explanation": 0, "reference": 0}}
        self.assertIn("quadrant_weights", process_issue.get_missing_fields(entry))
        self.assertEqual(process_issue.validate_ai_payload({"quadrant_weights": {"tutorial": 0}}), {})

    def test_existing_values_are_not_overwritten(self):
        entry = {
            "course_name": "Intro to fMRI",
            "url": "https://example.org/course",
            "level": ["Intermediate"],
            "platform": ["Jupyter"],
        }

        ai_values = {"level": ["Beginner"], "platform": ["Mac"]}
        merged = process_issue.merge_ai_values(entry, ai_values)
        self.assertEqual(merged["level"], ["Intermediate"])
        self.assertEqual(merged["platform"], ["Jupyter"])


if __name__ == "__main__":
    unittest.main()
