import { site } from "../config/site";
import { href } from "../lib/url";
import { Container } from "../components/ui";
import { whatsappLink } from "../components/Layout";

export function DriveWithUs() {
  const wa = whatsappLink("Hi, I would like to apply as a driver.");
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold text-brand-900">Drive with {site.name}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        We are building a network of reliable bakkie and truck owners in Gauteng. If you have a roadworthy vehicle and moving experience, we would like to hear from you.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-slate-700">
        <li>We review your profile, vehicle details and required documents before activating you.</li>
        <li>Approved drivers may be considered for suitable jobs. Work is not guaranteed.</li>
        <li>Documents are handled under our <a className="font-semibold text-brand-600 underline" href={href("/privacy/")}>privacy notice</a>.</li>
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        {wa && <a className="inline-flex min-h-12 items-center rounded-xl bg-[#25D366] px-5 font-semibold text-white" href={wa} rel="noopener">Apply on WhatsApp</a>}
        {site.email && <a className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 px-5 font-semibold" href={`mailto:${site.email}?subject=Driver%20application`}>Apply by email</a>}
      </div>
    </Container>
  );
}
