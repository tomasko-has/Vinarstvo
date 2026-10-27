import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/components/content/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Obchodné podmienky",
  description: "Všeobecné obchodné podmienky e-shopu Vinárstva Na Spraši. Návrh textu na kontrolu právnikom.",
  path: "/obchodne-podmienky",
});

export default function Page() {
  return (
    <LegalPage title="Obchodné podmienky" lead="Pravidlá nákupu v našom e-shope. Píšeme ich tak, aby sa dali prečítať.">
      <h2>1. Predávajúci</h2>
      <p>
        Predávajúcim je {site.name}, {site.address.street}, {site.address.zip} {site.address.city}. IČO: {"{IČO}"}, DIČ:{" "}
        {"{DIČ}"}, zapísané v {"{register}"}. Kontakt: {site.email}, {site.phone}.
      </p>

      <h2>2. Kto môže nakupovať</h2>
      <p>
        Alkohol predávame len osobám starším ako 18 rokov. Pri objednávke potvrdzujete, že ste plnoletý. Vek môže
        kuriér pri doručení overiť a pri pochybnostiach zásielku nevydá.
      </p>

      <h2>3. Objednávka a uzavretie zmluvy</h2>
      <p>
        Objednávku vytvoríte odoslaním košíka. Zmluva vzniká potvrdením objednávky z našej strany e-mailom. Ceny sú
        uvedené v eurách vrátane DPH a spotrebiteľskej dane, ak sa uplatňuje.
      </p>

      <h2>4. Cena a platba</h2>
      <p>
        Cena na stránke platí v čase odoslania objednávky. Spôsoby platby a náklady na dopravu sú uvedené na stránke
        Doprava a platba.
      </p>

      <h2>5. Odstúpenie od zmluvy</h2>
      <p>
        Spotrebiteľ môže od zmluvy uzavretej na diaľku odstúpiť do 14 dní od prevzatia tovaru. Vrátiť treba tovar
        nepoškodený a v pôvodnom obale. Podrobný postup a vzorový formulár doplníme po konzultácii s právnikom.
      </p>

      <h2>6. Reklamácie</h2>
      <p>Postup pri reklamácii je v samostatnom dokumente Reklamačný poriadok.</p>

      <h2>7. Ochrana osobných údajov</h2>
      <p>
        Osobné údaje spracúvame podľa zásad uvedených v dokumente Ochrana osobných údajov.
      </p>

      <h2>8. Riešenie sporov</h2>
      <p>
        Ak nie ste spokojný s vybavením sťažnosti, môžete sa obrátiť na subjekt alternatívneho riešenia spotrebiteľských
        sporov alebo na Slovenskú obchodnú inšpekciu. Presné údaje o orgáne dohľadu doplníme.
      </p>

      <h2>9. Záverečné ustanovenia</h2>
      <p>Tieto podmienky nadobúdajú účinnosť dňom {"{dátum}"}. Zmeny podmienok zverejníme na tejto stránke.</p>
    </LegalPage>
  );
}
