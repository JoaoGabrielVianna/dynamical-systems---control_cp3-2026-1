import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const examples = [
  { p: 0,   on: 0,  off: 30, desc: "Saída totalmente desligada" },
  { p: 25,  on: 7.5, off: 22.5, desc: "Aquecimento brando" },
  { p: 50,  on: 15, off: 15, desc: "Ciclo simétrico — referência" },
  { p: 75,  on: 22.5, off: 7.5, desc: "Aquecimento intenso" },
  { p: 100, on: 30, off: 0,  desc: "Saída sempre ligada" },
];

export const HelpModal = ({ open, onOpenChange }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/30">
          <HelpCircle className="h-6 w-6" />
        </div>
        <DialogTitle className="text-xl">Como funciona o controle PWM</DialogTitle>
        <DialogDescription>
          O sistema utiliza modulação por largura de pulso (Pulse Width Modulation) com período fixo
          de <strong className="text-foreground">30 segundos</strong>. A potência percentual define a fração do ciclo
          em que a saída permanece ligada (Ton); o restante corresponde ao tempo desligado (Toff).
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fórmulas</div>
          <div className="mt-2 space-y-1 font-mono-tech text-sm">
            <div><span className="text-accent">Ton</span>  = (potência ÷ 100) × 30</div>
            <div><span className="text-accent">Toff</span> = 30 − Ton</div>
            <div><span className="text-accent">Período</span> = Ton + Toff = 30s</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">Potência</th>
                <th className="px-3 py-2">Ton</th>
                <th className="px-3 py-2">Toff</th>
                <th className="px-3 py-2">Comportamento</th>
              </tr>
            </thead>
            <tbody className="font-mono-tech">
              {examples.map(e => (
                <tr key={e.p} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold text-foreground">{e.p}%</td>
                  <td className="px-3 py-2 text-success">{e.on}s</td>
                  <td className="px-3 py-2 text-info">{e.off}s</td>
                  <td className="px-3 py-2 font-sans text-muted-foreground">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Exemplo: a 50%, o atuador permanece 15s ligado e 15s desligado, repetindo o ciclo indefinidamente.
        </p>
      </div>
    </DialogContent>
  </Dialog>
);
