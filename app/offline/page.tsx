import type { Metadata } from "next";
import { GuideStatus } from "@/components/offline/GuideStatus";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Ste offline", robots: { index: false } };

export default function Page() {
  return (
    <Container width="text" className="py-16">
      <h1 className="text-3xl">Ste offline</h1>
      <p className="mt-4 text-pivnica-makka">
        Táto stránka sa bez signálu nedá načítať. Stránky, ktoré ste už otvorili, a uložený sprievodca fungujú ďalej.
      </p>
      <GuideStatus />
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/mapa">Mapa uličky</ButtonLink>
        <ButtonLink href="/sprievodca" variant="secondary">
          Audio sprievodca
        </ButtonLink>
      </div>
    </Container>
  );
}
