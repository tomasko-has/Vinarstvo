"use client";

// Audio sprievodca: trasa na mape, zoznam zastávok s prepismi a prehrávač pripnutý dole.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { smoothPath } from "@/components/map/geometry";
import { CellarFacade, StopBadge } from "@/components/map/glyphs";
import { useGeolocation } from "@/components/map/hooks";
import { MapIcon } from "@/components/map/icons";
import styles from "@/components/map/map.module.css";
import { Container } from "@/components/ui/Container";
import { distanceMeters } from "@/lib/geo/distance";
import type { GuideStop, MapPoint } from "@/lib/schemas";
import { formatRate, formatTime, RATES, spokenTime } from "./time";

/** Polomer, v ktorom ponúkneme spustiť zastávku podľa polohy. */
const NEARBY_METERS = 25;

export function GuideExperience({
  stops,
  cellars,
  artwork,
}: {
  stops: GuideStop[];
  /** Pivnice na orientáciu v mape trasy */
  cellars: { point: MapPoint; ours: boolean }[];
  artwork: ReactNode;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const playAfterLoad = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState<number>(1);
  const [missing, setMissing] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const geo = useGeolocation();

  const stop = stops[index];
  const total = duration || stop.durationSec;

  function goTo(i: number, autoplay: boolean) {
    if (i < 0 || i >= stops.length) return;
    if (i === index) {
      if (autoplay) audio.current?.play().catch(() => {});
      return;
    }
    playAfterLoad.current = autoplay;
    setIndex(i);
    setTime(0);
    setDuration(0);
    setMissing(false);
    setPlaying(false);
  }

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }

  function seek(seconds: number) {
    const el = audio.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(seconds, 0), el.duration || total);
    setTime(el.currentTime);
  }

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate as (typeof RATES)[number]) + 1) % RATES.length];
    setRate(next);
    if (audio.current) {
      audio.current.playbackRate = next;
      audio.current.defaultPlaybackRate = next;
    }
  }

  // Nová zastávka: načítať nahrávku a prípadne hneď spustiť
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    el.load();
    el.playbackRate = el.defaultPlaybackRate;
    if (playAfterLoad.current) {
      playAfterLoad.current = false;
      el.play().catch(() => {});
    }
  }, [index]);

  // Media Session: ovládanie zo zamknutej obrazovky a slúchadiel
  const actions = useRef({ toggle, goTo, seek, index, time });
  useEffect(() => {
    actions.current = { toggle, goTo, seek, index, time };
  });

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({
      title: `${stop.order}. ${stop.title}`,
      artist: "Sprievodca Sprašovou uličkou",
      album: "Vinárstvo Na Spraši",
      artwork: [{ src: "/images/placeholder/pivnica.svg", sizes: "any", type: "image/svg+xml" }],
    });
  }, [stop]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => audio.current?.play().catch(() => {})],
      ["pause", () => audio.current?.pause()],
      ["previoustrack", () => actions.current.goTo(actions.current.index - 1, true)],
      ["nexttrack", () => actions.current.goTo(actions.current.index + 1, true)],
      ["seekbackward", (d) => actions.current.seek(actions.current.time - (d.seekOffset ?? 15))],
      ["seekforward", (d) => actions.current.seek(actions.current.time + (d.seekOffset ?? 15))],
      ["seekto", (d) => d.seekTime !== undefined && actions.current.seek(d.seekTime)],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // prehliadač akciu nepodporuje
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {}
      }
    };
  }, []);

  const syncPosition = () => {
    const el = audio.current;
    if (!el || !("mediaSession" in navigator) || !Number.isFinite(el.duration)) return;
    try {
      navigator.mediaSession.setPositionState({ duration: el.duration, playbackRate: el.playbackRate, position: el.currentTime });
    } catch {}
  };

  // Ponuka zastávky podľa polohy (nič sa nespúšťa samo)
  const nearby = geo.position
    ? stops
        .map((s, i) => ({ s, i, d: distanceMeters(geo.position!.gps, s.gps) }))
        .filter(({ d, i, s }) => d < NEARBY_METERS && i !== index && !dismissed.has(s.id))
        .sort((a, b) => a.d - b.d)[0]
    : undefined;

  const routePath = smoothPath(stops.map((s) => [s.mapPoint.x, s.mapPoint.y]));
  const totalMinutes = Math.round(stops.reduce((sum, s) => sum + s.durationSec, 0) / 60);

  // Na mobile sa trasa posúva vodorovne; aktuálnu zastávku držíme v strede
  const routeScroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = routeScroller.current;
    if (!box || box.scrollWidth <= box.clientWidth) return;
    const x = (stop.mapPoint.x / 1000) * box.scrollWidth;
    box.scrollTo({ left: x - box.clientWidth / 2, behavior: "smooth" });
  }, [stop]);

  return (
    <>
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-8 py-8 pb-48 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 lg:pb-32">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="sr-only">Trasa</h2>
          <div ref={routeScroller} className={`${styles.paper} overflow-x-auto rounded-(--radius-panel) border-2 border-spras-tmava/30`}>
            <svg viewBox="0 60 1000 340" className="block h-auto w-full min-w-[46rem] lg:min-w-0" role="img" aria-label={`Trasa sprievodcu uličkou s ${stops.length} zastávkami`}>
              {artwork}
              <g opacity="0.6" aria-hidden="true">
                {cellars.map(({ point, ours }) => (
                  <g key={`${point.x}-${point.y}`} transform={`translate(${point.x} ${point.y}) scale(0.9)`}>
                    <CellarFacade ours={ours} />
                  </g>
                ))}
              </g>
              <path d={routePath} fill="none" stroke="var(--color-frankovka)" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
              {stops.map((s, i) => (
                <g
                  key={s.id}
                  transform={`translate(${s.mapPoint.x} ${s.mapPoint.y}) scale(1.7)`}
                  onClick={() => goTo(i, false)}
                  className="cursor-pointer"
                >
                  <StopBadge order={s.order} active={i === index} />
                </g>
              ))}
            </svg>
          </div>
          <p className="mt-2 text-sm text-pivnica-makka">
            {stops.length} zastávok, spolu asi {totalMinutes} minút počúvania. Trasa ide od vstupu po koniec uličky, so zachádzkou na
            vyhliadku.
          </p>

          <div className="mt-4">
            {geo.status === "active" || geo.status === "locating" ? (
              <button type="button" onClick={geo.stop} className="min-h-11 text-sm font-bold text-frankovka underline underline-offset-4">
                Prestať sledovať polohu
              </button>
            ) : (
              <button type="button" onClick={geo.start} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-frankovka underline underline-offset-4">
                <MapIcon name="locate" className="size-5" />
                Ponúkať zastávky podľa polohy
              </button>
            )}
            <p className="text-sm text-pivnica-makka" role="status">
              {geo.status === "locating" && "Hľadáme vašu polohu…"}
              {geo.status === "denied" && "Polohu ste nepovolili. Zastávky si vyberajte v zozname."}
              {(geo.status === "unavailable" || geo.status === "error") && "Polohu sa nepodarilo zistiť. Zastávky si vyberajte v zozname."}
              {geo.status === "active" && !nearby && "Keď prídete k zastávke, ponúkneme vám ju."}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl">Zastávky</h2>
          <ol className="mt-4 space-y-2">
            {stops.map((s, i) => {
              const current = i === index;
              return (
                <li
                  key={s.id}
                  id={`zastavka-${s.order}`}
                  aria-current={current ? "step" : undefined}
                  className={`rounded-(--radius-panel) px-4 py-4 ${current ? "bg-spras-svetla/60 ring-2 ring-spras-tmava/40" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className={`text-3xl leading-none font-bold tabular-nums ${current ? "text-frankovka" : "text-spras-tmava"}`}
                    >
                      {s.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg leading-snug">
                        <span className="sr-only">Zastávka {s.order}: </span>
                        {s.title}
                      </h3>
                      <p className="text-sm text-pivnica-makka">
                        <span aria-hidden="true">{formatTime(s.durationSec)}</span>
                        <span className="sr-only">{spokenTime(s.durationSec)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => (current ? toggle() : goTo(i, true))}
                      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold ${
                        current && playing ? "bg-frankovka text-vapno" : "bg-vapno text-pivnica ring-2 ring-pivnica"
                      }`}
                    >
                      <MapIcon name={current && playing ? "pause" : "play"} className="size-4" />
                      {current && playing ? "Pauza" : "Prehrať"}
                      <span className="sr-only"> zastávku {s.order}</span>
                    </button>
                  </div>
                  {current ? (
                    <div className="mt-3 pl-11">
                      <h4 className="sr-only">Prepis</h4>
                      <p className="text-base">{s.transcript}</p>
                    </div>
                  ) : (
                    <details className="group mt-1 pl-11">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 text-sm font-bold text-pivnica-makka">
                        Prepis
                        <MapIcon name="plus" className="size-4 transition-transform group-open:rotate-45" />
                      </summary>
                      <p className="pb-1 text-base">{s.transcript}</p>
                    </details>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Container>

      {/* prehrávač */}
      <section
        aria-label="Prehrávač sprievodcu"
        className="fixed inset-x-0 bottom-(--spacing-tabbar) z-30 border-t-4 border-spras bg-pivnica text-vapno lg:bottom-0"
      >
        {nearby && (
          <div className="border-b border-vapno/15 bg-frankovka" role="status">
            <Container className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
              <p className="flex-1">
                Ste pri zastávke {nearby.s.order}: <strong>{nearby.s.title}</strong>. Spustiť ju?
              </p>
              <button type="button" onClick={() => goTo(nearby.i, true)} className="min-h-11 rounded-(--radius-ui) bg-vapno px-3 font-bold text-frankovka">
                Spustiť zastávku {nearby.s.order}
              </button>
              <button
                type="button"
                onClick={() => setDismissed((d) => new Set(d).add(nearby.s.id))}
                className="min-h-11 px-2 font-bold underline underline-offset-4"
              >
                Teraz nie
              </button>
            </Container>
          </div>
        )}
        <Container className="flex flex-col gap-2 py-3 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex items-center gap-3 lg:w-[24rem] lg:shrink-0">
            <button
              type="button"
              onClick={toggle}
              className="grid size-14 shrink-0 place-items-center rounded-full bg-spras text-pivnica hover:bg-spras-svetla"
            >
              <MapIcon name={playing ? "pause" : "play"} className="size-6" />
              <span className="sr-only">{playing ? "Pozastaviť" : "Prehrať"}</span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-vapno/75">
                Zastávka {stop.order} z {stops.length}
              </p>
              <p className="truncate font-display text-lg font-bold">{stop.title}</p>
            </div>
            <button
              type="button"
              onClick={cycleRate}
              className="min-h-11 min-w-14 shrink-0 rounded-(--radius-ui) border-2 border-vapno/30 px-2 font-bold tabular-nums hover:border-vapno"
            >
              {formatRate(rate)}
              <span className="sr-only"> rýchlosť prehrávania, zmeniť</span>
            </button>
          </div>

          <div className="flex items-center gap-1 lg:flex-1 lg:gap-3">
            <button
              type="button"
              onClick={() => goTo(index - 1, playing)}
              disabled={index === 0}
              className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-vapno/10 disabled:opacity-35"
            >
              <MapIcon name="prev" className="size-5" />
              <span className="sr-only">Predchádzajúca zastávka</span>
            </button>
            <span className="w-10 shrink-0 text-right text-sm tabular-nums" aria-hidden="true">
              {formatTime(time)}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(total, 1)}
              step={1}
              value={Math.min(time, total)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Posun v nahrávke"
              aria-valuetext={`${spokenTime(time)} z ${spokenTime(total)}`}
              className="h-11 min-w-0 flex-1 cursor-pointer accent-spras"
            />
            <span className="w-10 shrink-0 text-sm tabular-nums text-vapno/75" aria-hidden="true">
              {formatTime(total)}
            </span>
            <button
              type="button"
              onClick={() => goTo(index + 1, playing)}
              disabled={index === stops.length - 1}
              className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-vapno/10 disabled:opacity-35"
            >
              <MapIcon name="next" className="size-5" />
              <span className="sr-only">Ďalšia zastávka</span>
            </button>
          </div>
        </Container>
        {missing && (
          <p className="border-t border-vapno/15 bg-pivnica-makka/40 py-2 text-center text-sm" role="alert">
            Nahrávka tejto zastávky zatiaľ chýba. Prepis nájdete v zozname zastávok.
          </p>
        )}
        <audio
          ref={audio}
          src={stop.audioUrl}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0);
            setMissing(false);
            syncPosition();
          }}
          onRateChange={syncPosition}
          onSeeked={syncPosition}
          onError={() => {
            setMissing(true);
            setPlaying(false);
          }}
        />
      </section>
    </>
  );
}
