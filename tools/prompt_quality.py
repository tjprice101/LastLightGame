"""Shared Midjourney quality clauses from owner generation feedback (D-439).

Owner feedback (2026-11-01): portraits came out blurry/smudged, without outer
margins, with key-colored power-up backsplashes on Legendary/Omnic forms,
armor rendered as lumpy balls of rock, and ability icons containing small
chibi people. Every future cutout generator should import these clauses.
"""

SHARP = 'sharp crisp focus, clean precise lineart, no smudging'

PORTRAIT_FRAME = 'zoomed-out full-body view, small centered character with a wide empty border on every side'

NO_BACKDROP = 'wings halos and powers attach to the character, nothing behind it but the flat background'

ARMOR_RULE = 'flat polished metal plates with crisp beveled edges, never pearls orbs or lumpy rock'

WING_RULE = 'wings built from flat angular glass feather-blades'

ICON_RENDERER = ("clean anime game icon rendering, clean precise anime contours, crisp cel shading, "
                 "smooth non-emissive painted highlights and jewel-like saturated colors")

OBJECT_ONLY = "object-only emblem with no people no figures no faces and no wielder"

QUALITY_NO = "blur, blurry, smudged, soft focus, painterly smears, watercolor, sketch, depth of field, noise"

BACKDROP_NO = "aura, energy burst, backsplash, radial burst behind subject, sunburst, speed lines, backdrop"

ARMOR_NO = "pearls, beads, orbs, boulders, rocks, lumpy armor, stone armor"

ICON_NO = "person, people, figure, humanoid, chibi, mascot, tiny character, angel"
