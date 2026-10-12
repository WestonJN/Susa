import { href } from "../lib/url";
import { Container, LinkButton, Section } from "../components/ui";

export interface ServiceContent {
  slug: "home-moving" | "truck-hire";
  name: string;
  h1: string;
  lead: string;
  points: { title: string; body: string }[];
  included: string[];
  notIncluded: string[];
}

export const services: Record<ServiceContent["slug"], ServiceContent> = {
  "home-moving": {
    slug: "home-moving",
    name: "Home moving",
    h1: "Home moving and furniture removals in Johannesburg",
    lead: "Moving house or flat? Choose a truck, add a crew if you want one, and see the price before you commit.",
    points: [
      { title: "Right-sized trucks", body: "A Hyundai H100 dropside bakkie for a few items or a student room, or the bakkie with a closed trailer for a small one-bedroom home. Bigger loads are done in several trips." },
      { title: "Crew when you need it", body: "Pick transport only, a loading crew, or full service with packing. Add extra helpers if you have heavy items or many floors." },
      { title: "Stairs and access, priced honestly", body: "Tell us the floors and any estate or complex rules. They affect the crew time, so they are shown as a line in your quote." },
      { title: "Cover for your goods", body: "You can request goods-in-transit cover for the value you declare. It is subject to approved cover, limits and exclusions." },
    ],
    included: ["Vehicle and driver for the route you quote", "Distance-based pricing with tolls shown separately", "Crew and helpers if you choose them"],
    notIncluded: ["Packing, wrapping and dismantling (unless you choose Full service)", "Storage", "Permits or building deposits required by your complex"],
  },
  "truck-hire": {
    slug: "truck-hire",
    name: "Truck transport",
    h1: "Truck transport, furniture delivery and bulk item removal in Johannesburg",
    lead: "Need a vehicle and driver for a single delivery, a donation run or a large item? Get a route-based quote in a couple of minutes.",
    points: [
      { title: "Furniture and appliance delivery", body: "Collected from the shop or seller and delivered to your door, with a helper if the item is heavy." },
      { title: "Donation runs", body: "Take furniture, clothing or equipment to a charity or collection point without borrowing a truck." },
      { title: "Unwanted household items", body: "Tell us what needs to go and where. Disposal arrangements are confirmed with you before the run." },
      { title: "Multiple trips", body: "If your load is bigger than one truck, set the number of trips and the quote adjusts." },
    ],
    included: ["Vehicle and driver for the route you quote", "Tolls shown as a separate estimate", "Optional helpers for loading and unloading"],
    notIncluded: ["Packing materials", "Disposal fees charged by third-party sites", "Waiting time beyond the booked window"],
  },
};

export function ServicePage({ slug }: { slug: ServiceContent["slug"] }) {
  const s = services[slug];
  return (
    <>
      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <a className="underline" href={href("/")}>Home</a> / {s.name}
        </nav>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold text-brand-900 sm:text-4xl">{s.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">{s.lead}</p>
        <div className="mt-6">
          <LinkButton href={href("/get-quote/")}>Get a quote</LinkButton>
        </div>
      </Container>
      <Section tone="white">
        <div className="grid gap-4 sm:grid-cols-2">
          {s.points.map((p) => (
            <article key={p.title} className="rounded-2xl border border-slate-200 p-5">
              <h2 className="text-lg font-bold text-brand-900">{p.title}</h2>
              <p className="mt-2 text-slate-700">{p.body}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-brand-900">What your quote includes</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">{s.included.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-900">What it does not include</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">{s.notIncluded.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </Section>
    </>
  );
}
