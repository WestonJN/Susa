import { useEffect, useRef, useState } from "react";
import { promo, promoActive, promoEndsLabel } from "../config/promo";
import { href } from "../lib/url";
import { todayIso } from "../lib/validation";
import { LinkButton } from "./ui";

const formatR = (n: number) => `R${n.toLocaleString("en-ZA")}`;

/** True while the launch offer runs. Decided in the browser from the customer's Johannesburg date, never at build time. */
export function usePromoActive(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(promoActive(todayIso())), []);
  return on;
}

export function PromoDialog({ open, onClose, showCta = true }: { open: boolean; onClose: () => void; showCta?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="promo-title"
      className="m-auto w-[min(32rem,calc(100%-1.5rem))] rounded-3xl p-0 shadow-2xl"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="promo-title" className="text-3xl font-semibold leading-tight tracking-tight text-brand-900">
            {promo.percent}% off your first move
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-2 h-11 w-11 shrink-0 rounded-full text-2xl hover:bg-slate-100">
            ×
          </button>
        </div>
        <p className="mt-3 text-lg text-slate-600">
          Our launch offer applies automatically in your estimate. There is no code to type.
        </p>
        <ul className="mt-5 space-y-3 text-slate-700">
          <li><strong className="font-semibold text-brand-900">What you get:</strong> {promo.percent}% off the price, up to {formatR(promo.maxAmount)} off one booking.</li>
          <li><strong className="font-semibold text-brand-900">Who:</strong> new customers, for home moves and moves within a complex.</li>
          <li><strong className="font-semibold text-brand-900">When:</strong> bookings confirmed with the deposit by {promoEndsLabel()}. The move itself can be on a later date.</li>
          <li><strong className="font-semibold text-brand-900">Good to know:</strong> it does not combine with a repeat delivery plan, and it can end sooner if we reach our limit of launch bookings.</li>
        </ul>
        <p className="mt-4 text-sm text-slate-600">
          Your estimate is not a booking. Our team confirms availability and the final price first. Read the full <a className="font-semibold text-brand-600 underline" href={href("/terms/#launch-offer")}>offer terms</a>.
        </p>
        {showCta && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <LinkButton href={href("/get-quote/")} className="px-7">Get a quote</LinkButton>
            <button type="button" onClick={onClose} className="min-h-11 font-semibold text-brand-600 hover:underline">Maybe later</button>
          </div>
        )}
      </div>
    </dialog>
  );
}

/** Slim announcement above the header. Added in the browser only, so it never ends up in the prerendered pages or search snippets. */
export function PromoBar() {
  const on = usePromoActive();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem("susa-promo-bar") === "hidden");
    } catch {
      /* storage can be blocked: just show it */
    }
  }, []);
  if (!on || hidden) return null;
  return (
    <>
      <aside aria-label="Launch offer" className="bg-brand-900 text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-1 text-sm sm:px-6">
          <p className="min-w-0 py-2">
            <strong className="font-semibold">Launch offer:</strong> {promo.percent}% off bookings until {promoEndsLabel()}.{" "}
            <button type="button" onClick={() => setOpen(true)} className="font-semibold text-accent-400 underline underline-offset-2">
              See details
            </button>
          </p>
          <button
            type="button"
            aria-label="Hide this message"
            onClick={() => {
              setHidden(true);
              try {
                sessionStorage.setItem("susa-promo-bar", "hidden");
              } catch {
                /* ignore */
              }
            }}
            className="-mr-2 h-11 w-11 shrink-0 text-xl text-slate-300 hover:text-white"
          >
            ×
          </button>
        </div>
      </aside>
      <PromoDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
