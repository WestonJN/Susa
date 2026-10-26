import { site } from "../config/site";

/**
 * Contract between the website and the orchestrator gateway.
 * POST {apiBase}/v1/quote-requests  (JSON). The gateway authenticates the origin, rate-limits,
 * re-validates, stores PII in POPIA-compliant storage and queues the request for the
 * Lead Generation agent -> Quoting agent -> CEO Agent approval queue.
 */
export interface QuoteRequestV1 {
  schemaVersion: 1;
  idempotencyKey: string;
  /** Type of request. Older clients omit it, which means "standard". */
  kind?: "standard" | "complex" | "repeat";
  /** Moves within one complex: the units and the carry distance. */
  complex?: { unitFrom: string; unitTo: string; walk: string };
  /** Repeat delivery plans. */
  repeat?: { frequency: string; goods: string; runsPerMonth: number; monthlyEstimate: number };
  route: {
    pickup: string;
    dropoff: string;
    pickupPoint: { lat: number; lon: number } | null;
    dropoffPoint: { lat: number; lon: number } | null;
    distanceKm: number;
    tollEstimate: number;
  };
  load: {
    vehicleId: string;
    tier: string;
    trips: number;
    helpers: number;
    floors: number;
    volumeM3: number | null;
    items: Record<string, number>;
  };
  schedule: { date: string; window: string };
  estimate: { total: number; status: string; confidence: number; reasons: string[]; discount?: { label: string; amount: number } | null };
  contact: { name: string; phone: string; email: string | null };
  consent: { privacyNoticeVersion: string; acceptedAt: string };
  /** Honeypot: must be empty. */
  website: string;
}

export type SubmitResult =
  | { ok: true; reference: string }
  | { ok: false; reason: "not_configured" | "rejected" | "network" };

export async function submitQuoteRequest(payload: QuoteRequestV1): Promise<SubmitResult> {
  if (!site.apiBase) return { ok: false, reason: "not_configured" };
  try {
    const res = await fetch(`${site.apiBase}/v1/quote-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": payload.idempotencyKey },
      body: JSON.stringify(payload),
      credentials: "omit",
      referrerPolicy: "strict-origin",
    });
    if (!res.ok) return { ok: false, reason: "rejected" };
    const data = (await res.json()) as { reference?: unknown };
    return { ok: true, reference: typeof data.reference === "string" ? data.reference : "pending" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export function newIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
