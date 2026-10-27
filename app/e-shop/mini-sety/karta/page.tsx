import type { Metadata } from "next";
import { Suspense } from "react";
import { TastingCard } from "@/components/shop/minisets/TastingCard";
import { Container } from "@/components/ui/Container";
import { getMiniSets, getWines } from "@/lib/content";

export const metadata: Metadata = {
  title: "Degustačná karta",
  robots: { index: false },
};

// Pri tlači skryjeme hlavičku, pätu a navigáciu webu. Návrh na `print:hidden` v layoute je v docs/requests/eshop.md.
const printCss = "@media print{body>header,body>footer,body>nav,nav[aria-label='E-shop']{display:none!important}body{padding:0!important}}";

export default async function TastingCardPage() {
  const [sets, wines] = await Promise.all([getMiniSets(), getWines()]);
  return (
    <Container className="pt-8 sm:pt-12">
      <style>{printCss}</style>
      <Suspense fallback={<p className="text-pivnica-makka">Pripravujeme kartu…</p>}>
        <TastingCard sets={sets} wines={wines} />
      </Suspense>
    </Container>
  );
}
