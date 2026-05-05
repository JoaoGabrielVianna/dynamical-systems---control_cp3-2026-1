import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PlugZap, Usb, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConnect: () => Promise<boolean>;
  onError: () => void;
}

const hasWebSerial = "serial" in navigator;

export const ConnectModal = ({ open, onOpenChange, onConnect, onError }: Props) => {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    // requestPort() abre o picker nativo do Chrome — fecha o modal antes
    // para não sobrepor diálogos
    onOpenChange(false);
    const ok = await onConnect();
    setBusy(false);
    if (!ok) onError();
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
            O Chrome abrirá um seletor de portas seriais. Escolha a porta do
            seu Arduino (ex.: <span className="font-mono-tech">USB Serial Device</span>).
            Baudrate configurado: <span className="font-mono-tech">9600 bps</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Parâmetros de conexão — informativos */}
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <div className="grid grid-cols-2 gap-y-1 font-mono-tech">
            <span>Baudrate</span>   <span className="text-right text-foreground">9600</span>
            <span>Data bits</span>  <span className="text-right text-foreground">8</span>
            <span>Parity</span>     <span className="text-right text-foreground">none</span>
            <span>Stop bits</span>  <span className="text-right text-foreground">1</span>
            <span>API</span>        <span className="text-right text-foreground">Web Serial</span>
          </div>
        </div>

        {/* Aviso se o navegador não suporta Web Serial */}
        {!hasWebSerial && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Web Serial API não disponível. Use <strong>Google Chrome</strong> ou{" "}
              <strong>Microsoft Edge</strong> em um desktop/laptop.
            </span>
          </motion.div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button
            onClick={handle}
            disabled={busy || !hasWebSerial}
            className="gap-2 bg-gradient-primary text-primary-foreground"
          >
            {busy
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Conectando…</>
              : <><Usb className="h-4 w-4" /> Escolher porta</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
