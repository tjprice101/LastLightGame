"""Generate the 25 kit-Conduit prompts from their runtime identities."""
from collections import Counter
from pathlib import Path
import re
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
PALETTES = {
    "infernic": ("crimson scarlet orange charcoal ivory bronze gold and platinum", "blue, navy, cyan, violet, pink"),
    "oceanic": ("sapphire blue teal pearl white ivory silver bronze and platinum", "red, orange, violet, pink"),
    "atmospheric": ("teal turquoise sky blue yellow ivory silver bronze and platinum", "red, orange, violet, pink"),
    "botanic": ("emerald green jade gray stone ivory bronze and platinum", "blue, navy, cyan, red, pink, violet"),
    "tranquilitic": ("ivory pearl white pale turquoise silver bronze and platinum", "red, orange, violet, pink"),
    "chaotic": ("obsidian black crimson scarlet violet ivory silver and platinum", "blue, navy, cyan, yellow, pink"),
}
MATERIALS = {
    "Common": "small restrained recovered bronze mechanism with compact ceramic details",
    "Rare": "intricate restored silver mechanism with clearly interlocking articulated components",
    "Legendary": "formidable majestic platinum and ivory ancient-war mechanism with layered open architecture",
    "Omnic": "awe-inspiring fully restored ancient-war masterpiece with immense articulated architecture and elaborate bounded prismatic facets",
}


def designs():
    text = (ROOT / "src" / "content" / "kit-conduits.ts").read_text(encoding="utf-8")
    pattern = r"\{ id: '([^']+)', name: '([^']+)', rarity: '([^']+)', price: (?:null|\d+), theme: '([^']+)',.*?artDesign: '([^']+)' \}"
    rows = re.findall(pattern, text, re.S)
    if len(rows) != 25 or len({row[0] for row in rows}) != 25:
        raise ValueError("Expected 25 unique runtime kit-Conduit identities.")
    if Counter(row[2] for row in rows) != {"Common": 5, "Rare": 8, "Legendary": 6, "Omnic": 6}:
        raise ValueError("Kit-Conduit rarity distribution must be 5/8/6/6.")
    return rows


def document():
    sections = [
        "# Kit-focused Conduit icon prompts",
        "25 reference-free copy-ready prompts matched to the implemented runtime catalog. "
        "[Mechanics, acquisition and validation](../../docs/kit-conduits.md). "
        "Art IDs below are identities, not URLs or installed imagery. All25 entries "
        "remain art-pending until supplied originals are reviewed and exported.",
        "Preserve originals under Art/source/kit-conduits. Review each key, enclosed "
        "opening, ivory metal, crystal facet and shadow individually. Export transparent "
        "256px icons with224px content; never reuse an unrelated icon, request a missing "
        "PNG, or remove authoritative supplied alpha. Rarity affects complexity, not "
        "extra out-of-palette hues. Elemental theme does not restrict Common/Rare/"
        "Legendary equipment; only Omnic requires the matching combat element.",
    ]
    for number, (asset, name, rarity, theme, identity) in enumerate(designs(), 1):
        palette, negatives = PALETTES[theme]
        prompt = (
            f"one {identity}, {MATERIALS[rarity]}, original fantasy machinery not modern electronics, "
            "recognizable complete device silhouette with distinct moving joints and protected "
            f"central mechanism, jewel-like {palette} subject colors, compact chibi anime gacha "
            "collectible renderer clean precise contours crisp cel shading smooth painted "
            "non-emissive highlights, opaque solid metal ceramic crystal and elemental shapes "
            "with crisp hard edges, strict subject palette lock use ONLY the listed subject "
            "colors with black and white shading, prismatic means faceting within this same "
            "palette not rainbow colors, no outlying hues or cool highlights outside the "
            "listed palette, every component and effect tip fully visible with a generous "
            "continuous safety margin on all four sides and corners, whole ensemble occupying "
            "roughly two thirds of canvas, pull back the whole design rather than crop or "
            "simplify it, palette restriction applies only to subject never to the background, "
            "plain solid green background (#00FF00), flat unlit color edge to edge and through "
            "all openings, subject colors unchanged, no glows or glowing visual effects, "
            "non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 "
            f"--no {negatives}, face, eyes, character, hands, scenery, horizon, text, letters, "
            "numbers, runes, logo, watermark, interface, frame, cropping, photorealism, "
            "3d render, modern electronics, cables leaving frame, transparent energy, fog, "
            "background gradient, textured background, background vignette, background color "
            "spill, glow, light bloom, soft aura, haze, light spill"
        )
        sections.append(f"## {number:02d}. {name} ({rarity} / {theme.title()})\n\n"
                        f"Art ID: `{asset}`.\n\n```text\n{prompt}\n```")
    sections.append("Reproduce: `python tools\\build_kit_conduit_art.py`. "
                    "Validate: `python -m unittest discover -s tools -p test_kit_conduit_art.py`.")
    return "\n\n".join(sections) + "\n"


if __name__ == "__main__":
    art_path("conduits", "Kit Conduits.md", root=ROOT).write_text(document(), encoding="utf-8")
