"""Record and verify the full manual review of installed Conduit artwork."""

import argparse
from hashlib import sha256
import json
from pathlib import Path

from art_library import art_path
import intake_delivered_art
import intake_kit_conduit_art
import intake_machine_art
import intake_master_conduit_art
import intake_root_art

ROOT = intake_delivered_art.ROOT
OUTPUT = art_path("conduit-cleanup-review.json", root=ROOT)
MASTER_PREVIOUS_RUNTIME = (
    Path("Art") / "source" / "master-conduits" / "previous-runtime" /
    "conduit-background-audit"
)
CHANGED_NOTES = {
    "fieldbrace-coupler": (
        "Follow-up review cleared mint backdrop trapped between the legs and body, "
        "plus the empty right-edge strip; preserved cyan crystals and the painted blue ground shadow."
    ),
    "reserve-torque-crank": (
        "Follow-up review cleared green backdrop inside both frame openings and "
        "below the lower crossbar; preserved bronze hardware, cyan core and brown ground shadow."
    ),
    "horizon-heartcase": (
        "Follow-up review cleared teal backdrop trapped between the lower limbs; "
        "preserved ivory armor, opal core, purple limb and painted ground shadow."
    ),
    "luminous-dawn-witness-array": (
        "Follow-up review matched the row-varying backdrop and cleared reviewed "
        "tripod openings with a bounded local tolerance; preserved green lenses, pale metal and ground shadow."
    ),
    "chaotic-paradox-spindle": (
        "Cleared the enclosed source-key pockets inside the dark mechanism and "
        "the two reviewed outer background traces; preserved the violet core and "
        "the separate authored cyan accents."
    ),
    "execution-orrery": (
        "Cleared disconnected backdrop islands visible inside the orrery rings "
        "and open lower framework; preserved the ivory/bronze device and its "
        "separate ground shadow."
    ),
    "meridian-inverter": (
        "Removed the reviewed two-pixel source-border remnant and matched the "
        "row-varying backdrop; preserved the silver/blue mechanism and facets."
    ),
    "nullsong-transmission": (
        "Cleared disconnected backdrop islands within the open arch and lower "
        "framework; preserved the gold mechanism, pale metal and authored shadow."
    ),
    "prism-splinter-socket": (
        "Cleared the enclosed green-key triangle and two disconnected openings; "
        "preserved the steel triangle, blue crystal assembly and bronze fittings."
    ),
    "master-tide-2": (
        "Cleared five enclosed green backdrop fields between the orb frame and lower struts; "
        "preserved the blue planetary core, pale metal and authored base."
    ),
    "master-tide-3": (
        "Cleared eleven enclosed teal backdrop fields among the planetary rings and spokes; "
        "preserved the red roses, bronze rails, dark center and turquoise details."
    ),
    "master-atmoso-2": (
        "Cleared two pale-teal backdrop patches behind the lower clock frame; "
        "preserved the central lens and pale mechanical structure."
    ),
    "master-aurora-1": (
        "Cleared three enclosed pale-green fields behind the crown and lower side arches; "
        "preserved the orange lens, ivory architecture and attached lower shadow."
    ),
    "master-aurora-2": (
        "Cleared four enclosed yellow-green backdrop islands behind lower wing joints; "
        "preserved the distinct olive cast shadow beneath the wings, ivory metal and orange core."
    ),
    "master-aurora-3": (
        "Cleared three pale-green backdrop openings between lower radial arms; "
        "preserved the gold rays, orange lens and pale mechanical details."
    ),
    "master-bliss-1": (
        "Cleared five gray-green backdrop fields inside the suspended frame and between its ribs; "
        "preserved the pale architecture, feathers, cables and lower shadow."
    ),
    "master-bliss-3": (
        "Cleared three turquoise backdrop gaps inside the feather-and-loom structure; "
        "preserved the ivory feathers and teal mechanical accents."
    ),
    "master-bruno-2": (
        "Cleared two pale-green fields between the rock plates and upper central slabs; "
        "preserved the orange seams, dark stone and broad ground shadow."
    ),
    "master-disciple-1": (
        "Cleared thirteen enclosed sage backdrop islands within the suspended ring and open appendages; "
        "preserved the structures, dark center and dangling gold strands."
    ),
    "master-razor-1": (
        "Cleared two additional enclosed green backdrop fields within the crescent-wing envelope; "
        "preserved the purple wing surfaces, central bastion and attached ground shadow."
    ),
    "master-razor-3": (
        "Cleared two muted-green backdrop fields inside the lower clockwork and right inner crescent; "
        "preserved the dark-violet mechanism and pointed facets."
    ),
    "master-rosetta-1": (
        "Cleared four enclosed olive backdrop fields within the rose-wheel frame using its row-gradient key; "
        "preserved the roses, gold machinery and attached lower base/shadow."
    ),
    "master-rosetta-2": (
        "Cleared two enclosed dark-green backdrop openings inside the flower-and-gear assembly; "
        "preserved the red roses, cream wings and hanging details."
    ),
    "master-rosetta-3": (
        "Cleared five turquoise-green backdrop gaps through the rose medallion and lower frame; "
        "preserved the roses, pale metal, gold fittings and central structure."
    ),
    "master-thornia-1": (
        "Cleared five additional green backdrop fields visible through the rose-wheel lattice; "
        "preserved red roses, bronze rails and the authored dark center."
    ),
    "master-thornia-2": (
        "Cleared five pale-green backdrop openings within the rose wheels and inner assembly; "
        "preserved the roses, white/gold metal, red blades and lower shadow."
    ),
    "master-thornia-3": (
        "Cleared three olive backdrop fields behind the upper wheel and central armor; "
        "preserved the broad mauve ground cloud and olive shadow beneath the chassis."
    ),
    "master-crinso-1": (
        "Cleared two enclosed sage backdrop gaps inside the rose-wheel structure; "
        "preserved the double blade, gold hub and detached sparks."
    ),
    "master-crinso-3": (
        "Cleared the enclosed muted-green backdrop pocket inside the upper wheel; "
        "preserved the red-gold device and authored center."
    ),
    "master-orvella-1": (
        "Cleared three broad muted-green backdrop islands behind the throne and side columns; "
        "preserved the violet crystals, stone architecture and sand-colored ground plane."
    ),
    "master-vaelor-3": (
        "Cleared three enclosed teal backdrop fields behind the upper instrument and pendulum; "
        "preserved the lower attached teal cast shadow."
    ),
}

