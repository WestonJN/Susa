/**
 * Address search and driving distance for the quote form (City of Johannesburg only).
 *
 * Providers for suggestions:
 *  1. Google Places (New) Autocomplete, used automatically when VITE_GOOGLE_MAPS_API_KEY is set.
 *     Best coverage of Johannesburg streets, estates and complexes. Needs a referrer-restricted key.
 *  2. Photon (komoot.io, OpenStreetMap), free and keyless, the default until a key is configured.
 * Driving distance: OSRM public server, with an instant straight-line estimate shown first.
 *
 * Speed: results are cached in memory, in-flight requests are cancelled when the customer keeps typing,
 * and the form always works without these services (type the address and the distance by hand).
 */

export interface Place {
  label: string;
  lat: number;
  lon: number;
}

/** A search result. Photon results carry coordinates; Google results are resolved on selection. */
export interface Suggestion {
  label: string;
  lat?: number;
  lon?: number;
  placeId?: string;
}

/** Rough bounding box of the City of Johannesburg metro: west, south, east, north. */
export const JHB_BBOX = { west: 27.7, south: -26.55, east: 28.35, north: -25.85 } as const;
const JHB_CENTRE = { lat: -26.2041, lon: 28.0473 } as const;

const GOOGLE_KEY = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "").trim();
export const usingGoogle = GOOGLE_KEY.length > 0;

export function inJohannesburg(lat: number, lon: number): boolean {
  return lon >= JHB_BBOX.west && lon <= JHB_BBOX.east && lat >= JHB_BBOX.south && lat <= JHB_BBOX.north;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
/** OpenStreetMap admin wards ("Johannesburg Ward 70") are not addresses people recognise. */
const isNoise = (part: string) => /\bward\s*\d+\b/i.test(part);

export function buildLabel(p: Record<string, unknown>): string {
  const street = [str(p.housenumber), str(p.street)].filter(Boolean).join(" ");
  const name = str(p.name);
  const area = [str(p.suburb), str(p.locality), str(p.district)].find((a) => a && !isNoise(a)) ?? "";
  const parts = [name && name !== str(p.street) ? name : "", street, area, str(p.city), str(p.postcode)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (part && !isNoise(part) && !seen.has(key)) {
      seen.add(key);
      out.push(part);
    }
  }
  return out.join(", ").slice(0, 160);
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, unknown>;
}

export function parsePhoton(json: unknown): Suggestion[] {
  const features = (json as { features?: PhotonFeature[] } | null)?.features;
  if (!Array.isArray(features)) return [];
  const out: Suggestion[] = [];
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
    out.push({ label, lat, lon });
  }
  return out;
}

export function parseGoogleAutocomplete(json: unknown): Suggestion[] {
  const items = (json as { suggestions?: { placePrediction?: { placeId?: string; text?: { text?: string } } }[] } | null)?.suggestions;
  if (!Array.isArray(items)) return [];
  const out: Suggestion[] = [];
  for (const it of items) {
    const pp = it.placePrediction;
    const label = str(pp?.text?.text).replace(/,\s*South Africa$/i, "");
    if (pp?.placeId && label) out.push({ label: label.slice(0, 160), placeId: pp.placeId });
  }
  return out;
}

export function parseGoogleDetails(json: unknown): { lat: number; lon: number } | null {
  const loc = (json as { location?: { latitude?: number; longitude?: number } } | null)?.location;
  if (typeof loc?.latitude === "number" && typeof loc.longitude === "number") return { lat: loc.latitude, lon: loc.longitude };
  return null;
}

export function newSessionToken(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ---------- suggestions ----------

const cache = new Map<string, Suggestion[]>();
function remember(key: string, value: Suggestion[]) {
  if (cache.size >= 60) cache.delete(cache.keys().next().value as string);
  cache.set(key, value);
}

async function photonSearch(query: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const { west, south, east, north } = JHB_BBOX;
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en` +
    `&lat=${JHB_CENTRE.lat}&lon=${JHB_CENTRE.lon}&bbox=${west},${south},${east},${north}`;
  const res = await fetch(url, { signal, referrerPolicy: "no-referrer" });
  if (!res.ok) throw new Error(`search failed: ${res.status}`);
  return parsePhoton(await res.json()).slice(0, 6);
}

async function googleSearch(query: string, token: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const { west, south, east, north } = JHB_BBOX;
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": GOOGLE_KEY },
    body: JSON.stringify({
      input: query,
      sessionToken: token,
      languageCode: "en",
      includedRegionCodes: ["za"],
      locationRestriction: { rectangle: { low: { latitude: south, longitude: west }, high: { latitude: north, longitude: east } } },
    }),
  });
  if (!res.ok) throw new Error(`search failed: ${res.status}`);
  return parseGoogleAutocomplete(await res.json()).slice(0, 6);
}

export async function searchSuggestions(query: string, token: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const key = `${usingGoogle ? "g" : "p"}:${query.toLowerCase().replace(/\s+/g, " ").trim()}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const found = usingGoogle ? await googleSearch(query, token, signal) : await photonSearch(query, signal);
  remember(key, found);
  return found;
}

/** Turn a suggestion into coordinates (a no-op for Photon, one small request for Google). */
export async function resolveSuggestion(s: Suggestion, token: string, signal?: AbortSignal): Promise<Place> {
  if (typeof s.lat === "number" && typeof s.lon === "number") return { label: s.label, lat: s.lat, lon: s.lon };
  if (!s.placeId || !usingGoogle) throw new Error("cannot resolve");
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(s.placeId)}?sessionToken=${encodeURIComponent(token)}`, {
    signal,
    headers: { "X-Goog-Api-Key": GOOGLE_KEY, "X-Goog-FieldMask": "location" },
  });
  if (!res.ok) throw new Error(`details failed: ${res.status}`);
  const point = parseGoogleDetails(await res.json());
  if (!point || !inJohannesburg(point.lat, point.lon)) throw new Error("outside Johannesburg");
  return { label: s.label, ...point };
}

// ---------- distance ----------

export function haversineKm(a: Pick<Place, "lat" | "lon">, b: Pick<Place, "lat" | "lon">): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Instant estimate (roads are longer than the crow flies: 1.3 is a common urban factor). */
export function quickDistanceKm(a: Place, b: Place): number {
  return round1(Math.max(1, haversineKm(a, b) * 1.3));
}

export interface RouteResult {
  km: number;
  /** true when we could not reach the routing service and used a straight-line estimate. */
  estimated: boolean;
}

const routeCache = new Map<string, RouteResult>();

export async function routeDistanceKm(a: Place, b: Place): Promise<RouteResult> {
  const key = `${a.lat.toFixed(5)},${a.lon.toFixed(5)}>${b.lat.toFixed(5)},${b.lon.toFixed(5)}`;
  const hit = routeCache.get(key);
  if (hit) return hit;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`, {
      signal: ctrl.signal,
      referrerPolicy: "no-referrer",
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as { routes?: { distance?: number }[] };
      const metres = data.routes?.[0]?.distance;
      if (typeof metres === "number" && metres > 0) {
        const result = { km: round1(metres / 1000), estimated: false };
        routeCache.set(key, result);
        return result;
      }
    }
  } catch {
    /* fall through to the estimate */
  }
  return { km: quickDistanceKm(a, b), estimated: true };
}
