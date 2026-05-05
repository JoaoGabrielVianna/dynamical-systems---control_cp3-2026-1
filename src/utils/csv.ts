import { TempPoint } from "@/hooks/useTemperatureSimulator";

const escape = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const buildTempCsv = (points: TempPoint[]) => {
  const header = ["tempo", "iso", "temperatura", "potencia"];
  const lines = [header.join(",")];
  for (const p of points) {
    const iso = new Date(p.t).toISOString();
    lines.push(
      [escape(p.label), escape(iso), p.value.toFixed(3), p.power.toFixed(2)].join(","),
    );
  }
  return lines.join("\n");
};

export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const csvFilename = (prefix = "temperatura") => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${prefix}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.csv`;
};
