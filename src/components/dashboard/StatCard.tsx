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

const toneClasses: Record<NonNullable<Props["tone"]>, { ring: string; iconBg: string; icon: string; value: string }> = {
  default: { ring: "border-border/60", iconBg: "bg-muted", icon: "text-foreground", value: "text-foreground" },
  success: { ring: "border-success/30", iconBg: "bg-success/10", icon: "text-success", value: "text-foreground" },
  warning: { ring: "border-warning/30", iconBg: "bg-warning/10", icon: "text-warning", value: "text-foreground" },
  danger:  { ring: "border-destructive/30", iconBg: "bg-destructive/10", icon: "text-destructive", value: "text-foreground" },
  info:    { ring: "border-info/30", iconBg: "bg-info/10", icon: "text-info", value: "text-foreground" },
};

export const StatCard = ({ icon: Icon, label, value, unit, hint, tone = "default", className }: Props) => {
  const t = toneClasses[tone];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className={cn("relative overflow-hidden border bg-card p-5 shadow-card transition-smooth hover:shadow-elegant", t.ring, className)}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("font-mono-tech text-2xl font-bold tracking-tight lg:text-[28px]", t.value)}>{value}</span>
              {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
            </div>
            {hint && <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">{hint}</span>}
          </div>
          <div className={cn("grid h-10 w-10 place-items-center rounded-lg", t.iconBg)}>
            <Icon className={cn("h-5 w-5", t.icon)} strokeWidth={2.2} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
