import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Busboy from 'busboy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const STORAGE = path.resolve(__dirname, process.env.OMNIFETCH_STORAGE || './storage');
const SITE_DIR = path.resolve(__dirname, process.env.OMNIFETCH_SITE_DIR || '../site');
const YTDLP = process.env.YT_DLP_PATH || 'yt-dlp';
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const MAX_UPLOAD_MB = Number(process.env.OMNIFETCH_MAX_UPLOAD_MB || 2048);
const JOB_TTL_HOURS = Number(process.env.OMNIFETCH_JOB_TTL_HOURS || 6);

const jobs = new Map();
const processes = new Map();

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm'],
  ['.mkv', 'video/x-matroska'],
  ['.mov', 'video/quicktime'],
  ['.mp3', 'audio/mpeg'],
  ['.wav', 'audio/wav'],
  ['.flac', 'audio/flac'],
  ['.ogg', 'audio/ogg'],
  ['.opus', 'audio/opus'],
  ['.aac', 'audio/aac'],
  ['.m4a', 'audio/mp4'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.zip', 'application/zip'],
  ['.7z', 'application/x-7z-compressed'],
  ['.rar', 'application/vnd.rar'],
]);

await fsp.mkdir(STORAGE, { recursive: true });
setInterval(cleanOldJobs, 30 * 60 * 1000).unref();

function sendJson(res, data, status = 200) {
  const body = Buffer.from(JSON.stringify(data));
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
  });
  res.end(body);
}

function sendText(res, text, status = 200) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'access-control-allow-origin': '*',
  });
  res.end(text);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function isHttpUrl(value) {
  try {
    const u = new URL(String(value || '').trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function safeName(value, fallback = 'download') {
  const name = String(value || fallback)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
  return name || fallback;
}

function filenameFromDisposition(value) {
  const raw = String(value || '');
  const utf = raw.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf) return safeName(decodeURIComponent(utf[1]));
  const plain = raw.match(/filename="?([^";]+)"?/i);
  if (plain) return safeName(plain[1]);
  return '';
}

function filenameFromUrl(url) {
  try {
    const u = new URL(url);
    const base = decodeURIComponent(path.basename(u.pathname || ''));
    return safeName(base || 'download');
  } catch {
    return 'download';
  }
}

function makeJob(type, title) {
  const id = 'j' + randomUUID().replace(/-/g, '').slice(0, 12);
  const dir = path.join(STORAGE, id);
  const job = {
    id,
    type,
    title,
    dir,
    status: 'queued',
    progress: 0,
    error: null,
    outputFile: null,
    downloadUrl: null,
    log: [],
    createdAt: Date.now(),
    startedAt: null,
    endedAt: null,
  };
  jobs.set(id, job);
  return job;
}

function startDirectFileJob(req, job, url) {
  job.status = 'running';
  job.startedAt = Date.now();

  (async () => {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        headers: {
          'user-agent': 'OmniFetch Online Engine/1.0',
          'accept': '*/*',
        },
      });
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

      const fromHeader = filenameFromDisposition(response.headers.get('content-disposition'));
      const fileName = fromHeader || filenameFromUrl(response.url || url);
      const out = path.join(job.dir, fileName);
      const total = Number(response.headers.get('content-length') || 0);
      let done = 0;

      const progress = new TransformStream({
        transform(chunk, controller) {
          done += chunk.byteLength;
          if (total > 0) job.progress = Math.min(99, Math.round((done / total) * 100));
          controller.enqueue(chunk);
        },
      });

      await pipeline(
        Readable.fromWeb(response.body.pipeThrough(progress)),
        fs.createWriteStream(out)
      );

      job.outputFile = out;
      job.downloadUrl = publicFileUrl(req, job, out);
      job.progress = 100;
      job.status = 'done';
      job.endedAt = Date.now();
      log(job, `Arquivo salvo: ${fileName}`);
    } catch (err) {
      job.status = 'error';
      job.error = err.message || String(err);
      job.endedAt = Date.now();
    }
  })();
}

function log(job, line) {
  if (!line) return;
  job.log.push(String(line));
  if (job.log.length > 120) job.log.splice(0, job.log.length - 120);
  const match = String(line).match(/\[download\]\s+([0-9]+(?:\.[0-9]+)?)%/);
  if (match) job.progress = Number(match[1]);
}

function publicFileUrl(req, job, file) {
  const base = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
  return `${base}/files/${encodeURIComponent(job.id)}/${encodeURIComponent(path.basename(file))}`;
}

async function newestOutput(job) {
  const entries = await fsp.readdir(job.dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (/\.(part|ytdl|tmp|temp)$/i.test(e.name)) continue;
    const full = path.join(job.dir, e.name);
    const st = await fsp.stat(full);
    files.push({ full, size: st.size, mtime: st.mtimeMs });
  }
  files.sort((a, b) => b.mtime - a.mtime || b.size - a.size);
  return files[0]?.full || null;
}

