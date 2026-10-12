import { describe, expect, it } from "vitest";
import { calculateQuote, type QuoteInput } from "./pricing";
import { recommendLoad, vehicles } from "./catalog";

const base: QuoteInput = {
  vehicleId: "t1_5",
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

  it("builds a ready quote from base fee + distance", () => {
    const q = calculateQuote(base);
    expect(q.status).toBe("ready");
    expect(q.total).toBe(870); // 650 + 11*20
    expect(q.reasons).toEqual([]);
  });

  it("never goes below the hard price floor", () => {
    const q = calculateQuote({ ...base, vehicleId: "h1", distanceKm: 1 });
    expect(q.subtotal).toBe(600);
  });

  it("multiplies transport by trips", () => {
    const one = calculateQuote(base).subtotal;
    const two = calculateQuote({ ...base, trips: 2 }).subtotal;
    expect(two).toBe(one * 2);
  });

  it("routes quotes above the automatic ceiling to a human", () => {
    const q = calculateQuote({ ...base, vehicleId: "h1", distanceKm: 400, trips: 3 });
    expect(q.status).toBe("needs_review");
    expect(q.confidence).toBeLessThanOrEqual(0.5);
  });

  it("flags inventory that cannot fit", () => {
    const q = calculateQuote({ ...base, vehicleId: "h1", volumeM3: 20 });
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
  it("returns no vehicle for an empty inventory", () => {
    expect(recommendLoad({}).vehicleId).toBeNull();
  });

  it("sizes the first two classes from the Hyundai H1 van and trailer", () => {
    const h1 = vehicles.find((v) => v.id === "h1")!;
    const combo = vehicles.find((v) => v.id === "h1_trailer")!;
    expect(h1.capacityM3).toBe(4.3);
    expect(combo.capacityM3).toBeGreaterThan(h1.capacityM3);
    expect(combo.capacityM3).toBeLessThan(vehicles.find((v) => v.id === "t1_5")!.capacityM3);
  });

  it("picks the smallest vehicle that fits", () => {
    expect(recommendLoad({ "box-medium": 5 }).vehicleId).toBe("h1");
    expect(recommendLoad({ "queen-bed": 1, "sofa-3": 1, "fridge-double": 1, "dining-6": 1 }).vehicleId).toBe("h1_trailer");
    expect(recommendLoad({ "queen-bed": 1, "sofa-3": 1, "fridge-double": 1, "dining-6": 1, "wardrobe-large": 1 }).vehicleId).toBe("t1_5");
  });

  it("uses multiple trips when the biggest truck is not enough", () => {
    const r = recommendLoad({ "sofa-l": 30 });
    expect(r.vehicleId).toBe(vehicles[vehicles.length - 1]!.id);
    expect(r.trips).toBeGreaterThan(1);
  });
});
