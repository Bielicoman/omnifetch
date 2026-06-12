import { Terminal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useStore } from '../store';
import { Modal } from './ui';

export function LogModal() {
  const logJobId = useStore((s) => s.logJobId);
  const setLogJobId = useStore((s) => s.setLogJobId);
  const jobs = useStore((s) => s.jobs);
  const [lines, setLines] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const job = jobs.find((j) => j.id === logJobId);
  const isActive = job && ['downloading', 'converting', 'merging', 'analyzing'].includes(job.status);

  useEffect(() => {
    if (!logJobId) {
      setLines([]);
      return;
    }
    let stop = false;
    const load = async () => {
      try {
        const { log } = await api.getJobLog(logJobId);
        if (!stop) setLines(log);
      } catch {
        if (!stop) setLines(['(logs indisponíveis)']);
      }
    };
    load();
    const timer = setInterval(load, 1500);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [logJobId]);

  useEffect(() => {
    if (isActive) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length, isActive]);

  return (
    <Modal
      open={logJobId !== null}
      onClose={() => setLogJobId(null)}
      title="Logs técnicos"
      icon={<Terminal size={17} className="text-omni" />}
      wide
    >
      <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-all rounded-xl border border-white/[0.07] bg-ink-950 p-3 font-mono text-[11px] leading-relaxed text-white/65">
        {lines.length > 0 ? lines.join('\n') : 'Sem logs ainda…'}
        <div ref={bottomRef} />
      </pre>
    </Modal>
  );
}
