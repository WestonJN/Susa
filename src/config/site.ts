const env = import.meta.env;

/**
 * Single source of truth for brand + contact details. "Susa" is a working name:
 * change VITE_SITE_NAME (or this default) once the trading name is final.
 * Empty contact fields are simply hidden from the UI and from structured data.
 */
export const site = {
  name: (env.VITE_SITE_NAME as string | undefined) ?? "Susa",
  tagline: "Furniture removals and truck transport in Johannesburg",
  description:
    "Get an instant estimate for furniture removals and truck transport in Johannesburg. Choose a bakkie or bakkie with trailer, then request a free quote.",
  url: (((env.VITE_SITE_URL as string | undefined) || "https://www.example.co.za").replace(/\/$/, "") + String(env.BASE_URL).replace(/\/$/, "")),
  locale: "en_ZA",
  phone: (env.VITE_PHONE as string | undefined) || "+27 60 988 3937",
  whatsapp: ((env.VITE_WHATSAPP_NUMBER as string | undefined) || "27609883937").replace(/\D/g, ""),
  email: (env.VITE_CONTACT_EMAIL as string | undefined) || "frameneeds@gmail.com",
  apiBase: ((env.VITE_API_BASE_URL as string | undefined) ?? "").replace(/\/$/, ""),
  /** Business details shown in the footer and legal pages. Empty fields are hidden. */
  legalName: (env.VITE_LEGAL_NAME as string | undefined) ?? "",
  regNumber: (env.VITE_REG_NUMBER as string | undefined) ?? "",
  vatNumber: (env.VITE_VAT_NUMBER as string | undefined) ?? "",
  address: (env.VITE_BUSINESS_ADDRESS as string | undefined) ?? "",
  /** Weekly hours when the business works (24h clock). Online bookings currently open on bookingDays only. */
  hours: "Sunday to Thursday 07:00 to 17:00, Friday 07:00 to 16:00, closed Saturday",
  /** MVP: moves are only taken on these weekdays (0 = Sunday). */
  bookingDays: [0] as readonly number[],
  vatRegistered: env.VITE_VAT_REGISTERED === "true",
  vatRate: 0.15,
  gscVerification: (env.VITE_GSC_VERIFICATION as string | undefined) ?? "",
  /** Bump when the privacy notice / consent wording changes (stored with each consent). */
  consentVersion: "2026-10-13",
} as const;

export type Site = typeof site;
