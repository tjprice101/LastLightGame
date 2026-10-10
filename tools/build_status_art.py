"""Reproducible reference-free status-icon prompts; not runtime asset intake."""
from pathlib import Path
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
STATUSES = (
    ("Infernic Embers", "burn", "one compact opaque red-orange flame wrapped around a charcoal ember"),
    ("Oceanic Protection", "ward", "one silver shield enclosing two nested opaque sapphire tide crests"),
    ("Botanic Renewal", "bloom", "one emerald leaf cradle holding an opaque ivory flower bud"),
    ("Atmospheric Charge", "tempest", "one silver wind vane encircled by three opaque pale-yellow lightning forks"),
    ("Tranquilitic Focus", "focus", "one ivory sun lens aligned around a platinum sight diamond"),
    ("Chaotic Suppression", "suppression", "one obsidian lens enclosing a cracked silver sword and opaque violet fault line"),
    ("Rose Grace", "rose-grace", "three ivory rose buds cradled by one antique-gold longbow crescent"),
    ("Thorn Aegis", "thorn-aegis", "three black thorn ramparts around one crimson rose shield"),
    ("Rose Duality", "rose-duality", "two opposed crimson and gold blade petals joined by three rose seal facets"),
)


# Status palettes are independent of character portraits; the key hue is never negated.
PALETTES = {
    "warm": ("crimson red orange bronze charcoal ivory and steel-gray", "blue, navy, cyan, turquoise, violet, purple, pink"),
    "neutral": ("white ivory silver steel-gray charcoal and black", "red, orange, yellow, blue, navy, cyan, turquoise, violet, purple, pink"),
    "violet": ("amethyst violet black charcoal silver and crimson-red", "blue, navy, cyan, turquoise, yellow, orange, pink"),
    "yellow": ("pale yellow white ivory silver and charcoal", "red, orange, blue, navy, cyan, turquoise, violet, purple, pink"),
    "teal": ("teal turquoise ivory silver and charcoal", "red, orange, yellow, navy, violet, purple, pink"),
    "green": ("emerald moss-green ivory silver and charcoal", "red, orange, yellow, blue, navy, cyan, turquoise, violet, purple"),
    "sapphire": ("sapphire-blue ivory silver and charcoal", "red, orange, yellow, turquoise, violet, purple, pink"),
    "earth": ("basalt-gray charcoal amber ochre and silver", "red, blue, navy, cyan, turquoise, violet, purple, pink"),
    "rose": ("crimson scarlet antique-gold ivory black and platinum", "blue, navy, cyan, turquoise, violet, purple, orange, pink"),
}
GROUPS = {
    "burn": "warm", "ward": "sapphire", "bloom": "green",
    "tempest": "yellow", "focus": "yellow", "suppression": "violet",
    "rose-grace": "rose", "thorn-aegis": "rose", "rose-duality": "rose",
}

NOTES = {
    "burn": "Infernic family: actual enemy Burn, Infernis personal Infernic Embers and equipment Ember Seals share art, never counts, owners or spending. Burn damage/remaining phases stay explicit.",
    "ward": "Oceanic family: authored Shield, direct-hit wards and Tizu personal Oceanic Protection share art, not amounts or clocks. Active shields refresh rather than add.",
    "bloom": "Botanic family: authored healing, Flora/Bliss personal Botanic Renewal and healing-earned equipment benefits share art. Triggers and spend choices stay explicit per owner.",
    "tempest": "Atmospheric family: Atmoso/Elise/Vaelor personal Atmospheric Charge and wind/storm equipment benefits share art. Personal Atmospheric Charge uses effective critical Normal/ordinary skills; equipment rules stay separate.",
    "focus": "Tranquilitic family: critical precision and sight/focus equipment effects share art. Show exact percentage, source and expiry/consumption; no new buff is created.",
    "suppression": "Chaotic family: actual Weaken and equipment Fracture Mark/pierce share art, not mechanics. Preserve exact debuff type, strength, owner, stacks and clock; a shared family never makes all targets Weakened.",
    "rose-grace": "Rosetta intrinsic effective authored-healing resource; Skill1 Weaken versus Last Flare damage, maximum three.",
    "thorn-aegis": "Thornia intrinsic authored-shield absorption resource; Skill2 Weaken versus Last Flare shield, maximum three.",
    "rose-duality": "Crinso intrinsic own effective Burn resource; Skill1 versus Last Flare damage, maximum three. Not equipment Ember Seals.",
}


