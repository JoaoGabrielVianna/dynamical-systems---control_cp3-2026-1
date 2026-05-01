import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Zap, Check } from "lucide-react";
import { calcTon, calcToff, formatSeconds, CYCLE_PERIOD_S } from "@/utils/pwm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface Props {
  power: number;
  onPowerChange: (v: number) => void;
  disabled?: boolean;
}

export const PowerControl = ({ power, onPowerChange, disabled }: Props) => {
  const [applied, setApplied] = useState(false);
  const ton = calcTon(power);
  const toff = calcToff(power);
  const dutyPct = (ton / CYCLE_PERIOD_S) * 100;

  const handleApply = () => {
    setApplied(true);
    toast({
      title: "Potência aplicada",
      description: `${power.toFixed(0)}% — Ton ${formatSeconds(ton)} / Toff ${formatSeconds(toff)}`,
    });
    setTimeout(() => setApplied(false), 1400);
  };

  return (
    <Card className="flex flex-col gap-5 border-border/60 bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
            <Zap className="h-4.5 w-4.5" strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Controle de Potência (PWM)</h3>
            <p className="text-[11px] font-medium text-muted-foreground">Período de ciclo fixo: {CYCLE_PERIOD_S}s</p>
          </div>
        </div>
        <span className="font-mono-tech text-3xl font-bold text-accent">{power.toFixed(0)}<span className="text-base text-muted-foreground">%</span></span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="power-slider" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Duty cycle
            </Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              value={Math.round(power)}
              onChange={e => {
                const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                onPowerChange(v);
              }}
              className="h-8 w-20 text-right font-mono-tech text-sm"
              disabled={disabled}
            />
          </div>
          <Slider
            id="power-slider"
            min={0}
            max={100}
            step={1}
            value={[power]}
            onValueChange={v => onPowerChange(v[0])}
            disabled={disabled}
            className="py-1"
          />
          <div className="flex justify-between text-[10px] font-mono-tech text-muted-foreground">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Forma de onda</span>
            <span className="font-mono-tech">{dutyPct.toFixed(0)}% ON</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-border bg-muted">
            <div className="flex h-full">
              <div className="bg-gradient-primary transition-smooth" style={{ width: `${dutyPct}%` }} />
              <div className="flex-1 bg-secondary/60" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-lg border border-success/20 bg-success/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-success">Ton (Ligado)</div>
            <div className="font-mono-tech text-2xl font-bold text-foreground">{formatSeconds(ton)}</div>
          </div>
          <div className="rounded-lg border border-info/20 bg-info/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-info">Toff (Desligado)</div>
            <div className="font-mono-tech text-2xl font-bold text-foreground">{formatSeconds(toff)}</div>
          </div>
        </div>

        <Button onClick={handleApply} disabled={disabled} className="w-full gap-2 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
          <AnimatePresence mode="wait" initial={false}>
            {applied ? (
              <motion.span key="ok" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Aplicado
              </motion.span>
            ) : (
              <motion.span key="apply" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Aplicar Potência
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </Card>
  );
};
