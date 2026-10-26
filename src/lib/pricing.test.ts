import { isBookableDay, weekdayOf } from "./validation";
import { describe, expect, it } from "vitest";
import { calculateQuote, repeatPlan, type QuoteInput } from "./pricing";
import { promoActive } from "../config/promo";
import { getVehicle, recommendForVolume, recommendLoad, vehicles } from "./catalog";

const base: QuoteInput = {
  vehicleId: "h100_trailer",
  tier: "transport",
  distanceKm: 20,
  tollEstimate: 0,
  helpers: 0,
  floors: 0,
  trips: 1,
  volumeM3: null,
  vatRegistered: false,
  vatRate: 0.15,
};

describe("calculateQuote", () => {
  it("is incomplete without a vehicle or distance", () => {
    expect(calculateQuote({ ...base, vehicleId: null }).status).toBe("incomplete");
    expect(calculateQuote({ ...base, distanceKm: null }).status).toBe("incomplete");
    expect(calculateQuote({ ...base, distanceKm: 0 }).status).toBe("incomplete");
  });

  it("builds a ready quote from callout + distance + time", () => {
    const q = calculateQuote(base);
    expect(q.status).toBe("ready");
    expect(q.total).toBe(1490); // callout 900 + 12*20 km + 3.5 h x 100
    expect(q.lines.map((l) => l.amount)).toEqual([900, 240, 350]);
    expect(q.reasons).toEqual([]);
  });

  it("never goes below the hard price floor", () => {
    const q = calculateQuote({ ...base, vehicleId: "h100", distanceKm: 1 });
    expect(q.subtotal).toBeGreaterThanOrEqual(1200);
    expect(q.lines.find((l) => l.label.startsWith("Vehicle and driver"))?.amount).toBe(300); // 3 h minimum
  });

  it("charges the callout once and distance and drive time per trip", () => {
    const one = calculateQuote(base);
    const two = calculateQuote({ ...base, trips: 2 });
    expect(two.lines[0]?.amount).toBe(900);
    expect(two.lines[1]?.amount).toBe(480);
    expect(two.subtotal).toBe(1830);
    expect(two.subtotal).toBeGreaterThan(one.subtotal);
  });

  it("flags loads that are too heavy for the vehicle", () => {
    const light = calculateQuote({ ...base, vehicleId: "h100", volumeM3: 2, loadKg: 900 });
    const heavy = calculateQuote({ ...base, vehicleId: "h100", volumeM3: 2, loadKg: 1500 });
    expect(light.status).toBe("ready");
    expect(heavy.status).toBe("needs_review");
    expect(heavy.reasons.join(" ")).toMatch(/heavy/);
  });

  it("derives per-km rates from the diesel price", () => {
    expect(getVehicle("h100")?.perKm).toBe(10);
    expect(getVehicle("h100_trailer")?.perKm).toBe(12);
  });

  it("routes quotes above the automatic ceiling to a human", () => {
    const q = calculateQuote({ ...base, vehicleId: "h100", distanceKm: 400, trips: 3 });
    expect(q.status).toBe("needs_review");
    expect(q.confidence).toBeLessThanOrEqual(0.5);
  });

  it("sends moves needing many trips to a person", () => {
    expect(calculateQuote({ ...base, trips: 3 }).status).toBe("ready");
    expect(calculateQuote({ ...base, trips: 4 }).status).toBe("needs_review");
  });

  it("flags inventory that cannot fit", () => {
    const q = calculateQuote({ ...base, vehicleId: "h100", volumeM3: 20 });
    expect(q.status).toBe("needs_review");
  });

  it("flags full service without an inventory", () => {
    const q = calculateQuote({ ...base, tier: "full" });
    expect(q.status).toBe("needs_review");
  });

  it("adds VAT only when registered", () => {
    const q = calculateQuote({ ...base, vatRegistered: true });
    expect(q.vat).toBe(Math.round(q.subtotal * 0.15));
    expect(q.total).toBe(q.subtotal + q.vat);
  });

  it("sanitises absurd numeric input", () => {
    const q = calculateQuote({ ...base, trips: -5, helpers: 999, floors: Number.NaN });
    expect(Number.isFinite(q.total)).toBe(true);
  });
});

describe("recommendLoad", () => {
  it("adds trips when a dense load exceeds the weight limit", () => {
    const r = recommendLoad({ "fridge-double": 6, "freezer-chest": 4, safe: 4 });
    expect(r.loadKg).toBeGreaterThan(2085 * 0.9);
    expect(r.trips).toBeGreaterThanOrEqual(1);
  });

  it("returns no vehicle for an empty inventory", () => {
    expect(recommendLoad({}).vehicleId).toBeNull();
  });

  it("sizes the two classes from the 1.3 ton bakkie and trailer", () => {
    const bk = vehicles.find((v) => v.id === "h100")!;
    const combo = vehicles.find((v) => v.id === "h100_trailer")!;
    expect(bk.capacityM3).toBe(3.6);
    expect(combo.capacityM3).toBeGreaterThan(bk.capacityM3);
    expect(vehicles).toHaveLength(2);
  });

  it("picks the smallest vehicle that fits", () => {
    expect(recommendLoad({ "box-medium": 5 }).vehicleId).toBe("h100");
    expect(recommendLoad({ "queen-bed": 1, "sofa-3": 1, "fridge-double": 1, "dining-6": 1 }).vehicleId).toBe("h100_trailer");
    const bigger = recommendLoad({ "queen-bed": 1, "sofa-3": 1, "fridge-double": 1, "dining-6": 1, "wardrobe-large": 1 });
    expect(bigger.vehicleId).toBe("h100_trailer");
    expect(bigger.trips).toBe(2);
  });

  it("uses multiple trips when the biggest truck is not enough", () => {
    const r = recommendLoad({ "sofa-l": 30 });
    expect(r.vehicleId).toBe(vehicles[vehicles.length - 1]!.id);
    expect(r.trips).toBeGreaterThan(1);
  });
});

