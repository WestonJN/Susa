/**
 * Static prerender: turns every route into real HTML (content + <head> SEO tags) so crawlers
 * and slow mobile connections get content without waiting for JavaScript. The client then
 * hydrates the same markup. Also emits sitemap.xml, robots.txt, 404.html, .nojekyll, CNAME.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

interface PageInfo {
  path: string;
  noindex: boolean;
}
interface ServerBundle {
  render: (path: string) => { html: string; head: string };
  pages: PageInfo[];
  siteUrl: string;
}

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");

const bundle = (await import(pathToFileURL(join(root, "dist-server", "entry-server.js")).href)) as ServerBundle;
const template = readFileSync(join(dist, "index.html"), "utf8");
if (!template.includes("<!--app-->") || !template.includes("<!--head-->")) {
  throw new Error("dist/index.html is missing the <!--head--> / <!--app--> placeholders");
}

// Never let the placeholder domain (or an explicit flag) get indexed.
const staging = bundle.siteUrl.includes("example.co.za") || process.env.BLOCK_INDEXING === "true";
if (staging) console.warn("⚠ Staging mode: robots.txt blocks crawling and pages are noindex. Set VITE_SITE_URL to go live.");

const outPath = (route: string) => (route === "/404/" ? join(dist, "404.html") : join(dist, route.replace(/^\//, ""), "index.html"));

for (const page of bundle.pages) {
  const { html, head } = bundle.render(page.path);
  const headFinal = staging ? head.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex,nofollow" />') : head;
  const out = template.replace("<!--head-->", headFinal).replace("<!--app-->", html);
  const file = outPath(page.path);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, out);
}

const urls = bundle.pages.filter((p) => !p.noindex).map((p) => `${bundle.siteUrl}${p.path}`);
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`,
);

writeFileSync(
  join(dist, "robots.txt"),
  staging
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\n\nSitemap: ${bundle.siteUrl}/sitemap.xml\n`,
);

writeFileSync(join(dist, ".nojekyll"), "");
if (process.env.CUSTOM_DOMAIN) writeFileSync(join(dist, "CNAME"), `${process.env.CUSTOM_DOMAIN.trim()}\n`);
if (!existsSync(join(dist, "404.html"))) copyFileSync(join(dist, "index.html"), join(dist, "404.html"));

console.log(`Prerendered ${bundle.pages.length} pages, ${urls.length} in sitemap.`);

if (!process.env.VITE_LEGAL_NAME || !process.env.VITE_BUSINESS_ADDRESS) {
  console.warn("::warning title=Business details missing::Set the LEGAL_NAME, REG_NUMBER and BUSINESS_ADDRESS repository variables (and VAT_NUMBER if registered). Online businesses in South Africa are expected to show them.");
}
