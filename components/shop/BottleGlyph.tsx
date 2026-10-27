import type { WineColor } from "@/lib/schemas";

// Fľaša nakreslená v SVG pre kartón a mini-sety. Farba skla podľa farby vína, len z tokenov.
const glass: Record<WineColor, string> = {
  biele: "var(--color-listok)",
  ruzove: "var(--color-frankovka-hover)",
  cervene: "var(--color-pivnica)",
  sumive: "var(--color-spras-tmava)",
};

export function BottleGlyph({ color, className = "" }: { color: WineColor; className?: string }) {
  return (
    <svg viewBox="96 30 108 346" className={className} aria-hidden="true">
      <path
        d="M136 40h28v70c0 14 30 26 30 62v188a8 8 0 0 1-8 8h-72a8 8 0 0 1-8-8V172c0-36 30-48 30-62Z"
        fill={glass[color]}
      />
      {color === "ruzove" && (
        <path d="M108 250h84v110a8 8 0 0 1-8 8h-68a8 8 0 0 1-8-8Z" fill="var(--color-frankovka)" opacity="0.5" />
      )}
      <rect x="134" y="36" width="32" height="26" rx="3" fill={color === "sumive" ? "var(--color-spras-svetla)" : "var(--color-frankovka)"} />
      <rect x="114" y="212" width="72" height="86" rx="3" fill="var(--color-vapno)" />
      <rect x="126" y="232" width="48" height="6" fill="var(--color-spras-tmava)" />
      <rect x="126" y="248" width="32" height="4" fill="var(--color-pivnica-makka)" />
    </svg>
  );
}

/** Vzorka 0,1 l v skúmavke pre mini-sety. */
export function VialGlyph({ color, className = "" }: { color: WineColor; className?: string }) {
  const wine: Record<WineColor, string> = {
    biele: "var(--color-spras)",
    ruzove: "var(--color-frankovka-hover)",
    cervene: "var(--color-frankovka)",
    sumive: "var(--color-spras-tmava)",
  };
  return (
    <svg viewBox="0 0 40 140" className={className} aria-hidden="true">
      <rect x="9" y="2" width="22" height="14" rx="2" fill="var(--color-pivnica)" />
      <path d="M11 16h18v104a9 9 0 0 1-18 0Z" fill="var(--color-vapno)" stroke="var(--color-pivnica-makka)" strokeWidth="1.5" />
      <path d="M12 50h16v70a8 8 0 0 1-16 0Z" fill={wine[color]} />
    </svg>
  );
}
