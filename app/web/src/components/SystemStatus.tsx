import { CheckCircle2, FolderOpen, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store';

function Pill({ ok, label, version, onClick }: {
  ok: boolean;
  label: string;
  version?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={ok ? `${label} ${version ?? ''}` : `${label} não encontrado — clique para ver como instalar`}
      className={`chip transition-colors ${
        ok ? 'hover:border-omni/40' : 'border-red-500/40 bg-red-500/10 text-red-300 hover:border-red-400'
      }`}
    >
      {ok ? <CheckCircle2 size={13} className="text-omni" /> : <XCircle size={13} />}
      <span>{label}</span>
      {ok && version && <span className="hidden text-white/40 xl:inline">{version.split(' ')[0].slice(0, 12)}</span>}
    </button>
  );
}

export function SystemStatus() {
  const status = useStore((s) => s.status);
  const setHelpOpen = useStore((s) => s.setHelpOpen);
  const toast = useStore((s) => s.toast);

  if (!status) {
    return <div className="skeleton h-7 w-48" />;
  }

  const openFolder = async () => {
    try {
      await api.openDownloadsFolder();
    } catch {
      toast('error', 'Não foi possível abrir a pasta.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill ok={status.ytdlp.found} label="yt-dlp" version={status.ytdlp.version} onClick={() => !status.ytdlp.found && setHelpOpen(true)} />
      <Pill ok={status.ffmpeg.found} label="ffmpeg" version={status.ffmpeg.version} onClick={() => !status.ffmpeg.found && setHelpOpen(true)} />
      <button
        type="button"
        onClick={openFolder}
        className="chip hover:border-omni/40 transition-colors"
        title={`Pasta de downloads: ${status.downloadDir}`}
      >
        <FolderOpen size={13} className="text-omni" />
        <span className="hidden sm:inline">Downloads</span>
      </button>
      <span className="chip hidden md:inline-flex" title="Versão do OMNIFETCH">
        v{status.appVersion}
      </span>
    </div>
  );
}
