import { useState, useCallback, useRef } from "react";
import { Header } from "@/components/dashboard/Header";
import { TemperatureChart } from "@/components/dashboard/TemperatureChart";
import { ExcelChart } from "@/components/dashboard/ExcelChart";
import { PowerControl } from "@/components/dashboard/PowerControl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, FileSpreadsheet } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConnectModal } from "@/components/dashboard/ConnectModal";
import { ErrorModal } from "@/components/dashboard/ErrorModal";
import { HelpModal } from "@/components/dashboard/HelpModal";
import { Card } from "@/components/ui/card";
import { useConnection } from "@/hooks/useConnection";
import { useTemperatureSimulator } from "@/hooks/useTemperatureSimulator";
import { calcTon, calcToff, formatSeconds } from "@/utils/pwm";
import { buildTempCsv, csvFilename, downloadCsv } from "@/utils/csv";
import { Button } from "@/components/ui/button";
import { Thermometer, Zap, Timer, TimerOff, Wifi, Database, Download, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const App = () => {
  const [power, setPower] = useState(40);
  const [connectOpen, setConnectOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { points, current, samples, pushReading, reset: resetPoints } = useTemperatureSimulator();

  const powerRef = useRef(power);
  powerRef.current = power;

  const handleData = useCallback((line: string) => {
    const val = parseFloat(line);
    if (!isNaN(val)) pushReading(val, powerRef.current);
  }, [pushReading]);

  const handleExportCsv = useCallback(() => {
    if (!points.length) return;
    const csv = buildTempCsv(points);
    const file = csvFilename();
    downloadCsv(file, csv);
    toast({
      title: "CSV exportado",
      description: `${points.length} amostras salvas em ${file}`,
    });
  }, [points]);

  const handleResetSamples = useCallback(() => {
    resetPoints();
    toast({ title: "Amostras zeradas", description: "Buffer reiniciado." });
  }, [resetPoints]);

  const { status, port, connect, disconnect, sendCommand } = useConnection({
    onData: handleData,
    onDisconnect: () => {},
  });

  const handleApplyPower = useCallback(async (pwr: number) => {
    setPower(pwr);
    if (status === "connected") {
      await sendCommand(String(pwr));
    }
  }, [status, sendCommand]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[360px] bg-gradient-glow" />

      <div className="relative">
        <Header
          status={status}
          port={port}
          onConnectClick={() => setConnectOpen(true)}
          onDisconnect={disconnect}
          onHelp={() => setHelpOpen(true)}
        />

        <main className="mx-auto max-w-[1500px] px-6 py-6 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Sidebar esquerda: configuração + indicadores */}
            <aside className="flex flex-col gap-4">
              <Card className="border bg-card p-5">
                <div className="mb-4 flex items-center gap-2 border-b pb-3">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-warning text-foreground">
                    <Zap className="h-4 w-4" strokeWidth={2.4} />
                  </div>
                  <div className="leading-tight">
                    <h2 className="text-sm font-semibold">Controle de Potência</h2>
                    <p className="text-[11px] text-muted-foreground">PWM via serial</p>
                  </div>
                </div>
                <PowerControl power={power} onPowerChange={setPower} onApply={handleApplyPower} />
              </Card>

              <Card className="border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="leading-tight">
                    <h2 className="text-sm font-semibold">Gravação</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {samples.toLocaleString("pt-BR")} amostras no buffer
                    </p>
                  </div>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleExportCsv}
                    disabled={samples === 0}
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button
                    onClick={handleResetSamples}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar buffer
                  </Button>
                </div>
                <p className="mt-3 text-[10px] text-muted-foreground">
                  Colunas: <span className="font-mono-tech">tempo, iso, temperatura, potencia</span>. Importe na aba Excel.
                </p>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Thermometer} label="Temperatura" value={current.toFixed(2)} unit="°C" tone="warning" hint="leitura atual" />
                <StatCard icon={Zap} label="Potência" value={power.toFixed(0)} unit="%" tone="info" hint="duty cycle" />
                <StatCard icon={Timer} label="Ton" value={formatSeconds(calcTon(power))} tone="success" hint="ligado" />
                <StatCard icon={TimerOff} label="Toff" value={formatSeconds(calcToff(power))} tone="default" hint="desligado" />
                <StatCard
                  icon={Wifi}
                  label="Conexão"
                  value={status === "connected" ? "Online" : status === "connecting" ? "..." : "Offline"}
                  tone={status === "connected" ? "success" : status === "connecting" ? "warning" : "danger"}
                  hint={port ?? "sem porta"}
                />
                <StatCard icon={Database} label="Amostras" value={samples.toLocaleString("pt-BR")} tone="default" hint="desde início" />
              </div>
            </aside>

            {/* Conteúdo principal: tabs entre gráficos */}
            <section className="flex flex-col gap-4">
              <Tabs defaultValue="live" className="w-full">
                <TabsList>
                  <TabsTrigger value="live" className="gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    Tempo real
                  </TabsTrigger>
                  <TabsTrigger value="excel" className="gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Importar Excel
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="live">
                  <TemperatureChart data={points} current={current} />
                </TabsContent>
                <TabsContent value="excel">
                  <ExcelChart />
                </TabsContent>
              </Tabs>
            </section>
          </div>

          <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t pt-6 text-[11px] text-muted-foreground sm:flex-row">
            <span className="font-mono-tech">FIAP · Engenharia · Projeto Acadêmico v1.0</span>
            <span>
              {status === "connected"
                ? `Dados reais — Arduino em ${port}`
                : "Aguardando conexão serial…"}
            </span>
          </footer>
        </main>
      </div>

      <ConnectModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onConnect={connect}
        onError={() => setErrorOpen(true)}
      />
      <ErrorModal
        open={errorOpen}
        onOpenChange={setErrorOpen}
        onRetry={() => { setErrorOpen(false); setConnectOpen(true); }}
      />
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
};

export default App;
