# Last Light — Character Art Midjourney Prompt Guide

**Palette control (D-159):** every portrait retains its exact reference URL at150, with identity-specific subject palette locks and unwanted-color exclusions. Prismatic/opal describes faceting inside that palette, not extra hues. Character-specific icons/weapons share the palette without reference flags. Solid keys, scenery and installed images unchanged.

**Reference scope (D-155):** only Element-Bearer character portraits use `--sref`
and `--sw`, retaining the exact approved evolution mapping and weight150.
All enemy prompts are reference-free to prevent unwanted palette/design transfer.
Items (including currencies/Conduits/materials), weapons, ability/action icons,
emblems, banners, arenas and all other art use neither flag. Keep the shared
written renderer, identities, colors and composition rules unchanged.
This supersedes D-132/D-153/D-154 enemy reference assignments, the D-133
currency exception and all older non-portrait
reference instructions. Supplied images and runtime assets are unchanged.

D-151: [Universal Action Icons](../ui/Universal%20Action%20Icons.md) supplies the
shared steel sword-sweep Normal Attack and steel shield Defense prompts. Install only after image
delivery; old character-specific action prompts remain historical.

**Cutout background rule:** [Solid-color contract](cutout-background-contract.md). Subject identity, design and elemental colors come first. End the prompt with a short plain solid, unlit background instruction; No glows or glowing visual effects: use opaque solid-color elemental lines, ribbons, rings and shapes with crisp edges; painted highlights are non-emissive. Never recolor the subject to suit the background. Arenas and banners remain scenery.

