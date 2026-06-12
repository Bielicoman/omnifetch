import { DownloadOptions, PresetId } from './types';
import { DEFAULT_OUTPUT_TEMPLATE } from './config';

/** Opções padrão: MP4 H.264 na melhor qualidade, compatível com tudo. */
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

export interface PresetDef {
  id: PresetId;
  label: string;
  description: string;
  apply: (o: DownloadOptions) => void;
}

export const PRESETS: Record<PresetId, PresetDef> = {
  best_mp4_h264: {
    id: 'best_mp4_h264',
    label: 'Melhor qualidade MP4',
    description: 'MP4 H.264 — compatível com tudo',
    apply: (o) => { o.audioOnly = false; o.container = 'mp4'; o.vcodec = 'h264'; o.quality = 'best'; },
  },
  mp4_4k: {
    id: 'mp4_4k',
    label: '4K MP4',
    description: 'Até 2160p (pode usar VP9/AV1)',
    apply: (o) => { o.audioOnly = false; o.container = 'mp4'; o.vcodec = 'h264'; o.quality = '2160'; },
  },
  mp4_1080p: {
    id: 'mp4_1080p',
    label: '1080p MP4',
    description: 'Full HD em H.264',
    apply: (o) => { o.audioOnly = false; o.container = 'mp4'; o.vcodec = 'h264'; o.quality = '1080'; },
  },
  mp4_720p: {
    id: 'mp4_720p',
    label: '720p MP4',
    description: 'Leve e rápido',
    apply: (o) => { o.audioOnly = false; o.container = 'mp4'; o.vcodec = 'h264'; o.quality = '720'; },
  },
  audio_mp3_320: {
    id: 'audio_mp3_320',
    label: 'Áudio MP3',
    description: 'Somente áudio, MP3 320 kbps',
    apply: (o) => { o.audioOnly = true; o.audioFormat = 'mp3'; o.audioQuality = '320'; },
  },
  audio_m4a_best: {
    id: 'audio_m4a_best',
    label: 'Áudio M4A',
    description: 'Melhor áudio em M4A/AAC',
    apply: (o) => { o.audioOnly = true; o.audioFormat = 'm4a'; o.audioQuality = 'best'; },
  },
  audio_wav: {
    id: 'audio_wav',
    label: 'Áudio WAV',
    description: 'Sem compressão, para edição',
    apply: (o) => { o.audioOnly = true; o.audioFormat = 'wav'; o.audioQuality = 'best'; },
  },
  mkv_original: {
    id: 'mkv_original',
    label: 'MKV original',
    description: 'Codecs originais, sem conversão',
    apply: (o) => { o.audioOnly = false; o.container = 'mkv'; o.vcodec = 'copy'; o.quality = 'best'; },
  },
  webm_original: {
    id: 'webm_original',
    label: 'WEBM original',
    description: 'VP9/Opus sem conversão',
    apply: (o) => { o.audioOnly = false; o.container = 'webm'; o.vcodec = 'vp9'; o.quality = 'best'; },
  },
  archive_full: {
    id: 'archive_full',
    label: 'Modo completo',
    description: 'Vídeo, áudio, legendas, thumb e metadados',
    apply: (o) => {
      o.audioOnly = false;
      o.container = 'mkv';
      o.vcodec = 'copy';
      o.quality = 'best';
      o.allAudioTracks = true;
      o.subtitles = { ...o.subtitles, enabled: true, auto: true, embed: false, separateFile: true };
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
};

export function applyPreset(options: DownloadOptions, preset: PresetId): DownloadOptions {
  const next = { ...options, subtitles: { ...options.subtitles }, metadata: { ...options.metadata }, playlist: { ...options.playlist } };
  next.preset = preset;
  PRESETS[preset].apply(next);
  return next;
}
