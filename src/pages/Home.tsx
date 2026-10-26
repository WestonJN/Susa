import { areas } from "../content/areas";
import { href } from "../lib/url";
import { Container, LinkButton, Section } from "../components/ui";
import { complexRates } from "../lib/catalog";
import { formatZar } from "../lib/pricing";
import { FleetShowcase } from "../components/fleet/FleetShowcase";
import { ComboArt } from "../components/fleet/Vehicles";
import { photo } from "../components/fleet/photos";

const steps = [
  { t: "Add your addresses", d: "Type the pick-up and drop-off, then pick each one from the list. We work out the driving distance for you." },
  { t: "Choose your vehicle", d: "Pick the bakkie or the bakkie with trailer. Or add your furniture and let the load assistant suggest one." },
  { t: "Watch your estimate build up", d: "Distance, crew, stairs and any tolls you add are itemised as you go." },
  { t: "Send your request", d: "Our team checks availability and confirms your final price before anything is booked. Asking for a quote is free." },
];

export const faqs = [
  { q: "Is the online price final?", a: "No. It is an estimate. Our team confirms availability and the final price before your booking is locked in. Asking for a quote is free and you are not charged." },
  { q: "What happens after I send my request?", a: "Once we receive it, our team checks availability and contacts you to confirm the final price. Your move is booked only when that is agreed. Depending on how you send it, you may need to press send in WhatsApp or your email app." },
  { q: "Which days do you move?", a: "Online bookings are currently open on the highlighted dates in the quote calendar. Our team confirms your date and arrival time with you before anything is booked." },
  { q: "Do I pay a deposit?", a: "A 50% deposit confirms your booking once our team has agreed the final price with you. Your estimate shows the deposit amount. See the cancellation and refund policy for the details." },
  { q: "Which vehicles do you use?", a: "One 1.3 ton dropside bakkie, on its own or towing a closed box trailer that is specifically designed for furniture transport." },
  { q: "How do I know which vehicle I need?", a: "Use the load assistant. Add your furniture and boxes and it suggests the bakkie or the bakkie with trailer, and how many helpers to add." },
  { q: "Does the quote include packing?", a: "Packing, wrapping and dismantling are included only in the Full service option. If you want them without Full service, ask our team when you send your request." },
  { q: "Can I get a cheaper price for a move within my complex?", a: "Yes. If you are moving between two units in the same complex or estate, choose \"Within a complex\" in the quote form. You enter one address and the size of your move, and the price is based on the time the job takes, not distance." },
  { q: "How do repeat deliveries work?", a: "If you deliver the same run every week, fortnight or month, set it up as a repeat delivery plan. You pick the weekday, Monday to Friday, and get a loyalty discount of 10% for weekly runs or 5% for fortnightly runs. Plans run for a minimum of 3 months and are invoiced monthly in advance after we confirm." },
  { q: "Do you move offices as well as homes?", a: "Yes, small offices and business deliveries that fit the bakkie or the bakkie with trailer. Bigger loads can be split over several trips. You use the same quote form." },
  { q: "Do you move outside Johannesburg?", a: "Not yet. We currently move within the City of Johannesburg only." },
  { q: "How do you handle my personal information?", a: "We collect only what we need to prepare your quote and plan your move, and we handle it under POPIA. Read the privacy notice for details and your rights." },
];

const FIRST_FAQS = 6;

function Faq({ f }: { f: { q: string; a: string } }) {
  return (
    <details className="group p-5">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-brand-900">
        {f.q}
        <span aria-hidden="true" className="text-2xl font-normal text-slate-500 transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-2 max-w-2xl text-slate-700">{f.a}</p>
    </details>
  );
}

export function Home() {
  const hero = photo("bakkie-trailer");
  return (
    <>
      <section className="bg-slate-50">
        <Container className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-tight text-brand-900 sm:text-6xl">
              Clear prices for Johannesburg moves.
            </h1>
            <p className="mt-6 max-w-md text-xl text-slate-600">
              Furniture removals with a bakkie, or a bakkie and trailer. See how your estimate is built and send your request from your phone.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              <LinkButton href={href("/get-quote/")} className="rounded-full px-7">Get a quote</LinkButton>
              <a href={href("/services/home-moving/")} className="inline-flex min-h-11 items-center font-semibold text-brand-600 hover:underline">
                How home moving works <span aria-hidden="true" className="ml-1">&rsaquo;</span>
              </a>
            </div>
          </div>
          <div>
            {hero ? (
              <img src={hero} alt="Our white bakkie towing a closed box trailer" width={620} height={277} fetchPriority="high" className="h-auto w-full rounded-2xl" />
            ) : (
              <ComboArt />
            )}
          </div>
        </Container>
      </section>

      <Section title="How it works" tone="white">
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-2xl bg-slate-50 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-900 font-semibold text-white">{i + 1}</span>
              <div>
                <h3 className="text-lg font-semibold text-brand-900">{s.t}</h3>
                <p className="mt-1 text-slate-600">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <FleetShowcase />

      <Section title="Other ways we help" tone="white">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { to: "/services/complex-moves/", t: "Moving within a complex", d: `Between two units in the same complex or estate. Priced by time with no distance, from ${formatZar(complexRates.minCharge)}.` },
            { to: "/services/repeat-deliveries/", t: "Repeat deliveries", d: "The same run every week, fortnight or month, Monday to Friday, with a loyalty discount and monthly invoicing." },
            { to: "/services/truck-hire/", t: "Truck transport", d: "One delivery, a donation run or a large item. A bakkie and driver for your route." },
          ].map((c) => (
            <a key={c.to} href={href(c.to)} className="group block rounded-2xl bg-slate-50 p-6 transition-colors hover:bg-slate-100">
              <h3 className="text-lg font-semibold text-brand-900">{c.t}</h3>
              <p className="mt-2 text-slate-600">{c.d}</p>
              <span className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-600 group-hover:underline">Learn more <span aria-hidden="true" className="ml-1">&rsaquo;</span></span>
            </a>
          ))}
        </div>
      </Section>

      <Section id="areas" title="Where we move" intro="We currently move homes and small offices within Johannesburg only. Access rules differ from building to building, so we share what to expect.">
        <ul className="flex flex-wrap gap-2">
          {areas[0]?.nearby.map((n) => (
            <li key={n} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">{n}</li>
          ))}
        </ul>
        <p className="mt-6">
          <a href={href("/areas/johannesburg/")} className="inline-flex min-h-11 items-center font-semibold text-brand-600 hover:underline">Moving in Johannesburg: what to know <span aria-hidden="true" className="ml-1">&rsaquo;</span></a>
        </p>
      </Section>

      <Section title="Common questions" tone="white">
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.slice(0, FIRST_FAQS).map((f) => <Faq key={f.q} f={f} />)}
          <details className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center px-5 font-semibold text-brand-600 group-open:hidden">See all questions</summary>
            <div className="divide-y divide-slate-200">
              {faqs.slice(FIRST_FAQS).map((f) => <Faq key={f.q} f={f} />)}
            </div>
          </details>
        </div>
      </Section>

      <section className="bg-brand-900 py-16 text-center text-white sm:py-24">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to see your price?</h2>
          <p className="mx-auto mt-3 max-w-md text-lg text-slate-200">Asking for a quote is free. We confirm availability and the final price before anything is booked.</p>
          <div className="mt-8"><LinkButton href={href("/get-quote/")} className="rounded-full px-7">Get a quote</LinkButton></div>
        </Container>
      </section>
    </>
  );
}
