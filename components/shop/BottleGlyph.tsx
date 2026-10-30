import type { WineColor } from "@/lib/schemas";

// Fľaše vín kreslí components/illustration/BottleIllustration.tsx. Tu je len vzorka pre mini-sety.

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