def document():
    text = [
        "# Battle status, buff, debuff and stack icon prompts",
        "**Consolidated elemental icon checklist (D-173): 9 reference-free prompts, replacing the 40-icon checklist.** "
        "Six broad elemental families and three precise Rose-banner signatures. No icons are installed by this document; "
        "D-175 installs all nine owner-delivered images through reviewed offline intake. "
        "Live labels, owners, counts and clocks remain readable text beside the icons. "
        "[Intrinsic kits](../../docs/character-kit-rework.md) / "
        "[Equipment rules](../../docs/conduit-expansion-plan.md).",
        "Generate separate 1:1 cutouts. Proposed filenames below are delivery names, not runtime URLs. "
        "Preserve originals under Art/source/abilities/statuses, review pale foreground/enclosed gaps "
        "at source resolution, then export transparent 256px icons with 224px content. "
        "Names, percentages, source owners, clocks and stack counts stay in HTML, not generated art. "
        "One reusable icon per resource: do not generate numbered variants. "
        "Never request proposed image URLs before reviewed intake; supplied alpha is authoritative.",
        "## Delivered artwork (D-175)\n\n"
        "All nine named owner PNGs are preserved byte-identically under Art/source/abilities/statuses. "
        "Reviewed transparent exports use the stable status filenames below in public/assets/abilities/statuses. "
        "Source-specific cleanup and hashes live in Art/provenance/status-art-settings.json and "
        "status-art-intake.json; reproduce with tools/intake_status_art.py. "
        "Shared byte revisions and typed family/Rose resolution cover real enemy badges, native counters "
        "and applicable equipment readouts. No new effects, state, clocks, transactions or save fields. "
        "[Intake contract](../../docs/art-workflow.md).",
        "## Broad to precise\n\n"
        "| Family | Theme | Precise effects sharing this symbol |\n"
        "| --- | --- | --- |\n"
        "| Infernic Embers | Infernic | Burn debuff, personal Infernic Embers, equipment Ember Seals |\n"
        "| Oceanic Protection | Oceanic | Shield, personal Oceanic Protection, direct-hit protective wards |\n"
        "| Botanic Renewal | Botanic | Healing, personal Botanic Renewal, healing-earned equipment benefits |\n"
        "| Atmospheric Charge | Atmospheric | Personal Tempest, Tailwind, Alternating Storm and other wind/storm equipment benefits |\n"
        "| Tranquilitic Focus | Tranquilitic | Precision, Burn Focus, Dawn Focus |\n"
        "| Chaotic Suppression | Chaotic | Weaken, Fracture Mark, Weaken Pierce |\n\n"
        "A family is an interaction/art category, not a universal identical status. "
        "Always show the precise effect label, source, count, value and clock alongside shared art. "
        "Theme does not change a character's combat element or introduce an equipment restriction. "
        "Rose Grace specializes Botanic Renewal, Thorn Aegis specializes Oceanic Protection and Rose Duality specializes Infernic Embers; "
        "their unique symbols and native rules remain.",
        "## Removed from generation, not from essential gameplay\n\n"
        "Do not generate separate icons for Attack Boost, Defense, Last Flare Recovery, Shatter Gauge, "
        "Skill Cooldown, Normal Momentum, Rift Echo, Undertide Reprise or Storm Clock. "
        "Keep exact live text, meters, timers and equipment feedback; instant cooldown feedback "
        "is not a lingering elemental status. All existing owned Conduit effects remain functional. "
        "Bedrock, Concord, Night Resolve, Charted Current, Foundation, Verdict Mark and Shelter Charge "
        "are retired native special mechanics. Restorative Charges/Blooms share Botanic Renewal; "
        "Gale Cadence/Storm Rhythm/Resonance share Atmospheric Charge, with one common critical-hit trigger.",
        "## Generation checklist\n\n" + "\n".join(
            f"- [{name}](#{name.lower().replace(' ', '-')}) - `status-{asset}.png`"
            for name, asset, _ in STATUSES),
    ]
    for name, asset, subject in STATUSES:
        group = GROUPS.get(asset, "neutral")
        palette, excluded = PALETTES[group]
        key = "magenta background (#FF00FF)" if group == "green" else "green background (#00FF00)"
        # Green must never be excluded with the ordinary green key; magenta never with the green-subject key.
        prompt = (
            f"{subject}, a single cohesive readable battle status symbol, "
            "compact chibi anime gacha collectible icon renderer with clean precise contours "
            "crisp cel shading smooth painted highlights and jewel-like saturated subject colors, "
            f"strict subject palette lock use only {palette}, "
            "remap all material highlights and shadows into these allowed subject colors, "
            "the background key is exempt from the subject palette restriction, "
            "solid opaque metal stone feather and power shapes with crisp hard edges, "
            "complete symbol and every effect tip fully visible with a continuous clear safety margin "
            "on all four sides and corners, whole ensemble occupying roughly two thirds of the square, "
            "pull back the whole design rather than crop or simplify it, nothing touches the frame edges, "
            "no character no hands, "
            f"plain solid {key}, flat unlit color edge to edge and through all openings, "
            "subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights "
            f"--ar 1:1 --niji 6 --s 100 --q 1 --no {excluded}, face, eyes, character, hands, scenery, horizon, "
            "cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, "
            "interface, frame, background gradient, textured background, background vignette, "
            "background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill"
        )
        note = NOTES.get(asset, "Existing equipment charge/temporary status; actual trigger, source and payoff remain live text.")
        text.append(f"## {name}\n\nProposed status ID: `status-{asset}` (not a runtime URL). "
                    f"Delivery filename: `status-{asset}.png`.\n\n{note}\n\n```text\n{prompt}\n```")
    text.append("Reproduce: `python tools\\build_status_art.py`. "
                "Validate: `python -m unittest discover -s tools -p test_status_art_prompts.py`. "
                "Prompt assertions are not generated-image acceptance. Future Omnic designs may target "
                "families or precise sourced specializations; this pack adds no future equipment mechanics.")
    return "\n\n".join(text) + "\n"


if __name__ == "__main__":
    (art_path("Battle Status Icons.md", root=ROOT)).write_text(document(), encoding="utf-8")
