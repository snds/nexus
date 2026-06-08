/**
 * The command registry (architecture §4). Every graph action is a registered command
 * in one of three classes — the context menu, toolbar, and keyboard map all read from here.
 *
 *   op        : pure topology (expand/collapse/group/ungroup/hide/unhide/pin/reset)
 *   transform : semantic graph queries that FETCH & ADD related nodes (Maltego-style)
 *   action    : push/pull to the outside world (export, enrich, PTR, Splunk)
 *
 * Transforms/actions are data-driven so the catalog can grow without touching the canvas.
 */

import type { Entity } from "./entities.js";
import type { Relationship } from "./relationships.js";
import type { Ports } from "./ports.js";

export type CommandClass = "op" | "transform" | "action";

export type TopologyOp =
  | "expand"
  | "collapse"
  | "group"
  | "ungroup"
  | "hide"
  | "unhide"
  | "pin"
  | "reset";

/** What a command tells the graph engine to do when it runs. */
export type CommandResult =
  | { kind: "mutation"; addEntities?: Entity[]; addRelationships?: Relationship[]; removeEntityIds?: string[] }
  | { kind: "topology"; op: TopologyOp; payload?: Record<string, unknown> }
  | { kind: "side-effect"; note?: string }
  | { kind: "noop" };

/** Everything a command needs to run, with no UI/engine coupling. */
export interface CommandContext {
  readonly selection: readonly Entity[];
  readonly ports: Ports;
  /** Optional params (e.g. expand depth, neighbor type filter). */
  readonly params?: Record<string, unknown>;
}

export interface GraphCommand {
  readonly id: string;
  readonly class: CommandClass;
  readonly label: string;
  /** Which integration port this command needs (gates availability if not configured). */
  readonly port?: "tap" | "splunk" | "ptr" | "threatIntel";
  /** Keyboard shortcut, e.g. "e", "mod+g" (mod = ⌘ on mac / Ctrl on win). */
  readonly shortcut?: string;
  /** Enable/disable for the current selection (the toolbar "disabled until applicable" rule). */
  appliesTo(selection: readonly Entity[]): boolean;
  run(ctx: CommandContext): Promise<CommandResult>;
}

export class CommandRegistry {
  private readonly commands = new Map<string, GraphCommand>();

  register(cmd: GraphCommand): this {
    if (this.commands.has(cmd.id)) {
      throw new Error(`Duplicate command id: ${cmd.id}`);
    }
    this.commands.set(cmd.id, cmd);
    return this;
  }

  get(id: string): GraphCommand | undefined {
    return this.commands.get(id);
  }

  all(): readonly GraphCommand[] {
    return [...this.commands.values()];
  }

  /** Commands of a class that apply to the given selection — drives the context menu sections. */
  forSelection(selection: readonly Entity[], cls?: CommandClass): readonly GraphCommand[] {
    return this.all().filter((c) => (cls ? c.class === cls : true) && c.appliesTo(selection));
  }

  /** Resolve a keyboard shortcut to a command. */
  byShortcut(shortcut: string): GraphCommand | undefined {
    return this.all().find((c) => c.shortcut === shortcut);
  }
}

const nonEmpty = (s: readonly Entity[]) => s.length > 0;

/** Built-in topology ops (discovery §4.2). Pure metadata + a topology intent. */
export const BUILTIN_OPS: GraphCommand[] = [
  { id: "expand", class: "op", label: "Expand", shortcut: "e", port: "tap", appliesTo: nonEmpty,
    run: async ({ selection, ports, params }) => {
      const node = selection[0];
      if (!node) return { kind: "noop" };
      const depth = (params?.depth as number) ?? 1;
      const { entities, relationships } = await ports.tap.expand(node.id, { depth });
      return { kind: "mutation", addEntities: entities, addRelationships: relationships };
    } },
  { id: "collapse", class: "op", label: "Collapse", shortcut: "mod+e", appliesTo: nonEmpty,
    run: async () => ({ kind: "topology", op: "collapse" }) },
  { id: "group", class: "op", label: "Group", shortcut: "g", appliesTo: (s) => s.length > 1,
    run: async () => ({ kind: "topology", op: "group" }) },
  { id: "ungroup", class: "op", label: "Ungroup", shortcut: "mod+g", appliesTo: nonEmpty,
    run: async () => ({ kind: "topology", op: "ungroup" }) },
  { id: "hide", class: "op", label: "Hide", shortcut: "h", appliesTo: nonEmpty,
    run: async () => ({ kind: "topology", op: "hide" }) },
  { id: "unhide", class: "op", label: "Unhide", shortcut: "mod+h", appliesTo: nonEmpty,
    run: async () => ({ kind: "topology", op: "unhide" }) },
  { id: "pin", class: "op", label: "Pin", appliesTo: nonEmpty,
    run: async () => ({ kind: "topology", op: "pin" }) },
  { id: "reset", class: "op", label: "Reset Graph", shortcut: "mod+r", appliesTo: () => true,
    run: async () => ({ kind: "topology", op: "reset" }) },
];

/** A couple of seed transforms (discovery §4.3). The real catalog is loaded from config/data. */
export const BUILTIN_TRANSFORMS: GraphCommand[] = [
  { id: "show-attacker-infra", class: "transform", label: "Show Attacker Infrastructure", port: "tap", appliesTo: nonEmpty,
    run: async ({ selection, ports }) => {
      const node = selection[0];
      if (!node) return { kind: "noop" };
      const r = await ports.tap.transform("attacker-infrastructure", node.id);
      return { kind: "mutation", addEntities: r.entities, addRelationships: r.relationships };
    } },
  { id: "related-iocs", class: "transform", label: "Show related compromise indicators", port: "tap", appliesTo: nonEmpty,
    run: async ({ selection, ports }) => {
      const node = selection[0];
      if (!node) return { kind: "noop" };
      const r = await ports.tap.transform("related-iocs", node.id);
      return { kind: "mutation", addEntities: r.entities, addRelationships: r.relationships };
    } },
  { id: "check-user-clicks", class: "transform", label: "Check for clicks by users (Splunk Query)", port: "splunk",
    appliesTo: (s) => s.some((e) => e.type === "email_address"),
    run: async ({ selection, ports }) => {
      const r = await ports.splunk.query("user-clicks", selection.map((e) => e.id));
      return { kind: "mutation", addEntities: r.entities, addRelationships: r.relationships };
    } },
];

/** Seed actions (discovery §4.3). */
export const BUILTIN_ACTIONS: GraphCommand[] = [
  { id: "enrich", class: "action", label: "Enrich", port: "threatIntel", appliesTo: nonEmpty,
    run: async ({ selection, ports }) => {
      await ports.threatIntel.enrich(selection.map((e) => e.id));
      return { kind: "side-effect", note: "Enrichment requested" };
    } },
  { id: "export-csv", class: "action", label: "Export as CSV", appliesTo: nonEmpty,
    run: async () => ({ kind: "side-effect", note: "Exported selection to CSV" }) },
  { id: "add-to-ptr", class: "action", label: "Add to PTR", port: "ptr", appliesTo: nonEmpty,
    run: async ({ selection, ports }) => {
      await ports.ptr.addIndicators(selection.map((e) => e.id));
      return { kind: "side-effect", note: "Added to Proofpoint Threat Response" };
    } },
];

/** A registry preloaded with the built-in command set. */
export function createDefaultRegistry(): CommandRegistry {
  const reg = new CommandRegistry();
  for (const c of [...BUILTIN_OPS, ...BUILTIN_TRANSFORMS, ...BUILTIN_ACTIONS]) reg.register(c);
  return reg;
}
