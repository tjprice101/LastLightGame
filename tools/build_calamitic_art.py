"""Generate the pending Phase 0 Calamitic cutout art queue, never runtime assets."""
from pathlib import Path
import re

from art_library import art_path
from character_palette import apply_palette
from build_elemental_war_art import RENDERER, CONTAIN, MARGIN, CUTOUT_NO

ROOT = Path(__file__).resolve().parent.parent
PALETTE = ("black white pearlescent ivory and sharp saturated sparkling crimson",
           "gold, blue, navy, cyan, turquoise, teal, green, purple, violet, lavender, orange, yellow, bronze, brown, magenta", False)
KEY = "green"
HEX = "#00FF00"
RARITIES = ("Uncommon", "Rare", "Epic", "Legendary", "Omnic", "Calamitic")
# Owner (2026-11-01): ample edge spacing on every form; late forms grow denser, not wider.
SPREAD = (50, 56, 62, 66, 70, 70)
MARGINS = (25, 22, 19, 17, 15, 15)
DESIGNS = (
    dict(name="Ozriel", id="ozriel", gender="male", element="Tranquilitic", role="Tank",
         identity="short white hair with one black forelock and crimson eyes",
         weapon="one pearlescent cathedral tower shield and one connected glass halberd with a visible grip",
         titles=("Unbroken Pane", "Warden of the Glass Nave", "Bastion of Refused Endings", "Seraph of the Shattered Cathedral", "Sovereign of the Unfallen Wall", "The Ending That Was Denied"),
         forms=(
             "simple smooth pearlescent full-body armor, modest rectangular shield and plain halberd, one small cracked halo, planted watchful stance",
             "fitted pane armor with raised nave ribs, layered wrist guards and pointed boots, shield gains two buttress rails, braced forward guard, two short shattered-glass winglets",
             "layered vaulted pauldrons segmented gauntlets and arch greaves, shield has three nested cathedral windows, halberd has a forked glass finial, four asymmetrical glass wing fans, angled defensive stance",
             "extremely ornate cathedral regalia with tower shoulders high vaulted collar and pane mantle, six layered shattered-glass wings, cracked crown-halo and crimson fracture lattice, elevated guard behind the great shield",
             "retain the cathedral regalia tower shoulders vaulted collar pane mantle and elevated guard, expand into twelve shattered-glass wings, two cracked crowned halos and shield buttresses, dense rear nave arches and interlocked crimson fracture lattices fill the interior",
             "retain all earlier tower shoulders vaulted collar pane mantle shield buttresses and elevated guard, eighteen shattered-glass wings and three nested cracked crown-halos, immense interwoven nave vaults and crimson fracture lattices densely fill the rear architecture, halberd framed by pearl-glass cathedral spires"),
         icons=(("Passive", "Refusal", "one unbroken white shield pane holding back three cracked black wedges"),
                ("Skill 1", "Pane of Absolution", "one glass halberd head passing through a fractured pearl pane with a crimson pressure notch"),
                ("Skill 2", "Cathedral of Shards", "three interlocking pearl cathedral shield windows under one black buttress arch"),
                ("Last Flare", "The World Refuses", "one immense white shield window between two parted cracked discs and thick crimson protective arcs"))),
    dict(name="Ilvaris", id="ilvaris", gender="female", element="Atmospheric", role="Support",
         identity="white hair in two short swept locks with black tips and crimson eyes",
         weapon="one glass halo-lyre with a ring of suspended crystal panes and clearly separated strings, no blade",
         titles=("First Unsung Note", "Cantor of Cracked Heavens", "Choir-Seraph of the Glass Vault", "Herald of the Unwritten Hymn", "Sovereign of the Severed Prophecy", "The Song That Defied Fate"),
         forms=(
             "simple smooth pearlescent full-body armor, modest open halo-lyre, one small cracked halo, poised singing stance without lettering",
             "fitted pane armor with crescent wrist plates and split pearl shoulder cape, halo-lyre gains suspended panes, two short glass winglets and an angled conducting pose",
             "layered choir pauldrons high collar and segmented pearl greaves, halo-lyre with three nested string arches, four glass wing fans and crimson wind ribbons, turning conductor stance",
             "extremely ornate choir-seraph regalia with vaulted shoulders and pane mantle, six layered shattered-glass wings, cracked crown-halo and crimson fracture lattice, airborne conducting pose with both hands readable",
             "retain the choir-seraph regalia vaulted shoulders pane mantle and conducting pose, twelve shattered-glass wings, two cracked crowned halos and expanded lyre arches, dense rear glass choir vaults woven with crimson wind fracture lattices",
             "retain all earlier vaulted shoulders pane mantle lyre arches and conducting pose, eighteen shattered-glass wings and three nested cracked crown-halos, immense interlocked choir galleries and crimson wind fracture lattices densely fill the rear architecture, open strings remain readable"),
         icons=(("Passive", "Severed Prophecy", "one cracked glass halo enclosing a severed crimson geometric thread"),
                ("Skill 1", "Unwritten Verse", "one open pearl lyre arch pinning a black glass pane with a crimson diamond seal"),
                ("Skill 2", "Hymn of Broken Glass", "three upward pearl petal panes woven around one open lyre arch with paired crimson support ribbons"),
                ("Last Flare", "Tomorrow, Unwritten", "one crowned glass lyre sending three broad pearl arcs upward through a cracked black fate ring"))),
    dict(name="Kaelith", id="kaelith", gender="female", element="Chaotic", role="Attacker",
         identity="short black hair with white swept fringe and crimson eyes",
         weapon="one connected shatterglass greatscythe with a crescent blade of cracked pearl-glass and a complete central grip",
         titles=("Hairline Fracture", "Glass-Edged Herald", "Reaper of Written Endings", "Seraph of the Broken Thread", "Sovereign of Shattered Fate", "The Fate That Was Never Written"),
         forms=(
             "simple smooth pearlescent full-body armor, modest crescent greatscythe, one small cracked halo, defiant balanced stance",
             "fitted black pane armor with white wrist plates and split pearl shoulder cape, greatscythe gains a cracked pearl edge, two short glass winglets, advancing diagonal stance",
             "layered crescent pauldrons articulated gauntlets and hooked pearl greaves, greatscythe gains three fracture ribs, four off-axis glass wing fans and crimson chaos ribbons, pivoting sweep pose",
             "extremely ornate fracture-seraph regalia with crescent shoulders and pane mantle, six layered shattered-glass wings, cracked crown-halo and crimson fracture lattice, suspended greatscythe sweep with face and grip clear",
             "retain the fracture-seraph regalia crescent shoulders pane mantle and suspended sweep, twelve shattered-glass wings, two cracked crowned halos and reinforced scythe ribs, dense rear broken-thread arches and crimson chaos fracture lattices",
             "retain all earlier crescent shoulders pane mantle scythe ribs and suspended sweep, eighteen shattered-glass wings and three nested cracked crown-halos, immense off-axis broken-thread mandalas and crimson chaos fracture lattices densely fill the rear architecture, complete crescent blade remains clear"),
         icons=(("Passive", "Reality Fault", "one black glass disc split by three angular crimson cracks with pearl chipped edges"),
                ("Skill 1", "Shatterfall", "three falling pearl-glass wedges striking one cracked black plane with a crimson impact chevron"),
                ("Skill 2", "Glass Meridian", "one pearl greatscythe crescent crossing a split black meridian ring and three crimson fracture notches"),
                ("Last Flare", "Denial of Fate", "one cracked pearl scythe crescent cutting an abstract crimson thread within three shattered black fate rings"))),
)
STATUSES = (
    ("Fault", "calamitic-fault", "one black glass mark with three thick crimson cracks and pearl chipped edges"),
    ("Fate-seared Mark", "calamitic-fate-seared-mark", "one angular pearl-glass seal branded by a crimson diamond inside a broken black halo"),
    ("Refusal", "calamitic-refusal", "one intact pearl shield pane with a black rim stopping a single crimson fracture wedge"),
)
MATERIALS = (
    ("Seed of Calamity", "Common", "one small black pearl-glass seed with one white seam and a crimson fracture notch"),
    ("Bud of Calamity", "Uncommon", "one pearl-glass bud cupped by three black shell plates with short crimson fracture seams"),
    ("Bloom of Calamity", "Rare", "one unfolded six-petal pearl-glass bloom with black ribs and crimson facet tips"),
    ("Crest of Calamity", "Epic", "one ornate pearl-glass crest with interlocked black crown plates and four crimson fracture fans"),
    ("Heart of Calamity", "Legendary", "one imposing faceted pearl-glass geometric heart core in a black vaulted cage with six crimson lattice arcs"),
    ("Soul of Calamity", "Omnic", "one majestic pearl-glass soul prism within twelve layered black wing plates and crowned crimson fracture rings, dense rear lattice"),
    ("Fragment of Rise", "Calamitic", "one colossal shard of an annihilation machine, nested black-and-white metal jaws and broken chronal gear ribs around a crimson fracture core, enveloping opaque white-and-crimson chaos ribbons, intricate machinery above the soul prism in visual tier"),
    ("Feather of the Severed Dawn", "Soar to Heaven specialty", "one pearl-glass mechanical feather with black jointed barbs a split white quill and crisp crimson fractured dawn arcs"),
    ("Splinter of the Unmade Night", "Delve into the Abyss specialty", "one jagged black pearl-glass splinter in a white segmented night cage with deep crimson fracture seams"),
    ("Shard of Calamity", "Ascension material", "one sharply faceted pearl-glass shard with a black mechanical collar and branching crimson fracture lattice"),
)
CONDUITS = (
    ("Bulwark of the Last Horizon", "a colossal wall-engine of nested white shield vaults black tower braces and crimson absorption channels, three concentric protective shutters"),
    ("Reliquary of Unending Mercy", "a monumental open reliquary engine, white restoration petals and black shield vaults fed by two interlocked crimson circulation loops"),
    ("Aegis-Engine of Severed Fate", "an immense shield gyroscope with interlocking black armor rings white intercepting shutters and a severed crimson fate spindle"),
    ("Monolith of the Unmoved Star", "a colossal stepped black-and-white monolith with densely interlocked defensive braces and a compressed crimson star core between immovable clamp arrays"),
    ("Heartforge of the Sunless Dawn", "a monumental white mechanical heartforge with black vaulted chambers and immense crimson circulation conduits around a faceted life reservoir"),
    ("Ruinmark Censer", "an immense suspended black-and-white mechanical censer with segmented branding jaws and angular crimson suppression ribbons from six downward apertures"),
    ("Choir-Array of Branded Stars", "a colossal three-part white resonance array joined as one machine by black rails, crimson star-brand seals feed three synchronized power channels and nested tuning rings"),
    ("Throne of the Lone Apostate", "an immense empty black-and-white command throne with a solitary central seat, nested defensive wings and one inward-focused crimson power circuit, no seated figure"),
    ("Worldbreaker Cannonade", "a colossal fan of nine jointed black-and-white annihilation cannon barrels linked to one crimson compression core, segmented rails and concentric white discharge wedges aimed across a wide arc"),
)


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def references():
    guide = art_path("midjourney-character-style-prompt.md", root=ROOT).read_text(encoding="utf-8")
    table = guide.split("### Character-form style references", 1)[1].split("### Enemy", 1)[0]
    refs = {int(stage): url for stage, url in re.findall(r"^\| ([0-6]) \| (https://\S+) \|$", table, re.M)}
    if set(refs) != set(range(7)):
        raise ValueError("Incomplete authoritative character reference mapping")
    return refs


