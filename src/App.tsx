import { useState, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { TemperatureChart } from "@/components/dashboard/TemperatureChart";
import { PowerControl } from "@/components/dashboard/PowerControl";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConnectModal } from "@/components/dashboard/ConnectModal";
import { ErrorModal } from "@/components/dashboard/ErrorModal";
import { HelpModal } from "@/components/dashboard/HelpModal";
import { useConnection } from "@/hooks/useConnection";
import { useTemperatureSimulator } from "@/hooks/useTemperatureSimulator";
import { calcTon, calcToff, formatSeconds } from "@/utils/pwm";
import { Thermometer, Zap, Timer, TimerOff, Wifi, Database } from "lucide-react";

const App = () => {
  const [power, setPower] = useState(40);
  const [connectOpen, setConnectOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { points, current, samples, pushReading } = useTemperatureSimulator();

  // Cada linha recebida do Arduino é um número de temperatura (ex.: "23.45")
  const handleData = useCallback((line: string) => {
    const val = parseFloat(line);
    if (!isNaN(val)) pushReading(val);
  }, [pushReading]);

  const { status, port, connect, disconnect, sendCommand } = useConnection({
    onData: handleData,
    onDisconnect: () => {/* status já atualiza via hook */},
  });

  // PowerControl chama isso quando o usuário clica em "Aplicar Potência"
  const handleApplyPower = useCallback(async (pwr: number) => {
    setPower(pwr);
    if (status === "connected") {
      await sendCommand(String(pwr));
    }
  }, [status, sendCommand]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-[0.35] dark:opacity-20" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-gradient-glow" />

      <div className="relative">
        <Header
          status={status}
          port={port}
          onConnectClick={() => setConnectOpen(true)}
          onDisconnect={disconnect}
          onHelp={() => setHelpOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] px-6 py-6 lg:py-8">
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={Thermometer} label="Temperatura" value={current.toFixed(2)} unit="°C" tone="warning" hint="leitura atual" />
            <StatCard icon={Zap} label="Potência" value={power.toFixed(0)} unit="%" tone="info" hint="duty cycle" />
            <StatCard icon={Timer} label="Ton" value={formatSeconds(calcTon(power))} tone="success" hint="tempo ligado" />
            <StatCard icon={TimerOff} label="Toff" value={formatSeconds(calcToff(power))} tone="default" hint="tempo desligado" />
            <StatCard
              icon={Wifi}
              label="Conexão"
              value={status === "connected" ? "Online" : status === "connecting" ? "..." : "Offline"}
              tone={status === "connected" ? "success" : status === "connecting" ? "warning" : "danger"}
              hint={port ?? "nenhuma porta"}
            />
            <StatCard icon={Database} label="Amostras" value={samples.toLocaleString("pt-BR")} tone="default" hint="desde o início" />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
            <TemperatureChart data={points} current={current} />
            {/* PowerControl recebe onApply — só envia pro Arduino ao confirmar */}
            <PowerControl power={power} onPowerChange={setPower} onApply={handleApplyPower} />
          </section>

          <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
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
