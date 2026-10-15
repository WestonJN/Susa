import type { Site } from "../config/site";

export type JsonLd = Record<string, unknown>;

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  jsonLd?: JsonLd[];
  /** Sitemap hints. */
  priority?: number;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ldScript = (obj: JsonLd) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

export function canonical(site: Site, path: string): string {
  return `${site.url}${path}`;
}

export function buildHead(site: Site, meta: PageMeta): string {
  const url = canonical(site, meta.path);
  const ogImage = `${site.url}/og-image.png`;
  const parts = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    meta.noindex ? `<meta name="robots" content="noindex,follow" />` : `<meta name="robots" content="index,follow,max-image-preview:large" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:locale" content="${site.locale}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(ogImage)}" />`,
    `<meta name="geo.region" content="ZA-GP" />`,
    `<meta name="geo.placename" content="Johannesburg" />`,
    site.gscVerification ? `<meta name="google-site-verification" content="${esc(site.gscVerification)}" />` : "",
    ...(meta.jsonLd ?? []).map(ldScript),
  ];
  return parts.filter(Boolean).join("\n    ");
}

/* ---------- structured-data builders (only emit fields we actually have) ---------- */

export function organizationLd(site: Site): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "@id": `${site.url}/#business`,
    name: site.name,
    url: `${site.url}/`,
    description: site.description,
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.email ? { email: site.email } : {}),
    areaServed: { "@type": "City", name: "Johannesburg" },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "07:00", closes: "17:00" }],
    address: { "@type": "PostalAddress", addressLocality: "Johannesburg", addressRegion: "Gauteng", addressCountry: "ZA" },
  };
}

export function websiteLd(site: Site): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: `${site.url}/`,
    inLanguage: "en-ZA",
  };
}

export function breadcrumbLd(site: Site, trail: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${site.url}${t.path}`,
    })),
  };
}

export function serviceLd(site: Site, name: string, description: string, path: string, area = "Johannesburg, Gauteng, South Africa"): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${site.url}${path}`,
    provider: { "@id": `${site.url}/#business` },
    areaServed: { "@type": "AdministrativeArea", name: area },
  };
}
