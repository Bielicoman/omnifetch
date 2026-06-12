import { AnimatePresence, motion } from 'framer-motion';
import { ListVideo, RotateCcw, Settings2, Terminal, X } from 'lucide-react';
import { api } from '../lib/api';
import { splitUrls } from '../lib/format';
import { useStore } from '../store';
import { FormatSelector } from './FormatSelector';
import { MetadataOptions } from './MetadataOptions';
import { SubtitleOptions } from './SubtitleOptions';
import { Field, Toggle } from './ui';

export function AdvancedOptionsDrawer() {
  const open = useStore((s) => s.drawerOpen);
  const setOpen = useStore((s) => s.setDrawerOpen);
  const options = useStore((s) => s.options);
  const setOptions = useStore((s) => s.setOptions);
  const resetOptions = useStore((s) => s.resetOptions);
  const urlInput = useStore((s) => s.urlInput);
  const toast = useStore((s) => s.toast);

  const pl = options.playlist;
  const patchPl = (p: Partial<typeof pl>) => setOptions({ playlist: { ...pl, ...p } });

  const copyCommand = async () => {
    const urls = splitUrls(urlInput);
    if (urls.length === 0) {
      toast('info', 'Cole um link primeiro para gerar o comando.');
      return;
    }
    try {
      const { command } = await api.previewCommand(urls[0], options);
      await navigator.clipboard.writeText(command);
      toast('success', 'Comando yt-dlp copiado!');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Erro ao gerar o comando.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-ink-900/95 backdrop-blur-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <h2 className="flex items-center gap-2.5 font-display text-base font-semibold">
                <Settings2 size={18} className="text-omni" />
                Opções avançadas
              </h2>
              <button onClick={() => setOpen(false)} className="icon-btn" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <FormatSelector />

              <div className="border-t border-white/[0.06] pt-4">
                <SubtitleOptions />
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <MetadataOptions />
              </div>

              {/* ---------- PLAYLIST ---------- */}
              <div className="space-y-3 border-t border-white/[0.06] pt-4">
                <p className="section-title">
                  <ListVideo size={13} />
                  Playlist e canal
                </p>

                <Toggle
                  checked={pl.full}
                  onChange={(v) => patchPl({ full: v })}
                  label="Baixar playlist/canal inteiro"
                  hint="Cria uma pasta com o nome da playlist"
                />

                {pl.full && (
                  <>
                    <Field label="Intervalo específico (opcional)">
                      <input
                        value={pl.items}
                        onChange={(e) => patchPl({ items: e.target.value })}
                        placeholder="ex.: 1-10,15,20-25"
                        className="input-base"
                        spellCheck={false}
                      />
                    </Field>
                    <Field label="Baixar apenas os primeiros X vídeos (0 = todos)">
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        value={pl.limit}
                        onChange={(e) => patchPl({ limit: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="input-base"
                      />
                    </Field>
                    <Toggle
                      checked={pl.skipDownloaded}
                      onChange={(v) => patchPl({ skipDownloaded: v })}
                      label="Ignorar vídeos já baixados"
                      hint="Mantém um registro e pula repetidos"
                    />
                  </>
                )}
              </div>

              {/* ---------- DOWNLOAD ---------- */}
              <div className="space-y-3 border-t border-white/[0.06] pt-4">
                <p className="section-title">Download</p>
                <Toggle
                  checked={options.useAria2}
                  onChange={(v) => setOptions({ useAria2: v })}
                  label="Acelerar com aria2c"
                  hint="Usa conexões paralelas (se o aria2c estiver instalado)"
                />
                <Field label="Modelo de nome do arquivo">
                  <input
                    value={options.outputTemplate}
                    onChange={(e) => setOptions({ outputTemplate: e.target.value })}
                    className="input-base font-mono text-xs"
                    spellCheck={false}
                  />
                  <span className="mt-1 block text-[11px] text-white/35">
                    Tokens: %(title)s %(uploader)s %(id)s %(upload_date)s %(ext)s — precisa terminar com %(ext)s
                  </span>
                </Field>
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/[0.07] px-5 py-3">
              <button onClick={copyCommand} className="btn-secondary flex-1 px-3 py-2 text-xs" title="Copiar o comando yt-dlp equivalente">
                <Terminal size={14} />
                Copiar comando
              </button>
              <button onClick={() => { resetOptions(); toast('info', 'Opções restauradas para o padrão.'); }} className="btn-ghost px-3 py-2 text-xs">
                <RotateCcw size={14} />
                Padrão
              </button>
              <button onClick={() => setOpen(false)} className="btn-primary flex-1 px-3 py-2 text-xs">
                Concluído
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
