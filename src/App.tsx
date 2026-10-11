import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { findRoute } from "./routes";
import { routeKey } from "./lib/url";

export function App({ path }: { path: string }) {
  const route = findRoute(routeKey(path));
  // Prerendered pages already carry their <title>; this only matters in `vite dev`.
  useEffect(() => {
    if (document.title !== route.title) document.title = route.title;
  }, [route.title]);
  return <Layout>{route.element}</Layout>;
}
