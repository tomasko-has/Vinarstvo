// Názvy cache zdieľané medzi Service Workerom (app/sw.ts) a klientskym kódom (guide.ts).
// Pri zmene formátu uložených dát zvýšte CACHE_VERSION: starý obsah sa zmaže pri aktivácii SW.
export const CACHE_VERSION = "v1";

export const CACHE_NAMES = {
  pages: `pages-${CACHE_VERSION}`,
  rsc: `pages-rsc-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  json: `content-json-${CACHE_VERSION}`,
  /** Stránky, obrázky a JSON stiahnuté tlačidlom „Stiahnuť offline“. */
  guideContent: `guide-content-${CACHE_VERSION}`,
  /** MP3 sprievodcu, napĺňa sa len explicitným stiahnutím. */
  guideAudio: `guide-audio-${CACHE_VERSION}`,
} as const;

/** Cache, ktoré SW spravuje sám. Všetko, čo vyzerá ako naša cache so starou verziou, sa maže. */
export const MANAGED_CACHE_PATTERN = /^(pages|pages-rsc|images|content-json|guide-content|guide-audio)-v\d+$/;

export const GUIDE_MANIFEST_URL = "/offline/guide-manifest.json";
export const OFFLINE_URL = "/offline";
export const SW_URL = "/serwist/sw.js";
