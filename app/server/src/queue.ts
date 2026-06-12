import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import readline from 'readline';
import { nanoid } from 'nanoid';
import { buildArgs } from './args';
import { ytdlpPath } from './deps';
import { broadcast } from './events';
import { addHistory } from './history';
import { PRESETS } from './presets';
import { getSettings } from './settings';
import { DownloadOptions, Job, JobStatus } from './types';

const MAX_LOG_LINES = 600;

interface InternalJob extends Job {
  log: string[];
  child?: ChildProcess;
  killed?: boolean;
  lastBroadcast?: number;
  titleFromMeta?: boolean;
}

const jobs = new Map<string, InternalJob>();
let order: string[] = []; // ordem de criação, para exibição estável

export function listJobs(): Job[] {
  return order.map((id) => publicJob(jobs.get(id)!)).filter(Boolean);
}

export function getJobLog(id: string): string[] | null {
  const j = jobs.get(id);
  return j ? j.log : null;
}

export function getJob(id: string): Job | null {
  const j = jobs.get(id);
  return j ? publicJob(j) : null;
}

export function enqueue(url: string, options: DownloadOptions, meta?: { title?: string; thumbnail?: string; uploader?: string }): Job {
  const job: InternalJob = {
    id: nanoid(10),
    url,
    title: meta?.title,
    thumbnail: meta?.thumbnail,
    uploader: meta?.uploader,
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
    options,
    log: [],
    titleFromMeta: typeof meta?.title === 'string' && meta.title !== '',
  };
  jobs.set(job.id, job);
  order.push(job.id);
  notifyQueue();
  tick();
  return publicJob(job);
}

export function cancelJob(id: string): boolean {
  const j = jobs.get(id);
  if (!j) return false;
  if (j.status === 'queued') {
    j.status = 'canceled';
    j.finishedAt = Date.now();
    notifyQueue();
    return true;
  }
  if (isActive(j.status) && j.child) {
    j.killed = true;
    killTree(j.child);
    return true;
  }
  return false;
}

export function retryJob(id: string): boolean {
  const j = jobs.get(id);
  if (!j || isActive(j.status) || j.status === 'queued') return false;
  j.status = 'queued';
  j.progress = 0;
  j.error = undefined;
  j.speed = undefined;
  j.eta = undefined;
  j.finishedAt = undefined;
  j.log.push('--- nova tentativa ---');
  notifyQueue();
  tick();
  return true;
}

export function removeJob(id: string): boolean {
  const j = jobs.get(id);
  if (!j) return false;
  if (isActive(j.status)) return false; // cancele antes de remover
  jobs.delete(id);
  order = order.filter((x) => x !== id);
  notifyQueue();
  return true;
}

export function clearFinished(): void {
  for (const id of [...order]) {
    const j = jobs.get(id);
    if (j && (j.status === 'completed' || j.status === 'error' || j.status === 'canceled')) {
      jobs.delete(id);
      order = order.filter((x) => x !== id);
    }
  }
  notifyQueue();
}

function isActive(s: JobStatus): boolean {
  return s === 'downloading' || s === 'converting' || s === 'merging' || s === 'analyzing';
}

function activeCount(): number {
  let n = 0;
  for (const j of jobs.values()) if (isActive(j.status)) n++;
  return n;
}

/** Dispara os próximos downloads respeitando o limite de simultâneos. */
export function tick(): void {
  const max = getSettings().maxConcurrent;
  for (const id of order) {
    if (activeCount() >= max) break;
    const j = jobs.get(id);
    if (j && j.status === 'queued') run(j);
  }
}

function run(job: InternalJob): void {
  const bin = ytdlpPath();
  if (!bin) {
    job.status = 'error';
    job.error = 'yt-dlp não encontrado. Instale e tente novamente.';
    job.finishedAt = Date.now();
    notifyQueue();
    return;
  }

  const settings = getSettings();
  const options = { ...job.options, useAria2: job.options.useAria2 || settings.useAria2 };
  const args = [...buildArgs(options, { downloadDir: settings.downloadDir }), '--', job.url];

  job.status = 'analyzing';
  job.log.push(`$ yt-dlp ${args.join(' ')}`);
  notifyQueue();

  const child = spawn(bin, args, { windowsHide: true });
  job.child = child;

  const handleLine = (line: string) => {
    if (line.trim() === '') return;
    pushLog(job, line);
    parseLine(job, line);
  };

  readline.createInterface({ input: child.stdout! }).on('line', handleLine);
  readline.createInterface({ input: child.stderr! }).on('line', (line) => {
    if (line.trim() === '') return;
    pushLog(job, line);
    if (line.startsWith('ERROR:')) {
      job.error = line.replace(/^ERROR:\s*/, '').slice(0, 300);
    }
  });

  child.on('error', (e) => {
    job.status = 'error';
    job.error = `Falha ao iniciar o yt-dlp: ${e.message}`;
    job.finishedAt = Date.now();
    job.child = undefined;
    notifyQueue();
    tick();
  });

  child.on('close', (code) => {
    job.child = undefined;
    if (job.killed) {
      job.status = 'canceled';
      job.error = undefined;
    } else if (code === 0) {
      job.status = 'completed';
      job.progress = 100;
      job.speed = undefined;
      job.eta = undefined;
    } else {
      job.status = 'error';
      if (!job.error) job.error = `O yt-dlp terminou com erro (código ${code}).`;
    }
    job.finishedAt = Date.now();

    addHistory({
      id: job.id,
      url: job.url,
      title: job.title,
      uploader: job.uploader,
      thumbnail: job.thumbnail,
      filePath: job.filePath,
      status: job.status as 'completed' | 'error' | 'canceled',
      presetLabel: PRESETS[job.options.preset]?.label ?? job.options.preset,
      finishedAt: job.finishedAt,
      options: job.options,
    });

    if (job.status === 'completed' && getSettings().openFolderAfter) {
      openPath(settings.downloadDir);
    }

    notifyQueue();
    tick();
  });
}

