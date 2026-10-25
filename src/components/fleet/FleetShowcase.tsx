import type { ReactNode } from "react";
import { getVehicle } from "../../lib/catalog";
import { href } from "../../lib/url";
import { Container } from "../ui";
import { BakkieArt, ComboArt } from "./Vehicles";
import { IsoIcon, boxes, diningTable, queenBed, sofa3, studentDesk, washerDryer, type Cuboid } from "./iso";
import { photo } from "./photos";

interface Example { label: string; blocks: Cuboid[]; alt: string }
const bakkieExamples: Example[] = [
  { label: "Student desk", blocks: studentDesk(), alt: "Student desk" },
  { label: "5 medium boxes", blocks: boxes(5), alt: "5 medium boxes" },
  { label: "Washing machine and tumble dryer", blocks: washerDryer(), alt: "Washing machine and tumble dryer" },
];
const comboExamples: Example[] = [
  { label: "Queen-size bed", blocks: queenBed(), alt: "Queen-size bed" },
  { label: "3-seater sofa", blocks: sofa3(), alt: "3-seater sofa" },
  { label: "Dining table and chairs", blocks: diningTable(), alt: "Dining table and chairs" },
];

function Panel({ title, art, examples, callout }: { title: string; art: ReactNode; examples: Example[]; callout: ReactNode }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h3 className="text-xl font-semibold tracking-tight text-brand-900 sm:text-2xl">{title}</h3>
      <div className="mt-4">{art}</div>
      <p className="mt-6 text-sm font-semibold text-slate-600">What fits</p>
      <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-4" aria-label="Examples of what fits">
        {examples.map((e) => (
          <li key={e.label} className="flex flex-col items-center text-center">
            <div className="flex h-16 w-full items-end justify-center sm:h-20"><IsoIcon className="max-h-full max-w-full" blocks={e.blocks} label={e.alt} /></div>
            <span className="mt-2 text-sm font-medium leading-snug text-brand-900">{e.label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 border-t border-slate-200 pt-5 leading-relaxed text-slate-700">{callout}</p>
    </article>
  );
}

export function FleetShowcase() {
  const bakkie = getVehicle("h100")!, combo = getVehicle("h100_trailer")!;
  const ratio = Math.round((combo.capacityM3 / bakkie.capacityM3) * 2) / 2;
  const img = (src: string | undefined, alt: string, fallback: ReactNode) =>
    src ? <img src={src} alt={alt} loading="lazy" className="h-auto w-full rounded-2xl" /> : fallback;

  return (
    <section className="bg-slate-50 py-16 sm:py-24" aria-labelledby="fleet-title">
      <Container>
        <h2 id="fleet-title" className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">The Workhorse and trailer</h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Our 1.3 ton bakkie, the Workhorse, does the small jobs on its own. Add the trailer, specifically designed for furniture transport, when there is more to move: it gives you about {ratio === 2 ? "twice" : `${ratio} times`} the space. Bigger moves can be split over several trips.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Panel
            title="1.3 ton bakkie"
            art={img(photo("bakkie"), "White dropside bakkie", <BakkieArt />)}
            examples={bakkieExamples}
            callout={<><strong className="font-semibold text-brand-900">Open dropside.</strong> Best for student rooms, large appliances, or quick, stackable loads. Protected by waterproof tarps.</>}
          />
          <Panel
            title="1.3 ton bakkie with box trailer"
            art={img(photo("bakkie-trailer"), "The same bakkie towing a closed box trailer", <ComboArt />)}
            examples={comboExamples}
            callout={<><strong className="font-semibold text-brand-900">Closed and weatherproof.</strong> Perfect for one-bedroom homes, apartments, or bulky furniture that needs protection from the weather.</>}
          />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Each card shows examples of what fits, not one combined load. Sizes are estimates. Our team confirms your plan and final price before anything is booked.
        </p>
        <p className="mt-8 text-slate-700">
          Need to move just one or two items? We also do <a className="font-semibold text-brand-600 underline" href={href("/services/truck-hire/")}>truck transport and furniture delivery</a>, donation runs and large items.
        </p>
      </Container>
    </section>
  );
}
