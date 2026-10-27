/** 95 → „1:35“ */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** 95 → „1 minúta 35 sekúnd“ pre čítačky obrazovky */
export function spokenTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const minutes = m === 1 ? "1 minúta" : m >= 2 && m <= 4 ? `${m} minúty` : `${m} minút`;
  const secs = r === 1 ? "1 sekunda" : r >= 2 && r <= 4 ? `${r} sekundy` : `${r} sekúnd`;
  if (m === 0) return secs;
  return r === 0 ? minutes : `${minutes} ${secs}`;
}

export const RATES = [0.75, 1, 1.25, 1.5] as const;

export const formatRate = (rate: number) => `${rate.toLocaleString("sk-SK")}×`;
