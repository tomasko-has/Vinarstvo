# Návrhy zdieľaných zmien zo session A (mapa a sprievodca)

Nič zo zoznamu nižšie nie je nutné pre fungovanie mapy. Všetko je obídené lokálne v `components/map` a `components/guide`.

## 1. `components/ui/Icon.tsx`: ikony prehrávača a mapy

Mapa a prehrávač potrebujú `play`, `pause`, `prev`, `next`, `plus`, `minus`, `locate`, `download`, `check`, `back`, `arrow`.
Teraz sú v `components/map/icons.tsx` (`MapIcon`). Návrh: presunúť ich do zdieľaného `Icon`, aby ich mohli použiť aj iné sessions (napr. `back`/`arrow` v e-shope), a `MapIcon` potom zmazať.

## 2. `app/globals.css`: textúra papiera

`components/map/map.module.css` má triedu `.paper` (jemné zrno cez SVG feTurbulence, farby z tokenov). Ak sa má papierová textúra objaviť aj inde (napr. degustačná karta, sekcie s vrstvami pôdy), dá sa presunúť do `@layer utilities` ako `bg-papier`.

## 3. `lib/schemas`: GPS pri bodoch záujmu (voliteľné)

`mapPoiSchema` nemá `gps`. Odkaz „Navigovať k vstupu“ preto počítam spätnou afinnou transformáciou z `mapPoint` (`createGeoTransform(anchors).toGps`). Funguje to presne, kým sedia kotvy. Ak by sa neskôr chcel parkovací bod navigovať na presnú adresu, stačí pridať `gps: gpsSchema.optional()`.

## 4. Pre session D (offline): čo patrí do `getGuideManifest()`

- stránky: `/mapa`, `/sprievodca`, `/mapa/<slug>` pre všetkých 12 pivníc (`getCellars()`),
- audio: `audioUrl` všetkých zastávok z `getGuideStops()` (teraz `/audio/guide/01-vstup.mp3` … `08-koniec-ulicky.mp3`, tiché placeholdery po 12 s, ~12 kB),
- obrázky: `/images/placeholder/pivnica.svg` (obrázky pivníc z `cellar.image.src`).

Mapa sama nesťahuje nič za behu: ilustrácia je inline SVG v HTML a otváracie hodiny sa počítajú v prehliadači. Po uložení stránok do cache teda funguje bez siete.

`GuideDownload` volá `isGuideCached()` pri načítaní, `cacheGuide(onProgress)` po kliknutí (zobrazuje `done/total` a `bytes` v MB) a `clearGuideCache()` pri „Odstrániť z telefónu“. Ak `cacheGuide` vyhodí chybu, ukáže hlášku a dá sa skúsiť znova.
