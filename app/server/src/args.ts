import path from 'path';
import { ALLOW_INSECURE_SSL, DATA_DIR } from './config';
import { ffmpegDir, checkBinaries } from './deps';
import { defaultOptions, PRESETS } from './presets';
import {
  sanitizeLangList,
  sanitizeOutputTemplate,
  sanitizePlaylistItems,
} from './security';
import { AudioFormat, AudioQuality, Container, DownloadOptions, FpsMode, HdrMode, QualityCap, SubFormat, VideoCodec } from './types';

/**
 * Gerador central de argumentos do yt-dlp.
 * O frontend nunca envia flags — apenas um objeto de opções tipado,
 * que é normalizado aqui contra whitelists antes de virar argumentos.
 */

// Linhas de progresso em JSON, fáceis de parsear sem ambiguidade.
export const PROGRESS_TEMPLATE =
  'download:OMNI_P:{"p":%(progress._percent_str)j,"db":%(progress.downloaded_bytes)j,"tb":%(progress.total_bytes)j,"tbe":%(progress.total_bytes_estimate)j,"sp":%(progress.speed)j,"eta":%(progress.eta)j}';
export const PP_TEMPLATE =
  'postprocess:OMNI_PP:{"pp":%(progress.postprocessor)j,"st":%(progress.status)j}';

const CONTAINERS: Container[] = ['mp4', 'mkv', 'webm', 'mov', 'avi'];
const VCODECS: VideoCodec[] = ['h264', 'h265', 'vp9', 'av1', 'copy'];
const QUALITIES: QualityCap[] = ['best', '2160', '1440', '1080', '720', '480'];
const FPS_MODES: FpsMode[] = ['original', '60', '30'];
const HDR_MODES: HdrMode[] = ['auto', 'prefer-hdr', 'prefer-sdr'];
const AUDIO_FORMATS: AudioFormat[] = ['best', 'mp3', 'm4a', 'wav', 'flac', 'opus', 'aac', 'ogg'];
const AUDIO_QUALITIES: AudioQuality[] = ['best', '320', '256', '192', '128'];
const SUB_FORMATS: SubFormat[] = ['srt', 'vtt', 'ass'];

function pick<T>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);

/** Normaliza opções vindas do frontend: qualquer valor fora da whitelist cai no padrão. */
export function normalizeOptions(raw: unknown): DownloadOptions {
  const d = defaultOptions();
  if (typeof raw !== 'object' || raw === null) return d;
  const o = raw as Record<string, any>;
  const subs = (o.subtitles ?? {}) as Record<string, any>;
  const meta = (o.metadata ?? {}) as Record<string, any>;
  const pl = (o.playlist ?? {}) as Record<string, any>;
  return {
    preset: pick(o.preset, Object.keys(PRESETS) as DownloadOptions['preset'][], d.preset),
    container: pick(o.container, CONTAINERS, d.container),
    vcodec: pick(o.vcodec, VCODECS, d.vcodec),
    quality: pick(o.quality, QUALITIES, d.quality),
    fps: pick(o.fps, FPS_MODES, d.fps),
    hdr: pick(o.hdr, HDR_MODES, d.hdr),
    forceH264: bool(o.forceH264, d.forceH264),
    audioOnly: bool(o.audioOnly, d.audioOnly),
    audioFormat: pick(o.audioFormat, AUDIO_FORMATS, d.audioFormat),
    audioQuality: pick(o.audioQuality, AUDIO_QUALITIES, d.audioQuality),
    normalizeAudio: bool(o.normalizeAudio, d.normalizeAudio),
    allAudioTracks: bool(o.allAudioTracks, d.allAudioTracks),
    audioLang: typeof o.audioLang === 'string' ? (sanitizeLangList(o.audioLang) ?? '') : '',
    subtitles: {
      enabled: bool(subs.enabled, d.subtitles.enabled),
      auto: bool(subs.auto, d.subtitles.auto),
      langs: typeof subs.langs === 'string' ? (sanitizeLangList(subs.langs) ?? d.subtitles.langs) : d.subtitles.langs,
      format: pick(subs.format, SUB_FORMATS, d.subtitles.format),
      embed: bool(subs.embed, d.subtitles.embed),
      separateFile: bool(subs.separateFile, d.subtitles.separateFile),
    },
    metadata: {
      writeThumbnail: bool(meta.writeThumbnail, d.metadata.writeThumbnail),
      embedThumbnail: bool(meta.embedThumbnail, d.metadata.embedThumbnail),
      writeDescription: bool(meta.writeDescription, d.metadata.writeDescription),
      writeInfoJson: bool(meta.writeInfoJson, d.metadata.writeInfoJson),
      embedMetadata: bool(meta.embedMetadata, d.metadata.embedMetadata),
      embedChapters: bool(meta.embedChapters, d.metadata.embedChapters),
      writeComments: bool(meta.writeComments, d.metadata.writeComments),
    },
    playlist: {
      full: bool(pl.full, d.playlist.full),
      items: typeof pl.items === 'string' ? (sanitizePlaylistItems(pl.items) ?? '') : '',
      limit: Number.isInteger(pl.limit) && pl.limit >= 0 && pl.limit <= 10000 ? pl.limit : 0,
      skipDownloaded: bool(pl.skipDownloaded, d.playlist.skipDownloaded),
    },
    outputTemplate:
      typeof o.outputTemplate === 'string'
        ? (sanitizeOutputTemplate(o.outputTemplate) ?? d.outputTemplate)
        : d.outputTemplate,
    useAria2: bool(o.useAria2, d.useAria2),
  };
}

