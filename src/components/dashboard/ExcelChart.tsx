import { useCallback, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, X } from "lucide-react";

interface Row {
  x: string | number;
  temperature: number;
  power: number;
}

interface ParsedFile {
  name: string;
  rows: Row[];
}

const norm = (s: string) =>
  s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const findKey = (keys: string[], candidates: string[]) =>
  keys.find((k) => candidates.some((c) => norm(k).includes(c)));

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 shadow-elegant">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="mt-0.5 flex items-baseline gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="font-mono-tech text-sm font-semibold text-foreground">
            {Number(p.value).toFixed(2)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {p.dataKey === "temperature" ? "°C" : "%"}
          </span>
        </div>
      ))}
    </div>
  );
};

export const ExcelChart = () => {
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });
      if (!json.length) {
        setError("Planilha vazia.");
        return;
      }

      const keys = Object.keys(json[0]);
      const tempKey = findKey(keys, ["temp"]);
      const powerKey = findKey(keys, ["pot", "power", "duty"]);
      const xKey =
        findKey(keys, ["tempo", "time", "t", "amostra", "sample", "indice", "index"]) ?? keys[0];

      if (!tempKey || !powerKey) {
        setError(
          `Não achei as colunas necessárias. Esperado: uma coluna com "temperatura" e outra com "potência" (ou "power"). Colunas encontradas: ${keys.join(", ")}`,
        );
        return;
      }

      const rows: Row[] = json
        .map((r, i) => ({
          x: r[xKey] ?? i,
          temperature: Number(r[tempKey]),
          power: Number(r[powerKey]),
        }))
        .filter((r) => !isNaN(r.temperature) && !isNaN(r.power));

      if (!rows.length) {
        setError("Nenhuma linha com valores numéricos válidos.");
        return;
      }

      setFile({ name: f.name, rows });
    } catch (e: any) {
      setError(`Falha ao ler o arquivo: ${e?.message ?? e}`);
    }
  }, []);

  const onPick = () => inputRef.current?.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const stats = useMemo(() => {
    if (!file) return null;
    const temps = file.rows.map((r) => r.temperature);
    const powers = file.rows.map((r) => r.power);
    return {
      n: file.rows.length,
      tMin: Math.min(...temps),
      tMax: Math.max(...temps),
      pMin: Math.min(...powers),
      pMax: Math.max(...powers),
    };
  }, [file]);

  return (
    <Card className="border bg-card">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Análise de Excel
            </div>
            <h2 className="mt-1 text-base font-semibold">
              {file ? file.name : "Importe uma planilha"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Esperado: colunas <span className="font-mono-tech">temperatura</span> (°C) e{" "}
              <span className="font-mono-tech">potência</span> (%).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={onChange}
            />
            <Button variant="outline" size="sm" onClick={onPick} className="gap-2">
              <Upload className="h-4 w-4" />
              {file ? "Trocar arquivo" : "Importar"}
            </Button>
            {file && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
                aria-label="Remover"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!file && (
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={onPick}
            className="flex h-[340px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/30 text-center transition-colors hover:bg-muted/60 lg:h-[400px]"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Arraste um arquivo aqui ou clique para escolher</p>
            <p className="text-[11px] text-muted-foreground">.xlsx · .xls · .csv</p>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {file && stats && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Linhas
                </div>
                <div className="font-mono-tech text-lg font-semibold">{stats.n}</div>
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-warning">
                  Temp · faixa
                </div>
                <div className="font-mono-tech text-lg font-semibold">
                  {stats.tMin.toFixed(1)}–{stats.tMax.toFixed(1)}°C
                </div>
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-info">
                  Potência · faixa
                </div>
                <div className="font-mono-tech text-lg font-semibold">
                  {stats.pMin.toFixed(0)}–{stats.pMax.toFixed(0)}%
                </div>
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Eixo X
                </div>
                <div className="font-mono-tech text-lg font-semibold">
                  {String(file.rows[0].x).slice(0, 8)}…
                </div>
              </div>
            </div>

            <div className="h-[380px] w-full lg:h-[460px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={file.rows} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 4" vertical={false} />
                  <XAxis
                    dataKey="x"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "ui-monospace" }}
                    stroke="hsl(var(--border))"
                    interval="preserveStartEnd"
                    minTickGap={48}
                  />
                  {/* Eixo da temperatura — embaixo, escala automática */}
                  <YAxis
                    yAxisId="temp"
                    orientation="left"
                    tick={{ fill: "hsl(var(--warning))", fontSize: 11, fontFamily: "ui-monospace" }}
                    stroke="hsl(var(--warning))"
                    width={48}
                    label={{
                      value: "°C",
                      angle: 0,
                      position: "insideTopLeft",
                      fill: "hsl(var(--warning))",
                      fontSize: 11,
                    }}
                  />
                  {/* Eixo da potência — em cima até 100% */}
                  <YAxis
                    yAxisId="power"
                    orientation="right"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fill: "hsl(var(--info))", fontSize: 11, fontFamily: "ui-monospace" }}
                    stroke="hsl(var(--info))"
                    width={48}
                    label={{
                      value: "%",
                      angle: 0,
                      position: "insideTopRight",
                      fill: "hsl(var(--info))",
                      fontSize: 11,
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                    iconType="line"
                  />
                  {/* Temperatura: linha curva/linear suave */}
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    name="Temperatura (°C)"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {/* Potência: degraus retos (mudanças abruptas de duty cycle) */}
                  <Line
                    yAxisId="power"
                    type="stepAfter"
                    dataKey="power"
                    name="Potência (%)"
                    stroke="hsl(var(--info))"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
