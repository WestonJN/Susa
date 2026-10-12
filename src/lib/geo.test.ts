import { describe, expect, it } from "vitest";
import { buildLabel, haversineKm, inJohannesburg, parsePhoton } from "./geo";

describe("inJohannesburg", () => {
  it("accepts Johannesburg suburbs and rejects other cities", () => {
    expect(inJohannesburg(-26.1076, 28.0567)).toBe(true); // Sandton
    expect(inJohannesburg(-26.2041, 28.0473)).toBe(true); // CBD
    expect(inJohannesburg(-25.7479, 28.2293)).toBe(false); // Pretoria
    expect(inJohannesburg(-26.7145, 27.097)).toBe(false); // Potchefstroom
  });
});

describe("haversineKm", () => {
  it("is about 11 km from Sandton to the CBD", () => {
    const km = haversineKm({ lat: -26.1076, lon: 28.0567 }, { lat: -26.2041, lon: 28.0473 });
    expect(km).toBeGreaterThan(10);
    expect(km).toBeLessThan(12);
  });
});

describe("buildLabel", () => {
  it("joins parts, dedupes and skips blanks", () => {
    expect(buildLabel({ housenumber: "12", street: "Jan Smuts Avenue", district: "Parktown", city: "Johannesburg", postcode: "2193" })).toBe(
      "12 Jan Smuts Avenue, Parktown, Johannesburg, 2193",
    );
    expect(buildLabel({ name: "Rosebank", locality: "Rosebank", city: "Johannesburg" })).toBe("Rosebank, Johannesburg");
  });
});

describe("parsePhoton", () => {
  const feature = (lon: number, lat: number, props: Record<string, unknown>) => ({ geometry: { coordinates: [lon, lat] }, properties: props });
  it("keeps only South African results inside Johannesburg and dedupes", () => {
    const json = {
      features: [
        feature(28.05, -26.14, { street: "Oxford Road", city: "Johannesburg", countrycode: "ZA" }),
        feature(28.05, -26.14, { street: "Oxford Road", city: "Johannesburg", countrycode: "ZA" }),
        feature(28.22, -25.75, { street: "Church Street", city: "Pretoria", countrycode: "ZA" }),
        feature(28.05, -26.14, { street: "Oxford Road", city: "Somewhere", countrycode: "GB" }),
        { properties: {} },
      ],
    };
    const out = parsePhoton(json);
    expect(out).toHaveLength(1);
    expect(out[0]?.label).toBe("Oxford Road, Johannesburg");
  });
  it("returns an empty list for junk", () => {
    expect(parsePhoton(null)).toEqual([]);
    expect(parsePhoton({ features: "x" })).toEqual([]);
  });
});
