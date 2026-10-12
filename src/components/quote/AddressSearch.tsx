import { useEffect, useId, useRef, useState } from "react";
import { searchPlaces, type Place } from "../../lib/geo";
import { inputClass } from "../ui";

interface Props {
  id: string;
  label: string;
  value: string;
  place: Place | null;
  placeholder?: string;
  error?: string;
  onText: (text: string) => void;
  onPlace: (place: Place | null) => void;
}

/** Accessible address combobox: type, pick a suggestion, or keep what you typed. Johannesburg only. */
export function AddressSearch({ id, label, value, place, placeholder, error, onText, onPlace }: Props) {
  const listId = useId();
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      ctrl.current?.abort();
    },
    [],
  );

  function input(text: string) {
    onText(text);
    onPlace(null);
    window.clearTimeout(timer.current);
    setActive(-1);
    if (text.trim().length < 3) {
      ctrl.current?.abort();
      setResults([]);
      setOpen(false);
      setSearched(false);
      setLoading(false);
      return;
    }
    timer.current = window.setTimeout(async () => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setLoading(true);
      try {
        const found = await searchPlaces(text.trim(), c.signal);
        setResults(found);
        setFailed(false);
        setSearched(true);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults([]);
          setFailed(true);
          setSearched(true);
          setOpen(true);
        }
      } finally {
        if (ctrl.current === c) setLoading(false);
      }
    }, 350);
  }

  function choose(p: Place) {
    onText(p.label);
    onPlace(p);
    setOpen(false);
    setResults([]);
    setActive(-1);
  }

  function key(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && open && active >= 0 && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showPanel = open && searched && !loading;
  const status = place
    ? "Address found on the map"
    : loading
      ? "Searching…"
      : value.trim().length >= 5
        ? "Pick a suggestion so we can work out the distance for you"
        : "Start typing the street and suburb";

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={showPanel && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={200}
          className={`${inputClass} pr-11`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => input(e.target.value)}
          onKeyDown={key}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {place ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : loading ? (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          )}
        </span>
      </div>

      {showPanel && (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {results.map((r, i) => (
            <li
              key={`${r.lat},${r.lon},${r.label}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(r);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-start gap-2 px-4 py-3 text-sm ${i === active ? "bg-brand-50" : ""}`}
            >
              <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d5f94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>{r.label}</span>
            </li>
          ))}
          {results.length === 0 && (
            <li role="presentation" className="px-4 py-3 text-sm text-slate-600">
              {failed
                ? "Address search is not available right now. Type the full address and enter the distance yourself."
                : "No match in Johannesburg. Try the street and suburb, or type the full address."}
            </li>
          )}
        </ul>
      )}

      <p className={`mt-1 text-sm ${place ? "font-medium text-green-700" : "text-slate-500"}`} aria-live="polite">
        {error ? <span role="alert" className="font-medium text-red-700">{error}</span> : status}
      </p>
    </div>
  );
}
