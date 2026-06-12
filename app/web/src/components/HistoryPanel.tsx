import { CheckCircle2, Copy, History, RotateCcw, Trash2, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { formatDateTime } from '../lib/format';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { Modal } from './ui';

export function HistoryPanel() {
  const open = useStore((s) => s.historyOpen);
  const setOpen = useStore((s) => s.setHistoryOpen);
  const history = useStore((s) => s.history);
  const toast = useStore((s) => s.toast);

  const redownload = async (id: string) => {
    try {
      await api.redownload(id);
      toast('success', 'Download adicionado novamente à fila!');
      setOpen(false);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Erro ao repetir o download.');
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('success', 'Link copiado!');
    } catch {
      toast('error', 'Não foi possível copiar.');
    }
  };

  const clear = async () => {
    try {
      await api.clearHistory();
      toast('info', 'Histórico limpo.');
    } catch {
      toast('error', 'Não foi possível limpar o histórico.');
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Histórico de downloads" icon={<History size={17} className="text-omni" />} wide>
      {history.length === 0 ? (
        <EmptyState icon={History} title="Histórico vazio" subtitle="Os downloads concluídos (ou com erro) aparecem aqui." />
      ) : (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button onClick={clear} className="inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-red-300">
              <Trash2 size={13} />
              Limpar histórico
            </button>
          </div>
          {history.map((h) => (
            <div
              key={`${h.id}-${h.finishedAt}`}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.12]"
            >
              {h.status === 'completed' ? (
                <CheckCircle2 size={16} className="shrink-0 text-omni" />
              ) : (
                <XCircle size={16} className="shrink-0 text-red-400/80" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-[13px] font-medium text-white/85" title={h.title ?? h.url}>
                  {h.title ?? h.url}
                </p>
                <p className="mt-0.5 text-[11px] text-white/40">
                  {formatDateTime(h.finishedAt)} · {h.presetLabel}
                  {h.uploader && ` · ${h.uploader}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-0.5">
                <button className="icon-btn h-8 w-8" title="Baixar novamente" onClick={() => redownload(h.id)}>
                  <RotateCcw size={14} />
                </button>
                <button className="icon-btn h-8 w-8" title="Copiar link" onClick={() => copyUrl(h.url)}>
                  <Copy size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
