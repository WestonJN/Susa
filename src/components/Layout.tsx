import type { ReactNode } from "react";
import { site } from "../config/site";
import { areas } from "../content/areas";
import { href } from "../lib/url";
import { Container, LinkButton } from "./ui";

function Logo() {
  return (
    <a href={href("/")} className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-brand-900" aria-label={`${site.name} home`}>
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#0f2a43" />
        <path d="M10 38h28V22H14a4 4 0 0 0-4 4v12Zm30-12h8l8 8v4H40V26Z" fill="#f59e0b" />
        <circle cx="22" cy="44" r="5" fill="#fff" />
        <circle cx="46" cy="44" r="5" fill="#fff" />
      </svg>
      {site.name}
    </a>
  );
}

const nav = [
  { label: "Home moving", to: "/services/home-moving/" },
  { label: "Truck hire", to: "/services/truck-hire/" },
] as const;

export function whatsappLink(message?: string): string | null {
  if (!site.whatsapp) return null;
  return `https://wa.me/${site.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function Layout({ children }: { children: ReactNode }) {
  const wa = whatsappLink("Hi, I would like a moving quote.");
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-3">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-3">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {nav.map((n) => (
              <a key={n.to} href={href(n.to)} className="text-sm font-medium text-slate-700 hover:text-brand-600">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LinkButton href={href("/get-quote/")} className="min-h-10 px-4 text-sm">
              Get a quote
            </LinkButton>
            <details className="relative md:hidden">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300" aria-label="Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {nav.map((n) => (
                  <a key={n.to} href={href(n.to)} className="block rounded-lg px-3 py-3 font-medium hover:bg-slate-100">
                    {n.label}
                  </a>
                ))}
              </div>
            </details>
          </div>
        </Container>
      </header>

      <main id="main">{children}</main>

      <footer className="mt-8 bg-brand-900 text-slate-200">
        <Container className="grid gap-8 py-12 sm:grid-cols-3">
          <div>
            <div className="text-lg font-bold text-white">{site.name}</div>
            <p className="mt-2 text-sm text-slate-300">{site.tagline}.</p>
            {site.email && (
              <p className="mt-3 text-sm">
                <a className="underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
            )}
            {site.phone && (
              <p className="text-sm">
                <a className="underline" href={`tel:${site.phone.replace(/\s/g, "")}`}>
                  {site.phone}
                </a>
              </p>
            )}
          </div>
          <nav aria-label="Service areas">
            <div className="font-semibold text-white">Where we move</div>
            <ul className="mt-2 space-y-1 text-sm">
              {areas.map((a) => (
                <li key={a.slug}>
                  <a className="hover:underline" href={href(`/areas/${a.slug}/`)}>
                    Movers in {a.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company">
            <div className="font-semibold text-white">Company</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li><a className="hover:underline" href={href("/get-quote/")}>Get a quote</a></li>
              <li><a className="hover:underline" href={href("/drive-with-us/")}>Drive with us (coming soon)</a></li>
              <li><a className="hover:underline" href={href("/privacy/")}>Privacy notice (POPIA)</a></li>
              <li><a className="hover:underline" href={href("/terms/")}>Terms of service</a></li>
              <li><a className="hover:underline" href={href("/cancellations/")}>Cancellations and refunds</a></li>
              <li><a className="hover:underline" href={href("/cookies/")}>Cookie policy</a></li>
              <li><a className="hover:underline" href={href("/data-request/")}>Data request (delete or access)</a></li>
            </ul>
          </nav>
        </Container>
        <div className="border-t border-white/10 py-4 px-4 text-center text-xs text-slate-300">
          © {new Date().getFullYear()} {site.legalName || site.name}.
          {site.regNumber && <> Reg. {site.regNumber}.</>}
          {site.vatNumber && <> VAT {site.vatNumber}.</>}
          {site.address && <> {site.address}.</>} All rights reserved.
        </div>
      </footer>

      {wa && (
        <a
          href={wa}
          rel="noopener"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.4-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4Z" />
          </svg>
        </a>
      )}
    </>
  );
}
