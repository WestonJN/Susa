/**
 * Address search and driving distance, with no API key and no backend:
 *  - Photon (komoot.io, built on OpenStreetMap) for address suggestions, limited to the City of Johannesburg,
 *  - OSRM public demo server for the driving distance, falling back to a straight-line estimate.
 * Both are fair-use public services: we debounce, send only the text typed (never names or phone numbers),
 * and the form always works without them (the customer can type the address and distance).
 * When traffic grows, move both behind the API gateway and a paid provider.
 */

export interface Place {
  label: string;
  lat: number;
  lon: number;
}

/** Rough bounding box of the City of Johannesburg metro: west, south, east, north. */
export const JHB_BBOX = { west: 27.7, south: -26.55, east: 28.35, north: -25.85 } as const;
const JHB_CENTRE = { lat: -26.2041, lon: 28.0473 } as const;

export function inJohannesburg(lat: number, lon: number): boolean {
  return lon >= JHB_BBOX.west && lon <= JHB_BBOX.east && lat >= JHB_BBOX.south && lat <= JHB_BBOX.north;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, unknown>;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export function buildLabel(p: Record<string, unknown>): string {
  const street = [str(p.housenumber), str(p.street)].filter(Boolean).join(" ");
  const name = str(p.name);
  const parts = [name && name !== str(p.street) ? name : "", street, str(p.district) || str(p.locality) || str(p.suburb), str(p.city), str(p.postcode)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (part && !seen.has(key)) {
      seen.add(key);
      out.push(part);
    }
  }
  return out.join(", ").slice(0, 160);
}

export function parsePhoton(json: unknown): Place[] {
  const features = (json as { features?: PhotonFeature[] } | null)?.features;
  if (!Array.isArray(features)) return [];
  const places: Place[] = [];
  const seen = new Set<string>();
  for (const f of features) {
    const c = f.geometry?.coordinates;
    const props = f.properties ?? {};
    if (!c || c.length < 2) continue;
    const [lon, lat] = c;
    if (typeof lat !== "number" || typeof lon !== "number" || !inJohannesburg(lat, lon)) continue;
    const cc = str(props.countrycode).toUpperCase();
    if (cc && cc !== "ZA") continue;
    const label = buildLabel(props);
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    places.push({ label, lat, lon });
  }
  return places;
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const { west, south, east, north } = JHB_BBOX;
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en` +
    `&lat=${JHB_CENTRE.lat}&lon=${JHB_CENTRE.lon}&bbox=${west},${south},${east},${north}`;
  const res = await fetch(url, { signal, referrerPolicy: "no-referrer" });
  if (!res.ok) throw new Error(`search failed: ${res.status}`);
  return parsePhoton(await res.json()).slice(0, 6);
}

export function haversineKm(a: Pick<Place, "lat" | "lon">, b: Pick<Place, "lat" | "lon">): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface RouteResult {
  km: number;
  /** true when we could not reach the routing service and used a straight-line estimate. */
  estimated: boolean;
}

export async function routeDistanceKm(a: Place, b: Place): Promise<RouteResult> {
  const round1 = (n: number) => Math.round(n * 10) / 10;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`,
      { signal: ctrl.signal, referrerPolicy: "no-referrer" },
    );
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as { routes?: { distance?: number }[] };
      const metres = data.routes?.[0]?.distance;
      if (typeof metres === "number" && metres > 0) return { km: round1(metres / 1000), estimated: false };
    }
  } catch {
    /* fall through to the estimate */
  }
  // Roads are longer than the crow flies: 1.3 is a common urban factor.
  return { km: round1(Math.max(1, haversineKm(a, b) * 1.3)), estimated: true };
}
