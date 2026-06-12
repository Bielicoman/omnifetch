import { useEffect } from 'react';
import { AdvancedOptionsDrawer } from './components/AdvancedOptionsDrawer';
import { DownloadQueue } from './components/DownloadQueue';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { HistoryPanel } from './components/HistoryPanel';
import { LinkInputPanel } from './components/LinkInputPanel';
import { LogModal } from './components/LogModal';
import { QuickPresets } from './components/QuickPresets';
import { SettingsModal } from './components/SettingsModal';
import { ToastNotifications } from './components/ToastNotifications';
import { VideoPreviewCard } from './components/VideoPreviewCard';
import { connectEvents, useStore } from './store';

/** AppShell: dashboard em tela cheia no desktop, blocos empilhados no celular. */
export default function App() {
  const init = useStore((s) => s.init);

  useEffect(() => {
    init();
    const disconnect = connectEvents();
    return disconnect;
  }, [init]);

  return (
    <div className="flex h-full flex-col lg:overflow-hidden">
      <Header />

      <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col gap-4 overflow-y-auto p-4 lg:grid lg:min-h-0 lg:grid-cols-12 lg:overflow-hidden">
        {/* Coluna 1 — entrada + presets */}
        <section className="flex flex-col gap-4 lg:col-span-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <LinkInputPanel />
          <QuickPresets />
        </section>

        {/* Coluna 2 — preview */}
        <section className="flex flex-col lg:col-span-4 lg:min-h-0">
          <VideoPreviewCard />
        </section>

        {/* Coluna 3 — fila e progresso */}
        <section className="flex flex-col lg:col-span-4 lg:min-h-0">
          <DownloadQueue />
        </section>
      </main>

      <footer className="border-t border-white/[0.05] px-4 py-2 text-center text-[11px] text-white/35">
        🔒 Tudo roda localmente no seu dispositivo. Nenhum link é enviado para servidores externos.
        Baixe apenas conteúdos que você tem direito de acessar e salvar.
      </footer>

      <AdvancedOptionsDrawer />
      <SettingsModal />
      <HistoryPanel />
      <HelpModal />
      <LogModal />
      <ToastNotifications />
    </div>
  );
}
