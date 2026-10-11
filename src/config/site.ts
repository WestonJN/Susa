const env = import.meta.env;

/**
 * Single source of truth for brand + contact details. "Susa" is a working name:
 * change VITE_SITE_NAME (or this default) once the trading name is final.
 * Empty contact fields are simply hidden from the UI and from structured data.
 */
export const site = {
  name: (env.VITE_SITE_NAME as string | undefined) ?? "Susa",
  tagline: "Furniture removals and truck transport across Gauteng",
  description:
    "Get an instant online quote for furniture removals, home moves and truck transport in Johannesburg, Pretoria and across Gauteng. Choose your truck, see the price build up, and book with confidence.",
  url: ((env.VITE_SITE_URL as string | undefined) ?? "https://www.example.co.za").replace(/\/$/, ""),
  locale: "en_ZA",
  phone: (env.VITE_PHONE as string | undefined) ?? "",
  whatsapp: ((env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "").replace(/\D/g, ""),
  email: (env.VITE_CONTACT_EMAIL as string | undefined) ?? "",
  apiBase: ((env.VITE_API_BASE_URL as string | undefined) ?? "").replace(/\/$/, ""),
  vatRegistered: env.VITE_VAT_REGISTERED === "true",
  vatRate: 0.15,
  gscVerification: (env.VITE_GSC_VERIFICATION as string | undefined) ?? "",
  /** Bump when the privacy notice / consent wording changes (stored with each consent). */
  consentVersion: "2026-10-11",
} as const;

export type Site = typeof site;
