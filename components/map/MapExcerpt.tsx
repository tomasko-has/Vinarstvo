// Statický výrez mapy okolo jedného bodu (detail pivnice). Bez JavaScriptu na klientovi.
import type { Cellar, MapPoint } from "@/lib/schemas";
import { CellarFacade, halo } from "./glyphs";
import { MapArtwork, type MapArtworkProps } from "./MapArtwork";
import styles from "./map.module.css";

export function MapExcerpt({
  focus,
  cellars,
  artwork,
  label,
}: {
  focus: MapPoint;
  cellars: Cellar[];
  artwork: Omit<MapArtworkProps, "cellars">;
  label: string;
}) {
  const w = 520;
  const h = 260;
  const x = Math.min(Math.max(focus.x - w / 2, 0), 1000 - w);
  const y = Math.min(Math.max(focus.y - h / 2, 0), 600 - h);

  return (
    <div className={`${styles.paper} overflow-hidden rounded-(--radius-panel) border-2 border-spras-tmava/30`}>
      <svg viewBox={`${x} ${y} ${w} ${h}`} role="img" aria-label={label} className="block h-auto w-full">
        <MapArtwork cellars={cellars.map((c) => c.mapPoint)} {...artwork} />
        {cellars.map((c) => {
          const here = c.mapPoint.x === focus.x && c.mapPoint.y === focus.y;
          return (
            <g key={c.slug} transform={`translate(${c.mapPoint.x} ${c.mapPoint.y})`} opacity={here ? 1 : 0.55}>
              {here && <circle r="27" fill="none" stroke="var(--color-frankovka)" strokeWidth="2.5" />}
              <g transform={here ? "scale(1.2)" : undefined}>
                <CellarFacade ours={c.isOurs} />
              </g>
              <text
                y={c.mapPoint.y < 300 ? -32 : 42}
                textAnchor="middle"
                fontSize={here ? 14 : 12}
                fontWeight={here ? 800 : 600}
                className="font-display"
                fill={here ? "var(--color-frankovka)" : "var(--color-pivnica)"}
                {...halo}
              >
                {c.name.replace(/^(Pivnica|Vinárstvo) /, "")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
