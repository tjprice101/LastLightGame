from pathlib import Path
import re
import unittest
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
BRIEF = ROOT / "Art" / "ui" / "Radiant Combat Overhaul.md"
BLOCK = re.compile(r"```text\s*\n(.*?)\n```", re.S)
VENDORS = {
    "Mirel": "Material Exchange",
    "Veylin": "Cosmetic Store",
    "Torven": "Conduit Store",
    "Edda": "Conduit Upgrade service",
    "Sarev": "Calamitic Conduits",
    "Nimra": "Event Elemental-Devourers",
}


class RadiantArtBriefTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = BRIEF.read_text(encoding="utf-8")

    def vendor_section(self, name, destination):
        heading = re.escape(f"### {name} \u2014 {destination}")
        match = re.search(rf"^{heading}\n(.*?)(?=^### |^## |\Z)", self.text, re.M | re.S)
        self.assertIsNotNone(match, name)
        return match.group(1)

    def test_six_distinct_vendor_prompts_and_contextual_dialogue(self):
        prompts = []
        for name, destination in VENDORS.items():
            with self.subTest(vendor=name):
                section = self.vendor_section(name, destination)
                self.assertIn(f"`vendor-{name.lower()}.png`", self.text)
                labels = re.findall(r"^- \*\*([^*]+):\*\*", section, re.M)
                self.assertGreaterEqual(len(labels), 7)
                self.assertIn("Welcome", labels)
                self.assertEqual([label for label in labels if label.startswith("Idle ")],
                                 ["Idle 1", "Idle 2", "Idle 3"])
                self.assertIn("Cancel", labels)
                self.assertTrue(any(label.startswith("Saved ") for label in labels))
                bodies = BLOCK.findall(section)
                self.assertEqual(len(bodies), 1)
                body = bodies[0]
                prompts.append(body)
                for flag in ("--ar 2:3", "--niji 6", "--s 100", "--q 1", "--no "):
                    self.assertEqual(body.count(flag), 1)
                self.assertNotIn("--sref", body)
                self.assertNotIn("--sw", body)
        self.assertEqual(len(set(prompts)), len(VENDORS))

    def test_source_count_and_optional_scenes_are_explicit(self):
        prompts = BLOCK.findall(self.text)
        self.assertEqual(len(prompts), 8)
        self.assertEqual(sum("--ar 2:3" in body for body in prompts), 6)
        self.assertEqual(sum("--ar 16:9" in body for body in prompts), 2)
        for body in (body for body in prompts if "--ar 16:9" in body):
            with self.subTest(scene=body[:55]):
                self.assertIn("full-bleed", body)
                self.assertIn("--no ", body)
                self.assertNotIn("--sref", body)
                self.assertNotIn("--sw", body)
        self.assertIn("six vendor sources; eight sources if both", self.text)
        self.assertIn("no ability icons", self.text)
        self.assertIn("portrait artwork has not been", self.text)

    def test_composition_and_saved_outcome_requirements_remain_visible(self):
        text = " ".join(self.text.split())
        self.assertIn("exact Attack, Defense, Recovery, Health, statuses and flowing Gauge on each card", text)
        self.assertIn("350ms hold plus 32px upward release", text)
        self.assertIn("No member-selection, Kit or Actions button is reintroduced", text)
        self.assertIn("only after a confirmed save", text)
        self.assertIn("outcome is unconfirmed", text)
        self.assertIn("The copy is safely in your collection. You decide what to do next.", text)

    def test_local_reference_links_resolve(self):
        for value in re.findall(r"\]\(([^)\n]+)\)", self.text):
            if re.match(r"^(?:[a-z]+:|#)", value, re.I):
                continue
            target = unquote(value.split("#", 1)[0])
            with self.subTest(target=target):
                self.assertTrue((BRIEF.parent / target).exists())


if __name__ == "__main__":
    unittest.main()
