import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

const buttonBase =
  "inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const variants = {
  primary: "bg-accent-500 text-brand-900 hover:bg-accent-400",
  secondary: "bg-brand-900 text-white hover:bg-brand-700",
  ghost: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
} as const;
export type ButtonVariant = keyof typeof variants;

export function LinkButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <a href={href} className={`${buttonBase} ${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button type="button" className={`${buttonBase} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Section({
  title,
  intro,
  children,
  id,
  tone = "light",
}: {
  title?: string;
  intro?: string;
  children: ReactNode;
  id?: string;
  tone?: "light" | "white";
}) {
  return (
    <section id={id} className={tone === "white" ? "bg-white py-16 sm:py-24" : "bg-slate-50 py-16 sm:py-24"}>
      <Container>
        {title && <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">{title}</h2>}
        {intro && <p className="mt-3 max-w-2xl text-lg text-slate-600">{intro}</p>}
        <div className={title ? "mt-8" : ""}>{children}</div>
      </Container>
    </section>
  );
}

export function Counter({
  label,
  hint,
  value,
  min = 0,
  max = 99,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="font-medium text-slate-900">{label}</div>
        {hint && <div className="text-sm text-slate-500">{hint}</div>}
      </div>
      <div className="flex shrink-0 items-center overflow-hidden rounded-xl border border-slate-300 bg-white">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => set(value - 1)}
          className="h-12 w-12 text-xl font-semibold hover:bg-slate-100 disabled:opacity-40"
        >
          −
        </button>
        <output aria-live="polite" aria-label={`${label} quantity`} className="w-10 text-center text-lg font-semibold tabular-nums">
          {value}
        </output>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => set(value + 1)}
          className="h-12 w-12 text-xl font-semibold hover:bg-slate-100 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500";
