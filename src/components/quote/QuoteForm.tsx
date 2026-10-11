import { useEffect, useMemo, useState } from "react";
import { site } from "../../config/site";
import { getTier, getVehicle, tiers, totalVolume, vehicles, type TierId } from "../../lib/catalog";
import { calculateQuote, formatZar } from "../../lib/pricing";
import { newIdempotencyKey, submitQuoteRequest, type QuoteRequestV1 } from "../../lib/api";
import { clean, isEmail, isFutureOrToday, normaliseZaPhone, todayIso } from "../../lib/validation";
import { Button, Counter, Field, inputClass } from "../ui";
import { whatsappLink } from "../Layout";
import { href } from "../../lib/url";
import { LoadAssistant } from "./LoadAssistant";

const STEPS = ["Route", "Truck", "Move details", "When", "Review"] as const;
const WINDOWS = ["Early morning (06:00 to 09:00)", "Morning (09:00 to 12:00)", "Afternoon (12:00 to 16:00)", "Flexible"] as const;

interface FormState {
  pickup: string;
  dropoff: string;
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
  cover: boolean;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  website: string; // honeypot
}

const initial: FormState = {
  pickup: "",
  dropoff: "",
  distanceKm: "",
  tollEstimate: "",
  vehicleId: null,
  tier: "transport",
  items: {},
  helpers: 0,
  floors: 0,
  trips: 1,
  date: "",
  window: WINDOWS[1],
  cover: false,
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
    if (clean(s.pickup).length < 5) e.pickup = "Enter the pick-up address or suburb.";
    if (clean(s.dropoff).length < 5) e.dropoff = "Enter the drop-off address or suburb.";
    const km = Number(s.distanceKm);
    if (!s.distanceKm || !Number.isFinite(km) || km <= 0 || km > 2000) e.distanceKm = "Enter the approximate distance in km (1 to 2000).";
  }
  if (step === 1 && !s.vehicleId) e.vehicleId = "Choose a truck, or use the load assistant.";
  if (step === 3) {
    if (!isFutureOrToday(s.date, todayIso())) e.date = "Choose today or a future date.";
  }
  if (step === 4) {
    if (clean(s.name, 100).length < 2) e.name = "Enter your name.";
    if (!normaliseZaPhone(s.phone)) e.phone = "Enter a valid South African number, e.g. 082 123 4567.";
    if (s.email && !isEmail(s.email.trim())) e.email = "That email address does not look right.";
    if (!s.consent) e.consent = "Please accept the privacy notice so we can contact you.";
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
  const [minDate, setMinDate] = useState("");
  const [key] = useState(newIdempotencyKey);

  useEffect(() => setMinDate(todayIso()), []);
  const patch = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));

  const volume = totalVolume(s.items) || null;
  const quote = useMemo(
    () =>
      calculateQuote({
        vehicleId: s.vehicleId,
        tier: s.tier,
        distanceKm: s.distanceKm ? Number(s.distanceKm) : null,
        tollEstimate: Math.max(0, Number(s.tollEstimate) || 0),
        helpers: s.helpers,
        floors: s.floors,
        trips: s.trips,
        volumeM3: volume,
        vatRegistered: site.vatRegistered,
        vatRate: site.vatRate,
      }),
    [s.vehicleId, s.tier, s.distanceKm, s.tollEstimate, s.helpers, s.floors, s.trips, volume],
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
      `Truck: ${v?.name ?? "not chosen"} x ${s.trips} trip(s), ${getTier(s.tier).name}`,
      `Extra helpers: ${s.helpers}, floors: ${s.floors}`,
      `Date: ${s.date}, ${s.window}`,
      quote.status !== "incomplete" ? `Estimate: ${formatZar(quote.total)}` : "",
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
      route: { pickup: clean(s.pickup), dropoff: clean(s.dropoff), distanceKm: Number(s.distanceKm), tollEstimate: Math.max(0, Number(s.tollEstimate) || 0) },
      load: { vehicleId: s.vehicleId, tier: s.tier, trips: s.trips, helpers: s.helpers, floors: s.floors, volumeM3: volume, items: Object.fromEntries(Object.entries(s.items).filter(([, n]) => n > 0)) },
      schedule: { date: s.date, window: s.window },
      options: { goodsInTransitCoverRequested: s.cover },
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
        <h2 className="text-2xl font-bold text-brand-900">Request received</h2>
        <p className="mt-2 text-slate-700">
          Thanks {clean(s.name, 100).split(" ")[0]}. Our team will confirm availability and your final price before anything is booked. You have not been charged.
        </p>
        {reference && reference !== "pending" && <p className="mt-3 text-sm text-slate-600">Reference: <strong>{reference}</strong></p>}
        <a className="mt-6 inline-block font-semibold text-brand-600 underline" href={href("/")}>Back to home</a>
      </div>
    );
  }

  if (status === "fallback") {
    const wa = whatsappLink(summaryText());
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm" role="status">
        <h2 className="text-2xl font-bold text-brand-900">Send us your request</h2>
        <p className="mt-2 text-slate-700">Online booking is not switched on yet. Send these details to our team and we will confirm your price and availability.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-100 p-4 text-sm">{summaryText()}</pre>
        <div className="mt-4 flex flex-wrap gap-3">
          {wa && <a className="inline-flex min-h-12 items-center rounded-xl bg-[#25D366] px-5 font-semibold text-white" href={wa} rel="noopener">Send on WhatsApp</a>}
          {site.email && (
            <a className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 px-5 font-semibold" href={`mailto:${site.email}?subject=${encodeURIComponent("Quote request")}&body=${encodeURIComponent(summaryText())}`}>
              Send by email
            </a>
          )}
        </div>
      </div>
    );
  }

  const v = getVehicle(s.vehicleId);

  return (
    <div className="pb-28">
      <ol className="mb-6 flex items-center gap-1 overflow-x-auto text-xs font-semibold" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined} className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 ${i === step ? "bg-brand-900 text-white" : i < step ? "bg-brand-100 text-brand-900" : "bg-slate-200 text-slate-600"}`}>
            <span>{i + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-900">Where are you moving?</h2>
            <Field label="Pick-up address" htmlFor="pickup" error={errors.pickup} hint="Street and suburb, or estate name.">
              <input id="pickup" className={inputClass} autoComplete="street-address" maxLength={200} value={s.pickup} onChange={(e) => patch({ pickup: e.target.value })} placeholder="e.g. 12 Main Rd, Rosebank" />
            </Field>
            <Field label="Drop-off address" htmlFor="dropoff" error={errors.dropoff}>
              <input id="dropoff" className={inputClass} maxLength={200} value={s.dropoff} onChange={(e) => patch({ dropoff: e.target.value })} placeholder="e.g. 8 Oak Ave, Centurion" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Approximate distance (km)" htmlFor="km" error={errors.distanceKm} hint="Use a maps app for the driving distance. We re-check it before confirming.">
                <input id="km" className={inputClass} inputMode="decimal" value={s.distanceKm} onChange={(e) => patch({ distanceKm: e.target.value.replace(/[^\d.]/g, "") })} />
              </Field>
              <Field label="Toll costs, if any (R)" htmlFor="toll" hint="Optional. Leave blank if unsure.">
                <input id="toll" className={inputClass} inputMode="numeric" value={s.tollEstimate} onChange={(e) => patch({ tollEstimate: e.target.value.replace(/\D/g, "").slice(0, 5) })} />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-900">Choose your truck</h2>
            <fieldset>
              <legend className="sr-only">Truck</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {vehicles.map((veh) => (
                  <label key={veh.id} className={`block cursor-pointer rounded-xl border-2 p-4 ${s.vehicleId === veh.id ? "border-brand-600 bg-brand-50" : "border-slate-200"}`}>
                    <input type="radio" name="vehicle" className="sr-only" checked={s.vehicleId === veh.id} onChange={() => patch({ vehicleId: veh.id })} />
                    <div className="font-bold text-brand-900">{veh.name}</div>
                    <div className="text-sm text-slate-500">{veh.tonnage}</div>
                    <p className="mt-1 text-sm text-slate-700">{veh.bestFor}</p>
                  </label>
                ))}
              </div>
              {errors.vehicleId && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{errors.vehicleId}</p>}
            </fieldset>
            <div className="rounded-xl bg-slate-100 p-4">
              <div className="font-semibold">Not sure which truck fits?</div>
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setAssistant(true)}>
                Use load assistant
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-900">Tell us about the move</h2>
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
            <Counter label="Additional helpers" hint="On top of any crew in your service level." value={s.helpers} max={10} onChange={(n) => patch({ helpers: n })} />
            <Counter label="Floors (stairs, no lift)" hint="Count floors the crew must carry up or down." value={s.floors} max={20} onChange={(n) => patch({ floors: n })} />
            <Counter label="Number of trips" value={s.trips} min={1} max={10} onChange={(n) => patch({ trips: n })} />
            <button type="button" className="font-semibold text-brand-600 underline" onClick={() => setAssistant(true)}>
              Add your inventory for a more accurate quote
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-900">When do you need us?</h2>
            <Field label="Date of move" htmlFor="date" error={errors.date}>
              <input id="date" type="date" min={minDate} className={inputClass} value={s.date} onChange={(e) => patch({ date: e.target.value })} />
            </Field>
            <Field label="Arrival window" htmlFor="window">
              <select id="window" className={inputClass} value={s.window} onChange={(e) => patch({ window: e.target.value })}>
                {WINDOWS.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </Field>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={s.cover} onChange={(e) => patch({ cover: e.target.checked })} />
              <span>
                <span className="font-semibold">Request goods-in-transit cover</span>
                <span className="block text-sm text-slate-600">Subject to approved cover for the declared value. Limits, exclusions and full terms apply.</span>
              </span>
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-900">Review and send</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-slate-50 p-4 text-sm">
              <dt className="text-slate-500">From</dt><dd>{clean(s.pickup)}</dd>
              <dt className="text-slate-500">To</dt><dd>{clean(s.dropoff)}</dd>
              <dt className="text-slate-500">Truck</dt><dd>{v?.name} x {s.trips}, {getTier(s.tier).name}</dd>
              <dt className="text-slate-500">When</dt><dd>{s.date}, {s.window}</dd>
            </dl>
            <Field label="Your name" htmlFor="name" error={errors.name}>
              <input id="name" className={inputClass} autoComplete="name" maxLength={100} value={s.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field label="Mobile number" htmlFor="phone" error={errors.phone}>
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
                  I have read the <a className="font-semibold text-brand-600 underline" href={href("/privacy/")}>privacy notice</a> and agree that {site.name} may use these details to prepare my quote and contact me about this move.
                </span>
              </label>
              {errors.consent && <p role="alert" className="mt-1 text-sm font-medium text-red-700">{errors.consent}</p>}
            </div>
            {status === "error" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">We could not send your request. Please check your connection and try again.</p>}
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
              {status === "sending" ? "Sending…" : "Send quote request"}
            </Button>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur" aria-live="polite">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {quote.status === "incomplete" ? (
            <p className="text-sm text-slate-600">Add your route and truck to see a live estimate.</p>
          ) : (
            <>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Estimate{site.vatRegistered ? " incl. VAT" : ""}</div>
                <div className="text-2xl font-extrabold text-brand-900">{formatZar(quote.total)}</div>
              </div>
              <details className="max-w-[60%] text-right text-sm">
                <summary className="cursor-pointer font-semibold text-brand-600">How it adds up</summary>
                <ul className="mt-2 space-y-1 rounded-xl bg-slate-50 p-3 text-left">
                  {quote.lines.map((l) => (
                    <li key={l.label} className="flex justify-between gap-3"><span>{l.label}</span><span className="tabular-nums">{formatZar(l.amount)}</span></li>
                  ))}
                  {site.vatRegistered && <li className="flex justify-between gap-3"><span>VAT</span><span className="tabular-nums">{formatZar(quote.vat)}</span></li>}
                </ul>
                {quote.status === "needs_review" && (
                  <p className="mt-2 text-left text-amber-700">Our team will confirm this price. {quote.reasons[0]}</p>
                )}
                <p className="mt-2 text-left text-xs text-slate-500">Excludes packing and dismantling unless you chose Full service. Final price is confirmed by our team.</p>
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
