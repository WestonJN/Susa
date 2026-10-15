import { Fragment, type ReactNode } from "react";
import { site } from "../config/site";
import { Container } from "../components/ui";
import { href } from "../lib/url";

const contact = () => site.email || "the contact details on this website";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "2026-10-13" becomes "13 October 2026" without relying on the runtime locale. */
const updated = () => {
  const [y, m, d] = site.consentVersion.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : site.consentVersion;
};
const H = ({ children }: { children: ReactNode }) => <h2 className="text-xl font-bold text-brand-900">{children}</h2>;
const A = ({ to, children }: { to: string; children: ReactNode }) => <a className="font-semibold text-brand-600 underline" href={href(to)}>{children}</a>;
const Page = ({ title, children }: { title: string; children: ReactNode }) => (
  <Container className="max-w-3xl py-10 sm:py-14">
    <h1 className="text-3xl font-extrabold text-brand-900">{title}</h1>
    <p className="mt-2 text-sm text-slate-600">Last updated {updated()}</p>
    <div className="mt-6 space-y-5 text-slate-700">{children}</div>
    <p className="mt-8 text-sm text-slate-600">Questions about this page? Contact {contact()}.</p>
  </Container>
);

export function BusinessDetails() {
  const rows: Array<[string, string]> = [
    ["Trading name", site.name], ["Registered name", site.legalName], ["Registration number", site.regNumber],
    ["VAT number", site.vatNumber], ["Address", site.address], ["Email", site.email], ["Phone", site.phone],
  ];
  const shown = rows.filter(([, v]) => v);
  return (
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
      {shown.map(([k, v]) => (<Fragment key={k}><dt className="font-semibold text-brand-900">{k}</dt><dd>{v}</dd></Fragment>))}
    </dl>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy notice (POPIA)">
      <p>{site.name} respects your privacy and processes personal information in line with the Protection of Personal Information Act, 2013 (POPIA).</p>
      <section>
        <H>Who is responsible</H>
        <BusinessDetails />
        <p className="mt-2">{site.name} is the responsible party. For any privacy question or request, contact {contact()}, or use our <A to="/data-request/">data request page</A>.</p>
      </section>
      <section>
        <H>What we collect and why</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name, mobile number and optional email, to contact you about your quote and move.</li>
          <li>Pick-up and drop-off addresses, move date and inventory, to price and plan your move.</li>
          <li>Technical data such as your IP address, which the services that host this site and power the address search receive when you use them.</li>
        </ul>
        <p className="mt-2">We collect only what we need for the quote and the move. We do not ask for your ID number, banking details or payment card through this website.</p>
      </section>
      <section>
        <H>Who sees it, and where it goes</H>
        <p>Our staff, and drivers or crew assigned to your move, see only what they need to do the job. We do not sell personal information. These outside services are involved:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>GitHub Pages</strong> hosts this website (United States). It receives your IP address when you load a page, as any host does.</li>
          <li><strong>Address search:</strong> the text you type in an address box goes to Photon, an OpenStreetMap-based service (Germany), or to Google Places (United States) if we have enabled it.</li>
          <li><strong>Your location:</strong> only if you tap "Use my current location". Your browser asks your permission first, and the coordinates are sent to Photon to find the street address. We do not store them unless you send your request.</li>
          <li><strong>OSRM</strong> (routing) receives the coordinates of the two addresses you pick to work out the driving distance.</li>
          <li><strong>WhatsApp or email:</strong> if you send your request that way, it goes through your own WhatsApp or email app, under their terms.</li>
        </ul>
        <p className="mt-2">Your name, phone number and email are never sent to the address-search or routing services. Some of these providers are outside South Africa, so your information may be processed abroad.</p>
      </section>
      <section>
        <H>Cookies and tracking</H>
        <p>We do not use cookies, analytics or advertising trackers. See the <A to="/cookies/">cookie policy</A>.</p>
      </section>
      <section>
        <H>Messages and unsubscribing</H>
        <p>We only contact you about the quote or move you asked about. We do not send marketing emails or messages. If that ever changes we will ask for your separate permission, and every marketing message will include an unsubscribe link or a reply-STOP option.</p>
      </section>
      <section>
        <H>Children</H>
        <p>Our services are for people aged 18 and over. We do not knowingly collect information from children. If you think a child has sent us information, tell us and we will delete it.</p>
      </section>
      <section>
        <H>Automated assistance</H>
        <p>We use automated tools to prepare quotes and organise work. A person reviews bookings, pricing exceptions and customer communications before they are confirmed.</p>
      </section>
      <section>
        <H>How long we keep it</H>
        <p>We keep quote requests and move records only as long as needed for the move, our legal and accounting obligations, and handling any claim or dispute, then delete or de-identify them.</p>
      </section>
      <section>
        <H>Your rights, including deletion</H>
        <p>You may ask to access, correct or delete your personal information, and object to its processing. Use the <A to="/data-request/">data request page</A> or contact {contact()}. We reply within 30 days. We may need to keep some records the law requires (for example invoices). If you are unhappy with how we handle a request, you can complain to the Information Regulator at <a className="font-semibold text-brand-600 underline" href="https://inforegulator.org.za" rel="noopener">inforegulator.org.za</a>.</p>
      </section>
    </Page>
  );
}

