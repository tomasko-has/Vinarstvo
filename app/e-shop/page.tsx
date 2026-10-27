import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Catalog, CatalogStatic } from "@/components/shop/Catalog";
import { Container } from "@/components/ui/Container";
import { eshopConfig } from "@/lib/cart/config";
import { getWines } from "@/lib/content";

export const metadata: Metadata = {
  title: "E-shop",
  description:
    "Vína z pivnice v Sprašovej uličke: svieži Rad Ulička, vína z jednotlivých viníc Radu Spraš a výberový Rad Pivnica. Kartón na mieru so zľavou.",
};

export default async function ShopPage() {
  const wines = await getWines();
  return (
    <Container className="pt-8 sm:pt-12">
      <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl">Vína z našej pivnice</h1>
          <p className="mt-4 text-lg text-pivnica-makka">
            Všetko, čo práve leží v pivnici. Fľaše posielame v kartónoch po šiestich, ale kúpiť si môžete aj jednu.
          </p>
        </div>
        <p className="max-w-sm border-l-4 border-spras pl-4 text-pivnica-makka">
          Šesť fliaš podľa seba?{" "}
          <Link href="/e-shop/zostav-si-karton" className="font-bold text-frankovka underline underline-offset-4">
            Zostavte si kartón
          </Link>{" "}
          a dostanete {eshopConfig.cartonDiscountPct} % zľavu.
        </p>
      </header>

      <div className="mt-10">
        <Suspense fallback={<CatalogStatic wines={wines} />}>
          <Catalog wines={wines} />
        </Suspense>
      </div>
    </Container>
  );
}
