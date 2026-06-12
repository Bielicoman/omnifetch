import { AnimatePresence } from 'framer-motion';
import { DownloadCloud, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store';
import { DownloadProgressCard } from './DownloadProgressCard';
import { EmptyState } from './EmptyState';
import { Segmented } from './ui';

export function DownloadQueue() {
  const jobs = useStore((s) => s.jobs);
  const settings = useStore((s) => s.settings);
  const saveSettings = useStore((s) => s.saveSettings);
  const toast = useStore((s) => s.toast);

  const active = jobs.filter((j) =>
    ['downloading', 'converting', 'merging', 'analyzing'].includes(j.status),
  ).length;
  const queued = jobs.filter((j) => j.status === 'queued').length;
  const done = jobs.filter((j) => ['completed', 'error', 'canceled'].includes(j.status)).length;

  const totalProgress =
    jobs.length > 0
      ? jobs.reduce((acc, j) => acc + (j.status === 'completed' ? 100 : j.progress), 0) / jobs.length
      : 0;

  return (
    <div className="glass flex min-h-[280px] flex-1 flex-col overflow-hidden">
      <div className="border-b border-white/[0.06] px-4 py-3 lg:px-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="section-title">
            <DownloadCloud size={14} />
            Fila de downloads
          </h2>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-white/35 sm:inline">Simultâneos</span>
            <Segmented
              size="sm"
              value={String(settings?.maxConcurrent ?? 2)}
              onChange={(v) => saveSettings({ maxConcurrent: parseInt(v, 10) })}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
              ]}
            />
          </div>
        </div>

        {jobs.length > 0 && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] text-white/40">
              <span>
                {active > 0 ? `${active} ativo${active > 1 ? 's' : ''}` : 'Nada ativo'}
                {queued > 0 && ` · ${queued} na fila`}
              </span>
              <span>{Math.round(totalProgress)}% geral</span>
              {done > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await api.clearFinished();
                    } catch {
                      toast('error', 'Não foi possível limpar.');
                    }
                  }}
                  className="inline-flex items-center gap-1 text-white/40 transition-colors hover:text-red-300"
                >
                  <Trash2 size={11} />
                  Limpar concluídos
                </button>
              )}
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-omni/50 transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 lg:p-4">
        {jobs.length === 0 ? (
          <EmptyState
            icon={DownloadCloud}
            title="A fila está vazia"
            subtitle="Cole um link e clique em “Baixar agora”. Os downloads aparecem aqui com progresso em tempo real."
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {jobs.map((job) => (
              <DownloadProgressCard key={job.id} job={job} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
