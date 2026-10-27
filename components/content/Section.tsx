import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type Tone = "light" | "soil" | "cellar";

const tones: Record<Tone, string> = {
  light: "bg-vapno text-pivnica",
  soil: "bg-spras-svetla text-pivnica",
  cellar: "bg-pivnica text-vapno",
};

/** Vodorovný pás stránky. `labelledBy` je id nadpisu, ktorý sekciu pomenúva. */
export function Section({
  tone = "light",
  labelledBy,
  className = "",
  children,
}: {
  tone?: Tone;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={labelledBy} className={`${tones[tone]} py-16 sm:py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  id,
  children,
  lead,
  tone = "light",
}: {
  id: string;
  children: ReactNode;
  lead?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="mb-10 max-w-(--container-text)">
      <h2 id={id} className="text-2xl sm:text-3xl">
        {children}
      </h2>
      {lead ? (
        <p className={`mt-4 text-lg ${tone === "cellar" ? "text-vapno/80" : "text-pivnica-makka"}`}>{lead}</p>
      ) : null}
    </div>
  );
}
