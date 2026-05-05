import { HardHat, HelpCircle, PlugZap, Power } from "lucide-react";
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
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-warning text-foreground">
            <HardHat className="h-4.5 w-4.5" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight lg:text-base">
              Controle Térmico &amp; Potência
            </h1>
            <p className="text-[11px] text-muted-foreground">
              FIAP · Engenharia · PWM via Serial
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} port={port} />
          <Button
            variant={isConnected ? "secondary" : "default"}
            size="sm"
            onClick={onConnectClick}
            disabled={isConnected || isBusy}
            className="gap-2"
          >
            <PlugZap className="h-4 w-4" />
            {isBusy ? "Conectando..." : "Conectar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
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
    </header>
  );
};
