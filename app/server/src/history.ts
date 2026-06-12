import fs from 'fs';
import path from 'path';
import { DATA_DIR } from './config';
import { broadcast } from './events';
import { HistoryEntry } from './types';

const FILE = path.join(DATA_DIR, 'history.json');
const MAX_ENTRIES = 200;

let entries: HistoryEntry[] | null = null;

export function getHistory(): HistoryEntry[] {
  if (entries) return entries;
  try {
    entries = fs.existsSync(FILE) ? (JSON.parse(fs.readFileSync(FILE, 'utf8')) as HistoryEntry[]) : [];
  } catch {
    entries = [];
  }
  return entries;
}

export function addHistory(entry: HistoryEntry): void {
  const list = getHistory();
  list.unshift(entry);
  if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
  persist();
  broadcast('history', list);
}

export function clearHistory(): void {
  entries = [];
  persist();
  broadcast('history', entries);
}

export function findHistory(id: string): HistoryEntry | undefined {
  return getHistory().find((e) => e.id === id);
}

function persist(): void {
  fs.writeFileSync(FILE, JSON.stringify(entries ?? [], null, 2), 'utf8');
}
