"""Preserve authored Machine designs while testing lower reference influence."""
from pathlib import Path
import re
from character_palette import palette_clause
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
PILOTS = (
    (3, "Rare - Ivory Kirin / stages35-50 / Tranquilitic",
     "warm cream-ivory ceramic body plates and wing vanes, champagne pearl clasps, neutral silver antlers and joints, pale blush rose limited to sensor eyes and two slender ribbons, cream-and-silver shadows",
     "magenta, fuchsia, purple armor, violet armor, lavender metal, navy armor, blue armor, flames, fire"),
    (4, "Epic - Celestial Leviathan / stages51-67 / Aquatic",
     "sapphire and cobalt sea-dragon armor and fin wings, ivory shoulder plates, platinum seams, pearl mantle, blue tide ribbons, small opal insets, deep cobalt shadows",
     "magenta, fuchsia, purple armor, violet armor, lavender metal, red ribbons, flames, fire"),
    (6, "Legendary - Crowned Phoenix / stages68-84 / Infernic",
     "crimson primary phoenix armor and feather vanes, charcoal structural joints, ivory secondary plates, gold crown and trim, warm crimson shadows, small prismatic opal insets rather than rainbow body plates",
     "navy armor, blue armor, cobalt armor, lavender metal, purple armor, magenta ribbons"),
)


def pilot_prompts():
    pack = (art_path("Awaken the Machines.md", root=ROOT)).read_text(encoding="utf-8")
    guide = (art_path("midjourney-character-style-prompt.md", root=ROOT)).read_text(encoding="utf-8")
    references = dict(re.findall(r"^\| Enemy Evo ([1-6]) \| (https://\S+) \|$", guide, re.M))
    result = []
    for stage, heading, palette, exclusions in PILOTS:
        section = pack.split("### " + heading + "\n", 1)[1]
        body = re.search(r"```text\n(.*?)\n```", section, re.S).group(1)
        if "--sref" in body or "--sw" in body:
            raise ValueError("Pilot must start from the unreferenced production baseline.")
        body = body.replace("flat unlit color edge to edge through all openings",
                            "flat unlit color edge to edge and through all openings, subject colors unchanged")
        body = body.replace(
            "authored creature colors control every body plate wing ribbon and gem; "
            "the style reference guides linework cel shading and compact proportions only, "
            "not its palette costume or composition; retain the described palette without "
            "recoloring it to match the reference, ", "")
        display_heading = heading
        if stage == 6:
            display_heading = "Omnic design test - Crowned Phoenix / Infernic (non-runtime)"
            body = body.replace(
                "one magnificent angelic futuristic mechanical phoenix",
                "one awe-inspiring fully reborn divine mechanical phoenix")
            body = body.replace(
                "majestic crimson ivory platinum segmented armor giant feather pauldrons eight elaborate mechanical blade-feather wings divided royal mantle high collar nested sun crown",
                "fully restored crimson ivory platinum layered armor monumental feather pauldrons "
                "twelve articulated mechanical blade-feather wings in three opposing tiers "
                "split imperial mantle high collar triple interlocking gold sun crown")
            body = body.replace(
                "opposing opaque gold crimson flame ribbons tilted broken solar rings interwoven feather arches off-axis thorn fans dense prismatic petal fragments",
                "six opposing opaque gold crimson flame ribbons three tilted broken solar rings "
                "interwoven blade-feather cathedral arches asymmetric articulated tail fans "
                "dense small prismatic opal petal fragments")
            body = body.replace(
                "jewel-like crimson gold ivory platinum sapphire and opal colors",
                "jewel-like crimson gold ivory platinum charcoal and small opal accents")
        positive, flags = body.split(" --ar ", 1)
        flags += ", " + exclusions
        prompt = (
            f"authored creature palette and identity first: {palette}; "
            + positive + " --ar " + flags
            + f" --sref {references[str(stage)]} --sw 10"
        )
        result.append((display_heading, body, prompt))
    return result


def rosetta_pilot():
    pack = (art_path("Rosetta Art.md", root=ROOT)).read_text(encoding="utf-8")
    heading = "Evo.5 / Legendary - Sovereign of Passion, Rosetta"
    section = pack.split("### " + heading + "\n", 1)[1]
    original = re.search(r"```text\n(.*?)\n```", section, re.S).group(1)
    reference = re.search(r" --sref (https://\S+) --sw 150$", original)
    if reference is None:
        raise ValueError("Expected Rosetta's exact approved Legendary reference at150.")
    prompt = original.replace(
        ", plain solid green background",
        ", do not incorporate contrasting colors into the overall subject art design"
        ", plain solid green background", 1)
    return heading + " (palette test, non-runtime)", prompt


