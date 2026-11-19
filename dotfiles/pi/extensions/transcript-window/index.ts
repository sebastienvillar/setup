import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { type Component, type ScrollView, Spacer, Text, type TUI } from "@earendil-works/pi-tui";
import { TranscriptWindow } from "./window.ts";

const WIDGET_KEY = "transcript-window.host";

type Patchable = Record<string, unknown>;
interface ListContainer extends Component {
	children: Component[];
}
interface ListStack extends Component {
	setChildren(children: readonly Component[]): void;
}

function isListContainer(value: unknown): value is ListContainer {
	return typeof value === "object" && value !== null && Array.isArray(Reflect.get(value, "children"));
}

function isListStack(value: unknown): value is ListStack {
	return typeof value === "object" && value !== null && typeof Reflect.get(value, "setChildren") === "function";
}

/** Shadow a method on one instance; the returned function removes the shadow. */
function patch(target: object, key: string, replacement: Function): () => void {
	const own = Object.getOwnPropertyDescriptor(target, key);
	Object.defineProperty(target, key, { value: replacement, configurable: true, writable: true });
	return () => {
		if (own) Object.defineProperty(target, key, own);
		else Reflect.deleteProperty(target, key);
	};
}

/** Counts hidden children that carry content; collapse-transcript wraps Pi's components in adapters. */
function countMessages(children: readonly Component[]): number {
	let count = 0;
	for (const child of children) {
		const wrapped: unknown = Reflect.get(child, "component");
		if (!((wrapped ?? child) instanceof Spacer)) count++;
	}
	return count;
}

/** Fullscreen only: regular mode hands rows to the terminal's own scrollback. */
function primaryScrollView(tui: TUI): ScrollView | undefined {
	if (tui.mode !== "fullscreen") return undefined;
	// type-boundary: TuiAltScreen keeps the transcript ScrollView behind a private accessor.
	const getter: unknown = Reflect.get(tui, "getPrimaryScrollView");
	return typeof getter === "function" ? (Reflect.apply(getter, tui, []) as ScrollView) : undefined;
}

/**
 * Pi mounts [header, resources, chat] as the first document child. The chat slot holds Pi's
 * Container, or a ComponentStack projection that collapse-transcript installs over it. Patch
 * whichever occupies the slot when the document renders, so extension load order is irrelevant.
 */
function mount(tui: TUI, theme: Theme): (() => void) | undefined {
	const roots: unknown = Reflect.get(tui, "children");
	const document: unknown = Array.isArray(roots) ? roots[0] : undefined;
	if (!isListContainer(document) || document.children.length !== 3) return undefined;

	const restores: (() => void)[] = [];
	const patched = new WeakSet<object>();

	const notice = new Text("", 1, 0);
	let noticeText = "";
	let noticeRows = 0;

	const windowed = (window: TranscriptWindow, children: Component[], width: number): Component[] => {
		const view = primaryScrollView(tui);
		if (!view) return children;
		const scroll = { following: view.isFollowingEnd, scrollTop: view.scrollTop, viewportHeight: view.viewportHeight };
		const selection = window.select(children, scroll, (child) => child.render(width).length);
		const { visible, hidden } = selection;
		const previousNoticeRows = noticeRows;
		if (hidden > 0) {
			const count = countMessages(children.slice(0, hidden));
			const text = theme.fg("muted", `Trimmed ${count} ${count === 1 ? "message" : "messages"}`);
			if (text !== noticeText) notice.setText((noticeText = text));
			noticeRows = notice.render(width).length;
		} else noticeRows = 0;
		// Scroll down by the rows revealed above, during the same layout pass, so the view holds still.
		// The notice sits above them, so its height change counts too. scrollTo would clamp against
		// the previous frame's shorter content height.
		if (selection.prepended > 0) {
			const shift = selection.prepended + noticeRows - previousNoticeRows;
			Reflect.set(view, "currentScrollTop", view.scrollTop + shift);
		}
		return hidden > 0 ? [notice, ...visible] : visible;
	};

	const patchSlot = (slot: Component) => {
		const window = new TranscriptWindow();
		if (isListStack(slot)) {
			const render = slot.render;
			const setChildren = slot.setChildren;
			let width = 0;
			restores.push(
				patch(slot, "render", (nextWidth: number) => {
					width = nextWidth;
					return render.call(slot, nextWidth);
				}),
				patch(slot, "setChildren", (children: readonly Component[]) =>
					setChildren.call(slot, windowed(window, [...children], width)),
				),
			);
		} else if (isListContainer(slot)) {
			const render = slot.render;
			restores.push(
				patch(slot, "render", (width: number) => {
					const all = slot.children;
					slot.children = windowed(window, all, width);
					try {
						return render.call(slot, width);
					} finally {
						slot.children = all;
					}
				}),
			);
		}
	};

	const render = document.render;
	restores.push(
		patch(document, "render", (width: number) => {
			const slot = document.children[2];
			if (slot && !patched.has(slot)) {
				patched.add(slot);
				patchSlot(slot);
			}
			return render.call(document, width);
		}),
	);
	tui.requestRender();
	return () => {
		for (const restore of restores.reverse()) restore();
		tui.requestRender();
	};
}

export default function transcriptWindowExtension(pi: ExtensionAPI): void {
	let unmount: (() => void) | undefined;
	const release = () => {
		unmount?.();
		unmount = undefined;
	};
	pi.on("session_start", (_event, ctx) => {
		release();
		if (!ctx.hasUI || ctx.mode !== "tui") return;
		ctx.ui.setWidget(WIDGET_KEY, (tui, theme) => {
			release();
			unmount = mount(tui, theme);
			return { render: () => [], invalidate() {}, dispose: release };
		});
	});
	pi.on("session_shutdown", (_event, ctx) => {
		release();
		if (ctx.hasUI && ctx.mode === "tui") ctx.ui.setWidget(WIDGET_KEY, undefined);
	});
}