For the new female fire greatsword starter, female grass bow starter, male water
spear starter, and three basic enemy prompts, see [Starter Art](../characters/Starter%20Art.md).
This guide remains the shared style reference.
The playable crimson/gold rose expansion has matching six-form packs:
[Rosetta](../characters/Rosetta%20Art.md), [Thornia](../characters/Thornia%20Art.md),
[Crinso](../characters/Crinso%20Art.md) and
[Passion of Crimson Roses](../creatures/Passion%20of%20Crimson%20Roses.md).
Simple bases grow into full-body prismatic armor, large elemental rose wings,
ornate weapons and opaque swirling powers; Rosetta's6-star finale is broader.
Keep the same compact chibi/eyes-only renderer and cutout background contract.
Their54 prompts do not mean images were generated/intaken. See the
[implemented event rules](../../docs/crimson-roses.md) and focused rose prompt tests.
Character form display names always use **Prefix, Character name**, with each
evolution title as its prefix (D-098): **Gale Wayfarer, Atmoso**, then
**Crosswind Adept, Atmoso**. Form headings carry full names; subject/prose may
use short identity names without inventing a second display naming scheme.
For the seven other elements' flagship Element-Bearers, see
[Flagship Characters](../characters/Flagship%20Characters.md): Bruno, Elise, Aurora, Atmoso,
Razor, Bliss and Disciple. Each new pack has a base plus five evolutions, six
ability/action icons and a signature weapon or energy-focus cutout. Their
Evo.6 designs become fully prismatic-armored; the four6-star lines receive
especially elaborate final silhouettes without changing the renderer.
These packs contain generation prompts, not executable character definitions.
The seven flagships are now playable in Standard under D-121/D-122.
D-134 installs60 replacement portraits for them and the three Roses characters;
historical supplied originals/exports remain preserved. See
[current roster](../../docs/flagship-characters.md) and
[replacement intake](../../docs/art-workflow.md#replacement-character-portraits-d-134).
For the actual starter identities' five new post-base art stages, see
[Infernis Art](../characters/Infernis%20Art.md), [Tizu Art](../characters/Tizu%20Art.md), and
[Flora Art](../characters/Flora%20Art.md). These preserve female Infernis/female Flora/male
Tizu and extend the examples with ornate chromatic celestial armor and elemental
weapons. The owner has now approved six gameplay forms and supplied all five
post-base portraits for each starter; the named lines are integrated.
For ten dungeon enemies in ascending visual power, see
[Flaming Depths](../creatures/Flaming%20Depths.md). Those are distinct creatures, not evolutions.
For all ten elemental dungeons, see the [complete dungeon art packs](../creatures/dungeons/README.md).
Each file combines monsters, Seed-to-Soul materials, banner and arena prompts.
For the ten framed element symbols, see [Element Emblems](../ui/Element%20Emblems.md).
For the unified gallery headers, see [Archives](../ui/Archives.md).
For Omnic-tier16:9 summoning artpieces, see [Summoning Banners](../ui/Summoning%20Banners.md).

Reference target: **compact gacha JRPG unit illustration**, matching the supplied pirate chibi reference, not a cinematic anime battle portrait. Every character form uses a rounded oversized head, tiny torso, short limbs, and approximately 2.5–3-head-tall proportions. The character must have **only eyes as facial features**: no nose, mouth, eyebrows, or other facial marks. Render with clean contours, crisp cel shading and smooth painted highlights, not gritty sketching. Use a **plain solid-color background** with no scenery, gradient, texture, or cast-shadow backdrop. Keep the entire character and weapon visible. The body occupies roughly one third of the canvas height, while its weapon, costume and effects extend around it. Leave background-color gaps between effects and a background-color margin around the whole illustration. Character renders use **4:3** (1:1 only if a square card asset is specifically needed).

---

## Shared style lock for every art pack

### Future complete-design framing (D-135)

All future evolutions, including base/Common and Omnic, must emphasize complete
edge clearance twice: near the subject description and again at the end of
composition guidance. Frame the entire character/equipment/power ensemble,
including every diagonal wing, weapon, hair, armor and effect tip, inside a
continuous visible solid-background safety margin on every side and corner.
Nothing touches, crosses or disappears beyond the frame. "Full-body" and
negative cropping flags alone are insufficient.

Pull back the whole composition uniformly when needed; never remove or reduce
the authored equipment, armor, powers, layers or ornamentation to fit it.
Keep dense late-form interiors, intimidating elemental prowess, compact
anatomy and unchanged rendering/identity/palette/reference. Margin belongs
outside the artwork, not in place of its detail.

Use the [copy-ready framing clause and review checklist](cutout-background-contract.md#complete-silhouettes-and-edge-clearance-d-135).
Containment outranks the historical D-13194%/96% occupancy and3%/2% margins
for future prompts. Existing blocks/numerical tests remain unchanged; this
does not alter supplied art or current exports. Full-bleed scenery stays exempt.

### Portrait quality standard (D-131)

Owner requests all thirteen Element-Bearer portrait lines meet the Bliss and
Rose-banner standard. This is a generation-prompt revision, not replacement
or approval of supplied/runtime artwork. Ability/action icons, standalone
weapons and creature/scenery prompts are out of scope.

- Repeat each character's identity/anatomy and renderer/palette clauses.
  Keep the same human, hair, eyes-only face, signature clothing motif, weapon
  and element; never substitute robots, another character's motifs or realism.
- Compact proportions remain2.5-3 heads tall. The body occupies one third of
  canvas height through Epic, one quarter at Legendary and one fifth at Omnic.
  This changes composition scale, not anatomy. Late powers and regalia become
  the dominant subject, with a clear face/hand/equipment window.
- Whole-ensemble width/height targets are50/60/72/84/94/96%, with respective
  per-side margins25/20/14/8/3/2%. These are prompt targets, not measured
  generated-pixel occupancy. Late forms need dense interior construction,
  not a few wide outlying tips around an empty backdrop.
- Base remains plain; first fitted plates develop into layered armor,
  characteristic shoulder/gauntlet/greave mass, mantle, wings and crowns.
  Preserve the Legendary weapon/regalia foundation when expanding Omnic.
  Wing count or fine engraving alone is not a transformation.
- Epic introduces layered rear powers. Legendary/Omnic overlap each
  character's own arches, lattices, fans, ribbons and fragments behind the
  armor and wings, filling interior gaps. Keep narrow key channels, readable
  eyes/hands/functional weapons and all tips inside the outer margin.
- Canonical portrait positive prose is bounded to380 words, including style/
  background but excluding parameters, negatives and the reference URL.
  Prefer concrete authored construction over repeated grandeur adjectives.
- Retain each prompt's reviewed contrasting solid key, including existing
  per-form key changes, flat/unlit through all openings. Powers are opaque
  and non-emissive; no scenery, source glow or runtime art changes.
- Each form retains its exact [D-129 suffix](#character-form-style-references).
  Neutral wording is not a guarantee of service acceptance or permission
  to evade moderation. Inspect generated results beside approved artwork.

This supersedes historical one-third-at-every-form, sparse late effects,
generous late gaps and per-character pause instructions elsewhere in these
packs. Earlier identity/equipment/renderer constraints remain in force.
The three six-stage example lines below also use the late power-first layout.
Validate with `python -m unittest discover -s tools -p "test_character_*.py"`
and `python -m unittest discover -s tools -p test_art_prompts.py`.

**New shared escalation standard (D-124):** the final reviewed Thornia D-117
and Crinso D-119 direction is the reference for future art: compact anatomy,
anime contours/cel shading/non-emissive painted jewel colors with wild but
elegantly arranged armor, wings, tilted rings, open arches and opposing ribbons.
Preserve each subject's identity; no automatic rewriting of existing prompts.
The [Awaken the Machines pack](../creatures/Awaken%20the%20Machines.md) applies it to20
Conduits/six futuristic mythic machines and two scorched-wasteland scenes.
Rosetta's requested revert was withdrawn; her current prompt stays unchanged.

### Restored compact progression (D-109)

**Roses restoration (D-114):** owner withdrew D-113's less-chibi proportions.
All rose EBs follow the compact Bliss/Bruno approach throughout: oversized
rounded head, tiny torso, short limbs,2.5-3 heads tall, body one third of canvas.
Keep only eyes detailed, no mouth/nose/eyebrows/other facial marks. Amplify
splendor through armor contour, mantle, weapon engineering, wings and increasing
opaque elemental structures, not body/world scale. Same anime/cel/painted
renderer, palettes, covered designs, no-glow powers and padded keys.
Six-star identities/1.1% Roses banner and pity changes remain approved.
[Rosetta](../characters/Rosetta%20Art.md) is Phase8 restored; owner next requested
[Thornia](../characters/Thornia%20Art.md), Phase9 under D-117, revised next.
Owner then requested [Roselius/materials](../creatures/Passion%20of%20Crimson%20Roses.md),
Phase10 under D-118, and added [Crinso](../characters/Crinso%20Art.md), Phase11 under D-119.
Both packs are now revised; pause for review of these latest lines.

**Future evolution splendor (D-117):** increasingly wild but elegant effects
and regalia should spread through the artwork, with deliberate opposing sweeps,
off-axis fans, layered open arches and fragment/ribbon choreography. Preserve
compact eyes-only anatomy, original renderer/identity, readable equipment,
opaque no-glow powers and keyed margins; do not equate escalation with wing
count alone. Thornia applies this through shadow-garden thorn/eclipses, not
Rosetta's solar archery identity; Rosetta's existing blocks remain unchanged.
D-120 clarifies late-form **interior density**: final three evolutions are
where busy rear elemental detailing shines, not merely a wide bounding box
with empty interior. Rosetta Omnic now layers rose mandalas/thorn lattice/
radial petals/ribbons/prism fragments behind her body and wings, leaving
only narrow key channels and a clear face/bow window. Preserve flat unlit
key through openings, no glow/scenery, compact anatomy and original renderer.
Only that Omnic block changes in D-120; other stages/lines require their own
review. Do not replace readability with an opaque featureless tangle.
Thornia also uses50/60/72/84/94/96% ensemble targets with25/20/14/8/3/2% margins.
D-118/D-119 apply the same progressive ensemble spread and elegant geometry
to Roselius and Crinso, retaining their distinct identities: weaponless
Luminous rose-angel casting vs Chaotic gold-flame/crimson-lightning sword duality.
Rosethorn materials use the same renderer/effect architecture but retain
face-free two-thirds-square silhouettes and small-icon readability, not
near-full-canvas creature framing. No scenery-prompt changes.

**Rosetta progressive framing (D-116, refining D-115):** artwork ensemble spans
50/60/72/84/94/96% width and height across six forms. Legendary/Omnic are
near-full-canvas compositions (94%/96%,3%/2% margins), spreading wings/mantle/
thorn arches/ribbons toward every side and corner, not
larger bodies or cropped scenery. Keep compact anatomy/body one third,
eyes-only face and clear keyed channels. D-159 replaces the earlier
rose-violet/sapphire-blue additions with ruby-red/scarlet/champagne-gold/ivory
facets inside the crimson/gold/ivory identity, without glow or renderer drift.
This tighter framing now also applies to Thornia under D-117, not a blanket
padding change to unrelated packs. D-118/D-119 additionally apply it to
Roselius/Crinso portraits, not their item/icons/equipment cutouts.

Owner rejected Bruno's D-107/D-108 body/scale directions and explicitly chose
the previous compact Bliss-style approach. Those directions are superseded,
not current approval to change anatomy in remaining packs.
Keep rounded oversized head, tiny torso, short limbs and2.5-3-head proportions
in every character form; body roughly one third of4:3 canvas. Epic progression
comes from armor contour/mass, weapon engineering, mantle, elemental wings,
crown and powers around the unchanged body, never deity-body transformation.
Preserve the anime/cel/painted renderer, identity, palette, eyes-only face,
non-explicit covered designs, no-glow powers and full cutout padding.

[Bruno](../characters/Bruno%20Art.md) is restored under this rule. Owner next requested
[Disciple](../characters/Disciple%20Art.md), Phase5 under D-110, then
[Elise](../characters/Elise%20Art.md), Phase6 under D-111, then
[Razor](../characters/Razor%20Art.md), Phase7 under D-112, then
[Rosetta](../characters/Rosetta%20Art.md), Phase8 restored/refined under D-114 through D-116,
then [Thornia](../characters/Thornia%20Art.md), Phase9 under D-117.
Owner next requested Roselius/materials and Crinso, Phases10/11 under
D-118/D-119, now paused for review.
Bliss's D-106 prompts remain exactly unchanged and are the accepted direction.
No gameplay, camera, size mechanics or supplied assets changed.

### Neutral character wording (D-104)

Character copy blocks, including icons, equipment and these shared examples,
use non-explicit visual descriptions. Describe armor as torso plates/panels,
casting with open hands/palms and abstract effects as geometric bands/tabs.
Use partial-body framing rather than an ambiguous anatomy term in exclusions.
Avoid unnecessary explicit injury terms even in negative lists; exclusions
are still submitted text. Keep fully covered human clothing or non-explicit
elemental bodies, stylized proportions, original identities, weapons, palettes
and evolution structures.
Copy only the prompt block, not headings, mechanics or narrative context.

This is a conservative wording review, not a verified Midjourney blacklist or
an acceptance guarantee. Moderation can depend on the complete request,
reference images and current service rules. Do not disguise prohibited content
or try to bypass a rejection; review the stated reason and simplify the
non-explicit art description in accordance with the service's rules.
Run `python -m unittest discover -s tools -p test_art_prompts.py` for the local
wording regression alongside structural checks. Generated output still needs
visual review. This cross-pack wording pass does not advance D-101's individual
design-review phases.

**D-101 review gate:** owner reported that newer character generations do not
consistently match the originals. Correct **one character at a time**, using
Infernis/Tizu/Flora's exact compact renderer and Wraththorn/Dawnthorn's physical
progression. [Atmoso](../characters/Atmoso%20Art.md) is Phase1, whose direction the owner
accepted; [Aurora](../characters/Aurora%20Art.md) is Phase2, also accepted in direction.
[Bliss](../characters/Bliss%20Art.md) is Phase3; owner moved next to
[Bruno](../characters/Bruno%20Art.md), Phase4 restored under D-109, then
[Disciple](../characters/Disciple%20Art.md), Phase5 revised under D-110, then
[Elise](../characters/Elise%20Art.md), Phase6 under D-111, then
[Razor](../characters/Razor%20Art.md), Phase7 under D-112, then
[Rosetta](../characters/Rosetta%20Art.md), Phase8 restored/refined under D-114 through D-116,
then [Thornia](../characters/Thornia%20Art.md), Phase9 under D-117 and paused for review.
Roselius/materials and Crinso were subsequently revised under D-118/D-119,
now paused for review. No requested rose line remains individually uncorrected.
Moving on does not certify every
generated image. Revised copy blocks omit proper
names/title labels, explicitly specify solid contrasting keys (orange/magenta/green) and
exclude lettering. Copy only a prompt body, append the actual approved style
reference, and inspect generated outputs. Tests cannot certify visual style.

For Bliss and subsequent individual revisions, maintain non-explicit imagery
as well as neutral wording: fully covered clothing/armor and abstract elemental
motion in empty space, not depicted injury or bound figures. Translate more of
Wraththorn's layered plates, fracture seams, divided mantle, orbit fragments,
branching wings and retained final regalia into each unique identity. This is a
structural strengthening, never a different renderer or explicit horror imagery.
D-109 retains compact character anatomy in all forms.
Neither wording nor visual direction guarantees service acceptance.

**Bliss review clarification (D-106):** owner supplied Wraththorn base/final
images because a slight trim/wing increase still missed the transformation.
For the current Bliss-only revision, change armor contour/mass, mantle volume
and equipment scale, not only wing counts. Her late collar/shoulder canopy,
gauntlets/greaves, waterfall feather mantle and colossal tiered fans dominate
around the fixed small body. Each final fan spans twice her body height.
Translate the images' exaggeration into her own ivory/rose identity; do not copy
their purple, slime anatomy, glow, extra figures or realistic proportions.
That image revision was Bliss only. Bruno now follows the restored D-109 rule.

For the seven new flagship character lines, D-099 requires concrete visual
escalation in the prompt body: simple starter clothing, first forged gear,
complete battle armor/winglets, then full-body prismatic armor, large layered
elemental prism wings, swirling powers and increasingly ornate signature
weapons/foci. Match late Heaven/Abyss slime impact with the starter renderer.
The6-star beginners remain simple too; their finales escalate further.
Radiant visual presence uses saturated facets/non-emissive painted highlights,
not source-cutout glow. This does not add wings to unrelated creature/item packs
or repaint existing approved assets. See the
[flagship progression](../characters/Flagship%20Characters.md#visual-escalation).

Rendering is shared; identity is not. Keep each authored name, species, palette,
weapon, clothing motif, material shape and evolution feature before the style
clause. Do not replace distinctive designs with generic angels, demons or gems.
Use clean precise anime contours, crisp cel shading, smooth painted highlights
and jewel-like colors within the subject's own palette. No splotchy ink fills,
photographic materials, gritty textures or cinematic character splash-art framing.

- Characters in every form: oversized rounded heads, tiny torsos, short limbs,
  eyes-only faces; approximately2.5-3 heads tall, small body and complete
  weapon/effects at4:3. Armor/equipment/elemental structures grow around the
  unchanged anatomy, with complete padding.
- Creature anatomy stays species-specific: quadrupeds retain four legs, birds
  retain wings, and base slimes stay rounded and limbless. Apply compact chibi
  proportions, not a human skeleton, to these designs.
- Materials, ability icons and currencies: chunky readable objects at1:1,
  roughly two thirds of the canvas; no humanoid face or body requirements.
- Standalone weapons: retain their readable functional parts and3:2 framing,
  rendered with the same clean illustrated materials rather than ink showcases.
- Heaven/Abyss: stronger silhouette, thorns, armor, wings and halos may become
  elaborate, but the same slime identity, compact proportions and renderer remain.
- Scenery: full-bleed3:1 banners or16:9 arenas, matching linework/color treatment
  with their authored atmospheric lighting. Solid key backgrounds/no-glow cutout
  restrictions do not turn scenery into isolated icons.
  Summoning banners specifically use16:9 full-bleed Omnic-tier artpieces, not
  the3:1 dungeon/archive header format.

Character-form prompts use the owner's evolution-specific references below.
Their copy-ready blocks already end with `--sref URL --sw 150`: do not append
another pair. Enemy prompts use no reference flags under D-155. Non-portrait art
uses no `--sref` or `--sw` under D-147, including all other cutouts and scenery.
Compare generated artwork visually; references cannot guarantee exact style
or moderation acceptance. No supplied/runtime artwork is repainted.

### Character-form style references

**Historical enemy extension (D-132/D-153, superseded by D-155):** six-form enemy packs
use the separate enemy references below, Evo.1-6 directly. Other enemy
generation blocks retain the character-reference table: eight-enemy
lineups use1/2/2/3/4/5/5/6; ten-enemy lineups use1/2/2/3/3/4/4/5/5/6.
Basic Adventure enemies use Evo.1. This is ascending visual-position mapping,
not new creature evolution, rarity, level or gameplay metadata. All129 enemy
blocks formerly included the suffix; all129 suffixes are now removed.
Do not append enemy references. Icons, materials,
weapons, Conduits and scenery remain outside this reference assignment.
The six-form override covers Awaken the Machines, Crownfall Treasury,
Rosethorn Sanctuary, Passion of Crimson Roses, Soar to Heaven and Delve into
the Abyss. It changes only style-reference suffixes, not original species,
equipment, palettes, framing, anatomy, powers or installed art. References
guide rendering, never copying another game's characters/assets.

#### Six-form enemy references (D-153)

Historical URLs only, preserved for provenance. D-155 removes `--sref` and
`--sw` from every enemy prompt; do not append these URLs to new enemy prompts.
Unlike the character mapping, enemy Evo.2 and Evo.3 have distinct URLs.
Preserve every query parameter. Signed links may expire; request refreshed
owner links rather than substituting references. No images were downloaded
or generated for this prompt-only update.

| Enemy form | Reference URL |
| --- | --- |
| Enemy Evo 1 | https://media.discordapp.net/attachments/1006667219217952879/1557769894110560307/Unit_ills_full_60011.webp?ex=6ac901c4&is=6ac7b044&hm=cc07e201ecc260aedc39bc59eb1159f063ec34844e73e5bdb8cfb954140d66b1&=&format=webp&width=987&height=778 |
| Enemy Evo 2 | https://media.discordapp.net/attachments/1006667219217952879/1557769891648508094/Unit_ills_full_60012.webp?ex=6ac901c4&is=6ac7b044&hm=195a759e5ded4ee0961545bf305842796e5a852f2cb01d13928b3904a3418d87&=&format=webp&width=935&height=778 |
| Enemy Evo 3 | https://media.discordapp.net/attachments/1006667219217952879/1557769893485477899/Unit_ills_full_60013.webp?ex=6ac901c4&is=6ac7b044&hm=c591e1e43764c13c32f4fa5fa6f0388148af21f80f98b7e13ab32d5370318d86&=&format=webp&width=989&height=778 |
| Enemy Evo 4 | https://media.discordapp.net/attachments/1006667219217952879/1557769893091221564/Unit_ills_full_60014.webp?ex=6ac901c4&is=6ac7b044&hm=c1c22c7eb09b473a816e5e0fcb0153060e7bca15b35b5694a1546aa1f26ba57d&=&format=webp&width=1084&height=778 |
| Enemy Evo 5 | https://media.discordapp.net/attachments/1006667219217952879/1557769892646756553/Unit_ills_full_60015.webp?ex=6ac901c4&is=6ac7b044&hm=605ee13d3deb83177cf6c6a5837b1bfdd80973637542bcb2f83f3cb24b9fe89e&=&format=webp&width=1097&height=778 |
| Enemy Evo 6 | https://media.discordapp.net/attachments/1006667219217952879/1557769892206346280/Unit_ills_full_60016.webp?ex=6ac901c4&is=6ac7b044&hm=3fe66f34ed63fa6103c5c04a10a8f9292342deadae465f8ee98a31d994028d7c&=&format=webp&width=1148&height=778 |

**Frame containment:** every character/enemy full-body prompt must explicitly
keep the complete silhouette, weapons, wings, tails and powers within a clear
outer margin. They may approach but never touch or cross the image edges.
Existing character progression margins remain; do not crop to increase presence.
Validate with `python -m unittest discover -s tools -p test_enemy_style_references.py`.

Owner-confirmed mapping: existing base/Common is **Evo.1**, followed directly
by Evo.2-6. Evo.0 is reserved for explicitly numbered future Evo.0 prompts,
not a new gameplay form. Generic master templates use Evo.0; the guide's
Stage1-6 examples use matching Evo.1-6. Starter base portraits use Evo.1.
Evo.2 and Evo.3 intentionally share a URL. Keep a space between the complete
URL and `--sw 150`; do not alter its query parameters.

| Evolution | Reference URL |
| --- | --- |
| 0 | https://media.discordapp.net/attachments/1006667219217952879/1557598571459518555/Unit_ills_full_10011.webp?ex=6ac86236&is=6ac710b6&hm=342fcaf73a6540d793e059bf4df865696feb1d5d1b210727b1230418fe8bcd14&=&format=webp&width=927&height=723 |
| 1 | https://media.discordapp.net/attachments/1006667219217952879/1557599871546949782/Unit_ills_full_10013.webp?ex=6ac8636c&is=6ac711ec&hm=ad01070e9a0cdbe9241bb98a758ed8329911ae4bb5b04629c636c13421e2fd73&=&format=webp&width=1123&height=778 |
| 2 | https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 |
| 3 | https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 |
| 4 | https://media.discordapp.net/attachments/1006667219217952879/1557599872381624371/Unit_ills_full_10015.webp?ex=6ac8636c&is=6ac711ec&hm=461c4602b0b28386e1373a9e4eaf081bb56cc69163fed126952c4065e45aa3c7&=&format=webp&width=950&height=778 |
| 5 | https://media.discordapp.net/attachments/1006667219217952879/1557599872771686440/Unit_ills_full_10016.webp?ex=6ac8636c&is=6ac711ec&hm=47e8c081f934e035f43da638a09d14991a90521cbfd7d4794d113c7bdf3891f7&=&format=webp&width=956&height=778 |
| 6 | https://media.discordapp.net/attachments/1006667219217952879/1557598570910060564/Unit_ills_full_10017.webp?ex=6ac86236&is=6ac710b6&hm=a25734b8c781314dc6db6923c2449ecf97638d2bfa73032b17862cfa75932654&=&format=webp&width=817&height=778 |

For future character forms, append the matching suffix after all other flags,
retain the compact anime/cel renderer and contrasting solid key background,
and use neutral, non-explicit descriptions. This is not guidance to evade
moderation. These signed Discord links may expire; if inaccessible, request
a refreshed owner-supplied URL rather than silently substituting a reference.
Validate exact suffixes with
`python -m unittest discover -s tools -p test_character_style_references.py`
and wording/rendering with
`python -m unittest discover -s tools -p test_art_prompts.py`.

## Game-wide rarity tone: Common to Omnic

**Owner-confirmed direction:** As rarity rises, designs become less cutesy and
more epic, majestic, formidable and awe-inspiring. This applies across the game,
not just Conduits. The rendering style stays the same; compact proportions do
not require babyish designs or cute prompt language at higher rarities.

| Rarity | Design and prompt tone |
| --- | --- |
| Common | Simple, restrained and approachable; modest gear and limited ornamentation. |
| Uncommon | More capable and distinctive; emerging elemental identity and stronger silhouettes. |
| Rare | Impressive, commanding and heroic; developed equipment and elemental motifs. |
| Epic | Formidable, magnificent and battle-ready; dramatic poses and elaborate signature features. |
| Legendary | Majestic, extraordinary and awe-inspiring; masterful equipment and grand elemental structures. |
| Omnic | Supreme, transcendent elemental masterpiece; breathtaking presence and fully realized signature design. |

Progressively reduce words such as "cute", "adorable", "baby", "little",
"playful" and "toy-like" in high-rarity subject descriptions. Favor "formidable",
"majestic", "regal", "magnificent", "transcendent" and "awe-inspiring" where
appropriate to the subject. Escalate design, posture, weapons, machinery,
ornamentation and bounded elemental effects, not merely palette or adjective
count. Keep authored species, recognizable identity, palettes and elemental
themes intact; not every subject needs crowns, wings or the same ornamentation.

Do not interpret epic tone as realistic anatomy, gritty rendering, full-frame
cinematic splash art or a different art style. Preserve clean anime contours,
crisp cel shading, smooth painted highlights, compact species-appropriate
proportions, eyes-only character faces and complete silhouettes with padding.
Cutout backgrounds and non-emissive source-art rules remain in force.
Rarity, not star count alone, controls this tone; the current 5-star starters
still begin in restrained Common forms.

## Core Master Prompt (copy/paste base)

```
full-body gacha JRPG unit illustration on a plain canvas, one small [CHARACTER DESCRIPTION], rounded oversized head, tiny torso and short limbs, 2.5 to 3 heads tall, eyes are the only facial features, entire character visible from head to feet at roughly one third of canvas height, ornate [WEAPON/PROP] much larger than the character with its entire silhouette visible, flowing costume with gold trim, separate curling [ELEMENT COLOR] magic ribbons framing the small figure, background-color gaps between the effects, generous background-color margin around the complete illustration, clean precise contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors, compact decorative composition, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, strict subject palette lock: ONLY [CHARACTER MAIN COLOR GRADIENT AND AUTHORED ACCENTS] gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid [BACKGROUND COLOR] background ([BACKGROUND HEX]), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no [UNWANTED SUBJECT COLORS OUTSIDE THE AUTHORED PALETTE], photorealism, 3d render, closeup, portrait, partial-body framing, cropping, nose, mouth, eyebrows, scenery, horizon, vignette, gritty texture, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557598571459518555/Unit_ills_full_10011.webp?ex=6ac86236&is=6ac710b6&hm=342fcaf73a6540d793e059bf4df865696feb1d5d1b210727b1230418fe8bcd14&=&format=webp&width=927&height=723 --sw 150
```

> Swap the bracketed segments per character, including both background placeholders after choosing the subject palette. Keep subject identity and composition first; leave the background instruction last. Avoid adding "cinematic," "battle splash art," aggressive foreshortening, or full-frame flame backdrops: those can compete with the compact background-color-canvas composition.

### Negative-Space Rule for All Character Portraits

Keep a small but unmistakable solid background-color border on all four sides, outside the outermost weapon, costume, and elemental effects, not just around the character's body. Add this wording before the parameters in any character prompt:

```
centered composition, clear empty margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges
```

Later evolutions need not all conceal the character or summon another figure. Fire emphasizes enveloping elemental vestments; water emphasizes readable action poses and increasingly magnificent spear designs; grass emphasizes expanding wings and aura. Any concealment is intentional overlap, not cropping. Keep the eyes and signature clothing recognizable (fire's red scarf, water's blue sash, grass's green neckerchief), the complete weapon readable, and background-color gaps within the effects.

---

## Style Anchor Keywords (always include these)

Keep these priorities in every character prompt. They describe the target; text alone does not guarantee a match to the supplied image:

```
full-body gacha JRPG unit illustration, rounded oversized head, tiny torso, short limbs, eyes-only face, small character with complete head-to-feet silhouette, much larger ornate weapon, flowing costume, separate curling magic ribbons, visible gaps and outer margin, clean precise contours, crisp cel shading, smooth painted highlights, jewel-like colors
```

---

## Elemental Character Evolution Lines

Each line has six stages and keeps the same hair, eyes, signature clothing motif, and weapon type throughout. Stage 1 is intentionally plain: simple clothes, one basic weapon, and almost no effects. Evolution changes the pose and dominant design feature, not the character's body size. Fire grows into an enveloping flame vestment; water develops increasingly dynamic spear techniques and weapon ornamentation; grass develops increasingly elaborate wings and opaque leaf-shaped energy ribbons while its bow stays secondary. Apply the negative-space rule above to every portrait, including the basic forms. Each prompt already includes its matching Stage1-6 style reference; do not append another.

### Fire: Ember Swordsman

#### Stage 1 - Ember Beginner

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair, amber eyes only, rounded oversized head and short limbs, plain cream tunic, small red scarf, brown boots, one simple wooden sword slightly taller than the character, one tiny orange spark, relaxed standing pose, extremely basic starter design, entire character and weapon visible, character roughly one third of canvas height, generous background-color margins, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, strict subject palette lock: ONLY copper scarlet orange amber cream pearl brown and rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, lavender, photorealism, 3d render, nose, mouth, eyebrows, armor, filigree, crown, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871546949782/Unit_ills_full_10013.webp?ex=6ac8636c&is=6ac711ec&hm=ad01070e9a0cdbe9241bb98a758ed8329911ae4bb5b04629c636c13421e2fd73&=&format=webp&width=1123&height=778 --sw 150
```

#### Stage 2 - Flame Knight

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair, amber eyes only, rounded oversized head and short limbs, cream tunic beneath red armor with modest gold trim, longer red scarf, brown boots, ornate flame-shaped sword twice the character's height, two orange fire ribbons framing a light airborne pose, entire character and weapon visible, character roughly one third of canvas height, background-color gaps between effects and generous background-color margins, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, strict subject palette lock: ONLY copper scarlet orange amber cream pearl brown and rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, lavender, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 150
```

#### Stage 3 - Phoenix Sovereign

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair, amber eyes only, rounded oversized head and short limbs, regal crimson and gold armor over cream fabric, enormous flowing red scarf and feathered cape, phoenix crown, magnificent gold-trimmed flame sword three times the character's height, vast orange and scarlet phoenix-shaped fire ribbons spreading around the tiny airborne figure, epic third evolution, entire character and weapon visible, character roughly one third of canvas height, background-color gaps between effects, centered composition with a clear solid background-color breathing margin on all four sides beyond the entire figure weapon and effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY copper scarlet orange amber cream pearl brown and rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, lavender, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 150
```

#### Stage 4 - Inferno Ascendant

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair and amber eyes only, rounded oversized head and short limbs, same crimson and gold armor with flowing red scarf, immense layered phoenix-flame mantle rising above the figure, enormous ornate flame sword fully visible, orange and scarlet feather-shaped fire plumes becoming part of the costume and partially veiling the lower legs, head torso and scarf still clearly recognizable, elemental design larger and more elaborate than the previous evolution, small character within a centered decorative composition, background-color gaps between fire plumes, clear solid background-color margin on all four sides beyond the entire figure weapon and effects, nothing touches the frame edges, dense rear elemental tapestry of phoenix-feather arches and scarlet flame ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 84 percent of canvas width and height, 8 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY copper scarlet orange amber cream pearl brown and rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, lavender, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872381624371/Unit_ills_full_10015.webp?ex=6ac8636c&is=6ac711ec&hm=461c4602b0b28386e1373a9e4eaf081bb56cc69163fed126952c4065e45aa3c7&=&format=webp&width=950&height=778 --sw 150
```

#### Stage 5 - Solar Phoenix Avatar

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair and amber eyes only, rounded oversized head and short limbs, same red scarf threading through regal crimson and gold armor, gigantic scarlet orange and white-gold phoenix wings formed from ornate curling fire feathers, layered solar halo and flame-petal mantle, enormous ornate flame sword fully visible outside the fire mantle, elemental forms dominate while overlapping and concealing most of the tiny torso and legs, face scarf and one sword-holding hand remain recognizable, more intricate and majestic than the previous evolution, entire figure positioned inside a centered decorative composition, background-color gaps between wings halo and flame ribbons, clear solid background-color margin on all four sides beyond the entire figure weapon and effects, nothing touches the frame edges, dense rear elemental tapestry of phoenix-feather arches and scarlet flame ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 94 percent of canvas width and height, 3 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one quarter of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY copper scarlet orange amber cream pearl brown and rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, lavender, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872771686440/Unit_ills_full_10016.webp?ex=6ac8636c&is=6ac711ec&hm=47e8c081f934e035f43da638a09d14991a90521cbfd7d4794d113c7bdf3891f7&=&format=webp&width=956&height=778 --sw 150
```

#### Stage 6 - Eternal Flame Divinity

```
full-body gacha JRPG unit illustration on plain canvas, the same tiny copper-haired amber-eyed chibi almost enveloped by an immense regal phoenix-shaped elemental vestment, eyes are the only facial features, a small recognizable face and flowing red scarf visible at its heart while nearly all armor torso and limbs are concealed by layered fire, magnificent scarlet orange and white-gold flame feathers, multiple nested sun halos and intricate gold-traced fire ribbons, enormous ceremonial flame sword entirely visible alongside the elemental form, ultimate evolution with the richest ornamentation and largest elemental silhouette in the line, the character remains tiny rather than becoming a giant, all physical and elemental forms contained inside a centered decorative composition, deliberate background-color gaps separating the many flame layers, clear solid background-color margin on all four sides beyond the entire figure weapon and effects, nothing touches the frame edges, dense rear elemental tapestry of branching vine arches and emerald leaf ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 96 percent of canvas width and height, 2 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, rounded oversized head, short limbs, physical character roughly one fifth of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY copper scarlet orange amber cream pearl brown and rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, lavender, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557598570910060564/Unit_ills_full_10017.webp?ex=6ac86236&is=6ac710b6&hm=a25734b8c781314dc6db6923c2449ecf97638d2bfa73032b17862cfa75932654&=&format=webp&width=817&height=778 --sw 150
```

### Water: Tide Spearbearer

#### Stage 1 - Tide Beginner

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short blue hair, blue eyes only, rounded oversized head and short limbs, plain white tunic, small blue sash, simple sandals, one plain wooden spear slightly taller than the character, one small floating water droplet, relaxed standing pose, extremely basic starter design, entire character and weapon visible, character roughly one third of canvas height, generous background-color margins, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, strict subject palette lock: ONLY sapphire blue turquoise aqua silver white pearl and brown gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no red, scarlet, orange, magenta, violet, purple, lavender, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, armor, filigree, crown, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871546949782/Unit_ills_full_10013.webp?ex=6ac8636c&is=6ac711ec&hm=ad01070e9a0cdbe9241bb98a758ed8329911ae4bb5b04629c636c13421e2fd73&=&format=webp&width=1123&height=778 --sw 150
```

#### Stage 2 - Wave Guardian

```
full-body gacha JRPG unit illustration on plain canvas, tiny blue-haired chibi with blue eyes only, rounded oversized head and short limbs, white tunic beneath light blue armor with silver trim, flowing blue sash, low wide-legged guard stance with both hands on a wave-tipped silver spear twice the character's height, spear held diagonally across the body without covering the face, one narrow turquoise wake following its tip, entire pose and complete spear visible, small character roughly one third of canvas height, clear background-color gaps and solid background-color breathing margins beyond the figure weapon and effects on all four sides, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY sapphire blue turquoise aqua silver white pearl and brown gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no red, scarlet, orange, violet, purple, lavender, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 150
```

#### Stage 3 - Ocean Sovereign

```
full-body gacha JRPG unit illustration on plain canvas, tiny blue-haired chibi with blue eyes only, rounded oversized head and short limbs, sapphire and silver armor over white fabric, blue sash streaming backward, deep side-facing forward lunge with front knee bent and rear leg extended, both hands thrusting an ornate silver spear three times the character's height across the canvas, enlarged opaque wave-shaped spearhead with pearl inlays, turquoise water jet extending from the tip and scattered droplets tracing the thrust, weapon and action dominate rather than a summoned creature, entire figure spear and jet visible with minimal foreshortening, small character roughly one third of canvas height, background-color gaps and clear solid background-color breathing margins on all four sides beyond all effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY sapphire blue turquoise aqua silver white pearl and brown gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no red, scarlet, orange, violet, purple, lavender, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 150
```

#### Stage 4 - Abyssal Ascendant

```
full-body gacha JRPG unit illustration on plain canvas, tiny blue-haired blue-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, streamlined sapphire and silver armor and flowing blue sash, airborne twisting sweep with one knee tucked and the other leg extended, both hands swinging an immense silver spear in a broad sideways arc, layered shell filigree and a wide crescent-wave spearhead, a sweeping turquoise water crescent traces the weapon path behind the figure, spear detailing and athletic silhouette more elaborate than the previous stage, complete shaft blade and both feet visible, small character within a centered decorative composition, background-color gaps between water trails and limbs, clear solid background-color margins on all four sides beyond all effects, nothing touches the frame edges, dense rear elemental tapestry of branching vine arches and emerald leaf ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 84 percent of canvas width and height, 8 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY sapphire blue turquoise aqua silver white pearl and brown gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no red, scarlet, orange, violet, purple, lavender, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872381624371/Unit_ills_full_10015.webp?ex=6ac8636c&is=6ac711ec&hm=461c4602b0b28386e1373a9e4eaf081bb56cc69163fed126952c4065e45aa3c7&=&format=webp&width=950&height=778 --sw 150
```

#### Stage 5 - Leviathan Avatar

```
full-body gacha JRPG unit illustration on plain canvas, tiny blue-haired blue-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, regal fitted sapphire and silver armor with flowing blue sash, ascending corkscrew leap with torso turned and legs scissored, both hands driving an enormous spear diagonally upward, magnificent layered tidal spearhead with pearl-set silver fins and opaque aqua edges, spiraling water ribbons follow the shaft and fan outward beyond the blade like a drilling vortex, spear is the largest and most detailed physical element, epic motion without concealing the face hands or leg pose, complete weapon and figure inside a centered composition, deliberate background-color gaps between vortex ribbons, clear solid background-color margins on all four sides beyond all effects, nothing touches the frame edges, dense rear elemental tapestry of branching vine arches and emerald leaf ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 94 percent of canvas width and height, 3 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one quarter of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY sapphire blue turquoise aqua silver white pearl and brown gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no red, scarlet, orange, magenta, violet, purple, lavender, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872771686440/Unit_ills_full_10016.webp?ex=6ac8636c&is=6ac711ec&hm=47e8c081f934e035f43da638a09d14991a90521cbfd7d4794d113c7bdf3891f7&=&format=webp&width=956&height=778 --sw 150
```

#### Stage 6 - Eternal Tide Divinity

```
full-body gacha JRPG unit illustration on plain canvas, same tiny blue-haired blue-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, exquisite sapphire and silver armor with flowing blue sash, dramatic suspended downward finishing thrust in side-three-quarter view, torso leaning forward with one leg extended behind and the other folded, both hands driving a colossal ceremonial tidal spear diagonally downward, fully visible weapon with intricate pearl filigree and an enormous solid-color multi-layered wave spearhead, cascading turquoise and sapphire energy streams unfurl from the blade into a separated fan of tidal crescents, ultimate evolution focused on supreme spear mastery and spectacular weapon motion rather than another creature or concealing mantle, face hands and athletic body silhouette remain readable, tiny character dwarfed by weapon and its attack trail, all elements contained within a centered composition, background-color gaps between cascading streams and clear solid background-color margins on all four sides, nothing touches the frame edges, dense rear elemental tapestry of branching vine arches and emerald leaf ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 96 percent of canvas width and height, 2 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one fifth of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY sapphire blue turquoise aqua silver white pearl and brown gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no red, scarlet, orange, violet, purple, lavender, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557598570910060564/Unit_ills_full_10017.webp?ex=6ac86236&is=6ac710b6&hm=a25734b8c781314dc6db6923c2449ecf97638d2bfa73032b17862cfa75932654&=&format=webp&width=817&height=778 --sw 150
```

### Grass: Sprout Archer

#### Stage 1 - Sprout Beginner

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short moss-green hair, green eyes only, rounded oversized head and short limbs, plain beige tunic, small green neckerchief, brown boots, one simple wooden bow slightly taller than the character, one small floating leaf, relaxed standing pose, extremely basic starter design, entire character and weapon visible, character roughly one third of canvas height, generous background-color margins, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, strict subject palette lock: ONLY moss emerald lime beige brown pearl and pale rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no navy, cyan, turquoise, violet, purple, lavender, magenta, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, armor, filigree, crown, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871546949782/Unit_ills_full_10013.webp?ex=6ac8636c&is=6ac711ec&hm=ad01070e9a0cdbe9241bb98a758ed8329911ae4bb5b04629c636c13421e2fd73&=&format=webp&width=1123&height=778 --sw 150
```

#### Stage 2 - Leaf Warden

```
full-body gacha JRPG unit illustration on plain canvas, tiny moss-green-haired chibi with green eyes only, rounded oversized head and short limbs, beige tunic with modest green leaf armor and green neckerchief, first small pair of opaque leaf wings unfolding from the back, tiptoe balancing pose with one heel raised, simple leaf-carved bow held lowered and fully visible, distinct opaque lime ribbon shapes with a few drifting leaves, wings and aura are the new evolution features while the bow stays modest, entire character visible at roughly one third of canvas height, clear background-color gaps and solid background-color breathing margins on all four sides beyond the figure wings weapon and aura, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY moss emerald lime beige brown pearl and pale rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no navy, cyan, turquoise, violet, purple, lavender, magenta, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 150
```

#### Stage 3 - Verdant Sovereign

```
full-body gacha JRPG unit illustration on plain canvas, tiny moss-green-haired chibi with green eyes only, rounded oversized head and short limbs, emerald leaf armor over beige fabric with flowing green neckerchief, two large opaque leaf-veined wings spread wide, gentle hovering pose with knees bent and bow held loosely at one side, modest gold-trimmed vine bow fully visible, open emerald aura ring behind the wings with orbiting leaves and solid-color pollen, wing span exceeds the character and bow together, epic third evolution focused on flight and aura, small character roughly one third of canvas height, background-color gaps between wings and aura, clear solid background-color breathing margins on all four sides beyond all elements, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY moss emerald lime beige brown pearl and pale rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no navy, cyan, turquoise, violet, purple, lavender, magenta, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 150
```

#### Stage 4 - Wildgrowth Ascendant

```
full-body gacha JRPG unit illustration on plain canvas, tiny moss-green-haired green-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, emerald and gold leaf armor with green neckerchief streaming sideways, four layered leaf wings with gold-traced veins and grass-blade tips, banking sideways flight pose with one knee tucked and torso gently turned, modest living-vine bow held close with its string and limbs fully visible, sweeping lime and emerald aura wake trailing the wings with curled leaves and solid-color pollen dots, wings become more ornate while the aura follows the flight path, small character within a centered decorative composition, background-color gaps between wing layers and aura ribbons, clear solid background-color margins on all four sides beyond all elements, nothing touches the frame edges, dense rear elemental tapestry of branching vine arches and emerald leaf ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 84 percent of canvas width and height, 8 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY moss emerald lime beige brown pearl and pale rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no navy, cyan, turquoise, violet, purple, lavender, magenta, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872381624371/Unit_ills_full_10015.webp?ex=6ac8636c&is=6ac711ec&hm=461c4602b0b28386e1373a9e4eaf081bb56cc69163fed126952c4065e45aa3c7&=&format=webp&width=950&height=778 --sw 150
```

#### Stage 5 - Worldbloom Avatar

```
full-body gacha JRPG unit illustration on plain canvas, tiny moss-green-haired green-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, emerald and gold leaf armor and flowing green neckerchief, six enormous solid-color leaf wings unfolding in an asymmetric ascending fan, upward-reaching flight pose with one arm lifted and legs trailing, modest gold-trimmed vine bow held lowered in the other hand with string and limbs fully visible, expanding flowering aura rings and emerald pollen streams trace the wing tips, fine gold veins and tiny blossoms enrich the wings, lower body partly veiled by solid-color leaf wisps while face and gesture stay recognizable, wings and aura dominate instead of weapon growth or a summoned figure, centered composition with background-color gaps between wing fans and rings, clear solid background-color margins on all four sides beyond all elements, nothing touches the frame edges, dense rear elemental tapestry of branching vine arches and emerald leaf ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 94 percent of canvas width and height, 3 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one quarter of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY moss emerald lime beige brown pearl and pale rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no navy, cyan, turquoise, violet, purple, lavender, magenta, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872771686440/Unit_ills_full_10016.webp?ex=6ac8636c&is=6ac711ec&hm=47e8c081f934e035f43da638a09d14991a90521cbfd7d4794d113c7bdf3891f7&=&format=webp&width=956&height=778 --sw 150
```

#### Stage 6 - Eternal Verdure Divinity

```
full-body gacha JRPG unit illustration on plain canvas, same tiny moss-green-haired green-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, regal emerald and gold leaf armor and green neckerchief, serene floating cross-legged pose with modest living-vine bow resting diagonally across the lap, complete bow string and limbs visible, magnificent multi-tiered leaf wings radiate from the back like an immense botanical mandala, intricate golden veins flowering wing tips and sweeping grass-blade feathers, vast separated emerald and lime aura rings with spiraling solid-color pollen dots and solid-color petals, ultimate evolution focused on spectacular wings and a vast array of solid-color aura rings, small face and neckerchief recognizable while opaque leaf ribbons partially veil the lower body, no separate summoned creature or tree figure, character remains tiny with wings far larger than the body, all elements inside a centered decorative composition, deliberate background-color gaps between wing tiers and aura rings, clear solid background-color margins on all four sides beyond all elements, nothing touches the frame edges, dense rear elemental tapestry of branching vine arches and emerald leaf ribbons fills interior gaps, powers and regalia dominate the small human figure with a clear face window, complete artwork ensemble spans 96 percent of canvas width and height, 2 percent solid background-color margin on all four sides, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one fifth of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, strict subject palette lock: ONLY moss emerald lime beige brown pearl and pale rose gradients plus white black gold and platinum on armor fabric wings weapons gems and powers, remap ALL style-reference colors to this palette, prismatic and opal describe faceting not extra hues, no contrasting subject colors, preserve shading and detail, subject ONLY not the key background, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no navy, cyan, turquoise, violet, purple, lavender, magenta, flames, fire, photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557598570910060564/Unit_ills_full_10017.webp?ex=6ac86236&is=6ac710b6&hm=a25734b8c781314dc6db6923c2449ecf97638d2bfa73032b17862cfa75932654&=&format=webp&width=817&height=778 --sw 150
```

---

## Parameter Reference & Why

| Parameter | Value | Purpose |
|---|---|---|
| `--ar` | `4:3` | Wider frame gives the oversized costume/weapon/effects room to spread out so the character reads as genuinely small within the composition. Use `1:1` only when a square card/portrait asset is specifically required |
| `--niji 6` | — | Niji model is tuned for anime/illustration linework; far closer to gacha game art than default MJ model. Do not pair with `--style` tokens unless using Midjourney's own in-app niji style picker — typing `--style expressive`/`raw` etc. manually throws a "Style not compatible with niji 6" error. Leave `--style` off entirely for the default niji look |
| `--s` (stylize) | `100` starting point | Start lower while testing character layout or weapon anatomy; raise only after the silhouette and background-color margins are working |
| `--q` | `1` (max for niji 6) | Niji 6 only accepts `0.25`, `0.5`, or `1` — values like `--q 2` are invalid and will error |
| `--seed` | optional | Lock a seed once you find a result with the right line-weight/shading balance, then reuse it across new characters for consistency |
| `--cref` / `--cw` | optional | Use character reference on an approved hero to keep anatomy/proportions consistent across a whole roster |
| `--sref` | evolution-matched reference for Element-Bearer character portraits only | Character blocks include the exact mapped URL with `--sw 150`. Enemy and non-portrait art use neither flag; text and references cannot guarantee a match |

### Recommended consistency workflow
1. Use the matching evolution URL in the character-form mapping above; the copy-ready blocks already include `--sref URL --sw 150`. Do not duplicate those flags or substitute an unrelated reference.
2. To also guide composition, place the reference image URL at the beginning of the prompt as an image prompt. This can carry over pirate details; a style reference alone does not lock layout.
3. Generate variants and inspect the actual result: complete head-to-feet figure, eyes-only face, small body compared with weapon and effects, and background-color gaps around the illustration. Numerical proportions in the prompt are targets, not enforced measurements.
4. Once an output matches, note its `--seed` and retain the matching evolution reference across the roster. Use `--cref <image_url> --cw 100` only when preserving the same character's identity.

---

## Negative Prompt / Things to Avoid

Character prompts above already include `--no`. Merge additional unwanted traits into that list rather than appending a second `--no` parameter:

```
--no closeup, portrait, partial-body framing, cropping, nose, mouth, eyebrows, scenery, horizon, vignette, gritty texture, photorealism, 3d render, watermark, text, logo, multiple characters, off-white background, background gradient, background texture, background shadows, background gradients, background fading, background vignette, background lighting variation, key-color spill on subject
```

---

## Quick Checklist Before Submitting a Prompt

- [ ] `--ar 4:3` included (use `1:1` only for square card assets)
- [ ] `--niji 6` included (no `--style` flag appended after it)
- [ ] Compact chibi proportions specified (approximately 2.5–3 heads tall, rounded oversized head, tiny torso, short limbs)
- [ ] Complete character contained within the frame; fire may conceal the body, water preserves readable action stances, and grass prioritizes wings and aura while retaining recognizable eyes and signature clothing
- [ ] Clear solid background-color breathing margin on all four sides beyond the outermost weapon, costume, and effects; nothing touches the frame edges
- [ ] Weapon/costume/effects much larger than the character, with complete weapon visible and background-color gaps between effects
- [ ] Original rendering anchors included: clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like colors; no inky, gritty or cinematic splash-art rendering
- [ ] Character isolated on a plain solid-color background with no scenery, gradient, texture, or background shadows
- [ ] Eyes are the character's only facial features (no nose, mouth, eyebrows, or other facial marks)
- [ ] Unique color motif chosen for the character's elemental theme (flame=red/orange, void=purple/black, nature=green/gold, etc.) for roster variety
- [ ] Supplied target reference attached with `--sref`; actual output checked before locking the roster style

---

## Floating Gacha Weapon Showcase Prompts (3:2)

These standalone 3:2 images use **the same clean chibi gacha JRPG rendering as the original character examples**, adapted to equipment rather than a humanoid body. One ornate weapon floats unsupported in background-color empty space with crisp anime contours, cel-shaded material planes, smooth non-emissive painted highlights and jewel-like theme colors. Preserve its functional parts: swords have a grip, guard, and blade; firearm-style ranged weapons have a grip, trigger guard, receiver, barrel, and open muzzle. These are anatomy cues, not realistic engineering or a sniper silhouette. Gold, rose-gold, pink, and wood tones remain on their authored panels and ornamentation. Keep a clear background-color margin outside the entire weapon and all effects. This replaces the earlier splotchy ink-showcase direction without changing weapon identity.

> Check each result at thumbnail size: can you trace the complete weapon without mistaking energy for a physical part? Reject results with merged effects, detached ornamental pieces, gritty brush textures or effects crossing the contour. The background is flat and untextured; there is no physical support under the weapon.

For the god-slaying showcases, retain illustrated depth through beveled metal, recessed engravings, cel-shaded facets, non-emissive painted highlights and solid-color energy accents. Do not switch to broken ink fills, photographic materials or realistic proportions. Energy ribbons may sweep around the weapon in depth, but leave the grip, barrel, muzzle and outer silhouette readable. Keep the background-color backdrop and outer margins even at maximum energy.

### Midjourney Techniques for Readable Weapons and background-color Margins

1. **Put anatomy and framing first.** Name the weapon's parts before describing ornamentation or ink. Aim for the complete weapon and effects to occupy the central 70% of the canvas, with roughly 15% background-color padding on each side. These are compositional targets, not guaranteed measurements.
2. **Keep `--s 100`, matching the character and collectible prompts.** Greater power comes from authored ornamentation and silhouette, not a different renderer or higher stylization.
3. **Separate structure from the shared style.** In Discord, place a clear image of the desired weapon silhouette at the beginning of the prompt to guide content and composition. Use the written compact renderer without `--sref` or `--sw`. Do not use a melee image as the structure reference for a ranged weapon. On the web, assign the structural upload to Image Prompt, not Style Reference.
4. **Adjust image influence only when an image prompt is present.** Start with `--iw 1`; increase cautiously if the structure drifts, since the image prompt can also carry over colors and details. Image-weight ranges vary by model version. `--iw` controls structural image influence, not a style reference; do not add `--sref` or `--sw` to weapon prompts.
5. **Recover cropped results with the Editor or Zoom Out.** Expand the canvas around a good result and request a plain solid-color background. Inspect the result for newly invented parts. There is no `--margin` or `--zoom` prompt parameter, and `--ar 3:2` alone does not ensure padding.

References: [Image Prompts](https://docs.midjourney.com/hc/en-us/articles/32040250122381-Image-Prompts), [Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference), and [Editor](https://docs.midjourney.com/hc/en-us/articles/32764383466893).

### Reusable Theme Template

```
chibi-inspired gacha JRPG equipment illustration, one [WEAPON TYPE] with clearly recognizable [FUNCTIONAL PARTS], floating unsupported in background-color empty space, centered three-quarter view, complete weapon and effects within the central 70 percent of the canvas, broad background-color padding on all four sides, ornate [THEME] motifs attached to one connected body, believable material depth and recessed engravings, crisp cel shading with black-and-white material panels and selective [THEME COLORS], crisp readable silhouette, clean painted material planes and smooth non-emissive highlights on the weapon itself, solid-color [ELEMENT] ribbons spiraling around it with background-color gaps, suspended solid-color spark marks and separate opaque ribbon shapes, crisp painted edge accents and hard-edged color facets, effects subordinate to the weapon silhouette, regal anime fantasy design, jewel-like painted color treatment within the stated palette, clean precise anime contours, plain solid [BACKGROUND COLOR] background ([BACKGROUND HEX]), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --no photorealism, table, pedestal, floor, scenery, photography, 3d render, people, hands, text, logo, cropping, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --ar 3:2 --niji 6 --s 100 --q 1
```

### 1) Wooden Sword

```
chibi-inspired gacha JRPG equipment illustration, one legendary wooden sword with a distinct wooden grip guard and blunt wooden blade, floating unsupported in background-color empty space, gentle diagonal display pose, complete pommel-to-tip silhouette within the central 70 percent of the canvas, broad background-color padding on all four sides, carved leaf motifs and stylized wood grain, warm brown and cream wood tones with crisp black-and-white cel shading, clean precise anime contours and smooth painted highlights within a crisp readable silhouette, fine-line carvings and soft painted edge highlights, sparse opaque gray decorative flecks separated from the sword, regal anime fantasy design matching the original compact chibi character rendering, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --no dense ink clouds, overlapping effects, detached fragments, table, pedestal, floor, scenery, photography, photorealism, 3d render, people, hands, text, logo, cropping, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --ar 3:2 --niji 6 --s 100 --q 1
```

### 2) Rose-Gold God-Slaying Ranged Weapon

```
chibi-inspired gacha JRPG equipment illustration, one original rose-gold god-slaying ranged weapon, elegant cohesive fantasy silhouette with a clearly identifiable barrel and open muzzle, coherent projectile-launching body and readable holding area, ornate anime proportions rather than a standard handgun layout, believable material depth, floating unsupported in background-color empty space, centered three-quarter view showing every functional part, complete weapon and effects within the central 70 percent of the canvas, broad background-color padding on all four sides, one connected readable silhouette, deeply engraved rose-petal filigree and fractured celestial sigils, black and silver-white metal with beveled edges and recessed details, rose-gold ornamental panels and pink enamel with rose-gold and pink outlines, richly dimensional crisp cel shading, clean painted material planes and smooth non-emissive highlights on the weapon itself, painted silver-white facets and solid pink edge accents, solid-color pink energy ribbons spiraling behind and around the weapon with clear background-color gaps, fine rose-gold sparks, drifting opaque spectral petal shapes and separate solid-color ribbons, solid pink painted accents across the metal, effects leave the barrel muzzle holding area and outer contour readable, regal ornamentation with controlled illustrated depth matching the original chibi character rendering, one weapon only, jewel-like painted color treatment within the stated palette, clean precise anime contours, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --no photorealism, dense ink clouds, detached weapon fragments, sword, cutting blade, pistol, revolver, sniper rifle, scope, military styling, table, pedestal, floor, scenery, photography, 3d render, people, hands, text, logo, cropping, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --ar 3:2 --niji 6 --s 100 --q 1
```

### 3) Gold God-Slaying Ranged Companion

Use the approved gold melee image only to guide shared ornamentation, not to replace the written compact renderer or ranged silhouette. Use no `--sref` or `--sw`. This paired design retains its regal gold identity but must read as a projectile-launching artifact rather than another melee weapon.

```
chibi-inspired gacha JRPG equipment illustration, one original royal gold god-slaying ranged weapon, elegant cohesive fantasy silhouette with a clearly identifiable barrel and open muzzle, coherent projectile-launching body and readable holding area, ornate anime proportions rather than a standard handgun layout, believable material depth, floating unsupported in background-color empty space, centered three-quarter view showing every functional part, complete weapon and effects within the central 70 percent of the canvas, broad background-color padding on all four sides, one connected readable silhouette, deeply engraved royal filigree crown motifs and fractured divine seals, black and silver-white metal with beveled edges and recessed details, rich gold ornamental panels and restrained pink jewels, richly dimensional crisp cel shading, clean painted material planes and smooth non-emissive highlights on the weapon itself, painted silver-white facets and solid gold edge accents, solid-color gold energy ribbons spiraling behind and around the weapon with clear background-color gaps, fine golden sparks, drifting opaque celestial mote shapes and separate solid-color ribbons, solid warm-colored painted accents across the metal, effects leave the barrel muzzle holding area and outer contour readable, regal ornamentation with controlled illustrated depth matching the original chibi character rendering, one weapon only, jewel-like painted color treatment within the stated palette, clean precise anime contours, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --no photorealism, dense ink clouds, detached weapon fragments, sword, axe, scythe, spear, bayonet, cutting blade, pistol, revolver, sniper rifle, scope, military styling, table, pedestal, floor, scenery, photography, 3d render, people, hands, text, logo, cropping, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --ar 3:2 --niji 6 --s 100 --q 1
```
