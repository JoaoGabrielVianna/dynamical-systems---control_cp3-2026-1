import { ConnectionStatus } from "@/hooks/useConnection";
import { cn } from "@/lib/utils";

interface Props {
  status: ConnectionStatus;
  port: string | null;
  className?: string;
}

const config: Record<ConnectionStatus, { label: (p: string | null) => string; dot: string; text: string }> = {
  disconnected: { label: () => "Desconectado", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  connecting:   { label: p => `Conectando${p ? ` em ${p}` : ""}…`, dot: "bg-warning", text: "text-warning" },
  connected:    { label: p => `Conectado · ${p ?? "—"}`, dot: "bg-success", text: "text-success" },
  error:        { label: () => "Falha de conexão", dot: "bg-destructive", text: "text-destructive" },
};

export const StatusBadge = ({ status, port, className }: Props) => {
  const c = config[status];
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1", className)}>
      <span className="relative flex h-2 w-2">
        {status === "connecting" && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", c.dot)} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", c.dot)} />
      </span>
      <span className={cn("font-mono-tech text-xs", c.text)}>{c.label(port)}</span>
    </div>
  );
};
