import Image from "next/image";
import { ArchFrame } from "@/components/ui/ArchFrame";
import type { Wine } from "@/lib/schemas";

/** Fotka fľaše v oblúkovom ráme. Bez fotky ostane prázdny sprašový oblúk. */
export function WineImage({
  wine,
  sizes,
  priority = false,
  className = "",
}: {
  wine: Pick<Wine, "images" | "name">;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const image = wine.images[0];
  return (
    <ArchFrame className={className}>
      {image && (
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      )}
    </ArchFrame>
  );
}
