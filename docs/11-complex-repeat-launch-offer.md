# Moving within a complex, repeat deliveries and the launch offer

Built on the pricing engine v2 (`docs/10-pricing-research.md`). All figures are working assumptions to confirm against real jobs.

## 1. Moving within a complex (`mode: "complex"`)
No distance, no vehicle choice, no long positioning trip. Priced by time:

| Part | Value |
|---|---|
| Callout | R250 |
| Vehicle and driver | R100 per hour |
| Movers (optional, two) | R70 per mover-hour |
| Stairs (only with movers) | R90 per floor |
| Minimum | 2 hours, and R450 overall |

Hours = 0.5 + 0.3 x m3 + 0.25 x floors + walk (same block 0, across the complex 0.25, far side 0.5) + 0.25 per extra trip, rounded up to 0.5, minimum 2.
Size presets: a few items 3 m3, one-bedroom 6 m3, two-bedroom 12 m3, three-bedroom 18 m3 (or the item list). The vehicle and trips come from the load recommendation.

Examples: a few items, you load R450. One-bedroom, two movers, across the complex R970. Two-bedroom, two trips, one floor, two movers R1,540.
Rates live in `complexRates` in `src/lib/catalog.ts`.

## 2. Repeat delivery plans
Request-based (no automatic billing yet). Weekdays Monday to Friday (`site.repeatDays`). Per-run price is the standard estimate, with a plan discount: weekly 10% (4 runs a month), fortnightly 5% (2 runs), monthly 0% (1 run, reserved slot). Minimum 3 months, price held for 3 months, invoiced monthly in advance by EFT, skip or move a run with 2 business days' notice, cancel on 20 business days' notice after the first 3 months (Consumer Protection Act: fixed-term agreements at most 24 months). Always confirmed by a person. Terms: `/terms/#repeat-deliveries`. Have an attorney check them.

## 3. Launch offer
20% off, capped at R500 per booking, new customers, home moves and moves within a complex (not repeat plans, not combinable). Applies automatically; shown as a struck-through original price and a line in "How it adds up". Deposit and VAT are calculated on the discounted price.
Config: `src/config/promo.ts`. Ends after 31 December 2026 (customer's Johannesburg date; override with `VITE_PROMO_ENDS`). Switch off early by setting the repository variable `VITE_PROMO_ENABLED=false` and redeploying (the workflow passes it if added to the build env). A static site cannot count bookings, so the "first N customers" limit is enforced by you switching it off. Terms: `/terms/#launch-offer`.
The offer message (bar and modal) is added in the browser only: it is never in the prerendered HTML, titles, descriptions or structured data, so search results never show an expired offer. The modal opens once automatically after step 1 of the quote form (never on landing, which Google penalises on mobile).

## 4. SEO changes
- New pages `/services/complex-moves/` and `/services/repeat-deliveries/` (title, description, Service and breadcrumb structured data, sitemap) from the `services` list in `src/pages/Service.tsx`.
- Header menu, footer, home page "Other ways we help", area pages and FAQs link to them. Two new FAQs. FAQPage structured data on the home page.
- Quote page title and description cover the three request types. Site description mentions the new services.
- After deploying: resubmit the sitemap in Google Search Console and Bing.

## 5. Request payload
`QuoteRequestV1` gained optional `kind`, `complex`, `repeat` and `estimate.discount`. The backend must accept them and the owner message shows the discount.