export function Terms() {
  return (
    <Page title="Terms of service">
      <p>These terms explain how quotes and bookings work with {site.name}. Questions? Contact {contact()}.</p>
      <section><H>Who we are</H><BusinessDetails /></section>
      <section>
        <H>Who can use this site</H>
        <p>You must be 18 or older to request a quote or make a booking.</p>
      </section>
      <section>
        <H>Quotes and prices</H>
        <p>Online prices are estimates based on the details you enter. A booking is only confirmed when our team confirms availability and the final price with you. Requesting a quote does not create a booking and you are not charged.</p>
        <p className="mt-2">The estimate shows each part of the price: transport, crew, stairs, tolls and packing where chosen. Any change to that price, such as extra trips, more items than listed or longer waiting time, is explained and agreed with you before it is charged. We do not add fees you have not been told about.</p>
      </section>
      <section>
        <H>What is excluded</H>
        <p>Quotes exclude packing, wrapping, dismantling and preparation services unless you chose Full service or arranged them separately.</p>
      </section>
      <section>
        <H>Insurance and your belongings</H>
        <p>We do not currently offer goods-in-transit insurance. We handle your belongings with care, but please make sure your own household contents insurance covers them while they are being moved. Tell us about fragile, valuable or unusually heavy items, and keep cash, jewellery and important documents with you.</p>
      </section>
      <section>
        <H>What we move, and what we do not</H>
        <p>We move household furniture, appliances and boxes, small office moves, furniture deliveries, and unwanted items or donations to a drop-off point you choose. We may refuse hazardous goods (gas, fuel, chemicals), firearms, perishable food, live animals and plants, and anything illegal or unsafe to carry.</p>
      </section>
      <section>
        <H>Deposit</H>
        <p>A 50% deposit confirms your booking once we have agreed the final price with you. We tell you how to pay when we confirm. The balance is due on the day of the move, unless we agree otherwise in writing.</p>
      </section>
      <section>
        <H>Changes and cancellations</H>
        <p>See our <A to="/cancellations/">cancellation and refund policy</A>.</p>
      </section>
      <section>
        <H>Privacy</H>
        <p>See our <A to="/privacy/">privacy notice</A>.</p>
      </section>
      <section>
        <H>Law and complaints</H>
        <p>These terms are governed by South African law. Nothing here limits your rights under the Consumer Protection Act. Contact {contact()} first with any complaint so we can fix it.</p>
      </section>
    </Page>
  );
}

export function Cancellations() {
  return (
    <Page title="Cancellation and refund policy">
      <p>This policy applies to bookings confirmed with {site.name}. Requesting a quote is free and creates no obligation.</p>
      <section>
        <H>Cancelling or rescheduling</H>
        <p>Tell us as early as you can, using the contact details on this website. If you cancel or move your booking at least 48 hours before the start time, you can move the deposit to another available date at no cost, or have it refunded. If you cancel with less than 48 hours' notice, or the crew cannot start because access or the load is not ready, the deposit is not refunded.</p>
      </section>
      <section>
        <H>Refunds</H>
        <p>Refunds go back to the account you paid from, normally within 7 working days. The deposit is 50% of the confirmed price. If we cancel or cannot do your move, we refund everything you have paid and help you find another date.</p>
      </section>
      <section>
        <H>If something goes wrong</H>
        <p>Tell {contact()} about any damage or problem as soon as you can, ideally on the day, and include photos. We will review it and reply in writing. This policy does not limit your rights under the Consumer Protection Act.</p>
      </section>
    </Page>
  );
}

export function Cookies() {
  return (
    <Page title="Cookie policy">
      <p>This website does <strong>not</strong> set cookies and does not use analytics, advertising or social-media trackers. Because of that, there is no cookie banner: there is nothing to consent to.</p>
      <section>
        <H>What your browser may still do</H>
        <p>Like any website, our host (GitHub Pages) and the services that power the address search receive technical information such as your IP address when your browser contacts them. See the <A to="/privacy/">privacy notice</A> for who they are.</p>
      </section>
      <section>
        <H>If this changes</H>
        <p>If we later add analytics or any non-essential cookies, we will update this page and show a banner that lets you accept or refuse them before anything is set.</p>
      </section>
    </Page>
  );
}
