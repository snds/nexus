import { describe, it, expect } from "vitest";
import { NexusGraph } from "./model.js";
import { radialLayout } from "./layout.js";
import type { GraphFragment } from "@nexus/domain";

const fragment: GraphFragment = {
  entities: [
    { id: "a", type: "hash", label: "root", verdict: "malicious" },
    { id: "b", type: "domain", label: "d", verdict: "suspicious" },
    { id: "c", type: "ip", label: "i", verdict: "benign" },
  ],
  relationships: [
    { id: "r1", source: "a", target: "b", kind: "contacts" },
    { id: "r2", source: "a", target: "c", kind: "contacts" },
  ],
};

describe("NexusGraph", () => {
  it("ingests a fragment as a directed multigraph", () => {
    const m = new NexusGraph();
    m.addFragment(fragment);
    expect(m.order).toBe(3);
    expect(m.edges()).toHaveLength(2);
  });

  it("drops edges with missing endpoints", () => {
    const m = new NexusGraph();
    m.addFragment({ entities: [fragment.entities[0]!], relationships: fragment.relationships });
    expect(m.edges()).toHaveLength(0);
  });

  it("tracks selection state", () => {
    const m = new NexusGraph();
    m.addFragment(fragment);
    m.setState("a", { selected: true });
    expect(m.selected().map((e) => e.id)).toEqual(["a"]);
    m.clearSelection();
    expect(m.selected()).toHaveLength(0);
  });

  it("derives ancestors and descendants from assigned depths", () => {
    const m = new NexusGraph();
    m.addFragment(fragment);
    // a (root) → b, c
    m.setState("a", { depth: 0 });
    m.setState("b", { depth: 1 });
    m.setState("c", { depth: 1 });
    expect(m.descendants("a").sort()).toEqual(["b", "c"]);
    expect(m.ancestors("b")).toEqual(["a"]);
    expect(m.ancestors("a")).toEqual([]);
  });

  it("radial layout centers the highest-degree node at origin", () => {
    const m = new NexusGraph();
    m.addFragment(fragment);
    radialLayout(m);
    const root = m.nodes().find((n) => n.id === "a")!;
    expect(root.state.x).toBe(0);
    expect(root.state.y).toBe(0);
  });
});
