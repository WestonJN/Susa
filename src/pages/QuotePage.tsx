import { QuoteForm } from "../components/quote/QuoteForm";
import { Container } from "../components/ui";

export function QuotePage() {
  return (
    <Container className="py-8 sm:py-12">
      <h1 className="text-3xl font-extrabold text-brand-900">Get a moving quote</h1>
      <p className="mb-6 mt-2 max-w-xl text-slate-600">
        Five short steps. You will see an estimate update as you go, and you are not charged when you send your request.
      </p>
      <QuoteForm />
    </Container>
  );
}
