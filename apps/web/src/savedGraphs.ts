/** Saved-graph catalog backing the Dashboard. App-level demo data (not domain). */

export interface SavedGraph {
  id: string;
  name: string;
  /** Display date (YYYY-MM-DD). */
  generatedOn: string;
  generatedBy: string;
  isPrivate: boolean;
  nodeCount: number;
  /** Deterministic seed for the thumbnail layout. */
  seed: number;
}

export const SEED_SAVED_GRAPHS: SavedGraph[] = [
  { id: "sg-1", name: "Zloader Botnet 18 — US Targeting", generatedOn: "2026-06-04", generatedBy: "You", isPrivate: true, nodeCount: 28, seed: 1 },
  { id: "sg-2", name: "The Trick \"mac1\" — MS Excel docs", generatedOn: "2026-06-02", generatedBy: "You", isPrivate: false, nodeCount: 41, seed: 2 },
  { id: "sg-3", name: "O365 Credential Phish — July", generatedOn: "2026-05-30", generatedBy: "A. Okafor", isPrivate: false, nodeCount: 19, seed: 3 },
  { id: "sg-4", name: "TA505 Infrastructure Sweep", generatedOn: "2026-05-28", generatedBy: "You", isPrivate: true, nodeCount: 63, seed: 4 },
  { id: "sg-5", name: "BEC Wire-Fraud Cluster", generatedOn: "2026-05-24", generatedBy: "J. Smith", isPrivate: false, nodeCount: 34, seed: 5 },
  { id: "sg-6", name: "QakBot Distribution Run", generatedOn: "2026-05-21", generatedBy: "You", isPrivate: true, nodeCount: 22, seed: 6 },
  { id: "sg-7", name: "Compromised: rcastle@acme.com", generatedOn: "2026-05-19", generatedBy: "A. Okafor", isPrivate: false, nodeCount: 17, seed: 7 },
  { id: "sg-8", name: "Pikabot Loader Campaign", generatedOn: "2026-05-15", generatedBy: "You", isPrivate: true, nodeCount: 45, seed: 8 },
  { id: "sg-9", name: "Sender IP 204.11.56.48", generatedOn: "2026-05-12", generatedBy: "J. Smith", isPrivate: false, nodeCount: 12, seed: 9 },
  { id: "sg-10", name: "IcedID Follow-on Payloads", generatedOn: "2026-05-08", generatedBy: "You", isPrivate: true, nodeCount: 30, seed: 10 },
  { id: "sg-11", name: "Cobalt Strike Beacon Infra", generatedOn: "2026-05-05", generatedBy: "M. Reyes", isPrivate: false, nodeCount: 51, seed: 11 },
  { id: "sg-12", name: "Emotet Resurgence — Q2", generatedOn: "2026-05-01", generatedBy: "You", isPrivate: true, nodeCount: 38, seed: 12 },
];

/** YYYY-MM-DD for a freshly saved graph. */
export function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
