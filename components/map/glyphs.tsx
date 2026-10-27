// Značky na mape. Kreslené okolo bodu (0, 0); umiestnenie a mierku rieši rodič.
import type { MapPoi } from "@/lib/schemas";

/** Svetlý lem okolo textu, aby bol popis čitateľný aj nad šrafami. */
export const halo = {
  stroke: "var(--color-vapno)",
  strokeWidth: 3.5,
  strokeLinejoin: "round",
  paintOrder: "stroke",
} as const;

/** Čelo pivnice s oblúkovým vchodom (ako v ilustrácii svahu na úvodnej stránke). */
export function CellarFacade({ ours = false }: { ours?: boolean }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-15 13V-5L0 -15L15 -5V13Z" fill="var(--color-vapno)" stroke="var(--color-pivnica)" strokeWidth="1.4" />
      <path d="M-18.5 -2.8L0 -18.5L18.5 -2.8" fill="none" stroke="var(--color-pivnica)" strokeWidth="3.6" />
      <path d="M-5.5 13V2.5A5.5 5.5 0 0 1 5.5 2.5V13Z" fill={ours ? "var(--color-frankovka)" : "var(--color-pivnica)"} />
    </g>
  );
}

/** Lampáš pri vchode = práve otvorené. */
export function OpenLantern() {
  return <circle cx="15" cy="-15" r="4.5" fill="var(--color-listok)" stroke="var(--color-vapno)" strokeWidth="2" />;
}

/** Číslo zastávky audio sprievodcu. */
export function StopBadge({ order, active = false }: { order: number; active?: boolean }) {
  return (
    <g>
      <circle r="11" fill={active ? "var(--color-frankovka)" : "var(--color-pivnica)"} stroke="var(--color-vapno)" strokeWidth="2.5" />
      <text y="4.3" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--color-vapno)">
        {order}
      </text>
    </g>
  );
}

function Plate({ text }: { text: string }) {
  const w = text.length > 1 ? 24 : 18;
  return (
    <g>
      <rect x={-w / 2} y="-9" width={w} height="18" rx="3.5" fill="var(--color-pivnica)" />
      <text y="4.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-vapno)">
        {text}
      </text>
    </g>
  );
}

export function PoiGlyph({ kind }: { kind: MapPoi["kind"] }) {
  const line = { fill: "none", stroke: "var(--color-pivnica)", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (kind) {
    case "parkovisko":
      return <Plate text="P" />;
    case "wc":
      return <Plate text="WC" />;
    case "vstup":
      // drevená brána do uličky
      return (
        <g {...line}>
          <path d="M-11 11V-6M11 11V-6M-14 -6C-6 -14 6 -14 14 -6" strokeWidth="2.6" />
          <path d="M-11 0H11" strokeWidth="1.2" />
        </g>
      );
    case "vyhliadka":
      // lavička na kopci
      return (
        <g {...line}>
          <path d="M-12 8L0 -10L12 8Z" fill="var(--color-vapno)" />
          <path d="M-6 3H6M-4 3V7M4 3V7" strokeWidth="1.5" />
        </g>
      );
    case "penzion":
      return (
        <g {...line} strokeWidth={1.5}>
          <path d="M-20 12V-4L0 -16L20 -4V12Z" fill="var(--color-vapno)" />
          <path d="M-24 -1.5L0 -20L24 -1.5" strokeWidth="3.4" />
          <path d="M-4 12V3H4V12" fill="var(--color-frankovka)" stroke="none" />
          <path d="M-14 1H-9V6H-14ZM9 1H14V6H9Z" strokeWidth="1.2" />
        </g>
      );
  }
}