NO_CHANGE_NOTES = {
    "aegis-capacitor": "The cyan key-adjacent pixels belong to the centered opal and mechanical highlights; no distinct background island remained.",
    "aquatic-leviathan-pump": "The blue/cyan pixels are attached to the pump, crystals and reflections; the open silhouette and gaps are clear.",
    "aquatic-undertide-chronometer": "The remaining blue-green pixels align with the authored inner gears and crystal accents; no separate enclosed matte patch was verified.",
    "astral-prism": "The pale rays and dark-blue center are intact, with no separate background fill in the rays or openings.",
    "atmospheric-griffin-turbine": "The cyan details follow the turbine and feather blades; the negative spaces remain transparent.",
    "atmospheric-skythread-rudder": "The teal accents belong to the rudder and core; the open shaft and outer silhouette have no residual field.",
    "bastion-lock": "The warm key-colored pixels are on bronze hardware; the interlocking plate openings remain clear.",
    "breach-pendulum": "The near-key pixels coincide with pale metal, chain facets and cyan insets; no isolated background fill was distinguishable.",
    "citadel-spine": "The pale structure and violet channels retain crisp transparent openings with no remaining backdrop patch.",
    "coilfeed-ratchet": "The blue gears, ivory shell and cyan facets are authored subject pixels; the surrounding openings are clear.",
    "crosspin-governor": "The key-adjacent green/cyan marks are attached to the inset crystals and metal; no separate matte island remained.",
    "chaotic-ouroboros-core": "The red-gold ring and violet crystal are intact; no separate background fill remained in its open silhouette.",
    "duplex-heart": "The turquoise pixels belong to the paired cores and frame reflections; the device openings are transparent.",
    "efflorescent-verdant-covenant": "The green leaves, gems and energy details are subject art and were preserved; no separate background gap was verified.",
    "efflorescent-worldtree-heart": "The green crown/core is authored subject detail; protected foreground and transparent outer gaps remain intact.",
    "falcon-sight": "The silver/blue aperture and detached-looking points are authored silhouette details; no residual background area remained.",
    "fracture-reservoir": "The existing two reviewed gap seeds clear the source-key openings; cyan crystal and violet chamber pixels are retained.",
    "glassroot-gimbal": "The glass-green pixels are within the lens and gimbal; the open frame remains transparent.",
    "granite-hourglass": "The broad teal area below the mechanism is the source-authored cast shadow, not a key-field remnant; metal and crystal gaps are clear.",
    "hammerbalance-link": "The blue-green facets are part of the head and haft insets; the surrounding negative spaces are transparent.",
    "immortal-vessel": "The pale wings and turquoise vessel core are intact, with no filled background in the open silhouette.",
    "infernic-cinder-testament": "The warm engine and detached sparks are retained; the low oval beneath it is the authored shadow.",
    "infernic-phoenix-reactor": "The orange fire and red mechanism are authored opaque subject shapes; openings are transparent.",
    "judgment-lens": "The central lens is protected subject art; no separate key-colored area remains in its frame.",
    "lifeline-flywheel": "The green-blue accents belong to the flywheel and core; the open ring and lower cavity are clear.",
    "luminous-seraph-mirror": "The ivory rays, gold frame and central mirror are preserved; the negative spaces are clear.",
    "ominous-eclipse-mantle": "The violet-black silhouette and small detached facets are authored subject details; the openings remain transparent.",
    "ominous-nightglass-archive": "The violet glass and dark frame are intentional subject colors; no separate backdrop remained.",
    "opal-indexer": "The teal oval below the device is an authored cast shadow; the green glass and open frame remain intact.",
    "pale-bulwark-diadem": "The pale rays and blue gem remain opaque subject details; no enclosed background patch was visible.",
    "parallax-relay": "The cool metal and central blue facets remain intact; no residual keyed background is visible.",
    "precision-escapement": "The gold and cyan components are subject detail; the wheel openings remain transparent.",
    "resonance-crucible": "The cyan crystals and violet fittings are attached to the mechanism; the negative spaces are clear.",
    "sentinel-aperture": "The existing reviewed aperture seed clears its enclosed source-key opening; the cyan center and pale rim are preserved.",
    "siege-cantilever": "The pale blade, violet fittings and small detached facets are subject art; no background fill remained.",
    "siegebound-drive": "The cyan engine core and blue accents are authored; the open wheel and silhouette margins are clear.",
    "spearwheel-engine": "The cyan components and lower cast shadow are intentional; no separate background island remained.",
    "springwell-pump": "The turquoise lower region is the authored shadow and the central pump is protected subject art; no isolated background patch was verified.",
    "starvein-conductor": "The gold/ivory branching frame and green details are subject pixels; its negative spaces remain transparent.",
    "stasis-reliquary": "The turquoise vessel, bronze shell and cast shadow are distinct authored shapes; no residual field was visible.",
    "tectonic-atlas-bastion": "The orange facets are subject crystals and the dark frame is preserved; no separate background fill remained.",
    "tectonic-faultkeeper-loom": "The pale green spikes and dark machinery are authored subject details; the open structure remains transparent.",
    "tranquilitic-kirin-cradle": "The pale-metal frame and opal remain intact; no distinct background island was visible in the open cradle.",
    "tranquilitic-stillhour-carillon": "The turquoise clock faces and small reflections are subject detail; reviewed gaps remain transparent.",
    "twinpulse-bellows": "The cyan glass and silver pipework are preserved; no enclosed backdrop patch remained.",
    "verdict-caliper": "The pale green-adjacent pixels are part of the ivory armor and highlights; no distinct background fill was visible.",
    "vigil-core": "The green central core and silver shell are preserved subject pixels; the surrounding holes remain clear.",
    "voltaic-stormstep-dynamo": "The blue and yellow facets belong to the dynamo; the detached sparks are authored and not backdrop.",
    "voltaic-thunderbird-coil": "The cyan bird wings and mechanical coil are preserved; no separate matte area remained.",
    "wardglass-transformer": "The blue glass and silver shell are subject detail; the gaps through the transformer are transparent.",
    "worldbreaker-drive": "The red ribbons, pale armor and center crystal are intact; the open silhouette has no background island.",
}


