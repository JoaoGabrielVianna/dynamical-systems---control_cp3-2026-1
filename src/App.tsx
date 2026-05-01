import { useState } from "react";
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

  const { status, port, connect, disconnect } = useConnection();
  // Gráfico nunca para — simula leitura mesmo desconectado (modo demo)
  const { points, current, samples } = useTemperatureSimulator({ enabled: true, powerPct: power });

  const handleConnect = (selectedPort: string) => connect(selectedPort, { failChance: 0.25 });

  return (
    <div className="min-h-screen bg-background">
      {/* Background grid */}
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
          {/* Stat cards */}
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={Thermometer}
              label="Temperatura"
              value={current.toFixed(2)}
              unit="°C"
              tone="warning"
              hint="leitura atual"
            />
            <StatCard
              icon={Zap}
              label="Potência"
              value={power.toFixed(0)}
              unit="%"
              tone="info"
              hint="duty cycle"
            />
            <StatCard
              icon={Timer}
              label="Ton"
              value={formatSeconds(calcTon(power))}
              tone="success"
              hint="tempo ligado"
            />
            <StatCard
              icon={TimerOff}
              label="Toff"
              value={formatSeconds(calcToff(power))}
              tone="default"
              hint="tempo desligado"
            />
            <StatCard
              icon={Wifi}
              label="Conexão"
              value={status === "connected" ? "Online" : status === "connecting" ? "..." : "Offline"}
              tone={status === "connected" ? "success" : status === "connecting" ? "warning" : "danger"}
              hint={port ?? "nenhuma porta"}
            />
            <StatCard
              icon={Database}
              label="Amostras"
              value={samples.toLocaleString("pt-BR")}
              tone="default"
              hint="desde o início"
            />
          </section>

          {/* Chart + Control */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
            <TemperatureChart data={points} current={current} />
            <PowerControl power={power} onPowerChange={setPower} />
          </section>

          <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
            <span className="font-mono-tech">FIAP · Engenharia · Projeto Acadêmico v1.0</span>
            <span>Dados simulados — interface de demonstração</span>
          </footer>
        </main>
      </div>

      <ConnectModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onConnect={handleConnect}
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
