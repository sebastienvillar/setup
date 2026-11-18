import type { ExtensionAPI, Theme, ToolRenderers } from "@earendil-works/pi-coding-agent";
import { type Component, Container, Text, truncateToWidth } from "@earendil-works/pi-tui";

type RenderCall = NonNullable<ToolRenderers["renderCall"]>;
type RenderResult = NonNullable<ToolRenderers["renderResult"]>;
type RenderContext = Parameters<RenderCall>[2];

const SUMMARY_KEYS = ["command", "path", "file_path", "pattern", "query", "url", "prompt", "code"];

// Components this extension returned while collapsed. Native renderers reuse
// `context.lastComponent` and assume it is their own class, so never hand them ours.
const ownComponents = new WeakSet<Component>();

function own<T extends Component>(component: T): T {
	ownComponents.add(component);
	return component;
}

function nativeContext(context: RenderContext): RenderContext {
	const last = context.lastComponent as Component | undefined;
	return last && ownComponents.has(last) ? { ...context, lastComponent: undefined } : context;
}

function firstLine(text: string): string {
	const lines = text.split("\n").filter((line) => line.trim());
	const head = lines.find((line) => !line.trim().startsWith("//")) ?? lines[0] ?? "";
	const more = lines.length > 1 ? ` (+${lines.length - 1} lines)` : "";
	return `${head.trim()}${more}`;
}

export function summarizeArgs(args: unknown): string {
	if (!args || typeof args !== "object") return "";
	const record = args as Record<string, unknown>;
	for (const key of SUMMARY_KEYS) {
		const value = record[key];
		if (typeof value === "string" && value.trim()) return firstLine(value);
	}
	const json = JSON.stringify(args);
	return json === "{}" ? "" : json;
}

function collapsedCall(toolName: string, args: unknown, theme: Theme, indent: string): Component {
	const summary = summarizeArgs(args);
	const line = `${indent}${theme.fg("toolTitle", theme.bold(toolName))}${summary ? ` ${theme.fg("accent", summary)}` : ""}`;
	return own({ render: (width) => [truncateToWidth(line, width, "…")], invalidate() {} });
}

function fallbackResult(result: Parameters<RenderResult>[0], theme: Theme): Component {
	const text = result.content
		.filter((block) => block.type === "text")
		.map((block) => block.text)
		.join("\n");
	return own(new Text(theme.fg("toolOutput", text), 0, 0));
}

/** Collapsed tools show one line naming the tool and its command; expanding restores the native rendering. */
export function collapseRenderers(toolName: string, native: ToolRenderers | undefined): ToolRenderers {
	return {
		...native,
		renderCall(args, theme, context) {
			if (!context.expanded || !native?.renderCall) {
				// Self-framed tools (such as edit) get no padded box from Pi.
				const indent = native?.renderShell === "self" ? " ".repeat(context.outputPad) : "";
				return collapsedCall(toolName, args, theme, indent);
			}
			return native.renderCall(args, theme, nativeContext(context));
		},
		renderResult(result, options, theme, context) {
			if (!options.expanded) return own(new Container());
			if (!native?.renderResult) return fallbackResult(result, theme);
			return native.renderResult(result, options, theme, nativeContext(context));
		},
	};
}

export default function collapseToolsExtension(pi: ExtensionAPI): void {
	pi.registerToolRenderer((toolName, next) => collapseRenderers(toolName, next()));
}
