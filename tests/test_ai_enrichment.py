"""Tests for the AI enrichment of contributed entries (no network access needed)."""

import json
import os
import sys
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / ".github" / "scripts"))

import process_issue as pi  # noqa: E402


class FakeServer(BaseHTTPRequestHandler):
    """Serves a resource page (GET) and an OpenAI-compatible chat endpoint (POST)."""

    reply = "{}"
    status = 200
    last_prompt = ""

    def do_GET(self):
        page = b"<html><head><script>var x=1;</script></head><body><h1>fMRI with FSL</h1>" \
               b"<p>A beginner tutorial on functional MRI preprocessing in FSL.</p></body></html>"
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(page)

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        FakeServer.last_prompt = body["messages"][1]["content"]
        self.send_response(FakeServer.status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        if FakeServer.status == 200:
            self.wfile.write(json.dumps({"choices": [{"message": {"content": FakeServer.reply}}]}).encode())
        else:
            self.wfile.write(b'{"error": {"message": "User not found."}}')

    def log_message(self, *args):
        pass


class AiEnrichmentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), FakeServer)
        cls.base = f"http://127.0.0.1:{cls.server.server_address[1]}"
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        FakeServer.status = 200
        self.env = mock.patch.dict(os.environ, {"AI_API_KEY": "test", "AI_API_URL": self.base, "AI_MODEL": "test-model"})
        self.env.start()

    def tearDown(self):
        self.env.stop()

    def entry(self):
        return {"course_name": "fMRI with FSL", "url": f"{self.base}/page", "description": "Intro", "level": ["Advanced"]}

    def test_parse_ai_json_tolerates_fences_and_prose(self):
        self.assertEqual(pi.parse_ai_json('```json\n{"level": ["Beginner"]}\n```'), {"level": ["Beginner"]})
        self.assertEqual(pi.parse_ai_json('Here you go: {"a": 1} hope that helps'), {"a": 1})
        with self.assertRaises(ValueError):
            pi.parse_ai_json("no json here")

    def test_html_to_text_skips_scripts(self):
        text = pi.html_to_text("<html><head><script>secret()</script></head><body><p>Hello <b>world</b></p></body></html>")
        self.assertEqual(text, "Hello world")

    def test_fills_only_descriptive_empty_fields_and_reports_them(self):
        FakeServer.reply = '```json\n' + json.dumps({
            "level": ["Beginner"],             # already set by contributor -> must not change
            "neuroimaging_software": ["FSL"],
            "imaging_modality": ["Functional"],
            "tag_team": ["AI"],                 # curator field -> must be ignored
            "notes": "made up",                 # curator field -> must be ignored
            "platform": ["Amiga"],              # not an allowed value -> dropped
        }) + '\n```'
        entry = pi.enrich_entry_with_ai(self.entry())

        self.assertEqual(entry["level"], ["Advanced"])
        self.assertEqual(entry["neuroimaging_software"], ["FSL"])
        self.assertEqual(entry["imaging_modality"], ["Functional"])
        self.assertNotIn("tag_team", entry)
        self.assertNotIn("notes", entry)
        self.assertNotIn("platform", entry)

        self.assertIn("beginner tutorial on functional MRI", FakeServer.last_prompt)  # page text was used
        self.assertNotIn('"tag_team"', FakeServer.last_prompt)                       # never asked for
        body = pi.format_pr_body(7, "new-material")
        self.assertIn("Closes #7", body)
        self.assertIn("| `neuroimaging_software` | FSL |", body)
        self.assertNotIn("`level`", body)

    def test_api_error_is_reported_and_entry_kept(self):
        FakeServer.status = 401
        entry = pi.enrich_entry_with_ai(self.entry())
        self.assertEqual(set(entry), {"course_name", "url", "description", "level"})
        body = pi.format_pr_body(8, "new-material")
        self.assertIn("AI enrichment skipped", body)
        self.assertIn("401", body)
        self.assertIn("User not found", body)

    def test_missing_key_is_reported(self):
        with mock.patch.dict(os.environ, {"AI_API_KEY": "", "OPENAI_API_KEY": ""}):
            pi.enrich_entry_with_ai(self.entry())
        self.assertIn("no AI_API_KEY configured", pi.format_pr_body(9, "new-material"))


if __name__ == "__main__":
    unittest.main()
