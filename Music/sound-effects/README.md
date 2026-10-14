# Last Light sound-effect prompts (D-276/D-279)

**Target:** ElevenLabs Sound Effects, as shown in the owner's screenshot.
These are original text prompts, not generated audio or installed effects.
The active action pack contains five shared cues, not per-character ability
descriptions. The separate optional passive/charge pack remains unchanged.

## Packs

- [Shared action and elemental power cues](character-abilities.md): Normal
  Attack, Defense, Skill1, Skill2 and Ultimate/Last Flare in one file.
- [Passive and charge accents](passive-accents.md):16 optional short accents,
  with explicit conditions and silence where an always-on stat has no event.

## How to generate

Copy only a cue's block into **Describe a sound**. Set its suggested duration
where available and leave looping off. Durations are creative targets, not
current game timing. Generate separately so every cue is an isolated reusable
asset, not a montage of abilities. Review actual results; no prompt guarantees
exact timing, silence, stereo placement or absence of unwanted audio.

Use concrete audible textures: crystal cracks, shattering shards, rushing
hiss, a low pressure pulse and brief bell-like glass resonance. These express
mythic elemental power without requiring the generator to interpret character
lore or visible light. Skill1 targets0.9 seconds, Skill2 targets1.2 seconds and
Ultimate/Last Flare targets1.5 seconds, including the tail. All start immediately
and end cleanly, without cinematic buildup or long reverb. Increase weight and
texture across the three, not painful volume. These are neutral power-release
sounds, not enemy-hit or healing/shield outcome cues.

**No music, beat, guitar riff, choir, voice, speech, lyrics, shouts, breath,
character effort sounds, injury sounds or environmental ambience.** The170 BPM
direction applies to the separate soundtrack, not these effects. Keep a
distinct onset, readable main event and short clean tail. Avoid shrill peaks,
clipped distortion, excessively long reverb and unusable sub-bass.

Shared skill prompts describe sound texture, not weapons, damage, hit counts,
statuses or combat timing. Shattering crystal does not mean a shield broke.
Ringing tones are nonmusical texture, not a melody or soundtrack.

## Optional passives, not phantom actions

Passives are not manually cast. Always-on Defense bonuses need **no recurring
sound**. The optional accents are production candidates for an actual future
event presentation only, not authorization to add triggers or constant loops.
Never sound a charge gain on overhealing, ineffective absorption, a failed
critical condition or an ineligible source. Do not announce spent charges,
revival, damage or healing when none happened.

For eventual integration, separate charge/heal accents from the main skill so
they can be omitted when not applicable. Layer at most a restrained accent
over a busy attack; do not play every status sound at full volume.

## Review and preservation

Use stable cue names from the headings when saving chosen takes. Preserve
future originals under `Music/source/sfx/<cue-id>/`, with prompt, settings,
generation date and reviewed usage rights. Reviewed derived exports can go
under `Music/exports/sfx/<cue-id>/`. Create those directories when audio exists.
No files are sent to ElevenLabs by this task; generation is owner-operated.
Review account licensing and the service's sharing/privacy settings before use.

Listen to real results both alone and against the proposed soundtrack. Check
that the three power tiers remain distinguishable at modest volume and on
phone speakers, and optional accents still convey their actual outcomes.
Runtime timing, spatialization, volume,
speed behavior, accessibility and audio settings remain future decisions.
No playback code, dependencies, downloads or nonexistent asset URLs are added.

Sources: [base/Rose kits](../../src/content/combat.ts),
[flagship kits](../../src/content/flagships.ts),
[War kits](../../src/content/war-characters.ts) and
[current charge rules](../../docs/character-kit-rework.md).
