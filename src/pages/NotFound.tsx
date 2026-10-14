import { href } from "../lib/url";
import { Container, LinkButton } from "../components/ui";

export function NotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-4xl font-extrabold text-brand-900">Page not found</h1>
      <p className="mt-3 text-slate-600">We could not find that page. The link may be old or mistyped.</p>
      <div className="mt-6 flex justify-center gap-3">
        <LinkButton href={href("/")}>Go to the home page</LinkButton>
        <LinkButton href={href("/get-quote/")} variant="ghost">Get a quote</LinkButton>
      </div>
    </Container>
  );
}
