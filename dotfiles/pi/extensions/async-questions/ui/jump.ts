import type { ScrollView, TUI } from "@earendil-works/pi-tui";

// KEEP_IN_SYNC(extensions/transcript-window/index.ts#REVEAL_ALL)
const REVEAL_ALL = Symbol.for("transcript-window.revealAll");

interface LayoutBox {
	scrollView?: ScrollView;
	scrollContentLines?: readonly string[];
	children: readonly LayoutBox[];
}

/** An OSC 8 hyperlink terminator with an id: invisible, harmless to terminals, and kept in Pi's scroll content. */
export function questionAnchor(id: string): string {
	return `\x1b]8;id=pi-question-${encodeURIComponent(id)};\x1b\\`;
}

/** Fullscreen only: regular mode hands rows to the terminal's own scrollback. */
function primaryScrollView(tui: TUI): ScrollView | undefined {
	if (tui.mode !== "fullscreen") return undefined;
	// type-boundary: TuiAltScreen keeps the transcript ScrollView and its last layout private.
	const getter: unknown = Reflect.get(tui, "getPrimaryScrollView");
	return typeof getter === "function" ? (Reflect.apply(getter, tui, []) as ScrollView) : undefined;
}

function scrollContent(tui: TUI, view: ScrollView): readonly string[] | undefined {
	const layout = Reflect.get(tui, "currentLayout") as { root: LayoutBox } | undefined;
	const visit = (box: LayoutBox): LayoutBox | undefined =>
		box.scrollView === view ? box : box.children.map(visit).find(Boolean);
	return layout && visit(layout.root)?.scrollContentLines;
}

function scrollToAnchor(tui: TUI, view: ScrollView, anchor: string): boolean {
	const row = scrollContent(tui, view)?.findIndex((line) => line.includes(anchor)) ?? -1;
	if (row < 0) return false;
	// Keep the question in the lower third so the turn that led to it stays in view.
	view.scrollTo(row - Math.floor((view.viewportHeight * 2) / 3), { disableFollow: true });
	tui.requestRender();
	return true;
}

export function canJumpToQuestion(tui: TUI): boolean {
	return primaryScrollView(tui) !== undefined;
}

/**
 * Scroll the transcript to a question's entry. When transcript-window has trimmed it, ask that
 * extension to render every entry, then retry once that frame has laid out.
 */
export function jumpToQuestion(tui: TUI, id: string, onMissing: () => void): void {
	const view = primaryScrollView(tui);
	if (!view) return;
	const anchor = questionAnchor(id);
	if (scrollToAnchor(tui, view, anchor)) return;
	const reveal: unknown = Reflect.get(tui, REVEAL_ALL);
	if (typeof reveal !== "function") return onMissing();
	reveal(() => {
		if (!scrollToAnchor(tui, view, anchor)) onMissing();
	});
}
