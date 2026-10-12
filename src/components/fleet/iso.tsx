import type { ReactNode } from "react";

/** Tiny isometric "3D" renderer: cuboids projected onto an SVG. No images, no dependencies. */
type Shade = readonly [top: string, left: string, right: string];

export const shades = {
  white: ["#ffffff", "#dde8f2", "#c3d3e3"],
  blue: ["#8fbbe0", "#5f97c6", "#477fb0"],
  wood: ["#edd2a6", "#cfa772", "#b48b58"],
  card: ["#f0cf96", "#d8ae6c", "#bc9255"],
  tape: ["#fff3d1", "#f1dca4", "#e2c985"],
  slate: ["#7b8da0", "#5c6e82", "#475a6d"],
} satisfies Record<string, Shade>;

export type ShadeName = keyof typeof shades;
export interface Cuboid {
  x: number; y: number; z: number;
  w: number; d: number; h: number;
  c: ShadeName;
}

const S = 24;
const COS = 0.866;
const px = (x: number, y: number) => (x - y) * COS * S;
const py = (x: number, y: number, z: number) => (x + y) * 0.5 * S - z * S;
const pt = (x: number, y: number, z: number) => `${px(x, y).toFixed(1)},${py(x, y, z).toFixed(1)}`;

function Block({ b }: { b: Cuboid }) {
  const [top, left, right] = shades[b.c];
  const { x, y, z, w, d, h } = b;
  return (
    <g strokeLinejoin="round" stroke="#0f2a43" strokeOpacity={0.18} strokeWidth={0.8}>
      <polygon points={[pt(x, y + d, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x, y + d, z + h)].join(" ")} fill={left} />
      <polygon points={[pt(x + w, y, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x + w, y, z + h)].join(" ")} fill={right} />
      <polygon points={[pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x, y + d, z + h)].join(" ")} fill={top} />
    </g>
  );
}

export function IsoIcon({ blocks, label, className = "" }: { blocks: Cuboid[]; label: string; className?: string }) {
  const pts: Array<[number, number]> = [];
  for (const b of blocks) {
    for (const dx of [0, b.w]) for (const dy of [0, b.d]) for (const dz of [0, b.h]) pts.push([px(b.x + dx, b.y + dy), py(b.x + dx, b.y + dy, b.z + dz)]);
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 6;
  const sorted = [...blocks].sort((a, b) => a.x + a.y + a.z + (a.w + a.d + a.h) / 2 - (b.x + b.y + b.z + (b.w + b.d + b.h) / 2));
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${(maxX - minX + pad * 2).toFixed(1)} ${(maxY - minY + pad * 2).toFixed(1)}`}
      className={className}
    >
      <title>{label}</title>
      {sorted.map((b, i) => <Block key={i} b={b} />)}
    </svg>
  );
}

const cb = (x: number, y: number, z: number, w: number, d: number, h: number, c: ShadeName): Cuboid => ({ x, y, z, w, d, h, c });

const legs = (w: number, d: number, h: number, t = 0.1): Cuboid[] => [
  cb(0.04, 0.04, 0, t, t, h, "wood"), cb(w - t - 0.04, 0.04, 0, t, t, h, "wood"),
  cb(0.04, d - t - 0.04, 0, t, t, h, "wood"), cb(w - t - 0.04, d - t - 0.04, 0, t, t, h, "wood"),
];

export const mattress = (): Cuboid[] => [cb(0, 0, 0, 1, 1.9, 0.3, "white"), cb(0.08, 0.08, 0.3, 0.84, 1.74, 0.02, "blue")];

export const studentDesk = (): Cuboid[] => [
  ...legs(1.6, 0.8, 0.7), cb(0, 0, 0.7, 1.6, 0.8, 0.09, "wood"), cb(1.0, 0.06, 0.15, 0.5, 0.68, 0.55, "wood"),
];

export const queenBed = (): Cuboid[] => [
  cb(0, 0, 0, 1.6, 2, 0.25, "wood"), cb(0, 0, 0, 1.6, 0.1, 0.95, "wood"), cb(0.05, 0.1, 0.25, 1.5, 1.88, 0.3, "white"),
  cb(0.15, 0.18, 0.55, 0.55, 0.38, 0.12, "blue"), cb(0.9, 0.18, 0.55, 0.55, 0.38, 0.12, "blue"),
];

export const sofa3 = (): Cuboid[] => [
  cb(0, 0, 0, 2.4, 0.95, 0.35, "blue"), cb(0, 0, 0.35, 2.4, 0.25, 0.55, "blue"),
  cb(0, 0.25, 0.35, 0.22, 0.7, 0.28, "blue"), cb(2.18, 0.25, 0.35, 0.22, 0.7, 0.28, "blue"),
  ...[0, 1, 2].map((i) => cb(0.22 + i * 0.653, 0.25, 0.35, 0.62, 0.7, 0.14, "white")),
];

export const diningTable = (): Cuboid[] => [...legs(2, 1.1, 0.75), cb(0, 0, 0.75, 2, 1.1, 0.09, "wood")];

const boxLayouts: Record<number, Array<[number, number, number]>> = {
  5: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1]],
  10: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [1, 1, 0], [2, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [0, 0, 2]],
};
export const boxes = (n: 5 | 10): Cuboid[] =>
  (boxLayouts[n] ?? []).flatMap(([i, j, k]) => {
    const w = 0.8, d = 0.8, h = 0.6;
    return [cb(i * w, j * d, k * h, w, d, h, "card"), cb(i * w + 0.3, j * d, (k + 1) * h, 0.2, d, 0.015, "tape")];
  });

export type { ReactNode };
