import { useEffect, useMemo, useState } from "react";
import { site } from "../../config/site";
import { complexSizes, getTier, getVehicle, rates, recommendForVolume, recommendLoad, repeatFrequencies, tiers, totalVolume, totalWeightKg, vehicles, walkOptions, type RepeatFrequency, type TierId, type WalkId } from "../../lib/catalog";
import { promo } from "../../config/promo";
import { calculateQuote, formatZar, repeatPlan } from "../../lib/pricing";
import { newIdempotencyKey, submitQuoteRequest, type QuoteRequestV1 } from "../../lib/api";
import { clean, isBookableDay, isEmail, normaliseZaPhone, todayIso } from "../../lib/validation";
import { Button, Counter, Field, inputClass } from "../ui";
import { whatsappLink } from "../Layout";
import { href } from "../../lib/url";
import { PromoDialog, usePromoActive } from "../Promo";
import { LoadAssistant } from "./LoadAssistant";
import { AddressSearch } from "./AddressSearch";
import { DatePicker } from "./DatePicker";
import { quickDistanceKm, routeDistanceKm, type Place } from "../../lib/geo";

type Kind = "standard" | "complex" | "repeat";
type StepKey = "route" | "complex" | "vehicle" | "details" | "size" | "when" | "schedule" | "review";
const STEP_KEYS: Record<Kind, readonly StepKey[]> = {
  standard: ["route", "vehicle", "details", "when", "review"],
  complex: ["complex", "size", "when", "review"],
  repeat: ["route", "vehicle", "schedule", "review"],
};
const STEP_LABEL: Record<StepKey, string> = { route: "Route", complex: "Complex", vehicle: "Vehicle", details: "Move details", size: "Size", when: "When", schedule: "Schedule", review: "Review" };
const KINDS: readonly { id: Kind; title: string; body: string }[] = [
  { id: "standard", title: "Home move", body: "Between two addresses in Johannesburg" },
  { id: "complex", title: "Within a complex", body: "From one unit to another in the same complex or estate. Lower price, no distance needed" },
  { id: "repeat", title: "Repeat deliveries", body: "The same run every week, fortnight or month, with a loyalty discount" },
];
const WINDOWS = ["Morning (07:00 to 12:00)", "Afternoon (12:00 to 17:00)", "Flexible (07:00 to 17:00)"] as const;

interface FormState {
  kind: Kind;
  unitFrom: string;
  unitTo: string;
  walk: WalkId;
  sizeId: string | null;
  frequency: RepeatFrequency;
  goods: string;
  crewWanted: boolean;
  pickup: string;
  dropoff: string;
  pickupPlace: Place | null;
  dropoffPlace: Place | null;
  distanceKm: string;
  tollEstimate: string;
  vehicleId: string | null;
  tier: TierId;
  items: Record<string, number>;
  helpers: number;
  floors: number;
  trips: number;
  date: string;
  window: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  website: string; // honeypot
}

