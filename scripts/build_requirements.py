"""把docs/产品需求/需求说明.md转换为原型可直接加载的数据。"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs" / "产品需求" / "需求说明.md"
TARGET = ROOT / "原型" / "requirements-data.js"
FIELDS = ("标题", "模块说明", "数据来源", "前置条件", "后置结果", "显示数量限制", "排序规则")


def main() -> None:
    notes = {}
    current = None
    for line in SOURCE.read_text(encoding="utf-8").splitlines():
        heading = re.fullmatch(r"## ([A-Za-z][A-Za-z0-9]*)", line)
        if heading:
            current = heading.group(1)
            notes[current] = {}
            continue
        field = re.fullmatch(r"- ([^:：]+)[:：] (.*)", line)
        if current and field and field.group(1) in FIELDS:
            notes[current][field.group(1)] = field.group(2)

    missing = {key: [field for field in FIELDS if field not in data] for key, data in notes.items()}
    missing = {key: fields for key, fields in missing.items() if fields}
    if missing:
        raise ValueError(f"需求说明字段不完整: {missing}")

    output = "// 由 build_requirements.py 从 ../docs/产品需求/需求说明.md 生成，请勿直接修改。\n"
    output += "window.REQUIREMENTS = " + json.dumps(notes, ensure_ascii=False, indent=2) + ";\n"
    TARGET.write_text(output, encoding="utf-8")
    print(f"已生成 {TARGET.name}，共 {len(notes)} 个模块")


if __name__ == "__main__":
    main()
