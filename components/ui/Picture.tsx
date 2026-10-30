import Image from "next/image";
import type { ReactNode } from "react";

export type Photo = { src: string; alt: string };

/**
 * Cesty do `/images/placeholder/` sú len zástupné obrázky. Kým dáta ukazujú tam,
 * zobrazí sa ilustrácia. Keď `src` ukáže na skutočnú fotku, zobrazí sa fotka.
 */
export function isPlaceholder(src: string | undefined): boolean {
  return !src || src.startsWith("/images/placeholder/");
}

/**
 * Miesto pre fotku. Vyplní rodiča (ten určuje tvar a pomer strán, napr. `ArchFrame`).
 * Fotku vymeníte v dátach (`content/**`) alebo v konštante na stránke, rozloženie sa nemení.
 */
export function Picture({
  photo,
  fallback,
  sizes,
  priority = false,
}: {
  photo?: Photo | null;
  /** Ilustrácia, ktorá sa zobrazí, kým nie je skutočná fotka. */
  fallback: ReactNode;
  sizes: string;
  priority?: boolean;
}) {
  if (!photo || isPlaceholder(photo.src)) return <>{fallback}</>;
  return <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />;
}
