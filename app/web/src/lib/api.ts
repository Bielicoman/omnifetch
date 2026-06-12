import {
  AnalyzeResult, DownloadOptions, HistoryEntry, Job, Settings, SystemStatus,
} from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? `Erro ${res.status}`);
  }
  return body as T;
}

export const api = {
  getStatus: (refresh = false) =>
    request<SystemStatus>(`/status${refresh ? '?refresh=1' : ''}`),

  analyze: (url: string) =>
    request<AnalyzeResult>('/analyze', { method: 'POST', body: JSON.stringify({ url }) }),

  download: (urls: string[], options: DownloadOptions, meta?: { title?: string; thumbnail?: string; uploader?: string }) =>
    request<{ jobs: Job[] }>('/download', { method: 'POST', body: JSON.stringify({ urls, options, meta }) }),

  previewCommand: (url: string, options: DownloadOptions) =>
    request<{ command: string }>('/preview-command', { method: 'POST', body: JSON.stringify({ url, options }) }),

  getQueue: () => request<{ jobs: Job[] }>('/queue'),
  cancelJob: (id: string) => request<{ ok: boolean }>(`/jobs/${id}/cancel`, { method: 'POST' }),
  retryJob: (id: string) => request<{ ok: boolean }>(`/jobs/${id}/retry`, { method: 'POST' }),
  removeJob: (id: string) => request<{ ok: boolean }>(`/jobs/${id}/remove`, { method: 'POST' }),
  clearFinished: () => request<{ ok: boolean }>('/jobs/clear-finished', { method: 'POST' }),
  getJobLog: (id: string) => request<{ log: string[] }>(`/jobs/${id}/log`),
  openFile: (id: string) => request<{ ok: boolean }>(`/jobs/${id}/open-file`, { method: 'POST' }),
  openDownloadsFolder: () => request<{ ok: boolean }>('/open-downloads-folder', { method: 'POST' }),

  getHistory: () => request<{ history: HistoryEntry[] }>('/history'),
  clearHistory: () => request<{ ok: boolean }>('/history', { method: 'DELETE' }),
  redownload: (id: string) => request<{ job: Job }>(`/history/${id}/redownload`, { method: 'POST' }),

  getSettings: () => request<Settings>('/settings'),
  updateSettings: (s: Partial<Settings>) =>
    request<Settings>('/settings', { method: 'PUT', body: JSON.stringify(s) }),

  shutdown: () =>
    request<{ ok: boolean }>('/shutdown', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-omnifetch': '1' } }),
};
