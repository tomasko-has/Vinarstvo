"use client";

// „Stiahnuť sprievodcu offline“. Samotné ukladanie rieši offline vrstva (lib/offline/guide.ts, session D).
import { useEffect, useState } from "react";
import { MapIcon } from "@/components/map/icons";
import { cacheGuide, clearGuideCache, isGuideCached, type GuideCacheProgress } from "@/lib/offline/guide";

type State =
  | { kind: "checking" }
  | { kind: "idle" }
  | { kind: "downloading"; progress: GuideCacheProgress }
  | { kind: "done"; bytes: number | null }
  | { kind: "error" };

const formatMb = (bytes: number) =>
  `${(bytes / 1024 / 1024).toLocaleString("sk-SK", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;

export function GuideDownload({ stopCount }: { stopCount: number }) {
  const [state, setState] = useState<State>({ kind: "checking" });

  useEffect(() => {
    let active = true;
    isGuideCached()
      .then((cached) => active && setState(cached ? { kind: "done", bytes: null } : { kind: "idle" }))
      .catch(() => active && setState({ kind: "idle" }));
    return () => {
      active = false;
    };
  }, []);

  async function download() {
    setState({ kind: "downloading", progress: { done: 0, total: 0, bytes: 0 } });
    let last: GuideCacheProgress = { done: 0, total: 0, bytes: 0 };
    try {
      await cacheGuide((p) => {
        last = p;
        setState({ kind: "downloading", progress: p });
      });
      setState({ kind: "done", bytes: last.bytes || null });
    } catch {
      setState({ kind: "error" });
    }
  }

  async function remove() {
    await clearGuideCache().catch(() => {});
    setState({ kind: "idle" });
  }

  const progress = state.kind === "downloading" ? state.progress : null;
  const percent = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="rounded-(--radius-panel) border-2 border-vapno/25 p-5" aria-live="polite">
      {state.kind === "done" ? (
        <>
          <p className="flex items-center gap-2 text-lg font-bold">
            <MapIcon name="check" className="text-spras" />
            Sprievodca je v telefóne
          </p>
          <p className="mt-1 text-sm text-vapno/80">
            Mapa, prepisy aj nahrávky fungujú aj v pivnici bez signálu
            {state.bytes ? `. Zaberá ${formatMb(state.bytes)}.` : "."}
          </p>
          <button type="button" onClick={remove} className="mt-3 min-h-11 text-sm font-bold text-spras underline underline-offset-4">
            Odstrániť z telefónu
          </button>
        </>
      ) : (
        <>
          <p className="text-lg font-bold">V pivniciach často nie je signál</p>
          <p className="mt-1 text-sm text-vapno/80">
            Stiahnite si sprievodcu vopred, kým ste na Wi-Fi alebo vonku. Uloží sa mapa, profily pivníc, prepisy a{" "}
            {stopCount} nahrávok.
          </p>

          {progress ? (
            <div className="mt-4">
              <div
                role="progressbar"
                aria-label="Sťahovanie sprievodcu"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="h-3 overflow-hidden rounded-full bg-vapno/15"
              >
                <div className="h-full rounded-full bg-spras transition-[width]" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-sm tabular-nums text-vapno/80">
                {progress.total > 0 ? `${progress.done} z ${progress.total} súborov, ${formatMb(progress.bytes)}` : "Pripravujeme zoznam súborov…"}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={download}
              disabled={state.kind === "checking"}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-(--radius-ui) bg-spras px-5 py-2.5 font-bold text-pivnica hover:bg-spras-svetla disabled:opacity-60"
            >
              <MapIcon name="download" />
              Stiahnuť sprievodcu offline
            </button>
          )}
          {state.kind === "error" && (
            <p className="mt-3 text-sm font-bold text-spras-svetla" role="alert">
              Sťahovanie sa prerušilo. Skúste to znova, keď budete mať lepší signál.
            </p>
          )}
        </>
      )}
    </div>
  );
}
