import { useStore } from '../store';
import { Field, Segmented, Toggle } from './ui';

export function SubtitleOptions() {
  const options = useStore((s) => s.options);
  const setOptions = useStore((s) => s.setOptions);
  const subs = options.subtitles;

  const patch = (p: Partial<typeof subs>) => setOptions({ subtitles: { ...subs, ...p } });

  return (
    <div className="space-y-3">
      <p className="section-title">Legendas</p>

      <Toggle
        checked={subs.enabled}
        onChange={(v) => patch({ enabled: v })}
        label="Baixar legendas disponíveis"
        hint="Legendas oficiais enviadas pelo canal"
      />
      <Toggle
        checked={subs.auto}
        onChange={(v) => patch({ auto: v })}
        label="Baixar legendas automáticas"
        hint="Geradas por IA pela plataforma (quando existirem)"
      />

      {(subs.enabled || subs.auto) && (
        <>
          <Field label="Idiomas (separados por vírgula)">
            <input
              value={subs.langs}
              onChange={(e) => patch({ langs: e.target.value })}
              placeholder="pt,pt-BR,en"
              className="input-base"
              spellCheck={false}
            />
          </Field>

          <Field label="Formato da legenda">
            <Segmented
              value={subs.format}
              onChange={(v) => patch({ format: v })}
              options={[
                { value: 'srt', label: 'SRT' },
                { value: 'vtt', label: 'VTT' },
                { value: 'ass', label: 'ASS' },
              ]}
              size="sm"
            />
          </Field>

          <Toggle
            checked={subs.embed}
            onChange={(v) => patch({ embed: v })}
            label="Embutir legendas no vídeo"
            hint="A legenda vai dentro do arquivo de vídeo"
          />
          <Toggle
            checked={subs.separateFile}
            onChange={(v) => patch({ separateFile: v })}
            label="Salvar legenda como arquivo separado"
            hint="Gera um arquivo .srt/.vtt ao lado do vídeo"
          />
        </>
      )}
    </div>
  );
}
