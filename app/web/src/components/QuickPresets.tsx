import { motion } from 'framer-motion';
import {
  Archive, AudioLines, Captions, Clapperboard, FileAudio, FileVideo2,
  Gauge, ListVideo, Music, Settings2, Sparkles,
} from 'lucide-react';
import { PRESET_LIST } from '../lib/presets';
import { PresetId } from '../lib/types';
import { useStore } from '../store';

const PRESET_ICONS: Record<PresetId, typeof Sparkles> = {
  best_mp4_h264: Sparkles,
  mp4_4k: Clapperboard,
  mp4_1080p: FileVideo2,
  mp4_720p: Gauge,
  audio_mp3_320: Music,
  audio_m4a_best: FileAudio,
  audio_wav: AudioLines,
  mkv_original: Archive,
  webm_original: Archive,
  archive_full: Archive,
};

export function QuickPresets() {
  const options = useStore((s) => s.options);
  const selectPreset = useStore((s) => s.selectPreset);
  const setOptions = useStore((s) => s.setOptions);
  const setDrawerOpen = useStore((s) => s.setDrawerOpen);

  const toggleSubs = () => {
    setOptions({
      subtitles: { ...options.subtitles, enabled: !options.subtitles.enabled },
    });
  };
  const togglePlaylist = () => {
    setOptions({
      playlist: { ...options.playlist, full: !options.playlist.full },
    });
  };

  return (
    <div className="glass p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">
          <Sparkles size={14} />
          Formato e qualidade
        </h2>
        <span className="text-[11px] text-white/35">Padrão recomendado: MP4 H.264</span>
      </div>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
        {PRESET_LIST.map((p) => {
          const Icon = PRESET_ICONS[p.id];
          const active = options.preset === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => selectPreset(p.id)}
              className={`group flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200 ${
                active
                  ? 'border-omni/60 bg-omni/[0.10] shadow-glow'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-omni/30 hover:bg-white/[0.05]'
              }`}
            >
              <Icon size={17} className={active ? 'text-omni' : 'text-white/45 group-hover:text-omni/80'} />
              <span className={`text-[13px] font-semibold leading-tight ${active ? 'text-omni' : 'text-white/85'}`}>
                {p.label}
              </span>
              <span className="text-[11px] leading-tight text-white/40">{p.description}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <button
          type="button"
          onClick={toggleSubs}
          className={`chip transition-all ${
            options.subtitles.enabled
              ? 'border-omni/50 bg-omni/15 text-omni'
              : 'hover:border-white/25 hover:text-white'
          }`}
        >
          <Captions size={13} />
          Baixar legendas
        </button>
        <button
          type="button"
          onClick={togglePlaylist}
          className={`chip transition-all ${
            options.playlist.full
              ? 'border-omni/50 bg-omni/15 text-omni'
              : 'hover:border-white/25 hover:text-white'
          }`}
        >
          <ListVideo size={13} />
          Playlist completa
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="chip ml-auto border-white/15 hover:border-omni/40 hover:text-omni transition-colors"
        >
          <Settings2 size={13} />
          Opções avançadas
        </button>
      </div>
    </div>
  );
}
