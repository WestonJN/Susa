import { QuoteForm } from "../components/quote/QuoteForm";
import { Container } from "../components/ui";

export function QuotePage() {
  return (
    <Container className="py-8 sm:py-12">
      <h1 className="text-3xl font-extrabold text-brand-900">Get a moving quote in Johannesburg</h1>
      <p className="mb-6 mt-2 max-w-xl text-slate-600">
        Five short steps. Your estimate updates as you go. Requesting a quote is free and is not a booking: our team confirms availability and the final price first.
      </p>
      <QuoteForm />
    </Container>
  );
}
