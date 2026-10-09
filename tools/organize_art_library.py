"""One-time filing refactor with preflight checks and preservation verification."""
import ast
import hashlib
import os
from pathlib import Path
import re
from urllib.parse import quote, unquote

from art_library import ROOT, ART, RELOCATIONS

LINK = re.compile(r"(?<!!)\[[^\]\n]+\]\((<?)([^)\n]+?)(>?)\)")


def relocations():
    result = {ART / old: ART / new for old, new in RELOCATIONS.items()}
    result.update({path: ART / "provenance" / path.name for path in ART.glob("*.json")})
    for directory in ("dungeons", "gamemodes"):
        result.update({path: ART / "creatures" / path.relative_to(ART)
                       for path in (ART / directory).glob("*.md")})
    return result


def rewrite_markdown(text, old_path, new_path, moved):
    def replace(match):
        raw = match.group(2)
        path_part, separator, fragment = raw.partition("#")
        if not path_part or re.match(r"[a-zA-Z][\w+.-]*:", path_part):
            return match.group(0)
        target = (old_path.parent / unquote(path_part)).resolve()
        relocated = moved.get(target, target)
        if relocated.is_dir() and target.parent == ART and target.name in ("dungeons", "gamemodes"):
            relocated = ART / "creatures" / target.name
        relative = os.path.relpath(relocated, new_path.parent).replace("\\", "/")
        if target == relocated and old_path == new_path:
            return match.group(0)
        encoded = quote(relative, safe="/.-_") if "%" in path_part else relative
        updated = encoded + separator + fragment
        start = match.start(2) - match.start()
        end = match.end(2) - match.start()
        return match.group(0)[:start] + updated + match.group(0)[end:]

    return LINK.sub(replace, text)


def rewrite_python(text):
    tree = ast.parse(text)
    lines = text.splitlines(keepends=True)
    offsets = [0]
    for line in lines:
        offsets.append(offsets[-1] + len(line))
    edits = []

    def flatten(node):
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Div):
            return flatten(node.left) + [node.right]
        return [node]

    parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
    for node in ast.walk(tree):
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
                and node.func.id == "art_path" and not any(key.arg == "root" for key in node.keywords)):
            end = offsets[node.end_lineno - 1] + node.end_col_offset - 1
            edits.append((end, end, ", root=ROOT"))
            continue
        if not isinstance(node, ast.BinOp) or not isinstance(node.op, ast.Div):
            continue
        parent = parents.get(node)
        if isinstance(parent, ast.BinOp) and isinstance(parent.op, ast.Div) and parent.left is node:
            continue
        parts = flatten(node)
        start = None
        root = None
        if isinstance(parts[0], ast.Name) and parts[0].id == "ART":
            start = 1
            root = "ART.parent"
        elif (len(parts) > 2
              and isinstance(parts[1], ast.Constant) and parts[1].value == "Art"):
            start = 2
            root = ast.get_source_segment(text, parts[0])
        if start is None or len(parts) <= start:
            continue
        if isinstance(parts[start], ast.Constant) and parts[start].value == "source":
            continue
        args = ", ".join(ast.get_source_segment(text, part) for part in parts[start:])
        begin = offsets[node.lineno - 1] + node.col_offset
        end = offsets[node.end_lineno - 1] + node.end_col_offset
        edits.append((begin, end, f"art_path({args}, root={root})"))
    for begin, end, replacement in sorted(edits, reverse=True):
        text = text[:begin] + replacement + text[end:]
    if edits and "from art_library import art_path" not in text:
        lines = text.splitlines(keepends=True)
        last_import = max(node.end_lineno for node in tree.body
                          if isinstance(node, (ast.Import, ast.ImportFrom)))
        lines.insert(last_import, "from art_library import art_path\n")
        text = "".join(lines)
    if 'ART.glob("*.md")' in text:
        text = text.replace('ART.glob("*.md")', "art_documents()")
        text = "from art_library import art_documents\n" + text
    return text


def rewrite_repository_paths(text, moved):
    replacements = {}
    for old, new in moved.items():
        old_rel = old.relative_to(ROOT).as_posix()
        new_rel = new.relative_to(ROOT).as_posix()
        replacements[old_rel] = new_rel
        replacements[old_rel.replace("/", "\\")] = new_rel.replace("/", "\\")
        replacements[old_rel.replace("/", "\\\\")] = new_rel.replace("/", "\\\\")
    pattern = re.compile("|".join(re.escape(key) for key in sorted(replacements, key=len, reverse=True)))
    return pattern.sub(lambda match: replacements[match.group(0)], text)


def main():
    moved = relocations()
    for old, new in moved.items():
        if not old.is_file():
            raise FileNotFoundError(old)
        if new.exists():
            raise FileExistsError(new)
    preserved = [*ART.rglob("*.json"), *[p for p in (ART / "source").rglob("*") if p.is_file()],
                 *[p for p in (ROOT / "public" / "assets").rglob("*") if p.is_file()]]
    hashes = {moved.get(p, p): hashlib.sha256(p.read_bytes()).hexdigest() for p in preserved}
    edits = {}
    for base in (ROOT / "docs", ART, ROOT / "tools", ROOT / "src"):
        for path in base.rglob("*"):
            if not path.is_file() or path.suffix not in (".md", ".py", ".ts"):
                continue
            if ART / "source" in path.parents or path.name in ("art_library.py", "organize_art_library.py"):
                continue
            original = path.read_text(encoding="utf-8")
            updated = original
            if path.suffix == ".md":
                updated = rewrite_markdown(updated, path, moved.get(path, path), moved)
            if path.suffix == ".py":
                updated = rewrite_python(updated)
            updated = rewrite_repository_paths(updated, moved)
            if updated != original:
                edits[path] = updated
    for path in (ROOT / "AGENTS.md", ROOT / "README.md"):
        original = path.read_text(encoding="utf-8")
        edits[path] = rewrite_repository_paths(rewrite_markdown(original, path, path, moved), moved)
    for path, updated in edits.items():
        path.write_text(updated, encoding="utf-8")
    for old, new in moved.items():
        new.parent.mkdir(parents=True, exist_ok=True)
        old.rename(new)
    for path, expected in hashes.items():
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError(f"Preservation check failed: {path}")
    print(f"Moved {len(moved)} documents/records; updated {len(edits)} text files.")
    print(f"Verified {len(hashes)} source/runtime/provenance files byte-identical.")


if __name__ == "__main__":
    main()
