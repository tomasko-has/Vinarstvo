import type { ReactNode } from "react";

// Rám s oblúkovým vrchom ako vchod do pivnice. Používa sa pre fotky a hlavné obrázky.
export function ArchFrame({
  children,
  className = "",
  ratio = "3/4",
}: {
  children: ReactNode;
  className?: string;
  /** CSS aspect-ratio, napr. "3/4" alebo "1/1" */
  ratio?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-(--radius-obluk) bg-spras-svetla ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {children}
    </div>
  );
}
