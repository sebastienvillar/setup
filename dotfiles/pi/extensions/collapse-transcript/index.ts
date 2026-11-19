import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { mountTranscriptProjection } from "./libtui.ts";
import { ActivityTimings } from "./activity-timing.ts";
import { ActivityTranscript } from "./activity-transcript.ts";

export default function transcriptExtension(pi: ExtensionAPI): void {
	let unmount: (() => void) | undefined;
	pi.on("session_start", (_event, ctx) => {
		unmount?.();
		unmount = undefined;
		if (!ctx.hasUI || ctx.mode !== "tui") return;
		ctx.ui.setWidget("pi-collapse-transcript.host", (tui, theme) => {
			unmount?.();
			const timings = new ActivityTimings();
			let previousLeaf: string | null | undefined;
			const detach = mountTranscriptProjection(
				tui,
				(entries) =>
					new ActivityTranscript(
						() => {
							const leaf = ctx.sessionManager.getLeafId();
							if (leaf !== previousLeaf) {
								timings.load(ctx.sessionManager.getBranch());
								previousLeaf = leaf;
							}
							return entries();
						},
						theme,
						() => tui.requestRender(),
						timings,
					),
			);
			let disposed = false;
			const release = () => {
				if (disposed) return;
				disposed = true;
				detach?.();
				if (unmount === release) unmount = undefined;
			};
			unmount = release;
			return {
				render: () => [],
				invalidate() {},
				dispose: release,
			};
		});
	});
	pi.on("session_shutdown", (_event, ctx) => {
		unmount?.();
		unmount = undefined;
		if (ctx.hasUI && ctx.mode === "tui") ctx.ui.setWidget("pi-collapse-transcript.host", undefined);
	});
}
