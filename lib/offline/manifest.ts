// Čistá logika zostavenia zoznamu URL pre offline sprievodcu (testovateľná bez prehliadača).
import { GUIDE_MANIFEST_URL, OFFLINE_URL } from "./constants";

export type GuideManifestInput = {
  cellars: { slug: string; image: { src: string } }[];
  stops: { order: number; audioUrl: string }[];
};

const AUDIO_PATH = /^\/audio\/|\.(?:mp3|m4a|ogg|wav)$/i;

export function isAudioUrl(url: string): boolean {
  return AUDIO_PATH.test(new URL(url, "http://local").pathname);
}

/**
 * Poradie: stránky, obrázky, potom audio (najväčšie nakoniec, aby progress rýchlo
 * ukázal, že mapa a prepisy už sú uložené). Bez duplicít, len relatívne URL z nášho originu.
 */
export function buildGuideManifest({ cellars, stops }: GuideManifestInput): string[] {
  const pages = ["/mapa", "/sprievodca", ...cellars.map((c) => `/mapa/${c.slug}`), OFFLINE_URL];
  const images = cellars.map((c) => c.image.src);
  const audio = [...stops].sort((a, b) => a.order - b.order).map((s) => s.audioUrl);

  const seen = new Set<string>();
  return [GUIDE_MANIFEST_URL, ...pages, ...images, ...audio].filter((url) => {
    if (!url.startsWith("/") || url.startsWith("//") || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}
