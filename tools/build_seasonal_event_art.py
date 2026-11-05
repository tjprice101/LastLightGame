"""Reproduce reference-free event enemy/material prompts from the event spec."""
from pathlib import Path
import re

from build_elemental_war_art import RENDERER
from build_moon_banner_art import MARGIN, NO, PALETTE, RARITIES, COLOR_NO, cutout
from build_sunshade_banner_art import PALETTE as SUN_PALETTE, COLOR_NO as SUN_NO
from prompt_quality import SHARP

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "docs" / "moon-sunshade-events.md"
OUTPUT = ROOT / "Art" / "creatures" / "Moon and Sunshade Events.md"
FAMILIES = (
    dict(slug="moon", family="Moonwake", enemy="Vesperwing",
         identity="one compact lunar harbor moth Devourer, dark central carapace, white antennae, white-silver moth wings, one crescent ferry-token chest plate and split tail ribbon; no humanoid body or held weapon",
         palette=PALETTE, color_no=COLOR_NO),
    dict(slug="sunshade", family="Dawnforge", enemy="Solcarapace",
         identity="one compact solar scarab Devourer, one black beetle body, gold carapace ridges, exactly six small armored legs, split wing cases, one gold wedge head crest and paired round shoulder vents; antennae fully visible, no humanoid body or held weapon",
         palette=SUN_PALETTE, color_no=SUN_NO),
)
TIERS = ("Seed", "Bud", "Bloom", "Crest", "Heart", "Soul")


def rows_for(family):
    source = SPEC.read_text(encoding="utf-8")
    enemy_rows = re.findall(rf"^\| ({'|'.join(RARITIES)}) \| ([^|]*{family['enemy']}) \| ([^|]+) \|$", source, re.M)
    start = source.index(f"### {family['family']} evolution and infusion chain")
    section = source[start:].split("\n### Shared art composition", 1)[0]
    material_rows = re.findall(rf"^\| ({'|'.join(TIERS)}) \| ([^|]+) \|$", section, re.M)
    if tuple(row[0] for row in enemy_rows) != RARITIES or tuple(row[0] for row in material_rows) != TIERS:
        raise ValueError(f"Incomplete six-form/material design: {family['family']}")
    return enemy_rows, material_rows


def blocks():
    rows = []
    for family in FAMILIES:
        enemies, materials = rows_for(family)
        for stage, (rarity, name, design) in enumerate(enemies, 1):
            craft = ("simple early craft, not a mature Omnic wing array" if stage < 3 else
                     "dense majestic late-form craft, central body and complete antennae/legs clear" if stage >= 5 else
                     "layered stage-appropriate craft, compact central body retained")
            prompt = (
                f"full-body gacha JRPG creature illustration, {family['identity']}. {design.strip()} "
                f"{RENDERER}, same compact species proportions in every form, {craft}. {family['palette']}. "
                f"Opaque sharply bounded non-emissive powers, painted metal reflections only. {SHARP}. {MARGIN}. "
                "plain solid green background (#00FF00), flat unlit color edge to edge and through all openings; "
                "no glows or glowing visual effects, subject colors unchanged, no scenery. "
                f"--ar 4:3 --niji 6 --s 100 --q 1 --no {NO}, {family['color_no']}, humanoid, "
                "people, hands, held weapons, extra creatures"
            )
            rows.append((f"{family['slug']}-{family['enemy'].lower()}-{stage}.png",
                         f"{name.strip()} / {rarity}", prompt, design.strip()))
        for tier, design in materials:
            prompt = cutout(
                f"one standalone {tier.lower()} crafting material, {design.strip()} "
                "recognizable original seed capsule retained through the chain; no faces or figures",
                palette=family["palette"], color_no=family["color_no"],
            )
            rows.append((f"{family['family'].lower()}-{tier.lower()}.png",
                         f"{tier} of {family['family']}", prompt, design.strip()))
    return rows


def document():
    parts = [
        "# Moon and Sunshade: signature activity enemy and material art",
        "**24 copy-ready prompts; no delivered images. Twelve fixed creature forms and twelve materials.**",
        "[Activity/loot/progression specification](../../docs/moon-sunshade-events.md) | "
        "[Moon character/scenery pack](../characters/Glow%20of%20the%20Moon's%20Light.md) | "
        "[Sunshade character/scenery pack](../characters/The%20Angel-blazened%20Sunshade.md) | "
        "[Full remaining-art checklist](../../docs/remaining-expansion-art.md)",
        "Reproduce: `python tools/build_seasonal_event_art.py`. Names remain outside image prose. "
        "Banner and gamemode names must differ from character identity and Omnic titles, yet "
        "remain symbolic of the same event. No copied Roselius or Rose material artwork.",
        "## Source count and export contract",
        "| Event | Enemy forms | Seed→Soul materials | Total |\n|---|---:|---:|---:|\n"
        "| Harbor of Unreturned Names / Moon |6|6|12|\n"
        "| Beneath the Borrowed Dawn / Sunshade |6|6|12|\n| Total |12|12|24|",
        "Bosses use the same authored form artwork as ordinary encounters, not extra portraits. "
        "The captured same-event forms are infusion fodder; no extra specialty-item chain. "
        "Each event's banner/event splash, header and arena are already counted in its character pack. "
        "No separate map, chest, reward logo or Profile image is required.",
        "Enemies and materials are reference-free. Original compact anime/cel species renderer, "
        "complete silhouettes within70% and continuous15% solid green-key safety margin on every side. "
        "Future reviewed offline keying only; never remove supplied alpha or globally erase matching "
        "gems/highlights. Cutout powers opaque and non-emissive, scenery separately full-bleed. "
        "Creature names, material labels, stacks and clocks stay accessible HTML.",
    ]
    for asset, label, prompt, design in blocks():
        parts.extend((f"## {label}", f"Proposed export: `{asset}` (not a runtime URL).",
                      f"**Design / intentional change:** {design}", f"```text\n{prompt}\n```"))
    return "\n\n".join(parts).rstrip() + "\n"


if __name__ == "__main__":
    OUTPUT.write_text(document(), encoding="utf-8")
    print(f"Wrote {len(blocks())} event prompt proposals to {OUTPUT}")
