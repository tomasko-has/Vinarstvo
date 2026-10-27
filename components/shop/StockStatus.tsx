import { stockStatus } from "@/lib/cart/catalog";
import { bottleForms, plural } from "@/lib/cart/format";

const tone = {
  skladom: "text-listok",
  posledne: "text-frankovka",
  vypredane: "text-pivnica-makka",
} as const;

/** Stav skladu slovom; farba je len doplnok, význam nesie text. */
export function StockStatus({ stock, className = "" }: { stock: number; className?: string }) {
  const status = stockStatus(stock);
  const text =
    status === "vypredane"
      ? "Vypredané"
      : status === "posledne"
        ? `Posledné ${stock} ${plural(stock, bottleForms)}`
        : "Skladom";
  return (
    <p className={`inline-flex items-center gap-1.5 text-sm font-bold ${tone[status]} ${className}`}>
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${status === "vypredane" ? "border border-current" : "bg-current"}`}
      />
      {text}
    </p>
  );
}
