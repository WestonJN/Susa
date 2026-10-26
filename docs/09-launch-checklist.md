# 9. Launch checklist (status 2026-10-15)

## Done
- [x] Website, quote form, price estimate, address search, deployed on GitHub Pages
- [x] Copy review and unsupported claims removed (doc 08)
- [x] Legal pages: privacy, terms, cancellations, cookies, data request (doc 07)
- [x] WhatsApp, phone and email set (27609883937, frameneeds@gmail.com)
- [x] Trading name "Susa" confirmed
- [x] Only Sundays bookable in the calendar (07:00 to 17:00); other days show no availability
- [x] 50% deposit shown in the estimate and written into terms and cancellation policy
- [x] Standard cancellation terms: 48 hours' notice, refund within 7 working days
- [x] Goods-in-transit cover removed; site says no insurance is offered
- [x] Crew capped at two movers plus the driver
- [x] Vehicle size from published specification (deck 2.785 x 1.63 m, 1 335 kg payload)
- [x] "Hyundai H100" removed from all site wording (vehicles are "1.3 ton bakkie")
- [x] Donations, unwanted items and small office moves confirmed in scope

- [x] Vehicle pictures from the supplied image; stacking height settled at 0.8 m (not to be measured)
- [x] "Use my current location" on both address boxes (browser location, Photon reverse lookup; Google Places has no such feature)
- [x] After sending: edit the quote, cancel and start again, leave without sending; review-step edit links; Start over button

## Left to do (simplest first)
- [ ] Optional: replace the vehicle pictures (cropped from your supplied image) with real photos of your own bakkie and trailer in `src/assets/fleet/` (bakkie.jpg, bakkie-trailer.jpg)
- [ ] Confirm rates in `catalog.ts` with real quotes (rate card v2 is in; insurance, trailer, loan and diesel price are assumptions; update `dieselPricePerLitre` monthly)
- [ ] Decide how customers pay the deposit (EFT details), and write it into your confirmation message
- [ ] Register the business (CIPC), then set LEGAL_NAME, REG_NUMBER, BUSINESS_ADDRESS (VAT_NUMBER if registered)
- [ ] Buy a domain, set CUSTOM_DOMAIN, point DNS (this also lifts noindex staging mode)
- [ ] Google Search Console and Bing: submit sitemap; Google Business Profile
- [ ] Information Officer: for a sole owner this is the owner; register with the Information Regulator
- [ ] Attorney review of the four policies
- [ ] Test 5 real quotes on phones with mobile data
- [ ] Backend v1: endpoint that stores requests and emails you and the customer
- [ ] Approval queue, console, agents, WhatsApp Business API, online deposits
- [ ] Return the IP-address "security and abuse prevention" statement to the privacy notice once the backend exists

## Added with complex moves, repeat plans and the launch offer
- [ ] Confirm the in-complex rates (`complexRates`) against two or three real jobs
- [ ] Attorney check of the launch offer and repeat plan terms (`/terms/`)
- [ ] Decide how to track launch bookings and switch the offer off at your limit (`VITE_PROMO_ENABLED=false`)
- [ ] Resubmit the sitemap in Search Console and Bing after deploy
- [ ] Backend: accept `kind`, `complex`, `repeat` and `estimate.discount`
