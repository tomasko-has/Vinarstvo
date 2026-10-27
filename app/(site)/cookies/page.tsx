import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/components/content/seo";

export const metadata = pageMetadata({
  title: "Cookies",
  description: "Aké cookies web používa a ako ich môžete odmietnuť. Návrh textu na kontrolu právnikom.",
  path: "/cookies",
});

export default function Page() {
  return (
    <LegalPage title="Cookies" lead="Malé súbory, ktoré si web ukladá vo vašom prehliadači. Bez vášho súhlasu nepoužívame žiadne okrem nevyhnutných.">
      <h2>Nevyhnutné</h2>
      <p>
        Potrebujeme ich, aby web fungoval: pamätajú si obsah košíka, potvrdenie veku a vaše rozhodnutie o cookies.
        Súhlas na ne nepotrebujeme.
      </p>

      <h2>Analytické</h2>
      <p>
        Pomáhajú nám zistiť, ktoré stránky sú užitočné. Zapneme ich len s vaším súhlasom. Zatiaľ žiadne
        analytické nástroje nepoužívame.
      </p>

      <h2>Marketingové</h2>
      <p>Zatiaľ ich nepoužívame.</p>

      <h2>Ako ich odmietnuť</h2>
      <p>
        Cookie lišta bude mať tlačidlá „Prijať“ a „Odmietnuť“ rovnako veľké a rovnako ľahko dostupné. Cookies môžete
        zmazať aj v nastaveniach prehliadača.
      </p>

      <h2>Zoznam cookies</h2>
      <p>Tabuľku konkrétnych cookies doplníme, keď bude hotový košík a cookie lišta.</p>
    </LegalPage>
  );
}
