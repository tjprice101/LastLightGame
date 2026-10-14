# Last Light music library

## Status and purpose (D-274/D-280)

This library contains23 original **SUNO-ready prompt briefs** and seven
owner-delivered MP3s now installed as background music (D-280). The remaining
activity tracks are still briefs only. Do not upload private game files or
reference recordings.

## Installed soundtrack (D-280)

| Delivered song | Runtime assignment |
| --- | --- |
| Celestial Pilgrimage | Title, Player info, starter selection and all nonbattle menus |
| Volcanic Wrath | Emberwake March / Flaming Depths |
| Oceanic Sorrow | Glasswater Reach / Oceanic Valley |
| Storm-Sky Resolve | Stormspan Heights / Sky-bound Rift |
| Forest Majesty | Rootstone Wilds / Garden of Beauty |
| Defending the Serene | Stillhalo Vale / City of Heaven |
| Fractured Frontier | Riftbound Frontier / Ruins of Chaos |

Assignments follow the delivery filenames; each regional song serves both its
Story region and its material dungeon. Training, Heaven/Abyss, Treasury/
Sanctuary, Roses, Machines and all War trials stay silent until their own
tracks arrive. Do not substitute one of these regional tracks into them.

[Music controller](../src/presentation/music.ts) uses two bounded looping
playback decks with deployment-base-aware URLs. It waits for a pointer/key
interaction and crossfades songs over1.6 seconds (D-281): the old song fades
down as the new song fades up, only after incoming playback succeeds.
Entering an undelivered mode fades to silence over the same duration.
Both decks pause while the tab is hidden,
and preserves playback position on volume/mute changes and same-track renders
(including Settings, Continue and Retry). Story region boundaries change the
track in offline and online runs. Leaving battle restores the menu theme.
Full-song looping is enabled; seamless loop editing has not been performed.
Volume changes scale both sides of a crossfade without restarting it.
Mute/zero volume, hidden tabs and disposal cancel the fade and release the
outgoing deck; resuming keeps the chosen song's position. Rapid navigation
replaces the previous fade without leaving extra players/timers behind.
Real incoming failures report an error and retain the outgoing song for retry.

Settings contains Music volume (default35%) and Mute music. Choices save
separately under `last-light.music` on this device, never in the wallet or
online account. Corrupt/denied settings and real media/playback failures are
reported; browser autoplay restrictions wait for another interaction.
Battle speed affects animation only, not song tempo. Sound effects are not wired.

Original delivery filenames and bytes are preserved in
`Music/source/<cue-id>/`; redundant root deliveries have been removed after
hash verification. The manifest's `delivery` field is the historical filename,
not a required root file. Byte-identical
playback copies are under `public/assets/music/`. The
[manifest](source/manifest.json) records paths, SHA256 hashes and sizes.
Reproduce with `python tools\intake_music.py`; it reads archived originals when
the root delivery is absent, refuses conflicting copies or source-hash changes,
and verifies every installed hash. No transcoding, trimming or destructive
source edits. Generated-song licensing remains the owner's responsibility.

Validation: `npx vitest run src\presentation\music.test.ts
src\presentation\settings-panel.test.ts src\presentation\battle-speed.test.ts
--maxWorkers=2`, plus `npm run build`. Browser-check real MP3 decoding,
interaction-gated playback, region transitions and the Settings controls.

**Sound effects (D-276/D-279):** a separate
[ElevenLabs prompt library](sound-effects/README.md) contains five shared action
cues (Attack, Defense, Skill1, Skill2 and Ultimate) and16 unchanged optional
passive/charge accents. The three power cues use concrete crystal/energy sounds.
These are isolated nonmusical effects; the soundtrack's170 BPM/choir direction
does not apply to them. No sound-effect audio or playback is installed.

| Cue | Intended use | Prompt |
| --- | --- | --- |
| Main Theme | The search for the soul of the universe | [Main Theme](prompts/main-theme.md) |
| Emberwake Battle Theme | Emberwake March / Infernic / Wrath | [Emberwake](prompts/emberwake-battle.md) |
| Glasswater Battle Theme | Glasswater Reach / Oceanic / Sadness | [Glasswater](prompts/glasswater-battle.md) |
| Stormspan Battle Theme | Stormspan Heights / Atmospheric / Calm | [Stormspan](prompts/stormspan-battle.md) |
| Rootstone Battle Theme | Rootstone Wilds / Botanic / Joy and Life | [Rootstone](prompts/rootstone-battle.md) |
| Stillhalo Battle Theme | Stillhalo Vale / Tranquilitic / Peace | [Stillhalo](prompts/stillhalo-battle.md) |
| Riftbound Battle Theme | Riftbound Frontier / Chaotic / Death and Destruction | [Riftbound](prompts/riftbound-battle.md) |

## Activity themes (D-277)

The [activity prompt pack](prompts/activity-modes.md) adds16 distinct cues:

