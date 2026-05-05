import { useCallback, useRef, useState } from "react";

export interface TempPoint {
  t: number;
  label: string;
  value: number;
}

const MAX_POINTS = 60;

const fmt = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

// Hook agora é passivo: recebe dados via pushReading() em vez de simular
export const useTemperatureSimulator = (_opts?: { enabled?: boolean; powerPct?: number }) => {
  const [points, setPoints] = useState<TempPoint[]>(() => {
    // Seed inicial com traço flat em 25°C para o gráfico não ficar vazio
    const now = Date.now();
    const seed: TempPoint[] = [];
    for (let i = MAX_POINTS - 1; i >= 0; i--) {
      const d = new Date(now - i * 1000);
      seed.push({ t: d.getTime(), label: fmt(d), value: 25 });
    }
    return seed;
  });

  const [samples, setSamples] = useState(0);

  // Função que o App chama sempre que chega uma leitura real do Arduino
  const pushReading = useCallback((value: number) => {
    const d = new Date();
    setPoints(prev => {
      const arr = [...prev, { t: d.getTime(), label: fmt(d), value }];
      return arr.length > MAX_POINTS ? arr.slice(arr.length - MAX_POINTS) : arr;
    });
    setSamples(s => s + 1);
  }, []);

  const current = points[points.length - 1]?.value ?? 25;
  return { points, current, samples, pushReading };
};
