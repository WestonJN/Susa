import type { ReactNode } from "react";
import { getVehicle } from "../../lib/catalog";
import { href } from "../../lib/url";
import { Container, LinkButton } from "../ui";
import { BakkieArt, ComboArt } from "./Vehicles";
import { IsoIcon, boxes, diningTable, mattress, officeDesk, queenBed, sofa3, studentDesk, washerDryer, type Cuboid } from "./iso";

// Real photos: put bakkie.(jpg|png|webp) and bakkie-trailer.(jpg|png|webp) of your own vehicle in src/assets/fleet/. Drawn art is shown until then.
const photos = import.meta.glob("/src/assets/fleet/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const photo = (name: string) => Object.entries(photos).find(([p]) => new RegExp(`/${name}\\.(jpg|jpeg|png|webp)$`).test(p))?.[1];

interface Example { label: string; blocks: Cuboid[]; alt: string }
const bakkieExamples: Example[] = [
  { label: "Single mattress", blocks: mattress(), alt: "Single mattress" },
  { label: "Student desk", blocks: studentDesk(), alt: "Student desk" },
  { label: "5 medium boxes", blocks: boxes(5), alt: "5 medium boxes" },
  { label: "Washing machine and tumble dryer", blocks: washerDryer(), alt: "Washing machine and tumble dryer" },
];
const comboExamples: Example[] = [
  { label: "Queen-size bed", blocks: queenBed(), alt: "Queen-size bed" },
  { label: "3-seater sofa", blocks: sofa3(), alt: "3-seater sofa" },
  { label: "10 medium boxes", blocks: boxes(10), alt: "10 medium boxes" },
  { label: "Dining table and chairs", blocks: diningTable(), alt: "Dining table and chairs" },
  { label: "Office desk", blocks: officeDesk(), alt: "Office desk" },
];

function Panel({ title, art, examples, callout, cols }: { title: string; art: ReactNode; examples: Example[]; callout: ReactNode; cols: string }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-b from-brand-50 to-white shadow-sm">
      <h3 className="bg-brand-100 px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-brand-900 sm:text-base">{title}</h3>
      <div className="px-4 pt-4 sm:px-6">{art}</div>
      <div className="mt-2 flex items-center gap-3 px-4 sm:px-6" aria-hidden="true">
        <span className="h-px flex-1 bg-brand-100" /><span className="text-sm font-extrabold uppercase tracking-wider text-brand-900">Capacity</span><span className="h-px flex-1 bg-brand-100" />
      </div>
      <ul className={`mt-3 mb-5 grid gap-x-2 gap-y-4 px-4 sm:px-6 ${cols}`} aria-label="Examples of what fits">
        {examples.map((e) => (
          <li key={e.label} className="flex flex-col items-center text-center">
            <div className="flex h-16 w-full items-end justify-center sm:h-20"><IsoIcon className="max-h-full max-w-full" blocks={e.blocks} label={e.alt} /></div>
            <span className="mt-2 text-xs font-semibold leading-tight text-brand-900 sm:text-sm">{e.label}</span>
          </li>
        ))}
      </ul>
      <div className="mx-4 mb-4 mt-auto rounded-2xl bg-brand-100/70 p-4 pt-4 text-sm font-medium leading-relaxed text-brand-900 sm:mx-5 sm:mb-5 sm:text-base">{callout}</div>
    </article>
  );
}

export function FleetShowcase() {
  const bakkie = getVehicle("h100")!, combo = getVehicle("h100_trailer")!;
  const ratio = Math.round((combo.capacityM3 / bakkie.capacityM3) * 2) / 2;
  const img = (src: string | undefined, alt: string, fallback: ReactNode) =>
    src ? <img src={src} alt={alt} loading="lazy" className="h-auto w-full mix-blend-multiply" /> : fallback;

  return (
    <section className="bg-white py-12 sm:py-16" aria-labelledby="fleet-title">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Our vehicles</p>
        <h2 id="fleet-title" className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">The Workhorse &amp; Trailer</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Our 1.3 ton bakkie, the Workhorse, does the small jobs on its own. Add the trailer, specifically designed for furniture transport, when there is more to move. Bigger moves can be split over several trips.
        </p>

        <div className="relative mt-8 grid gap-4 lg:grid-cols-2 lg:gap-8">
          <Panel
            title="1.3 ton bakkie" cols="grid-cols-2 sm:grid-cols-4"
            art={img(photo("bakkie"), "White dropside bakkie", <BakkieArt />)}
            examples={bakkieExamples}
            callout={<><strong>OPEN DROPSIDE:</strong> Best for student rooms, large appliances, or quick, stackable loads. Protected by waterproof tarps.</>}
          />
          <div
            className="relative z-10 mx-auto -my-6 w-28 rounded-2xl border-2 border-brand-100 bg-white px-3 py-2 text-center shadow-md lg:absolute lg:left-1/2 lg:top-[26%] lg:my-0 lg:-translate-x-1/2"
            aria-label={`Volume increase about ${ratio} times`}
          >
            <div className="text-[11px] font-extrabold uppercase leading-tight tracking-wide text-brand-900">Volume increase</div>
            <div className="text-2xl font-black text-brand-500">~{ratio}X</div>
          </div>
          <Panel
            title="1.3 ton bakkie + box trailer" cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5"
            art={img(photo("bakkie-trailer"), "The same bakkie towing a closed box trailer", <ComboArt />)}
            examples={comboExamples}
            callout={<><strong>EXPANDED CLOSED VOLUME:</strong> Perfect for one-bedroom homes, apartments, or bulky furniture requiring weather protection.</>}
          />
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Each panel shows examples of what fits, not one combined load. Sizes are estimates. Our team confirms your plan and final price before anything is booked.
        </p>
        <div className="mt-6"><LinkButton href={href("/get-quote/")}>Get a quote</LinkButton></div>
      </Container>
    </section>
  );
}
