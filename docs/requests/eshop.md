# Návrhy zmien zdieľaných súborov (session B, e-shop)

Session B tieto súbory nemenila. Každý bod má lokálne obídenie, takže nič nie je blokujúce.

## 1. `lib/schemas`: cena vlastného mini-setu v `shopConfigSchema`

`content/shop-config.json` má nové pole `customMiniSetPriceCents` (17,90 €). Zdieľaná schéma ho nepozná a Zod ho pri `getShopConfig()` zahodí.

- **Návrh:** pridať do `shopConfigSchema` pole `customMiniSetPriceCents: cents`.
- **Obídenie:** `lib/cart/config.ts` schému rozširuje cez `.extend()` a načítava JSON priamo. Po zmene schémy môže `eshopConfig` nahradiť `getShopConfig()`.

## 2. `lib/schemas`: popisky enumov v súbore bez Zodu

`wineLineLabel`, `wineColorLabel` a `sweetnessLabel` sú v `lib/schemas/index.ts`. Každý import hodnoty z tohto súboru do klientskeho komponentu pribalí do prehliadača celý Zod (desiatky kB), čo ide proti cieľu Lighthouse ≥ 90.

- **Návrh:** presunúť popisky (a zoznamy hodnôt enumov) do `lib/schemas/labels.ts` bez importu Zodu a z `index.ts` ich len re-exportovať.
- **Obídenie:** `lib/cart/labels.ts` má kópiu typovanú na typy zo schém. Test `lib/cart/catalog.test.ts` overuje, že sa zhoduje s enummi v schémach.

## 3. `lib/schemas`: množstvo pri kartóne a mini-sete

`cartItemSchema` má `qty` len pri `bottle` a `gift-set`. Dva rovnaké kartóny sú dnes dve položky.

- **Návrh (nízka priorita):** voliteľné `qty` aj pri `carton` a `mini-set`.
- **Obídenie:** každý kartón a mini-set je samostatná položka s vlastným `id`. Kartón sa dá z košíka upraviť cez `/e-shop/zostav-si-karton?upravit=<id>`.

## 4. `app/layout.tsx` / `components/layout`: skryť hlavičku a pätu pri tlači

Degustačná karta (`/e-shop/mini-sety/karta`) je určená na tlač.

- **Návrh:** pridať `print:hidden` na `SiteHeader`, `SiteFooter`, `MobileTabBar` a `print:pb-0` na `body`.
- **Obídenie:** stránka karty má vlastný `<style>` s `@media print`, ktorý skryje `body>header`, `body>footer` a `body>nav`.

## 5. Pre session C (`/vinarstvo/vinice`)

Detail vína odkazuje na vinicu ako `/vinarstvo/vinice#<slug>`, kde slug je názov vinice bez diakritiky: `#hlinisko`, `#pod-hajom`, `#dlhe-rady`, `#kamenna`. Ak sekcie viníc dostanú tieto `id`, odkaz skočí priamo na vinicu.

## 6. Pre session D (offline)

- Košík (`/kosik`) nesie v HTML celý katalóg (vína, sety, konfiguráciu), aby sa ceny dali spočítať aj offline. Stačí ho cachovať ako bežnú stránku (NetworkFirst).
- Stav košíka je v `localStorage` pod kľúčom `na-sprasi-kosik` (Zustand persist, verzia 1).
- Tlačidlo „Pokračovať k pokladni“ je zatiaľ vždy neaktívne. Offline hlášku riadi `components/cart/useOnline.ts` (`navigator.onLine` + udalosti `online`/`offline`).
