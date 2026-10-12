import type { ReactNode } from "react";
import { site } from "./config/site";
import { areas } from "./content/areas";
import { breadcrumbLd, organizationLd, serviceLd, websiteLd, type PageMeta } from "./lib/seo";
import { Home } from "./pages/Home";
import { QuotePage } from "./pages/QuotePage";
import { ServicePage, services } from "./pages/Service";
import { AreaPage } from "./pages/AreaPage";
import { DriveWithUs } from "./pages/DriveWithUs";
import { Privacy, Terms } from "./pages/Legal";
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
    title: `Get an Instant Moving Quote | ${site.name}`,
    description: "Search your addresses, choose a truck and see your moving price build up live. Furniture removals and truck transport in Johannesburg.",
    priority: 0.9,
    changefreq: "monthly",
    jsonLd: [crumbs("Get a quote", "/get-quote/")],
    element: <QuotePage />,
  },
  ...Object.values(services).map<Route>((s) => {
    const path = `/services/${s.slug}/`;
    return {
      path,
      title: `${s.name} in Johannesburg | ${site.name}`,
      description: s.lead,
      priority: 0.8,
      changefreq: "monthly",
      jsonLd: [serviceLd(site, s.name, s.lead, path), crumbs(s.name, path)],
      element: <ServicePage slug={s.slug} />,
    };
  }),
  ...areas.map<Route>((a) => {
    const path = `/areas/${a.slug}/`;
    return {
      path,
      title: `Movers & Truck Transport in ${a.name} | ${site.name}`,
      description: `Furniture removals and truck transport in ${a.name}. Pick your truck, see the price build up and request a quote online.`,
      priority: 0.7,
      changefreq: "monthly",
      jsonLd: [serviceLd(site, `Moving services in ${a.name}`, a.intro, path, `${a.name}, Gauteng, South Africa`), crumbs(`Movers in ${a.name}`, path)],
      element: <AreaPage area={a} />,
    };
  }),
  {
    path: "/drive-with-us/",
    title: `Drive With Us (Coming Soon) | ${site.name}`,
    description: "Driver partnerships are coming soon.",
    noindex: true,
    jsonLd: [crumbs("Drive with us", "/drive-with-us/")],
    element: <DriveWithUs />,
  },
  {
    path: "/privacy/",
    title: `Privacy Notice (POPIA) | ${site.name}`,
    description: `How ${site.name} collects, uses and protects personal information under POPIA.`,
    priority: 0.3,
    changefreq: "yearly",
    element: <Privacy />,
  },
  {
    path: "/terms/",
    title: `Terms of Service | ${site.name}`,
    description: `Plain-language terms for quotes, bookings and cover with ${site.name}.`,
    priority: 0.3,
    changefreq: "yearly",
    element: <Terms />,
  },
];

export const notFoundRoute: Route = {
  path: "/404/",
  title: `Page not found | ${site.name}`,
  description: "This page could not be found.",
  noindex: true,
  element: <NotFound />,
};

export function findRoute(key: string): Route {
  return routes.find((r) => r.path === key) ?? notFoundRoute;
}
