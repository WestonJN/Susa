import { site } from "../config/site";
import { href } from "../lib/url";
import { Container, LinkButton } from "../components/ui";

export function DriveWithUs() {
  return (
    <Container className="py-10 sm:py-14">
      <p className="inline-block rounded-full bg-accent-400/30 px-3 py-1 text-sm font-semibold text-amber-800">Coming soon</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-brand-900">Drive with {site.name}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Driver partnerships are coming soon. We are not taking driver or vehicle-owner applications yet. If that changes, we will say so on this page.
      </p>
      <div className="mt-8">
        <LinkButton href={href("/get-quote/")}>Moving soon? Get a quote</LinkButton>
      </div>
    </Container>
  );
}
