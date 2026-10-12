import { describe, expect, it } from "vitest";
import { calculateQuote, type QuoteInput } from "./pricing";
import { recommendLoad, vehicles } from "./catalog";

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

  it("builds a ready quote from base fee + distance", () => {
    const q = calculateQuote(base);
    expect(q.status).toBe("ready");
    expect(q.total).toBe(750); // 550 + 10*20
    expect(q.reasons).toEqual([]);
  });

  it("never goes below the hard price floor", () => {
    const q = calculateQuote({ ...base, vehicleId: "h100", distanceKm: 1 });
    expect(q.subtotal).toBe(600);
  });

  it("multiplies transport by trips", () => {
    const one = calculateQuote(base).subtotal;
    const two = calculateQuote({ ...base, trips: 2 }).subtotal;
    expect(two).toBe(one * 2);
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
  it("returns no vehicle for an empty inventory", () => {
    expect(recommendLoad({}).vehicleId).toBeNull();
  });

  it("sizes the two classes from the H100 bakkie and trailer", () => {
    const bk = vehicles.find((v) => v.id === "h100")!;
    const combo = vehicles.find((v) => v.id === "h100_trailer")!;
    expect(bk.capacityM3).toBe(2.9);
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

describe("fleet showcase example loads", () => {
  it("fit the vehicle they are shown against", async () => {
    const { bakkieLoad, comboLoad } = await import("../components/fleet/FleetShowcase");
    expect(recommendLoad(bakkieLoad).vehicleId).toBe("h100");
    expect(recommendLoad(comboLoad).vehicleId).toBe("h100_trailer");
    expect(recommendLoad(comboLoad).trips).toBe(1);
  });
});
