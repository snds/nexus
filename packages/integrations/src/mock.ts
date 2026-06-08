/**
 * MOCK adapters — implement the domain ports against an in-memory "universe" drawn from
 * the legacy flows (Zloader / The Trick).
 *
 * The universe is a TREE rooted at the "Zloader Botnet 18" campaign. Each layer-1 child
 * roots its OWN attack-path branch that runs three layers deep (child → grandchild →
 * great-grandchild). Expansion walks one branch at a time. Every node carries a
 * `childCount` so the canvas can show how many children remain unexpanded, plus per-type
 * forensic `attrs` and a `neighborCounts` breakdown for the detail pane.
 *
 * Swap for real TAP/Splunk/PTR adapters later; nothing above this package changes.
 */

import type {
  Entity,
  EntityType,
  GraphFragment,
  Ports,
  Relationship,
  RelationshipKind,
  RemediationPort,
  SplunkPort,
  ThreatDataPort,
  ThreatIntelPort,
  ExpandOptions,
  UserProfile,
} from "@nexus/domain";

let seq = 0;
const id = (p: string) => `${p}-${++seq}`;
const E = (e: Omit<Entity, "id"> & { id?: string }): Entity => ({ id: e.id ?? id(e.type), ...e });

export const ROOT_ID = "camp-zloader18";

/* ── per-type forensic attributes for the detail pane (dummy, sketch-inspired) ────────── */
const TYPE_ATTRS: Partial<Record<EntityType, Record<string, string>>> = {
  campaign: { Family: "Zloader", Vector: "Malspam → macro", Geo: "United States", Status: "Active" },
  actor: { Aliases: "Hive0030, Gold Cabin", Origin: "Unknown", "Active Since": "2017" },
  malware: { Family: "Zloader", Category: "Banking Trojan", Platform: "Windows" },
  exploit: { CVE: "CVE-2021-40444", CVSS: "8.8 (High)", Component: "MSHTML" },
  sid: { Engine: "ETPRO", Signature: "2034567", Severity: "High" },
  scan: { Engine: "Sandbox v4", Verdict: "Suspicious", Duration: "42s" },
  hash: { "File Type": "PE, Office", "File Size": "45.45 KB", Delivered: "Yes", "AV Detections": "54 / 72" },
  url: { Scheme: "http", Status: "Active", Categories: "Malware, C2" },
  domain: { Registrar: "NameCheap", Created: "2024-06-28", "Name Servers": "ns1.theguloen.com" },
  ip: { ASN: "AS14061 (DigitalOcean)", Country: "US", "Open Ports": "80, 443, 8080" },
  hostname: { Record: "A", "Resolves To": "204.11.56.48", TTL: "300s" },
  filename: { "File Type": "Office Document", "File Size": "112 KB", Path: "%TEMP%\\Invoice_4471.doc" },
  // email_address uses a full userProfile (below) instead of flat forensics.
  prs_message: { Subject: "Your Invoice #4471", Sender: "billing@theguloen[.]com", Delivered: "Yes", Rewritten: "No" },
};

/* ── identity profiles for the user-node traversal flow ───────────────────────────────── */
const USER_PROFILES: Record<string, UserProfile> = {
  "email-rcastle": {
    displayName: "Rebecca Castle",
    title: "AP Manager",
    company: "Acme Industries",
    department: "Finance",
    location: "Sunnyvale, CA · US",
    atRisk: true,
    emails: ["rcastle@acme.com", "r.castle@acme.com"],
    cloudServices: ["Office 365", "Salesforce", "Dropbox", "Box"],
    stats: { dlpViolations: 0, suspiciousLogins: 2, phishingAttempts: 5 },
    similarUsers: [
      { name: "Javier Esposito", email: "jesposito@acme.com" },
      { name: "Katherine Beckett", email: "kbeckett@acme.com" },
      { name: "Kevin Ryan", email: "kryan@acme.com" },
      { name: "Roy Montgomery", email: "rmontgomery@acme.com" },
      { name: "Lanie Parish", email: "lparish@acme.com" },
      { name: "Victoria Gates", email: "vgates@acme.com" },
    ],
  },
  "email-jsmith": {
    displayName: "Jordan Smith",
    title: "Software Engineer",
    company: "Acme Industries",
    department: "R&D",
    location: "Austin, TX · US",
    emails: ["jsmith@acme.com"],
    cloudServices: ["Office 365", "GitHub", "Slack"],
    stats: { dlpViolations: 1, suspiciousLogins: 0, phishingAttempts: 2 },
    similarUsers: [
      { name: "Priya Nair", email: "pnair@acme.com" },
      { name: "Marcus Hale", email: "mhale@acme.com" },
      { name: "Dana Cole", email: "dcole@acme.com" },
    ],
  },
};

