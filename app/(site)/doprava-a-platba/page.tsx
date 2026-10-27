import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/components/content/seo";

export const metadata = pageMetadata({
  title: "Doprava a platba",
  description: "Ako doručujeme víno a ako môžete zaplatiť. Návrh textu na kontrolu, ceny doplníme.",
  path: "/doprava-a-platba",
});

export default function Page() {
  return (
    <LegalPage title="Doprava a platba" lead="Víno posielame zabalené tak, aby došlo celé. Tu je, ako to funguje.">
      <h2>Doprava</h2>
      <ul>
        <li>Kuriérom na adresu: {"{cena}"} €, doručenie do {"{počet}"} pracovných dní.</li>
        <li>Osobný odber v pivnici: zadarmo, v otváracích hodinách alebo po dohode.</li>
        <li>Doprava zadarmo pri objednávke nad {"{suma}"} €.</li>
      </ul>
      <p>
        Fľaše balíme do kartónov s výplňou. Zásielku s alkoholom odovzdá kuriér len plnoletej osobe a môže si overiť
        doklad.
      </p>

      <h2>Platba</h2>
      <ul>
        <li>Platobnou kartou online.</li>
        <li>Bankovým prevodom vopred.</li>
        <li>Dobierkou pri prevzatí (príplatok {"{cena}"} €).</li>
      </ul>
      <p>Dostupné spôsoby platby závisia od zvolenej platobnej brány, ktorú ešte vyberáme.</p>

      <h2>Doručenie mimo Slovenska</h2>
      <p>Zatiaľ posielame len po Slovensku. Ak chcete víno do inej krajiny, napíšte nám.</p>
    </LegalPage>
  );
}
