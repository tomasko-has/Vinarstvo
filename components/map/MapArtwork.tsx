// Podkladová ilustrácia uličky: vinice, sprašové brehy so šrafami, úvoz, stromy, mierka.
// Pozadie (papier) je na kontajneri, SVG je priehľadné.
// Bez stavu a hookov, renderuje sa na serveri a do klienta ide len hotové SVG.
import type { MapPoint } from "@/lib/schemas";
import {
  band,
  crestNorth,
  crestSouth,
  hachures,
  LANE_END,
  LANE_START,
  laneBottom,
  laneCenter,
  laneTop,
  sample,
  smoothPath,
  vineyard,
  wobblyCircle,
} from "./geometry";

export type MapArtworkProps = {
  /** Body pivníc, pred ktorými sa vynechajú šrafy a nakreslí sa udupaný priestor. */
  cellars: MapPoint[];
  /** Kolko jednotiek SVG zodpovedá 100 m (z kotevných bodov). */
  unitsPer100m: number;
  /** Uhol smeru na sever v stupňoch (0 = hore). */
  northAngle: number;
};

const LOOKOUT = { x: 620, y: 112 };

const northParcels = [
  vineyard(-40, 46, 170, 186, 6, 11),
  vineyard(186, 30, 392, 176, -5, 12),
  vineyard(408, 52, 548, 182, 4, 13),
  vineyard(696, 40, 846, 178, -4, 14),
  vineyard(862, 58, 1050, 190, 5, 15),
];

const southParcels = [
  vineyard(110, 512, 330, 600, 4, 21),
  vineyard(346, 520, 560, 610, -3, 22),
  vineyard(576, 512, 700, 602, 5, 23),
  vineyard(850, 506, 1060, 606, -4, 24),
];

// Stromy: orech pred Pivnicou Pod Orechom, lipy pri Lipovej pivnici, ovocné stromy pri penzióne
const trees = [
  { x: 76, y: 206, r: 17, seed: 31 },
  { x: 776, y: 204, r: 13, seed: 32 },
  { x: 800, y: 214, r: 11, seed: 33 },
  { x: 700, y: 452, r: 10, seed: 34 },
  { x: 822, y: 448, r: 9, seed: 35 },
  { x: 846, y: 466, r: 11, seed: 36 },
  { x: 410, y: 438, r: 9, seed: 37 },
  { x: 250, y: 446, r: 10, seed: 38 },
  { x: 990, y: 230, r: 12, seed: 39 },
];

const road = smoothPath([
  [-60, 478],
  [140, 470],
  [380, 486],
  [620, 474],
  [860, 492],
  [1060, 484],
]);

// Z parkoviska ku vstupu do uličky
const accessPath = smoothPath([
  [32, 474],
  [26, 420],
  [18, 360],
  [LANE_START + 4, laneCenter(LANE_START)],
]);

// Chodník z uličky hore na vyhliadku
const lookoutPath = smoothPath([
  [604, laneTop(604) + 2],
  [598, 236],
  [612, 186],
  [606, 150],
  [LOOKOUT.x, LOOKOUT.y + 14],
]);

const lettering = smoothPath(sample(laneCenter, 372, 590, 30, 0, 1).map(([x, y]) => [x, y + 5]));

