// Vinica v štyroch ročných obdobiach. Používa sa ako obrázok aktualít, kým nie sú skutočné fotky.
// Riadky viniča sa zbiehajú k horizontu; obdobie mení farbu riadkov, oblohu a slnko.

export type Season = "jar" | "leto" | "oberacka" | "zima";

/** Obdobie podľa mesiaca dátumu RRRR-MM-DD. */
export function seasonOf(date: string): Season {
  const month = Number(date.slice(5, 7));
  if (month >= 9 && month <= 10) return "oberacka";
  if (month >= 11 || month <= 2) return "zima";
  if (month >= 3 && month <= 5) return "jar";
  return "leto";
}

const LOOK: Record<Season, { sky: string; row: string; soil: string; sun: string | null }> = {
  jar: {
    sky: "var(--color-spras-svetla)",
    row: "color-mix(in oklab, var(--color-listok) 55%, var(--color-vapno))",
    soil: "var(--color-spras-tmava)",
    sun: "var(--color-spras)",
  },
  leto: { sky: "var(--color-spras-svetla)", row: "var(--color-listok)", soil: "var(--color-spras-tmava)", sun: "var(--color-spras)" },
  oberacka: {
    sky: "var(--color-spras)",
    row: "color-mix(in oklab, var(--color-listok) 45%, var(--color-spras))",
    soil: "var(--color-spras-tmava)",
    sun: "var(--color-frankovka)",
  },
  zima: { sky: "var(--color-vapno-tien)", row: "var(--color-vapno)", soil: "var(--color-pivnica-makka)", sun: null },
};

const HORIZON = 230;
const ROWS = [-380, -240, -120, 0, 120, 240, 380];

export function VineyardScene({
  season,
  className = "",
  label,
}: {
  season: Season;
  className?: string;
  label?: string;
}) {
  const look = LOOK[season];
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width="800" height="450" fill={look.sky} />
      {look.sun && <circle cx="620" cy="104" r="38" fill={look.sun} />}
      <path d="M0 190C140 150 280 170 420 140S660 130 800 150V300H0Z" fill="var(--color-spras)" />
      <path d="M0 214C160 186 300 204 460 178S680 176 800 188V320H0Z" fill="var(--color-spras-tmava)" opacity="0.7" />
      <rect y={HORIZON} width="800" height={450 - HORIZON} fill={look.soil} />
      {/* riadky viniča; pri oberačke s strapcami */}
      {ROWS.map((offset) => {
        const bottom = 400 + offset * 1.7;
        const top = 400 + offset * 0.18;
        const half = 34;
        return (
          <g key={offset}>
            <path
              d={`M${bottom - half} 450L${top - 3} ${HORIZON}h6L${bottom + half} 450Z`}
              fill={look.row}
              stroke="var(--color-pivnica)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {season === "oberacka" &&
              [0.35, 0.55, 0.78].map((t) => (
                <circle
                  key={t}
                  cx={top + (bottom - top) * t}
                  cy={HORIZON + (450 - HORIZON) * t}
                  r={3 + t * 6}
                  fill="var(--color-frankovka)"
                />
              ))}
          </g>
        );
      })}
      {season === "zima" && <rect y={HORIZON - 6} width="800" height="10" fill="var(--color-vapno)" opacity="0.8" />}
    </svg>
  );
}
