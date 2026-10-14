/** Flat side-view illustrations of the H100 dropside bakkie, alone and towing a closed trailer. Same scale in both. */
const Wheel = ({ cx }: { cx: number }) => (
  <g>
    <circle cx={cx} cy={160} r={27} fill="#1b2a3a" />
    <circle cx={cx} cy={160} r={12} fill="#cbd5e1" />
    <circle cx={cx} cy={160} r={4} fill="#64748b" />
  </g>
);

function Bakkie({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={40} y={118} width={352} height={16} rx={3} fill="#52667a" />
      {/* dropside deck: floor, side panel with ribs, and the drop-down latches */}
      <rect x={45} y={104} width={207} height={14} fill="#e7eef5" stroke="#9fb4c8" />
      <rect x={45} y={74} width={207} height={30} fill="#ffffff" stroke="#9fb4c8" />
      {[75, 105, 135, 165, 195, 225].map((lx) => <line key={lx} x1={lx} y1={78} x2={lx} y2={100} stroke="#c3d3e3" strokeWidth={3} />)}
      {[60, 150, 240].map((lx) => <rect key={lx} x={lx - 4} y={100} width={8} height={7} rx={1} fill="#7b8da0" />)}
      {/* cab */}
      <path d="M255 118V62Q255 50 267 50H318Q330 50 338 61L362 91L384 97Q393 99 393 109V118Z" fill="#ffffff" stroke="#9fb4c8" strokeWidth={1.5} />
      <path d="M269 62H318L340 91H269Z" fill="#cfe6f7" stroke="#9fb4c8" />
      <rect x={380} y={100} width={11} height={7} rx={2} fill="#fbbf24" />
      <rect x={386} y={116} width={10} height={9} rx={2} fill="#52667a" />
      <rect x={300} y={96} width={14} height={3} rx={1.5} fill="#9fb4c8" />
      <path d="M255 84H268" stroke="#9fb4c8" strokeWidth={2} />
      <Wheel cx={110} />
      <Wheel cx={318} />
    </g>
  );
}

function Trailer() {
  return (
    <g>
      <line x1={248} y1={128} x2={308} y2={126} stroke="#52667a" strokeWidth={5} strokeLinecap="round" />
      <rect x={20} y={118} width={232} height={10} rx={2} fill="#52667a" />
      {/* closed medium trailer */}
      <rect x={24} y={38} width={226} height={82} rx={7} fill="#ffffff" stroke="#9fb4c8" strokeWidth={1.5} />
      <rect x={24} y={86} width={226} height={14} fill="#8fbbe0" />
      {[70, 120, 170, 220].map((lx) => <line key={lx} x1={lx} y1={42} x2={lx} y2={82} stroke="#e1eaf3" strokeWidth={3} />)}
      <rect x={24} y={38} width={226} height={9} rx={4} fill="#dde8f2" />
      <circle cx={145} cy={160} r={0} />
      <Wheel cx={145} />
    </g>
  );
}

export function BakkieArt() {
  return (
    <svg viewBox="0 0 660 190" role="img" aria-label="Illustration: white Hyundai H100 dropside bakkie, no trailer" className="h-auto w-full">
      <title>Hyundai H100 dropside bakkie, no trailer</title>
      <line x1={0} y1={187} x2={660} y2={187} stroke="#c3d3e3" strokeWidth={2} />
      <rect x={284} y={38} width={226} height={82} rx={7} fill="none" stroke="#9fb4c8" strokeWidth={1.5} strokeDasharray="6 6" opacity={0.7} transform="translate(-260 0)" />
      <text x={135} y={86} textAnchor="middle" fontSize={15} fontWeight={700} fill="#7b8da0" opacity={0.9}>no trailer</text>
      <Bakkie x={260} />
    </svg>
  );
}

export function ComboArt() {
  return (
    <svg viewBox="0 0 660 190" role="img" aria-label="Illustration: the same bakkie towing a closed box trailer" className="h-auto w-full">
      <title>H100 bakkie towing a closed box trailer</title>
      <line x1={0} y1={187} x2={660} y2={187} stroke="#c3d3e3" strokeWidth={2} />
      <Trailer />
      <Bakkie x={260} />
    </svg>
  );
}
