# Susa website

Mobile-first quote-to-booking website for a South African moving and truck-transport business.
React 19, TypeScript, Tailwind 4, Vite. Every page is prerendered to static HTML (SEO, fast on
slow connections) and then hydrated.

## Design documents (`docs/`)

1. [Wireframe analysis and business model](docs/01-wireframe-analysis-and-business-model.md)
2. [System and security architecture](docs/02-system-and-security-architecture.md) (POPIA, zero trust, audit)
3. [Frontend technical specification](docs/03-frontend-technical-specification.md)
4. [CEO Agent system prompt and guardrail protocol](docs/04-ceo-agent-system-prompt-and-guardrails.md)
5. [API schema and event flow](docs/05-api-schema-and-event-flow.md) and [`docs/api/openapi.yaml`](docs/api/openapi.yaml)

## Develop

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:5173
npm run typecheck && npm test
npm run build                # client + server bundle + prerender into dist/
```

## Deploy (GitHub Actions to GitHub Pages)

1. Push this repo to GitHub (default branch `main`).
2. **Settings > Pages > Source: GitHub Actions.**
3. **Settings > Secrets and variables > Actions > Variables**, add:

| Variable | Example | Notes |
| --- | --- | --- |
| `SITE_URL` | `https://www.yourdomain.co.za` | **Required to go live.** Until it is set, the build is in staging mode: `robots.txt` blocks crawling and pages are `noindex`. |
| `SITE_BASE` | `/` | Use `/<repo-name>/` if serving from `user.github.io/<repo>` with no custom domain. |
| `CUSTOM_DOMAIN` | `www.yourdomain.co.za` | Writes `CNAME`. Also set the domain under Settings > Pages and add DNS records. |
| `SITE_NAME`, `WHATSAPP_NUMBER`, `PHONE`, `CONTACT_EMAIL` | | `WHATSAPP_NUMBER` is digits only, e.g. `27821234567`. |
| `API_BASE_URL` | `https://api.yourdomain.co.za` | Orchestrator gateway. Empty = the form falls back to WhatsApp/email. |
| `VAT_REGISTERED` | `true` / `false` | Adds a VAT line to quotes. |
| `GSC_VERIFICATION` | | Optional Search Console meta token. |

4. Push to `main`. `deploy.yml` runs typecheck, tests, build and publishes. `ci.yml` runs the same checks on pull requests and non-main branches.

## SEO checklist (after the first live deploy)

- Verify the site in **Google Search Console** and submit `/sitemap.xml`; do the same in Bing Webmaster Tools.
- Create and verify a **Google Business Profile** (service-area business, Gauteng). It matters more for local ranking than anything on-site.
- Fill in real contact details and review `src/content/areas.ts` copy; add real photos and genuine customer reviews later (do not add review markup until they are real).
- Run Lighthouse on `/` and `/get-quote/` on a throttled mobile profile.
- Re-run `python3 scripts/make-brand-assets.py "Name" "Tagline"` if the trading name changes.

## What is a placeholder

- **All rates** in `src/lib/catalog.ts` (fleet fees, per-km, crew, floors, packing, floors/ceilings). Set them before launch.
- Brand name "Susa", legal wording in `src/pages/Legal.tsx` (have a lawyer review for POPIA and consumer-law fit).
- Distance is entered by the customer. Replace with a maps/routing lookup behind the gateway.
- `POST {API_BASE_URL}/v1/quote-requests` contract is typed in `src/lib/api.ts`; the gateway is not built yet.

## Guardrails built into the quote engine

`src/lib/pricing.ts` is pure and tested: hard price floor per vehicle, automatic-quote ceiling, capacity check
against the load assistant, confidence score. Anything below `autoApproveConfidence` is marked `needs_review`
for the human approval queue. A quote is never a confirmed booking.
