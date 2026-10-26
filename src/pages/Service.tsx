import { href } from "../lib/url";
import { Container, LinkButton, Section } from "../components/ui";
import { complexRates, repeatFrequencies } from "../lib/catalog";
import { formatZar } from "../lib/pricing";

export interface ServiceContent {
  slug: "home-moving" | "truck-hire" | "complex-moves" | "repeat-deliveries";
  /** Opens the quote form on this request type. */
  quoteType?: "complex" | "repeat";
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

const weekly = repeatFrequencies.find((f) => f.id === "weekly")!;
const fortnightly = repeatFrequencies.find((f) => f.id === "fortnightly")!;

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
  "complex-moves": {
    slug: "complex-moves",
    quoteType: "complex",
    name: "Moving within a complex",
    h1: "Moving within a complex or estate in Johannesburg",
    lead: `Moving from one unit to another in the same complex? Skip the distance and the long form. Pick the size of your move and see a lower, time-based price, from ${formatZar(complexRates.minCharge)}.`,
    metaTitle: "Moving Within a Complex or Estate in Johannesburg",
    metaDescription: "Moving within a complex or estate in Johannesburg? Get a lower, time-based price with no distance to enter. Bakkie, optional movers, free quote request.",
    points: [
      { title: "A simpler quote", body: "Enter one address, say which units you are moving between and choose the size of your move. We pick the vehicle for you, so there is no distance to look up." },
      { title: "Priced by time, not distance", body: "A small callout plus the hours the job takes, because the vehicle never leaves the complex. Short carries cost less than long ones, and you see every line before you send your request." },
      { title: "Movers only if you want them", body: "Load and unload yourself and pay for the vehicle and driver only, or add a two-person crew. Stairs are charged per floor when movers are included." },
      { title: "Built for body-corporate rules", body: "We share what to arrange with your managing agent, such as lift bookings, move-in slots and deposits, so nothing delays the day." },
    ],
    included: ["A vehicle and driver for the time the job takes", "A two-person crew, if you choose one", "Stairs priced per floor when movers are included"],
    notIncluded: ["Packing, wrapping and dismantling", "Lift bookings, move-in deposits or fees charged by your complex", "Moves between two different addresses: use home moving instead"],
    tipsTitle: "Tips for moving within a complex",
    tips: [
      "Book the lift and any move-in slot with the body corporate or managing agent a few days ahead.",
      "Ask whether the complex has move-in hours, vehicle size limits or a refundable deposit.",
      "Tell us the block, unit and floor at both ends, and whether there is a lift, so the time estimate is right.",
      "Load-shedding can stop lifts and gate motors. Check the schedule for your move day.",
      "Measure doorways, stairwells and lifts before moving sofas, wardrobes and other large items.",
    ],
  },
  "repeat-deliveries": {
    slug: "repeat-deliveries",
    quoteType: "repeat",
    name: "Repeat deliveries",
    h1: "Scheduled and repeat deliveries in Johannesburg",
    lead: "Deliver the same run every week, fortnight or month? Set it up once, get a loyalty discount and a reserved slot on a weekday that suits you.",
    metaTitle: "Repeat & Scheduled Deliveries in Johannesburg",
    metaDescription: "Regular bakkie deliveries in Johannesburg, weekly, fortnightly or monthly, Monday to Friday. Loyalty discount, reserved slot and monthly invoicing.",
    points: [
      { title: "Weekly, fortnightly or monthly", body: "Choose how often the same run happens and which weekday suits you, Monday to Friday. We confirm the plan with you before it starts." },
      { title: "A loyalty discount", body: `${weekly.discount}% off every run for weekly deliveries and ${fortnightly.discount}% off for fortnightly ones. Monthly runs keep the standard price with a reserved slot. Your price is held for 3 months.` },
      { title: "Simple monthly invoicing", body: "We invoice each month in advance by EFT after we confirm your plan. There is no card on file." },
      { title: "Skip or change a run", body: "Tell us at least two business days ahead and we move or skip that run. Plans can be cancelled on 20 business days' notice after the first 3 months." },
    ],
    included: ["A vehicle and driver on your chosen weekday", "A fixed route you set up once", "An optional two-person crew to load and unload each run"],
    notIncluded: ["Packing materials", "Waiting time beyond the booked window", "Storage or goods-in-transit insurance"],
    tipsTitle: "Who repeat deliveries suit",
    tips: [
      "Small shops and online sellers who restock or deliver to customers on a fixed day.",
      "Landlords and property managers who move furniture between units.",
      "Workshops, caterers and market traders who carry the same load every week.",
      "Anyone who ships between two addresses on a regular schedule, such as storage to a trading site.",
    ],
  },
};

export function ServicePage({ slug }: { slug: ServiceContent["slug"] }) {
  const s = services[slug];
  const quoteHref = `${href("/get-quote/")}${s.quoteType ? `?type=${s.quoteType}` : ""}`;
  return (
    <>
      <Container className="py-14 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <a className="inline-flex min-h-11 items-center underline" href={href("/")}>Home</a> / {s.name}
        </nav>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl">{s.h1}</h1>
        <p className="mt-4 max-w-2xl text-xl text-slate-600">{s.lead}</p>
        <div className="mt-6">
          <LinkButton href={quoteHref} className="rounded-full px-7">Get a quote</LinkButton>
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
        <div className="mt-6"><LinkButton href={quoteHref} className="rounded-full px-7">Get a quote</LinkButton></div>
      </Section>
    </>
  );
}