def cutout(description, *, character=None, evolution=None):
    portrait = evolution is not None
    composition = ("full-body unit illustration, " if portrait else
                   "square standalone face-free collectible icon, one cohesive readable symbol, occupies two thirds of the square, ")
    extra_no = "" if portrait else ", character, creature, face, hands, portrait"
    prompt = (f"{description}, {CONTAIN}, {composition}{RENDERER}, {MARGIN}, "
              + ("at least 15 percent empty solid-background margin on every side and corner, " )
              + f"plain solid {KEY} background ({HEX}), flat unlit color edge to edge and through all openings, "
              "completely solid single uniform background color with no shading no gradient no texture no floor no cast shadow no scenery, "
              "subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque "
              "solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights"
              + f" --ar {'4:3' if portrait else '1:1'} --niji 6 --s 100 --q 1 --no {CUTOUT_NO}{extra_no}")
    if portrait:
        prompt += f" --sref {references()[evolution]} --sw 400"
    return apply_palette(prompt, character or "Calamitic item", palette=PALETTE, reference_weight=400)


def block(heading, asset, folder, prompt):
    return (f"### {heading}\n\nFilename: `{asset}.png`\n"
            f"Target runtime asset ID: `{asset}` (pending delivery; not an installed URL).\n"
            f"Target export: `public/assets/{folder}/{asset}.png` after reviewed intake.\n\n"
            f"```text\n{prompt}\n```\n")


