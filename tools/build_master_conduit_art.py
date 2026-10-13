"""Generate Master icon prompts from the curated TypeScript catalogue."""
import ast
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
import re

from character_palette import PALETTES

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "Art" / "conduits" / "Master Conduits.md"
CHARACTERS = {
    "ember": "Infernis", "tide": "Tizu", "sprout": "Flora",
    **{name.lower(): name for name in PALETTES if name not in
       {"Infernis", "Tizu", "Flora", "Template"}},
}
STRING = r"'(?:\\.|[^'\\])*'"
ENTRY = re.compile(
    rf"\s*master\(\s*({STRING})\s*,\s*([123])\s*,\s*({STRING})\s*,"
    rf"\s*({STRING})\s*,\s*({STRING})\s*,\s*(\{{.*?\}})\s*\)\s*,",
    re.S,
)
# Only palette contradictions change; the catalogue's mechanism stays intact.
DESIGN_COLORS = {
    "Thornia": {"violet": "deep crimson"},
    "Orvella": {"ochre": "jasper red", "bronze": "copper"},
    "Vaelor": {"gold": "copper", "black": "navy"},
}


@dataclass(frozen=True)
class MasterDesign:
    id: str
    character: str
    slot: int
    name: str
    effect: str
    design: str
    rarity: str = "Omnic"


def catalogue(text=None):
    """Bound parsing to the array and reject any unparsed/changed entry shape."""
    if text is None:
        text = (ROOT / "src" / "content" / "master-conduits.ts").read_text(encoding="utf-8")
    helper = re.search(r"function master\(.*?\n\}", text, re.S)
    if helper is None or not re.search(
        r"id:\s*`master-\$\{character\}-\$\{slot\}`.*?rarity:\s*'Omnic'",
        helper.group(), re.S,
    ):
        raise ValueError("Master ID/Omnic factory contract changed.")
    array = re.search(r"export const masterConduits = \[(.*?)\] as const;", text, re.S)
    if array is None:
        raise ValueError("Missing bounded Master catalogue.")
    body, position, rows = array.group(1), 0, []
    while body[position:].strip():
        match = ENTRY.match(body, position)
        if match is None:
            raise ValueError(f"Unparsed Master entry at catalogue offset {position}.")
        character, slot, name, effect, design, rule = match.groups()
        character = ast.literal_eval(character)
        if character not in CHARACTERS or not re.search(r"\btrigger:\s*" + STRING, rule):
            raise ValueError("Unknown character or missing Master rule.")
        rows.append(MasterDesign(
            f"master-{character}-{slot}", CHARACTERS[character], int(slot),
            ast.literal_eval(name), ast.literal_eval(effect), ast.literal_eval(design),
        ))
        position = match.end()
    if (len(rows) != 48 or len({row.id for row in rows}) != 48
            or len({row.name for row in rows}) != 48
            or len({row.design for row in rows}) != 48
            or Counter(row.character for row in rows) != Counter({name: 3 for name in CHARACTERS.values()})
            or any({row.slot for row in rows if row.character == name} != {1, 2, 3}
                   for name in CHARACTERS.values())):
        raise ValueError("Expected 48 unique Omnic Masters, exactly three per character.")
    chest = re.search(r"export const masterChest = \{(.*?)\} as const;", text, re.S)
    if chest is None:
        raise ValueError("Missing Master chest.")
    fields = {}
    for key in ("id", "name", "description"):
        field = re.search(rf"\b{key}:\s*({STRING})", chest.group(1))
        if field is None:
            raise ValueError(f"Missing chest {key}.")
        fields[key] = ast.literal_eval(field.group(1))
    return rows, fields


def palette_design(row):
    design = re.sub(r"^A ", "", row.design)
    for original, replacement in DESIGN_COLORS.get(row.character, {}).items():
        design = re.sub(rf"\b{original}\b", replacement, design)
    return design


def prompt(subject, colors, negatives, *, emblem=False, key=("green", "#00FF00")):
    framing = (
        "complete artwork fully inside the canvas, every mechanical ornament and effect tip "
        "visible, continuous safety margin on all four sides and corners, "
        "nothing touches or crosses the frame edges"
    )
    architecture = (
        "small clean readable mechanic emblem with one protected central reserve crystal, "
        "three broad nested storage brackets, simple thick contours and few separated parts, "
        "no complex machine architecture"
        if emblem else
        "fully reborn Omnic cosmic-level engineered architecture of planetary scale, "
        "monumental articulated armor and densely layered interlocking interior mechanisms, "
        "expand the authored device and its distinctive wings rails cages or shutters rather "
        "than substitute a generic gadget, almost no dead space INSIDE the object, "
        "nested mechanical layers fill rear interior gaps with narrow readable key channels, "
        "protected readable central mechanism never buried by ornament, opaque mechanical "
        "flames shaped as solid faceted exhaust tongues locked to the mechanism"
    )
    return (
        f"one {subject}, {framing}, {architecture}, "
        "original fantasy machinery not modern electronics, "
        f"strict subject palette lock: ONLY {colors} plus white black gold and platinum "
        "neutral details, prismatic and opal mean faceting within the listed palette not "
        "extra hues, no generic element repaint, subject palette excludes the key background, "
        "compact clean anime gacha collectible renderer, clean precise contours crisp cel "
        "shading smooth painted non-emissive highlights, opaque metal ceramic crystal "
        "and solid-color mechanical effects with crisp hard edges, "
        "whole ensemble at most 70% canvas width and height with at least 15% continuous "
        "outer clearance per side measured from every outermost tip, "
        f"{framing}, pull back the entire ensemble uniformly never crop delete or simplify "
        "authored components to fit, "
        f"plain solid {key[0]} background ({key[1]}), flat unlit color edge to edge and through "
        "all openings, subject colors unchanged, no glows or glowing visual effects, "
        "non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 "
        f"--no {negatives}, text, letters, numbers, runes, logo, watermark, interface, "
        "frame, cropping, photorealism, 3d render, modern electronics, floating tiny gadget, "
        "transparent energy, additive light, fog, background gradient, textured background, "
        "background vignette, background color spill, glow, glowing effects, light bloom, "
        "soft aura, haze, light spill"
    )


