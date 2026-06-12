export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || !isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatSpeed(bytesPerSec?: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '—';
  return `${formatBytes(bytesPerSec)}/s`;
}

export function formatEta(seconds?: number): string {
  if (seconds === undefined || seconds === null || !isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function formatDuration(seconds?: number): string {
  if (seconds === undefined || !isFinite(seconds) || seconds <= 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatCount(n?: number): string {
  if (n === undefined || !isFinite(n)) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} bi`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} mi`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} mil`;
  return String(n);
}

/** "20240315" → "15/03/2024" */
export function formatUploadDate(yyyymmdd?: string): string {
  if (!yyyymmdd || !/^\d{8}$/.test(yyyymmdd)) return '—';
  return `${yyyymmdd.slice(6, 8)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(0, 4)}`;
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Detecta o tipo de entrada colada pelo usuário. */
export function detectLinkKind(raw: string): 'empty' | 'invalid' | 'video' | 'playlist' | 'channel' | 'list' {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l !== '');
  if (lines.length === 0) return 'empty';
  if (lines.length > 1) return 'list';
  const url = lines[0];
  if (!/^https?:\/\//i.test(url)) return 'invalid';
  if (/[?&]list=|\/playlist\b|\/sets\//i.test(url)) return 'playlist';
  if (/youtube\.com\/(@|channel\/|c\/|user\/)|\/channel\b/i.test(url)) return 'channel';
  return 'video';
}

export function splitUrls(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^https?:\/\//i.test(l));
}
