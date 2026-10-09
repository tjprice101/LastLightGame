"""Shared, identity-specific subject palettes for character cutout prompts."""
import re

REFERENCE_WEIGHT = 150
PALETTES = {
    "Infernis": ("copper scarlet orange amber cream pearl brown and rose", "blue, navy, cyan, turquoise, green, violet, purple, lavender", True),
    "Tizu": ("sapphire blue turquoise aqua silver white pearl and brown", "red, scarlet, orange, magenta, violet, purple, lavender", False),
    "Flora": ("moss emerald lime beige brown pearl and pale rose", "blue, navy, cyan, turquoise, violet, purple, lavender, magenta", False),
    "Rosetta": ("crimson scarlet deep red rose and pearlescent ivory", "blue, navy, cyan, turquoise, green, violet, purple, lavender", False),
    "Thornia": ("charcoal deep crimson scarlet rose and pearlescent ivory", "blue, navy, cyan, turquoise, green, violet, purple, lavender", False),
    "Crinso": ("charcoal deep crimson scarlet amber rose and pearlescent ivory", "blue, navy, cyan, turquoise, green, violet, purple, lavender", True),
    "Atmoso": ("navy sky blue teal silver and pearl", "red, scarlet, orange, magenta, violet, purple, lavender", False),
    "Aurora": ("ivory pearl amber antique gold and obsidian", "blue, navy, cyan, turquoise, green, violet, purple, lavender, magenta", False),
    "Bliss": ("ivory pearl soft rose antique gold and pale blue", "navy, cobalt, scarlet, orange, green, violet, purple, magenta", False),
    "Bruno": ("basalt gray warm umber ochre bronze amber and brown", "blue, navy, cyan, turquoise, green, violet, purple, lavender, magenta", False),
    "Disciple": ("plum black deep violet scarlet magenta silver and amethyst", "blue, navy, cyan, turquoise, green, orange", True),
    "Elise": ("charcoal electric lime mint silver and restrained violet", "blue, navy, cobalt, scarlet, red, orange, magenta", False),
    "Razor": ("ink black graphite deep violet silver and restrained amethyst", "blue, navy, cyan, turquoise, green, red, scarlet, orange, magenta", False),
    "Nerithe": ("ink blue turquoise ivory brass amber restrained coral and violet facets", "green, lime, magenta, scarlet armor", False),
    "Orvella": ("slate charcoal ivory copper jasper red and violet geode facets", "blue, navy, cyan, turquoise, green, lime, magenta", False),
    "Vaelor": ("cobalt navy ivory copper violet and electric cyan", "green, lime, red, scarlet, orange, magenta", False),
    "Template": ("[CHARACTER MAIN COLOR GRADIENT AND AUTHORED ACCENTS]", "[UNWANTED SUBJECT COLORS OUTSIDE THE AUTHORED PALETTE]", None),
}

REPLACEMENTS = {
    "Rosetta": (("rose-violet sapphire-blue and warm opal chromatic facets", "ruby-red scarlet champagne-gold and ivory chromatic facets"),),
    "Thornia": (
        ("amethyst rose-violet and warm opal chromatic facets", "deep-crimson scarlet champagne-gold and ivory chromatic facets"),
        ("amethyst rose-violet warm opal facets", "deep-crimson scarlet champagne-gold ivory facets"),
    ),
    "Crinso": (("rose-violet sapphire-blue and warm opal facets", "ruby-red scarlet champagne-gold and ivory facets"),),
    "Infernis": (
        ("subtle cyan and violet prismatic fringes", "subtle scarlet amber and ivory prismatic fringes"),
        ("scarlet amber rose cyan and violet flame ribbons", "scarlet amber rose and ivory flame ribbons"),
        ("scarlet amber rose turquoise and violet chromatic fire", "scarlet amber rose and ivory chromatic fire"),
    ),
    "Tizu": (
        ("subtle rose and violet refractions", "subtle aqua and pearl refractions"),
        ("rose violet and pale gold prismatic fringes", "aqua pearl and pale gold prismatic fringes"),
        ("turquoise sapphire rose violet and pale gold tidal crescents", "turquoise sapphire aqua pearl and pale gold tidal crescents"),
        ("rainbow-refracting edges", "aqua-pearl refracting edges"),
    ),
    "Flora": (
        ("rose aqua violet and pale gold refractions", "pale rose emerald lime and pale gold refractions"),
        ("rose aqua violet and pale gold petal crescents", "pale rose emerald lime and pale gold petal crescents"),
        ("rainbow-fringed taut bowstring", "emerald-pearl fringed taut bowstring"),
    ),
}


def palette_clause(name):
    colors, _, _ = PALETTES[name]
    return (
        f"strict subject palette lock: ONLY {colors} gradients plus white black gold and platinum "
        "on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this "
        "palette, prismatic and opal describe faceting not extra hues, no contrasting subject "
        "colors, preserve shading and detail, subject ONLY not the key background"
    )


def apply_palette(prompt, name):
    if name not in PALETTES:
        raise ValueError(f"Unknown character palette: {name}")
    if not re.search(r"--ar (?:4:3|1:1|3:2)\b", prompt):
        raise ValueError("Palette policy is for character cutouts, never scenery.")
    for original, replacement in REPLACEMENTS.get(name, ()):
        prompt = prompt.replace(original, replacement)
    key = re.search(r", plain solid (.+?) background", prompt)
    if key is None:
        raise ValueError(f"Missing solid key clause for {name}.")
    if "strict subject palette lock:" in prompt:
        if palette_clause(name) not in prompt:
            raise ValueError(f"Conflicting pre-existing palette clause for {name}.")
        prompt = prompt.replace(f"{key.group(1)} subject accents, ", "")
        if " --sref " in prompt:
            prompt = re.sub(r" --sw \d+$", f" --sw {REFERENCE_WEIGHT}", prompt)
        return prompt
    prompt = prompt[:key.start()] + ", " + palette_clause(name) + prompt[key.start():]
    _, exclusions, fire = PALETTES[name]
    if not fire and fire is not None:
        exclusions += ", flames, fire"
    # Excluding the chroma key itself fights the mandatory background instruction.
    key_color = key.group(1)
    exclusions = ", ".join(color for color in exclusions.split(", ") if color != key_color)
    reference = None
    if " --sref " in prompt:
        prompt, reference = prompt.rsplit(" --sref ", 1)
    if prompt.count(" --no ") != 1:
        raise ValueError("Expected exactly one negative clause.")
    prompt = prompt.replace(" --no ", f" --no {exclusions}, ", 1)
    if reference is not None:
        reference = re.sub(r" --sw \d+$", f" --sw {REFERENCE_WEIGHT}", reference)
        prompt += " --sref " + reference
    return prompt


def design_prose(positive):
    """Keep the existing design word budget separate from palette instructions."""
    return re.sub(r", strict subject palette lock:.*?(?=, plain solid |$)", "", positive)
