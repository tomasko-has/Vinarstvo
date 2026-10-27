"use client";

// Posúvanie a približovanie SVG mapy: ťahanie, pinch na mobile, koliesko myši, klávesnica a tlačidlá.
// Pohľad sa mení priamo cez atribút viewBox (bez re-renderu Reactu), aby bol pohyb plynulý aj na slabom telefóne.
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import type { MapPoint } from "@/lib/schemas";
import { MAP_HEIGHT, MAP_WIDTH } from "./geometry";

type View = { cx: number; cy: number; s: number };

export type PanZoomHandle = {
  zoomBy: (factor: number) => void;
  reset: () => void;
  /** Presunie pohľad na bod. `offsetY` je posun v pixeloch (napr. kvôli bottom sheetu). */
  flyTo: (p: MapPoint, opts?: { scale?: number; offsetY?: number }) => void;
  /** Zobrazí bod, ak je mimo viditeľnej časti. */
  reveal: (p: MapPoint) => void;
  isNarrow: () => boolean;
};

const MIN_S = 0.32; // najväčšie priblíženie: jednotiek mapy na pixel
const DRAG_THRESHOLD = 6;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PanZoomMap({
  children,
  label,
  describedBy,
  className = "",
  ref,
}: {
  children: ReactNode;
  label: string;
  describedBy?: string;
  className?: string;
  ref?: Ref<PanZoomHandle>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const size = useRef({ w: 0, h: 0 });
  const view = useRef<View>({ cx: MAP_WIDTH / 2, cy: MAP_HEIGHT / 2, s: 1 });
  const initialized = useRef(false);
  // Cieľ, o ktorý niekto požiadal skôr, než poznáme veľkosť mapy (napr. ?pivnica= v URL)
  const pending = useRef<View | null>(null);
  const animation = useRef<number | null>(null);

  const fitScale = () => Math.max(MAP_WIDTH / size.current.w, MAP_HEIGHT / size.current.h);

  const clamp = useCallback((v: View): View => {
    const { w, h } = size.current;
    const s = Math.min(Math.max(v.s, MIN_S), fitScale());
    const vw = w * s;
    const vh = h * s;
    const cx = vw >= MAP_WIDTH ? MAP_WIDTH / 2 : Math.min(Math.max(v.cx, vw / 2), MAP_WIDTH - vw / 2);
    const cy = vh >= MAP_HEIGHT ? MAP_HEIGHT / 2 : Math.min(Math.max(v.cy, vh / 2), MAP_HEIGHT - vh / 2);
    return { cx, cy, s };
  }, []);

  const apply = useCallback(
    (next: View) => {
      const svg = svgRef.current;
      if (!svg) return;
      if (size.current.w === 0) {
        pending.current = next;
        return;
      }
      const v = clamp(next);
      view.current = v;
      const { w, h } = size.current;
      svg.setAttribute("viewBox", `${v.cx - (w * v.s) / 2} ${v.cy - (h * v.s) / 2} ${w * v.s} ${h * v.s}`);
      // Značky a popisky držia čitateľnú veľkosť aj pri oddialení
      svg.style.setProperty("--ui", String(Math.min(Math.max(v.s * 0.85, 0.6), 1.7)));
    },
    [clamp],
  );

  const initialView = useCallback((): View => {
    // Na úzkom displeji začíname pri vstupe do uličky, nie s celou mapou v miniatúre
    const s = Math.min(fitScale(), 1.75);
    return s < fitScale() ? { cx: 330, cy: 296, s } : { cx: MAP_WIDTH / 2, cy: MAP_HEIGHT / 2, s };
  }, []);

  const animateTo = useCallback(
    (target: View) => {
      if (animation.current) cancelAnimationFrame(animation.current);
      if (size.current.w === 0) {
        pending.current = target;
        return;
      }
      const from = view.current;
      const to = clamp(target);
      if (prefersReducedMotion()) return apply(to);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 320);
        const e = 1 - (1 - t) ** 3;
        apply({ cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e, s: from.s + (to.s - from.s) * e });
        animation.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      animation.current = requestAnimationFrame(step);
    },
    [apply, clamp],
  );

  /** Približovanie okolo bodu na obrazovke (px od ľavého horného rohu mapy). */
  const zoomAt = useCallback(
    (factor: number, px: number, py: number, base: View = view.current) => {
      const { w, h } = size.current;
      const mx = base.cx + (px - w / 2) * base.s;
      const my = base.cy + (py - h / 2) * base.s;
      const s = Math.min(Math.max(base.s / factor, MIN_S), fitScale());
      apply({ cx: mx - (px - w / 2) * s, cy: my - (py - h / 2) * s, s });
    },
    [apply],
  );

  useImperativeHandle(ref, () => ({
    zoomBy: (factor) => {
      const v = view.current;
      animateTo({ ...v, s: v.s / factor });
    },
    reset: () => animateTo(initialView()),
    flyTo: (p, opts = {}) => {
      const s = Math.min(opts.scale ?? view.current.s, view.current.s);
      animateTo({ cx: p.x, cy: p.y + (opts.offsetY ?? 0) * s, s });
    },
    reveal: (p) => {
      const { w, h } = size.current;
      const v = view.current;
      const margin = 48 * v.s;
      const inside =
        Math.abs(p.x - v.cx) < (w * v.s) / 2 - margin && Math.abs(p.y - v.cy) < (h * v.s) / 2 - margin;
      if (!inside) animateTo({ ...v, cx: p.x, cy: p.y });
    },
    isNarrow: () => size.current.w < 1024,
  }));

  // Veľkosť kontajnera
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      size.current = { w: width, h: height };
      if (!initialized.current) {
        initialized.current = true;
        apply(pending.current ?? initialView());
      } else {
        apply(view.current);
      }
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [apply, initialView]);

  // Koliesko myši (musí byť non-passive, aby sa nescrollovala stránka)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(-delta * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // Ťahanie a pinch cez Pointer Events
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: 0, dragging: false, suppressClick: false });

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (animation.current) cancelAnimationFrame(animation.current);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) gesture.current = { moved: 0, dragging: false, suppressClick: false };
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const all = [...pointers.current.entries()];

    if (all.length === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      gesture.current.moved += Math.abs(dx) + Math.abs(dy);
      if (!gesture.current.dragging && gesture.current.moved > DRAG_THRESHOLD) {
        gesture.current.dragging = true;
        svg.setPointerCapture(e.pointerId);
      }
      if (gesture.current.dragging) {
        const v = view.current;
        apply({ ...v, cx: v.cx - dx * v.s, cy: v.cy - dy * v.s });
      }
    } else if (all.length === 2) {
      const other = all.find(([id]) => id !== e.pointerId)![1];
      const before = Math.hypot(prev.x - other.x, prev.y - other.y);
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      const midBefore = { x: (prev.x + other.x) / 2 - rect.left, y: (prev.y + other.y) / 2 - rect.top };
      const midAfter = { x: (e.clientX + other.x) / 2 - rect.left, y: (e.clientY + other.y) / 2 - rect.top };
      if (!gesture.current.dragging) {
        gesture.current.dragging = true;
        for (const [id] of all) svg.setPointerCapture(id);
      }
      const v = view.current;
      const panned = { ...v, cx: v.cx - (midAfter.x - midBefore.x) * v.s, cy: v.cy - (midAfter.y - midBefore.y) * v.s };
      if (before > 0) zoomAt(after / before, midAfter.x, midAfter.y, panned);
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const onPointerEnd = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (gesture.current.dragging) gesture.current.suppressClick = true;
    if (pointers.current.size === 0) gesture.current.dragging = false;
  };

  // Po ťahaní nechceme, aby sa „klikla“ pivnica, na ktorej prst skončil
  const onClickCapture = (e: React.MouseEvent) => {
    if (gesture.current.suppressClick) {
      e.preventDefault();
      e.stopPropagation();
      gesture.current.suppressClick = false;
    }
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const v = view.current;
    const step = 80 * v.s;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => animateTo({ ...v, cx: v.cx - step }),
      ArrowRight: () => animateTo({ ...v, cx: v.cx + step }),
      ArrowUp: () => animateTo({ ...v, cy: v.cy - step }),
      ArrowDown: () => animateTo({ ...v, cy: v.cy + step }),
      "+": () => animateTo({ ...v, s: v.s / 1.4 }),
      "=": () => animateTo({ ...v, s: v.s / 1.4 }),
      "-": () => animateTo({ ...v, s: v.s * 1.4 }),
      "0": () => animateTo(initialView()),
    };
    const move = moves[e.key];
    if (move && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      move();
    }
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className={`block h-full w-full touch-none select-none ${className}`}
      role="group"
      aria-roledescription="mapa"
      aria-label={label}
      aria-describedby={describedBy}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
    >
      {children}
    </svg>
  );
}
