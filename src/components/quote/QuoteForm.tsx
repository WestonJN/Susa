import { useEffect, useMemo, useState } from "react";
import { site } from "../../config/site";
import { getTier, getVehicle, rates, tiers, totalVolume, totalWeightKg, vehicles, type TierId } from "../../lib/catalog";
import { calculateQuote, formatZar } from "../../lib/pricing";
import { newIdempotencyKey, submitQuoteRequest, type QuoteRequestV1 } from "../../lib/api";
import { clean, isBookableDay, isEmail, normaliseZaPhone, todayIso } from "../../lib/validation";
import { Button, Counter, Field, inputClass } from "../ui";
import { whatsappLink } from "../Layout";
import { href } from "../../lib/url";
import { LoadAssistant } from "./LoadAssistant";
import { AddressSearch } from "./AddressSearch";
import { DatePicker } from "./DatePicker";
import { quickDistanceKm, routeDistanceKm, type Place } from "../../lib/geo";

const STEPS = ["Route", "Vehicle", "Move details", "When", "Review"] as const;
const WINDOWS = ["Morning (07:00 to 12:00)", "Afternoon (12:00 to 17:00)", "Flexible (07:00 to 17:00)"] as const;

interface FormState {
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

function validate(step: number, s: FormState): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (clean(s.pickup).length < 5) e.pickup = "Enter your pick-up street and suburb.";
    if (clean(s.dropoff).length < 5) e.dropoff = "Enter your drop-off street and suburb.";
    const km = Number(s.distanceKm);
    if (!s.distanceKm || !Number.isFinite(km) || km <= 0 || km > 150) e.distanceKm = "Enter the driving distance in km, up to 150. We move within Johannesburg only.";
  }
  if (step === 1 && !s.vehicleId) e.vehicleId = "Choose the bakkie or the bakkie with trailer, or use the load assistant.";
  if (step === 3) {
    if (!isBookableDay(s.date, todayIso(), site.bookingDays)) e.date = "Pick one of the highlighted dates in the calendar.";
  }
  if (step === 4) {
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
  const [key, setKey] = useState(newIdempotencyKey);
  const [routeNote, setRouteNote] = useState("");
  const [distanceAuto, setDistanceAuto] = useState(false);

  const maxHelpers = Math.max(0, rates.maxCrew - getTier(s.tier).crew);
  const helpers = Math.min(s.helpers, maxHelpers);
  function startOver() {
    setS(initial);
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
    if (!pickupPlace || !dropoffPlace) {
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
  }, [s.pickupPlace, s.dropoffPlace]); // eslint-disable-line react-hooks/exhaustive-deps

  const volume = totalVolume(s.items) || null;
  const loadKg = totalWeightKg(s.items) || null;
  const quote = useMemo(
    () =>
      calculateQuote({
        vehicleId: s.vehicleId,
        tier: s.tier,
        distanceKm: s.distanceKm ? Number(s.distanceKm) : null,
        tollEstimate: Math.max(0, Number(s.tollEstimate) || 0),
        helpers,
        floors: s.floors,
        trips: s.trips,
        volumeM3: volume,
        loadKg,
        vatRegistered: site.vatRegistered,
        vatRate: site.vatRate,
      }),
    [s.vehicleId, s.tier, s.distanceKm, s.tollEstimate, helpers, s.floors, s.trips, volume, loadKg],
  );

  function next() {
    const e = validate(step, s);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((n) => Math.min(STEPS.length - 1, n + 1));
  }

  function summaryText() {
    const v = getVehicle(s.vehicleId);
    return [
      "Quote request",
      `From: ${clean(s.pickup)}`,
      `To: ${clean(s.dropoff)} (about ${s.distanceKm} km)`,
      `Vehicle: ${v?.name ?? "not chosen"} x ${s.trips} trip(s), ${getTier(s.tier).name}`,
      `Extra helpers: ${helpers}, floors: ${s.floors}`,
      `Date: ${s.date}, ${s.window}`,
      quote.status !== "incomplete" ? `Online estimate: ${formatZar(quote.total)} (not confirmed)` : "",
      `Name: ${clean(s.name, 100)}`,
      `Mobile: ${clean(s.phone, 20)}`,
      s.email.trim() ? `Email: ${clean(s.email, 254)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function submit() {
    const e = validate(4, s);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (s.website) return; // honeypot tripped: silently drop
    const phone = normaliseZaPhone(s.phone);
    if (!phone || !s.vehicleId) return;

    const payload: QuoteRequestV1 = {
      schemaVersion: 1,
      idempotencyKey: key,
      route: {
        pickup: clean(s.pickup),
        dropoff: clean(s.dropoff),
        pickupPoint: s.pickupPlace ? { lat: s.pickupPlace.lat, lon: s.pickupPlace.lon } : null,
        dropoffPoint: s.dropoffPlace ? { lat: s.dropoffPlace.lat, lon: s.dropoffPlace.lon } : null,
        distanceKm: Number(s.distanceKm),
        tollEstimate: Math.max(0, Number(s.tollEstimate) || 0),
      },
      load: { vehicleId: s.vehicleId, tier: s.tier, trips: s.trips, helpers, floors: s.floors, volumeM3: volume, items: Object.fromEntries(Object.entries(s.items).filter(([, n]) => n > 0)) },
      schedule: { date: s.date, window: s.window },
      estimate: { total: quote.total, status: quote.status, confidence: quote.confidence, reasons: quote.reasons },
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
            <a className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 px-5 font-semibold" href={`mailto:${site.email}?subject=${encodeURIComponent("Quote request")}&body=${encodeURIComponent(summaryText())}`}>
              Open email with my request
            </a>
          )}
        </div>
        {(wa || site.email) && <p className="mt-3 text-sm text-slate-600">Our team only receives your request once you press send.</p>}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-brand-900">Changed your mind? Nothing has been sent yet, so there is nothing to undo.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={() => editQuote(4)}>Edit my quote</Button>
            <button type="button" className="min-h-11 px-1 font-semibold text-brand-600 underline" onClick={startOver}>Cancel and start again</button>
            <a className="min-h-11 px-1 py-2 font-semibold text-slate-700 underline" href={href("/")}>Leave without sending</a>
          </div>
        </div>
      </div>
    );
  }

  const v = getVehicle(s.vehicleId);

  const lineItems = (
    <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-left text-sm">
      {quote.lines.map((l) => (
        <li key={l.label} className="flex justify-between gap-3"><span>{l.label}</span><span className="tabular-nums">{formatZar(l.amount)}</span></li>
      ))}
      {site.vatRegistered && <li className="flex justify-between gap-3"><span>VAT</span><span className="tabular-nums">{formatZar(quote.vat)}</span></li>}
    </ul>
  );
  const notes = (
    <>
      {quote.status === "needs_review" && (
        <p className="mt-2 text-left text-sm text-amber-700">Our team will check this price before confirming it. {quote.reasons[0]}</p>
      )}
      <p className="mt-2 text-left text-sm text-slate-600">This is an estimate. It excludes packing and dismantling unless you chose Full service. Our team confirms the final price.</p>
    </>
  );
  const figures = (
    <div>
      <div className="text-sm text-slate-600">Estimate{site.vatRegistered ? " incl. VAT" : ""}</div>
      <div className="text-3xl font-semibold tracking-tight text-brand-900">{formatZar(quote.total)}</div>
      <div className="text-sm text-slate-600">50% deposit to confirm: {formatZar(quote.deposit)}</div>
    </div>
  );

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
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Where are you moving?</h2>
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

        {step === 1 && (
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
            <div className="rounded-2xl bg-slate-100 p-5">
              <div className="font-semibold">Not sure which vehicle fits?</div>
              <p className="mt-1 text-sm text-slate-600">Add your furniture and boxes and we will suggest one.</p>
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setAssistant(true)}>
                Add items with the load assistant
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
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

        {step === 3 && (
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

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Review and request your quote</h2>
            <p className="-mt-3 text-sm text-slate-600">Check your details, then add how we can reach you. This is a request, not a booking, and it is free.</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-slate-50 p-4 text-sm">
              <dt className="text-slate-500">From</dt><dd>{clean(s.pickup)}</dd>
              <dt className="text-slate-500">To</dt><dd>{clean(s.dropoff)}</dd>
              <dt className="text-slate-500">Vehicle</dt><dd>{v?.name} x {s.trips}, {getTier(s.tier).name}</dd>
              <dt className="text-slate-500">When</dt><dd>{s.date}, {s.window}</dd>
            </dl>
            <div className="-mt-2 flex flex-wrap gap-x-4 text-sm">
              {([["Edit route", 0], ["Edit vehicle", 1], ["Edit move details", 2], ["Edit date", 3]] as const).map(([label, to]) => (
                <button key={label} type="button" className="min-h-11 font-semibold text-brand-600 underline" onClick={() => setStep(to)}>{label}</button>
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
              <p className="text-sm text-slate-600">Add your route and vehicle to see your estimate.</p>
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
            <p className="text-sm text-slate-600">Add your route and vehicle to see your estimate.</p>
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
          patch({ vehicleId: rec.vehicleId, trips: rec.trips, helpers: Math.max(s.helpers, rec.helpers) });
          setAssistant(false);
        }}
      />
    </div>
  );
}
