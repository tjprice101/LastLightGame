"""Reproducible reference-free status-icon prompts; not runtime asset intake."""
from pathlib import Path
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
STATUSES = (
    ("Burn", "burn", "one compact opaque red-orange flame wrapped around a charcoal ember"),
    ("Weaken", "weaken", "one cracked steel sword angled downward inside a broken gray pressure ring"),
    ("Fracture Mark", "fracture-mark", "one obsidian lens divided by two sharp opaque violet fault lines"),
    ("Verdict Mark", "verdict-mark", "one white lens with two nested opaque pale-yellow judgment brackets"),
    ("Ember Seals", "ember-seals", "three small bronze seal disks joined around one opaque crimson flame"),
    ("Shelter Charge", "shelter-charge", "one steel shield holding a small ivory protection clasp"),
    ("Restorative Charges", "restorative-charges", "three ivory feather droplets surrounding one turquoise healing knot"),
    ("Precision", "precision", "one steel sight ring aligned around a small white diamond"),
    ("Tailwind", "tailwind", "one feather-ribbed steel vane and a short opaque teal wind ribbon"),
    ("Alternating Storm", "alternating-storm", "two steel turbine rotors joined by one opaque yellow lightning zigzag"),
    ("Undertide Reprise", "undertide-reprise", "one sapphire tide clock with two counterrotating steel hands"),
    ("Fault Ward", "fault-ward", "one stone armor slab backed by an ivory steel reinforcement"),
    ("Verdant Strike", "verdant-strike", "one opal leaf clasp crossed by a short opaque emerald attack arc"),
    ("Dawn Focus", "dawn-focus", "three white sight lenses aligned around a single ivory sun disk"),
    ("Stillhour Ward", "stillhour-ward", "one ivory bell enclosed by a compact steel protective ring"),
    ("Rift Echo", "rift-echo", "two offset obsidian mirror panes joined by one opaque scarlet zigzag"),
)


def document():
    text = [
        "# Battle status and charge icon prompts",
        "Reference-free generation prompts for the phased kit/Conduit expansion. "
        "No icons are installed by this document; live status labels remain readable text "
        "until reviewed images arrive. Enemy debuffs show beside HP with actual remaining "
        "duration or owner-specific stacks, never decorative or guessed status. "
        "[Plan and runtime contract](../../docs/conduit-expansion-plan.md).",
        "Generate separate1:1 cutouts, preserve originals under Art/source/abilities/statuses, "
        "review pale foreground/enclosed gaps at source resolution, then export transparent256px/"
        "224px content. Names, percentages, clocks and counts stay in HTML, not generated art. "
        "Do not request proposed IDs before intake.",
    ]
    for name, asset, subject in STATUSES:
        prompt = (
            f"one {subject}, a single cohesive readable battle status symbol, "
            "compact chibi anime gacha collectible icon renderer with clean precise contours "
            "crisp cel shading smooth painted highlights and jewel-like saturated subject colors, "
            "solid opaque metal stone feather and power shapes with crisp hard edges, "
            "complete symbol and every effect tip fully visible with a continuous clear safety margin "
            "on all four sides and corners, whole ensemble occupying roughly two thirds of the square, "
            "pull back the whole design rather than crop or simplify it, no character no hands, "
            "plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, "
            "subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights "
            "--ar 1:1 --niji 6 --s 100 --q 1 --no face, eyes, character, hands, scenery, horizon, "
            "cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, "
            "interface, frame, background gradient, textured background, background vignette, "
            "background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill"
        )
        text.append(f"## {name}\n\nProposed status ID: `status-{asset}` (not a runtime URL).\n\n```text\n{prompt}\n```")
    text.append("Reproduce: `python tools\\build_status_art.py`. "
                "Validate: `python -m unittest discover -s tools -p test_status_art_prompts.py`. "
                "Prompt assertions are not generated-image acceptance.")
    return "\n\n".join(text) + "\n"


if __name__ == "__main__":
    (art_path("Battle Status Icons.md", root=ROOT)).write_text(document(), encoding="utf-8")