def document():
    parts = [
        "# Enemy style-reference and authored-palette pilot (D-158)",
        "Owner wants the reference renderer without its palette/design transfer. "
        "Revision3 retains --sw10 after the owner's Kirin comparison rejected "
        "weight50: cool lavender/navy metal and saturated magenta details still "
        "overrode warm ivory/pale rose. This is reduced influence, not a claim "
        "that style references can be renderer-only. Three alternatives retain "
        "the existing exact references on distinctly pale, "
        "blue and crimson creatures. Production packs stay reference-free; "
        "installed art remains unchanged. These are generation experiments, "
        "not evidence that Midjourney can perfectly separate style from design.",
        "Phoenix now tests an Omnic-level written design with the existing Enemy "
        "Evo6 Omnic reference: fully reborn armor, twelve tiered mechanical wings, "
        "triple crown and denser articulated regalia. Its crimson/fire identity "
        "and70% ensemble ceiling/15% margins remain. This changes both design "
        "complexity and reference, not a reference-only controlled comparison. "
        "Kirin and Leviathan prompts are unchanged. The installed Legendary "
        "Phoenix, its stage schedule, rewards and rarity are unchanged.",
        "Retry these three prompts using the existing references; no new reference "
        "artwork, grayscale derivative or additional image generation prerequisite. "
        "Keep the same seed/model/settings as the previous result where available. "
        "Material-specific color placement and individual exclusions replace "
        "repeated 'style only' instructions. Kirin keeps pale rose, Leviathan "
        "keeps blue, Phoenix keeps fire and small prismatic insets. "
        "Do not add an image prompt or character reference. Use only "
        "the exact owner-supplied style URL; if expired, request a refreshed owner "
        "URL rather than inventing one.",
        "Accept only after owner/full-resolution review: authored species, "
        "equipment and palette preserved; no reference costume, accidental flames "
        "or navy accents; renderer still approved; complete tips inside the "
        "production safety margins; flat unlit key color through openings. "
        "Legitimate blue on Leviathan and fire on Phoenix are not errors. "
        "Do not simplify the grand design to create margins.",
        "If influence persists on enemies, lower reference weight or use the reference-free "
        "control. Stop for owner review before changing all enemies. "
        "Character palettes must receive individual treatment, not global blue/fire "
        "deletion. No enemy/art deletion is part of this pilot.",
        "D-159 supersedes the earlier Rosetta comparisons: the owner reports success "
        "with a warm palette, explicit blue/navy/cyan negatives and weight150. "
        "Both character tests below now inherit current corrected production colors, "
        "the exact original reference and150 weight. Fourth adds the earlier short "
        "no-contrasting-colors sentence; fifth uses the owner's stronger wording "
        "and faceted armor/wing wording. These are no longer the historical400 "
        "comparison with positive blue/violet requests. Installed art is unchanged; "
        "success across other characters still requires generated-image review.",
    ]
    for heading, _, body in pilot_prompts():
        parts.append(f"## {heading}\n\n```text\n{body}\n```")
    heading, body = rosetta_pilot()
    parts.append(f"## {heading}\n\n```text\n{body}\n```")
    corrected = body.replace("fully prismatic armor", "fully faceted crimson-and-gold armor")
    corrected = corrected.replace("8 immense prismatic wings", "8 immense crimson gold and ivory wings")
    corrected = corrected.replace(
        "rose-violet sapphire-blue and warm opal chromatic facets on armor wings bow and rings",
        "ruby-red scarlet champagne-gold and ivory facets on armor wings bow and rings")
    restricted = corrected.replace(
        palette_clause("Rosetta"),
        "strict subject palette lock: use ONLY Rosetta's main crimson-to-scarlet-to-deep-red "
        "color gradient throughout the character armor wings fabric ribbons gems and powers, "
        "the ONLY permitted exceptions are white ivory black gold and platinum, "
        "ALL colors borrowed from the style reference must be remapped into this same allowed "
        "palette, no outlying hues or cool-colored highlights, preserve shading and "
        "material detail using only these allowed colors, this restriction applies ONLY "
        "to the subject and never changes the solid green key background", 1)
    parts.append("## Evo.5 / Legendary - Sovereign of Passion, Rosetta "
                 "(strict palette override test, non-runtime)\n\n"
                 "Corrected after blue persisted in all four supplied results: removes the "
                 "original sapphire-blue/rose-violet facets and broad prismatic material cues "
                 "rather than relying on a later override. Same reference and weight150; "
                 "both comparisons now use the corrected production palette. This tests contradictory text "
                 "removal, not proof that the reference stops transferring color.\n\n"
                 f"```text\n{restricted}\n```")
    parts.append("Reproduce: `python tools\\build_enemy_style_pilot.py`. "
                 "Validate: `python -m unittest discover -s tools -p test_enemy_style_pilot.py`.")
    return "\n\n".join(parts) + "\n"


if __name__ == "__main__":
    destination = art_path("experiments", "Enemy Style Pilot.md", root=ROOT)
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(document(), encoding="utf-8")
