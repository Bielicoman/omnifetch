import fs from 'fs';
import os from 'os';
import path from 'path';

// Carrega .env simples (sem dependência externa) se existir na raiz do projeto.
const ROOT = path.resolve(__dirname, '..', '..');
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

export const APP_VERSION = '1.0.0';
export const PROJECT_ROOT = ROOT;
export const DATA_DIR = path.join(ROOT, 'data');
export const BIN_DIR = path.join(ROOT, 'bin');
export const WEB_DIST = path.join(ROOT, 'web', 'dist');

export const PORT = clampInt(process.env.PORT, 4777, 1024, 65535);
export const LAN_MODE = process.env.LAN_MODE === 'true';
export const HOST = LAN_MODE ? '0.0.0.0' : (process.env.HOST || '127.0.0.1');
export const NO_OPEN = process.env.NO_OPEN === 'true';

// Opt-in para redes corporativas com inspeção TLS (proxy/antivírus que
// reassina certificados). Desativa a verificação de certificado no yt-dlp.
// Só ative se a análise falhar com "CERTIFICATE_VERIFY_FAILED".
export const ALLOW_INSECURE_SSL = process.env.ALLOW_INSECURE_SSL === 'true';

export const DEFAULT_DOWNLOAD_DIR =
  process.env.DOWNLOAD_DIR && process.env.DOWNLOAD_DIR.trim() !== ''
    ? path.resolve(process.env.DOWNLOAD_DIR)
    : path.join(os.homedir(), 'Downloads', 'OMNIFETCH');

export const DEFAULT_MAX_CONCURRENT = clampInt(process.env.MAX_CONCURRENT, 2, 1, 6);
export const DEFAULT_OUTPUT_TEMPLATE = '%(title)s [%(id)s].%(ext)s';

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

ensureDir(DATA_DIR);

function clampInt(raw: string | undefined, def: number, min: number, max: number): number {
  const n = parseInt(raw ?? '', 10);
  if (Number.isNaN(n)) return def;
  return Math.min(max, Math.max(min, n));
}

/** Primeiro IPv4 não interno — usado para mostrar a URL de acesso pelo celular no modo LAN. */
export function localIp(): string | undefined {
  const nets = os.networkInterfaces();
  for (const list of Object.values(nets)) {
    for (const net of list ?? []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return undefined;
}
