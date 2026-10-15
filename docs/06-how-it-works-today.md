# 6. How it works today (what is built and what is only designed)

Plain answer: **the website and the price calculator are built. Nothing server-side exists yet.**
There is no API, database, email or WhatsApp sending, approval queue or AI agents. Documents 02, 04 and 05
describe that backend; they are designs, not running software.

## Status

| Piece | Status | Notes |
| --- | --- | --- |
| Website (prerendered pages, SEO, hosting on GitHub Pages) | Built, live | `https://westonjn.github.io/Susa/` |
| Quote form and price calculator (`src/lib/pricing.ts`) | Built, tested, runs in the browser | Rate card from the pricing research (v2); insurance, trailer and loan figures still assumed. |
| Address search and distance | Built, runs in the browser | Photon (free) or Google Places if a key is set; OSRM for road distance. |
| Quote submission contract (`POST /v1/quote-requests`) | Typed and documented only | Nothing receives it. |
| Email or WhatsApp to the customer | **Not built** | The site never sends anything to the customer. |
| Database, approval queue, Chairman console | **Not built** | Doc 02, 05. |
| CEO / Quoting / Dispatch / Support agents | **Not built** | Doc 04 is the prompt and guardrail design. |
| Payments, booking confirmation, job status page | **Not built** | |

## What happens when a customer submits the form

1. The browser builds a `QuoteRequestV1` and calls `submitQuoteRequest()`.
2. If `API_BASE_URL` is set it POSTs there (nothing is listening yet, so it would show an error).
3. If it is empty (today) the customer sees a summary of their request plus buttons that open **WhatsApp** or
   **email** pre-filled, *only if* `WHATSAPP_NUMBER` / `CONTACT_EMAIL` are set as repo variables.
   The customer sends that message themselves. **You receive nothing unless they press send.**
4. So the quote is shown on screen to the customer. It is never emailed to them.

Until the backend exists, set `WHATSAPP_NUMBER` and `CONTACT_EMAIL`, otherwise requests have nowhere to go
(the build prints a warning about this).

## The calculations (all in `src/lib/pricing.ts`, rates in `src/lib/catalog.ts`)

```
callout   = R900 (once per booking)
distance  = perKm x km x trips   // perKm = round(running cost per km x 1.6 x 1.2): R10 bakkie, R12 with trailer
                                 // running cost follows rates.dieselPricePerLitre (R33.50 now)
vehicle   = R100 x billable hours (vehicle and driver)
crew      = (tier crew + helpers, max 2, driver not counted) x billable hours x R80
hours     = max(2, ceil((0.5 + 0.4 x m3 + 0.25 x floors + trips x driven km / 30) x 2) / 2)
driven km = 1.6 x move km + 8   (m3 = 3 if unknown)
billable  = max(hours, 3 without crew, 4 with crew)
stairs    = R90 x floors (crew tiers)
packing   = R85 x volume m3 (full-service tier only)
subtotal  = max(minCharge R1,200, all lines + tolls), rounded to nearest R10
deposit   = 50% of total, nearest R10
total     = subtotal (+ VAT only if VAT_REGISTERED)
weight    = m3 x 150 kg + 60 kg per heavy item; over the vehicle limit (1 335 kg bakkie, about 2 085 kg with trailer) flags for review
```


Vehicles: bakkie deck 2.785 x 1.63 m (published specification, 1 335 kg payload, 1 250 kg braked towing limit)
with a working 0.8 m stacking height = 3.6 m3 (callout R900, R100/h); closed trailer working size 2.4 x 1.3 x 1.2 m
= 3.7 m3, so 7.3 m3 in total (callout R900, R100/h, assumed 500 kg trailer weight).

Load assistant: adds the m3 of the chosen items, then picks the smallest vehicle where
`capacity x 0.85 >= volume`; otherwise the combo with `trips = ceil(volume / (capacity x 0.85))`.

### Worked examples (run through the real engine)

| Case | Lines | Total | Status |
| --- | --- | --- | --- |
| Bakkie, transport only, 19.5 km | transport R625.50 | **R630** | ready |
| Bakkie + trailer, loading help, 19.5 km, 2 floors, 4.7 m3 | transport R745 + crew 2 x 2 h R480 + stairs R180 | **R1 410** | ready |
| Bakkie + trailer, full service, no inventory | transport R745 + crew 3 x 2 h R720 | **R1 470** | needs_review (packing cannot be priced) |

### Confidence and review

Confidence starts at 1 and drops: -0.3 full service without inventory, -0.4 load does not fit, -0.3 more than 3 trips,
-0.2 more than 4 floors, -0.3 beyond 60 km (outside Johannesburg). Above the automatic ceiling it is capped at 0.5.
Below 0.8 the status is `needs_review` and the customer is told the team will confirm the price.

## Next steps (smallest first)

1. **Now, no code:** set `WHATSAPP_NUMBER` and `CONTACT_EMAIL`. Requests then reach you via the customer's own message.
2. **Small backend:** one serverless endpoint (Cloudflare Worker, Vercel or Supabase function) that validates the
   request, stores it, and emails you via a transactional provider (Resend, Postmark). About a day of work.
3. **Customer email:** the same endpoint also emails the customer a reference and the estimate.
4. **Approval queue and Chairman console**, then agents in shadow mode (doc 04), then WhatsApp via the Business API.
