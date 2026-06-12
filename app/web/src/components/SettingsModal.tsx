import { Power, Settings, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useStore } from '../store';
import { Field, Modal, Segmented, Toggle } from './ui';

export function SettingsModal() {
  const open = useStore((s) => s.settingsOpen);
  const setOpen = useStore((s) => s.setSettingsOpen);
  const settings = useStore((s) => s.settings);
  const status = useStore((s) => s.status);
  const saveSettings = useStore((s) => s.saveSettings);

  const [downloadDir, setDownloadDir] = useState('');
  const [outputTemplate, setOutputTemplate] = useState('');

  useEffect(() => {
    if (settings) {
      setDownloadDir(settings.downloadDir);
      setOutputTemplate(settings.outputTemplate);
    }
  }, [settings, open]);

  const toast = useStore((s) => s.toast);
  const [confirmShutdown, setConfirmShutdown] = useState(false);

  if (!settings) return null;

  const save = async () => {
    await saveSettings({ downloadDir, outputTemplate });
    setOpen(false);
  };

  const shutdown = async () => {
    if (!confirmShutdown) {
      setConfirmShutdown(true);
      setTimeout(() => setConfirmShutdown(false), 4000);
      return;
    }
    try {
      await api.shutdown();
      toast('info', 'OMNIFETCH encerrado. Pode fechar esta aba.');
      setOpen(false);
    } catch {
      toast('error', 'Não foi possível encerrar o servidor.');
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Configurações" icon={<Settings size={17} className="text-omni" />}>
      <div className="space-y-4">
        <Field label="Pasta de downloads">
          <input
            value={downloadDir}
            onChange={(e) => setDownloadDir(e.target.value)}
            className="input-base font-mono text-xs"
            spellCheck={false}
          />
          <span className="mt-1 block text-[11px] text-white/35">
            Caminho completo. A pasta será criada se não existir.
          </span>
        </Field>

        <Field label="Modelo de nome do arquivo">
          <input
            value={outputTemplate}
            onChange={(e) => setOutputTemplate(e.target.value)}
            className="input-base font-mono text-xs"
            spellCheck={false}
          />
          <span className="mt-1 block text-[11px] text-white/35">
            Ex.: %(title)s - %(uploader)s - %(id)s.%(ext)s
          </span>
        </Field>

        <Field label="Downloads simultâneos">
          <Segmented
            value={String(settings.maxConcurrent)}
            onChange={(v) => saveSettings({ maxConcurrent: parseInt(v, 10) })}
            options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }))}
            size="sm"
          />
        </Field>

        <Toggle
          checked={settings.openFolderAfter}
          onChange={(v) => saveSettings({ openFolderAfter: v })}
          label="Abrir a pasta ao concluir um download"
        />

        <Toggle
          checked={settings.useAria2}
          onChange={(v) => saveSettings({ useAria2: v })}
          label="Usar aria2c em todos os downloads"
          hint={status?.aria2c.found ? `aria2c detectado (${status.aria2c.version ?? ''})` : 'aria2c não encontrado — opção sem efeito'}
        />

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <Smartphone size={14} className="text-omni" />
            Usar pelo celular
          </p>
          {status?.lanMode && status.lanUrl ? (
            <p className="mt-1.5 text-xs leading-relaxed text-white/50">
              Modo LAN ativo. No celular conectado à mesma rede Wi-Fi, abra:{' '}
              <code className="rounded bg-ink-950 px-1.5 py-0.5 font-mono text-omni">{status.lanUrl}</code>
            </p>
          ) : (
            <p className="mt-1.5 text-xs leading-relaxed text-white/50">
              Para controlar os downloads pelo celular, defina <code className="rounded bg-ink-950 px-1 font-mono text-omni">LAN_MODE=true</code> no
              arquivo <code className="font-mono">.env</code> e reinicie o app. Use apenas em redes confiáveis.
            </p>
          )}
        </div>

        <p className="text-[11px] leading-relaxed text-white/35">
          O OMNIFETCH não coleta dados, não envia telemetria e não expõe o servidor para a internet.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={shutdown}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              confirmShutdown
                ? 'border border-red-400/60 bg-red-500/20 text-red-200'
                : 'border border-red-400/25 bg-red-500/[0.06] text-red-300/80 hover:bg-red-500/[0.12]'
            }`}
            title="Desliga o servidor local do OMNIFETCH"
          >
            <Power size={14} />
            {confirmShutdown ? 'Clique de novo para confirmar' : 'Encerrar o OMNIFETCH'}
          </button>
          <div className="flex-1" />
          <button onClick={() => setOpen(false)} className="btn-ghost px-4 py-2 text-sm">
            Cancelar
          </button>
          <button onClick={save} className="btn-primary px-5 py-2 text-sm">
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
}
