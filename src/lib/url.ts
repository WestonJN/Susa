const base = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Internal link honouring the deploy base path (`/` or `/<repo>/`). */
export function href(path: string): string {
  const clean = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return `${base}${clean}`;
}

/** Strip the deploy base and normalise to a trailing-slash route key. */
export function routeKey(pathname: string): string {
  let p = pathname.split(/[?#]/)[0] ?? "/";
  if (base && p.startsWith(base)) p = p.slice(base.length) || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  return p === "/" ? "/" : `${p.replace(/\/+$/, "")}/`;
}

export function absoluteUrl(siteUrl: string, path: string): string {
  return `${siteUrl}${path === "/" ? "/" : path}`;
}
