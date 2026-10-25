import { href } from "../lib/url";
import { Container, LinkButton, Section } from "../components/ui";

export interface ServiceContent {
  slug: "home-moving" | "truck-hire";
  name: string;
  h1: string;
  lead: string;
  /** Meta description, 120 to 155 characters. */
  metaDescription: string;
  /** SEO title (without the site name). */
  metaTitle: string;
  points: { title: string; body: string }[];
  included: string[];
  notIncluded: string[];
  /** General, practical tips. Not claims about the business. */
  tipsTitle: string;
  tips: string[];
}

export const services: Record<ServiceContent["slug"], ServiceContent> = {
  "home-moving": {
    slug: "home-moving",
    name: "Home moving",
    h1: "Home moving and furniture removals in Johannesburg",
    lead: "Moving house or flat in Johannesburg? Choose a bakkie or a bakkie with trailer, add a crew if you want one and see your estimate before you send your request.",
    metaTitle: "Home Moving & Furniture Removals in Johannesburg",
    metaDescription: "Home moving and furniture removals in Johannesburg by bakkie or bakkie with trailer. Add a crew if you need one, see your estimate and request a quote.",
    points: [
      { title: "Two vehicle options", body: "A 1.3 ton dropside bakkie for a few items or a student room. Or the same bakkie with a closed trailer, specifically designed for furniture transport, for a small one-bedroom home. Bigger loads can be split over several trips." },
      { title: "Crew when you need it", body: "Choose transport only, a loading crew, or full service with packing. Add extra helpers if you have heavy items or many floors." },
      { title: "Stairs and access in your estimate", body: "Tell us how many floors the crew must carry up, and about any estate or complex rules. Stairs affect crew time, so they show as a line in your estimate." },
      { title: "Your belongings", body: "We handle your things with care. We do not currently offer goods-in-transit insurance, so please check that your own contents insurance covers a move." },
    ],
    included: ["A vehicle and driver for your route", "Distance-based pricing, with any tolls you enter shown separately", "A crew and extra helpers, if you choose them"],
    notIncluded: ["Packing, wrapping and dismantling, unless you choose Full service", "Storage", "Permits or building deposits that your complex asks for"],
    tipsTitle: "Tips for a smoother move in Johannesburg",
    tips: [
      "Measure doorways, stairwells and lifts before moving sofas, wardrobes and other large items.",
      "In a sectional-title complex, book the lift and any move-in slot with the body corporate or managing agent a few days ahead. Some also ask for a refundable deposit.",
      "Ask your building or estate about access cards, gate passes and vehicle size or time limits.",
      "Load-shedding can stop lifts and gate motors. Check the schedule for your move day and ask whether the lift has backup power.",
      "Defrost and drain fridges and freezers the day before, and take beds and wardrobes apart ahead of time if you are loading yourself.",
      "Keep your documents, medication and valuables with you rather than on the vehicle.",
    ],
  },
  "truck-hire": {
    slug: "truck-hire",
    name: "Truck transport",
    h1: "Truck transport, furniture delivery and large-item moves in Johannesburg",
    lead: "Need a bakkie and driver for one delivery, a donation run or a large item in Johannesburg? Get an instant estimate based on your route.",
    metaTitle: "Truck Transport & Furniture Delivery in Johannesburg",
    metaDescription: "Truck transport in Johannesburg for furniture delivery, donation runs and bulk items. Get an instant estimate for a bakkie or bakkie with trailer.",
    points: [
      { title: "Furniture and appliance delivery", body: "We collect from the shop or seller and deliver to your door. Add a helper if the item is heavy." },
      { title: "Donation runs", body: "Take furniture, clothing or equipment to a charity or collection point without having to borrow a vehicle." },
      { title: "Unwanted household items", body: "Tell us what needs to go and where it should be taken when you send your request. Our team tells you what we can take before the date." },
      { title: "More than one trip", body: "If your load is bigger than one trip, set the number of trips and your estimate updates." },
    ],
    included: ["A vehicle and driver for your route", "Tolls you enter, shown as a separate line", "Optional helpers for loading and unloading"],
    notIncluded: ["Packing materials", "Disposal fees charged by third-party sites", "Waiting time beyond the booked window"],
    tipsTitle: "Tips for a delivery or pick-up",
    tips: [
      "Measure the item and the doorways, gates and stairs at both ends.",
      "Give both addresses and tell us about access, such as boom gates, access cards or stairs.",
      "For a shop or seller pick-up, confirm the item is ready and share the seller's contact details.",
      "For a donation, check the charity's collection hours and what it accepts before you load.",
      "Heavy items such as fridges and wardrobes are easier with a helper. Add one in the quote form.",
    ],
  },
};

export function ServicePage({ slug }: { slug: ServiceContent["slug"] }) {
  const s = services[slug];
  return (
    <>
      <Container className="py-14 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <a className="inline-flex min-h-11 items-center underline" href={href("/")}>Home</a> / {s.name}
        </nav>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl">{s.h1}</h1>
        <p className="mt-4 max-w-2xl text-xl text-slate-600">{s.lead}</p>
        <div className="mt-6">
          <LinkButton href={href("/get-quote/")} className="rounded-full px-7">Get a quote</LinkButton>
          <p className="mt-2 text-sm text-slate-600">Free to request. Not a booking.</p>
        </div>
      </Container>
      <Section tone="white">
        <div className="grid gap-4 sm:grid-cols-2">
          {s.points.map((p) => (
            <article key={p.title} className="rounded-2xl bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-brand-900">{p.title}</h2>
              <p className="mt-2 text-slate-700">{p.body}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-brand-900">What your estimate includes</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">{s.included.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-brand-900">What is not included</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">{s.notIncluded.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </Section>
      <Section tone="white" title={s.tipsTitle}>
        <ul className="max-w-3xl list-disc space-y-2 pl-5 text-slate-700">{s.tips.map((x) => <li key={x}>{x}</li>)}</ul>
        <p className="mt-4 text-sm text-slate-600">These are general tips. They are not part of your quote.</p>
        <div className="mt-6"><LinkButton href={href("/get-quote/")}>Get a quote</LinkButton></div>
      </Section>
    </>
  );
}
