import { renderToString } from "react-dom/server";
import { App } from "./App";
import { site } from "./config/site";
import { buildHead } from "./lib/seo";
import { findRoute, notFoundRoute, routes } from "./routes";

export function render(path: string): { html: string; head: string } {
  const route = path === notFoundRoute.path ? notFoundRoute : findRoute(path);
  return {
    html: renderToString(<App path={path} />),
    head: buildHead(site, route),
  };
}

export const pages = [...routes, notFoundRoute].map(({ path, noindex, priority, changefreq }) => ({
  path,
  noindex: Boolean(noindex),
  priority,
  changefreq,
}));

export const siteUrl = site.url;
