import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlugZap, Usb } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConnect: (port: string) => Promise<boolean>;
  onError: () => void;
}

const PORTS = [
  { id: "COM3", label: "COM3 — USB Serial Device" },
  { id: "COM4", label: "COM4 — Arduino Uno" },
  { id: "COM5", label: "COM5 — Arduino Mega 2560" },
];

export const ConnectModal = ({ open, onOpenChange, onConnect, onError }: Props) => {
  const [port, setPort] = useState("COM5");
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    const ok = await onConnect(port);
    setBusy(false);
    if (ok) onOpenChange(false);
    else { onOpenChange(false); onError(); }
  };

  return (
    <Dialog open={open} onOpenChange={v => !busy && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <PlugZap className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl">Conectar dispositivo</DialogTitle>
          <DialogDescription>
            Selecione a porta serial onde o microcontrolador está conectado. Baudrate padrão: 9600 bps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Porta serial</Label>
            <Select value={port} onValueChange={setPort} disabled={busy}>
              <SelectTrigger className="h-11">
                <Usb className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PORTS.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-mono-tech text-sm">{p.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="grid grid-cols-2 gap-y-1 font-mono-tech">
              <span>Baudrate</span><span className="text-right text-foreground">9600</span>
              <span>Data bits</span><span className="text-right text-foreground">8</span>
              <span>Parity</span><span className="text-right text-foreground">none</span>
              <span>Stop bits</span><span className="text-right text-foreground">1</span>
            </div>
          </div>

          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-warning">
              <Loader2 className="h-4 w-4 animate-spin" />
              Estabelecendo handshake com {port}...
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button>
          <Button onClick={handle} disabled={busy} className="gap-2 bg-gradient-primary text-primary-foreground">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
            {busy ? "Conectando..." : "Conectar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
