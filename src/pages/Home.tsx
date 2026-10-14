import { areas } from "../content/areas";
import { href } from "../lib/url";
import { Container, LinkButton, Section } from "../components/ui";
import { FleetShowcase } from "../components/fleet/FleetShowcase";

const steps = [
  { t: "Add your addresses", d: "Type the pick-up and drop-off, then pick each one from the list. We work out the driving distance for you." },
  { t: "Choose your vehicle", d: "Pick the bakkie or the bakkie with trailer. Or add your furniture and let the load assistant suggest one." },
  { t: "Watch your estimate build up", d: "Distance, crew, stairs and any tolls you add are itemised as you go." },
  { t: "Send your request", d: "Our team checks availability and confirms your final price before anything is booked. Asking for a quote is free." },
];

const faqs = [
  { q: "Is the online price final?", a: "No. It is an estimate. Our team confirms availability and the final price before your booking is locked in. Asking for a quote is free and you are not charged." },
  { q: "What happens after I send my request?", a: "Once we receive it, our team checks availability and contacts you to confirm the final price. Your move is booked only when that is agreed. Depending on how you send it, you may need to press send in WhatsApp or your email app." },
  { q: "Which vehicles do you use?", a: "One Hyundai H100 dropside bakkie (1.3 ton), on its own or towing a closed box trailer that is specifically designed for furniture transport." },
  { q: "How do I know which vehicle I need?", a: "Use the load assistant. Add your furniture and boxes and it suggests the bakkie or the bakkie with trailer, and how many helpers to add." },
  { q: "Does the quote include packing?", a: "Packing, wrapping and dismantling are included only in the Full service option. If you want them without Full service, ask our team when you send your request." },
  { q: "Do you move offices as well as homes?", a: "Yes, small offices and business deliveries that fit the bakkie or the bakkie with trailer. Bigger loads can be split over several trips. You use the same quote form." },
  { q: "Do you move outside Johannesburg?", a: "Not yet. We currently move within the City of Johannesburg only." },
  { q: "How do you handle my personal information?", a: "We collect only what we need to prepare your quote and plan your move, and we handle it under POPIA. Read the privacy notice for details and your rights." },
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
            Add your addresses, choose a bakkie or a bakkie with trailer, see how your estimate is built and send your request from your phone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={href("/get-quote/")}>Get a quote</LinkButton>
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
          Need to move just one or two items? We also do <a className="font-semibold text-brand-600 underline" href={href("/services/truck-hire/")}>truck transport and furniture delivery</a>, donation runs and large items.
        </p>
      </Section>

      <Section id="areas" title="Where we move" intro="We currently move homes and small offices within Johannesburg only. Access rules differ from building to building, so we share what to expect." tone="white">
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
          <LinkButton href={href("/get-quote/")}>Get a quote</LinkButton>
        </div>
      </Section>
    </>
  );
}
