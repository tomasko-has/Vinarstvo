import { BottleIllustration, type BottleWine } from "@/components/illustration/BottleIllustration";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { Picture } from "@/components/ui/Picture";
import type { Wine } from "@/lib/schemas";

/**
 * Obraz vína v oblúkovom ráme. Ak je v dátach skutočná fotka, zobrazí sa tá,
 * inak fľaša s etiketou nakreslená z dát vína.
 */
export function WineImage({
  wine,
  sizes,
  priority = false,
  className = "",
}: {
  wine: BottleWine & Pick<Wine, "images">;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const photo = wine.images[0];
  return (
    <ArchFrame className={className}>
      <Picture
        photo={photo}
        sizes={sizes}
        priority={priority}
        fallback={
          <BottleIllustration
            wine={wine}
            label={photo?.alt ?? `Fľaša vína ${wine.name}`}
            className="absolute inset-0 h-full w-full"
          />
        }
      />
    </ArchFrame>
  );
}
