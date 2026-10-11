# 1. Wireframe analysis and business-model insights

Source: the 16 screenshots you shared of an existing South African moving site (a Facebook ad, its landing
page, "become a driver" page, and the quote calculator with its load assistant). Everything below is what is
visible in those screenshots. Treat competitor prices as **advertised "from" anchors, not real averages**, and
validate every number below against your own costs before launch.

## What the reference flow does

| Observed | What it tells us |
| --- | --- |
| Ad leads with four truck classes and a "FROM R..." price each (1.3 ton R670, 1.3 ton + trailer R1480, 4 ton R2300, 8 ton R4870) | Price anchoring by vehicle class is the hook. The ad sells the *floor*, the calculator reveals the real price. |
| Single-page calculator: Route, Load and vehicle, Move requirements, Schedule, Goods-in-transit cover, live Quote Breakdown | Pricing inputs are few: route, truck, helpers, floors, trips, date/time, cover. Our engine already uses the same set. |
| Load assistant with ~100 household items in 8 groups, outputs ideal truck, recommended truck, suggested helpers, volume in m3 | Customers do not know truck sizes. Item-based sizing removes the biggest source of wrong quotes and failed jobs. |
| "Quote only changes when you apply the recommendation" | Optional assistant, no surprise price jumps. Good trust pattern, we kept it. |
| 20% promotional discount badge and a third-party review badge (4.9 from 12 reviews) next to the form | Acquisition relies on a discount plus social proof. Only 12 reviews means the trust bar is low: real reviews quickly matter more than a polished design. |
| "Retail clients may pay a booking [fee] through the platform and ordinarily pay the remaining balance directly" | Marketplace model: platform takes a booking fee, driver collects the balance. |
| Driver page: verify email, register, profile/vehicle/documents review, "pending" until activated, "work is not guaranteed", Gauteng only | Asset-light supply: independent drivers with vehicle owners vetted by documents. |
| WhatsApp floating button on every screen, Facebook in-app browser, "Fill in the website form" prompt | Traffic arrives on mobile from Facebook; WhatsApp is the fallback channel. Mobile-first and fast first paint are non-negotiable. |
| "Quote excludes packing, wrapping, dismantling and preparation unless separately arranged" | Add-ons are upsells, and the exclusion is stated at the point of price. |

## Recommendations

### 1. Operating model: start hybrid, asset-light

- **Partner drivers first** (as the reference does). It gives capacity across Gauteng without buying trucks, and costs scale with jobs.
- **Own or contract a small core fleet later** for the routes and times where partner supply is unreliable, and for premium "full service" jobs where crew quality is the product.
- **Main risk of the marketplace model is disintermediation**: if the customer pays the driver the balance directly, both sides can skip you next time. Mitigate with a booking deposit paid through you, driver ratings tied to the platform, job tracking and cover that only exist inside a booking, and a repeat-customer incentive.

### 2. Pricing mechanics

- **Default: instant, distance-based pricing** (base fee + per-km + crew + stairs + tolls), as already implemented in `src/lib/pricing.ts`. It is predictable, explainable and quick to quote.
- **Dynamic pricing only as bounded multipliers**, never free-form. Candidate signals: month-end and Friday/Saturday demand, public holidays, same-day or next-day, low driver supply. Cap the multiplier, show it as a line item ("Peak day"), and keep the hard floor and ceiling.
- **Price floors and ceilings per vehicle class** (already modelled). Every override goes to the Chairman queue.
- **Calibrate before launch.** The placeholder minimums in the code are below the competitor's advertised "from" prices for the 4 ton and 8 ton classes. Do not match anyone's price until you know your cost per job (driver payout, fuel, tolls, crew, payment fees, support time, cover premium) and a target margin.

### 3. Service tiers and add-ons

| Tier | Includes | Notes |
| --- | --- | --- |
| Transport only | Truck and driver | Lowest price, the ad anchor. |
| Truck + loading crew | Driver plus two crew | Likely the volume tier. |
| Full service | Crew plus packing, wrapping, dismantling | Highest margin per job, needs an inventory (the load assistant provides it). |

Add-on candidates, each shown as its own price line: packing materials, dismantling and reassembly, extra stop,
after-hours or weekend, extra helper, stairs beyond a threshold, waiting time, storage hand-off, and
goods-in-transit cover (resold from an underwriter, never self-insured without advice).

### 4. Deposit and payment model

- Take a **booking deposit** at confirmation (fixed amount or a percentage) through a South African payment gateway, and collect the balance on completion. This filters out non-serious requests and reduces no-shows.
- Make the deposit rule explicit at the price breakdown ("Deposit today: R..., balance on the day").
- Driver payouts are financial actions and stay behind Chairman approval (see doc 4). Confirm VAT, provisional-tax and payment-processor requirements with an accountant.

### 5. Trust and conversion

- Show real reviews only once they exist. Do not add review markup or ratings to the site before then.
- Keep the first screen to route and truck. The reference's discount and review badge sit above the fold, so test a launch offer, but protect margin with a cap and an expiry.
- Track the funnel from day one: quote started, route entered, truck chosen, assistant used, estimate shown, request sent, confirmed by a human, deposit paid, job completed, review left.

### 6. Fleet partnership strategy

- Onboard drivers with documents reviewed by a human (licence, vehicle registration, roadworthy, goods-in-transit or public-liability cover where applicable, identity verification). Documents are POPIA special-handling data, so keep them in the PII vault (doc 2).
- Tier drivers (new, verified, preferred) and let tier affect job priority, not price transparency.
- Be clear in terms that work is not guaranteed, and who is the contracting party for the move.

## What to do with this in the product (next steps)

1. Decide the operating model and deposit rule, then update the tier and add-on config in `src/lib/catalog.ts`.
2. Run a cost model per vehicle class and replace the placeholder rates.
3. Add a "Deposit today / balance on the day" block to the quote breakdown once a payment gateway is chosen.
4. Add the funnel events listed above (consent-based analytics).
