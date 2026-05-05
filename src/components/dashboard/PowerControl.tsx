import { useState } from "react";
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
  onApply?: (v: number) => Promise<void> | void;
  disabled?: boolean;
}

export const PowerControl = ({ power, onPowerChange, onApply, disabled }: Props) => {
  const [applied, setApplied] = useState(false);
  const ton = calcTon(power);
  const toff = calcToff(power);
  const dutyPct = (ton / CYCLE_PERIOD_S) * 100;

  const handleApply = async () => {
    setApplied(true);
    await onApply?.(power);
    toast({
      title: "Potência aplicada",
      description: `${power.toFixed(0)}% — Ton ${formatSeconds(ton)} / Toff ${formatSeconds(toff)}`,
    });
    setTimeout(() => setApplied(false), 1400);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Período fixo {CYCLE_PERIOD_S}s
        </span>
        <span className="font-mono-tech text-3xl font-semibold text-foreground">
          {power.toFixed(0)}
          <span className="ml-0.5 text-base text-muted-foreground">%</span>
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="power-slider" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Duty cycle
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            step={1}
            value={Math.round(power)}
            onChange={(e) => {
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
          onValueChange={(v) => onPowerChange(v[0])}
          disabled={disabled}
          className="py-1"
        />
        <div className="flex justify-between font-mono-tech text-[10px] text-muted-foreground">
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Forma de onda</span>
          <span className="font-mono-tech">{dutyPct.toFixed(0)}% ON</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border bg-muted">
          <div className="flex h-full">
            <div className="bg-warning transition-smooth" style={{ width: `${dutyPct}%` }} />
            <div className="flex-1 bg-foreground/15" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border bg-muted/40 p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-success">Ton</div>
          <div className="font-mono-tech text-xl font-semibold text-foreground">{formatSeconds(ton)}</div>
        </div>
        <div className="rounded-md border bg-muted/40 p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-info">Toff</div>
          <div className="font-mono-tech text-xl font-semibold text-foreground">{formatSeconds(toff)}</div>
        </div>
      </div>

      <Button onClick={handleApply} disabled={disabled} className="w-full gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {applied ? (
            <motion.span key="ok" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Aplicado
            </motion.span>
          ) : (
            <motion.span key="apply" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Aplicar potência
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};
