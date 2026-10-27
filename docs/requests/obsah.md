# Návrhy zmien zdieľaných súborov (session C: obsah)

Žiadnu zdieľanú zmenu som nepotreboval natvrdo. Obišiel som ich lokálne, ale pri integrácii odporúčam:

1. **Schéma viníc (`lib/schemas`)**: dáta o viničných tratiach (rozloha, rok výsadby, expozícia, pôda, odrody) sú zatiaľ v `content/pages/vinice.json` so schémou v `components/content/vineyards.ts`. Ak ich bude potrebovať aj e-shop (detail vína, odkaz na vinicu), presunúť schému do `lib/schemas` a loader do `lib/content`.
2. **Loader `getVineyards()`** v `lib/content` (viď bod 1).
3. **`lib/site.ts`**: pridať `openingHoursNote` a skutočné IČO/DIČ pre právne stránky (teraz zástupné `{IČO}`, `{DIČ}`). Otváracie hodiny na webe čítam z `content/cellars/07-na-sprasi.json`.
4. **`components/ui`**: formulárové polia (`Field`, `Select`, `Checkbox`) sú zatiaľ v `components/content/EnquiryForm.tsx`. Ak ich bude potrebovať checkout, treba ich presunúť do `components/ui`.
5. **`app/layout.tsx`**: pridať `<meta>` pre OG obrázok (`/images/og.png`), keď bude. Teraz majú OG obrázok len aktuality.
6. **`NewsPost.body`** je obyčajný text s odsekmi, nie MDX. Stránka aktuality ho tak vykresľuje. Ak má byť MDX, treba zmeniť schému a pridať závislosť `@next/mdx`.
7. **Formuláre** neodosielajú nič (`SERVER_SUBMIT_ENABLED = false` v `EnquiryForm.tsx`). Fáza 2: server action + e-mail cez Vercel Marketplace a ochrana proti spamu (honeypot už je, chýba rate limit alebo BotID).
