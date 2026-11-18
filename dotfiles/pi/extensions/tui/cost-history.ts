import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import {
	type ExtensionContext,
	migrateSessionEntries,
	parseSessionEntries,
	type SessionEntry,
	SessionManager,
	type Theme,
} from "@earendil-works/pi-coding-agent";
import { type Component, truncateToWidth } from "@earendil-works/pi-tui";
import { combineAgentCosts, formatCost, getSessionCosts, sumSessionCosts } from "./cost";

const DAY_MS = 86_400_000;

type Registry = ExtensionContext["modelRegistry"];

export type SessionCost = {
	label: string;
	project: string;
	current: boolean;
	today: number;
	week: number;
	missing: boolean;
};

export type CostHistory = {
	sessions: SessionCost[];
	today: number;
	week: number;
	missing: boolean;
};

export type CostWindows = { todayStart: number; weekStart: number };

/** Today starts at local midnight; the week is today plus the six days before it. */
export function costWindows(now = new Date()): CostWindows {
	const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	return { todayStart: midnight, weekStart: midnight - 6 * DAY_MS };
}

function costSince(entries: readonly SessionEntry[], since: number, registry: Registry) {
	const window = entries.filter((entry) => Date.parse(entry.timestamp) >= since);
	const totals = combineAgentCosts(sumSessionCosts(window, registry), window, "/root", []);
	return { cost: totals.total, missing: totals.missing > 0 };
}

async function readEntries(path: string): Promise<SessionEntry[]> {
	const fileEntries = parseSessionEntries(await readFile(path, "utf8"));
	migrateSessionEntries(fileEntries);
	return fileEntries.filter((entry): entry is SessionEntry => entry.type !== "session");
}

export async function loadCostHistory(ctx: ExtensionContext, windows = costWindows()): Promise<CostHistory> {
	const currentFile = ctx.sessionManager.getSessionFile();
	const infos = (await SessionManager.listAll())
		.filter((info) => info.modified.getTime() >= windows.weekStart)
		.sort((a, b) => a.created.getTime() - b.created.getTime());
	// A fork copies its parent's entries with their ids; charge each entry once, to the oldest session.
	const seen = new Set<string>();
	const sessions: SessionCost[] = [];
	for (const info of infos) {
		const current = info.path === currentFile;
		let entries: SessionEntry[];
		try {
			entries = current ? ctx.sessionManager.getEntries() : await readEntries(info.path);
		} catch {
			continue;
		}
		const unique = entries.filter((entry) => !seen.has(entry.id));
		for (const entry of unique) seen.add(entry.id);
		const week = costSince(unique, windows.weekStart, ctx.modelRegistry);
		const today = costSince(unique, windows.todayStart, ctx.modelRegistry);
		if (week.cost <= 0 && !current) continue;
		sessions.push({
			label: info.name ?? info.firstMessage.split("\n")[0] ?? info.id,
			project: info.cwd ? basename(info.cwd) : "",
			current,
			today: today.cost,
			week: week.cost,
			missing: week.missing,
		});
	}
	// The live session may not be on disk yet, and its running subagents only exist in memory.
	if (!sessions.some((session) => session.current)) {
		const live = getSessionCosts(ctx);
		sessions.push({
			label: ctx.sessionManager.getSessionName() ?? "This session",
			project: basename(ctx.cwd),
			current: true,
			today: live.total,
			week: live.total,
			missing: live.missing > 0,
		});
	}
	sessions.sort((a, b) => b.today - a.today || b.week - a.week);
	return {
		sessions,
		today: sessions.reduce((sum, session) => sum + session.today, 0),
		week: sessions.reduce((sum, session) => sum + session.week, 0),
		missing: sessions.some((session) => session.missing),
	};
}

const COLUMN = 10;

function money(cost: number): string {
	return (cost > 0 ? formatCost(cost) : "–").padStart(COLUMN);
}

export function renderCostHistory(history: CostHistory, theme: Theme, width: number, maxRows: number): string[] {
	const bound = history.missing ? "≥" : "";
	const rows = [
		theme.fg("accent", theme.bold("Costs")) + theme.fg("dim", " · list-price estimate"),
		`${theme.fg("dim", "Today")} ${bound}${formatCost(history.today)}   ${theme.fg("dim", "Past 7 days")} ${bound}${formatCost(history.week)}   ${theme.fg("dim", `${history.sessions.length} sessions`)}`,
		"",
		theme.fg("dim", `${"Today".padStart(COLUMN)}${"7 days".padStart(COLUMN)}   Session`),
	];
	const visible = history.sessions.slice(0, Math.max(1, maxRows - rows.length - 2));
	for (const session of visible) {
		const marker = session.current ? theme.fg("accent", "● ") : "  ";
		const project = session.project ? theme.fg("dim", `  ${session.project}`) : "";
		rows.push(`${money(session.today)}${money(session.week)}   ${marker}${session.label}${project}`);
	}
	const hidden = history.sessions.slice(visible.length);
	if (hidden.length) {
		const rest = hidden.reduce((sum, session) => sum + session.week, 0);
		rows.push(theme.fg("dim", `${" ".repeat(COLUMN)}${money(rest)}     +${hidden.length} more sessions`));
	}
	rows.push("", theme.fg("dim", "Esc to close"));
	return rows.map((row) => truncateToWidth(row, width, "…"));
}

export async function showCostHistory(ctx: ExtensionContext): Promise<void> {
	if (!ctx.hasUI) return;
	await ctx.ui.custom<void>((tui, theme, keybindings, done) => {
		let history: CostHistory | undefined;
		let error: string | undefined;
		loadCostHistory(ctx).then(
			(loaded) => {
				history = loaded;
				tui.requestRender();
			},
			(reason: unknown) => {
				error = reason instanceof Error ? reason.message : String(reason);
				tui.requestRender();
			},
		);
		const component: Component & { handleInput(data: string): void } = {
			render(width) {
				if (error) return [theme.fg("error", `Could not load costs: ${error}`)];
				if (!history) return [theme.fg("dim", "Loading costs…")];
				return renderCostHistory(history, theme, width, Math.max(8, tui.terminal.rows - 6));
			},
			handleInput(data) {
				if (keybindings.matches(data, "tui.select.cancel") || keybindings.matches(data, "tui.select.confirm")) done();
			},
			invalidate() {},
		};
		return component;
	});
}
