import { useCallback, useState } from "react";

export interface TempPoint {
  t: number;
  label: string;
  value: number;
  power: number;
}

const MAX_POINTS = 600;

const fmt = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

export const useTemperatureSimulator = (_opts?: { enabled?: boolean; powerPct?: number }) => {
  const [points, setPoints] = useState<TempPoint[]>(() => {
    const now = Date.now();
    const seed: TempPoint[] = [];
    for (let i = MAX_POINTS - 1; i >= 0; i--) {
      const d = new Date(now - i * 1000);
      seed.push({ t: d.getTime(), label: fmt(d), value: 25, power: 0 });
    }
    return seed;
  });

  const [samples, setSamples] = useState(0);

  const pushReading = useCallback((value: number, power: number) => {
    const d = new Date();
    setPoints((prev) => {
      const arr = [...prev, { t: d.getTime(), label: fmt(d), value, power }];
      return arr.length > MAX_POINTS ? arr.slice(arr.length - MAX_POINTS) : arr;
    });
    setSamples((s) => s + 1);
  }, []);

  const reset = useCallback(() => {
    const now = Date.now();
    const seed: TempPoint[] = [];
    for (let i = MAX_POINTS - 1; i >= 0; i--) {
      const d = new Date(now - i * 1000);
      seed.push({ t: d.getTime(), label: fmt(d), value: 25, power: 0 });
    }
    setPoints(seed);
    setSamples(0);
  }, []);

  const current = points[points.length - 1]?.value ?? 25;
  return { points, current, samples, pushReading, reset };
};
