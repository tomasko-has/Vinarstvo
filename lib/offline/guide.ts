// Kontrakt medzi mapou/sprievodcom (session A) a offline vrstvou (session D). MASTER_PROMPT.md, sekcia 6.3.
// Beží v prehliadači: ukladá priamo do Cache API (SW ich pri offline požiadavkách číta).
import { CACHE_NAMES, GUIDE_MANIFEST_URL } from "./constants";
import { isAudioUrl } from "./manifest";

export type GuideCacheProgress = { done: number; total: number; bytes: number };

const cacheFor = (url: string) => (isAudioUrl(url) ? CACHE_NAMES.guideAudio : CACHE_NAMES.guideContent);

/** Zoznam URL, ktoré treba stiahnuť, aby sprievodca fungoval offline. Offline ho vezme z uloženej kópie. */
export async function getGuideManifest(): Promise<string[]> {
  try {
    const res = await fetch(GUIDE_MANIFEST_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as string[];
  } catch (error) {
    if (typeof caches !== "undefined") {
      const stored = await (await caches.open(CACHE_NAMES.guideContent)).match(GUIDE_MANIFEST_URL);
      if (stored) return (await stored.json()) as string[];
    }
    throw error;
  }
}

export async function cacheGuide(onProgress?: (p: GuideCacheProgress) => void): Promise<void> {
  if (typeof caches === "undefined") throw new Error("Tento prehliadač nepodporuje offline úložisko.");
  const urls = await getGuideManifest();
  let done = 0;
  let bytes = 0;
  onProgress?.({ done, total: urls.length, bytes });

  for (const url of urls) {
    const res = await fetch(url, { cache: "reload" });
    if (!res.ok || res.redirected) throw new Error(`Nepodarilo sa stiahnuť ${url} (${res.status})`);
    // blob() aj spočíta veľkosť; do cache ide kópia s pôvodnými hlavičkami, vždy ako 200 (Range rieši SW)
    const blob = await res.blob();
    const cache = await caches.open(cacheFor(url));
    await cache.put(url, new Response(blob, { status: 200, headers: res.headers }));
    done += 1;
    bytes += blob.size;
    onProgress?.({ done, total: urls.length, bytes });
  }
}

export async function isGuideCached(): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  try {
    const urls = await getGuideManifest();
    const checks = await Promise.all(urls.map(async (url) => Boolean(await (await caches.open(cacheFor(url))).match(url))));
    return urls.length > 0 && checks.every(Boolean);
  } catch {
    return false;
  }
}

export async function clearGuideCache(): Promise<void> {
  if (typeof caches === "undefined") return;
  await Promise.all([caches.delete(CACHE_NAMES.guideContent), caches.delete(CACHE_NAMES.guideAudio)]);
}
