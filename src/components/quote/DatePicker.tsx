import { useEffect, useState } from "react";
import { site } from "../../config/site";
import { isBookableDay, todayIso } from "../../lib/validation";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS_AHEAD = 5;

/** Month calendar. Only the weekdays in site.bookingDays can be picked; every other day shows as no availability. */
export function DatePicker({ value, onChange, id, invalid }: { value: string; onChange: (v: string) => void; id: string; invalid?: boolean }) {
  const [today, setToday] = useState("");
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  useEffect(() => {
    const t = todayIso();
    setToday(t);
    setView({ y: Number(t.slice(0, 4)), m: Number(t.slice(5, 7)) - 1 });
  }, []);
  if (!view || !today) return <div id={id} className="h-64 rounded-xl border border-slate-300 bg-white" aria-busy="true" />;

  const first = new Date(Date.UTC(view.y, view.m, 1));
  const lead = first.getUTCDay();
  const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: Array<number | null> = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const label = new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const curIdx = view.y * 12 + view.m, startIdx = Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1;
  const move = (d: number) => setView((v) => { if (!v) return v; const n = v.y * 12 + v.m + d; return { y: Math.floor(n / 12), m: n % 12 }; });

  return (
    <div id={id} className={`rounded-xl border bg-white p-3 ${invalid ? "border-red-600" : "border-slate-300"}`}>
      <div className="flex items-center justify-between">
        <button type="button" className="h-11 w-11 rounded-lg text-xl hover:bg-slate-100 disabled:opacity-30" aria-label="Previous month" disabled={curIdx <= startIdx} onClick={() => move(-1)}>‹</button>
        <div className="font-bold text-brand-900" aria-live="polite">{label}</div>
        <button type="button" className="h-11 w-11 rounded-lg text-xl hover:bg-slate-100 disabled:opacity-30" aria-label="Next month" disabled={curIdx >= startIdx + MONTHS_AHEAD} onClick={() => move(1)}>›</button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-600">{DOW.map((d) => <div key={d}>{d}</div>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const date = iso(view.y, view.m, d);
          const ok = isBookableDay(date, today, site.bookingDays);
          const selected = date === value;
          const nice = new Intl.DateTimeFormat("en-ZA", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
          return (
            <button
              key={date}
              type="button"
              disabled={!ok}
              aria-pressed={selected}
              aria-label={ok ? nice : `${nice}, no availability`}
              onClick={() => onChange(date)}
              className={`h-11 rounded-lg text-sm font-semibold ${
                selected ? "bg-brand-900 text-white" : ok ? "bg-brand-100 text-brand-900 hover:bg-brand-500 hover:text-white" : "cursor-not-allowed text-slate-400 line-through"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-600">Highlighted dates have availability. Other days have none right now.</p>
    </div>
  );
}