function spawnJob(req, job, command, args) {
  job.status = 'running';
  job.startedAt = Date.now();
  const child = spawn(command, args, {
    cwd: job.dir,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  processes.set(job.id, child);

  child.stdout.on('data', chunk => chunk.toString('utf8').split(/\r?\n/).forEach(line => log(job, line)));
  child.stderr.on('data', chunk => chunk.toString('utf8').split(/\r?\n/).forEach(line => log(job, line)));

  child.on('error', err => {
    job.status = 'error';
    job.error = err.message;
    job.endedAt = Date.now();
    processes.delete(job.id);
  });

  child.on('close', async code => {
    job.endedAt = Date.now();
    processes.delete(job.id);
    if (code === 0) {
      job.outputFile = job.outputFile || await newestOutput(job);
      if (job.outputFile) {
        job.downloadUrl = publicFileUrl(req, job, job.outputFile);
        job.status = 'done';
        job.progress = 100;
      } else {
        job.status = 'error';
        job.error = 'processo terminou, mas nenhum arquivo foi gerado';
      }
    } else {
      job.status = 'error';
      job.error = `exit code ${code}`;
    }
  });
}

async function handleDownload(req, res) {
  const body = await readJson(req);
  const url = String(body.url || '').trim();
  if (!isHttpUrl(url)) return sendJson(res, { error: 'url invalida' }, 400);

  const mode = String(body.mode || body.downloadMode || 'video');
  const quality = String(body.quality || body.videoQuality || 'best');
  const audioFormat = String(body.audioFormat || 'mp3');

  const job = makeJob('download', url);
  await fsp.mkdir(job.dir, { recursive: true });

  if (mode === 'file') {
    startDirectFileJob(req, job, url);
    return sendJson(res, { jobId: job.id, engine: 'omnifetch-online-engine' });
  }

  const args = [
    '--newline',
    '--no-mtime',
    '--retries', '10',
    '--fragment-retries', '10',
    '--concurrent-fragments', '8',
    '--embed-metadata',
    '--embed-thumbnail',
    '--embed-chapters',
    '--no-overwrites',
    '--windows-filenames',
    '--no-playlist',
    '-o', '%(title).200s [%(id)s].%(ext)s',
  ];

  if (mode === 'audio') {
    args.push('-f', 'bestaudio/best', '--extract-audio', '--audio-format', audioFormat);
    if (audioFormat === 'mp3') args.push('--audio-quality', '320K');
  } else if (mode === 'mute') {
    args.push('-f', 'bestvideo*', '--remux-video', 'mp4');
  } else {
    const fmt = {
      '4320': 'bv*[height<=4320]+ba/b[height<=4320]',
      '2160': 'bv*[height<=2160]+ba/b[height<=2160]',
      '1440': 'bv*[height<=1440]+ba/b[height<=1440]',
      '1080': 'bv*[height<=1080]+ba/b[height<=1080]',
      '720': 'bv*[height<=720]+ba/b[height<=720]',
      '480': 'bv*[height<=480]+ba/b[height<=480]',
      '360': 'bv*[height<=360]+ba/b[height<=360]',
    }[quality] || 'bv*+ba/b';
    args.push('-f', fmt, '--remux-video', 'mp4');
  }
  args.push(url);

  spawnJob(req, job, YTDLP, args);
  sendJson(res, { jobId: job.id, engine: 'omnifetch-online-engine' });
}

const convertRecipes = {
  mp4: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'aac', '-b:a', '192k'],
  webm: ['-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-c:a', 'libopus'],
  mkv: ['-c:v', 'libx264', '-crf', '20', '-c:a', 'flac'],
  mov: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'aac'],
  gif: ['-vf', 'fps=12,scale=480:-1:flags=lanczos', '-loop', '0'],
  mp3: ['-vn', '-c:a', 'libmp3lame', '-b:a', '320k'],
  wav: ['-vn', '-c:a', 'pcm_s16le'],
  flac: ['-vn', '-c:a', 'flac'],
  ogg: ['-vn', '-c:a', 'libvorbis', '-q:a', '5'],
  opus: ['-vn', '-c:a', 'libopus', '-b:a', '128k'],
  aac: ['-vn', '-c:a', 'aac', '-b:a', '256k'],
  m4a: ['-vn', '-c:a', 'aac', '-b:a', '256k'],
  jpg: ['-vframes', '1', '-q:v', '2'],
  png: ['-vframes', '1'],
  webp: ['-vframes', '1', '-c:v', 'libwebp', '-q:v', '85'],
};

