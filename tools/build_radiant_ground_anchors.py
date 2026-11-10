import argparse
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART_ROOTS = ("characters", "enemies")
ALPHA_THRESHOLD = 16
OUTPUT = ROOT / "src" / "presentation" / "radiant-ground-anchors.json"


def build_manifest() -> dict[str, object]:
    anchors: dict[str, float] = {}
    for folder in ART_ROOTS:
        for path in sorted((ROOT / "public" / "assets" / folder).glob("*.png")):
            with Image.open(path) as source:
                if source.width != source.height:
                    raise ValueError(f"Radiant field art must be square: {path}")
                alpha = source.convert("RGBA").getchannel("A")
                bounds = alpha.point(
                    lambda value: 255 if value > ALPHA_THRESHOLD else 0
                ).getbbox()
            if bounds is None:
                raise ValueError(f"Art has no visible pixels: {path}")
            height = source.height
            anchors[f"{folder}/{path.name}"] = round(
                (height - bounds[3]) / height, 6
            )
    return {"alphaThreshold": ALPHA_THRESHOLD, "anchors": anchors}


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build Radiant sprite contact offsets from reviewed PNG alpha."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail if the checked-in manifest differs from current artwork",
    )
    args = parser.parse_args()
    content = json.dumps(build_manifest(), indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            raise SystemExit("Radiant ground-anchor manifest is out of date.")
        print("Radiant ground-anchor manifest matches all full-form artwork.")
        return
    OUTPUT.write_text(content, encoding="utf-8", newline="\n")
    print(f"Wrote Radiant ground anchors for {len(json.loads(content)['anchors'])} assets.")


if __name__ == "__main__":
    main()
