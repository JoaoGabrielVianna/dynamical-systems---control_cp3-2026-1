import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TempPoint } from "@/hooks/useTemperatureSimulator";
import { motion } from "framer-motion";
import {
  Thermometer,
  TrendingUp,
  TrendingDown,
  Minus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Radio,
  Pause,
} from "lucide-react";

interface Props {
  data: TempPoint[];
  current: number;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 shadow-elegant">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="font-mono-tech text-base font-semibold text-foreground">{payload[0].value.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">°C</span>
      </div>
    </div>
  );
};

const MIN_WINDOW = 10;
const DEFAULT_WINDOW = 60;

export const TemperatureChart = ({ data, current }: Props) => {
  const prev = data[data.length - 2]?.value ?? current;
  const delta = current - prev;
  const TrendIcon = delta > 0.05 ? TrendingUp : delta < -0.05 ? TrendingDown : Minus;
  const trendColor = delta > 0.05 ? "text-warning" : delta < -0.05 ? "text-info" : "text-muted-foreground";

  const [follow, setFollow] = useState(true);
  const [windowSize, setWindowSize] = useState(DEFAULT_WINDOW);
  const [endIdx, setEndIdx] = useState(data.length - 1);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (follow) setEndIdx(data.length - 1);
  }, [data.length, follow]);

  const total = data.length;
  const safeWindow = Math.min(windowSize, total);
  const safeEnd = Math.min(Math.max(endIdx, safeWindow - 1), total - 1);
  const startIdx = Math.max(0, safeEnd - safeWindow + 1);

  const visible = useMemo(() => data.slice(startIdx, safeEnd + 1), [data, startIdx, safeEnd]);

  const setZoom = useCallback(
    (next: number) => {
      const clamped = Math.max(MIN_WINDOW, Math.min(total, Math.round(next)));
      setWindowSize(clamped);
    },
    [total],
  );

  const zoomIn = () => setZoom(safeWindow * 0.5);
  const zoomOut = () => setZoom(safeWindow * 2);
  const reset = () => {
    setWindowSize(DEFAULT_WINDOW);
    setFollow(true);
    setEndIdx(total - 1);
  };

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.2 : 1 / 1.2;
      setZoom(safeWindow * factor);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [safeWindow, setZoom]);

  const onBrushChange = useCallback(
    (range?: { startIndex?: number; endIndex?: number }) => {
      if (!range || range.startIndex == null || range.endIndex == null) return;
      const newWindow = range.endIndex - range.startIndex + 1;
      setWindowSize(Math.max(MIN_WINDOW, newWindow));
      setEndIdx(range.endIndex);
      setFollow(range.endIndex >= total - 1);
    },
    [total],
  );

  return (
    <Card className="border bg-card">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Thermometer className="h-3.5 w-3.5" />
              Temperatura
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <motion.span
                key={Math.floor(current * 10)}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="font-mono-tech text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
              >
                {current.toFixed(2)}
              </motion.span>
              <span className="text-lg text-muted-foreground">°C</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="h-3.5 w-3.5" />
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={zoomOut} aria-label="Reduzir zoom" className="h-8 w-8">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={zoomIn} aria-label="Aumentar zoom" className="h-8 w-8">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={reset} aria-label="Resetar" className="h-8 w-8">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant={follow ? "default" : "outline"}
                size="sm"
                onClick={() => setFollow((f) => !f)}
                className="h-8 gap-1.5"
              >
                {follow ? <Radio className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {follow ? "Ao vivo" : "Pausado"}
              </Button>
            </div>
            <span className="font-mono-tech text-[11px] text-muted-foreground">
              janela {safeWindow}s · roda do mouse: zoom · brush: pan
            </span>
          </div>
        </div>

        <div ref={wheelRef} className="h-[340px] w-full select-none lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visible} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "ui-monospace" }}
                stroke="hsl(var(--border))"
                interval="preserveStartEnd"
                minTickGap={48}
              />
              <YAxis
                domain={[10, 70]}
                ticks={[10, 20, 30, 40, 50, 60, 70]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "ui-monospace" }}
                stroke="hsl(var(--border))"
                width={42}
              />
              <ReferenceLine y={40} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.45} />
              <ReferenceLine y={20} stroke="hsl(var(--info))" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "hsl(var(--foreground))", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.4 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-line))"
                strokeWidth={2}
                fill="url(#tempFill)"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--chart-line))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[56px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 12, left: -12, bottom: 4 }}>
              <defs>
                <linearGradient id="brushFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-line))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--chart-line))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <YAxis domain={[10, 70]} hide />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-line))"
                strokeWidth={1}
                fill="url(#brushFill)"
                isAnimationActive={false}
                dot={false}
              />
              <Brush
                dataKey="label"
                height={24}
                stroke="hsl(var(--border))"
                fill="hsl(var(--muted))"
                travellerWidth={8}
                startIndex={startIdx}
                endIndex={safeEnd}
                onChange={onBrushChange}
                tickFormatter={() => ""}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
