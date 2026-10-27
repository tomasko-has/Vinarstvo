"use client";

import { useEffect, useState } from "react";
import { isGuideCached } from "@/lib/offline/guide";

/** Povie, či je sprievodca uložený v zariadení. */
export function GuideStatus() {
  const [cached, setCached] = useState<boolean | null>(null);
  useEffect(() => {
    isGuideCached().then(setCached);
  }, []);
  if (cached === null) return null;
  return (
    <p className="mt-4 font-bold text-pivnica">
      {cached
        ? "Sprievodca je uložený v tomto zariadení, mapa aj audio fungujú."
        : "Sprievodca zatiaľ nie je uložený. Stiahnite ho na stránke Sprievodca, keď budete na signáli."}
    </p>
  );
}
