import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/components/content/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Ochrana osobných údajov",
  description: "Aké osobné údaje zbierame, prečo a aké máte práva. Návrh textu na kontrolu právnikom.",
  path: "/ochrana-osobnych-udajov",
});

export default function Page() {
  return (
    <LegalPage title="Ochrana osobných údajov" lead="Zbierame len to, čo potrebujeme na vybavenie vašej objednávky alebo dopytu.">
      <h2>Prevádzkovateľ</h2>
      <p>
        {site.name}, {site.address.street}, {site.address.zip} {site.address.city}. Kontakt pre otázky k údajom:{" "}
        {site.email}.
      </p>

      <h2>Aké údaje spracúvame</h2>
      <ul>
        <li>Pri objednávke: meno, adresa, e-mail, telefón, obsah objednávky.</li>
        <li>Pri dopyte cez formulár: meno, e-mail, telefón a text správy.</li>
        <li>Pri návšteve webu: technické údaje, ak súhlasíte s analytickými cookies.</li>
      </ul>

      <h2>Prečo a na akom základe</h2>
      <ul>
        <li>Vybavenie objednávky a zmluvy (plnenie zmluvy).</li>
        <li>Odpoveď na váš dopyt (oprávnený záujem, predzmluvné vzťahy).</li>
        <li>Účtovné a daňové povinnosti (zákonná povinnosť).</li>
        <li>Štatistika návštevnosti (súhlas).</li>
      </ul>

      <h2>Komu údaje poskytujeme</h2>
      <p>
        Len tým, ktorí sú nevyhnutní na vybavenie: kuriérovi, prevádzkovateľovi platobnej brány a účtovníkovi. Zoznam
        konkrétnych sprostredkovateľov doplníme po výbere služieb.
      </p>

      <h2>Ako dlho údaje uchovávame</h2>
      <p>
        Údaje z dopytov mažeme po vybavení, najneskôr po 12 mesiacoch. Účtovné doklady uchovávame, ako ukladá zákon.
      </p>

      <h2>Vaše práva</h2>
      <p>
        Máte právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracovania, prenosnosť a právo namietať.
        Súhlas môžete kedykoľvek odvolať. Sťažnosť môžete podať na Úrade na ochranu osobných údajov SR.
      </p>
    </LegalPage>
  );
}
