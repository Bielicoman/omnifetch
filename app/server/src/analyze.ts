import { spawn } from 'child_process';
import { ALLOW_INSECURE_SSL } from './config';
import { ytdlpPath } from './deps';
import { validateUrl } from './security';
import { AnalyzeEntry, AnalyzeResult } from './types';

const ANALYZE_TIMEOUT_MS = 90_000;

/**
 * Analisa um link com `yt-dlp -J` (dump de JSON único).
 * `--flat-playlist` evita varrer playlists inteiras — para vídeo único não muda nada.
 */
export async function analyzeUrl(rawUrl: string): Promise<AnalyzeResult> {
  const url = validateUrl(rawUrl);
  if (!url) throw new AnalyzeError('Link inválido. Cole um endereço http(s) completo.');

  const bin = ytdlpPath();
  if (!bin) throw new AnalyzeError('yt-dlp não encontrado. Veja as instruções de instalação no botão de ajuda.');

  const args = ['--no-warnings', '-J', '--flat-playlist'];
  if (ALLOW_INSECURE_SSL) args.push('--no-check-certificates');
  args.push('--', url);
  const json = await runCapture(bin, args);

  let info: any;
  try {
    info = JSON.parse(json);
  } catch {
    throw new AnalyzeError('Não foi possível ler as informações deste link.');
  }
  return toResult(url, info);
}

export class AnalyzeError extends Error {}

function runCapture(bin: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { windowsHide: true });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new AnalyzeError('A análise demorou demais e foi cancelada. Tente novamente.'));
    }, ANALYZE_TIMEOUT_MS);

    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(new AnalyzeError(`Falha ao executar o yt-dlp: ${e.message}`));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && out.trim() !== '') resolve(out);
      else reject(new AnalyzeError(friendlyError(err)));
    });
  });
}

function friendlyError(stderr: string): string {
  const line = stderr.split(/\r?\n/).find((l) => l.includes('ERROR:')) ?? '';
  if (/Private video|This video is private/i.test(line)) return 'Este vídeo é privado.';
  if (/age.restricted|Sign in to confirm your age/i.test(line)) return 'Este conteúdo tem restrição de idade e exige login — o OMNIFETCH não contorna esse bloqueio.';
  if (/members.only|This video is available to this channel's members/i.test(line)) return 'Conteúdo exclusivo para membros — não é possível baixar sem autorização.';
  if (/Video unavailable|content isn.t available/i.test(line)) return 'Vídeo indisponível ou removido.';
  if (/Unsupported URL/i.test(line)) return 'Este site não é suportado pelo yt-dlp.';
  if (/HTTP Error 4\d\d/i.test(line)) return 'A plataforma recusou o acesso a este link.';
  if (line !== '') return line.replace(/^ERROR:\s*/i, '').slice(0, 300);
  return 'Não foi possível analisar este link.';
}

function toResult(url: string, info: any): AnalyzeResult {
  if (info._type === 'playlist' && Array.isArray(info.entries)) {
    const entries: AnalyzeEntry[] = info.entries.slice(0, 25).map((e: any) => ({
      id: e?.id,
      title: e?.title ?? '(sem título)',
      duration: numberOrUndef(e?.duration),
      url: e?.url ?? e?.webpage_url,
      thumbnail: pickThumb(e),
      uploader: e?.uploader ?? e?.channel,
    }));
    return {
      kind: 'playlist',
      url,
      platform: platformName(info),
      title: info.title ?? 'Playlist',
      uploader: info.uploader ?? info.channel,
      thumbnail: pickThumb(info) ?? entries.find((e) => e.thumbnail)?.thumbnail,
      description: trim(info.description),
      entryCount: info.playlist_count ?? info.entries.length,
      entries,
    };
  }

  const formats: any[] = Array.isArray(info.formats) ? info.formats : [];
  const videoFormats = formats.filter((f) => f.vcodec && f.vcodec !== 'none');
  const audioFormats = formats.filter((f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'));
  const maxHeight = videoFormats.reduce((acc, f) => Math.max(acc, f.height ?? 0), 0) || undefined;
  const maxFps = videoFormats.reduce((acc, f) => Math.max(acc, f.fps ?? 0), 0) || undefined;
  const vcodecs = [...new Set(videoFormats.map((f) => baseCodec(f.vcodec)))].filter(Boolean) as string[];

  return {
    kind: 'video',
    url,
    platform: platformName(info),
    title: info.title,
    uploader: info.uploader ?? info.channel,
    channelUrl: info.channel_url ?? info.uploader_url,
    duration: numberOrUndef(info.duration),
    uploadDate: info.upload_date,
    viewCount: numberOrUndef(info.view_count),
    likeCount: numberOrUndef(info.like_count),
    description: trim(info.description),
    thumbnail: pickThumb(info),
    maxHeight,
    maxFps,
    vcodecs,
    estimatedSize: estimateSize(videoFormats, audioFormats),
    isLive: info.is_live === true,
    ageLimit: numberOrUndef(info.age_limit),
    availability: info.availability,
  };
}

function estimateSize(videoFormats: any[], audioFormats: any[]): number | undefined {
  const sizeOf = (f: any) => f.filesize ?? f.filesize_approx ?? 0;
  const bestVideo = videoFormats
    .filter((f) => sizeOf(f) > 0)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0) || (b.tbr ?? 0) - (a.tbr ?? 0))[0];
  const bestAudio = audioFormats
    .filter((f) => sizeOf(f) > 0)
    .sort((a, b) => (b.abr ?? 0) - (a.abr ?? 0))[0];
  const total = (bestVideo ? sizeOf(bestVideo) : 0) + (bestAudio ? sizeOf(bestAudio) : 0);
  return total > 0 ? total : undefined;
}

function baseCodec(v: string | undefined): string | undefined {
  if (!v || v === 'none') return undefined;
  if (v.startsWith('avc')) return 'H.264';
  if (v.startsWith('hev') || v.startsWith('hvc')) return 'H.265';
  if (v.startsWith('vp9') || v.startsWith('vp09')) return 'VP9';
  if (v.startsWith('av01')) return 'AV1';
  return v.split('.')[0];
}

function pickThumb(info: any): string | undefined {
  if (typeof info?.thumbnail === 'string') return info.thumbnail;
  const list = Array.isArray(info?.thumbnails) ? info.thumbnails : [];
  const best = [...list].reverse().find((t: any) => typeof t?.url === 'string');
  return best?.url;
}

function platformName(info: any): string {
  const key: string = info?.extractor_key ?? info?.extractor ?? 'Web';
  const map: Record<string, string> = {
    Youtube: 'YouTube', YoutubeTab: 'YouTube', Instagram: 'Instagram', TikTok: 'TikTok',
    Twitter: 'X (Twitter)', Vimeo: 'Vimeo', Twitch: 'Twitch', Facebook: 'Facebook',
    Reddit: 'Reddit', Generic: 'Web',
  };
  return map[key] ?? key;
}

const numberOrUndef = (v: unknown): number | undefined => (typeof v === 'number' && isFinite(v) ? v : undefined);
const trim = (s: unknown): string | undefined =>
  typeof s === 'string' && s.trim() !== '' ? s.trim().slice(0, 1200) : undefined;
