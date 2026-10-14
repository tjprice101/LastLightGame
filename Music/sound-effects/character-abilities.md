# Shared action and elemental power sound effects (D-279)

Five universal ElevenLabs Sound Effects prompts replace the character-specific
ability pack. Generate each block separately, with looping off. Copy only the
text block; set the suggested duration separately. Durations include the tail.
Follow the [shared contract](README.md).

The three power cues share one recognizable sound: crystal shattering,
rushing energy and briefly ringing glass. Skill1 is a small sharp release,
Skill2 is broader and fuller, and Ultimate/Last Flare is the most powerful.
The mythical character comes from layered, bell-like crystal resonance, not
vague visual instructions, a tune, voices or long cinematic buildup.
"Light" is represented by a bright rushing hiss and high glass resonance.

These are neutral power-release cues for any element, not literal weapons,
enemy impacts, healing or shield-breaking announcements. They do not add
gameplay effects. [Passive and charge accents](passive-accents.md) remain
unchanged and separate.

## default-attack - Normal Attack

**Suggested duration:**0.7 seconds. **Looping:**off.

```text
One isolated fantasy game attack sound: a fast clean steel-edged air sweep,
a compact weighty impact, then a very short metallic resonance. Firm and
satisfying, neutral rather than elemental, crisp onset, no repeated strikes.
Weapon-agnostic enough for a sword, spear, bow or magical normal attack.
No music, voices, breath, screams, gore sounds, ambience or long reverb.
```

## default-defense - Defense

**Suggested duration:**0.9 seconds. **Looping:**off.

```text
One isolated fantasy game defensive stance sound: a short inward air draw,
two close solid metal layers locking into a single firm protective brace,
then a low rounded ward resonance settling quickly. Steady and reassuring,
clearly a guard being raised, not a collision, damage hit or shield breaking.
No music, voices, breath, healing sparkle, ambience or long reverb.
```

## default-skill1 - Elemental Crystal Snap

**Suggested duration:**0.9 seconds. **Looping:**off.

```text
One short fantasy magic sound. Start immediately with a sharp crystal crack
and a few small glass shards tinkling. A fast bright rushing hiss bursts
outward with a compact low pulse. Finish with a brief high bell-like glass
ring that fades cleanly. Crisp, mystical and ancient, like an enchanted
crystal releasing stored power. One quick burst, no buildup, melody, music,
voices, choir, background ambience or long reverb.
```

## default-skill2 - Elemental Crystal Surge

**Suggested duration:**1.2 seconds. **Looping:**off.

```text
One short fantasy magic sound, broader and heavier than a small crystal snap.
Start immediately with several layered crystal cracks joining into one
shattering burst. A wide bright rushing hiss and a firm low pressure pulse
release together. Finish with overlapping high and low glass rings and a
few tiny shard ticks, fading quickly. Mystical, ancient enchanted power,
full and resonant but not harsh. No buildup, repeated blasts, melody, music,
voices, choir, background ambience or long reverb.
```

## default-ultimate - Mythic Crystal Release / Last Flare

**Suggested duration:**1.5 seconds. **Looping:**off.

```text
One quick, powerful fantasy magic sound. Start immediately with a deep
crystal fracture and a dense sharp shattering crack together. A forceful
bright rushing hiss bursts outward over one heavy, tight bass pulse.
Layer large bell-like glass resonance with fine sparkling shard ticks,
then cut to a short clean decay. Ancient, awe-inspiring power from a
legendary crystal, stronger and denser than an ordinary spell, not louder
or longer. No buildup, rolling rumble, melody, music, voices, choir,
background ambience, distortion or long reverb.
```

## Review the generated takes

- All three elemental cues should sound like the same crystal-power family.
- Skill1: a small sharp snap. Skill2: a fuller release. Ultimate: the strongest
  fracture and pressure pulse, still quick and snappy.
- Bell-like ringing is sound-effect texture, not a musical phrase.
- Check actual duration, clean ending and comfortable treble/bass on speakers.
  Revise or regenerate if these fail; prompts do not guarantee the result.
- No audio is generated or installed here. Runtime placement remains deferred.
