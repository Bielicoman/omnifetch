import { AlertTriangle } from 'lucide-react';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/[0.08]">
        <AlertTriangle size={26} className="text-amber-400" />
      </div>
      <p className="text-sm font-medium text-white/80">Não deu certo</p>
      <p className="max-w-[320px] text-xs leading-relaxed text-white/50">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-1 px-4 py-2 text-xs">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
