import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-950/5 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{detail}</p>
        </div>
        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
