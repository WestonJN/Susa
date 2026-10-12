# 6. How it works today (what is built and what is only designed)

Plain answer: **the website and the price calculator are built. Nothing server-side exists yet.**
There is no API, database, email or WhatsApp sending, approval queue or AI agents. Documents 02, 04 and 05
describe that backend; they are designs, not running software.

## Status

| Piece | Status | Notes |
| --- | --- | --- |
| Website (prerendered pages, SEO, hosting on GitHub Pages) | Built, live | `https://westonjn.github.io/Susa/` |
| Quote form and price calculator (`src/lib/pricing.ts`) | Built, tested, runs in the browser | Rates are placeholders. |
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
transport = (baseFee + perKm x km) x trips          // km rounded to whole km
crew      = (tier crew + helpers) x hours x R120 x trips
hours     = max(2, round((baseHours + floors x 0.25 + km / 80) x 2) / 2)
baseHours = volume m3 x 0.3   (2 if volume unknown)
stairs    = R90 x floors
packing   = R85 x volume m3   (full-service tier only)
subtotal  = max(minCharge, transport + crew + stairs + packing + tolls), rounded to nearest R10
total     = subtotal (+ VAT only if VAT_REGISTERED)
```

Vehicles (capacity from the assumed bakkie deck 2.3 x 1.6 x 0.8 m and trailer 2.4 x 1.3 x 1.0 m, which
**you must measure**): bakkie 2.9 m3 (base R450, R9/km, floor R600), bakkie + trailer 6.0 m3 (base R550, R10/km,
floor R750).

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
