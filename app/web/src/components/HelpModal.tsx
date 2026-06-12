import { HelpCircle, Lock, Terminal } from 'lucide-react';
import { useStore } from '../store';
import { Modal } from './ui';

export function HelpModal() {
  const open = useStore((s) => s.helpOpen);
  const setOpen = useStore((s) => s.setHelpOpen);
  const status = useStore((s) => s.status);
  const refreshStatus = useStore((s) => s.refreshStatus);

  const missingDeps = status && (!status.ytdlp.found || !status.ffmpeg.found);
  const isWin = status?.platform === 'win32';
  const isMac = status?.platform === 'darwin';

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Como usar o OMNIFETCH" icon={<HelpCircle size={17} className="text-omni" />}>
      <div className="space-y-4 text-sm leading-relaxed text-white/70">
        <ol className="list-inside list-decimal space-y-2 text-[13px]">
          <li><strong className="text-white">Cole o link</strong> de um vídeo, playlist, canal — ou vários links, um por linha.</li>
          <li><strong className="text-white">Analise</strong> (opcional) para ver título, qualidade e tamanho antes de baixar.</li>
          <li><strong className="text-white">Escolha o formato</strong> — o padrão MP4 H.264 funciona em qualquer aparelho.</li>
          <li><strong className="text-white">Baixe</strong> e acompanhe o progresso em tempo real na fila.</li>
        </ol>

        {missingDeps && (
          <div className="rounded-xl border border-red-400/25 bg-red-400/[0.06] p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-red-300">
              <Terminal size={14} />
              Falta instalar:
              {!status.ytdlp.found && ' yt-dlp'}
              {!status.ytdlp.found && !status.ffmpeg.found && ' e'}
              {!status.ffmpeg.found && ' ffmpeg'}
            </p>
            <div className="mt-2 space-y-1.5 font-mono text-[11px] text-white/60">
              {isWin && (
                <>
                  <p className="text-white/40 font-sans">No Windows (PowerShell):</p>
                  <p className="rounded bg-ink-950 px-2 py-1">winget install yt-dlp.yt-dlp</p>
                  <p className="rounded bg-ink-950 px-2 py-1">winget install Gyan.FFmpeg</p>
                  <p className="text-white/40 font-sans">Ou rode o script: <code>scripts\get-binaries.ps1</code></p>
                </>
              )}
              {isMac && (
                <>
                  <p className="text-white/40 font-sans">No macOS (Homebrew):</p>
                  <p className="rounded bg-ink-950 px-2 py-1">brew install yt-dlp ffmpeg</p>
                </>
              )}
              {!isWin && !isMac && (
                <>
                  <p className="text-white/40 font-sans">No Linux:</p>
                  <p className="rounded bg-ink-950 px-2 py-1">sudo apt install ffmpeg && pipx install yt-dlp</p>
                </>
              )}
            </div>
            <button onClick={refreshStatus} className="btn-secondary mt-3 w-full px-3 py-2 text-xs">
              Já instalei — verificar de novo
            </button>
          </div>
        )}

        <div className="rounded-xl border border-omni/20 bg-omni/[0.05] p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-omni">
            <Lock size={14} />
            Privacidade e uso responsável
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[12px] text-white/55">
            <li>Tudo roda localmente no seu dispositivo — nenhum link é enviado para servidores externos.</li>
            <li>Baixe apenas conteúdos próprios, livres, autorizados ou permitidos pela lei e pelos termos de cada plataforma.</li>
            <li>O OMNIFETCH não contorna DRM, paywall, login ou qualquer bloqueio de acesso.</li>
          </ul>
        </div>

        <p className="text-[11px] text-white/35">
          Dica: Ctrl+Enter no campo de links inicia o download direto. Compatível com YouTube, Instagram, TikTok,
          X/Twitter, Vimeo, Twitch, Facebook, Reddit e centenas de outros sites suportados pelo yt-dlp.
        </p>
      </div>
    </Modal>
  );
}
