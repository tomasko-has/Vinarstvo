/// <reference lib="esnext" />
/// <reference lib="webworker" />
import {
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
  StaleWhileRevalidate,
  createPartialResponse,
  type PrecacheEntry,
  type RouteHandlerCallbackOptions,
  type RuntimeCaching,
  type SerwistGlobalConfig,
} from "serwist";
import { CACHE_NAMES, MANAGED_CACHE_PATTERN, OFFLINE_URL } from "@/lib/offline/constants";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const DAY = 24 * 60 * 60;

/** Obsah stiahnutý tlačidlom „Stiahnuť offline“ je poslednou záchranou pred /offline. */
async function fromGuideCache(request: Request): Promise<Response | undefined> {
  const cache = await caches.open(CACHE_NAMES.guideContent);
  return cache.match(request, { ignoreSearch: false }) ?? cache.match(new URL(request.url).pathname);
}

/** Obalí stratégiu: pri zlyhaní siete aj cache skúsi ešte uložený sprievodca, inak chybu pošle ďalej (fallback). */
function withGuideFallback(strategy: { handle: (o: never) => Promise<Response> }) {
  return async (options: RouteHandlerCallbackOptions) => {
    try {
      return await strategy.handle({ request: options.request, event: options.event } as never);
    } catch (error) {
      const stored = await fromGuideCache(options.request);
      if (stored) return stored;
      throw error;
    }
  };
}

// Audio sa do cache nedostáva za behu, len explicitným stiahnutím (lib/offline/guide.ts).
// Prehrávač žiada Range, preto z uloženej kópie skladáme 206.
const audioHandler = async ({ request }: RouteHandlerCallbackOptions) => {
  const stored = await (await caches.open(CACHE_NAMES.guideAudio)).match(request.url);
  if (!stored) return fetch(request);
  return request.headers.has("range") ? createPartialResponse(request, stored) : stored;
};

const pages = new NetworkFirst({
  cacheName: CACHE_NAMES.pages,
  networkTimeoutSeconds: 3,
  plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * DAY })],
});

const rsc = new NetworkFirst({
  cacheName: CACHE_NAMES.rsc,
  networkTimeoutSeconds: 3,
  plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * DAY })],
});

const images = new StaleWhileRevalidate({
  cacheName: CACHE_NAMES.images,
  plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 30 * DAY, maxAgeFrom: "last-used" })],
});

const json = new StaleWhileRevalidate({
  cacheName: CACHE_NAMES.json,
  plugins: [new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 7 * DAY })],
});

const runtimeCaching: RuntimeCaching[] = [
  { matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/audio/"), handler: audioHandler },
  { matcher: ({ request, sameOrigin }) => sameOrigin && request.headers.get("RSC") === "1", handler: withGuideFallback(rsc) },
  { matcher: ({ request, sameOrigin }) => sameOrigin && request.destination === "document", handler: withGuideFallback(pages) },
  { matcher: ({ request, sameOrigin }) => sameOrigin && request.destination === "image", handler: withGuideFallback(images) },
  { matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith(".json"), handler: withGuideFallback(json) },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: process.env.NODE_ENV === "production" ? runtimeCaching : [],
});

// Stránka, ktorá nie je v žiadnej cache, dostane /offline (precache). Ostatné požiadavky zlyhajú štandardne.
serwist.setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    const offline = await serwist.matchPrecache(OFFLINE_URL);
    if (offline) return offline;
  }
  return Response.error();
});

// Upratanie našich cache zo starších verzií (precache čistí Serwist sám).
self.addEventListener("activate", (event) => {
  const current = new Set<string>(Object.values(CACHE_NAMES));
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => MANAGED_CACHE_PATTERN.test(n) && !current.has(n)).map((n) => caches.delete(n))),
      ),
  );
});

serwist.addEventListeners();
