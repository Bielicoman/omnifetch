import { History, Settings, HelpCircle, Zap } from 'lucide-react';
import { useStore } from '../store';
import { SystemStatus } from './SystemStatus';

export function Header() {
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const setHistoryOpen = useStore((s) => s.setHistoryOpen);
  const setHelpOpen = useStore((s) => s.setHelpOpen);

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/[0.06] bg-ink-950/70 px-4 py-3 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-omni-bright to-omni-dim shadow-glow">
          <Zap size={20} className="text-ink-950" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold leading-none tracking-wide">
            OMNI<span className="text-omni">FETCH</span>
          </h1>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/35">
            Downloader universal · local · privado
          </p>
        </div>
      </div>

      <div className="hidden flex-1 sm:block" />
      <SystemStatus />

      <div className="ml-auto flex items-center gap-1 sm:ml-0">
        <button onClick={() => setHistoryOpen(true)} className="icon-btn" title="Histórico de downloads">
          <History size={18} />
        </button>
        <button onClick={() => setSettingsOpen(true)} className="icon-btn" title="Configurações">
          <Settings size={18} />
        </button>
        <button onClick={() => setHelpOpen(true)} className="icon-btn" title="Ajuda e tutorial rápido">
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
