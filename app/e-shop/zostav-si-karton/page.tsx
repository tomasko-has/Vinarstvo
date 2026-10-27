import type { Metadata } from "next";
import { Suspense } from "react";
import { CartonBuilderLoader, CartonBuilderSkeleton } from "@/components/shop/carton/CartonBuilder";
import { Container } from "@/components/ui/Container";
import { isCartonEligible } from "@/lib/cart/carton";
import { eshopConfig } from "@/lib/cart/config";
import { getWines } from "@/lib/content";

export const metadata: Metadata = {
  title: "Zostav si kartón",
  description: `Šesť fliaš podľa vašej chuti v jednom kartóne so zľavou ${eshopConfig.cartonDiscountPct} %. Ľubovoľný mix vín z našej pivnice.`,
};

export default async function CartonPage() {
  const wines = (await getWines()).filter(isCartonEligible);
  const order = { ulicka: 0, spras: 1, pivnica: 2 } as const;
  wines.sort((a, b) => order[a.line] - order[b.line] || a.priceCents - b.priceCents);

  return (
    <Container className="pt-8 sm:pt-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Zostavte si kartón</h1>
        <p className="mt-4 text-lg text-pivnica-makka">
          Šesť fliaš 0,75 l v ľubovoľnom mixe. Za plný kartón vám dáme zľavu {eshopConfig.cartonDiscountPct} % a
          pošleme ho v jednej krabici.
        </p>
      </header>
      <div className="mt-10">
        <Suspense fallback={<CartonBuilderSkeleton size={eshopConfig.cartonSize} />}>
          <CartonBuilderLoader
            wines={wines}
            recommended={eshopConfig.recommendedCartons}
            size={eshopConfig.cartonSize}
            discountPct={eshopConfig.cartonDiscountPct}
          />
        </Suspense>
      </div>
    </Container>
  );
}
