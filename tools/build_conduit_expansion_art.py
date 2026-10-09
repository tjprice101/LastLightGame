"""Generate catalog icon prompts from the approved design table."""
from pathlib import Path
import re
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
PALETTES = {
    "Infernic": "crimson orange charcoal ivory and opal",
    "Aquatic": "sapphire blue sea teal ivory silver and opal",
    "Tectonic": "gray stone bronze ivory platinum and opal",
    "Efflorescent": "emerald green leaf jade ivory platinum and opal",
    "Voltaic": "yellow violet graphite ivory platinum and opal",
    "Atmospheric": "teal sky blue ivory silver and opal",
    "Luminous": "white pearl pale yellow ivory platinum and opal",
    "Ominous": "obsidian violet black silver and opal",
    "Tranquilitic": "ivory pale turquoise pearl platinum and opal",
    "Chaotic": "scarlet obsidian violet platinum and opal",
}


def designs():
    tier = None
    rows = []
    for line in (ROOT / "docs" / "conduit-expansion-plan.md").read_text(encoding="utf-8").splitlines():
        heading = re.match(r"### (Common|Rare|Legendary|Omnic) -", line)
        if heading:
            tier = heading.group(1)
        if not re.match(r"\| \d\d \|", line):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        number, name = cells[:2]
        element = None
        if tier == "Omnic":
            element, name = name.split(" / ", 1)
        rows.append((int(number), tier, name, element, cells[-1]))
    if len(rows) != 35 or [row[0] for row in rows] != list(range(1, 36)):
        raise ValueError("Expected exactly the approved35 consecutive design rows.")
    return rows


def document():
    text = [
        "# Expanded Conduit icon prompts",
        "Copy-ready reference-free1:1 prompts for all35 approved additions. "
        "[Catalog, mechanics and acquisition](../../docs/conduit-expansion-plan.md) "
        "are separate from these icon designs. Runtime entries are art-pending; "
        "these proposed IDs are not URLs and generation is not installed artwork.",
        "Preserve original bytes under Art/source/conduit-expansion. Review each "
        "background, enclosed opening, pale metal, crystal facet and intentional "
        "shadow individually. Export transparent256px icons with224px content, "
        "keeping originals and provenance; do not reuse an unrelated device icon "
        "or register a missing PNG. All levels keep this icon until separately approved "
        "art changes; restoration meters are runtime UI, not generated text.",
    ]
    materials = {
        "Common": "a small recovered bronze mechanism with compact restrained ceramic and crystal details",
        "Rare": "an intricate restored silver mechanism with interlocking articulated parts and crisp crystal insets",
        "Legendary": "a formidable majestic platinum and ivory ancient-war mechanism with layered open mechanical architecture",
        "Omnic": "an awe-inspiring fully restored prismatic ancient-war masterpiece with elaborate articulated architecture solid opal facets and painted prismatic shine",
    }
    for number, tier, name, element, identity in designs():
        asset = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        if element:
            asset = element.lower() + "-" + asset
        palette = PALETTES[element] if element else (
            "bronze ivory and clear crystal" if tier == "Common" else
            "silver ivory and opal" if tier == "Rare" else "platinum white ivory and opal"
        )
        prompt = (
            f"one {identity.lower()}, {materials[tier]}, recognizable complete device silhouette "
            "with distinct moving joints and a protected central mechanism, original fantasy "
            "machinery not modern electronics, "
            f"jewel-like saturated {palette} subject colors, compact chibi anime gacha "
            "collectible renderer clean precise contours crisp cel shading smooth painted "
            "non-emissive highlights, opaque solid metal ceramic crystal and energy shapes "
            "with crisp hard edges, every articulated component and effect tip fully visible "
            "with a generous continuous safety margin on all four sides and corners, "
            "whole ensemble occupying roughly two thirds of canvas, pull back the whole "
            "design rather than crop or simplify it, "
            "plain solid green background (#00FF00), flat unlit color edge to edge and "
            "through all openings, subject colors unchanged, no glows or glowing visual "
            "effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 "
            "--no face, eyes, character, hands, scenery, horizon, text, letters, numbers, "
            "runes, logo, watermark, interface, frame, cropping, photorealism, 3d render, "
            "modern electronics, cables leaving frame, transparent energy, fog, "
            "background gradient, textured background, background vignette, background "
            "color spill, glow, light bloom, soft aura, haze, light spill"
        )
        text.append(f"## {number:02d}. {name} ({tier}{' / ' + element if element else ''})\n\n"
                    f"Proposed art ID: `{asset}`.\n\n```text\n{prompt}\n```")
    text.append("Reproduce: `python tools\\build_conduit_expansion_art.py`. "
                "Validate: `python -m unittest discover -s tools -p test_conduit_expansion_art.py`.")
    return "\n\n".join(text) + "\n"


if __name__ == "__main__":
    (art_path("Conduit Expansion.md", root=ROOT)).write_text(document(), encoding="utf-8")
