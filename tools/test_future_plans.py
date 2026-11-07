from pathlib import Path
import re
import unittest
from urllib.parse import unquote

import build_future_story_art as story
import build_moon_banner_art as moon
import build_phase2_war_art as war
import build_seasonal_event_art as events
import build_sunshade_banner_art as sun

ROOT = Path(__file__).resolve().parents[1]
FUTURE = ROOT / "docs" / "Future Plans"


class FuturePlansTests(unittest.TestCase):
    def test_canonical_locations_and_no_old_generated_copies(self):
        self.assertEqual(war.SPEC.parent, FUTURE)
        self.assertEqual(war.OUTPUT.parent, FUTURE)
        self.assertEqual(story.OUTPUT.parent, FUTURE)
        for relative in (
            "docs/living-world-ui-audit-plan.md",
            "docs/phase-2-war-designs.md",
            "docs/story-roadmap.md",
            "docs/chapters-2-3-design.md",
            "docs/microtransactions-design.md",
            "docs/remaining-expansion-phases.md",
            "docs/remaining-expansion-art.md",
            "Art/characters/Elemental War Phase 2.md",
            "Art/story/Chapters 2-3 Draft.md",
            "Art/experiments/Starter Omnic Alternate Skins.md",
            "Art/experiments/Enemy Style Pilot.md",
        ):
            with self.subTest(path=relative):
                self.assertFalse((ROOT / relative).exists())
                self.assertTrue((FUTURE / Path(relative).name).exists())

    def test_future_document_local_links_resolve(self):
        for path in FUTURE.glob("*.md"):
            for match in re.finditer(r"\]\(([^)\n]+)\)", path.read_text(encoding="utf-8")):
                value = match.group(1)
                if re.match(r"^(?:[a-z]+:|#)", value, re.I):
                    continue
                target = unquote(value.split("#", 1)[0])
                with self.subTest(document=path.name, target=target):
                    self.assertTrue((path.parent / target).exists())

    def test_audited_source_counts_exclude_reused_and_duplicate_assets(self):
        seasonal = moon.blocks() + sun.blocks() + events.blocks()
        required = [row for row in seasonal if not row[0].endswith("-weapon.png")]
        filenames = [row[0] for row in required + war.blocks() + story.blocks()]
        self.assertEqual(len(filenames), 326)
        self.assertEqual(len(set(filenames)), 326)
        self.assertEqual(len(required) + len(war.blocks()), 251)
        self.assertEqual(len(seasonal) + len(war.blocks()), 263)
        self.assertEqual(len(war.source_rows()), 24)
        experiments = sum(
            len(re.findall(r"```text\b", (FUTURE / name).read_text(encoding="utf-8")))
            for name in ("Starter Omnic Alternate Skins.md", "Enemy Style Pilot.md")
        )
        self.assertEqual(experiments, 8)
        self.assertEqual(len(filenames) + 12 + 1 + 4, 343)
        self.assertEqual(len(filenames) + 12 + 1 + 4 + experiments, 351)
        text = (FUTURE / "image-budget-audit.md").read_text(encoding="utf-8")
        moon_delivered = [row for row in moon.blocks() if not row[0].endswith("-weapon.png")]
        moon_delivered += [row for row in events.blocks() if row[0].startswith("moon")]
        self.assertEqual(len(moon_delivered), 104)
        self.assertEqual(len(required) + len(war.blocks()) - len(moon_delivered), 147)
        for total in ("147", "159", "222", "239", "247"):
            self.assertIn(f"**{total}", text)
        self.assertIn("unquantified", text)

    def test_budget_working_case_and_exhausted_allowance_are_explicit(self):
        text = (FUTURE / "image-budget-audit.md").read_text(encoding="utf-8")
        self.assertAlmostEqual(147 * 4 / 60, 9.8)
        self.assertIn("$30 working", text)
        self.assertIn("working estimate **$39**", text)
        self.assertIn("exclude your already-paid subscription", text)
        self.assertIn("planning proxies", text)
        self.assertIn("no purchase or generation authorized", text.lower())


if __name__ == "__main__":
    unittest.main()
