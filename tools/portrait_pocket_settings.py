"""Explicitly reviewed source-coordinate holes, never global cleanup changes."""

import json

from prepare_art import ROOT
from art_library import art_path


CORRECTIONS = art_path("portrait-pocket-corrections.json", root=ROOT)


def load_corrections():
    return json.loads(CORRECTIONS.read_text(encoding="utf-8"))


def apply_corrections(settings):
    for asset, row in load_corrections().items():
        if asset in settings:
            settings[asset]["background_seeds"] = (
                settings[asset].get("background_seeds", []) + row["background_seeds"])
            if "edge_cleanup" in row:
                settings[asset]["edge_cleanup"] = row["edge_cleanup"]
            if "background_regions" in row:
                settings[asset]["background_regions"] = row["background_regions"]
    return settings
