import { motion } from 'framer-motion';
import {
  Ban, CheckCircle2, Clock3, FileVideo, FolderOpen, Loader2,
  RotateCcw, Terminal, Trash2, XCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatBytes, formatEta, formatSpeed } from '../lib/format';
import { Job, JobStatus } from '../lib/types';
import { useStore } from '../store';

const STATUS_INFO: Record<JobStatus, { label: string; tone: string }> = {
  queued: { label: 'Na fila', tone: 'text-white/50 border-white/15 bg-white/[0.05]' },
  analyzing: { label: 'Analisando', tone: 'text-sky-300 border-sky-400/30 bg-sky-400/10' },
  downloading: { label: 'Baixando', tone: 'text-omni border-omni/40 bg-omni/10' },
  converting: { label: 'Convertendo', tone: 'text-violet-300 border-violet-400/30 bg-violet-400/10' },
  merging: { label: 'Mesclando', tone: 'text-violet-300 border-violet-400/30 bg-violet-400/10' },
  completed: { label: 'Concluído', tone: 'text-omni border-omni/40 bg-omni/10' },
  error: { label: 'Erro', tone: 'text-red-300 border-red-400/30 bg-red-400/10' },
  canceled: { label: 'Cancelado', tone: 'text-white/45 border-white/15 bg-white/[0.05]' },
};

const isActive = (s: JobStatus) =>
  s === 'downloading' || s === 'converting' || s === 'merging' || s === 'analyzing';

export function DownloadProgressCard({ job }: { job: Job }) {
  const toast = useStore((s) => s.toast);
  const setLogJobId = useStore((s) => s.setLogJobId);
  const info = STATUS_INFO[job.status];

  const act = async (fn: () => Promise<unknown>, errMsg: string) => {
    try {
      await fn();
    } catch {
      toast('error', errMsg);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 transition-colors hover:border-white/[0.14]"
    >
      <div className="flex items-start gap-3">
        {job.thumbnail ? (
          <img
            src={job.thumbnail}
            alt=""
            className="h-12 w-20 shrink-0 rounded-lg border border-white/10 object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-ink-800">
            <FileVideo size={18} className="text-white/30" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[13px] font-medium text-white/90" title={job.title ?? job.url}>
            {job.title ?? job.url}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${info.tone}`}>
              {isActive(job.status) && <Loader2 size={10} className="animate-spin" />}
              {job.status === 'completed' && <CheckCircle2 size={10} />}
              {job.status === 'error' && <XCircle size={10} />}
              {job.status === 'queued' && <Clock3 size={10} />}
              {info.label}
            </span>
            {job.playlistCount && (
              <span className="text-[10px] text-white/40">
                item {job.playlistIndex ?? '?'} de {job.playlistCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {isActive(job.status) && (
            <button
              className="icon-btn h-7 w-7"
              title="Cancelar"
              onClick={() => act(() => api.cancelJob(job.id), 'Não foi possível cancelar.')}
            >
              <Ban size={14} />
            </button>
          )}
          {(job.status === 'error' || job.status === 'canceled') && (
            <button
              className="icon-btn h-7 w-7"
              title="Tentar novamente"
              onClick={() => act(() => api.retryJob(job.id), 'Não foi possível repetir.')}
            >
              <RotateCcw size={14} />
            </button>
          )}
          {job.status === 'completed' && job.filePath && (
            <button
              className="icon-btn h-7 w-7"
              title="Mostrar arquivo na pasta"
              onClick={() => act(() => api.openFile(job.id), 'Arquivo não encontrado.')}
            >
              <FolderOpen size={14} />
            </button>
          )}
          <button className="icon-btn h-7 w-7" title="Ver logs técnicos" onClick={() => setLogJobId(job.id)}>
            <Terminal size={14} />
          </button>
          {!isActive(job.status) && (
            <button
              className="icon-btn h-7 w-7"
              title="Remover da fila"
              onClick={() => act(() => api.removeJob(job.id), 'Não foi possível remover.')}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* barra de progresso */}
      {(isActive(job.status) || job.status === 'queued') && (
        <div className="mt-2.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-omni-dim to-omni-bright shadow-glow"
              animate={{ width: `${Math.max(2, job.progress)}%` }}
              transition={{ duration: 0.25, ease: 'linear' }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/45">
            <span className="font-semibold text-omni">{job.progress.toFixed(1)}%</span>
            <span>{formatSpeed(job.speed)}</span>
            <span>ETA {formatEta(job.eta)}</span>
            <span>
              {formatBytes(job.downloadedBytes)} / {formatBytes(job.totalBytes)}
            </span>
          </div>
        </div>
      )}

      {job.status === 'error' && job.error && (
        <p className="mt-2 line-clamp-2 rounded-lg border border-red-400/20 bg-red-400/[0.06] px-2.5 py-1.5 text-[11px] text-red-300/90">
          {job.error}
        </p>
      )}
    </motion.div>
  );
}
