#!/usr/bin/env python3
"""Check a paste-report page before publishing.

Usage: check.py path/to/index.html

Fails on duplicate ids, in-page links without a target, missing relative
assets, and external stylesheet, script, or font references. Prints the
problems and exits 1, or prints "ok" and exits 0.
"""

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ASSET_ATTRS = {"src", "href", "poster"}


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.anchors = []
        self.assets = []
        self.external = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        is_stylesheet = tag == "link" and "stylesheet" in (attrs.get("rel") or "")
        for name in ASSET_ATTRS & attrs.keys():
            value = attrs[name] or ""
            url = urlparse(value)
            if value.startswith("#"):
                self.anchors.append(unquote(value[1:]))
            elif url.scheme or value.startswith("//"):
                if tag == "script" or is_stylesheet:
                    self.external.append(value)
            elif value and tag != "a":
                self.assets.append(unquote(url.path))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    page = Path(sys.argv[1])
    html = page.read_text(encoding="utf-8")
    collector = Collector()
    collector.feed(html)

    problems = []
    seen = set()
    for element_id in collector.ids:
        if element_id in seen:
            problems.append(f"duplicate id: {element_id}")
        seen.add(element_id)
    for target in sorted(set(collector.anchors) - seen - {""}):
        problems.append(f"link to missing id: #{target}")
    for asset in sorted(set(collector.assets)):
        if not (page.parent / asset).is_file():
            problems.append(f"missing local asset: {asset}")
    for url in collector.external:
        problems.append(f"external dependency: {url}")
    if "@import" in html or "fonts.googleapis" in html:
        problems.append("external CSS import or web font")

    if problems:
        print("\n".join(problems))
        sys.exit(1)
    print("ok")


if __name__ == "__main__":
    main()