export function MapArtwork({ cellars, unitsPer100m, northAngle }: MapArtworkProps) {
  const north = cellars.filter((c) => c.y < laneCenter(c.x)).map((c) => c.x);
  const south = cellars.filter((c) => c.y >= laneCenter(c.x)).map((c) => c.x);
  const scale = Math.round(unitsPer100m);

  return (
    <g aria-hidden="true">
      {/* vinice */}
      <g fill="none" stroke="var(--color-listok)" strokeLinecap="round">
        {[...northParcels, ...southParcels].map((p, i) => (
          <g key={i}>
            <path d={p.outline} strokeWidth="1" opacity="0.35" strokeDasharray="3 4" />
            <path d={p.rows} strokeWidth="2.6" strokeDasharray="0.1 6.5" opacity="0.7" />
          </g>
        ))}
      </g>

      {/* kopček s vyhliadkou: vrstevnice */}
      <g fill="none" stroke="var(--color-spras-tmava)" strokeWidth="1.1" opacity="0.55">
        <path d={wobblyCircle(LOOKOUT.x, LOOKOUT.y + 6, 62, 41, 0.08, 11)} />
        <path d={wobblyCircle(LOOKOUT.x, LOOKOUT.y + 4, 44, 42, 0.08, 10)} />
        <path d={wobblyCircle(LOOKOUT.x, LOOKOUT.y + 2, 27, 43, 0.1, 9)} />
      </g>

      {/* cesta v dedine a prístup z parkoviska */}
      <g fill="none" strokeLinecap="round">
        <path d={road} stroke="var(--color-spras-tmava)" strokeWidth="15" opacity="0.28" />
        <path d={road} stroke="var(--color-vapno)" strokeWidth="11" />
        <path d={accessPath} stroke="var(--color-spras-tmava)" strokeWidth="11" opacity="0.28" />
        <path d={accessPath} stroke="var(--color-vapno)" strokeWidth="7" />
      </g>

      {/* sprašové brehy */}
      <path d={band(crestNorth, laneTop, LANE_START, LANE_END, 51)} fill="var(--color-spras)" />
      <path d={band(laneBottom, crestSouth, LANE_START, LANE_END, 53)} fill="var(--color-spras)" />
      <g fill="none" stroke="var(--color-spras-tmava)" strokeLinecap="round">
        <path d={smoothPath(sample(crestNorth, LANE_START, LANE_END, 25, 1.6, 51))} strokeWidth="1.6" />
        <path d={smoothPath(sample(crestSouth, LANE_START, LANE_END, 25, 1.6, 54))} strokeWidth="1.6" />
        <path d={hachures("north", [...north, 604], 61)} strokeWidth="1.3" />
        <path d={hachures("south", south, 62)} strokeWidth="1.3" />
      </g>

      {/* udupané miesto pred každou pivnicou */}
      <g fill="var(--color-spras-svetla)">
        {cellars.map((c) => {
          const northSide = c.y < laneCenter(c.x);
          const edge = northSide ? laneTop(c.x) : laneBottom(c.x);
          const mid = (c.y + edge) / 2;
          return <path key={`${c.x}-${c.y}`} d={wobblyCircle(c.x, mid, 17, c.x, 0.1, 8)} />;
        })}
      </g>

      {/* úvoz */}
      <path d={band(laneTop, laneBottom, LANE_START, LANE_END, 71)} fill="var(--color-spras-svetla)" />
      <g fill="none" strokeLinecap="round">
        <path d={smoothPath(sample(laneTop, LANE_START, LANE_END, 25, 1.4, 72))} stroke="var(--color-spras-tmava)" strokeWidth="1.3" />
        <path d={smoothPath(sample(laneBottom, LANE_START, LANE_END, 25, 1.4, 73))} stroke="var(--color-spras-tmava)" strokeWidth="1.3" />
        {/* koľaje od vozov */}
        <path
          d={smoothPath(sample((x) => laneCenter(x) - 6, LANE_START + 20, LANE_END - 20, 40, 1.2, 74))}
          stroke="var(--color-spras-tmava)"
          strokeWidth="1"
          strokeDasharray="14 9"
          opacity="0.35"
        />
        <path
          d={smoothPath(sample((x) => laneCenter(x) + 6, LANE_START + 20, LANE_END - 20, 40, 1.2, 75))}
          stroke="var(--color-spras-tmava)"
          strokeWidth="1"
          strokeDasharray="10 12"
          opacity="0.35"
        />
        <path d={lookoutPath} stroke="var(--color-pivnica-makka)" strokeWidth="1.6" strokeDasharray="1 5" />
      </g>

      {/* nápis uličky */}
      <path id="ulicka-napis" d={lettering} fill="none" />
      <text
        className="font-display"
        fontSize="15"
        fontStyle="italic"
        letterSpacing="2.5"
        fill="var(--color-spras-tmava)"
      >
        <textPath href="#ulicka-napis" startOffset="50%" textAnchor="middle">
          Sprašová ulička
        </textPath>
      </text>

      {/* stromy */}
      <g>
        {trees.map((t) => (
          <g key={t.seed}>
            <path d={wobblyCircle(t.x, t.y, t.r, t.seed, 0.16, 10)} fill="var(--color-listok)" opacity="0.18" />
            <path
              d={wobblyCircle(t.x, t.y, t.r * 0.95, t.seed + 100, 0.18, 10)}
              fill="none"
              stroke="var(--color-listok)"
              strokeWidth="1.3"
            />
            <path d={wobblyCircle(t.x - t.r * 0.2, t.y - t.r * 0.15, t.r * 0.45, t.seed + 200, 0.2, 7)} fill="none" stroke="var(--color-listok)" strokeWidth="0.9" opacity="0.7" />
          </g>
        ))}
      </g>

      {/* smer na sever a mierka */}
      <g transform="translate(958 46)" fill="none" stroke="var(--color-pivnica)" strokeLinecap="round" strokeLinejoin="round">
        <g transform={`rotate(${Math.round(northAngle)})`}>
          <path d="M0 -20 L6 6 L0 2 L-6 6 Z" fill="var(--color-pivnica)" strokeWidth="1.2" />
          <text y="-25" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-pivnica)" stroke="none">
            S
          </text>
        </g>
      </g>
      <g transform="translate(24 572)" stroke="var(--color-pivnica)" strokeLinecap="round">
        <path d={`M0 0H${scale}M0 -5V5M${scale} -5V5M${scale / 2} -3V3`} strokeWidth="1.6" fill="none" />
        <text x={scale / 2} y="-9" textAnchor="middle" fontSize="12" fill="var(--color-pivnica)" stroke="none">
          100 m
        </text>
      </g>
    </g>
  );
}