function formatArgs(o: DownloadOptions): string[] {
  const args: string[] = [];

  if (o.audioOnly) {
    const fmt = o.audioLang !== ''
      ? `bestaudio[language^=${o.audioLang.split(',')[0]}]/bestaudio/best`
      : 'bestaudio/best';
    args.push('-f', fmt, '-x');
    if (o.audioFormat !== 'best') args.push('--audio-format', o.audioFormat);
    args.push('--audio-quality', o.audioQuality === 'best' ? '0' : `${o.audioQuality}K`);
    if (o.normalizeAudio) {
      args.push('--postprocessor-args', 'ExtractAudio:-af loudnorm=I=-16:TP=-1.5:LRA=11');
    }
    return args;
  }

  // Seleção de formato de vídeo
  const audioPart = o.audioLang !== '' ? `ba[language^=${o.audioLang.split(',')[0]}]/ba` : 'ba';
  if (o.allAudioTracks) {
    args.push('--audio-multistreams', '-f', `bv*+mergeall[vcodec=none]/bv*+${audioPart}/b`);
  } else {
    args.push('-f', `bv*+${audioPart}/b`);
  }

  // Ordenação de formatos (-S): qualidade limitada > codec > fps > hdr
  const sort: string[] = [];
  if (o.hdr === 'prefer-hdr') sort.push('hdr');
  else if (o.hdr === 'prefer-sdr') sort.push('+hdr');

  const codecToken: Record<Exclude<VideoCodec, 'copy'>, string> = {
    h264: 'vcodec:h264', h265: 'vcodec:h265', vp9: 'vcodec:vp9', av1: 'vcodec:av01',
  };
  if (o.quality !== 'best') {
    // limite de resolução tem prioridade; codec desempata
    sort.push(`res:${o.quality}`);
    if (o.vcodec !== 'copy') sort.push(codecToken[o.vcodec]);
  } else {
    // compatibilidade primeiro (ex.: preset MP4 H.264), depois a maior resolução
    if (o.vcodec !== 'copy') sort.push(codecToken[o.vcodec]);
    sort.push('res');
  }
  if (o.fps === '60') sort.push('fps:60');
  else if (o.fps === '30') sort.push('fps:30');
  else sort.push('fps');
  if (sort.length > 0) args.push('-S', sort.join(','));

  // Container de saída
  if (o.vcodec === 'copy') args.push('--remux-video', o.container);
  else args.push('--merge-output-format', o.container);

  // Recodificação forçada para H.264 (compatibilidade máxima, lento)
  if (o.forceH264) {
    args.push(
      '--recode-video', 'mp4',
      '--postprocessor-args', 'VideoConvertor:-c:v libx264 -crf 18 -preset veryfast -c:a aac -b:a 192k',
    );
  }

  if (o.normalizeAudio) {
    args.push('--postprocessor-args', 'Merger:-af loudnorm=I=-16:TP=-1.5:LRA=11');
  }

  return args;
}

