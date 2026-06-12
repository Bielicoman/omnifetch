import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useStore } from '../store';

const TONES = {
  success: { icon: CheckCircle2, cls: 'border-omni/40 text-omni' },
  error: { icon: XCircle, cls: 'border-red-400/40 text-red-300' },
  info: { icon: Info, cls: 'border-sky-400/40 text-sky-300' },
};

export function ToastNotifications() {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const tone = TONES[t.kind];
          const Icon = tone.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-ink-900/95 px-3.5 py-3 shadow-card backdrop-blur-xl ${tone.cls}`}
            >
              <Icon size={17} className="shrink-0" />
              <p className="flex-1 text-[13px] font-medium text-white/85">{t.message}</p>
              <button onClick={() => dismissToast(t.id)} className="shrink-0 text-white/40 transition-colors hover:text-white">
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
