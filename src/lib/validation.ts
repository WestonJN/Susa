/** Input hygiene shared by the form and the API client. The server must re-validate everything. */

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

export function clean(value: string, maxLength = 200): string {
  return value.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/** South African mobile/landline: 0XXXXXXXXX, +27XXXXXXXXX or 27XXXXXXXXX. Returns E.164 or null. */
export function normaliseZaPhone(raw: string): string | null {
  const digits = raw.replace(/[\s()-]/g, "");
  const m = /^(?:\+?27|0)(\d{9})$/.exec(digits);
  return m ? `+27${m[1]}` : null;
}

export function isEmail(raw: string): boolean {
  return raw.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw);
}

export function isFutureOrToday(isoDate: string, today: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) && isoDate >= today;
}

export function todayIso(now = new Date()): string {
  // Africa/Johannesburg date regardless of the device timezone.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(now);
}