/* ── entities (one+ of every type; tree positions assigned by TREE below) ──────────────── */
const UNIVERSE_ENTITIES: Entity[] = [
  // root + layer-1 heads
  { id: "camp-zloader18", type: "campaign", label: "Zloader Botnet 18 (US Targeting)", verdict: "malicious", score: 95, usersAtRisk: 36, firstSeen: "2024-07-02", lastSeen: "2024-09-20" },
  { id: "actor-ta511", type: "actor", label: "TA511", verdict: "malicious", firstSeen: "2017-01-04", lastSeen: "2024-09-22" },
  { id: "mw-zloader", type: "malware", label: "Zloader", verdict: "malicious", score: 96, lastSeen: "2024-09-19" },
  { id: "email-rcastle", type: "email_address", label: "rcastle@acme.com", verdict: "medium", usersAtRisk: 1, vip: true, status: "impacted" },
  { id: "email-jsmith", type: "email_address", label: "jsmith@acme.com", verdict: "medium", status: "at_risk" },
  // actor branch
  { id: "camp-o365", type: "campaign", label: "O365 Credential Phish — Jul", verdict: "phishing", score: 84, usersAtRisk: 20, firstSeen: "2024-07-15" },
  { id: "exp-mshtml", type: "exploit", label: "CVE-2021-40444 · MSHTML RCE", verdict: "malicious", score: 90 },
  { id: "mw-thetrick", type: "malware", label: "The Trick", verdict: "malicious", score: 93 },
  { id: "dom-bad", type: "domain", label: "bad.domain.com", verdict: "suspicious", score: 72, imposter: true },
  { id: "actor-ta505", type: "actor", label: "TA505", verdict: "malicious", firstSeen: "2014-08-11" },
  { id: "sid-zloader", type: "sid", label: "ETPRO MALWARE Zloader CnC (2034567)", verdict: "malicious" },
  // malware branch
  { id: "hash-root", type: "hash", label: "7d47c926…b5010", verdict: "malicious", score: 98, usersAtRisk: 12, firstSeen: "2024-07-03" },
  { id: "dom-theguloen", type: "domain", label: "theguloen.com", verdict: "malicious", score: 88 },
  { id: "url-gate", type: "url", label: "hxxp://theguloen[.]com/bdl/gate.php", verdict: "malicious", score: 90 },
  { id: "file-exe", type: "filename", label: "a18ca400.exe", verdict: "malicious", score: 92 },
  { id: "scan-attach", type: "scan", label: "Attachment Sandbox Scan", verdict: "suspicious" },
  { id: "ip-204", type: "ip", label: "204.11.56.48", verdict: "suspicious", score: 64 },
  { id: "host-1", type: "hostname", label: "hostname1.com", verdict: "suspicious", score: 55 },
  { id: "ip-13", type: "ip", label: "13.58.0.45", verdict: "medium", score: 48 },
  { id: "host-akadns", type: "hostname", label: "time.microsoft.akadns.net", verdict: "benign", score: 8 },
  // rcastle branch
  { id: "msg-invoice", type: "prs_message", label: "Subject: Your Invoice #4471", verdict: "phishing", score: 81 },
  { id: "file-invoice", type: "filename", label: "Invoice_4471.doc", verdict: "malicious", score: 89 },
  { id: "url-kill", type: "url", label: "hxxp://bornonthescene[.]com/kill.php", verdict: "malicious", score: 86 },
  { id: "hash-doc", type: "hash", label: "a18ca400…41244", verdict: "malicious", score: 91 },
  // jsmith branch
  { id: "msg-jsmith", type: "prs_message", label: "Subject: Shared document", verdict: "suspicious", score: 58 },
  { id: "file-payload", type: "filename", label: "Document.scr", verdict: "malicious", score: 87 },
  { id: "dom-jsmith", type: "domain", label: "sharedoc-online.com", verdict: "suspicious", score: 60 },
];

/* ── the attack-path TREE: [parent, child, relationship] (directed root → outward) ──────── */
const TREE: [parent: string, child: string, kind: RelationshipKind][] = [
  // root → layer 1
  ["camp-zloader18", "actor-ta511", "associated"],
  ["camp-zloader18", "mw-zloader", "delivers"],
  ["camp-zloader18", "email-rcastle", "targets"],
  ["camp-zloader18", "email-jsmith", "targets"],
  // actor branch (3 deep)
  ["actor-ta511", "camp-o365", "runs"],
  ["actor-ta511", "exp-mshtml", "uses"],
  ["camp-o365", "mw-thetrick", "delivers"],
  ["camp-o365", "dom-bad", "contacts"],
  ["camp-o365", "actor-ta505", "associated"],
  ["exp-mshtml", "sid-zloader", "detected_by"],
  // malware branch (3 deep)
  ["mw-zloader", "hash-root", "carries"],
  ["mw-zloader", "dom-theguloen", "contacts"],
  ["mw-zloader", "url-gate", "contacts"],
  ["hash-root", "file-exe", "associated"],
  ["hash-root", "scan-attach", "detected_by"],
  ["dom-theguloen", "ip-204", "contacts"],
  ["dom-theguloen", "host-1", "associated"],
  ["url-gate", "ip-13", "contacts"],
  ["url-gate", "host-akadns", "associated"],
  // rcastle branch (3 deep)
  ["email-rcastle", "msg-invoice", "carries"],
  ["msg-invoice", "file-invoice", "carries"],
  ["msg-invoice", "url-kill", "carries"],
  ["msg-invoice", "hash-doc", "carries"],
  // jsmith branch (3 deep)
  ["email-jsmith", "msg-jsmith", "carries"],
  ["msg-jsmith", "file-payload", "carries"],
  ["msg-jsmith", "dom-jsmith", "contacts"],
];

