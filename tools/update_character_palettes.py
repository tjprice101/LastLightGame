"""Scoped/idempotent character codemod; never edits images, enemies or scenery."""
from pathlib import Path
import re
from character_palette import PALETTES, apply_palette
from art_library import art_documents

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "Art"
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)


def portrait_name(path, prefix):
    name = path.stem.removesuffix(" Art")
    if name in PALETTES:
        return name
    if path.name == "Starter Art.md":
        heading = re.findall(r"^#{1,6} (.+)$", prefix, re.M)[-1]
        for character in ("Infernis", "Tizu", "Flora"):
            if character in heading:
                return character
    if path.name == "midjourney-character-style-prompt.md":
        headings = re.findall(r"^### (Fire: Ember Swordsman|Water: Tide Spearbearer|Grass: Sprout Archer)$", prefix, re.M)
        if not headings:
            return "Template"
        heading = headings[-1]
        return {"Fire: Ember Swordsman": "Infernis", "Water: Tide Spearbearer": "Tizu",
                "Grass: Sprout Archer": "Flora"}[heading]
    raise ValueError(f"Unmapped referenced portrait: {path.name}")


def rewrite(path):
    original = path.read_text(encoding="utf-8")
    count = 0

    def replace(match):
        nonlocal count
        prompt = match.group(1)
        portrait = "--ar 4:3" in prompt and "--sref" in prompt
        character_cutout = path.stem.removesuffix(" Art") in PALETTES and re.search(r"--ar (?:1:1|3:2)\b", prompt)
        if not portrait and not character_cutout:
            return match.group(0)
        name = portrait_name(path, original[:match.start()])
        count += 1
        updated = apply_palette(prompt, name)
        return match.group(0).replace(prompt, updated, 1)

    updated = BLOCK.sub(replace, original)
    if count:
        updated = updated.replace(
            "Solid key backgrounds are exempt; icons/scenery and installed images unchanged.",
            "Character-specific icons/weapons share the palette without reference flags. "
            "Solid keys, scenery and installed images unchanged.")
        updated = updated.replace("`--sw 400`", "`--sw 150`").replace("weight400", "weight150")
        note = (
            "**Palette control (D-159):** every portrait retains its exact reference URL at150, "
            "with identity-specific subject palette locks and unwanted-color exclusions. "
            "Prismatic/opal describes faceting inside that palette, not extra hues. "
            "Character-specific icons/weapons share the palette without reference flags. "
            "Solid keys, scenery and installed images unchanged.\n\n"
        )
        if "**Palette control (D-159):**" not in updated:
            first = updated.index("\n") + 1
            updated = updated[:first] + "\n" + note + updated[first:].lstrip("\n")
    return updated, count


if __name__ == "__main__":
    total = 0
    for path in sorted(art_documents()):
        updated, count = rewrite(path)
        if count:
            path.write_text(updated, encoding="utf-8")
            total += count
            print(f"{path.name}: {count} character cutouts")
    print(f"Total: {total} character cutouts")