async function handleConvert(req, res) {
  const job = makeJob('convert', 'upload');
  await fsp.mkdir(job.dir, { recursive: true });
  const limits = { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 1 };
  const busboy = Busboy({ headers: req.headers, limits });
  let target = 'mp4';
  let inputPath = null;
  let originalName = 'arquivo';
  let fileWrite = null;

  busboy.on('field', (name, value) => {
    if (name === 'target') target = String(value || 'mp4').toLowerCase();
  });
  busboy.on('file', (_name, file, info) => {
    originalName = path.basename(info.filename || 'upload.bin').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    inputPath = path.join(job.dir, originalName);
    fileWrite = fsp.open(inputPath, 'w').then(handle => new Promise((resolve, reject) => {
      const stream = handle.createWriteStream();
      file.pipe(stream);
      stream.on('finish', async () => { await handle.close(); resolve(); });
      stream.on('error', reject);
      file.on('limit', () => reject(new Error(`arquivo maior que ${MAX_UPLOAD_MB} MB`)));
    }));
  });
  busboy.on('error', err => sendJson(res, { error: err.message }, 400));
  busboy.on('finish', async () => {
    try {
      if (fileWrite) await fileWrite;
      if (!inputPath) return sendJson(res, { error: 'arquivo ausente' }, 400);
      if (!convertRecipes[target]) return sendJson(res, { error: `formato ${target} nao suportado` }, 400);
      const base = path.parse(originalName).name || 'convertido';
      const out = path.join(job.dir, `${base}.${target}`);
      job.title = path.basename(out);
      job.outputFile = out;
      spawnJob(req, job, FFMPEG, ['-y', '-hide_banner', '-stats', '-i', inputPath, ...convertRecipes[target], out]);
      sendJson(res, { jobId: job.id, engine: 'omnifetch-online-engine' });
    } catch (err) {
      job.status = 'error';
      job.error = err.message;
      sendJson(res, { error: err.message }, 500);
    }
  });
  req.pipe(busboy);
}

async function serveFile(req, res, url) {
  const [, jobId, rawName] = url.pathname.match(/^\/files\/([^/]+)\/(.+)$/) || [];
  const job = jobs.get(decodeURIComponent(jobId || ''));
  if (!job || !job.outputFile) return sendText(res, 'Not found', 404);
  const name = decodeURIComponent(rawName || '');
  if (path.basename(job.outputFile) !== name) return sendText(res, 'Not found', 404);
  const stat = await fsp.stat(job.outputFile).catch(() => null);
  if (!stat) return sendText(res, 'Not found', 404);
  const type = mime.get(path.extname(job.outputFile).toLowerCase()) || 'application/octet-stream';
  res.writeHead(200, {
    'content-type': type,
    'content-length': stat.size,
    'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(job.outputFile))}`,
    'access-control-allow-origin': '*',
  });
  fs.createReadStream(job.outputFile).pipe(res);
}

async function serveStatic(res, url) {
  const safePath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const full = path.resolve(SITE_DIR, '.' + safePath);
  if (!full.startsWith(SITE_DIR)) return sendText(res, 'Forbidden', 403);
  const stat = await fsp.stat(full).catch(() => null);
  if (!stat?.isFile()) return sendText(res, 'Not found', 404);
  res.writeHead(200, {
    'content-type': mime.get(path.extname(full).toLowerCase()) || 'application/octet-stream',
    'content-length': stat.size,
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-embedder-policy': safePath.endsWith('app.html') || safePath.endsWith('app.js') ? 'require-corp' : 'unsafe-none',
  });
  fs.createReadStream(full).pipe(res);
}

async function cleanOldJobs() {
  const ttl = JOB_TTL_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt <= ttl) continue;
    const proc = processes.get(id);
    if (proc && !proc.killed) proc.kill('SIGTERM');
    processes.delete(id);
    jobs.delete(id);
    await fsp.rm(job.dir, { recursive: true, force: true }).catch(() => {});
  }
}

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
    res.setHeader('access-control-allow-headers', 'content-type,authorization');
    if (req.method === 'OPTIONS') return sendText(res, '', 204);

    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/api/info') {
      return sendJson(res, {
        engine: 'omnifetch-online-engine',
        version: '1.0.0',
        ytdlp: YTDLP,
        ffmpeg: FFMPEG,
        maxUploadMB: MAX_UPLOAD_MB,
      });
    }
    if (req.method === 'POST' && url.pathname === '/api/download') return handleDownload(req, res);
    if (req.method === 'POST' && url.pathname === '/api/convert') return handleConvert(req, res);
    if (req.method === 'GET' && /^\/api\/jobs\/[^/]+$/.test(url.pathname)) {
      const id = decodeURIComponent(url.pathname.split('/').pop());
      const job = jobs.get(id);
      if (!job) return sendJson(res, { error: 'job nao encontrado' }, 404);
      return sendJson(res, job);
    }
    if (req.method === 'GET' && url.pathname === '/api/jobs') {
      return sendJson(res, { jobs: [...jobs.values()] });
    }
    if (req.method === 'GET' && url.pathname.startsWith('/files/')) return serveFile(req, res, url);
    if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(res, url);
    return sendText(res, 'Method not allowed', 405);
  } catch (err) {
    return sendJson(res, { error: err.message || String(err) }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`OmniFetch Online Engine pronto em http://localhost:${PORT}`);
});
