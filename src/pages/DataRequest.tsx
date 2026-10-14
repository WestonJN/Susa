import { useState } from "react";
import { site } from "../config/site";
import { Container, Field, inputClass } from "../components/ui";
import { whatsappLink } from "../components/Layout";
import { clean } from "../lib/validation";

const kinds = { delete: "Delete my personal information", access: "Send me a copy of my personal information", correct: "Correct my personal information" } as const;

export function DataRequest() {
  const [kind, setKind] = useState<keyof typeof kinds>("delete");
  const [who, setWho] = useState("");
  const [contactBy, setContactBy] = useState("");
  const text = `Data request (${kinds[kind]}). Name: ${clean(who) || "-"}. Phone or email I used: ${clean(contactBy) || "-"}.`;
  const wa = whatsappLink(text);
  const mail = site.email ? `mailto:${site.email}?subject=${encodeURIComponent("Data request")}&body=${encodeURIComponent(text)}` : null;
  return (
    <Container className="max-w-xl py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold text-brand-900">Data request</h1>
      <p className="mt-3 text-slate-700">Ask us to delete, correct or send you a copy of the personal information we hold about you. Fill in the form below, then send the message from your own email or WhatsApp. We reply within 30 days. We may need to confirm it is you, and we may have to keep records the law requires, such as invoices.</p>
      <div className="mt-6 space-y-4">
        <Field label="What do you need?" htmlFor="kind">
          <select id="kind" className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as keyof typeof kinds)}>
            {Object.entries(kinds).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Your name" htmlFor="who"><input id="who" className={inputClass} value={who} onChange={(e) => setWho(e.target.value)} autoComplete="name" /></Field>
        <Field label="Phone or email you used with us" htmlFor="by" hint="This helps us find your records and check it is you."><input id="by" className={inputClass} value={contactBy} onChange={(e) => setContactBy(e.target.value)} /></Field>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {mail && <a className="inline-flex min-h-12 items-center rounded-xl bg-accent-500 px-5 font-semibold text-brand-900" href={mail}>Open email with this request</a>}
        {wa && <a className="inline-flex min-h-12 items-center rounded-xl border-2 border-brand-900 px-5 font-semibold text-brand-900" href={wa} rel="noopener">Open WhatsApp with this request</a>}
      </div>
      {!mail && !wa && <p className="mt-4 text-slate-700">The email and WhatsApp buttons are not available yet. Please check back soon.</p>}
      <p className="mt-4 text-sm text-slate-600">The buttons open your own email or WhatsApp app with this message filled in. Nothing is sent from this page until you press send there.</p>
    </Container>
  );
}
