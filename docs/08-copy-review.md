# 8. Copy review (change log)

Reviewed 2026-10-14. Scope: every user-facing string in `src/`, `public/manifest.webmanifest` and page titles and descriptions. No logic, layout, route paths, ids or env variables were changed. Required owner strings are untouched ("H100 Workhorse & Trailer", "specifically designed for furniture transport", both callouts, both panel titles).

## a) Principles and glossary

Voice: plain, warm, confident South African English (en-ZA). Short sentences, active voice, no exclamation marks, no emojis, no em dashes. Errors say what to do, not what the customer did wrong. Buttons say what happens next.

| Term | Use it for | Do not use |
| --- | --- |
| bakkie | The Hyundai H100 on its own | "truck", "van" for our vehicles |
| bakkie with trailer | The H100 towing the closed box trailer | "combo", "medium trailer" |
| vehicle | Generic word when either option applies | "truck" (kept only in the service name "truck transport", which is the search keyword) |
| estimate | The price shown on screen | "price" as if final, "quote" for the number |
| quote / quote request | The process of asking us for a price | "booking" (a booking only exists once our team confirms) |
| Get a quote | Every primary button that leads to the form | "Get an instant quote", "Start your quote with X" |
| our team | The people who confirm availability and price | "we guarantee", "instant booking" |

## b) Meaningful changes

| File | Before | After | Why |
| --- | --- | --- | --- |
| `QuoteForm.tsx` fallback screen | "Online booking is not switched on yet. Send these details to our team and we will confirm..." with buttons "Send on WhatsApp" / "Send by email"; blank screen if neither is configured | "One more step: send your request. Your request has not been sent yet... press send there." Buttons "Open WhatsApp with my request" / "Open email with my request". If no contact is set: "We cannot receive requests through this page right now, so your details have not been sent." | The customer must press send themselves. The old text implied it was already sent. |
| `QuoteForm.tsx` final button | "Send quote request" | "Request my quote" | In fallback mode nothing is sent at that click. |
| `QuoteForm.tsx` summary text (WhatsApp and email body) | No name, phone, email or cover request | Adds Name, Mobile, optional Email, "Goods-in-transit cover: requested", "Online estimate: R... (not confirmed)" | Email replies had no way to reach the customer. Tiny logic change, flagged in (d). |
| `QuoteForm.tsx` success screen | "Our team will confirm availability and your final price before anything is booked." | "Our team will check availability and contact you to confirm your final price. Nothing is booked until that is agreed..." and reference line tells them to keep it | Says what happens next, with no time promise. |
| `QuoteForm.tsx` validation | "Choose a truck...", "Enter a valid South African number...", "Please accept the privacy notice so we can contact you." | "Choose the bakkie or the bakkie with trailer...", "Enter a South African mobile number, like 082 123 4567.", "Tick the box to confirm you are 18 or older and agree to the privacy notice and terms." | Non-blaming, and the consent message now matches the checkbox. |
| `QuoteForm.tsx` helper text | None on date, window, trips, phone, cover | Hints added; cover text now says "Our team tells you whether it is available" | The form has no declared-value field, so the old text was misleading. |
| `QuoteForm.tsx` | "Choose your truck", "Truck" step, "Use load assistant" | "Choose your vehicle", "Vehicle", "Add items with the load assistant" | Terminology. |
| `catalog.ts` | "H100 bakkie + trailer", "Truck + loading crew", "keeps it dry" | "H100 bakkie with trailer", "Transport + loading crew", "protects your things from the weather" | Terminology and a softer weather claim. Full service now states the crew size. |
| `pricing.ts` reasons and labels | "Your inventory may not fit the selected truck...", "Estimated tolls", "Minimum charge adjustment" | Plainer reasons without repeating "our team will confirm"; "Tolls (your figure)"; "Minimum charge"; "Crew: 2 people x 2 h" | Tolls are typed by the customer, so "estimated" was misleading. |
| `Home.tsx` | Step 4 "We confirm your booking"; FAQ "Is my personal information safe?"; "Small office relocations... use the same quote flow" | Step 4 "Send your request"; FAQ "How do you handle my personal information?"; office answer limited to loads that fit our vehicles. New FAQs: what happens after I send, which vehicles, outside Johannesburg | Removes a "safe" claim and a booking promise, adds facts already established in code. |
| `Service.tsx` | "Right-sized trucks", "priced honestly", "Cover for your goods", "Disposal arrangements are confirmed..." | "Two vehicle options", "Stairs and access in your estimate", "Goods-in-transit cover on request", disposal point reworded | Removes unverified claims and a cover promise that contradicts the Terms. |
| `Service.tsx` | Thin pages | Added "Tips for a smoother move in Johannesburg" and "Tips for a delivery or pick-up" sections, framed as general tips | SEO depth with verifiable general knowledge only. |
| `areas.ts`, `AreaPage.tsx` | "we price by route and time window"; "Tell us the estate name in your quote request" (no field exists); "We move customers in..." | Priced by distance and crew time; seven tips (lifts, boom gates, access cards, load-shedding, kerb space, N1/M1 traffic, bakkie access, stairs); links to both services and a quote button | Accuracy and depth. |
| `routes.tsx` | Descriptions reused `lead` text, some under 120 characters, no Johannesburg on the quote page | Unique descriptions of 129 to 155 characters, titles at or under 60 characters, Johannesburg in each indexable page. Service pages got `metaTitle` and `metaDescription` fields | SEO. |
| `site.ts` | "choose your truck... book with confidence" | "Get an instant estimate... Choose a bakkie or bakkie with trailer, then request a free quote." | Removes "book with confidence". |
| `seo.ts` | `priceRange: "$$"` in JSON-LD | Removed | An unsupported price-level claim in the wrong currency. |
| `Legal.tsx` | "Last updated 2026-10-13"; footer "should be reviewed by a legal adviser before launch"; "refunded... normally within 7 working days"; privacy bullet on IP "used for security and abuse prevention" | "Last updated 13 October 2026"; footer line replaced with a contact line; refund timing left to the confirmation; IP bullet describes what happens today | See (c) and (d). |
| `DriveWithUs.tsx` | "We plan to work with reliable van and truck owners..." | "Driver partnerships are coming soon. We are not taking driver or vehicle-owner applications yet." | Matches the coming-soon status and makes no plan claim. |
| `NotFound.tsx`, `DataRequest.tsx`, `Layout.tsx`, `FleetShowcase.tsx`, `AddressSearch.tsx`, `LoadAssistant.tsx` | Various | Button labels say what opens (e.g. "Open email with this request"), "Truck hire" nav became "Truck transport", example labels in sentence case, missing full stop added, dialog close label made specific | Clarity and consistency. |

