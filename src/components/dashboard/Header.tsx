import { Activity, HelpCircle, PlugZap, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { ThemeToggle } from "./ThemeToggle";
import { ConnectionStatus } from "@/hooks/useConnection";

interface Props {
  status: ConnectionStatus;
  port: string | null;
  onConnectClick: () => void;
  onDisconnect: () => void;
  onHelp: () => void;
}

export const Header = ({ status, port, onConnectClick, onDisconnect, onHelp }: Props) => {
  const isConnected = status === "connected";
  const isBusy = status === "connecting";

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Activity className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
              Sistema de Controle de Temperatura e Potência
            </h1>
            <p className="text-xs font-medium text-muted-foreground lg:text-sm">
              FIAP · Engenharia · Aquisição via Serial &amp; Modulação PWM
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} port={port} />
          <div className="ml-1 flex items-center gap-2">
            <Button
              variant={isConnected ? "secondary" : "default"}
              onClick={onConnectClick}
              disabled={isConnected || isBusy}
              className="gap-2"
            >
              <PlugZap className="h-4 w-4" />
              {isBusy ? "Conectando..." : "Conectar"}
            </Button>
            <Button
              variant="outline"
              onClick={onDisconnect}
              disabled={!isConnected}
              className="gap-2"
            >
              <Power className="h-4 w-4" />
              Desconectar
            </Button>
            <Button variant="ghost" size="icon" onClick={onHelp} aria-label="Ajuda">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
