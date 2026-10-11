import "./index.css";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

const tree = <App path={window.location.pathname} />;

// Production HTML is prerendered, so hydrate it. In `vite dev` the root is empty.
if (import.meta.env.PROD && container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
