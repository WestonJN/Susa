/**
 * Fleet, service tiers and household item catalogue.
 *
 * !! Every rate below is a PLACEHOLDER for the Chairman to set before launch. !!
 * They exist so the quote flow, guardrails and tests are real. Prices are ZAR.
 */

export type VehicleId = "h1" | "h1_trailer" | "t1_5" | "t4" | "t8";
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
  /** false = our own vehicle today; true = larger class, availability confirmed on booking. */
  onRequest: boolean;
}

/**
 * Sizing is anchored on the vehicle we run today: a Hyundai H1 panel van (published SA spec:
 * 4.3 m³ load space, 1 100 kg payload, 2.4 m cargo bay, 1 500 kg towing) plus a trailer.
 * TRAILER_M3 is an ASSUMPTION (about 2.4 m x 1.3 m x 0.7 m): measure the real trailer and update it.
 * Larger classes are scaled up from there and are marked "on request".
 */
export const H1_VAN_M3 = 4.3;
export const TRAILER_M3 = 2.2;

export const vehicles: readonly Vehicle[] = [
  {
    id: "h1",
    name: "Hyundai H1 van",
    tonnage: "Up to 1.1 ton",
    bestFor: "A few items, a student room or a one-room move. Closed van, so your things stay protected.",
    spec: "Closed van: about 4.3 m³ load space, 2.4 m long",
    capacityM3: H1_VAN_M3,
    baseFee: 450,
    perKm: 9,
    minCharge: 600,
    maxAutoQuote: 3500,
    onRequest: false,
  },
  {
    id: "h1_trailer",
    name: "Hyundai H1 + trailer",
    tonnage: "Van plus trailer",
    bestFor: "Bachelor flats and small one-bedroom homes, or bulkier items that need the extra space.",
    spec: `Van plus trailer: about ${(H1_VAN_M3 + TRAILER_M3).toFixed(1)} m³ in total`,
    capacityM3: H1_VAN_M3 + TRAILER_M3,
    baseFee: 550,
    perKm: 10,
    minCharge: 750,
    maxAutoQuote: 4000,
    onRequest: false,
  },
  {
    id: "t1_5",
    name: "1.5 ton truck",
    tonnage: "1.5 ton",
    bestFor: "One to two bedroom homes and larger apartments.",
    spec: "Closed truck: about 8 m³ load space",
    capacityM3: 8,
    baseFee: 650,
    perKm: 11,
    minCharge: 850,
    maxAutoQuote: 5000,
    onRequest: true,
  },
  {
    id: "t4",
    name: "4 ton closed truck",
    tonnage: "4 ton",
    bestFor: "Two to three bedroom homes and small offices.",
    spec: "Closed truck: about 22 m³ load space",
    capacityM3: 22,
    baseFee: 1400,
    perKm: 16,
    minCharge: 1800,
    maxAutoQuote: 9000,
    onRequest: true,
  },
  {
    id: "t8",
    name: "8 ton closed truck",
    tonnage: "8 ton",
    bestFor: "Full family homes, offices and big commercial moves.",
    spec: "Closed truck: about 38 m³ load space",
    capacityM3: 38,
    baseFee: 2800,
    perKm: 24,
    minCharge: 3500,
    maxAutoQuote: 16000,
    onRequest: true,
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
    summary: "Truck and driver. You load and unload (or bring your own helpers).",
    crew: 0,
    packing: false,
  },
  {
    id: "loading",
    name: "Truck + loading crew",
    summary: "Truck, driver and a two-person crew to load and unload.",
    crew: 2,
    packing: false,
  },
  {
    id: "full",
    name: "Full service",
    summary: "Crew plus packing, wrapping and dismantling of your inventory.",
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
