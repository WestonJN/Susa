/**
 * Fleet, service tiers and household item catalogue.
 *
 * !! Every rate below is a PLACEHOLDER for the Chairman to set before launch. !!
 * They exist so the quote flow, guardrails and tests are real. Prices are ZAR.
 */

export type VehicleId = "h100" | "h100_trailer";
export type TierId = "transport" | "loading" | "full";

export interface Vehicle {
  id: VehicleId;
  name: string;
  tonnage: string;
  bestFor: string;
  /** Plain-language size line shown on the truck card. */
  spec: string;
  /** Usable cargo volume in m³ (before packing-efficiency allowance). */
  capacityM3: number;
  baseFee: number;
  perKm: number;
  /** Hard price floor: no automatic quote goes below this. */
  minCharge: number;
  /** Hard ceiling: automatic quotes above this go to a human. */
  maxAutoQuote: number;
}

/**
 * Sizing is anchored on the vehicle we run today: a Hyundai H100 dropside bakkie plus a closed
 * medium trailer. These dimensions are ASSUMPTIONS (typical for the class), not measurements:
 * measure the real deck and trailer and change the numbers below. Everything else follows.
 * Add bigger classes here only when you actually own or partner for them.
 */
export const BAKKIE_DECK = { lengthM: 2.3, widthM: 1.6, loadHeightM: 0.8 } as const;
export const TRAILER_BOX = { lengthM: 2.4, widthM: 1.3, heightM: 1.0 } as const;
const round1 = (n: number) => Math.round(n * 10) / 10;
export const H100_M3 = round1(BAKKIE_DECK.lengthM * BAKKIE_DECK.widthM * BAKKIE_DECK.loadHeightM);
export const TRAILER_M3 = round1(TRAILER_BOX.lengthM * TRAILER_BOX.widthM * TRAILER_BOX.heightM);

export const vehicles: readonly Vehicle[] = [
  {
    id: "h100",
    name: "Hyundai H100 bakkie",
    tonnage: "1.3 ton",
    bestFor: "A few items, a student room or large appliances. The open dropside makes tall and awkward items easy to load.",
    spec: `Open dropside, about ${H100_M3} m³ of load space`,
    capacityM3: H100_M3,
    baseFee: 450,
    perKm: 9,
    minCharge: 600,
    maxAutoQuote: 3500,
  },
  {
    id: "h100_trailer",
    name: "H100 bakkie with trailer",
    tonnage: "Bakkie towing a closed box trailer",
    bestFor: "One-bedroom homes and bulky furniture. The closed trailer is specifically designed for furniture transport and protects your things from the weather.",
    spec: `Bakkie and closed trailer, about ${(H100_M3 + TRAILER_M3).toFixed(1)} m³ in total`,
    capacityM3: H100_M3 + TRAILER_M3,
    baseFee: 550,
    perKm: 10,
    minCharge: 750,
    maxAutoQuote: 4000,
  },
] as const;

export function getVehicle(id: string | null | undefined): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

export interface Tier {
  id: TierId;
  name: string;
  summary: string;
  /** Crew members included with the tier (on top of any extra helpers). */
  crew: number;
  packing: boolean;
}

export const tiers: readonly Tier[] = [
  {
    id: "transport",
    name: "Transport only",
    summary: "Vehicle and driver. You load and unload, or bring your own helpers.",
    crew: 0,
    packing: false,
  },
  {
    id: "loading",
    name: "Transport + loading crew",
    summary: "Vehicle, driver and a two-person crew to load and unload.",
    crew: 2,
    packing: false,
  },
  {
    id: "full",
    name: "Full service",
    summary: "Vehicle, driver and a three-person crew, plus packing, wrapping and dismantling.",
    crew: 3,
    packing: true,
  },
] as const;

export function getTier(id: string): Tier {
  return tiers.find((t) => t.id === id) ?? tiers[0]!;
}

export const rates = {
  crewHourly: 120,
  stairFeePerFloor: 90,
  packingPerM3: 85,
  /** Share of a vehicle's capacity we treat as realistically loadable. */
  loadEfficiency: 0.85,
  /** Confidence below this routes the quote to a human. */
  autoApproveConfidence: 0.8,
  /** More trips than this and a person confirms the plan (big moves with a small van). */
  maxAutoTrips: 3,
  /** Beyond this road distance the route is treated as outside Johannesburg and priced by a person. */
  longDistanceKm: 60,
  maxFloors: 4,
} as const;

export interface CatalogItem {
  id: string;
  label: string;
  m3: number;
  heavy?: boolean;
}
export interface ItemGroup {
  id: string;
  label: string;
  items: CatalogItem[];
}

const i = (id: string, label: string, m3: number, heavy = false): CatalogItem => ({ id, label, m3, heavy });

