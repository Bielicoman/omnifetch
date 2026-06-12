// Tipos centrais do OMNIFETCH (backend).
// O frontend mantém um espelho destes tipos em web/src/lib/types.ts.

export type PresetId =
  | 'best_mp4_h264'
  | 'mp4_4k'
  | 'mp4_1080p'
  | 'mp4_720p'
  | 'audio_mp3_320'
  | 'audio_m4a_best'
  | 'audio_wav'
  | 'mkv_original'
  | 'webm_original'
  | 'archive_full';

export type Container = 'mp4' | 'mkv' | 'webm' | 'mov' | 'avi';
export type VideoCodec = 'h264' | 'h265' | 'vp9' | 'av1' | 'copy';
export type QualityCap = 'best' | '2160' | '1440' | '1080' | '720' | '480';
export type FpsMode = 'original' | '60' | '30';
export type HdrMode = 'auto' | 'prefer-hdr' | 'prefer-sdr';
export type AudioFormat = 'best' | 'mp3' | 'm4a' | 'wav' | 'flac' | 'opus' | 'aac' | 'ogg';
export type AudioQuality = 'best' | '320' | '256' | '192' | '128';
export type SubFormat = 'srt' | 'vtt' | 'ass';

export interface SubtitleOptions {
  enabled: boolean;
  auto: boolean;
  langs: string; // ex.: "pt,pt-BR,en" — validado no backend
  format: SubFormat;
  embed: boolean;
  separateFile: boolean;
}

export interface MetadataOptions {
  writeThumbnail: boolean;
  embedThumbnail: boolean;
  writeDescription: boolean;
  writeInfoJson: boolean;
  embedMetadata: boolean;
  embedChapters: boolean;
  writeComments: boolean;
}

export interface PlaylistOptions {
  full: boolean;          // baixar playlist/canal inteiro
  items: string;          // intervalo ex.: "1-10,15" (validado)
  limit: number;          // 0 = sem limite; N = primeiros N vídeos
  skipDownloaded: boolean; // usa --download-archive
}

export interface DownloadOptions {
  preset: PresetId;
  // Vídeo
  container: Container;
  vcodec: VideoCodec;
  quality: QualityCap;
  fps: FpsMode;
  hdr: HdrMode;
  forceH264: boolean; // recodifica com libx264 (lento, compatibilidade máxima)
  // Áudio
  audioOnly: boolean;
  audioFormat: AudioFormat;
  audioQuality: AudioQuality;
  normalizeAudio: boolean;
  allAudioTracks: boolean;
  audioLang: string; // ex.: "pt" — validado
  // Legendas / metadados / playlist
  subtitles: SubtitleOptions;
  metadata: MetadataOptions;
  playlist: PlaylistOptions;
  // Saída
  outputTemplate: string; // validado contra whitelist
  useAria2: boolean;
}

export type JobStatus =
  | 'queued'
  | 'analyzing'
  | 'downloading'
  | 'converting'
  | 'merging'
  | 'completed'
  | 'error'
  | 'canceled';

export interface Job {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
  uploader?: string;
  status: JobStatus;
  progress: number; // 0–100
  speed?: number;   // bytes/s
  eta?: number;     // segundos
  downloadedBytes?: number;
  totalBytes?: number;
  playlistIndex?: number;
  playlistCount?: number;
  filePath?: string;
  error?: string;
  createdAt: number;
  finishedAt?: number;
  options: DownloadOptions;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title?: string;
  uploader?: string;
  thumbnail?: string;
  filePath?: string;
  status: 'completed' | 'error' | 'canceled';
  presetLabel: string;
  finishedAt: number;
  options: DownloadOptions;
}

export interface AnalyzeEntry {
  id?: string;
  title?: string;
  duration?: number;
  url?: string;
  thumbnail?: string;
  uploader?: string;
}

export interface AnalyzeResult {
  kind: 'video' | 'playlist';
  url: string;
  platform: string;
  title?: string;
  uploader?: string;
  channelUrl?: string;
  duration?: number;
  uploadDate?: string; // YYYYMMDD
  viewCount?: number;
  likeCount?: number;
  description?: string;
  thumbnail?: string;
  maxHeight?: number;
  maxFps?: number;
  vcodecs?: string[];
  estimatedSize?: number; // bytes, melhor vídeo + melhor áudio
  isLive?: boolean;
  ageLimit?: number;
  availability?: string;
  // playlist
  entryCount?: number;
  entries?: AnalyzeEntry[];
}

export interface BinaryStatus {
  found: boolean;
  path?: string;
  version?: string;
}

export interface SystemStatus {
  appVersion: string;
  platform: NodeJS.Platform;
  ytdlp: BinaryStatus;
  ffmpeg: BinaryStatus;
  aria2c: BinaryStatus;
  downloadDir: string;
  lanMode: boolean;
  lanUrl?: string;
}

export interface Settings {
  downloadDir: string;
  maxConcurrent: number;
  openFolderAfter: boolean;
  outputTemplate: string;
  useAria2: boolean;
}
