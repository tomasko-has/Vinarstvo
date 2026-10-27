// Kontrakt medzi mapou/sprievodcom (session A) a offline vrstvou (session D).
// Fáza 0 dodáva len stub; implementuje session D, volá session A. Pozri MASTER_PROMPT.md, sekcia 6.3.
export type GuideCacheProgress = { done: number; total: number; bytes: number };

/** Zoznam URL, ktoré treba stiahnuť, aby sprievodca fungoval offline. */
export async function getGuideManifest(): Promise<string[]> {
  return [];
}

export async function cacheGuide(onProgress?: (p: GuideCacheProgress) => void): Promise<void> {
  onProgress?.({ done: 0, total: 0, bytes: 0 });
}

export async function isGuideCached(): Promise<boolean> {
  return false;
}

export async function clearGuideCache(): Promise<void> {}
