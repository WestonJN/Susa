# 3. Frontend technical specification

Describes what is implemented in this repo and the planned extensions. Stack: React 19, TypeScript (strict),
Tailwind 4, Vite 8, Vitest. Hosted as static files.

## Principles

- **Mobile-first, low data.** System font stack (no web-font download), no UI library, no client router. Current production JS is about 86 kB gzipped and CSS about 6 kB. Budget: keep the initial JS under 120 kB gzipped and add nothing above the fold that needs an image.
- **Content first.** Every page is prerendered to static HTML and then hydrated, so crawlers and slow phones get content without waiting for JavaScript.
- **Pure logic, thin UI.** Pricing, load recommendation and validation are plain functions with unit tests. Components only render and collect input.
- **Same rules as the back end.** `calculateQuote` is the single pricing implementation; the orchestrator reuses it, so the site estimate and the agent quote cannot drift.
- **No secrets in the browser.** Only public `VITE_*` configuration.

## Structure

```
src/
  config/site.ts          brand, contact, API base, VAT, consent version (env-driven)
  content/areas.ts        per-area copy (SEO landing pages)
  lib/
    catalog.ts            vehicles, tiers, rates, item catalogue, recommendLoad()
    pricing.ts            calculateQuote(): lines, floors, ceilings, confidence, status
    validation.ts         clean(), SA phone, email, date helpers
    api.ts                QuoteRequestV1 type, submitQuoteRequest(), idempotency key
    seo.ts                <head> builder + JSON-LD builders
    url.ts                base-path aware links and route keys
  components/
    Layout.tsx            header, footer, WhatsApp button, skip link
    ui.tsx                Container, Button, Section, Counter, Field
    quote/QuoteForm.tsx   5-step wizard + sticky live estimate
    quote/LoadAssistant.tsx  modal item picker -> truck recommendation
  pages/                  Home, QuotePage, Service, AreaPage, DriveWithUs, Legal, NotFound
  routes.tsx              route table: path, title, description, JSON-LD, element
  entry-client.tsx        hydrate (prod) or render (dev)
  entry-server.tsx        render(path) -> {html, head}; page list for sitemap
scripts/prerender.ts      writes HTML per route, sitemap.xml, robots.txt, 404.html
```

## Quote flow

Steps: Route, Truck, Move details, When, Review. Each step validates before **Continue**; errors are announced
with `role="alert"`. A sticky bar shows the live estimate and an expandable "How it adds up" line list.

| Concern | Approach |
| --- | --- |
| State | One `useState<FormState>` in `QuoteForm`. The quote is **derived** with `useMemo(calculateQuote)`, never stored. Load-assistant items live in the same state so applying a recommendation is one patch. No global store is needed. |
| Validation | `validate(step, state)` returns an error map. SA phone normalised to E.164, email optional, date must be today or later in `Africa/Johannesburg`. All text passes `clean()` (control characters, length). The server must re-validate. |
| Guardrail surface | `quote.status`: `incomplete` (no estimate yet), `ready`, `needs_review` (shows "our team will confirm this price" plus the first reason). A "ready" estimate is still not a booking. |
| Submission | `submitQuoteRequest()` posts `QuoteRequestV1` with an `Idempotency-Key`. Outcomes: `done` (reference shown), `fallback` (API not configured: summary plus WhatsApp/email), `error` (retry message). |
| Anti-abuse | Hidden honeypot field; the real controls (rate limit, bot challenge) live at the gateway. |
| Consent | Unticked checkbox linking the privacy notice. The payload records `privacyNoticeVersion` and `acceptedAt`. |

## Responsiveness and accessibility

- Layouts start at 320 px wide and scale up with Tailwind breakpoints; touch targets are at least 48 px.
- Native elements where possible: `<dialog>` for the load assistant, `<details>` for the mobile menu, FAQs and price breakdown, radio inputs for truck and tier cards.
- Skip link, visible focus ring, labelled fields, `aria-live` on counters and the estimate, `prefers-reduced-motion` respected.
- Colour pairs chosen for contrast on the navy and white surfaces. Re-check with Lighthouse and an accessibility audit before launch.

## Rendering and SEO

- `npm run build` runs: client bundle, server bundle, then `prerender.ts`.
- Hydration is safe because the first client render equals the server render (no `window` access during render; the minimum date is set in an effect).
- Links are plain anchors with trailing slashes, honouring `VITE_BASE`.

## Testing

- Unit: pricing (floor, ceiling, VAT, trips, hostile numbers, incomplete input) and load recommendation.
- Smoke (manual today): build, preview, walk the flow, check for console and hydration errors.
- Planned: Playwright end-to-end for the happy path and the fallback path, run in CI.

## Known gaps and planned work

1. Address autocomplete and automatic distance/toll lookup (behind the gateway, so the maps key never ships to the browser).
2. Draft persistence of the form in `sessionStorage` so a dropped connection does not lose a half-finished quote.
3. Booking stage after approval: deposit payment, confirmation page, and a tokenised job-status page (see doc 5).
4. Sticky estimate bar overlaps the footer on the quote page at the very bottom; add bottom padding.
5. Consent-based analytics for the funnel events in doc 1.
6. Self-host or subset any icons or fonts if the design later needs them; keep the data budget.
