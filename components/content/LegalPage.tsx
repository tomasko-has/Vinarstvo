import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "./PageHeader";
import { Prose } from "./Prose";

/** Spoločný rám právnych stránok. Texty sú zatiaľ vzor a pred spustením ich musí skontrolovať právnik. */
export function LegalPage({
  title,
  lead,
  updated = "október 2026",
  children,
}: {
  title: string;
  lead: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} lead={lead} />
      <Container className="py-12 sm:py-16">
        <aside
          aria-label="Upozornenie"
          className="mb-10 max-w-(--container-text) rounded-(--radius-panel) border-2 border-spras-tmava bg-spras-svetla p-5"
        >
          <p className="font-bold">Návrh textu na kontrolu právnikom</p>
          <p className="mt-2">
            Tento dokument je zatiaľ vzor. Pred spustením obchodu ho musí skontrolovať a upraviť právnik. Údaje v
            zložených zátvorkách doplníme.
          </p>
        </aside>
        <Prose>{children}</Prose>
        <p className="mt-12 text-sm text-pivnica-makka">Posledná úprava: {updated}</p>
      </Container>
    </>
  );
}
