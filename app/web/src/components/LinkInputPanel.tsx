import { ClipboardPaste, Download, Eraser, Link2, ListVideo, Search, Tv, Video } from 'lucide-react';
import { detectLinkKind, splitUrls } from '../lib/format';
import { useStore } from '../store';

const KIND_BADGE: Record<string, { icon: typeof Video; label: string } | null> = {
  empty: null,
  invalid: null,
  video: { icon: Video, label: 'Vídeo detectado' },
  playlist: { icon: ListVideo, label: 'Playlist detectada' },
  channel: { icon: Tv, label: 'Canal detectado' },
  list: { icon: Link2, label: 'Lista de links' },
};

export function LinkInputPanel() {
  const urlInput = useStore((s) => s.urlInput);
  const setUrlInput = useStore((s) => s.setUrlInput);
  const clearInput = useStore((s) => s.clearInput);
  const analyze = useStore((s) => s.analyze);
  const startDownload = useStore((s) => s.startDownload);
  const analyzing = useStore((s) => s.analyzing);
  const toast = useStore((s) => s.toast);

  const kind = detectLinkKind(urlInput);
  const urlCount = splitUrls(urlInput).length;
  const badge = KIND_BADGE[kind];
  const hasValidUrl = urlCount > 0;

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim() === '') {
        toast('info', 'A área de transferência está vazia.');
        return;
      }
      setUrlInput(urlInput.trim() === '' ? text.trim() : `${urlInput.trim()}\n${text.trim()}`);
    } catch {
      toast('error', 'Não foi possível ler a área de transferência. Cole com Ctrl+V.');
    }
  };

  return (
    <div className="glass p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="section-title">
          <Link2 size={14} />
          Links para baixar
        </h2>
        {badge && (
          <span className="chip border-omni/30 bg-omni/10 text-omni">
            <badge.icon size={12} />
            {badge.label}
            {kind === 'list' && ` · ${urlCount} links`}
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              if (hasValidUrl) startDownload();
            }
          }}
          rows={3}
          spellCheck={false}
          placeholder={'Cole um link de vídeo, playlist, canal\nou vários links em lista (um por linha)…'}
          className="input-base resize-none font-mono text-[13px] leading-relaxed"
        />
        <button
          type="button"
          onClick={paste}
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-800/90 px-2.5 py-1.5 text-xs text-white/60 transition-colors hover:border-omni/40 hover:text-omni"
          title="Colar da área de transferência"
        >
          <ClipboardPaste size={13} />
          Colar
        </button>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[auto_1fr_auto]">
        <button
          onClick={analyze}
          disabled={!hasValidUrl || analyzing}
          className="btn-secondary text-sm"
          title="Ver título, qualidade e detalhes antes de baixar"
        >
          {analyzing ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-omni/30 border-t-omni" />
          ) : (
            <Search size={16} />
          )}
          {analyzing ? 'Analisando…' : 'Analisar mídia'}
        </button>

        <button
          onClick={startDownload}
          disabled={!hasValidUrl}
          className="btn-primary text-sm"
          title="Baixar com as opções selecionadas (Ctrl+Enter)"
        >
          <Download size={17} strokeWidth={2.5} />
          Baixar agora
        </button>

        <button onClick={clearInput} disabled={urlInput === ''} className="btn-ghost text-sm" title="Limpar">
          <Eraser size={16} />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>

      {kind === 'invalid' && (
        <p className="mt-2 text-xs text-amber-400/80">
          Isso não parece um link. Cole um endereço completo começando com http:// ou https://
        </p>
      )}
    </div>
  );
}
