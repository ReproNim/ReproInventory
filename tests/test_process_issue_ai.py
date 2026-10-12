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
            "quadrants": ["learning-oriented (tutorials)"],
        }

        cleaned = process_issue.validate_ai_payload(payload)
        self.assertEqual(cleaned["level"], ["Beginner"])
        self.assertEqual(cleaned["course_length"], "1-4 hrs")
        self.assertTrue(cleaned["open_dataset"])

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
