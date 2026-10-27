import { createSerwistRoute } from "@serwist/turbopack";
import { OFFLINE_URL } from "@/lib/offline/constants";

// Revízia stránky /offline: mení sa s každým buildom, aby sa precache nezasekla na starej verzii.
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now());

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: OFFLINE_URL, revision }],
  swSrc: "app/sw.ts",
  // Audio a fotky sú veľké: audio ide len cez explicitné stiahnutie, obrázky cez StaleWhileRevalidate.
  globIgnores: ["public/audio/**", "public/images/**"],
  useNativeEsbuild: true,
});