const UNIVERSE_RELS: Relationship[] = TREE.map(([source, target, kind]) => ({
  id: `t-${source}__${target}`,
  source,
  target,
  kind,
  directed: true,
}));

// Attach derived fields once: forensic attrs (by type) + childCount (tree out-degree) +
// user profiles (identity nodes).
for (const e of UNIVERSE_ENTITIES) {
  const a = TYPE_ATTRS[e.type];
  if (a) e.attrs = a;
  const profile = USER_PROFILES[e.id];
  if (profile) e.userProfile = profile;
  e.childCount = TREE.filter(([p]) => p === e.id).length;
}

function lookup(entityId: string): Entity | null {
  return UNIVERSE_ENTITIES.find((e) => e.id === entityId) ?? null;
}

/** Children of a node grouped by entity type → the detail pane "Neighbor Nodes" list. */
function neighborCountsOf(entityId: string): Partial<Record<EntityType, number>> {
  const out: Partial<Record<EntityType, number>> = {};
  for (const [parent, child] of TREE) {
    if (parent !== entityId) continue;
    const t = lookup(child)?.type;
    if (t) out[t] = (out[t] ?? 0) + 1;
  }
  return out;
}

/** All universe neighbors of a node (parent + children) as an addable fragment. */
function neighborsOf(entityId: string): GraphFragment {
  const rels = UNIVERSE_RELS.filter((r) => r.source === entityId || r.target === entityId);
  const neighborIds = new Set<string>();
  for (const r of rels) {
    neighborIds.add(r.source);
    neighborIds.add(r.target);
  }
  neighborIds.delete(entityId);
  return { entities: UNIVERSE_ENTITIES.filter((e) => neighborIds.has(e.id)), relationships: rels };
}

/** Seed graph: the root campaign + its immediate (layer-1) attack-path heads. */
export function seedGraph(): GraphFragment {
  const level1 = neighborsOf(ROOT_ID);
  return { entities: [lookup(ROOT_ID)!, ...level1.entities], relationships: level1.relationships };
}

const delay = <T>(v: T, ms = 420): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms));

const tap: ThreatDataPort = {
  async search(query) {
    const q = query.toLowerCase();
    return delay(UNIVERSE_ENTITIES.filter((e) => e.label.toLowerCase().includes(q)));
  },
  async getEntity(entityId) {
    const e = lookup(entityId);
    return delay(e ? { ...e, neighborCounts: neighborCountsOf(entityId) } : null);
  },
  async expand(entityId, _opts?: ExpandOptions) {
    return delay(neighborsOf(entityId));
  },
  async transform(transformId, entityId) {
    if (transformId === "related-iocs") {
      // IOC scan — attach a sandbox scan node + a curated IOC set to the target.
      const scan = E({ id: `scan-ioc-${entityId}`, type: "scan", label: "IOC Sandbox Scan", verdict: "suspicious" });
      const iocs = ["hash-doc", "url-kill", "file-exe", "ip-13"].map((i) => lookup(i)!).filter(Boolean);
      return delay({
        entities: [scan, ...iocs],
        relationships: [
          { id: `ioc-${entityId}-${scan.id}`, source: entityId, target: scan.id, kind: "associated", directed: true },
          ...iocs.map((e) => ({ id: `ioc-${entityId}-${e.id}`, source: entityId, target: e.id, kind: "associated" as const, directed: true })),
        ],
      });
    }
    // attacker-infrastructure — reveal C2 domain/ip/hostname.
    const infra = ["dom-theguloen", "ip-204", "host-akadns"].map((i) => lookup(i)!).filter(Boolean);
    return delay({
      entities: infra,
      relationships: infra.map((e) => ({ id: `infra-${entityId}-${e.id}`, source: entityId, target: e.id, kind: "contacts" as const, directed: true })),
    });
  },
};

const SPLUNK_VICTIMS = ["tcooke@acme.com", "dwallace@acme.com", "mgarcia@acme.com", "bferris@acme.com"];
const splunk: SplunkPort = {
  async query(_queryId, entityIds) {
    // A fresh "user who clicked" each run, so results visibly join the graph.
    const user = E({
      id: `splunk-user-${++seq}`,
      type: "email_address",
      label: SPLUNK_VICTIMS[seq % SPLUNK_VICTIMS.length]!,
      verdict: "medium",
      usersAtRisk: 1,
    });
    return delay({
      entities: [user],
      relationships: entityIds.map((eid) => ({ id: `splunk-${eid}-${user.id}`, source: eid, target: user.id, kind: "targets" as const, directed: true })),
    });
  },
};

const ptr: RemediationPort = { async addIndicators(ids) { await delay(ids); } };
const threatIntel: ThreatIntelPort = { async enrich(ids) { await delay(ids); } };

export const mockPorts: Ports = { tap, splunk, ptr, threatIntel };