def document(title, summary, blocks):
    return (f"# {title}\n\n{summary}\n\n"
            "**All artwork pending owner delivery.** These are copy-ready original designs, not installed assets. "
            "Names, titles, rarity and mechanics are metadata outside image prose. "
            "Black/white primary and secondary colors, sharp saturated sparkling crimson accents; "
            "pearlescent prismatic sheen means bounded faceting, never extra hues. "
            "The green key is exempt from subject palette exclusions. Only portraits use the exact evolution-matched "
            "character references at --sw 400 for this owner-requested pack; historical packs remain unchanged.\n\n"
            + "\n".join(blocks)
            + "\n## Export and intake\n\n"
            "Portraits: transparent 960px canvas. Icons/items/emblem/Conduits: transparent 256px canvas, "
            "up to 224px reviewed content; emblem must read at small badge size beside an Element Medal. "
            "Preserve original PNG bytes under Art/source after delivery; record hashes, source-specific keys, "
            "enclosed gaps and facing under Art/provenance. Supplied alpha is authoritative; never key it again. "
            "No runtime background removal or missing-image URLs. Review dark/light backgrounds, thumbnail clarity, "
            "all tips and corners, opaque powers and per-form architecture before installation. "
            "Passing prompt tests is not visual approval or a guarantee that a signed reference URL remains available.\n\n"
            "Regenerate: `python tools\\build_calamitic_art.py`. "
            "Validate: `python -m unittest discover -s tools -p test_calamitic_art.py`; "
            "global: `python -m unittest discover -s tools -p \"test_*.py\"`.\n")


