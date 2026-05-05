import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-info",
};

export const StatCard = ({ icon: Icon, label, value, unit, hint, tone = "default", className }: Props) => {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card className={cn("border bg-card p-4", className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono-tech text-2xl font-semibold tracking-tight text-foreground">{value}</span>
              {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            </div>
            {hint && <span className="truncate text-[11px] text-muted-foreground">{hint}</span>}
          </div>
          <Icon className={cn("h-4 w-4 shrink-0", toneClasses[tone])} strokeWidth={2} />
        </div>
      </Card>
    </motion.div>
  );
};
