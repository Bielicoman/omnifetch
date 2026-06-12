import { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, subtitle }: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-omni/20 bg-omni/[0.06]">
        <Icon size={26} className="text-omni/60" />
      </div>
      <p className="text-sm font-medium text-white/70">{title}</p>
      {subtitle && <p className="max-w-[280px] text-xs leading-relaxed text-white/40">{subtitle}</p>}
    </div>
  );
}