const initial: FormState = {
  kind: "standard",
  unitFrom: "",
  unitTo: "",
  walk: "same",
  sizeId: null,
  frequency: "weekly",
  goods: "",
  crewWanted: false,
  pickup: "",
  dropoff: "",
  pickupPlace: null,
  dropoffPlace: null,
  distanceKm: "",
  tollEstimate: "",
  vehicleId: null,
  tier: "transport",
  items: {},
  helpers: 0,
  floors: 0,
  trips: 1,
  date: "",
  window: WINDOWS[0],
  name: "",
  phone: "",
  email: "",
  consent: false,
  website: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(key: StepKey, s: FormState): Errors {
  const e: Errors = {};
  if (key === "route") {
    if (clean(s.pickup).length < 5) e.pickup = "Enter your pick-up street and suburb.";
    if (clean(s.dropoff).length < 5) e.dropoff = "Enter your drop-off street and suburb.";
    const km = Number(s.distanceKm);
    if (!s.distanceKm || !Number.isFinite(km) || km <= 0 || km > 150) e.distanceKm = "Enter the driving distance in km, up to 150. We move within Johannesburg only.";
  }
  if (key === "complex") {
    if (clean(s.pickup).length < 5) e.pickup = "Enter the street address or name of the complex.";
    if (clean(s.unitFrom, 80).length < 1) e.unitFrom = "Enter the block, unit or floor you are moving from.";
    if (clean(s.unitTo, 80).length < 1) e.unitTo = "Enter the block, unit or floor you are moving to.";
  }
  if (key === "vehicle" && !s.vehicleId) e.vehicleId = "Choose the bakkie or the bakkie with trailer, or use the load assistant.";
  if (key === "size" && !s.sizeId && !Object.values(s.items).some((n) => n > 0)) e.sizeId = "Choose the size of your move, or list your items.";
  if (key === "when" && !isBookableDay(s.date, todayIso(), site.bookingDays)) e.date = "Pick one of the highlighted dates in the calendar.";
  if (key === "schedule") {
    if (!isBookableDay(s.date, todayIso(), site.repeatDays)) e.date = "Pick a start date from the highlighted weekdays.";
    if (clean(s.goods, 200).length < 3) e.goods = "Tell us briefly what you deliver, for example boxes or furniture.";
  }
  if (key === "review") {
    if (clean(s.name, 100).length < 2) e.name = "Enter your name.";
    if (!normaliseZaPhone(s.phone)) e.phone = "Enter a South African mobile number, like 082 123 4567.";
    if (s.email && !isEmail(s.email.trim())) e.email = "Check your email address. It should look like name@example.com.";
    if (!s.consent) e.consent = "Tick the box to confirm you are 18 or older and agree to the privacy notice and terms.";
  }
  return e;
}

export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [assistant, setAssistant] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "fallback" | "error">("idle");
  const [reference, setReference] = useState("");
  const [key0, setKey] = useState(newIdempotencyKey);
  const [routeNote, setRouteNote] = useState("");
  const [distanceAuto, setDistanceAuto] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const promoOn = usePromoActive();

  const kind = s.kind;
  const keys = STEP_KEYS[kind];
  const key: StepKey = keys[Math.min(step, keys.length - 1)]!;
  const STEPS = keys.map((k) => STEP_LABEL[k]);
  const last = keys.length - 1;

  // Arriving from a service page: /get-quote/?type=complex or ?type=repeat.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("type");
    if (t === "complex" || t === "repeat") setS((prev) => ({ ...prev, kind: t }));
  }, []);

  // Show the offer once, after the first step, to people who are already engaged. Never on landing.
  useEffect(() => {
    if (step !== 1 || !promoOn || kind === "repeat") return;
    try {
      if (localStorage.getItem("susa-promo-seen")) return;
      localStorage.setItem("susa-promo-seen", "1");
    } catch {
      /* storage blocked: skip the automatic popup */
      return;
    }
    setPromoOpen(true);
  }, [step, promoOn, kind]);

  const maxHelpers = Math.max(0, rates.maxCrew - getTier(s.tier).crew);
  const helpers = Math.min(s.helpers, maxHelpers);
  function startOver() {
    setS({ ...initial, kind: s.kind });
    setErrors({});
    setStep(0);
    setStatus("idle");
    setReference("");
    setRouteNote("");
    setDistanceAuto(false);
    setKey(newIdempotencyKey());
    window.scrollTo({ top: 0 });
  }
  function editQuote(toStep: number) {
    setStatus("idle");
    setStep(toStep);
    window.scrollTo({ top: 0 });
  }
  const patch = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));

  // Work out the driving distance as soon as both addresses were picked from the search.
  useEffect(() => {
    const { pickupPlace, dropoffPlace } = s;
    if (kind === "complex" || !pickupPlace || !dropoffPlace) {
      setRouteNote("");
      setDistanceAuto(false);
      return;
    }
    let cancelled = false;
    // Show an instant straight-line estimate, then replace it with the real road distance.
    setS((prev) => ({ ...prev, distanceKm: String(quickDistanceKm(pickupPlace, dropoffPlace)) }));
    setDistanceAuto(true);
    setRouteNote("Estimate from the map. Checking the road distance…");
    routeDistanceKm(pickupPlace, dropoffPlace).then((r) => {
      if (cancelled) return;
      setS((prev) => ({ ...prev, distanceKm: String(r.km) }));
      setRouteNote(r.estimated ? "Estimated from the map because road routing is unavailable. Please check the distance." : "Driving distance between your two addresses.");
    });
    return () => {
      cancelled = true;
    };
  }, [s.pickupPlace, s.dropoffPlace, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasItems = Object.values(s.items).some((n) => n > 0);
  const preset = complexSizes.find((z) => z.id === s.sizeId);
  // Within a complex: the vehicle and trips follow from the size, so the customer never has to choose.
  const complexRec = useMemo(
    () => (hasItems ? recommendLoad(s.items) : preset ? recommendForVolume(preset.m3) : null),
    [hasItems, s.items, preset],
  );
  const complexTier: TierId = s.tier === "loading" ? "loading" : "transport";
  const eff =
    kind === "complex"
      ? { vehicleId: complexRec?.vehicleId ?? null, tier: complexTier, trips: complexRec?.trips ?? 1, helpers: 0, volume: complexRec?.volumeM3 || null, loadKg: complexRec?.loadKg || null, floors: s.floors }
      : kind === "repeat"
        ? { vehicleId: s.vehicleId, tier: (s.crewWanted ? "loading" : "transport") as TierId, trips: 1, helpers: 0, volume: null, loadKg: null, floors: 0 }
        : { vehicleId: s.vehicleId, tier: s.tier, trips: s.trips, helpers, volume: totalVolume(s.items) || null, loadKg: totalWeightKg(s.items) || null, floors: s.floors };
  const discount = promoOn && kind !== "repeat" ? { label: `${promo.name}: ${promo.percent}% off, up to ${formatZar(promo.maxAmount)}`, percent: promo.percent, maxAmount: promo.maxAmount } : null;
  const quote = useMemo(
    () =>
      calculateQuote({
        mode: kind === "complex" ? "complex" : "standard",
        walk: s.walk,
        discount,
        vehicleId: eff.vehicleId,
        tier: eff.tier,
        distanceKm: kind === "complex" ? null : s.distanceKm ? Number(s.distanceKm) : null,
        tollEstimate: kind === "complex" ? 0 : Math.max(0, Number(s.tollEstimate) || 0),
        helpers: eff.helpers,
        floors: eff.floors,
        trips: eff.trips,
        volumeM3: eff.volume,
        loadKg: eff.loadKg,
        vatRegistered: site.vatRegistered,
        vatRate: site.vatRate,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, s.walk, promoOn, eff.vehicleId, eff.tier, s.distanceKm, s.tollEstimate, eff.helpers, eff.floors, eff.trips, eff.volume, eff.loadKg],
  );
  const plan = kind === "repeat" && quote.status !== "incomplete" ? repeatPlan(quote.total, s.frequency) : null;

  function next() {
    const e = validate(key, s);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((n) => Math.min(last, n + 1));
  }

  const walkLabel = walkOptions.find((w) => w.id === s.walk)?.label ?? s.walk;
  const freqLabel = repeatFrequencies.find((f) => f.id === s.frequency)?.label ?? s.frequency;

  function summaryText() {
    const v = getVehicle(eff.vehicleId);
    const title = kind === "complex" ? "Quote request: move within a complex" : kind === "repeat" ? "Repeat delivery plan request" : "Quote request";
    const where =
      kind === "complex"
        ? [`Complex: ${clean(s.pickup)}`, `From: ${clean(s.unitFrom, 80)}`, `To: ${clean(s.unitTo, 80)} (${walkLabel})`]
        : [`From: ${clean(s.pickup)}`, `To: ${clean(s.dropoff)} (about ${s.distanceKm} km)`];
    const what =
      kind === "complex"
        ? [`Size: ${preset?.label ?? "items listed"}, ${eff.tier === "loading" ? "movers included" : "customer loads"}, floors: ${s.floors}`, `Vehicle: ${v?.name ?? "not chosen"} x ${eff.trips} trip(s)`]
        : kind === "repeat"
          ? [`Vehicle: ${v?.name ?? "not chosen"}${s.crewWanted ? ", with a loading crew" : ""}`, `Plan: ${freqLabel}, delivering ${clean(s.goods, 200)}`]
          : [`Vehicle: ${v?.name ?? "not chosen"} x ${s.trips} trip(s), ${getTier(s.tier).name}`, `Extra helpers: ${helpers}, floors: ${s.floors}`];
    return [
      title,
      ...where,
      ...what,
      kind === "repeat" ? `First run: ${s.date}, ${s.window}` : `Date: ${s.date}, ${s.window}`,
      quote.status === "incomplete"
        ? ""
        : kind === "repeat" && plan
          ? `Online estimate: ${formatZar(plan.perRun)} per run, about ${formatZar(plan.monthly)} a month (not confirmed)`
          : `Online estimate: ${formatZar(quote.total)}${quote.discount > 0 ? ` after ${promo.name} (-${formatZar(quote.discount)})` : ""} (not confirmed)`,
      `Name: ${clean(s.name, 100)}`,
      `Mobile: ${clean(s.phone, 20)}`,
      s.email.trim() ? `Email: ${clean(s.email, 254)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function submit() {
    const e = validate("review", s);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (s.website) return; // honeypot tripped: silently drop
    const phone = normaliseZaPhone(s.phone);
    if (!phone || !eff.vehicleId) return;

    const payload: QuoteRequestV1 = {
      schemaVersion: 1,
      idempotencyKey: key0,
      kind,
      route: {
        pickup: clean(s.pickup),
        dropoff: kind === "complex" ? clean(s.pickup) : clean(s.dropoff),
        pickupPoint: s.pickupPlace ? { lat: s.pickupPlace.lat, lon: s.pickupPlace.lon } : null,
        dropoffPoint: kind === "complex" ? (s.pickupPlace ? { lat: s.pickupPlace.lat, lon: s.pickupPlace.lon } : null) : s.dropoffPlace ? { lat: s.dropoffPlace.lat, lon: s.dropoffPlace.lon } : null,
        distanceKm: kind === "complex" ? 1 : Number(s.distanceKm),
        tollEstimate: kind === "complex" ? 0 : Math.max(0, Number(s.tollEstimate) || 0),
      },
      ...(kind === "complex" ? { complex: { unitFrom: clean(s.unitFrom, 80), unitTo: clean(s.unitTo, 80), walk: s.walk } } : {}),
      ...(kind === "repeat" && plan ? { repeat: { frequency: s.frequency, goods: clean(s.goods, 200), runsPerMonth: plan.runsPerMonth, monthlyEstimate: plan.monthly } } : {}),
      load: { vehicleId: eff.vehicleId, tier: eff.tier, trips: eff.trips, helpers: eff.helpers, floors: eff.floors, volumeM3: eff.volume, items: Object.fromEntries(Object.entries(s.items).filter(([, n]) => n > 0)) },
      schedule: { date: s.date, window: s.window },
      estimate: { total: plan ? plan.perRun : quote.total, status: quote.status, confidence: quote.confidence, reasons: quote.reasons, discount: quote.discount > 0 ? { label: promo.name, amount: quote.discount } : null },
      contact: { name: clean(s.name, 100), phone, email: s.email.trim() ? s.email.trim().toLowerCase() : null },
      consent: { privacyNoticeVersion: site.consentVersion, acceptedAt: new Date().toISOString() },
      website: "",
    };

    setStatus("sending");
    const res = await submitQuoteRequest(payload);
    if (res.ok) {
      setReference(res.reference);
      setStatus("done");
    } else if (res.reason === "not_configured") {
      setStatus("fallback");
    } else {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm" role="status">
        <h2 className="text-2xl font-semibold text-brand-900">Request received</h2>
        <p className="mt-2 text-slate-700">
          Thanks {clean(s.name, 100).split(" ")[0]}. Our team will check availability and contact you to confirm your final price. Nothing is booked until that is agreed, and you have not been charged.
        </p>
        {reference && reference !== "pending" && <p className="mt-3 text-sm text-slate-600">Your reference: <strong>{reference}</strong>. Keep it in case you ask about this request.</p>}
        <p className="mt-3 text-sm text-slate-600">Need to change or cancel this request? Contact us and quote your reference{reference && reference !== "pending" ? "" : " and your name"}.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={startOver}>Start a new quote</Button>
          <a className="font-semibold text-brand-600 underline" href={href("/")}>Back to the home page</a>
        </div>
      </div>
    );
  }

  if (status === "fallback") {
    const wa = whatsappLink(summaryText());
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm" role="status">
        <h2 className="text-2xl font-semibold text-brand-900">One more step: send your request</h2>
        <p className="mt-2 text-slate-700">
          {wa || site.email
            ? `Your request has not been sent yet. Use ${wa && site.email ? "a button" : "the button"} below to open ${wa && site.email ? "WhatsApp or your email app" : wa ? "WhatsApp" : "your email app"} with these details filled in, then press send there. Our team will check availability and contact you to confirm your final price. You have not been charged.`
            : "We cannot receive requests through this page right now, so your details have not been sent. Please try again later."}
        </p>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-100 p-4 text-sm">{summaryText()}</pre>
        <div className="mt-4 flex flex-wrap gap-3">
          {wa && <a className="inline-flex min-h-12 items-center rounded-xl bg-[#25D366] px-5 font-semibold text-white" href={wa} rel="noopener">Open WhatsApp with my request</a>}
          {site.email && (
            <a className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 px-5 font-semibold" href={`mailto:${site.email}?subject=${encodeURIComponent(summaryText().split("\n")[0] ?? "Quote request")}&body=${encodeURIComponent(summaryText())}`}>
              Open email with my request
            </a>
          )}
        </div>
        {(wa || site.email) && <p className="mt-3 text-sm text-slate-600">Our team only receives your request once you press send.</p>}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-brand-900">Changed your mind? Nothing has been sent yet, so there is nothing to undo.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={() => editQuote(last)}>Edit my quote</Button>
            <button type="button" className="min-h-11 px-1 font-semibold text-brand-600 underline" onClick={startOver}>Cancel and start again</button>
            <a className="min-h-11 px-1 py-2 font-semibold text-slate-700 underline" href={href("/")}>Leave without sending</a>
          </div>
        </div>
      </div>
    );
  }

  const v = getVehicle(eff.vehicleId);

  const lineItems = (
    <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-left text-sm">
      {quote.lines.map((l) => (
        <li key={l.label} className={`flex justify-between gap-3 ${l.amount < 0 ? "font-semibold text-emerald-800" : ""}`}><span>{l.label}</span><span className="whitespace-nowrap tabular-nums">{l.amount < 0 ? "-" : ""}{formatZar(Math.abs(l.amount))}</span></li>
      ))}
      {site.vatRegistered && <li className="flex justify-between gap-3"><span>VAT</span><span className="tabular-nums">{formatZar(quote.vat)}</span></li>}
      {plan && plan.discountPercent > 0 && (
        <li className="flex justify-between gap-3 font-semibold text-emerald-800"><span>Plan discount: {plan.discountPercent}% off each run</span><span className="whitespace-nowrap tabular-nums">-{formatZar(quote.total - plan.perRun)}</span></li>
      )}
    </ul>
  );
  const notes = (
    <>
      {quote.status === "needs_review" && (
        <p className="mt-2 text-left text-sm text-amber-700">Our team will check this price before confirming it. {quote.reasons[0]}</p>
      )}
      <p className="mt-2 text-left text-sm text-slate-600">
        {kind === "repeat"
          ? "This is an estimate for one run. Plans run for a minimum of 3 months and are invoiced monthly in advance once we confirm. Our team confirms the final price."
          : "This is an estimate. It excludes packing and dismantling unless you chose Full service. Our team confirms the final price."}
      </p>
    </>
  );
  const figures = (
    <div>
      <div className="text-sm text-slate-600">{plan ? "Per run" : "Estimate"}{site.vatRegistered ? " incl. VAT" : ""}</div>
      <div className="flex items-baseline gap-2">
        {quote.discount > 0 && <s className="text-base text-slate-500" aria-label={`Was ${formatZar(quote.originalTotal)}`}>{formatZar(quote.originalTotal)}</s>}
        <span className="text-3xl font-semibold tracking-tight text-brand-900">{formatZar(plan ? plan.perRun : quote.total)}</span>
      </div>
      {plan ? (
        <div className="text-sm text-slate-600">About {formatZar(plan.monthly)} a month ({plan.runsPerMonth} {plan.runsPerMonth === 1 ? "run" : "runs"})</div>
      ) : (
        <div className="text-sm text-slate-600">50% deposit to confirm: {formatZar(quote.deposit)}</div>
      )}
    </div>
  );
  const emptyMsg = kind === "complex" ? "Choose the size of your move to see your estimate." : "Add your route and vehicle to see your estimate.";

  return (
    <div className="pb-28 lg:pb-0">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8">
      <div className="min-w-0">
      <nav aria-label="Quote progress" className="mb-6">
        <ol className="flex items-start">
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={label} aria-current={current ? "step" : undefined} className="relative flex flex-1 flex-col items-center">
                {i > 0 && (
                  <span aria-hidden="true" className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 transition-colors ${i <= step ? "bg-brand-600" : "bg-slate-200"}`} />
                )}
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => setStep(i)}
                  aria-label={done ? `${label}, completed. Go back to this step` : label}
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    done
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : current
                        ? "bg-brand-900 text-white ring-4 ring-brand-100"
                        : "bg-white text-slate-500 ring-2 ring-slate-200"
                  }`}
                >
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
                <span className={`mt-2 hidden text-sm font-semibold sm:block ${current ? "text-brand-900" : done ? "text-brand-600" : "text-slate-600"}`}>{label}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-center text-sm font-semibold text-brand-900 sm:hidden">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
      </nav>

      <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
        {step === 0 && (
          <fieldset className="mb-8">
            <legend className="mb-3 text-sm font-semibold text-slate-700">What do you need?</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {KINDS.map((k) => (
                <label
                  key={k.id}
                  className={`block cursor-pointer rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 ${kind === k.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <input type="radio" name="kind" className="sr-only" checked={kind === k.id} onChange={() => { patch(kind === "complex" && k.id !== "complex" ? { kind: k.id, dropoff: "", dropoffPlace: null, distanceKm: "" } : { kind: k.id }); setErrors({}); }} />
                  <div className="font-semibold text-brand-900">{k.title}</div>
                  <p className="mt-1 text-sm text-slate-600">{k.body}</p>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {key === "complex" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Which complex?</h2>
              <p className="mt-1 text-sm text-slate-600">One address is enough. There is no distance to enter, so this is the quickest way to a price.</p>
            </div>
            <AddressSearch
              id="pickup"
              label="Complex or estate address"
              value={s.pickup}
              place={s.pickupPlace}
              placeholder="e.g. Cedar Road, Fourways"
              error={errors.pickup}
              onText={(pickup) => patch({ pickup, dropoff: pickup })}
              onPlace={(pickupPlace) => patch({ pickupPlace, dropoffPlace: pickupPlace })}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Moving from" htmlFor="unitFrom" error={errors.unitFrom} hint="Block, unit number or floor">
                <input id="unitFrom" className={inputClass} maxLength={80} value={s.unitFrom} onChange={(e) => patch({ unitFrom: e.target.value })} placeholder="e.g. Block C, unit 14" />
              </Field>
              <Field label="Moving to" htmlFor="unitTo" error={errors.unitTo} hint="Block, unit number or floor">
                <input id="unitTo" className={inputClass} maxLength={80} value={s.unitTo} onChange={(e) => patch({ unitTo: e.target.value })} placeholder="e.g. Block F, unit 3" />
              </Field>
            </div>
            <p className="rounded-xl bg-brand-50 p-3 text-sm text-slate-700">
              Book the lift and any move-in slot with your body corporate or managing agent. Some complexes also ask for a refundable deposit.
            </p>
          </div>
        )}

        {key === "size" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">How much are you moving?</h2>
            <fieldset>
              <legend className="sr-only">Size of the move</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {complexSizes.map((z) => (
                  <label key={z.id} className={`block cursor-pointer rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 ${s.sizeId === z.id && !hasItems ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="size" className="sr-only" checked={s.sizeId === z.id && !hasItems} onChange={() => patch({ sizeId: z.id, items: {} })} />
                    <div className="font-semibold text-brand-900">{z.label}</div>
                    <p className="mt-1 text-sm text-slate-600">{z.hint}</p>
                  </label>
                ))}
              </div>
              {errors.sizeId && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{errors.sizeId}</p>}
              <button type="button" className="mt-3 min-h-11 font-semibold text-brand-600 underline" onClick={() => setAssistant(true)}>
                {hasItems ? "Change your item list" : "Or list your items for a closer price"}
              </button>
            </fieldset>
            {complexRec?.vehicleId && (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                We would use the {getVehicle(complexRec.vehicleId)?.name}{complexRec.trips > 1 ? `, in ${complexRec.trips} trips` : ""}. You do not need to choose a vehicle.
              </p>
            )}
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Who loads?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {tiers.filter((t) => !t.packing).map((t) => (
                  <label key={t.id} className={`block cursor-pointer rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 ${complexTier === t.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="ctier" className="sr-only" checked={complexTier === t.id} onChange={() => patch({ tier: t.id })} />
                    <div className="font-semibold text-brand-900">{t.id === "transport" ? "I will load and unload" : "Movers included"}</div>
                    <p className="mt-1 text-sm text-slate-600">{t.id === "transport" ? "Vehicle and driver only. Lowest price." : "A two-person crew loads and unloads. The driver is extra to the crew."}</p>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">How far between the two units?</legend>
              <div className="space-y-2">
                {walkOptions.map((w) => (
                  <label key={w.id} className={`block cursor-pointer rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 ${s.walk === w.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="walk" className="sr-only" checked={s.walk === w.id} onChange={() => patch({ walk: w.id })} />
                    <div className="font-semibold text-brand-900">{w.label}</div>
                    <p className="text-sm text-slate-600">{w.hint}</p>
                  </label>
                ))}
              </div>
            </fieldset>
            <Counter label="Floors (stairs, no lift)" hint="Count floors the movers must carry up or down. Stairs are only charged when movers are included." value={s.floors} max={20} onChange={(n) => patch({ floors: n })} />
          </div>
        )}

        {key === "schedule" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Set up your repeat deliveries</h2>
              <p className="mt-1 text-sm text-slate-600">The same route on a regular day, Monday to Friday. You get a loyalty discount and your price is held for 3 months.</p>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">How often?</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {repeatFrequencies.map((f) => (
                  <label key={f.id} className={`block cursor-pointer rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 ${s.frequency === f.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="freq" className="sr-only" checked={s.frequency === f.id} onChange={() => patch({ frequency: f.id })} />
                    <div className="font-semibold text-brand-900">{f.label}</div>
                    <p className="mt-1 text-sm text-slate-600">{f.discount > 0 ? `${f.discount}% off every run` : "Reserved slot, standard price"}</p>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Start date" htmlFor="date" error={errors.date} hint="Later runs follow on the same weekday. We finish at 16:00 on Fridays.">
              <DatePicker id="date" value={s.date} days={site.repeatDays} invalid={!!errors.date} onChange={(d) => patch({ date: d })} />
            </Field>
            <Field label="Preferred arrival window" htmlFor="window" hint="Our team confirms the actual time with you.">
              <select id="window" className={inputClass} value={s.window} onChange={(e) => patch({ window: e.target.value })}>
                {WINDOWS.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </Field>
            <Field label="What do you deliver?" htmlFor="goods" error={errors.goods} hint="For example boxes of stock, furniture or appliances.">
              <input id="goods" className={inputClass} maxLength={200} value={s.goods} onChange={(e) => patch({ goods: e.target.value })} />
            </Field>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={s.crewWanted} onChange={(e) => patch({ crewWanted: e.target.checked })} />
              <span className="text-sm">Add a two-person crew to load and unload each run. Without it, the plan is vehicle and driver only.</span>
            </label>
            <p className="rounded-xl bg-brand-50 p-3 text-sm text-slate-700">
              Plans run for a minimum of 3 months and are invoiced monthly in advance after we confirm. You can cancel on 20 business days' notice. See the <a className="font-semibold text-brand-600 underline" href={href("/terms/#repeat-deliveries")}>repeat delivery terms</a>.
            </p>
          </div>
        )}

        {key === "route" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-brand-900">{kind === "repeat" ? "Where do you deliver?" : "Where are you moving?"}</h2>
              <p className="mt-1 text-sm text-slate-600">We currently move within Johannesburg only. Search for each address, then pick it from the list.</p>
            </div>
            <AddressSearch
              id="pickup"
              label="Pick-up address"
              value={s.pickup}
              place={s.pickupPlace}
              placeholder="e.g. 12 Jan Smuts Avenue, Parktown"
              error={errors.pickup}
              onText={(pickup) => patch({ pickup })}
              onPlace={(pickupPlace) => patch({ pickupPlace })}
            />
            <AddressSearch
              id="dropoff"
              label="Drop-off address"
              value={s.dropoff}
              place={s.dropoffPlace}
              placeholder="e.g. 8 Cedar Road, Fourways"
              error={errors.dropoff}
              onText={(dropoff) => patch({ dropoff })}
              onPlace={(dropoffPlace) => patch({ dropoffPlace })}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Driving distance (km)"
                htmlFor="km"
                error={errors.distanceKm}
                hint={distanceAuto ? routeNote : "Filled in automatically once both addresses are picked. You can also type it."}
              >
                <input
                  id="km"
                  className={inputClass}
                  inputMode="decimal"
                  value={s.distanceKm}
                  onChange={(e) => {
                    setDistanceAuto(false);
                    patch({ distanceKm: e.target.value.replace(/[^\d.]/g, "").slice(0, 6) });
                  }}
                />
              </Field>
              <Field label="Toll costs, if any (rand)" htmlFor="toll" hint="Optional. Add the tolls you expect, or leave blank if unsure.">
                <input id="toll" className={inputClass} inputMode="numeric" value={s.tollEstimate} onChange={(e) => patch({ tollEstimate: e.target.value.replace(/\D/g, "").slice(0, 5) })} />
              </Field>
            </div>
          </div>
        )}

        {key === "vehicle" && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Choose your vehicle</h2>
            <fieldset>
              <legend className="sr-only">Vehicle</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {vehicles.map((veh) => (
                  <label key={veh.id} className={`block cursor-pointer rounded-2xl border-2 p-5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 ${s.vehicleId === veh.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="vehicle" className="sr-only" checked={s.vehicleId === veh.id} onChange={() => patch({ vehicleId: veh.id })} />
                    <div className="text-lg font-semibold text-brand-900">{veh.name}</div>
                    <div className="text-sm text-slate-600">{veh.tonnage}</div>
                    <p className="mt-1 text-sm text-slate-700">{veh.bestFor}</p>
                    <p className="mt-2 text-sm text-slate-600">{veh.spec}</p>
                  </label>
                ))}
              </div>
              {errors.vehicleId && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{errors.vehicleId}</p>}
            </fieldset>
            {kind !== "repeat" && <div className="rounded-2xl bg-slate-100 p-5">
              <div className="font-semibold">Not sure which vehicle fits?</div>
              <p className="mt-1 text-sm text-slate-600">Add your furniture and boxes and we will suggest one.</p>
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setAssistant(true)}>
                Add items with the load assistant
              </Button>
            </div>}
          </div>
        )}

        {key === "details" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Tell us about the move</h2>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Service level</legend>
              <div className="space-y-2">
                {tiers.map((t) => (
                  <label key={t.id} className={`block cursor-pointer rounded-xl border-2 p-3 ${s.tier === t.id ? "border-brand-600 bg-brand-50" : "border-slate-200"}`}>
                    <input type="radio" name="tier" className="sr-only" checked={s.tier === t.id} onChange={() => patch({ tier: t.id })} />
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-slate-600">{t.summary}</div>
                  </label>
                ))}
              </div>
            </fieldset>
            <Counter label="Additional helpers" hint={maxHelpers === 0 ? "Your service level already has our maximum crew of two, not counting the driver." : "Up to two movers in total, not counting the driver."} value={helpers} max={maxHelpers} onChange={(n) => patch({ helpers: n })} />
            <Counter label="Floors (stairs, no lift)" hint="Count floors the crew must carry up or down." value={s.floors} max={20} onChange={(n) => patch({ floors: n })} />
            <Counter label="Number of trips" hint="Use more than one if your load will not fit in one go." value={s.trips} min={1} max={10} onChange={(n) => patch({ trips: n })} />
            <button type="button" className="font-semibold text-brand-600 underline" onClick={() => setAssistant(true)}>
              Add your items for a closer estimate
            </button>
          </div>
        )}

        {key === "when" && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">When do you need us?</h2>
            <Field label="Date of move" htmlFor="date" error={errors.date} hint="Our team confirms the date with you before anything is booked.">
              <DatePicker id="date" value={s.date} invalid={!!errors.date} onChange={(d) => patch({ date: d })} />
            </Field>
            <Field label="Preferred arrival window" htmlFor="window" hint="Our team confirms the actual time with you.">
              <select id="window" className={inputClass} value={s.window} onChange={(e) => patch({ window: e.target.value })}>
                {WINDOWS.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </Field>
            <p className="rounded-xl bg-brand-50 p-3 text-sm text-slate-700">
              We do not currently offer goods-in-transit insurance. Please check that your own contents insurance covers your things while they are being moved.
            </p>
          </div>
        )}

        {key === "review" && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Review and request your quote</h2>
            <p className="-mt-3 text-sm text-slate-600">Check your details, then add how we can reach you. This is a request, not a booking, and it is free.</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-slate-50 p-4 text-sm">
              {kind === "complex" ? (
                <>
                  <dt className="text-slate-600">Complex</dt><dd>{clean(s.pickup)}</dd>
                  <dt className="text-slate-600">Moving</dt><dd>{clean(s.unitFrom, 80)} to {clean(s.unitTo, 80)} ({walkLabel.toLowerCase()})</dd>
                  <dt className="text-slate-600">Size</dt><dd>{hasItems ? "Your item list" : preset?.label}, {eff.tier === "loading" ? "movers included" : "you load"}</dd>
                  <dt className="text-slate-600">Vehicle</dt><dd>{v?.name} x {eff.trips}</dd>
                </>
              ) : (
                <>
                  <dt className="text-slate-600">From</dt><dd>{clean(s.pickup)}</dd>
                  <dt className="text-slate-600">To</dt><dd>{clean(s.dropoff)}</dd>
                  <dt className="text-slate-600">Vehicle</dt><dd>{kind === "repeat" ? `${v?.name}${s.crewWanted ? ", with a crew" : ""}` : `${v?.name} x ${s.trips}, ${getTier(s.tier).name}`}</dd>
                </>
              )}
              {kind === "repeat" && (<><dt className="text-slate-600">Plan</dt><dd>{freqLabel}, delivering {clean(s.goods, 200)}</dd></>)}
              <dt className="text-slate-600">{kind === "repeat" ? "First run" : "When"}</dt><dd>{s.date}, {s.window}</dd>
            </dl>
            <div className="-mt-2 flex flex-wrap gap-x-4 text-sm">
              {keys.slice(0, -1).map((k, i) => (
                <button key={k} type="button" className="min-h-11 font-semibold text-brand-600 underline" onClick={() => setStep(i)}>Edit {STEP_LABEL[k].toLowerCase()}</button>
              ))}
            </div>
            <Field label="Your name" htmlFor="name" error={errors.name}>
              <input id="name" className={inputClass} autoComplete="name" maxLength={100} value={s.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field label="Mobile number" htmlFor="phone" error={errors.phone} hint="Our team uses this to confirm your move.">
              <input id="phone" className={inputClass} type="tel" inputMode="tel" autoComplete="tel" value={s.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="082 123 4567" />
            </Field>
            <Field label="Email (optional)" htmlFor="email" error={errors.email}>
              <input id="email" className={inputClass} type="email" autoComplete="email" value={s.email} onChange={(e) => patch({ email: e.target.value })} />
            </Field>
            {/* Honeypot: hidden from people, tempting to bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Website<input tabIndex={-1} autoComplete="off" value={s.website} onChange={(e) => patch({ website: e.target.value })} /></label>
            </div>
            <div>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-5 w-5" checked={s.consent} onChange={(e) => patch({ consent: e.target.checked })} />
                <span className="text-sm">
                  I am 18 or older, I have read the <a className="font-semibold text-brand-600 underline" href={href("/privacy/")}>privacy notice</a> and <a className="font-semibold text-brand-600 underline" href={href("/terms/")}>terms</a>, and I agree that {site.name} may use these details to prepare my quote and contact me about this move.
                </span>
              </label>
              {errors.consent && <p role="alert" className="mt-1 text-sm font-medium text-red-700">{errors.consent}</p>}
            </div>
            {status === "error" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Your request did not go through. Check your connection and press the button again.</p>}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((n) => n - 1)}>Back</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1" onClick={next}>Continue</Button>
          ) : (
            <Button className="flex-1" disabled={status === "sending"} onClick={submit}>
              {status === "sending" ? "Sending…" : "Request my quote"}
            </Button>
          )}
        </div>
        <p className="mt-3 text-center">
          <button
            type="button"
            className="min-h-11 px-2 text-sm font-semibold text-slate-600 underline"
            onClick={() => { if (window.confirm("Clear everything you entered and start again?")) startOver(); }}
          >
            Start over
          </button>
        </p>
      </div>
      </div>
        <aside className="hidden lg:sticky lg:top-24 lg:block" aria-label="Your estimate" aria-live="polite">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            {quote.status === "incomplete" ? (
              <p className="text-sm text-slate-600">{emptyMsg}</p>
            ) : (
              <>
                {figures}
                <h2 className="mb-2 mt-4 text-sm font-semibold text-brand-900">How it adds up</h2>
                {lineItems}
                {notes}
              </>
            )}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden" aria-live="polite">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 py-3 pl-4 pr-20 sm:pl-6">
          {quote.status === "incomplete" ? (
            <p className="text-sm text-slate-600">{emptyMsg}</p>
          ) : (
            <>
              {figures}
              <details className="max-w-[60%] text-right text-sm">
                <summary className="cursor-pointer font-semibold text-brand-600">How it adds up</summary>
                <div className="mt-2">{lineItems}</div>
                {notes}
              </details>
            </>
          )}
        </div>
      </div>

      <LoadAssistant
        open={assistant}
        items={s.items}
        onItems={(items) => patch({ items })}
        onClose={() => setAssistant(false)}
        onApply={(rec) => {
          if (kind !== "complex") patch({ vehicleId: rec.vehicleId, trips: rec.trips, helpers: Math.max(s.helpers, rec.helpers) });
          setAssistant(false);
        }}
      />
      <PromoDialog open={promoOpen} onClose={() => setPromoOpen(false)} showCta={false} />
    </div>
  );
}
