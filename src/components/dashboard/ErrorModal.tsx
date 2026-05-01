import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRetry: () => void;
}

export const ErrorModal = ({ open, onOpenChange, onRetry }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 ring-1 ring-destructive/30">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <DialogTitle className="text-xl">Falha ao conectar</DialogTitle>
        <DialogDescription>
          Não foi possível estabelecer comunicação com o dispositivo na porta selecionada.
          Verifique se o cabo USB está conectado e se nenhum outro programa está utilizando a porta.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 font-mono-tech text-xs text-destructive">
        <div className="font-semibold">SerialError [E_TIMEOUT]</div>
        <div className="mt-1 opacity-80">handshake timeout after 1400ms — no response from peer</div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
        <Button onClick={onRetry} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Tentar novamente
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