| Activity | Prompt |
| --- | --- |
| Training / Grassy Field | [Training](prompts/activity-modes.md#training---grassy-field) |
| Flaming Depths | [Infernic dungeon](prompts/activity-modes.md#flaming-depths) |
| Oceanic Valley | [Oceanic dungeon](prompts/activity-modes.md#oceanic-valley) |
| Sky-bound Rift | [Atmospheric dungeon](prompts/activity-modes.md#sky-bound-rift) |
| Garden of Beauty | [Botanic dungeon](prompts/activity-modes.md#garden-of-beauty) |
| City of Heaven | [Tranquilitic dungeon](prompts/activity-modes.md#city-of-heaven) |
| Ruins of Chaos | [Chaotic dungeon](prompts/activity-modes.md#ruins-of-chaos) |
| Soar to Heaven | [Heaven](prompts/activity-modes.md#soar-to-heaven) |
| Delve into the Abyss | [Abyss](prompts/activity-modes.md#delve-into-the-abyss) |
| Crownfall Treasury | [Treasury](prompts/activity-modes.md#crownfall-treasury) |
| Rosethorn Sanctuary | [Sanctuary](prompts/activity-modes.md#rosethorn-sanctuary) |
| Passion of Crimson Roses | [Roses](prompts/activity-modes.md#passion-of-crimson-roses) |
| Awaken the Machines | [Machines](prompts/activity-modes.md#awaken-the-machines) |
| The Sea Without a Shore / Nerithe | [Oceanic War](prompts/activity-modes.md#elemental-war---the-sea-without-a-shore) |
| The Throne Beneath the World / Orvella | [Botanic War](prompts/activity-modes.md#elemental-war---the-throne-beneath-the-world) |
| The Sky's Final Chord / Vaelor | [Atmospheric War](prompts/activity-modes.md#elemental-war---the-skys-final-chord) |

All current battle activity modes and all six Story regions are covered.
These are regional/mode themes, not hundreds of separate numbered-stage songs.
Planned Black Diamonds, future chapters and nonbattle menu/reward jingles are
not part of this current-mode expansion. Only the seven delivered tracks above
are installed; all other activity briefs remain ungenerated/unwired.

## Shared musical identity

- Epic orchestral rock/metal at **170 BPM**: awe-inspiring, intimidating and
  soaring, with genuinely gentle passages and strong dynamic contrast.
- **Instrumental. No lyrics, spoken words, lead vocals or vocal soloists.**
  A wide, expressive electric lead guitar is the "singer": a resonant,
  masculine/frontman-like register and phrasing, not a male vocalist.
- Optional distant or stacked **wordless choir** is atmospheric orchestration,
  never intelligible words or a substitute lead singer.
- Solo piano and airy pads open the space; spacious toms, tight rhythm guitars
  and crushing drums build its scale. Refrains bring double-time kick patterns,
  wide guitar melodies and orchestra rather than merely louder distortion.
- Near-silent celestial bridge; climactic two-guitar harmony, orchestral swells
  and cinematic hits. Dense peaks must preserve a clear melodic foreground.
- Original melodies and production language only; no named-artist imitation.

The regional arrangements below are creative proposals within this approved
sound, not new canon, authored audio or guarantees of a generation's results.
The music communicates the soul search through instrumental motifs; it must
not announce future plot revelations.

## SUNO workflow

1. Start an instrumental generation (enable instrumental mode where available).
2. Copy the cue's **Style prompt** into the style/description field. Do not add
   lyrics. Its arrangement brief is a direction for generation, extension and
   review, not text to be sung.
3. Review the actual output for unwanted solo singing, intelligible choir words,
   tempo drift, melodic clarity, dynamic contrast and excessive harshness.
   Regenerate or revise instead of claiming the prompt guarantees compliance.
4. Keep the selected original export and the exact prompt/settings used.
   Review licensing/export rights for the account and intended game use.
5. Only prepare a loop/runtime asset after an owner delivery/approval. The
   seven delivered songs above are installed; these instructions alone do not
   authorize downloading songs or installing the remaining briefs.

## Filing future audio

Keep all music under this library:

- `prompts/`: the seven individual main/Story briefs and16-cue activity pack.
- `sound-effects/`: the ElevenLabs one-shot prompts and review contract.
- `source/<cue-id>/`: future original SUNO exports, alternate takes and a record
  of the generation date, settings, prompt and reviewed rights.
- `exports/<cue-id>/`: future approved listening/loop masters, derived from a
  preserved source. Record trimming, fades and loop points; never overwrite
  originals.

Source/export directories are created when audio exists; no empty audio
placeholders or nonexistent runtime URLs. The shared delivered region songs
use their element IDs; Main Theme uses `main-theme`. Future mode deliveries
should use each brief's explicit cue ID (the activity pack has16 separate IDs).
The installed controller currently loops MP3s with crossfades; further
editing/formats and sound-effect playback remain future work.

See [founding canon](../docs/world-lore.md),
[future campaign spoilers](../docs/story-roadmap.md) and
[current Story mechanics](../docs/story-and-training.md).
