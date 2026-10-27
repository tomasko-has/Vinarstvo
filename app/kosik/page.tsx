import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Container } from "@/components/ui/Container";
import { eshopConfig } from "@/lib/cart/config";
import type { ShopCatalog } from "@/lib/cart/totals";
import { getGiftSets, getMiniSets, getWines } from "@/lib/content";

export const metadata: Metadata = {
  title: "Košík",
  robots: { index: false },
};

export default async function CartPage() {
  const [wines, miniSets, giftSets] = await Promise.all([getWines(), getMiniSets(), getGiftSets()]);
  // Košík žije v localStorage. Stránka nesie celý katalóg, aby ceny fungovali aj offline z cache.
  const catalog: ShopCatalog = {
    wines,
    miniSets,
    giftSets,
    cartonSize: eshopConfig.cartonSize,
    cartonDiscountPct: eshopConfig.cartonDiscountPct,
    customMiniSetPriceCents: eshopConfig.customMiniSetPriceCents,
  };

  return (
    <Container className="pt-8 sm:pt-12">
      <h1 className="text-3xl sm:text-4xl">Košík</h1>
      <div className="mt-8">
        <CartView catalog={catalog} />
      </div>
    </Container>
  );
}
