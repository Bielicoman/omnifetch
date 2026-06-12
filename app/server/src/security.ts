import path from 'path';

/**
 * Camada de segurança: tudo que vem do frontend passa por aqui antes de
 * virar argumento de processo. Nunca usamos shell — apenas spawn com array
 * de argumentos — e nenhuma string do usuário vira flag livre do yt-dlp.
 */

/** Aceita apenas http/https e rejeita strings que pareçam flags. */
export function validateUrl(raw: string): string | null {
  const value = raw.trim();
  if (value === '' || value.startsWith('-')) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.hostname === '') return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Lista de códigos de idioma tipo "pt,pt-BR,en". */
export function sanitizeLangList(raw: string): string | null {
  const value = raw.trim();
  if (value === '') return null;
  if (!/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})?(\s*,\s*[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})?)*$/.test(value)) return null;
  return value.split(',').map((s) => s.trim()).join(',');
}

/** Intervalo de playlist tipo "1-10,15,20-25". */
export function sanitizePlaylistItems(raw: string): string | null {
  const value = raw.trim();
  if (value === '') return null;
  if (!/^\d+(-\d+)?(\s*,\s*\d+(-\d+)?)*$/.test(value)) return null;
  return value.replace(/\s+/g, '');
}

const TEMPLATE_TOKENS = [
  'title', 'id', 'ext', 'uploader', 'channel', 'upload_date',
  'playlist_index', 'playlist_title', 'resolution', 'height', 'fps',
];

/**
 * Modelo de nome de arquivo: permite apenas tokens %(campo)s conhecidos e
 * caracteres seguros. Bloqueia separadores de caminho e "..".
 */
export function sanitizeOutputTemplate(raw: string): string | null {
  const value = raw.trim();
  if (value === '' || value.length > 180) return null;
  if (/[\\/:*?"<>|]/.test(value)) return null;
  if (value.includes('..') || value.startsWith('.') || value.startsWith('-')) return null;
  if (!value.includes('%(ext)s')) return null;
  // todo token %(...) precisa estar na whitelist
  const tokens = value.match(/%\(([^)]*)\)/g) ?? [];
  for (const t of tokens) {
    const name = t.slice(2, -1).split('.')[0].split('+')[0];
    if (!TEMPLATE_TOKENS.includes(name)) return null;
  }
  // depois de remover tokens, só sobra texto inofensivo
  const rest = value.replace(/%\([^)]*\)[sd0-9]*/g, '');
  if (/%/.test(rest)) return null;
  return value;
}

/** Garante que `target` está dentro de `baseDir` (bloqueia path traversal). */
export function isInsideDir(baseDir: string, target: string): boolean {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(target);
  const rel = path.relative(base, resolved);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
