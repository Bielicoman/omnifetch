import { motion } from 'framer-motion';
import {
  Calendar, Clock, Eye, Globe, HardDrive, ListVideo, MonitorPlay,
  Radio, ScanSearch, ShieldAlert, ThumbsUp, User,
} from 'lucide-react';
import { formatBytes, formatCount, formatDuration, formatUploadDate } from '../lib/format';
import { useStore } from '../store';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

function MetaChip({ icon: Icon, children, title }: {
  icon: typeof Clock;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span className="chip" title={title}>
      <Icon size={12} className="text-omni/80" />
      {children}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 lg:p-5">
      <div className="skeleton aspect-video w-full" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-20" />
        <div className="skeleton h-6 w-20" />
        <div className="skeleton h-6 w-20" />
      </div>
      <div className="skeleton h-16 w-full" />
    </div>
  );
}

export function VideoPreviewCard() {
  const analysis = useStore((s) => s.analysis);
  const analyzing = useStore((s) => s.analyzing);
  const analysisError = useStore((s) => s.analysisError);
  const analyze = useStore((s) => s.analyze);

  return (
    <div className="glass flex min-h-[280px] flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 lg:px-5">
        <h2 className="section-title">
          <ScanSearch size={14} />
          Preview da mídia
        </h2>
        {analysis && (
          <span className="chip border-omni/30 bg-omni/10 text-omni">
            <Globe size={12} />
            {analysis.platform}
          </span>
        )}
      </div>

      {analyzing && <Skeleton />}

      {!analyzing && analysisError && <ErrorState message={analysisError} onRetry={analyze} />}

      {!analyzing && !analysisError && !analysis && (
        <EmptyState
          icon={MonitorPlay}
          title="Nenhuma mídia analisada ainda"
          subtitle="Cole um link e clique em “Analisar mídia” para ver título, qualidade e tamanho antes de baixar."
        />
      )}

      {!analyzing && !analysisError && analysis && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 lg:p-5"
        >
          {analysis.thumbnail && (
            <div className="relative overflow-hidden rounded-xl border border-white/[0.08]">
              <img
                src={analysis.thumbnail}
                alt=""
                className="aspect-video w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              {analysis.duration !== undefined && (
                <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 text-xs font-semibold text-white">
                  {formatDuration(analysis.duration)}
                </span>
              )}
              {analysis.kind === 'playlist' && (
                <span className="absolute left-2 top-2 chip border-omni/40 bg-black/70 text-omni">
                  <ListVideo size={12} />
                  {analysis.entryCount ?? analysis.entries?.length ?? '?'} vídeos
                </span>
              )}
            </div>
          )}

          <div>
            <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-white">
              {analysis.title ?? '(sem título)'}
            </h3>
            {analysis.uploader && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                <User size={12} />
                {analysis.uploader}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {analysis.uploadDate && (
              <MetaChip icon={Calendar} title="Data de publicação">{formatUploadDate(analysis.uploadDate)}</MetaChip>
            )}
            {analysis.viewCount !== undefined && (
              <MetaChip icon={Eye} title="Visualizações">{formatCount(analysis.viewCount)}</MetaChip>
            )}
            {analysis.likeCount !== undefined && (
              <MetaChip icon={ThumbsUp} title="Curtidas">{formatCount(analysis.likeCount)}</MetaChip>
            )}
            {analysis.maxHeight && (
              <MetaChip icon={MonitorPlay} title="Resolução máxima disponível">
                até {analysis.maxHeight}p{analysis.maxFps && analysis.maxFps > 30 ? ` ${Math.round(analysis.maxFps)}fps` : ''}
              </MetaChip>
            )}
            {analysis.estimatedSize && (
              <MetaChip icon={HardDrive} title="Tamanho estimado (melhor qualidade)">
                ~{formatBytes(analysis.estimatedSize)}
              </MetaChip>
            )}
            {analysis.vcodecs && analysis.vcodecs.length > 0 && (
              <MetaChip icon={Clock} title="Codecs disponíveis">{analysis.vcodecs.join(' · ')}</MetaChip>
            )}
          </div>

          {(analysis.isLive || (analysis.ageLimit ?? 0) >= 18 || analysis.availability === 'needs_auth') && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3 text-xs text-amber-300/90">
              <ShieldAlert size={15} className="mt-0.5 shrink-0" />
              <div>
                {analysis.isLive && <p><Radio size={11} className="mr-1 inline" />Transmissão ao vivo — o download pode ficar incompleto.</p>}
                {(analysis.ageLimit ?? 0) >= 18 && <p>Conteúdo com restrição de idade — pode exigir login (não suportado).</p>}
                {analysis.availability === 'needs_auth' && <p>Este conteúdo exige autenticação na plataforma.</p>}
              </div>
            </div>
          )}

          {analysis.description && (
            <details className="group rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:text-white/80">
                Descrição
              </summary>
              <p className="max-h-32 overflow-y-auto whitespace-pre-wrap px-3 pb-3 text-xs leading-relaxed text-white/55">
                {analysis.description}
              </p>
            </details>
          )}

          {analysis.kind === 'playlist' && analysis.entries && analysis.entries.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="border-b border-white/[0.06] px-3 py-2 text-xs font-medium text-white/50">
                Primeiros vídeos da playlist
              </p>
              <ul className="max-h-44 overflow-y-auto">
                {analysis.entries.map((e, i) => (
                  <li key={e.id ?? i} className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/65">
                    <span className="w-5 shrink-0 text-right text-white/30">{i + 1}.</span>
                    <span className="line-clamp-1 flex-1">{e.title}</span>
                    {e.duration !== undefined && (
                      <span className="shrink-0 text-white/35">{formatDuration(e.duration)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
