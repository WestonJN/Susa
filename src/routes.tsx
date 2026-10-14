import type { ReactNode } from "react";
import { site } from "./config/site";
import { areas } from "./content/areas";
import { breadcrumbLd, organizationLd, serviceLd, websiteLd, type PageMeta } from "./lib/seo";
import { Home } from "./pages/Home";
import { QuotePage } from "./pages/QuotePage";
import { ServicePage, services } from "./pages/Service";
import { AreaPage } from "./pages/AreaPage";
import { DriveWithUs } from "./pages/DriveWithUs";
import { Cancellations, Cookies, Privacy, Terms } from "./pages/Legal";
import { DataRequest } from "./pages/DataRequest";
import { NotFound } from "./pages/NotFound";

export interface Route extends PageMeta {
  element: ReactNode;
}

const crumbs = (name: string, path: string) =>
  breadcrumbLd(site, [{ name: "Home", path: "/" }, { name, path }]);

export const routes: Route[] = [
  {
    path: "/",
    title: `${site.name} | Furniture Removals & Truck Transport in Johannesburg`,
    description: site.description,
    priority: 1,
    changefreq: "weekly",
    jsonLd: [organizationLd(site), websiteLd(site)],
    element: <Home />,
  },
  {
    path: "/get-quote/",
    title: `Instant Moving Quote in Johannesburg | ${site.name}`,
    description: "Enter your Johannesburg addresses, choose a bakkie or bakkie with trailer and see your moving estimate build up. Free to request, and not a booking.",
    priority: 0.9,
    changefreq: "monthly",
    jsonLd: [crumbs("Get a quote", "/get-quote/")],
    element: <QuotePage />,
  },
  ...Object.values(services).map<Route>((s) => {
    const path = `/services/${s.slug}/`;
    return {
      path,
      title: `${s.metaTitle} | ${site.name}`,
      description: s.metaDescription,
      priority: 0.8,
      changefreq: "monthly",
      jsonLd: [serviceLd(site, s.name, s.metaDescription, path), crumbs(s.name, path)],
      element: <ServicePage slug={s.slug} />,
    };
  }),
  ...areas.map<Route>((a) => {
    const path = `/areas/${a.slug}/`;
    return {
      path,
      title: `Movers & Truck Transport in ${a.name} | ${site.name}`,
      description: `Furniture removals and truck transport in ${a.name}. Choose a bakkie or bakkie with trailer, see your estimate build up and request a free quote online.`,
      priority: 0.7,
      changefreq: "monthly",
      jsonLd: [serviceLd(site, `Moving services in ${a.name}`, a.intro, path, `${a.name}, Gauteng, South Africa`), crumbs(`Movers in ${a.name}`, path)],
      element: <AreaPage area={a} />,
    };
  }),
  {
    path: "/drive-with-us/",
    title: `Drive With Us (Coming Soon) | ${site.name}`,
    description: "Driver partnerships are coming soon. We are not taking driver applications yet. Meanwhile, you can get an estimate for a move in Johannesburg.",
    noindex: true,
    jsonLd: [crumbs("Drive with us", "/drive-with-us/")],
    element: <DriveWithUs />,
  },
  {
    path: "/privacy/",
    title: `Privacy Notice (POPIA) | ${site.name}`,
    description: `How ${site.name} collects and uses your personal information when you request a quote in Johannesburg, and how to use your rights under POPIA.`,
    priority: 0.3,
    changefreq: "yearly",
    element: <Privacy />,
  },
  {
    path: "/terms/",
    title: `Terms of Service | ${site.name}`,
    description: `Plain-language terms for quotes, bookings and goods-in-transit cover with ${site.name}, a furniture removal and truck transport service in Johannesburg.`,
    priority: 0.3,
    changefreq: "yearly",
    element: <Terms />,
  },
  {
    path: "/cancellations/",
    title: `Cancellation & Refund Policy | ${site.name}`,
    description: `How cancelling, rescheduling and refunds work when you book a furniture removal or truck transport job with ${site.name} in Johannesburg.`,
    priority: 0.3,
    changefreq: "yearly",
    element: <Cancellations />,
  },
  {
    path: "/cookies/",
    title: `Cookie Policy | ${site.name}`,
    description: `${site.name} does not use cookies, analytics or advertising trackers on this website. Read what your browser may still share and why there is no cookie banner.`,
    priority: 0.2,
    changefreq: "yearly",
    element: <Cookies />,
  },
  {
    path: "/data-request/",
    title: `Your Data Request (POPIA) | ${site.name}`,
    description: `Ask ${site.name} to delete, correct or send you a copy of the personal information we hold about you. A POPIA data request for Johannesburg customers.`,
    priority: 0.2,
    changefreq: "yearly",
    element: <DataRequest />,
  },
];

export const notFoundRoute: Route = {
  path: "/404/",
  title: `Page not found | ${site.name}`,
  description: "We could not find that page. Go to the home page, or get an estimate for a furniture removal or truck transport job in Johannesburg.",
  noindex: true,
  element: <NotFound />,
};

export function findRoute(key: string): Route {
  return routes.find((r) => r.path === key) ?? notFoundRoute;
}
