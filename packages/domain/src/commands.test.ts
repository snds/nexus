import { describe, it, expect } from "vitest";
import { createDefaultRegistry } from "./commands.js";
import type { Entity } from "./entities.js";

const entity = (over: Partial<Entity> = {}): Entity => ({
  id: "e1",
  type: "hash",
  label: "7d47c9…",
  verdict: "malicious",
  ...over,
});

describe("CommandRegistry", () => {
  it("loads the three built-in command classes", () => {
    const reg = createDefaultRegistry();
    expect(reg.forSelection([entity()], "op").length).toBeGreaterThan(0);
    expect(reg.forSelection([entity()], "transform").length).toBeGreaterThan(0);
    expect(reg.forSelection([entity()], "action").length).toBeGreaterThan(0);
  });

  it("group requires a multi-selection", () => {
    const reg = createDefaultRegistry();
    const group = reg.get("group")!;
    expect(group.appliesTo([entity()])).toBe(false);
    expect(group.appliesTo([entity(), entity({ id: "e2" })])).toBe(true);
  });

  it("the user-clicks transform only applies to email entities", () => {
    const reg = createDefaultRegistry();
    const cmd = reg.get("check-user-clicks")!;
    expect(cmd.appliesTo([entity({ type: "hash" })])).toBe(false);
    expect(cmd.appliesTo([entity({ type: "email_address" })])).toBe(true);
  });

  it("resolves commands by keyboard shortcut", () => {
    const reg = createDefaultRegistry();
    expect(reg.byShortcut("e")?.id).toBe("expand");
    expect(reg.byShortcut("mod+g")?.id).toBe("ungroup");
  });

  it("rejects duplicate command ids", () => {
    const reg = createDefaultRegistry();
    const dup = reg.get("expand")!;
    expect(() => reg.register(dup)).toThrow(/Duplicate/);
  });
});
