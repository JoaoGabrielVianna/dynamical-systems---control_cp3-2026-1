export const CYCLE_PERIOD_S = 30;

export const calcTon = (powerPct: number) => (powerPct / 100) * CYCLE_PERIOD_S;
export const calcToff = (powerPct: number) => CYCLE_PERIOD_S - calcTon(powerPct);
export const formatSeconds = (s: number) => `${s.toFixed(1)}s`;
