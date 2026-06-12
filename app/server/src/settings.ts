import fs from 'fs';
import path from 'path';
import {
  DATA_DIR,
  DEFAULT_DOWNLOAD_DIR,
  DEFAULT_MAX_CONCURRENT,
  DEFAULT_OUTPUT_TEMPLATE,
  ensureDir,
} from './config';
import { sanitizeOutputTemplate } from './security';
import { Settings } from './types';

const FILE = path.join(DATA_DIR, 'settings.json');

let current: Settings | null = null;

function defaults(): Settings {
  return {
    downloadDir: DEFAULT_DOWNLOAD_DIR,
    maxConcurrent: DEFAULT_MAX_CONCURRENT,
    openFolderAfter: false,
    outputTemplate: DEFAULT_OUTPUT_TEMPLATE,
    useAria2: false,
  };
}

export function getSettings(): Settings {
  if (current) return current;
  current = defaults();
  try {
    if (fs.existsSync(FILE)) {
      const saved = JSON.parse(fs.readFileSync(FILE, 'utf8'));
      current = { ...current, ...sanitize(saved) };
    }
  } catch {
    // arquivo corrompido — segue com padrões
  }
  ensureDir(current.downloadDir);
  return current;
}

export function updateSettings(raw: unknown): Settings {
  const next = { ...getSettings(), ...sanitize(raw) };
  ensureDir(next.downloadDir);
  current = next;
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

function sanitize(raw: unknown): Partial<Settings> {
  if (typeof raw !== 'object' || raw === null) return {};
  const o = raw as Record<string, any>;
  const out: Partial<Settings> = {};
  if (typeof o.downloadDir === 'string' && o.downloadDir.trim() !== '') {
    const dir = path.resolve(o.downloadDir.trim());
    // precisa ser um caminho absoluto plausível, nunca dentro de pastas de sistema
    if (path.isAbsolute(dir)) out.downloadDir = dir;
  }
  if (Number.isInteger(o.maxConcurrent) && o.maxConcurrent >= 1 && o.maxConcurrent <= 6) {
    out.maxConcurrent = o.maxConcurrent;
  }
  if (typeof o.openFolderAfter === 'boolean') out.openFolderAfter = o.openFolderAfter;
  if (typeof o.useAria2 === 'boolean') out.useAria2 = o.useAria2;
  if (typeof o.outputTemplate === 'string') {
    const t = sanitizeOutputTemplate(o.outputTemplate);
    if (t) out.outputTemplate = t;
  }
  return out;
}
