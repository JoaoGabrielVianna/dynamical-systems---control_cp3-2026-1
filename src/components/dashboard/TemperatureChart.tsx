import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Card } from "@/components/ui/card";
import { TempPoint } from "@/hooks/useTemperatureSimulator";
import { motion } from "framer-motion";
import { Thermometer, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  data: TempPoint[];
  current: number;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-elegant backdrop-blur">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-mono-tech text-lg font-bold text-foreground">{payload[0].value.toFixed(2)}</span>
        <span className="text-xs font-medium text-muted-foreground">°C</span>
      </div>
    </div>
  );
};

export const TemperatureChart = ({ data, current }: Props) => {
  const prev = data[data.length - 2]?.value ?? current;
  const delta = current - prev;
  const TrendIcon = delta > 0.05 ? TrendingUp : delta < -0.05 ? TrendingDown : Minus;
  const trendColor = delta > 0.05 ? "text-warning" : delta < -0.05 ? "text-info" : "text-muted-foreground";

  return (
    <Card className="relative overflow-hidden border-border/60 bg-gradient-surface shadow-elegant">
      <div className="absolute inset-0 bg-gradient-glow opacity-60 pointer-events-none" />
      <div className="relative flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Thermometer className="h-3.5 w-3.5" />
              Temperatura em Tempo Real
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <motion.span
                key={Math.floor(current * 10)}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mono-tech text-5xl font-bold tracking-tight text-foreground lg:text-6xl"
              >
                {current.toFixed(2)}
              </motion.span>
              <span className="text-2xl font-semibold text-muted-foreground">°C</span>
              <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="h-3.5 w-3.5" />
                {delta >= 0 ? "+" : ""}{delta.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Janela</span>
            <span className="font-mono-tech text-sm font-semibold">últimos 60s</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">10°C — 70°C</span>
          </div>
        </div>

        <div className="h-[360px] w-full lg:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-line))" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(var(--chart-line))" stopOpacity={0} />
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
                width={48}
                label={{ value: "°C", angle: 0, position: "insideTopLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <ReferenceLine y={40} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={20} stroke="hsl(var(--info))" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-line))"
                strokeWidth={2.5}
                fill="url(#tempFill)"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 5, fill: "hsl(var(--chart-line))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
