// Espelho dos tipos do backend (server/src/types.ts)

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
  langs: string;
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
  full: boolean;
  items: string;
  limit: number;
  skipDownloaded: boolean;
}

export interface DownloadOptions {
  preset: PresetId;
  container: Container;
  vcodec: VideoCodec;
  quality: QualityCap;
  fps: FpsMode;
  hdr: HdrMode;
  forceH264: boolean;
  audioOnly: boolean;
  audioFormat: AudioFormat;
  audioQuality: AudioQuality;
  normalizeAudio: boolean;
  allAudioTracks: boolean;
  audioLang: string;
  subtitles: SubtitleOptions;
  metadata: MetadataOptions;
  playlist: PlaylistOptions;
  outputTemplate: string;
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
  progress: number;
  speed?: number;
  eta?: number;
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
  uploadDate?: string;
  viewCount?: number;
  likeCount?: number;
  description?: string;
  thumbnail?: string;
  maxHeight?: number;
  maxFps?: number;
  vcodecs?: string[];
  estimatedSize?: number;
  isLive?: boolean;
  ageLimit?: number;
  availability?: string;
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
  platform: string;
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

export interface ProgressEvent {
  id: string;
  status: JobStatus;
  progress: number;
  speed?: number;
  eta?: number;
  downloadedBytes?: number;
  totalBytes?: number;
  playlistIndex?: number;
  playlistCount?: number;
}
