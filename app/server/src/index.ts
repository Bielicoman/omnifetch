import { spawn } from 'child_process';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { HOST, LAN_MODE, localIp, NO_OPEN, PORT, WEB_DIST } from './config';
import { checkBinaries } from './deps';
import { api } from './routes';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

// API local — sem telemetria, sem chamadas externas além do próprio yt-dlp.
app.use('/api', api);

// Em produção, serve o frontend compilado.
const hasDist = fs.existsSync(path.join(WEB_DIST, 'index.html'));
if (hasDist) {
  app.use(express.static(WEB_DIST));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(WEB_DIST, 'index.html')));
} else {
  app.get('/', (_req, res) => {
    res
      .type('text/plain')
      .send('OMNIFETCH API ativa.\nFrontend ainda não compilado — rode "npm run build" ou use "npm run dev".');
  });
}

const server = app.listen(PORT, HOST, () => {
  const bins = checkBinaries();
  const url = `http://127.0.0.1:${PORT}`;
  console.log('');
  console.log('  OMNIFETCH rodando localmente');
  console.log(`     Interface: ${url}`);
  if (LAN_MODE) {
    const ip = localIp();
    if (ip) console.log(`     Celular (mesma rede): http://${ip}:${PORT}`);
    console.log('     [!] Modo LAN ativo - qualquer aparelho na sua rede pode controlar os downloads.');
  }
  console.log(`     yt-dlp: ${bins.ytdlp.found ? `ok (${bins.ytdlp.version})` : 'NAO ENCONTRADO'}`);
  console.log(`     ffmpeg: ${bins.ffmpeg.found ? `ok (${bins.ffmpeg.version})` : 'NAO ENCONTRADO'}`);
  console.log('');

  if (hasDist && !NO_OPEN && process.env.NODE_ENV !== 'development') {
    openBrowser(url);
  }
});

// Porta ocupada: se for outro OMNIFETCH, abre o navegador nele em vez de quebrar.
server.on('error', async (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    const url = `http://127.0.0.1:${PORT}`;
    if (await isOmnifetchRunning(url)) {
      console.log('');
      console.log('  O OMNIFETCH ja esta aberto em outra janela.');
      console.log(`  Abrindo o navegador em ${url} ...`);
      console.log('  (esta janela pode ser fechada)');
      console.log('');
      if (!NO_OPEN) openBrowser(url);
      setTimeout(() => process.exit(0), 1500);
    } else {
      console.error('');
      console.error(`  [ERRO] A porta ${PORT} esta sendo usada por outro programa.`);
      console.error('  Mude a porta no arquivo .env (ex.: PORT=4778) e tente de novo.');
      console.error('');
      process.exit(1);
    }
  } else {
    console.error(`Erro ao iniciar o servidor: ${err.message}`);
    process.exit(1);
  }
});

async function isOmnifetchRunning(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`${url}/api/status`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = (await res.json()) as { appVersion?: unknown; ytdlp?: unknown };
    return typeof data.appVersion === 'string' && data.ytdlp !== undefined;
  } catch {
    return false;
  }
}

function openBrowser(url: string): void {
  try {
    if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', url], { windowsHide: true });
    else if (process.platform === 'darwin') spawn('open', [url]);
    else spawn('xdg-open', [url]);
  } catch {
    /* sem navegador — segue rodando */
  }
}
