import type { Area } from "../content/areas";
import { href } from "../lib/url";
import { Container, LinkButton, Section } from "../components/ui";

export function AreaPage({ area }: { area: Area }) {
  return (
    <>
      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <a className="underline" href={href("/")}>Home</a> / Movers in {area.name}
        </nav>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold text-brand-900 sm:text-4xl">Movers and truck transport in {area.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">{area.intro}</p>
        <div className="mt-6">
          <LinkButton href={href("/get-quote/")}>Get a quote for {area.name}</LinkButton>
        </div>
      </Container>
      <Section title={`Moving in ${area.name}: what to know`} tone="white">
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          {area.accessNotes.map((n) => <li key={n}>{n}</li>)}
        </ul>
        <p className="mt-6 text-slate-600">We move customers in {area.nearby.join(", ")} and other suburbs across the City of Johannesburg.</p>
      </Section>

    </>
  );
}
