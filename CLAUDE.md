# CLAUDE.md

Projekt: **Vinárstvo Na Spraši**. Celé zadanie je v `C:\Users\tombe\vinarstvi\MASTER_PROMPT.md`. Súbor nie je v gite, takže ho čítaj vždy z tejto absolútnej cesty (aj z worktree). Prečítaj ho pred prvou zmenou.

## Pravidlá

- **Pri akejkoľvek práci na UI (stránky, komponenty, layout, štýly, mapa) vždy najprv načítaj skill `frontend-design`.** Žiadny generický „AI slop“: žiadne predvolené šablónové layouty, fialové gradienty, Inter všade ani náhodné emoji. Drž sa dizajnového smeru zo sekcie 7 v MASTER_PROMPT.md.
- **Do commitov nikdy nepíš `Co-Authored-By: ...` ani žiadny iný riadok s atribúciou Claude/AI.** Platí aj pre amend, squash a merge commity. Do PR popisov tiež nepridávaj „Generated with Claude Code“.
- **Next.js 16 sa líši od starších verzií** (Cache Components, `use cache`, `PageProps`/`LayoutProps`). Pred písaním kódu si prečítaj príslušný návod v `node_modules/next/dist/docs/`. Pozri aj `AGENTS.md`.
- **Mení len súbory vo svojom rozsahu** (MASTER_PROMPT.md, sekcia 8.1 a 11). Zdieľané súbory (`lib/schemas`, `lib/content`, `lib/site.ts`, `lib/navigation.ts`, `components/ui`, `components/layout`, `app/layout.tsx`, `app/globals.css`) nemeň. Návrh zmeny zapíš do `docs/requests/<session>.md` a pokračuj s lokálnym obídením.
- Texty po slovensky, kód a identifikátory po anglicky (výnimka: názvy vecí z domény ako `spras`, `pivnica`).
- Dizajnové tokeny sú v `app/globals.css` (`@theme`): farby `vapno`, `spras`, `frankovka`, `pivnica`, `listok`, písma `font-display` a `font-sans`. Nepíš vlastné hex farby ani nové písma.

## Príkazy

```
npm run dev         # vývojový server
npm run build       # produkčný build (musí prejsť)
npm run lint        # ESLint
npm run typecheck   # next typegen + tsc
npm test            # Vitest (logika + kontrola seed dát v content/)
```

## Štruktúra

- `content/`: obsah ako JSON (vína, pivnice, sprievodca, sety, aktuality). Validuje ho Zod pri načítaní aj v `content/content.test.ts`.
- `lib/schemas`: dátový model (zmluva medzi sessions). `lib/content`: loadery (`getWines()`, `getCellars()`…).
- `lib/offline/guide.ts`: kontrakt medzi mapou a offline vrstvou (zatiaľ stub, implementuje session D).
- `lib/cart/store.ts`: základ košíka (Zustand), rozširuje session B.
- Každá stránka zo sitemapy už existuje ako `PagePlaceholder`. Vlastník ho nahradí.
