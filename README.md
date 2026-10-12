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

## Deploy (GitHub Actions to GitHub Pages, no domain needed)

The workflow in `.github/workflows/deploy.yml` needs **no variables and no domain**. It publishes to
`https://<owner>.github.io/<repo>/` (for this repo: `https://westonjn.github.io/Susa/`) and sets every URL,
canonical tag, sitemap entry and asset path to match.

1. Make sure `.github/workflows/deploy.yml` is in the repo. The GitHub web uploader skips hidden folders, so
   add it with **Add file > Create new file**, name it `.github/workflows/deploy.yml`, and paste the contents.
2. **Settings > Pages > Build and deployment > Source: GitHub Actions** (required, one time: the workflow cannot switch Pages on by itself).
3. Push to `main` (or run **Actions > Deploy to GitHub Pages > Run workflow**). The first run takes about two minutes.

Optional repository Variables (Settings > Secrets and variables > Actions > Variables), all safe to add later:

| Variable | Example | Notes |
| --- | --- | --- |
| `CUSTOM_DOMAIN` | `www.yourdomain.co.za` | When you buy a domain: set this, add the domain under Settings > Pages and point DNS at GitHub. URLs switch over automatically. |
| `SITE_NAME`, `WHATSAPP_NUMBER`, `PHONE`, `CONTACT_EMAIL` | | `WHATSAPP_NUMBER` is digits only, e.g. `27821234567`. |
| `API_BASE_URL` | `https://api.yourdomain.co.za` | Orchestrator gateway. Empty = the form falls back to WhatsApp/email. |
| `VAT_REGISTERED` | `true` / `false` | Adds a VAT line to quotes. |
| `GSC_VERIFICATION` | | Optional Search Console meta token. |

`ci.yml` runs typecheck, tests and a build on pull requests and non-main branches.

> **github.io and SEO:** on a project page the site lives under `/<repo>/`, so Google ignores its `robots.txt`
> (crawlers only read the one at the domain root). That is harmless, but you **must submit the sitemap
> yourself** in Google Search Console (add the property `https://<owner>.github.io/<repo>/` and submit
> `sitemap.xml`). A real domain later gives better local-search and branding results.

## SEO checklist (after the first live deploy)

- Verify the site in **Google Search Console** and submit `sitemap.xml`; do the same in Bing Webmaster Tools.
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
