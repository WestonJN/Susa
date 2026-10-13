# 7. Legal and compliance checklist (the "20 things" list, applied to this site)

Status as of 2026-10-13. "Needs you" means a fact only the business owner can supply.
This is a working checklist, not legal advice; have a South African attorney review the policies before launch.

| # | Item | Status | Where / note |
| --- | --- | --- | --- |
| 1 | Privacy policy | Done | `/privacy/` (POPIA): who we are, what and why, third parties and cross-border processing, retention, rights, children, Information Regulator. |
| 2 | Terms of service | Done | `/terms/`: 18+, estimates vs bookings, itemised pricing, exclusions, goods in transit, SA law. |
| 3 | Refund policy | Done, needs you | `/cancellations/`. Set the real cancellation window and deposit terms in your booking confirmation. |
| 4 | Cookie policy | Done | `/cookies/`. The site sets no cookies and has no analytics. |
| 5 | Cookie consent banner | Not needed | No cookies or trackers, so nothing to consent to. Add a banner the day you add analytics or ads. |
| 6 | Check form consents | Done | Unticked checkbox (18+, privacy notice, terms), notice version and timestamp stored with the request. No bundled marketing consent. |
| 7 | No unnecessary data | Done | Name, phone, addresses, date, inventory. Email optional. No ID number or payment details. |
| 8 | Audit third-party SDKs | Done | No SDKs or scripts. Services used are listed in the privacy notice: GitHub Pages, Photon or Google Places, OSRM. |
| 9 | Remove dark patterns | Audited | No pre-ticked boxes, countdowns, fake scarcity or hard-to-cancel flows. |
| 10 | Remove hidden fees | Done | Price is itemised live; terms state extras are agreed before they are charged. |
| 11 | Remove fake reviews | Done | None on the site and no review markup. Add only real reviews later. |
| 12 | Remove unsupported claims | Done | "priced upfront" became "clear price estimate"; goods-in-transit cover no longer promised. Keep "estimate" wording until the backend confirms prices. |
| 13 | Accessibility alt text | Done | Illustrations have titles and aria-labels; photos need `alt` when added (the fleet component already requires it). |
| 14 | Colour contrast | Done | Failing greys darkened. axe-core found 0 violations on all 11 pages at mobile width. |
| 15 | Keyboard navigation | Done | Skip link, visible focus ring, native controls. Tab order checked. |
| 16 | Business details | Needs you | Footer and legal pages show them once you set `LEGAL_NAME`, `REG_NUMBER`, `BUSINESS_ADDRESS` (and `VAT_NUMBER`) as repo variables. The build warns while they are missing. |
| 17 | Age consent for kids' data | Done | Service is 18+; the form checkbox confirms it; the privacy notice covers children. |
| 18 | Unsubscribe link in emails | Done in policy | We send no marketing. The privacy notice commits to consent and an unsubscribe link if that changes. Build it into any email template when emails exist. |
| 19 | License fonts and images | Done | System fonts only. All illustrations and icons are drawn for this site. Photos you add must be your own or licensed. |
| 20 | Data deletion request | Done | `/data-request/` builds a pre-filled email or WhatsApp message; 30-day response stated. Needs a real inbox and a process once the backend exists. |

## Still needed before real customers

- Fill the business-detail variables (item 16) and the contact variables (`WHATSAPP_NUMBER`, `CONTACT_EMAIL`).
- Appoint an Information Officer and register them with the Information Regulator (POPIA requirement for responsible parties).
- Decide goods-in-transit cover and cancellation terms, then update the terms and cancellation pages to match.
- Have an attorney review all four policies.
