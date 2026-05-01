import { motion } from "framer-motion";
import { ConnectionStatus } from "@/hooks/useConnection";
import { cn } from "@/lib/utils";

interface Props {
  status: ConnectionStatus;
  port: string | null;
  className?: string;
}

const config: Record<ConnectionStatus, { label: (p: string | null) => string; dot: string; ring: string; text: string }> = {
  disconnected: {
    label: () => "Desconectado",
    dot: "bg-destructive",
    ring: "ring-destructive/30",
    text: "text-destructive",
  },
  connecting: {
    label: p => `Conectando${p ? ` em ${p}` : ""}...`,
    dot: "bg-warning",
    ring: "ring-warning/30",
    text: "text-warning",
  },
  connected: {
    label: p => `Conectado em ${p ?? "—"}`,
    dot: "bg-success",
    ring: "ring-success/30",
    text: "text-success",
  },
  error: {
    label: () => "Falha de conexão",
    dot: "bg-destructive",
    ring: "ring-destructive/30",
    text: "text-destructive",
  },
};

export const StatusBadge = ({ status, port, className }: Props) => {
  const c = config[status];
  return (
    <motion.div
      layout
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border bg-card/60 px-3.5 py-1.5 backdrop-blur",
        "ring-2 ring-offset-2 ring-offset-background transition-smooth",
        c.ring,
        className,
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        {status === "connecting" && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", c.dot)} />
        )}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", c.dot)} />
      </span>
      <span className={cn("text-sm font-semibold tracking-tight font-mono-tech", c.text)}>{c.label(port)}</span>
    </motion.div>
  );
};
