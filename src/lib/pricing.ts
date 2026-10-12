import { getTier, getVehicle, rates, type TierId } from "./catalog";

export interface QuoteInput {
  vehicleId: string | null;
  tier: TierId;
  distanceKm: number | null;
  tollEstimate: number;
  helpers: number;
  floors: number;
  trips: number;
  /** m³ from the load assistant, or null if the customer skipped it. */
  volumeM3: number | null;
  vatRegistered: boolean;
  vatRate: number;
}

export interface QuoteLine {
  label: string;
  amount: number;
}

export type QuoteStatus = "incomplete" | "ready" | "needs_review";

export interface QuoteResult {
  status: QuoteStatus;
  lines: QuoteLine[];
  subtotal: number;
  vat: number;
  total: number;
  /** 0..1. Below rates.autoApproveConfidence the quote is routed to a human. */
  confidence: number;
  /** Human-readable reasons shown to the customer and the approval queue. */
  reasons: string[];
}

const clampInt = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? Math.trunc(n) : min));
const round10 = (n: number) => Math.round(n / 10) * 10;

const EMPTY: QuoteResult = { status: "incomplete", lines: [], subtotal: 0, vat: 0, total: 0, confidence: 0, reasons: [] };

/**
 * Pure, deterministic price calculation with built-in circuit breakers:
 *  - hard floor (vehicle.minCharge) is always applied,
 *  - hard ceiling (vehicle.maxAutoQuote) and low confidence flip status to "needs_review",
 *  - a "ready" quote is still only an estimate: bookings are confirmed by a human.
 */
export function calculateQuote(input: QuoteInput): QuoteResult {
  const vehicle = getVehicle(input.vehicleId);
  const km = input.distanceKm;
  if (!vehicle || km == null || !Number.isFinite(km) || km <= 0) return EMPTY;

  const tier = getTier(input.tier);
  const trips = clampInt(input.trips, 1, 10);
  const helpers = clampInt(input.helpers, 0, 10);
  const floors = clampInt(input.floors, 0, 20);
  const reasons: string[] = [];
  let confidence = 1;
  const lines: QuoteLine[] = [];

  const transport = (vehicle.baseFee + vehicle.perKm * km) * trips;
  lines.push({
    label: `${vehicle.name}, ${Math.round(km)} km${trips > 1 ? ` x ${trips} trips` : ""}`,
    amount: transport,
  });

  if (input.tollEstimate > 0) lines.push({ label: "Estimated tolls", amount: input.tollEstimate });

  const crew = tier.crew + helpers;
  if (crew > 0) {
    const baseHours = input.volumeM3 != null ? input.volumeM3 * 0.3 : 2;
    const hours = Math.max(2, Math.round((baseHours + floors * 0.25 + km / 80) * 2) / 2);
    lines.push({
      label: `Crew: ${crew} x ${hours} h (estimate)`,
      amount: crew * hours * rates.crewHourly * trips,
    });
    if (floors > 0) lines.push({ label: `Stairs: ${floors} floor${floors > 1 ? "s" : ""}`, amount: floors * rates.stairFeePerFloor });
  }

  if (tier.packing) {
    if (input.volumeM3 != null && input.volumeM3 > 0) {
      lines.push({ label: "Packing and wrapping", amount: input.volumeM3 * rates.packingPerM3 });
    } else {
      confidence -= 0.3;
      reasons.push("Packing is priced from your inventory. Use the load assistant so we can price it.");
    }
  }

  let subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  if (subtotal < vehicle.minCharge) {
    lines.push({ label: "Minimum charge adjustment", amount: vehicle.minCharge - subtotal });
    subtotal = vehicle.minCharge;
  }
  subtotal = round10(subtotal);

  if (input.volumeM3 != null && input.volumeM3 > vehicle.capacityM3 * rates.loadEfficiency * trips) {
    confidence -= 0.4;
    reasons.push("Your inventory may not fit the selected truck and trips.");
  }
  if (trips > rates.maxAutoTrips) {
    confidence -= 0.3;
    reasons.push("A move this big needs several trips, so our team will confirm the plan with you.");
  }
  if (floors > rates.maxFloors) {
    confidence -= 0.2;
    reasons.push("Access with many floors needs a quick manual check.");
  }
  if (km > rates.longDistanceKm) {
    confidence -= 0.3;
    reasons.push("Routes this far outside Johannesburg are priced by our team.");
  }
  if (subtotal > vehicle.maxAutoQuote) {
    confidence = Math.min(confidence, 0.5);
    reasons.push("This quote is above our automatic limit and will be confirmed by our team.");
  }

  confidence = Math.max(0, Math.round(confidence * 100) / 100);
  const vat = input.vatRegistered ? Math.round(subtotal * input.vatRate) : 0;

  return {
    status: confidence >= rates.autoApproveConfidence ? "ready" : "needs_review",
    lines,
    subtotal,
    vat,
    total: subtotal + vat,
    confidence,
    reasons,
  };
}

export const formatZar = (n: number) => `R${Math.round(n).toLocaleString("en-ZA").replace(/ /g, " ")}`;
