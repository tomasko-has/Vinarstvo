import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/components/content/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Reklamačný poriadok",
  description: "Ako reklamovať tovar z e-shopu Vinárstva Na Spraši. Návrh textu na kontrolu právnikom.",
  path: "/reklamacny-poriadok",
});

export default function Page() {
  return (
    <LegalPage title="Reklamačný poriadok" lead="Ak je s vínom alebo zásielkou niečo v neporiadku, napíšte nám. Vyriešime to.">
      <h2>1. Zodpovednosť za vady</h2>
      <p>
        Zodpovedáme za to, že tovar má pri prevzatí dohodnuté vlastnosti a hodí sa na účel, na ktorý sa zvyčajne
        používa. Záručná doba je 24 mesiacov. Pri víne sa počíta s tým, že jeho vlastnosti sa vekom menia.
      </p>

      <h2>2. Poškodená zásielka</h2>
      <p>
        Zásielku skontrolujte pri prevzatí. Ak je obal poškodený alebo fľaša rozbitá, spíšte s kuriérom zápis o
        škode a čo najskôr nás kontaktujte. Pošlite fotografie obalu a obsahu.
      </p>

      <h2>3. Ako reklamovať</h2>
      <ul>
        <li>Napíšte na {site.email} alebo zavolajte na {site.phone}.</li>
        <li>Uveďte číslo objednávky, popis vady a priložte fotografie.</li>
        <li>Pri chybe vína ponechajte fľašu aj s korkom. Nevylievajte ju.</li>
      </ul>

      <h2>4. Vybavenie reklamácie</h2>
      <p>
        O reklamácii rozhodneme do 3 pracovných dní a vybavíme ju do 30 dní odo dňa uplatnenia. Podľa povahy vady
        ponúkneme výmenu, opravu, zľavu alebo vrátenie peňazí.
      </p>

      <h2>5. Miesto uplatnenia</h2>
      <p>
        Reklamáciu môžete uplatniť na adrese {site.address.street}, {site.address.zip} {site.address.city}, alebo
        e-mailom. Presné údaje o prevádzke doplníme.
      </p>
    </LegalPage>
  );
}
