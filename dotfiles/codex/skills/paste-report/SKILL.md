---
name: paste-report
description: "Build a readable single-page HTML report or doc for Figma's Paste service: sticky sidebar navigation, numbered sections, item cards, color-coded tags, automatic dark mode. Use when creating HTML to share via Paste (paste-content.figma.host), or for 'make a report page', 'write this up as HTML', 'publish this as a doc'."
menu-description: build a styled HTML report page to publish on Paste
---

# Paste report

Every Paste page should look like one family: a neutral page with one accent color, a sticky sidebar that mirrors the outline, numbered sections, and cards for repeated items. The look is encoded in `assets/template.html`. Copy it and fill it in; do not restyle it.

Publishing (namespace, paths, the friendly URL) belongs to the `paste` skill, or the Paste MCP tools directly when that skill is not loaded. This skill ends with a checked local directory ready to hand to it.

## 1. Plan the outline first

Write the outline before any HTML, because the sidebar, the section numbers, and the ids all come from it.

- **Summary first.** Section 1 is always a summary: a callout with the conclusion, the totals, what blocks or needs action, and where the work is tracked, then a count table if the items have categories.
- **Numbered sections.** h2 `2.`, h3 `2.1`. Give each h3 one line of `.small` text that says what belongs there.
- **Cards for repeated items** (bugs, findings, tickets, experiments). Each card has a pill row, a short h4 title, one `.lede` sentence, a `dl.meta` grid of links, and optional evidence.
- **One grouping or two.** Keep the view switch only when readers really need the same items grouped two ways (for example by category and by priority). Otherwise delete `.switch` and every `data-view` wrapper.

## 2. Build from the template

1. Copy `assets/template.html` to `<dir>/index.html`. Put media under `<dir>/media/` and reference it with relative paths.
2. Replace the placeholder content. Keep the `<style>` and `<script>` blocks as they are, apart from the token and palette rules in step 3.
3. Fill the sidebar from the same outline as `main`:
   - `.l2` for sections, `.l3` for subsections, `.l4` for cards.
   - A `.n` count after each section and subsection.
   - The card's category pill before each `.l4` title, and `.mark` for a flag such as `PR`.
   - The "Updated" line set to the real generation time in UTC.
4. Give every card an `id` so it can be deep-linked. With the view switch, the cards appear once per view, and every id starts with its view name (`cat-ITEM-1`, `pri-ITEM-1`). The script opens the view that matches the hash prefix.
5. Keep it self-contained: one HTML file with inline CSS and JS, no frameworks, CDNs, or web fonts. Use `loading="lazy"` on images and `preload="none"` inside `<details class="media">` for video. Wrap wide content (tables, screenshot strips) in `.scroll` or `a.strip`.

When the content comes from data (tickets, test results, a JSON file), write a small generator script that emits the cards and the sidebar from the same list. Hand-written duplicates drift.

## 3. Use color as encoding

| Element | Classes | Rule |
| --- | --- | --- |
| Base | `--bg`, `--fg`, `--muted`, `--line`, `--panel` | Neutral greys. Never color body text. |
| Accent | `--accent` | Links, the active switch button, link pills. Only one accent. |
| Category tag | `.tag.<hue>-<1..3>` | Hue = kind of item (bugs red, gaps purple). Shade = subcategory, 1 darkest. |
| Severity / priority | `.sev.sev-<0..3>` | Hot to cool: red, orange, amber, grey. Square corners set it apart from tags. |
| Neutral attribute | `.kind` | Outlined pill for facts that need no color (area, platform, P-level). |

- Every colored pill carries a text label, so no meaning depends on color alone.
- All palette shades pass WCAG AA with white text. To add a color, add a CSS variable or a palette class with at least 4.5:1 contrast against white, and add a dark-mode value for any new token.
- Use at most about three hue families on one page. More hues stop meaning anything.

## 4. Write for scanning

- Titles: a few words naming the problem, not the ticket title. Put the full ticket title in `dl.meta`.
- Ledes: one sentence covering what happens and why it matters.
- State what is missing instead of leaving a gap: "Video: not recorded."
- Put numbers in headings and sidebar entries so readers see the scale before reading.

## 5. Check, then publish

1. Run `python3 <skill-dir>/scripts/check.py <dir>/index.html`. It fails on duplicate ids, sidebar or in-page links without a target, missing relative assets, and external scripts, stylesheets, or fonts. Fix everything it reports.
2. Render the page in light mode, dark mode, and at a narrow width (about 420 px). Look at it, for example with headless Chrome `--screenshot` plus `--blink-settings=preferredColorScheme=0` for dark mode. Confirm that a `#<view>-<id>` deep link opens the right view.
3. Hand the directory to the `paste` skill to publish it, then share the friendly URL.
