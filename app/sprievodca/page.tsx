import type { Metadata } from "next";
import { GuideDownload } from "@/components/guide/GuideDownload";
import { GuideExperience } from "@/components/guide/GuideExperience";
import { mapGeometry } from "@/components/map/data";
import { MapArtwork } from "@/components/map/MapArtwork";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getCellars, getGuideStops, getMapAnchors, getMapPois } from "@/lib/content";

export const metadata: Metadata = {
  title: "Audio sprievodca",
  description:
    "Prejdite sa Sprašovou uličkou so sprievodcom v telefóne. Osem zastávok o spraši, kopaní pivníc a víne, s prepisom a možnosťou stiahnuť offline.",
};

export default async function Page() {
  const [stops, cellars, anchors, pois] = await Promise.all([getGuideStops(), getCellars(), getMapAnchors(), getMapPois()]);
  const { unitsPer100m, northAngle } = mapGeometry(anchors, pois);

  return (
    <>
      <div className="bg-pivnica text-vapno">
        <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-12 lg:py-14">
          <div>
            <h1 className="text-3xl text-vapno lg:text-4xl">Sprievodca uličkou do ucha</h1>
            <p className="mt-4 max-w-(--container-text) text-lg text-vapno/85">
              Nasaďte si slúchadlá a choďte pomaly. Pri každej zastávke vám povieme, na čo sa pozeráte, kto tu kopal a prečo je v
              pivnici aj v auguste zima.
            </p>
            <ButtonLink href="/mapa" variant="quiet" className="mt-2 text-spras decoration-spras/50 hover:decoration-spras">
              Mapa so všetkými pivnicami
            </ButtonLink>
          </div>
          <GuideDownload stopCount={stops.length} />
        </Container>
      </div>
      <GuideExperience
        stops={stops}
        cellars={cellars.map((c) => ({ point: c.mapPoint, ours: c.isOurs }))}
        artwork={<MapArtwork cellars={cellars.map((c) => c.mapPoint)} unitsPer100m={unitsPer100m} northAngle={northAngle} />}
      />
    </>
  );
}