/** Rough volumes, good enough to pick a truck. Final sizing is confirmed by our team. */
export const itemGroups: readonly ItemGroup[] = [
  {
    id: "bedroom",
    label: "Bedroom",
    items: [
      i("single-bed", "Single bed", 0.6),
      i("double-bed", "Double bed", 0.9),
      i("queen-bed", "Queen bed", 1.1),
      i("king-bed", "King bed", 1.3),
      i("wardrobe-small", "Small wardrobe", 0.8),
      i("wardrobe-large", "Large wardrobe", 1.6, true),
      i("drawers", "Chest of drawers", 0.5),
      i("headboard", "Headboard", 0.2),
      i("pedestal", "Pedestal", 0.1),
      i("bookshelf", "Bookshelf", 0.5),
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen and laundry",
    items: [
      i("fridge-single", "Single-door fridge", 0.6, true),
      i("fridge-double", "Double-door fridge", 1.2, true),
      i("freezer-chest", "Chest freezer", 0.8, true),
      i("freezer-upright", "Upright freezer", 0.9, true),
      i("washing-machine", "Washing machine", 0.5, true),
      i("dishwasher", "Dishwasher", 0.4),
      i("stove", "Stove / oven", 0.5, true),
      i("microwave", "Microwave", 0.1),
      i("dryer", "Tumble dryer", 0.5),
      i("appliance-box", "Small appliances box", 0.1),
    ],
  },
  {
    id: "living",
    label: "Living and dining",
    items: [
      i("sofa-1", "1-seater sofa", 0.6),
      i("sofa-2", "2-seater sofa", 1.1),
      i("sofa-3", "3-seater sofa", 1.6),
      i("sofa-l", "L-shaped sofa", 2.6, true),
      i("recliner", "Recliner chair", 0.8),
      i("coffee-table", "Coffee table", 0.3),
      i("tv-stand", "TV stand", 0.4),
      i("wall-unit", "Entertainment / wall unit", 1.5, true),
      i("tv-large", "Large TV", 0.2),
      i("dining-4", "Dining table (4-seater)", 0.8),
      i("dining-6", "Dining table (6-seater)", 1.1),
      i("dining-8", "Dining table (8-seater)", 1.5),
      i("dining-chair", "Dining chair", 0.2),
      i("buffet", "Server / buffet cabinet", 0.8),
      i("display-cabinet", "Display / glass cabinet", 0.8),
    ],
  },
  {
    id: "office",
    label: "Office and study",
    items: [
      i("desk-small", "Desk (small)", 0.5),
      i("desk-large", "Desk (large)", 1.0),
      i("office-chair", "Office chair", 0.3),
      i("filing-cabinet", "Filing cabinet", 0.4),
      i("bookcase", "Bookcase", 0.6),
      i("meeting-table", "Meeting table", 1.2),
      i("computer", "Computer / monitor", 0.15),
    ],
  },
  {
    id: "outdoor",
    label: "Outdoor and garage",
    items: [
      i("patio-table", "Patio table", 0.6),
      i("patio-chair", "Patio chair", 0.2),
      i("braai", "Braai / grill stand", 0.3),
      i("bicycle", "Bicycle", 0.3),
      i("plant-large", "Large plant", 0.3),
      i("ladder", "Ladder", 0.15),
      i("lawnmower", "Lawnmower", 0.4),
      i("toolbox", "Toolbox", 0.1),
      i("storage-rack", "Storage rack / shelving", 0.5),
      i("treadmill", "Treadmill", 1.0, true),
    ],
  },
  {
    id: "other",
    label: "Other and boxes",
    items: [
      i("safe", "Safe", 0.3, true),
      i("piano", "Piano / keyboard", 1.5, true),
      i("aquarium", "Aquarium / fish tank", 0.5),
      i("artwork", "Artwork (large)", 0.15),
      i("mirror", "Mirror (large)", 0.2),
      i("bulky", "Other bulky item", 0.8),
      i("fragile", "Other fragile / awkward item", 0.4),
      i("box-small", "Small box", 0.04),
      i("box-medium", "Medium box", 0.12),
      i("box-large", "Large box", 0.18),
      i("bin", "Plastic storage bin", 0.06),
      i("bag", "Refuse bag / soft bag", 0.06),
      i("suitcase", "Suitcase / luggage", 0.1),
    ],
  },
];

const itemIndex = new Map(itemGroups.flatMap((g) => g.items).map((it) => [it.id, it] as const));

export interface LoadRecommendation {
  volumeM3: number;
  vehicleId: VehicleId | null;
  trips: number;
  helpers: number;
}

/** Smallest truck that realistically fits the load; multiple trips if even the biggest can't. */
export function recommendLoad(items: Record<string, number>): LoadRecommendation {
  let volume = 0;
  let heavy = 0;
  for (const [id, qty] of Object.entries(items)) {
    const it = itemIndex.get(id);
    if (!it || qty <= 0) continue;
    volume += it.m3 * qty;
    if (it.heavy) heavy += qty;
  }
  volume = Math.round(volume * 100) / 100;
  if (volume === 0) return { volumeM3: 0, vehicleId: null, trips: 1, helpers: 0 };

  const fit = vehicles.find((v) => v.capacityM3 * rates.loadEfficiency >= volume);
  const biggest = vehicles[vehicles.length - 1]!;
  const vehicle = fit ?? biggest;
  const trips = fit ? 1 : Math.ceil(volume / (biggest.capacityM3 * rates.loadEfficiency));

  let helpers = 0;
  if (volume > 3 || heavy > 0) helpers = 1;
  if (volume > 10 || heavy >= 3) helpers = 2;
  if (volume > 22 || heavy >= 6) helpers = 3;

  return { volumeM3: volume, vehicleId: vehicle.id, trips, helpers };
}

export function totalVolume(items: Record<string, number>): number {
  return recommendLoad(items).volumeM3;
}
