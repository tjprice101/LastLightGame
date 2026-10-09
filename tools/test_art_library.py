from pathlib import Path
import re
from tempfile import TemporaryDirectory
import unittest
from urllib.parse import unquote

from art_library import ART, ROOT, GROUPS, RELOCATIONS, art_documents, art_path, canonical_relative
from organize_art_library import rewrite_markdown, rewrite_python


class ArtLibraryTests(unittest.TestCase):
    def test_each_canonical_pack_exists_once_and_no_flat_packs_remain(self):
        self.assertEqual(len(RELOCATIONS), 37)
        for name, relative in RELOCATIONS.items():
            with self.subTest(name=name):
                self.assertTrue((ART / relative).is_file())
                self.assertFalse((ART / name).exists())
                self.assertEqual(art_path(name), ART / relative)
                self.assertEqual(canonical_relative(relative), relative)
                expected = 2 if name == "Flaming Depths.md" else 1
                self.assertEqual(len(list(ART.rglob(name))), expected)
        self.assertEqual(len(art_documents()), 38)
        for group in GROUPS:
            self.assertTrue((ART / group).is_dir())

    def test_provenance_and_sources_are_separate_from_prompt_filing(self):
        records = list((ART / "provenance").glob("*.json"))
        self.assertEqual(len(records), 26)
        self.assertEqual(list(ART.glob("*.json")), [])
        for path in records:
            self.assertEqual(art_path(path.name), path)
        for name in ("dungeons", "gamemodes"):
            self.assertEqual(art_path(name), ART / "creatures" / name)
        self.assertEqual(art_path("source", "cutouts"), ART / "source" / "cutouts")
        with self.assertRaises(ValueError):
            art_path("..", "secret")
        with self.assertRaises(ValueError):
            art_path(ROOT)

    def test_local_links_in_every_art_document_resolve(self):
        for path in ART.rglob("*.md"):
            if ART / "source" in path.parents:
                continue
            for target in re.findall(r"\]\(([^)]+)\)", path.read_text(encoding="utf-8")):
                local = target.strip("<>").split("#", 1)[0]
                if not local or re.match(r"[a-zA-Z][\w+.-]*:", local):
                    continue
                with self.subTest(document=str(path.relative_to(ART)), link=target):
                    self.assertTrue((path.parent / unquote(local)).exists())

    def test_link_relocation_preserves_labels_anchors_and_external_references(self):
        old = ART / "Conduits.md"
        new = art_path("Conduits.md")
        target = ART / "Currencies.md"
        moved = {old: new, target: art_path("Currencies.md")}
        text = "[Currencies.md](Currencies.md#coins) [web](https://example.com/a) ![img](source/unchanged.png)"
        updated = rewrite_markdown(text, old, new, moved)
        self.assertEqual(updated, "[Currencies.md](../items/Currencies.md#coins) "
                         "[web](https://example.com/a) ![img](source/unchanged.png)")

    def test_python_refactor_changes_only_art_library_paths(self):
        text = ('from pathlib import Path\n'
                'ROOT = Path(".")\n'
                'ART = ROOT / "Art"\n'
                'pack = ROOT / "Art" / "Conduits.md"\n'
                'record = ART / filename\n'
                'source = ROOT / "Art" / "source" / "file.png"\n')
        updated = rewrite_python(text)
        self.assertIn('pack = art_path("Conduits.md", root=ROOT)', updated)
        self.assertIn("record = art_path(filename, root=ART.parent)", updated)
        self.assertIn('source = ROOT / "Art" / "source" / "file.png"', updated)

    def test_caller_roots_and_fresh_provenance_directories_remain_isolated(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            target = art_path("root-art-intake.json", root=root)
            self.assertEqual(target, root / "Art" / "provenance" / "root-art-intake.json")
            self.assertFalse(target.exists())
            self.assertFalse((root / "Art").exists())
        text = ('from pathlib import Path\n'
                'ROOT = Path(".")\n'
                'path = intake.ROOT / "Art" / "machines-art-intake.json"\n'
                'other = root / "Art" / "machines-art-intake.json"\n')
        updated = rewrite_python(text)
        self.assertIn('art_path("machines-art-intake.json", root=intake.ROOT)', updated)
        self.assertIn('art_path("machines-art-intake.json", root=root)', updated)


if __name__ == "__main__":
    unittest.main()
