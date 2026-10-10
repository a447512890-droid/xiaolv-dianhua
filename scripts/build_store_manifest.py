"""扫描商店图目录，生成原型读取的图片清单。"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets" / "商店图"
EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def main():
    groups = []
    folders = sorted(
        (path for path in ASSETS.iterdir() if path.is_dir()),
        key=lambda path: (path.name != "待办版", path.name),
    )
    for folder in folders:
        files = [
            {"name": path.stem, "path": path.relative_to(ASSETS).as_posix()}
            for path in sorted(folder.rglob("*"))
            if path.is_file() and path.suffix.lower() in EXTENSIONS
        ]
        groups.append({"name": folder.name, "files": files})
    target = ASSETS / "manifest.json"
    target.write_text(
        json.dumps({"groups": groups}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"已生成商店图清单，共 {sum(len(group['files']) for group in groups)} 张图片")


if __name__ == "__main__":
    main()
