"""Canonical Art filing paths shared by generators, intake tools and tests."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "Art"
CHARACTERS = (
    "Atmoso", "Aurora", "Bliss", "Bruno", "Crinso", "Disciple", "Elise",
    "Flora", "Infernis", "Nerithe", "Orvella", "Razor", "Rosetta",
    "Thornia", "Tizu", "Vaelor",
)
GROUPS = {
    "characters": tuple(f"{name} Art.md" for name in CHARACTERS) + (
        "Starter Art.md", "Flagship Characters.md"),
    "creatures": ("Awaken the Machines.md", "Crownfall Treasury.md",
                  "Rosethorn Sanctuary.md", "Passion of Crimson Roses.md",
                  "Flaming Depths.md"),
    "conduits": ("Conduits.md", "Conduit Expansion.md"),
    "items": ("Currencies.md", "Broken Mechanical Components.md"),
    "ui": ("Archives.md", "Battle Scenery.md", "Battle Status Icons.md",
           "Element Emblems.md", "Elemental War.md", "Flaming Depths Scenery.md",
           "Summoning Banners.md", "Universal Action Icons.md"),
    "guides": ("midjourney-character-style-prompt.md", "cutout-background-contract.md"),
}
RELOCATIONS = {
    name: f"{group}/{name}"
    for group, names in GROUPS.items() for name in names
}


def canonical_relative(relative):
    relative = str(relative).replace("\\", "/")
    if relative in RELOCATIONS:
        return RELOCATIONS[relative]
    if "/" not in relative and relative.endswith(".json"):
        return f"provenance/{relative}"
    if relative == "dungeons" or relative.startswith("dungeons/"):
        return f"creatures/{relative}"
    if relative == "gamemodes" or relative.startswith("gamemodes/"):
        return f"creatures/{relative}"
    return relative


def art_path(*parts, root=ROOT):
    relative = Path(*parts)
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError(f"Art path must stay within the library: {relative}")
    return Path(root) / "Art" / Path(canonical_relative(relative))


def art_documents():
    """Former flat prompt collection; excludes experiments and activity subpacks."""
    return sorted([art_path(name) for name in RELOCATIONS] + [ART / "README.md"])
