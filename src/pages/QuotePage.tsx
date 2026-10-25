import { QuoteForm } from "../components/quote/QuoteForm";
import { Container } from "../components/ui";

export function QuotePage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl">Get a moving quote in Johannesburg</h1>
      <p className="mb-8 mt-3 max-w-xl text-lg text-slate-600">
        Five short steps. Your estimate updates as you go. Requesting a quote is free and is not a booking: our team confirms availability and the final price first.
      </p>
      <QuoteForm />
    </Container>
  );
}