def _digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def _paths(record: dict) -> tuple[Path, Path]:
    return (ROOT / record["source"].replace("\\", "/"),
            ROOT / record["runtime"].replace("\\", "/"))


def _asset_sources():
    files = {
        "machines-art-intake.json": [],
        "delivered-root-art-intake.json": [],
        "root-art-intake.json": [],
        "kit-conduit-art-intake.json": [],
        "master-conduit-art-intake.json": [],
    }
    for manifest_name in files:
        path = art_path(manifest_name, root=ROOT)
        files[manifest_name] = json.loads(path.read_text(encoding="utf-8"))["assets"]

    records = {}
    for record in files["machines-art-intake.json"]:
        if record.get("category") == "conduits":
            records[record["asset"]] = (record, "Art/provenance/machines-art-intake.json")
    for record in files["delivered-root-art-intake.json"]:
        if record.get("category") == "conduits":
            records[record["asset"]] = (record, "Art/provenance/delivered-root-art-intake.json")
    for record in files["root-art-intake.json"]:
        source = record.get("source", "")
        if source.startswith("Art\\source\\conduits\\"):
            asset = Path(record["runtime"].replace("\\", "/")).stem
            records[asset] = (dict(record, asset=asset, category="conduits"),
                              "Art/provenance/root-art-intake.json")
    for record in files["kit-conduit-art-intake.json"]:
        records[record["asset"]] = (record, "Art/provenance/kit-conduit-art-intake.json")
    for record in files["master-conduit-art-intake.json"]:
        records[record["asset"]] = (record, "Art/provenance/master-conduit-art-intake.json")
    if len(records) != 135:
        raise ValueError(f"Expected 135 Conduit-related source records, found {len(records)}.")
    return records