describe("crew, deposit and booking days", () => {
  it("never sends more than two movers, and the deposit is half the total", () => {
    const q = calculateQuote({ ...base, tier: "full", helpers: 5, volumeM3: 3 });
    const crewLine = q.lines.find((l) => l.label.startsWith("Crew"))!;
    expect(crewLine.label).toContain("2 people");
    expect(q.deposit).toBe(Math.round((q.total * 0.5) / 10) * 10);
  });
  it("only accepts future Sundays", () => {
    expect(weekdayOf("2026-10-18")).toBe(0);
    expect(isBookableDay("2026-10-18", "2026-10-15", [0])).toBe(true);
    expect(isBookableDay("2026-10-19", "2026-10-15", [0])).toBe(false);
    expect(isBookableDay("2026-10-11", "2026-10-15", [0])).toBe(false);
  });
});

describe("moving within a complex", () => {
  const complex = (volume: number, o: Partial<QuoteInput> = {}) => {
    const rec = recommendForVolume(volume);
    return calculateQuote({
      ...base, mode: "complex", distanceKm: null, vehicleId: rec.vehicleId, tier: "transport", trips: rec.trips,
      volumeM3: volume, loadKg: rec.loadKg, walk: "same", ...o,
    });
  };

  it("prices a few items with no crew at the minimum", () => {
    const q = complex(3);
    expect(q.total).toBe(450); // R250 callout + 2 h x R100
    expect(q.status).toBe("ready");
  });

  it("prices a one-bedroom flat with two movers across the complex", () => {
    expect(complex(6, { tier: "loading", walk: "across" }).total).toBe(970); // 250 + 3 h x 100 + 2 x 3 h x 70
  });

  it("prices a two-bedroom flat over two trips with stairs", () => {
    const q = complex(12, { tier: "loading", walk: "across", floors: 1 });
    expect(q.total).toBe(1540); // 250 + 5 h x 100 + 2 x 5 h x 70 + R90 stairs
  });

  it("needs no distance and is cheaper than the standard price for the same job", () => {
    const standard = calculateQuote({ ...base, vehicleId: "h100_trailer", tier: "loading", distanceKm: 5, volumeM3: 6, loadKg: 900 });
    expect(complex(6, { tier: "loading" }).total).toBeLessThan(standard.total);
  });
});

describe("launch offer and discounts", () => {
  const off = { label: "Launch offer", percent: 20, maxAmount: 500 };
  it("takes 20% off and charges the deposit on the discounted price", () => {
    const full = calculateQuote(base);
    const q = calculateQuote({ ...base, discount: off });
    expect(q.discount).toBe(300); // 20% of R1,490, to the nearest R10
    expect(q.total).toBe(full.total - 300);
    expect(q.originalTotal).toBe(full.total);
    expect(q.deposit).toBe(Math.round((q.total * 0.5) / 10) * 10);
    expect(q.lines.at(-1)).toEqual({ label: "Launch offer", amount: -300 });
  });
  it("caps the discount at R500", () => {
    const q = calculateQuote({ ...base, tier: "loading", distanceKm: 40, volumeM3: 6, loadKg: 900, discount: off });
    expect(q.discount).toBe(500);
  });
  it("applies VAT after the discount", () => {
    const q = calculateQuote({ ...base, vatRegistered: true, discount: off });
    expect(q.vat).toBe(Math.round(q.subtotal * 0.15));
  });
  it("is on until 31 December and off after, or when disabled", () => {
    expect(promoActive("2026-10-26")).toBe(true);
    expect(promoActive("2026-12-31")).toBe(true);
    expect(promoActive("2027-01-01")).toBe(false);
    expect(promoActive("")).toBe(false);
  });
});

describe("repeat delivery plans", () => {
  it("gives 10% off weekly, 5% fortnightly and nothing monthly", () => {
    expect(repeatPlan(1300, "weekly")).toEqual({ runsPerMonth: 4, discountPercent: 10, perRun: 1170, monthly: 4680 });
    expect(repeatPlan(1300, "fortnightly")).toMatchObject({ perRun: 1240, monthly: 2480 });
    expect(repeatPlan(1300, "monthly")).toMatchObject({ perRun: 1300, monthly: 1300 });
  });
});
