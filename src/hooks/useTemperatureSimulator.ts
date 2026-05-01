import { useEffect, useRef, useState } from "react";

export interface TempPoint {
  t: number;
  label: string;
  value: number;
}

const MAX_POINTS = 60;
const MIN_T = 20;
const MAX_T = 40;

const fmt = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

export const useTemperatureSimulator = (opts: { enabled: boolean; powerPct: number }) => {
  const { enabled, powerPct } = opts;
  const [points, setPoints] = useState<TempPoint[]>(() => {
    const now = Date.now();
    const seed: TempPoint[] = [];
    for (let i = MAX_POINTS - 1; i >= 0; i--) {
      const d = new Date(now - i * 1000);
      seed.push({ t: d.getTime(), label: fmt(d), value: 25 + Math.sin(i / 6) * 1.5 });
    }
    return seed;
  });
  const [samples, setSamples] = useState(0);
  const lastValueRef = useRef(25);
  const powerRef = useRef(powerPct);
  powerRef.current = powerPct;

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      const target = MIN_T + (powerRef.current / 100) * (MAX_T - MIN_T);
      const drift = (target - lastValueRef.current) * 0.08;
      const noise = (Math.random() - 0.5) * 0.6;
      let next = lastValueRef.current + drift + noise;
      next = Math.max(MIN_T - 1, Math.min(MAX_T + 2, next));
      lastValueRef.current = next;

      const d = new Date();
      setPoints(prev => {
        const arr = [...prev, { t: d.getTime(), label: fmt(d), value: +next.toFixed(2) }];
        return arr.length > MAX_POINTS ? arr.slice(arr.length - MAX_POINTS) : arr;
      });
      setSamples(s => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [enabled]);

  const current = points[points.length - 1]?.value ?? 25;
  return { points, current, samples };
};
