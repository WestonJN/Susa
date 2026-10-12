import { site } from "../config/site";
import { Container } from "../components/ui";

const contact = () => site.email || "the contact details on this website";

export function Privacy() {
  return (
    <Container className="prose-lg max-w-3xl py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold text-brand-900">Privacy notice (POPIA)</h1>
      <p className="mt-2 text-sm text-slate-500">Version {site.consentVersion}</p>
      <div className="mt-6 space-y-5 text-slate-700">
        <p>{site.name} respects your privacy and processes personal information in line with the Protection of Personal Information Act, 2013 (POPIA).</p>
        <section>
          <h2 className="text-xl font-bold text-brand-900">Who is responsible</h2>
          <p>{site.name} is the responsible party. Contact us at {contact()} for any privacy question or request.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">What we collect and why</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Your name, mobile number and optional email, to contact you about your quote and move.</li>
            <li>Pick-up and drop-off addresses, move date and inventory, to price and plan your move.</li>
            <li>Technical data such as your IP address, used for security and abuse prevention.</li>
          </ul>
          <p className="mt-2">We do not ask for your ID number through this website.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">Who sees it</h2>
          <p>Our staff, and drivers or crew assigned to your move, see only what they need to do the job. We use service providers (for example hosting and messaging) under agreements that require them to protect your information. We do not sell personal information.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">Address search</h2>
          <p>When you type an address on the quote form, the text you type is sent to an address-search service (Google Places when enabled, otherwise the OpenStreetMap-based Photon service), and the coordinates of the two addresses you pick are sent to a routing service (OSRM) to work out the driving distance. Your name, phone number and email are not sent to these services.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">Automated assistance</h2>
          <p>We use automated tools to prepare quotes and organise work. A person reviews bookings, pricing exceptions and customer communications before they are confirmed.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">How long we keep it</h2>
          <p>We keep quote requests and move records only as long as needed for the move, our legal and accounting obligations, and handling any claim or dispute, then delete or de-identify them.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">Your rights</h2>
          <p>You may ask to access, correct or delete your personal information, and object to its processing, by contacting us. If you are unhappy with how we handle a request, you can complain to the Information Regulator at <a className="font-semibold text-brand-600 underline" href="https://inforegulator.org.za" rel="noopener">inforegulator.org.za</a>.</p>
        </section>
      </div>
    </Container>
  );
}

export function Terms() {
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold text-brand-900">Terms of service</h1>
      <div className="mt-6 space-y-5 text-slate-700">
        <p>These terms summarise how quotes and bookings work with {site.name}. Questions? Contact {contact()}.</p>
        <section>
          <h2 className="text-xl font-bold text-brand-900">Quotes</h2>
          <p>Online prices are estimates based on the details you enter. A booking is only confirmed when our team confirms availability and the final price with you. Requesting a quote does not create a booking and you are not charged.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">What is excluded</h2>
          <p>Quotes exclude packing, wrapping, dismantling and preparation services unless you chose Full service or arranged them separately.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">Goods-in-transit cover</h2>
          <p>Cover is optional, subject to approval for the declared value, and limits, exclusions and full terms apply.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-brand-900">Changes and cancellations</h2>
          <p>Tell us as early as possible if your plans change. Any cancellation or change terms will be set out in your booking confirmation.</p>
        </section>
        <p className="text-sm text-slate-500">This is a plain-language summary and should be reviewed by a legal adviser before launch.</p>
      </div>
    </Container>
  );
}
