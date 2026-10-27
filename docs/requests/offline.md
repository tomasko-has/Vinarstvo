# Návrhy zmien zdieľaných súborov (session D, offline)

## 1. `app/layout.tsx`: namontovať offline vrstvu (povinné, inak sa SW nezaregistruje)

```tsx
import { OfflineProvider } from "@/components/offline/OfflineProvider";
// ...
<body ...>
  <OfflineProvider />   {/* hneď za <a href="#obsah"> */}
```

`OfflineProvider` registruje SW (len v produkcii), vykresľuje pruh „Ste offline“ a výzvu „Pridať na plochu“ (len na `/mapa`, `/sprievodca`).

## 2. `app/layout.tsx`: ikona pre iOS

```ts
export const metadata = { ..., icons: { apple: "/icons/apple-touch-icon.png" } };
```
(Manifest sa linkuje automaticky z `app/manifest.ts`.)

## 3. Pre session A (mapa/sprievodca)

- Raster obrázky cez `next/image` idú ako `/_next/image?url=...`, čo sa nezhoduje s URL v offline manifeste. Použite `unoptimized` alebo SVG, inak sa obrázky offline nenačítajú z uloženého sprievodcu.
- Sprievodca má volať `cacheGuide`, `isGuideCached`, `clearGuideCache` z `@/lib/offline/guide` (podpisy nezmenené).
- Ak pribudnú ďalšie URL (napr. `/sprievodca/[id]`), treba ich pridať do `lib/offline/manifest.ts` (session D) alebo dať vedieť.