def document():
    rows, chest = catalogue()
    sections = [
        "# Master Conduits — combined art prompts",
        "All48 unique Master icons are Omnic:16 Element-Bearers with three curated "
        "mechanisms each. Includes Cosmic Grand Master Chest and ONLY one new mechanic "
        "emblem, Astral Reserve (50 prompts total). Art delivered and installed (D-226) "
        "through tools\\intake_master_conduit_art.py; prompts are retained for provenance. "
        "Stable Master IDs, exact names, effect contracts "
        "and source designs derive from src\\content\\master-conduits.ts. "
        "This prompt file introduces no gameplay changes.",
        "Reuse existing Burn, Weaken, Fracture, AttackBoost, Shield, Gauge and protection "
        "presentation; retain readable effect names, owners, counts and clocks. No new "
        "icons for those mechanics, healing, cooldowns or per-character Reserve variants. "
        "Astral Reserve uses one shared emblem and actual text/counts, not merged native "
        "resources. Cosmic/planetary machinery is dense INSIDE its silhouette, never "
        "in the continuous outer safety margin. Review generated pixels before any intake; "
        "preserve owner sources and supplied alpha, with no runtime background removal.",
        "Character palettes come from tools\\character_palette.py, not element-wide "
        "repainting. Exact catalogue design prose is retained below for provenance; "
        "Thornia's violet is remapped to deep crimson, Orvella's ochre/bronze to "
        "jasper red/copper, and Vaelor's gold/black to copper/navy in copy-ready prompts "
        "to respect their actual palettes without changing mechanisms. "
        "Keys remain exempt; Botanic/Elise green subjects use a contrasting magenta key.",
    ]
    for index, row in enumerate(rows, 1):
        colors, exclusions, _ = PALETTES[row.character]
        key = ("magenta", "#FF00FF") if row.character in {"Flora", "Elise"} else ("green", "#00FF00")
        negatives = ", ".join(value for value in exclusions.split(", ") if value != key[0])
        sections.append(
            f"## {index:02d}. {row.name} (Omnic / {row.character})\n\n"
            f"Art ID: `{row.id}`. Character: {row.character}. Master option: {row.slot}.\n\n"
            f"Effect contract: {row.effect}\n\nCatalogue design: {row.design}\n\n"
            f"```text\n{prompt(palette_design(row), colors, negatives, key=key)}\n```"
        )
    sections.append(
        f"## 49. {chest['name']}\n\nArt ID: `{chest['id']}`.\n\n"
        f"Effect contract: {chest['description']}\n\n```text\n" + prompt(
            "cosmic and planetary locked grand mechanically flaming chest, enormous sealed "
            "armored coffer with a protected central planetary combination lock, intermeshed "
            "orbital bolt rings, heavy hinged lid, stacked celestial vault plates and "
            "mechanically anchored flame shutters, visibly locked not open",
            "obsidian ink blue violet ivory antique gold and platinum",
            "character, face, hands, scenery, horizon, open lid, contents, loot pile",
        ) + "\n```"
    )
    sections.append(
        "## 50. Astral Reserve — shared mechanic emblem\n\n"
        "Art ID: `astral-reserve` (runtime public\\assets\\master-conduits\\astral-reserve.png).\n\n"
        "Effect contract: personal stored Astral Reserve, earned on every qualifying native outcome, capped at three; "
        "the equipped Master's exact trigger, spend action and per-reserve payout are "
        "the catalogue contracts above. Show actual count and label as readable text.\n\n"
        "```text\n" + prompt(
            "Astral Reserve storage emblem, one faceted ivory reserve crystal seated in "
            "a compact platinum clasp with three ink-blue storage notches",
            "ivory platinum ink blue",
            "character, face, hands, scenery, horizon, flame, wings, machinery clutter",
            emblem=True,
        ) + "\n```"
    )
    sections.append(
        "Reproduce: `python tools\\build_master_conduit_art.py`. "
        "Validate: `python -m unittest discover -s tools -p test_master_conduit_art.py`."
    )
    return "\n\n".join(sections) + "\n"


if __name__ == "__main__":
    OUTPUT.write_text(document(), encoding="utf-8")
