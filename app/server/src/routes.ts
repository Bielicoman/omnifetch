import { Router } from 'express';
import fs from 'fs';
import { analyzeUrl, AnalyzeError } from './analyze';
import { commandPreview, normalizeOptions } from './args';
import { APP_VERSION, LAN_MODE, localIp, PORT } from './config';
import { checkBinaries } from './deps';
import { addClient } from './events';
import { clearHistory, findHistory, getHistory } from './history';
import {
  cancelJob, clearFinished, enqueue, getJob, getJobLog, listJobs,
  openPath, removeJob, retryJob, tick,
} from './queue';
import { isInsideDir, validateUrl } from './security';
import { getSettings, updateSettings } from './settings';
import { SystemStatus } from './types';

export const api = Router();

// ---------- status / sse ----------

api.get('/status', (req, res) => {
  const force = req.query.refresh === '1';
  const bins = checkBinaries(force);
  const settings = getSettings();
  const ip = localIp();
  const status: SystemStatus = {
    appVersion: APP_VERSION,
    platform: process.platform,
    ytdlp: bins.ytdlp,
    ffmpeg: bins.ffmpeg,
    aria2c: bins.aria2c,
    downloadDir: settings.downloadDir,
    lanMode: LAN_MODE,
    lanUrl: LAN_MODE && ip ? `http://${ip}:${PORT}` : undefined,
  };
  res.json(status);
});

api.get('/events', (_req, res) => addClient(res));

// ---------- análise ----------

api.post('/analyze', async (req, res) => {
  const url = typeof req.body?.url === 'string' ? req.body.url : '';
  try {
    const result = await analyzeUrl(url);
    res.json(result);
  } catch (e) {
    const msg = e instanceof AnalyzeError ? e.message : 'Erro inesperado ao analisar o link.';
    res.status(422).json({ error: msg });
  }
});

// ---------- downloads ----------

api.post('/download', (req, res) => {
  const rawUrls: unknown = req.body?.urls;
  const urls = (Array.isArray(rawUrls) ? rawUrls : [rawUrls])
    .filter((u): u is string => typeof u === 'string')
    .map((u) => validateUrl(u))
    .filter((u): u is string => u !== null);

  if (urls.length === 0) {
    res.status(400).json({ error: 'Nenhum link válido. Cole endereços http(s) completos.' });
    return;
  }
  if (urls.length > 100) {
    res.status(400).json({ error: 'Máximo de 100 links por vez.' });
    return;
  }

  const options = normalizeOptions(req.body?.options);
  const meta = typeof req.body?.meta === 'object' && req.body.meta !== null ? req.body.meta : {};
  const jobs = urls.map((u, i) =>
    enqueue(u, options, urls.length === 1 ? {
      title: typeof meta.title === 'string' ? meta.title.slice(0, 200) : undefined,
      thumbnail: typeof meta.thumbnail === 'string' ? meta.thumbnail.slice(0, 1000) : undefined,
      uploader: typeof meta.uploader === 'string' ? meta.uploader.slice(0, 120) : undefined,
    } : undefined),
  );
  res.json({ jobs });
});

api.post('/preview-command', (req, res) => {
  const url = validateUrl(typeof req.body?.url === 'string' ? req.body.url : '');
  if (!url) {
    res.status(400).json({ error: 'Link inválido.' });
    return;
  }
  const options = normalizeOptions(req.body?.options);
  const settings = getSettings();
  res.json({ command: commandPreview(options, { downloadDir: settings.downloadDir }, url) });
});

api.get('/queue', (_req, res) => res.json({ jobs: listJobs() }));

api.post('/jobs/clear-finished', (_req, res) => {
  clearFinished();
  res.json({ ok: true });
});

api.post('/jobs/:id/cancel', (req, res) => res.json({ ok: cancelJob(req.params.id) }));
api.post('/jobs/:id/retry', (req, res) => res.json({ ok: retryJob(req.params.id) }));
api.post('/jobs/:id/remove', (req, res) => res.json({ ok: removeJob(req.params.id) }));

api.get('/jobs/:id/log', (req, res) => {
  const log = getJobLog(req.params.id);
  if (!log) {
    res.status(404).json({ error: 'Download não encontrado.' });
    return;
  }
  res.json({ log });
});

api.post('/jobs/:id/open-file', (req, res) => {
  const job = getJob(req.params.id);
  const settings = getSettings();
  if (!job?.filePath || !isInsideDir(settings.downloadDir, job.filePath) || !fs.existsSync(job.filePath)) {
    res.status(404).json({ error: 'Arquivo não encontrado.' });
    return;
  }
  openPath(job.filePath, true);
  res.json({ ok: true });
});

api.post('/open-downloads-folder', (_req, res) => {
  const settings = getSettings();
  fs.mkdirSync(settings.downloadDir, { recursive: true });
  openPath(settings.downloadDir);
  res.json({ ok: true });
});

// ---------- histórico ----------

api.get('/history', (_req, res) => res.json({ history: getHistory() }));

api.delete('/history', (_req, res) => {
  clearHistory();
  res.json({ ok: true });
});

api.post('/history/:id/redownload', (req, res) => {
  const entry = findHistory(req.params.id);
  if (!entry) {
    res.status(404).json({ error: 'Item não encontrado no histórico.' });
    return;
  }
  const job = enqueue(entry.url, normalizeOptions(entry.options), {
    title: entry.title,
    thumbnail: entry.thumbnail,
    uploader: entry.uploader,
  });
  res.json({ job });
});

// ---------- encerrar o app ----------

// O cabeçalho customizado força preflight CORS, impedindo que páginas
// externas desliguem o app via requisição cross-origin.
api.post('/shutdown', (req, res) => {
  if (req.get('x-omnifetch') !== '1') {
    res.status(403).json({ error: 'Não autorizado.' });
    return;
  }
  res.json({ ok: true });
  console.log('OMNIFETCH encerrado pelo usuario.');
  setTimeout(() => process.exit(0), 400);
});

// ---------- configurações ----------

api.get('/settings', (_req, res) => res.json(getSettings()));

api.put('/settings', (req, res) => {
  try {
    const next = updateSettings(req.body);
    tick(); // maxConcurrent pode ter aumentado
    res.json(next);
  } catch {
    res.status(400).json({ error: 'Não foi possível salvar as configurações.' });
  }
});
