import { Container } from "@/components/ui/Container";

// Dočasný obsah prázdnych stránok z fázy 0. Vlastník stránky ho nahradí.
export function PagePlaceholder({ title, owner }: { title: string; owner: string }) {
  return (
    <Container width="text" className="py-16">
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-4 text-pivnica-makka">Táto stránka sa pripravuje. Vlastník: {owner}.</p>
    </Container>
  );
}
