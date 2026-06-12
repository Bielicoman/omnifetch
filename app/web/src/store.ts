import { create } from 'zustand';
import { api } from './lib/api';
import { applyPreset, defaultOptions } from './lib/presets';
import {
  AnalyzeResult, DownloadOptions, HistoryEntry, Job, PresetId,
  ProgressEvent, Settings, SystemStatus,
} from './lib/types';

export interface Toast {
  id: number;
  kind: 'success' | 'error' | 'info';
  message: string;
}

interface AppState {
  // sistema
  status: SystemStatus | null;
  settings: Settings | null;
  // entrada / análise
  urlInput: string;
  analyzing: boolean;
  analysis: AnalyzeResult | null;
  analysisError: string | null;
  // opções
  options: DownloadOptions;
  // fila / histórico
  jobs: Job[];
  history: HistoryEntry[];
  // ui
  drawerOpen: boolean;
  settingsOpen: boolean;
  historyOpen: boolean;
  helpOpen: boolean;
  logJobId: string | null;
  toasts: Toast[];

  // ações
  init: () => Promise<void>;
  setUrlInput: (v: string) => void;
  clearInput: () => void;
  analyze: () => Promise<void>;
  startDownload: () => Promise<void>;
  selectPreset: (id: PresetId) => void;
  setOptions: (patch: Partial<DownloadOptions>) => void;
  resetOptions: () => void;
  setJobs: (jobs: Job[]) => void;
  applyProgress: (p: ProgressEvent) => void;
  setHistory: (h: HistoryEntry[]) => void;
  refreshStatus: () => Promise<void>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
  setDrawerOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setHistoryOpen: (v: boolean) => void;
  setHelpOpen: (v: boolean) => void;
  setLogJobId: (id: string | null) => void;
  toast: (kind: Toast['kind'], message: string) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 1;

export const useStore = create<AppState>((set, get) => ({
  status: null,
  settings: null,
  urlInput: '',
  analyzing: false,
  analysis: null,
  analysisError: null,
  options: defaultOptions(),
  jobs: [],
  history: [],
  drawerOpen: false,
  settingsOpen: false,
  historyOpen: false,
  helpOpen: false,
  logJobId: null,
  toasts: [],

  init: async () => {
    const results = await Promise.allSettled([
      api.getStatus(),
      api.getSettings(),
      api.getQueue(),
      api.getHistory(),
    ]);
    if (results[0].status === 'fulfilled') set({ status: results[0].value });
    if (results[1].status === 'fulfilled') set({ settings: results[1].value });
    if (results[2].status === 'fulfilled') set({ jobs: results[2].value.jobs });
    if (results[3].status === 'fulfilled') set({ history: results[3].value.history });
  },

  setUrlInput: (v) => set({ urlInput: v }),

  clearInput: () => set({ urlInput: '', analysis: null, analysisError: null }),

  analyze: async () => {
    const { urlInput, toast } = get();
    const lines = urlInput.split(/\r?\n/).map((l) => l.trim()).filter((l) => l !== '');
    if (lines.length === 0) {
      toast('info', 'Cole um link primeiro.');
      return;
    }
    set({ analyzing: true, analysis: null, analysisError: null });
    try {
      const result = await api.analyze(lines[0]);
      set({ analysis: result, analyzing: false });
      if (result.kind === 'playlist') {
        // sugere baixar a playlist completa
        set((s) => ({ options: { ...s.options, playlist: { ...s.options.playlist, full: true } } }));
      }
    } catch (e) {
      set({ analyzing: false, analysisError: e instanceof Error ? e.message : 'Erro ao analisar.' });
    }
  },

  startDownload: async () => {
    const { urlInput, options, analysis, toast } = get();
    const urls = urlInput.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^https?:\/\//i.test(l));
    if (urls.length === 0) {
      toast('info', 'Cole pelo menos um link válido (http/https).');
      return;
    }
    try {
      const meta = analysis && analysis.url === urls[0]
        ? { title: analysis.title, thumbnail: analysis.thumbnail, uploader: analysis.uploader }
        : undefined;
      const { jobs } = await api.download(urls, options, meta);
      toast('success', jobs.length === 1 ? 'Download adicionado à fila!' : `${jobs.length} downloads adicionados à fila!`);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Erro ao iniciar o download.');
    }
  },

  selectPreset: (id) => set((s) => ({ options: applyPreset(s.options, id) })),

  setOptions: (patch) => set((s) => ({ options: { ...s.options, ...patch } })),

  resetOptions: () => set({ options: defaultOptions() }),

  setJobs: (jobs) => set({ jobs }),

  applyProgress: (p) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === p.id ? { ...j, ...p } : j)),
    })),

  setHistory: (history) => set({ history }),

  refreshStatus: async () => {
    try {
      set({ status: await api.getStatus(true) });
    } catch {
      /* servidor fora do ar — o SSE vai reconectar */
    }
  },

  saveSettings: async (patch) => {
    try {
      const next = await api.updateSettings(patch);
      set({ settings: next });
      get().toast('success', 'Configurações salvas.');
      get().refreshStatus();
    } catch (e) {
      get().toast('error', e instanceof Error ? e.message : 'Erro ao salvar.');
    }
  },

  setDrawerOpen: (v) => set({ drawerOpen: v }),
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  setHistoryOpen: (v) => set({ historyOpen: v }),
  setHelpOpen: (v) => set({ helpOpen: v }),
  setLogJobId: (id) => set({ logJobId: id }),

  toast: (kind, message) => {
    const id = toastSeq++;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    setTimeout(() => get().dismissToast(id), 4500);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Conecta o SSE de progresso — chamado uma vez no App. */
export function connectEvents(): () => void {
  let es: EventSource | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    es = new EventSource('/api/events');
    es.addEventListener('jobs', (ev) => {
      try { useStore.getState().setJobs(JSON.parse((ev as MessageEvent).data)); } catch { /* ignora */ }
    });
    es.addEventListener('progress', (ev) => {
      try { useStore.getState().applyProgress(JSON.parse((ev as MessageEvent).data)); } catch { /* ignora */ }
    });
    es.addEventListener('history', (ev) => {
      try { useStore.getState().setHistory(JSON.parse((ev as MessageEvent).data)); } catch { /* ignora */ }
    });
    es.onerror = () => {
      es?.close();
      retryTimer = setTimeout(connect, 3000);
    };
  };

  connect();
  return () => {
    es?.close();
    if (retryTimer) clearTimeout(retryTimer);
  };
}