def _regenerate(record: dict, authority: str) -> tuple[bytes, dict]:
    source, _ = _paths(record)
    asset_id = record["asset"]
    if authority == "Art/provenance/root-art-intake.json":
        asset = next(
            item for item in intake_root_art.ASSETS
            if item.runtime == f"conduits/{asset_id}.png"
        )
        data, export_record = intake_root_art._prepare(asset, source)
        return data, export_record["processing"]
    if authority.endswith("machines-art-intake.json"):
        mapping = next(item for item in intake_machine_art.ASSETS
                       if item[1] == "conduits" and item[2] == asset_id)
        _, category, name, key = mapping
        return intake_machine_art.prepare(source, category, name, key)
    if authority.endswith("kit-conduit-art-intake.json"):
        settings = intake_kit_conduit_art.load_settings()[asset_id]
        return intake_kit_conduit_art.prepare(source, settings)
    if authority.endswith("master-conduit-art-intake.json"):
        settings = intake_master_conduit_art.load_settings()[asset_id]
        return intake_master_conduit_art.prepare(source, settings)
    asset = next(item for item in intake_delivered_art.assets()
                 if item.category == "conduits" and item.asset == asset_id)
    data, metadata = intake_delivered_art.prepare(source, asset)
    return data, metadata["processing"]


