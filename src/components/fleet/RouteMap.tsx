import { quickDistanceKm } from "../../lib/geo";

/** Decorative map: a segmented route Sandton > Johannesburg CBD > Soweto. Not a live map; numbers are an example. */
const pts = {
  sandton: { label: "Sandton", lat: -26.107, lon: 28.057 },
  cbd: { label: "Johannesburg CBD", lat: -26.204, lon: 28.042 },
  soweto: { label: "Soweto", lat: -26.267, lon: 27.858 },
};
const W = 420, H = 250, B = { w: 27.78, e: 28.13, n: -26.04, s: -26.33 };
const X = (lon: number) => ((lon - B.w) / (B.e - B.w)) * (W - 100) + 50;
const Y = (lat: number) => ((B.n - lat) / (B.n - B.s)) * (H - 90) + 45;
const P = (p: { lat: number; lon: number }) => ({ x: X(p.lon), y: Y(p.lat) });

const AVG_KMH = 38;
export const exampleRoute = (() => {
  const km = Math.round(quickDistanceKm(pts.sandton, pts.soweto) * 10) / 10;
  return { km, mins: Math.round((km / AVG_KMH) * 60) };
})();

export function RouteMap() {
  const a = P(pts.sandton), b = P(pts.cbd), c = P(pts.soweto);
  return (
    <figure className="overflow-hidden rounded-3xl border border-brand-100 bg-white p-3 shadow-sm sm:p-4">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Example route from Sandton through Johannesburg CBD to Soweto, about ${exampleRoute.km} kilometres`} className="h-auto w-full">
        <title>Example route: Sandton to Soweto</title>
        <rect width={W} height={H} rx={18} fill="#eef5fb" />
        <g stroke="#d6e6f4" strokeWidth={10} fill="none" strokeLinecap="round">
          <path d="M20 190 C120 170 200 200 400 150" />
          <path d="M240 10 C230 80 250 150 215 240" />
          <path d="M20 60 C120 90 260 40 400 80" />
          <path d="M110 20 C130 110 90 170 120 245" />
        </g>
        <g stroke="#ffffff" strokeWidth={4} fill="none" strokeLinecap="round">
          <path d="M20 190 C120 170 200 200 400 150" />
          <path d="M240 10 C230 80 250 150 215 240" />
        </g>
        <ellipse cx={310} cy={60} rx={44} ry={20} fill="#dcecdf" opacity={0.8} />
        <ellipse cx={90} cy={190} rx={40} ry={18} fill="#dcecdf" opacity={0.8} />
        <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke="#1d5f94" strokeWidth={6} strokeLinecap="round" />
        <path d={`M${b.x} ${b.y} L${c.x} ${c.y}`} stroke="#5f97c6" strokeWidth={6} strokeLinecap="round" strokeDasharray="14 9" />
        {[[a, "Sandton"], [b, "Johannesburg CBD"], [c, "Soweto"]].map(([p, name]) => {
          const q = p as { x: number; y: number };
          return (
            <g key={name as string}>
              <circle cx={q.x} cy={q.y} r={9} fill="#ffffff" stroke="#0f2a43" strokeWidth={3} />
              <circle cx={q.x} cy={q.y} r={3.5} fill="#0f2a43" />
              <text x={q.x + 14} y={q.y + 5} fontSize={13} fontWeight={700} fill="#0f2a43">{name === "Johannesburg CBD" ? "CBD" : (name as string)}</text>
            </g>
          );
        })}
        <g transform={`translate(${(b.x + c.x) / 2 - 70} ${(b.y + c.y) / 2 - 78})`}>
          <rect width={150} height={52} rx={10} fill="#0f2a43" />
          <path d="M60 52 L70 62 L80 52Z" fill="#0f2a43" />
          <text x={75} y={17} textAnchor="middle" fontSize={9} fontWeight={700} letterSpacing={1} fill="#fbbf24">EXAMPLE ROUTE</text>
          <text x={75} y={32} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#ffffff">Distance: {exampleRoute.km} km</text>
          <text x={75} y={46} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#ffffff">Est. time: {exampleRoute.mins} mins</text>
        </g>
      </svg>
      <figcaption className="px-1 pt-3 text-sm text-slate-600">
        Illustration only. In the quote form we work out your real road distance from the two addresses you pick.
      </figcaption>
    </figure>
  );
}
