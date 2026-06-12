import { useStore } from '../store';
import { Field, Segmented, Toggle } from './ui';

/** Seções "Vídeo" e "Áudio" das opções avançadas. */
export function FormatSelector() {
  const options = useStore((s) => s.options);
  const setOptions = useStore((s) => s.setOptions);

  return (
    <div className="space-y-5">
      {/* ---------- VÍDEO ---------- */}
      <div className="space-y-3">
        <p className="section-title">Vídeo</p>

        <Toggle
          checked={options.audioOnly}
          onChange={(v) => setOptions({ audioOnly: v })}
          label="Extrair apenas o áudio"
          hint="Ignora o vídeo e salva só o som"
        />

        {!options.audioOnly && (
          <>
            <Field label="Formato de saída">
              <Segmented
                value={options.container}
                onChange={(v) => setOptions({ container: v })}
                options={[
                  { value: 'mp4', label: 'MP4' },
                  { value: 'mkv', label: 'MKV' },
                  { value: 'webm', label: 'WEBM' },
                  { value: 'mov', label: 'MOV' },
                  { value: 'avi', label: 'AVI' },
                ]}
                size="sm"
              />
            </Field>

            <Field label="Codec de vídeo">
              <Segmented
                value={options.vcodec}
                onChange={(v) => setOptions({ vcodec: v })}
                options={[
                  { value: 'h264', label: 'H.264' },
                  { value: 'h265', label: 'H.265' },
                  { value: 'vp9', label: 'VP9' },
                  { value: 'av1', label: 'AV1' },
                  { value: 'copy', label: 'Original' },
                ]}
                size="sm"
              />
            </Field>

            <Field label="Qualidade máxima">
              <Segmented
                value={options.quality}
                onChange={(v) => setOptions({ quality: v })}
                options={[
                  { value: 'best', label: 'Melhor' },
                  { value: '2160', label: '4K' },
                  { value: '1440', label: '1440p' },
                  { value: '1080', label: '1080p' },
                  { value: '720', label: '720p' },
                  { value: '480', label: '480p' },
                ]}
                size="sm"
              />
            </Field>

            <Field label="FPS">
              <Segmented
                value={options.fps}
                onChange={(v) => setOptions({ fps: v })}
                options={[
                  { value: 'original', label: 'Original' },
                  { value: '60', label: '60 fps' },
                  { value: '30', label: '30 fps' },
                ]}
                size="sm"
              />
            </Field>

            <Field label="HDR">
              <Segmented
                value={options.hdr}
                onChange={(v) => setOptions({ hdr: v })}
                options={[
                  { value: 'auto', label: 'Automático' },
                  { value: 'prefer-hdr', label: 'Preferir HDR' },
                  { value: 'prefer-sdr', label: 'Preferir SDR' },
                ]}
                size="sm"
              />
            </Field>

            <Toggle
              checked={options.forceH264}
              onChange={(v) => setOptions({ forceH264: v })}
              label="Forçar conversão para H.264"
              hint="Compatibilidade máxima com TVs e celulares (mais lento)"
            />
          </>
        )}
      </div>

      {/* ---------- ÁUDIO ---------- */}
      <div className="space-y-3 border-t border-white/[0.06] pt-4">
        <p className="section-title">Áudio</p>

        <Field label="Formato do áudio">
          <Segmented
            value={options.audioFormat}
            onChange={(v) => setOptions({ audioFormat: v })}
            options={[
              { value: 'best', label: 'Melhor' },
              { value: 'mp3', label: 'MP3' },
              { value: 'm4a', label: 'M4A' },
              { value: 'wav', label: 'WAV' },
              { value: 'flac', label: 'FLAC' },
              { value: 'opus', label: 'OPUS' },
              { value: 'aac', label: 'AAC' },
              { value: 'ogg', label: 'OGG' },
            ]}
            size="sm"
          />
        </Field>

        <Field label="Qualidade do áudio">
          <Segmented
            value={options.audioQuality}
            onChange={(v) => setOptions({ audioQuality: v })}
            options={[
              { value: 'best', label: 'Melhor' },
              { value: '320', label: '320 kbps' },
              { value: '256', label: '256' },
              { value: '192', label: '192' },
              { value: '128', label: '128' },
            ]}
            size="sm"
          />
        </Field>

        <Toggle
          checked={options.normalizeAudio}
          onChange={(v) => setOptions({ normalizeAudio: v })}
          label="Normalizar volume"
          hint="Equaliza o volume do áudio (loudnorm)"
        />

        <Toggle
          checked={options.allAudioTracks}
          onChange={(v) => setOptions({ allAudioTracks: v })}
          label="Baixar todas as faixas de áudio"
          hint="Para vídeos com dublagens — use MKV como formato"
        />

        <Field label="Idioma preferido da faixa de áudio (opcional)">
          <input
            value={options.audioLang}
            onChange={(e) => setOptions({ audioLang: e.target.value })}
            placeholder="ex.: pt ou pt-BR (vazio = original)"
            className="input-base"
            spellCheck={false}
          />
        </Field>
      </div>
    </div>
  );
}
