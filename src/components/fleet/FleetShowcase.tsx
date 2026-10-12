import type { ReactNode } from "react";
import { getVehicle, rates, totalVolume } from "../../lib/catalog";
import { href } from "../../lib/url";
import { Container, LinkButton } from "../ui";
import { BakkieArt, ComboArt } from "./Vehicles";
import { RouteMap } from "./RouteMap";
import { IsoIcon, boxes, diningTable, mattress, queenBed, sofa3, studentDesk } from "./iso";

/** Example loads, by catalogue id, so the fill bars always match the real sizing rules. */
export const bakkieLoad = { "single-bed": 1, "desk-small": 1, "box-medium": 5 };
export const comboLoad = { "queen-bed": 1, "sofa-3": 1, "box-medium": 10, "dining-4": 1 };

// Optional real photos: drop bakkie.(jpg|png|webp) and bakkie-trailer.(jpg|png|webp) into src/assets/fleet/
const photos = import.meta.glob("/src/assets/fleet/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const photo = (name: string) => Object.entries(photos).find(([p]) => new RegExp(`/${name}\\.(jpg|jpeg|png|webp)$`).test(p))?.[1];

function Fill({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs font-semibold text-slate-600"><span>{label}</span><span>{pct}% of usable space</span></div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-brand-100" role="img" aria-label={`${label}: ${pct}% of usable space`}>
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

function Tile({ children, label, count }: { children: ReactNode; label: string; count?: string }) {
  return (
    <li className="flex flex-col items-center rounded-2xl bg-brand-50 p-2 text-center">
      <div className="flex h-16 w-full items-end justify-center sm:h-20">{children}</div>
      <span className="mt-1 text-xs font-semibold text-brand-900">{label}{count && <span className="text-brand-500"> {count}</span>}</span>
    </li>
  );
}

const icon = "max-h-full max-w-full";

function Panel({ tag, title, art, note, children, callout, tone }: {
  tag: string; title: string; art: ReactNode; note?: string; children: ReactNode; callout: ReactNode; tone: "plain" | "strong";
}) {
  return (
    <article className={`flex flex-col rounded-3xl border bg-white p-4 shadow-sm sm:p-5 ${tone === "strong" ? "border-brand-500 ring-2 ring-brand-100" : "border-brand-100"}`}>
      <span className="self-start rounded-full bg-brand-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">{tag}</span>
      <h3 className="mt-3 text-xl font-extrabold text-brand-900">{title}</h3>
      <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-b from-brand-50 to-white">{art}</div>
      {note && <p className="mt-3 text-sm font-semibold text-brand-600">{note}</p>}
      {children}
      <div className="mt-4" />
      <div className={`mt-auto rounded-2xl p-4 text-sm leading-relaxed ${tone === "strong" ? "bg-brand-900 text-white" : "bg-brand-50 text-brand-900"}`}>{callout}</div>
    </article>
  );
}

export function FleetShowcase() {
  const bakkie = getVehicle("h100")!, combo = getVehicle("h100_trailer")!;
  const ratio = Math.round((combo.capacityM3 / bakkie.capacityM3) * 2) / 2;
  const pct = (items: Record<string, number>, cap: number) => Math.round((totalVolume(items) / (cap * rates.loadEfficiency)) * 100);
  const bakkiePhoto = photo("bakkie"), comboPhoto = photo("bakkie-trailer");
  const img = (src: string | undefined, alt: string, fallback: ReactNode) => (src ? <img src={src} alt={alt} loading="lazy" className="aspect-[16/9] w-full object-cover" /> : fallback);

  return (
    <section className="bg-white py-12 sm:py-16" aria-labelledby="fleet-title">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Our vehicles</p>
        <h2 id="fleet-title" className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">H100 Workhorse &amp; Trailer</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Our Hyundai H100 Workhorse does the small jobs on its own. Add the trailer, specifically designed for furniture transport, when there is more to move. Bigger moves are done in several trips.
        </p>

        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <Panel
            tag="Bakkie only" title="H100 Workhorse" tone="plain"
            art={img(bakkiePhoto, "Clean white Hyundai H100 dropside bakkie", <BakkieArt />)}
            note={`About ${bakkie.capacityM3} m³ of open load space`}
            callout={<><strong className="tracking-wide">OPEN DROPSIDE:</strong> Best for student rooms and large appliances.</>}
          >
            <ul className="mt-3 grid grid-cols-3 gap-2" aria-label="What fits on the bakkie">
              <Tile label="Single mattress"><IsoIcon className={icon} blocks={mattress()} label="Single mattress" /></Tile>
              <Tile label="Student desk"><IsoIcon className={icon} blocks={studentDesk()} label="Student desk" /></Tile>
              <Tile label="Boxes" count="x 5"><IsoIcon className={icon} blocks={boxes(5)} label="5 boxes" /></Tile>
            </ul>
            <Fill pct={pct(bakkieLoad, bakkie.capacityM3)} label="This example load" />
          </Panel>

          <div className="flex flex-col items-center justify-center" aria-label={`Volume increase about ${ratio} times`}>
            <div className="flex flex-col items-center rounded-3xl bg-accent-400 px-5 py-4 text-center text-brand-900 shadow-md">
              <span className="text-[11px] font-extrabold uppercase tracking-widest">Volume increase</span>
              <span className="text-4xl font-black leading-none">~{ratio}X</span>
              <span className="mt-1 text-xs font-semibold">{bakkie.capacityM3} → {combo.capacityM3} m³</span>
            </div>
            <svg viewBox="0 0 40 24" className="h-6 w-10 mt-2 text-brand-500 max-lg:rotate-90" aria-hidden="true"><path d="M2 12h30m-8-8 8 8-8 8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>

          <Panel
            tag="Bakkie + trailer" title="H100 Workhorse + closed trailer" tone="strong"
            art={img(comboPhoto, "The same H100 bakkie towing a matching closed medium trailer", <ComboArt />)}
            note="The closed trailer is specifically designed for furniture transport."
            callout={<><strong className="tracking-wide">EXPANDED CLOSED VOLUME:</strong> Perfect for one-bedroom homes or bulky items requiring weather protection.</>}
          >
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4" aria-label="What fits on the bakkie with trailer">
              <Tile label="Queen bed"><IsoIcon className={icon} blocks={queenBed()} label="Queen-size bed" /></Tile>
              <Tile label="3-seater sofa"><IsoIcon className={icon} blocks={sofa3()} label="3-seater sofa" /></Tile>
              <Tile label="Boxes" count="x 10"><IsoIcon className={icon} blocks={boxes(10)} label="10 boxes" /></Tile>
              <Tile label="Dining table"><IsoIcon className={icon} blocks={diningTable()} label="Dining table" /></Tile>
            </ul>
            <Fill pct={pct(comboLoad, combo.capacityM3)} label="This example load" />
          </Panel>
        </div>
        <p className="mt-3 text-xs text-slate-500">Capacities and example loads are estimates. Your quote is confirmed by our team before anything is booked.</p>

        <div className="mt-12 grid items-center gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-extrabold text-brand-900">We measure the trip for you</h3>
            <p className="mt-3 text-slate-600">
              Search the pick-up and drop-off, and we calculate the road distance and a driving time between the two, then build your price from it. That is step 1 of how it works.
            </p>
            <div className="mt-5"><LinkButton href={href("/get-quote/")}>Get an instant quote</LinkButton></div>
          </div>
          <RouteMap />
        </div>
      </Container>
    </section>
  );
}
