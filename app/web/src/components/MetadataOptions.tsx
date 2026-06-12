import { useStore } from '../store';
import { Toggle } from './ui';

export function MetadataOptions() {
  const options = useStore((s) => s.options);
  const setOptions = useStore((s) => s.setOptions);
  const meta = options.metadata;

  const patch = (p: Partial<typeof meta>) => setOptions({ metadata: { ...meta, ...p } });

  return (
    <div className="space-y-1">
      <p className="section-title mb-2">Metadados e extras</p>

      <Toggle checked={meta.embedMetadata} onChange={(v) => patch({ embedMetadata: v })}
        label="Incorporar metadados no arquivo" hint="Título, autor e data dentro do vídeo" />
      <Toggle checked={meta.embedThumbnail} onChange={(v) => patch({ embedThumbnail: v })}
        label="Incorporar thumbnail como capa" hint="Funciona em MP4, M4A e MP3" />
      <Toggle checked={meta.writeThumbnail} onChange={(v) => patch({ writeThumbnail: v })}
        label="Salvar thumbnail como imagem" />
      <Toggle checked={meta.writeDescription} onChange={(v) => patch({ writeDescription: v })}
        label="Salvar descrição em arquivo de texto" />
      <Toggle checked={meta.embedChapters} onChange={(v) => patch({ embedChapters: v })}
        label="Salvar capítulos no vídeo" hint="Marcadores de tempo do criador" />
      <Toggle checked={meta.writeInfoJson} onChange={(v) => patch({ writeInfoJson: v })}
        label="Salvar info JSON do yt-dlp" hint="Arquivo técnico com todos os dados" />
      <Toggle checked={meta.writeComments} onChange={(v) => patch({ writeComments: v })}
        label="Salvar comentários (se suportado)" hint="Pode deixar a análise bem mais lenta" />
    </div>
  );
}