## c) Open questions (only the owner can confirm)

1. Trading name: is "Susa" final? The manifest name, titles and JSON-LD all use it.
2. Phone, WhatsApp and email. Without them the quote form shows a dead end and the data-request page shows no buttons.
3. Business hours and response times: nothing on the site promises any. Add only when real.
4. Cancellation window, deposit, and refund timing. The "7 working days" refund promise was removed until confirmed.
5. Goods-in-transit cover and insurance: the site only says cover may be available on request. Confirm whether it exists at all, or remove the checkbox.
6. Crew: are the two-person and three-person crews real, and is the driver in addition? Tier summaries now state this.
7. Vehicle dimensions: 2.9 m³ and 6.0 m³ come from assumed sizes. The "about" figures and the "~2X" badge are shown to customers.
8. Fleet examples: confirm the items listed under each vehicle really fit (queen bed, 3-seater sofa, dining table with chairs, washing machine plus dryer).
9. Truck transport extras: do you take donations and unwanted items to drop-off points, and what do you refuse?
10. Whether load-shedding and lift tips should stay if you would rather not mention them.
11. Office moves: confirm small office moves are in scope.
12. Is the privacy statement about IP addresses for "security and abuse prevention" meant to return once the backend exists?

## d) Not copy, but blocks launch

- The legal pages no longer say they await a legal review. Get the attorney review (checklist item in doc 07) done before launch, because the page no longer warns readers.
- No contact channel is configured, so quote requests and POPIA requests have nowhere to go (build warns about this).
- Business details (legal name, registration number, address) are empty.
- Nothing receives requests until the customer presses send in their own WhatsApp or email. The business receives nothing otherwise.
- I added Name, Mobile and Email lines to the request text in `summaryText()` in `QuoteForm.tsx`. This is a small behaviour change. It was needed, since an emailed request had no contact details.
- `VITE_SITE_URL` is still the placeholder, so the build is in noindex staging mode.
- Rates in `catalog.ts` are placeholders and are shown to customers as estimates.
- Docs 01 to 06 may still mention trucks or older wording. They were out of scope.
