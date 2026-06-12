import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

/* Primitivos visuais compartilhados: toggle, segmented, select, modal. */

export function Toggle({ checked, onChange, label, hint }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
    >
      <span className="min-w-0">
        <span className="block text-sm text-white/85">{label}</span>
        {hint && <span className="block text-xs text-white/40">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ${
          checked ? 'border-omni/60 bg-omni/30' : 'border-white/15 bg-white/[0.06]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all duration-200 ${
            checked ? 'left-[22px] bg-omni shadow-glow' : 'left-0.5 bg-white/40'
          }`}
        />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange, size = 'md' }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-ink-900/70 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg font-medium transition-all duration-150 ${
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
          } ${
            value === opt.value
              ? 'bg-omni/20 text-omni shadow-[inset_0_0_0_1px_rgba(0,230,118,0.4)]'
              : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/50">{label}</span>
      {children}
    </label>
  );
}

export function Modal({ open, onClose, title, icon, children, wide }: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`glass relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <h2 className="flex items-center gap-2.5 font-display text-base font-semibold text-white">
                {icon}
                {title}
              </h2>
              <button onClick={onClose} className="icon-btn" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