def outputs():
    portraits = []
    for design in DESIGNS:
        portraits.append(f"## {design['name']} — {design['gender']}, {design['element']}, {design['role']}\n")
        for index, (rarity, title, form) in enumerate(zip(RARITIES, design["titles"], design["forms"])):
            evolution = index + 1
            body = "one third" if index < 3 else "one quarter" if index == 3 else "one fifth"
            description = (
                f"one human {design['gender']} cosmic celestial angel with {design['identity']}, "
                "rounded oversized head tiny torso short limbs 2.5-3 heads tall, eyes only with no other facial features, "
                "fully covered prismatic pearlescent armor from head to toe in black white and saturated crimson, "
                f"{design['weapon']}, {form}, shattering reality like glass with opaque elemental powers, "
                "defiant heroic stance refusing a predetermined ending, left-facing three-quarter stance with eyes hands and feet clear, "
                f"compact body occupies {body} of canvas height, "
                f"whole ensemble target {SPREAD[index]} percent canvas width and height with {MARGINS[index]} percent outer margins, "
                "late forms grow denser and more ornate inside the frame rather than wider, "
                "continuous visible clearance overrides occupancy if any tip approaches an edge, "
                "pearlescent prismatic faceting is bounded sheen not extra hues, sparkling crimson means crisp painted facet flecks"
            )
            asset = design["id"] if evolution == 1 else f"{design['id']}-evo-{evolution}"
            portraits.append(block(f"Evo.{evolution} / {rarity} — {title}, {design['name']}", asset,
                                   "characters", cutout(description, character=design["name"], evolution=evolution)))
        portraits.append(f"## {design['name']} ability icons\n")
        for action, (kind, name, symbol) in zip(("passive", "skill1", "skill2", "ultimate"), design["icons"]):
            portraits.append(block(f"{kind} — {name}", f"{design['id']}-{action}", "abilities",
                                   cutout(symbol, character=design["name"])))
    portraits.append("## Shared signature status icons\n")
    for name, asset, symbol in STATUSES:
        portraits.append(block(name, asset, "abilities/statuses", cutout(symbol)))
    materials = [block(f"{name} / {rarity}", slug(name), "materials", cutout(symbol))
                 for name, rarity, symbol in MATERIALS]
    machines = [block(name, f"calamitic-{slug(name)}", "conduits", cutout(
        f"one standalone {symbol}, prized annihilation machinery authored by a cosmic machine architect, "
        "overwhelming black-and-white metal with vibrant crimson accents, enveloping opaque white-and-crimson chaos, "
        "nearly cosmic scale expressed through extremely ornate nested engineering not scenery, "
        "dense interior construction and narrow readable key channels, painted dimensional metal facets"))
        for name, symbol in CONDUITS]
    emblem = block("Rise-blessed crown-burst", "rise-blessed-emblem", "ui", cutout(
        "one ornate mechanical crown-burst emblem, five white crown teeth on a black segmented ring, "
        "one central crimson fracture diamond with six broad white-and-crimson burst wedges, "
        "bold mechanical silhouette for a small badge beside an elemental medal, no lettering"))
    return {
        art_path("characters", "Calamitic Element-Bearers.md", root=ROOT): document(
            "Calamitic Element-Bearers", "33 prompts: 18 portraits, 12 ability icons and three status icons. "
            "Six forms Uncommon to Calamitic; body fraction follows rarity: one third through Epic, "
            "one quarter at Legendary, one fifth at Omnic and Calamitic, retaining compact anatomy. "
            "[Materials](../items/Calamitic%20Materials.md), [emblem](../ui/Rise-blessed%20Emblem.md), "
            "[nine Conduits](../conduits/Calamitic%20Conduits%20Phase%200.md). "
            "[Owner contract](../../docs/calamitic-characters.md).", portraits),
        art_path("items", "Calamitic Materials.md", root=ROOT): document(
            "Calamitic Materials", "Ten reference-free face-free items. Seed to Soul use Common to Omnic; "
            "Fragment of Rise is Calamitic, above Soul. Feather and Splinter belong to Soar/Delve; "
            "Shard of Calamity is the Ascension material; no unapproved rarity assigned to these specialties.", materials),
        art_path("ui", "Rise-blessed Emblem.md", root=ROOT): document(
            "Rise-blessed Emblem", "One reference-free mechanical Calamity crown-burst badge.", [emblem]),
        art_path("conduits", "Calamitic Conduits Phase 0.md", root=ROOT): document(
            "Calamitic Conduits Phase 0", "Nine reference-free Rise-authored annihilation machines. "
            "Visual mechanisms suggest the approved effects without effect text or numeric lettering. "
            "These extend, never replace, the [five installed Calamitic designs](Calamitic%20Conduits.md).", machines),
    }


def write_preserving_endings(path, text):
    newline = b"\r\n" if path.exists() and b"\r\n" in path.read_bytes() else b"\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.replace("\r\n", "\n").encode("utf-8").replace(b"\n", newline))


def main():
    for path, text in outputs().items():
        write_preserving_endings(path, text)
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
