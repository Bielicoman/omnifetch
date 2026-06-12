import { DownloadOptions, PresetId } from './types';

export const DEFAULT_OUTPUT_TEMPLATE = '%(title)s [%(id)s].%(ext)s';

export function defaultOptions(): DownloadOptions {
  return {
    preset: 'best_mp4_h264',
    container: 'mp4',
    vcodec: 'h264',
    quality: 'best',
    fps: 'original',
    hdr: 'auto',
    forceH264: false,
    audioOnly: false,
    audioFormat: 'best',
    audioQuality: 'best',
    normalizeAudio: false,
    allAudioTracks: false,
    audioLang: '',
    subtitles: { enabled: false, auto: false, langs: 'pt,pt-BR,en', format: 'srt', embed: false, separateFile: true },
    metadata: {
      writeThumbnail: false,
      embedThumbnail: false,
      writeDescription: false,
      writeInfoJson: false,
      embedMetadata: true,
      embedChapters: false,
      writeComments: false,
    },
    playlist: { full: false, items: '', limit: 0, skipDownloaded: false },
    outputTemplate: DEFAULT_OUTPUT_TEMPLATE,
    useAria2: false,
  };
}

export interface PresetInfo {
  id: PresetId;
  label: string;
  description: string;
  kind: 'video' | 'audio' | 'special';
  apply: (o: DownloadOptions) => void;
}

export const PRESET_LIST: PresetInfo[] = [
  {
    id: 'best_mp4_h264', label: 'Melhor MP4', description: 'H.264 • recomendado', kind: 'video',
    apply: (o) => { o.audioOnly = false; o.container = 'mp4'; o.vcodec = 'h264'; o.quality = 'best'; },
  },
  {
    id: 'mp4_1080p', label: '1080p MP4', description: 'Full HD • H.264', kind: 'video',
    apply: (o) => { o.audioOnly = false; o.container = 'mp4'; o.vcodec = 'h264'; o.quality = '1080'; },
  },
  {
    id: 'mp4_720p', label: '720p MP4', description: 'Leve e rápido', kind: 'video',
    apply: (o) => { o.audioOnly = false; o.container = 'mp4'; o.vcodec = 'h264'; o.quality = '720'; },
  },
  {
    id: 'mp4_4k', label: '4K MP4', description: 'Até 2160p', kind: 'video',
    apply: (o) => { o.audioOnly = false; o.container = 'mp4'; o.vcodec = 'h264'; o.quality = '2160'; },
  },
  {
    id: 'audio_mp3_320', label: 'Áudio MP3', description: '320 kbps', kind: 'audio',
    apply: (o) => { o.audioOnly = true; o.audioFormat = 'mp3'; o.audioQuality = '320'; },
  },
  {
    id: 'audio_wav', label: 'Áudio WAV', description: 'Para edição', kind: 'audio',
    apply: (o) => { o.audioOnly = true; o.audioFormat = 'wav'; o.audioQuality = 'best'; },
  },
  {
    id: 'audio_m4a_best', label: 'Áudio M4A', description: 'Melhor AAC', kind: 'audio',
    apply: (o) => { o.audioOnly = true; o.audioFormat = 'm4a'; o.audioQuality = 'best'; },
  },
  {
    id: 'mkv_original', label: 'MKV original', description: 'Sem conversão', kind: 'video',
    apply: (o) => { o.audioOnly = false; o.container = 'mkv'; o.vcodec = 'copy'; o.quality = 'best'; },
  },
  {
    id: 'archive_full', label: 'Modo completo', description: 'Tudo: vídeo, legendas, metadados', kind: 'special',
    apply: (o) => {
      o.audioOnly = false;
      o.container = 'mkv';
      o.vcodec = 'copy';
      o.quality = 'best';
      o.allAudioTracks = true;
      o.subtitles = { ...o.subtitles, enabled: true, auto: true, separateFile: true };
      o.metadata = {
        writeThumbnail: true,
        embedThumbnail: false,
        writeDescription: true,
        writeInfoJson: true,
        embedMetadata: true,
        embedChapters: true,
        writeComments: false,
      };
    },
  },
];

export function applyPreset(options: DownloadOptions, id: PresetId): DownloadOptions {
  const next: DownloadOptions = {
    ...options,
    subtitles: { ...options.subtitles },
    metadata: { ...options.metadata },
    playlist: { ...options.playlist },
  };
  next.preset = id;
  PRESET_LIST.find((p) => p.id === id)?.apply(next);
  return next;
}