export interface BuildContext {
  downloadDir: string;
  forPreview?: boolean; // para o botão "copiar comando" — omite templates de progresso
}

/** Monta a lista completa de argumentos (sem a URL — ela entra depois de `--`). */
export function buildArgs(o: DownloadOptions, ctx: BuildContext): string[] {
  const args: string[] = [
    '--no-warnings',
    '--newline',
    '--continue',
    '--retries', '3',
    '--windows-filenames',
  ];

  if (ALLOW_INSECURE_SSL) args.push('--no-check-certificates');

  if (!ctx.forPreview) {
    args.push('--progress-template', PROGRESS_TEMPLATE);
    args.push('--progress-template', PP_TEMPLATE);
  }

  const ffDir = ffmpegDir();
  if (ffDir) args.push('--ffmpeg-location', ffDir);

  // Saída
  const template = o.playlist.full
    ? `%(playlist_title|OMNIFETCH)s${path.sep}%(playlist_index|)s - ${o.outputTemplate}`
    : o.outputTemplate;
  args.push('-P', ctx.downloadDir, '-o', template);

  // Playlist
  if (o.playlist.full) {
    args.push('--yes-playlist', '--ignore-errors');
    if (o.playlist.items !== '') args.push('--playlist-items', o.playlist.items);
    else if (o.playlist.limit > 0) args.push('--playlist-end', String(o.playlist.limit));
    if (o.playlist.skipDownloaded) {
      args.push('--download-archive', path.join(DATA_DIR, 'downloaded-archive.txt'));
    }
  } else {
    args.push('--no-playlist');
  }

  // Formato (vídeo/áudio)
  args.push(...formatArgs(o));

  // Legendas
  if (o.subtitles.enabled || o.subtitles.auto) {
    if (o.subtitles.enabled) args.push('--write-subs');
    if (o.subtitles.auto) args.push('--write-auto-subs');
    args.push('--sub-langs', o.subtitles.langs);
    args.push('--convert-subs', o.subtitles.format);
    if (o.subtitles.embed && !o.audioOnly) args.push('--embed-subs');
    if (!o.subtitles.separateFile && o.subtitles.embed) args.push('--no-write-subs');
  }

  // Metadados
  const m = o.metadata;
  if (m.writeThumbnail) args.push('--write-thumbnail');
  if (m.embedThumbnail) args.push('--embed-thumbnail');
  if (m.writeDescription) args.push('--write-description');
  if (m.writeInfoJson) args.push('--write-info-json');
  if (m.embedMetadata) args.push('--embed-metadata');
  if (m.embedChapters) args.push('--embed-chapters');
  if (m.writeComments) args.push('--write-comments');

  // aria2c como downloader externo (opcional)
  if (o.useAria2 && checkBinaries().aria2c.found) {
    args.push('--downloader', 'aria2c', '--downloader-args', 'aria2c:-x8 -s8 -k1M');
  }

  return args;
}

/** Versão exibível do comando, com aspas onde necessário (apenas para cópia). */
export function commandPreview(o: DownloadOptions, ctx: BuildContext, url: string): string {
  const parts = ['yt-dlp', ...buildArgs(o, { ...ctx, forPreview: true }), '--', url];
  return parts
    .map((p) => (/[\s"']/.test(p) ? `"${p.replace(/"/g, '\\"')}"` : p))
    .join(' ');
}