/** O yt-dlp imprime `NA` (sem aspas) para campos ausentes — converte para null antes do JSON.parse. */
function safeProgressJson(raw: string): any {
  return JSON.parse(raw.replace(/([:,[])\s*NA(?=\s*[,}\]])/g, '$1null'));
}

function parseLine(job: InternalJob, line: string): void {
  // Progresso de download em JSON (definido em args.ts)
  if (line.startsWith('OMNI_P:')) {
    try {
      const p = safeProgressJson(line.slice(7));
      const total = p.tb ?? p.tbe ?? null;
      job.status = 'downloading';
      job.downloadedBytes = p.db ?? job.downloadedBytes;
      job.totalBytes = total ?? job.totalBytes;
      job.speed = typeof p.sp === 'number' ? p.sp : undefined;
      job.eta = typeof p.eta === 'number' ? p.eta : undefined;
      if (typeof p.db === 'number' && typeof total === 'number' && total > 0) {
        job.progress = Math.min(99.9, (p.db / total) * 100);
      } else if (typeof p.p === 'string') {
        const pct = parseFloat(p.p);
        if (!Number.isNaN(pct)) job.progress = Math.min(99.9, pct);
      }
      throttledProgress(job);
    } catch {
      /* linha de progresso malformada — ignora */
    }
    return;
  }

  // Pós-processamento (merge/conversão)
  if (line.startsWith('OMNI_PP:')) {
    try {
      const p = safeProgressJson(line.slice(8));
      if (p.st === 'started' || p.st === 'processing') {
        job.status = p.pp === 'Merger' ? 'merging' : 'converting';
        job.speed = undefined;
        job.eta = undefined;
        notifyQueue();
      }
    } catch { /* ignora */ }
    return;
  }

  let m = line.match(/^\[download\] Downloading item (\d+) of (\d+)/);
  if (m) {
    job.playlistIndex = parseInt(m[1], 10);
    job.playlistCount = parseInt(m[2], 10);
    notifyQueue();
    return;
  }

  m = line.match(/^\[download\] Destination: (.+)$/);
  if (m) {
    job.filePath = m[1].replace(/\.part$/, '');
    if (!job.title) job.title = fileTitle(job.filePath);
    notifyQueue();
    return;
  }

  m = line.match(/^\[Merger\] Merging formats into "(.+)"$/);
  if (m) {
    job.status = 'merging';
    job.filePath = m[1];
    if (!job.titleFromMeta) job.title = fileTitle(job.filePath);
    notifyQueue();
    return;
  }

  m = line.match(/^\[(ExtractAudio|VideoConvertor|VideoRemuxer)\] Destination: (.+)$/);
  if (m) {
    job.status = 'converting';
    job.filePath = m[2];
    if (!job.titleFromMeta) job.title = fileTitle(job.filePath);
    notifyQueue();
    return;
  }

  m = line.match(/^\[download\] (.+) has already been downloaded/);
  if (m) {
    job.filePath = m[1];
    job.progress = 100;
    notifyQueue();
  }
}

function fileTitle(p: string): string {
  const base = p.split(/[\\/]/).pop() ?? p;
  // remove a extensão e sufixos de formato intermediário do yt-dlp (.f137, .fhls-2644…)
  return base.replace(/\.[a-z0-9]+$/i, '').replace(/\.f[\w-]+$/i, '');
}

function pushLog(job: InternalJob, line: string): void {
  job.log.push(line);
  if (job.log.length > MAX_LOG_LINES) job.log.splice(0, job.log.length - MAX_LOG_LINES);
}

function throttledProgress(job: InternalJob): void {
  const now = Date.now();
  if (job.lastBroadcast && now - job.lastBroadcast < 250) return;
  job.lastBroadcast = now;
  broadcast('progress', {
    id: job.id,
    status: job.status,
    progress: Math.round(job.progress * 10) / 10,
    speed: job.speed,
    eta: job.eta,
    downloadedBytes: job.downloadedBytes,
    totalBytes: job.totalBytes,
    playlistIndex: job.playlistIndex,
    playlistCount: job.playlistCount,
  });
}

function notifyQueue(): void {
  broadcast('jobs', listJobs());
}

function publicJob(j: InternalJob): Job {
  const { log: _log, child: _child, killed: _killed, lastBroadcast: _lb, ...pub } = j;
  return pub;
}

/** Mata o processo e os filhos (ffmpeg) — no Windows via taskkill /T. */
function killTree(child: ChildProcess): void {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
  } else {
    try {
      child.kill('SIGTERM');
    } catch { /* já encerrado */ }
  }
}

/** Abre arquivo ou pasta no gerenciador do sistema. */
export function openPath(target: string, revealFile = false): void {
  if (process.platform === 'win32') {
    if (revealFile) spawn('explorer', ['/select,', target], { windowsHide: true });
    else spawn('explorer', [target], { windowsHide: true });
  } else if (process.platform === 'darwin') {
    if (revealFile) spawn('open', ['-R', target]);
    else spawn('open', [target]);
  } else {
    spawn('xdg-open', [revealFile ? path.dirname(target) : target]);
  }
}
