import { site } from "../config/site";
import { areas } from "../content/areas";
import { href } from "../lib/url";
import { Container, LinkButton, Section } from "../components/ui";
import { FleetShowcase } from "../components/fleet/FleetShowcase";

const steps = [
  { t: "Search your addresses", d: "Type the pick-up and drop-off and pick them from the list. We work out the distance for you." },
  { t: "Choose your vehicle", d: "Pick the bakkie or bakkie with trailer, or add your furniture and let the load assistant suggest one." },
  { t: "See the price build up", d: "Distance, crew, stairs and tolls are itemised as you go." },
  { t: "We confirm your booking", d: "A real person checks availability and your final price before anything is locked in." },
];

const faqs = [
  { q: "Is the online price final?", a: "It is a transparent estimate. Our team confirms availability and the final price before your booking is locked in, and you are not charged when you request a quote." },
  { q: "Does the quote include packing?", a: "Packing, wrapping and dismantling are only included on the Full service option, or if you arrange them separately with us." },
  { q: "How do I know which truck I need?", a: "Use the load assistant: add your furniture and boxes and it suggests the smallest truck that fits, plus how many helpers to bring." },
  { q: "Do you move offices as well as homes?", a: "Yes. Small office relocations and commercial deliveries use the same quote flow." },
  { q: "Is my personal information safe?", a: "We only collect what we need to quote and run your move, protect it, and handle it under POPIA. Read the privacy notice for details and your rights." },
];

export function Home() {
  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">Johannesburg removals and truck transport</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Furniture removals in Johannesburg, with a clear price estimate.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-200">
            Search your addresses, choose the right vehicle, see how your estimate is built, and send your request in minutes from your phone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={href("/get-quote/")}>Get an instant quote</LinkButton>
            <LinkButton href={href("/services/home-moving/")} variant="ghost" className="!bg-transparent !text-white !border-white/40 hover:!bg-white/10">
              How home moving works
            </LinkButton>
          </div>
        </Container>
      </section>

      <Section title="How it works" tone="white">
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-900 font-bold text-white">{i + 1}</span>
              <div>
                <h3 className="font-bold text-brand-900">{s.t}</h3>
                <p className="mt-1 text-slate-600">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <FleetShowcase />

      <Section>
        <p className="text-slate-600">
          Also available: <a className="font-semibold text-brand-600 underline" href={href("/services/truck-hire/")}>truck transport</a> for furniture deliveries, donations and large items.
        </p>
      </Section>

      <Section id="areas" title="Where we operate" intro="We currently move homes and offices within Johannesburg only. Local access rules matter, so we share what to expect." tone="white">
        <ul className="flex flex-wrap gap-2">
          {areas[0]?.nearby.map((n) => (
            <li key={n} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">{n}</li>
          ))}
        </ul>
        <p className="mt-6">
          <a href={href("/areas/johannesburg/")} className="font-semibold text-brand-600 underline">Moving in Johannesburg: what to know</a>
        </p>
      </Section>

      <Section title="Common questions">
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer list-none font-semibold text-brand-900">{f.q}</summary>
              <p className="mt-2 text-slate-700">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8">
          <LinkButton href={href("/get-quote/")}>Start your quote with {site.name}</LinkButton>
        </div>
      </Section>
    </>
  );
}