def review_document() -> dict:
    rows = []
    prior_rows = {}
    if OUTPUT.is_file():
        prior_rows = {
            row["asset"]: row
            for row in json.loads(OUTPUT.read_text(encoding="utf-8")).get("assets", [])
        }
    for asset_id, (record, authority) in sorted(_asset_sources().items()):
        source, runtime = _paths(record)
        source_hash = _digest(source)
        if source_hash != record["source_sha256"]:
            raise FileExistsError(f"Authoritative source hash changed: {source}")
        regenerated, processing = _regenerate(record, authority)
        after_hash = sha256(regenerated).hexdigest()
        installed_hash = _digest(runtime)
        if after_hash != installed_hash or after_hash != record["runtime_sha256"]:
            raise FileExistsError(f"Installed export does not reproduce from reviewed settings: {runtime}")
        if asset_id in CHANGED_NOTES:
            if asset_id.startswith("master-"):
                previous_path = ROOT / MASTER_PREVIOUS_RUNTIME / f"{asset_id}.png"
            else:
                previous = prior_rows.get(asset_id)
                if not previous or not previous.get("previous_runtime"):
                    raise FileNotFoundError(f"Missing prior runtime provenance for {asset_id}.")
                previous_path = ROOT / previous["previous_runtime"].replace("\\", "/")
            if not previous_path.is_file():
                raise FileExistsError(f"Preserved prior export is missing or changed: {previous_path}")
            before_hash = _digest(previous_path)
            if (asset_id in prior_rows and prior_rows[asset_id].get("previous_runtime_sha256")
                    and prior_rows[asset_id]["previous_runtime_sha256"] != before_hash):
                raise FileExistsError(f"Preserved prior export hash changed: {previous_path}")
            verdict = "corrected"
            reason = CHANGED_NOTES[asset_id]
            previous_relative = str(previous_path.relative_to(ROOT)).replace("/", "\\")
        else:
            before_hash = after_hash
            verdict = "no-change"
            reason = NO_CHANGE_NOTES.get(
                asset_id, record.get("settings", {}).get(
                    "review", "Full-resolution source and dark/light composites reviewed; no definite background remnant was confirmed."
                )
            )
            previous_relative = None
        rows.append({
            "asset": asset_id,
            "source_authority": authority,
            "source": record["source"],
            "source_sha256": source_hash,
            "runtime": record["runtime"],
            "before_sha256": before_hash,
            "after_sha256": after_hash,
            "previous_runtime": previous_relative,
            "previous_runtime_sha256": before_hash if previous_relative else None,
            "verdict": verdict,
            "rationale": reason,
            "settings": processing,
            "manual_review": {
                "source": "full-resolution original",
                "runtime_backgrounds": ["dark", "light"],
                "magnified_candidates": True,
            },
        })
    assets_by_id = _asset_sources()
    if not set(CHANGED_NOTES).issubset(assets_by_id):
        raise ValueError(f"Cleanup notes reference missing assets: {sorted(set(CHANGED_NOTES) - set(assets_by_id))}")
    if not set(NO_CHANGE_NOTES).issubset(assets_by_id):
        raise ValueError(f"No-change notes reference missing assets: {sorted(set(NO_CHANGE_NOTES) - set(assets_by_id))}")
    if len(rows) != 135:
        raise ValueError(f"Expected 135 reviewed images; found {len(rows)}.")
    master_count = sum(row["source_authority"].endswith("master-conduit-art-intake.json") for row in rows)
    return {
        "review_id": "D-177-full-audit",
        "asset_count": 135,
        "ordinary_conduit_count": 85,
        "kit_conduit_count": 25,
        "master_conduit_count": master_count,
        "master_character_icon_count": 48,
        "master_related_asset_count": master_count - 48,
        "changed_count": len(CHANGED_NOTES),
        "undelivered_kit_icon_count": 0,
        "kit_icons_reviewed": True,
        "review_method": "Manual full-resolution source, dark/light source and installed-runtime composites, magnified enclosed-key candidate overlays, and source-specific offline exporter reproduction.",
        "assets": rows,
    }


def write_review() -> None:
    data = json.dumps(review_document(), indent=2, ensure_ascii=False) + "\n"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(data, encoding="utf-8")


def verify_review() -> None:
    expected = json.dumps(review_document(), indent=2, ensure_ascii=False) + "\n"
    if not OUTPUT.is_file() or OUTPUT.read_text(encoding="utf-8") != expected:
        raise ValueError("Conduit cleanup review is missing or stale; run with --write.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true")
    options = parser.parse_args()
    if options.write:
        write_review()
        print("Verified and recorded all 135 Conduit-related art reviews.")
    else:
        verify_review()
        print("All 135 Conduit-related review records reproduce from immutable sources.")
