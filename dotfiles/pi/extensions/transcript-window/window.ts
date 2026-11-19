import type { Component } from "@earendil-works/pi-tui";

/** Minimum number of trailing transcript children kept rendered. */
export const WINDOW_SIZE = 50;

export interface ScrollState {
	following: boolean;
	scrollTop: number;
	viewportHeight: number;
}

export interface WindowSelection {
	visible: Component[];
	/** Leading children left unrendered. */
	hidden: number;
	/** Rendered rows revealed above the previous first child; the caller scrolls down by this much. */
	prepended: number;
}

/**
 * Picks the trailing slice of a transcript to render.
 *
 * While following the end, keep the last WINDOW_SIZE children, extended until they fill two
 * viewports, so trimming the top never moves the visible rows. While scrolled away, keep the
 * same first child so appended or removed rows above cannot shift the view; reveal another
 * WINDOW_SIZE older children once the view reaches the top.
 */
export class TranscriptWindow {
	private first: Component | undefined;
	private size = WINDOW_SIZE;

	select(children: readonly Component[], scroll: ScrollState, height: (child: Component) => number): WindowSelection {
		let start = scroll.following ? this.followingStart(children, scroll, height) : this.anchoredStart(children);
		let prepended = 0;
		if (!scroll.following) {
			while (start > 0 && scroll.scrollTop + prepended === 0) {
				const next = Math.max(0, start - WINDOW_SIZE);
				for (let index = next; index < start; index++) prepended += height(children[index]!);
				start = next;
			}
		}
		this.first = children[start];
		this.size = children.length - start;
		return { visible: children.slice(start), hidden: start, prepended };
	}

	private followingStart(
		children: readonly Component[],
		scroll: ScrollState,
		height: (child: Component) => number,
	): number {
		let start = Math.max(0, children.length - WINDOW_SIZE);
		if (start === 0) return 0;
		let rows = 0;
		for (let index = start; index < children.length; index++) rows += height(children[index]!);
		while (start > 0 && rows < scroll.viewportHeight * 2) rows += height(children[--start]!);
		return start;
	}

	private anchoredStart(children: readonly Component[]): number {
		const index = this.first ? children.indexOf(this.first) : -1;
		// The first child can disappear when the transcript is rebuilt; keep a similar size.
		return index >= 0 ? index : Math.max(0, children.length - this.size);
	}
}
