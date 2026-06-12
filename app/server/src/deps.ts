import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { BIN_DIR } from './config';
import { BinaryStatus } from './types';

const isWin = process.platform === 'win32';

interface ResolvedBinaries {
  ytdlp: BinaryStatus;
  ffmpeg: BinaryStatus;
  aria2c: BinaryStatus;
}

let cache: ResolvedBinaries | null = null;

function probe(cmd: string, args: string[]): { ok: boolean; version?: string } {
  try {
    const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 10000, windowsHide: true });
    if (r.error || r.status !== 0) return { ok: false };
    const out = (r.stdout || r.stderr || '').split(/\r?\n/)[0].trim();
    return { ok: true, version: out.slice(0, 80) };
  } catch {
    return { ok: false };
  }
}

function resolveBinary(name: string, envPath: string | undefined, versionArgs: string[]): BinaryStatus {
  const candidates: string[] = [];
  if (envPath && envPath.trim() !== '') candidates.push(path.resolve(envPath.trim()));
  candidates.push(path.join(BIN_DIR, isWin ? `${name}.exe` : name));
  candidates.push(name); // PATH do sistema

  for (const candidate of candidates) {
    // caminhos explícitos precisam existir; nome puro deixamos o SO resolver
    if ((candidate.includes(path.sep) || candidate.includes('/')) && !fs.existsSync(candidate)) continue;
    const r = probe(candidate, versionArgs);
    if (r.ok) return { found: true, path: candidate, version: cleanVersion(name, r.version) };
  }
  return { found: false };
}

function cleanVersion(name: string, v?: string): string | undefined {
  if (!v) return undefined;
  if (name === 'ffmpeg') {
    const m = v.match(/ffmpeg version (\S+)/);
    return m ? m[1] : v;
  }
  if (name === 'aria2c') {
    const m = v.match(/aria2 version (\S+)/);
    return m ? m[1] : v;
  }
  return v;
}

export function checkBinaries(force = false): ResolvedBinaries {
  if (cache && !force) return cache;
  cache = {
    ytdlp: resolveBinary('yt-dlp', process.env.YTDLP_PATH, ['--version']),
    ffmpeg: resolveBinary('ffmpeg', process.env.FFMPEG_PATH, ['-version']),
    aria2c: resolveBinary('aria2c', undefined, ['--version']),
  };
  return cache;
}

export function ytdlpPath(): string | null {
  const b = checkBinaries();
  return b.ytdlp.found ? b.ytdlp.path! : null;
}

export function ffmpegDir(): string | null {
  const b = checkBinaries();
  if (!b.ffmpeg.found || !b.ffmpeg.path) return null;
  // --ffmpeg-location aceita o diretório ou o binário; se for só "ffmpeg" (PATH), não precisamos passar nada
  return b.ffmpeg.path.includes(path.sep) ? path.dirname(b.ffmpeg.path) : null;
}
