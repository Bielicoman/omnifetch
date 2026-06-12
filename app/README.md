# ⚡ OMNIFETCH

**Downloader e conversor universal de vídeos — 100% local, rápido e privado.**

Cole um link, analise, escolha o formato e baixe na melhor qualidade possível. Funciona com YouTube, Instagram, TikTok, X/Twitter, Vimeo, Twitch, Facebook, Reddit e centenas de outros sites suportados pelo [yt-dlp](https://github.com/yt-dlp/yt-dlp).

- 🖥️ Interface moderna no navegador (dashboard escuro com verde neon)
- 🔒 Tudo roda localmente — nenhum link é enviado para servidores externos
- 📦 Vídeos, playlists, canais e listas de links em fila
- 🎚️ Presets prontos (MP4 H.264, 1080p, MP3 320, modo completo…) + opções avançadas
- 📊 Progresso em tempo real: velocidade, ETA, tamanho, status
- 📱 Responsivo/PWA — controle pelo celular na mesma rede (opcional)
- 🚫 Sem anúncios, sem telemetria, sem limites artificiais

> ⚠️ **Uso legal e responsável:** baixe apenas conteúdos próprios, livres, autorizados ou permitidos pela lei e pelos termos de cada plataforma. O OMNIFETCH **não** contorna DRM, paywall, login ou qualquer bloqueio de acesso.

---

## Requisitos

| Dependência | Para quê | Obrigatório |
|---|---|---|
| [Node.js](https://nodejs.org) 18+ | rodar o app | ✅ |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | baixar os vídeos | ✅ |
| [ffmpeg](https://ffmpeg.org) | mesclar/convertar formatos | ✅ |
| [aria2c](https://aria2.github.io) | acelerar downloads | opcional |

### Instalando yt-dlp e ffmpeg

**Windows 10/11** (escolha UMA das opções):

```powershell
# Opção A — winget (recomendado)
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg

# Opção B — binários portáteis na pasta ./bin do projeto (sem instalar nada)
powershell -ExecutionPolicy Bypass -File scripts\get-binaries.ps1
```

**macOS:**

```bash
brew install yt-dlp ffmpeg
# ou: bash scripts/get-binaries.sh   (baixa o yt-dlp portátil)
```

**Linux (Debian/Ubuntu):**

```bash
sudo apt install ffmpeg
pipx install yt-dlp        # ou: bash scripts/get-binaries.sh
```

O app detecta os binários automaticamente nesta ordem: caminho do `.env` → pasta `./bin` → PATH do sistema. O status aparece no topo da interface.

---

## Como rodar

**Windows — jeito fácil:** dê dois cliques em **`Iniciar OMNIFETCH.bat`** na raiz do projeto. Ele instala/compila o que faltar e abre o navegador sozinho. Para criar um atalho na área de trabalho:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\criar-atalho.ps1
```

**Qualquer sistema — pelo terminal:**

```bash
# 1. Instale as dependências (uma vez)
npm install

# 2a. Modo produção (recomendado): compila e abre no navegador
npm run build
npm start
# → abre http://127.0.0.1:4777 automaticamente

# 2b. Modo desenvolvimento (hot reload)
npm run dev
# → interface em http://localhost:5183
```

### Configuração (opcional)

Copie `.env.example` para `.env` e ajuste:

```env
PORT=4777            # porta do servidor
DOWNLOAD_DIR=        # pasta de destino (padrão: ~/Downloads/OMNIFETCH)
MAX_CONCURRENT=2     # downloads simultâneos
LAN_MODE=false       # true = acessar pelo celular na mesma rede
YTDLP_PATH=          # caminho manual do yt-dlp
FFMPEG_PATH=         # caminho manual do ffmpeg
```

### Usando pelo celular 📱

1. No PC, defina `LAN_MODE=true` no `.env` e reinicie (`npm start`).
2. No celular (mesma rede Wi-Fi), abra o endereço mostrado no terminal — ex.: `http://192.168.0.10:4777`.
3. A interface é responsiva e pode ser instalada como PWA ("Adicionar à tela inicial").

> Use o modo LAN apenas em redes confiáveis. **Nunca** exponha a porta para a internet.

---

## Como usar

1. **Cole um link** — vídeo único, playlist, canal ou vários links (um por linha).
2. **Analisar mídia** (opcional) — veja thumbnail, título, duração, resolução máxima e tamanho estimado antes de baixar.
3. **Escolha o formato** — o padrão é **MP4 H.264 na melhor qualidade** (compatível com Windows, Mac, Android, iPhone e TVs). Presets rápidos: 1080p, 720p, 4K, MP3 320, WAV, MKV original, **Modo completo** (vídeo + áudio + legendas + thumbnail + metadados + info JSON).
4. **Baixar agora** (ou `Ctrl+Enter`) — acompanhe na fila: progresso, velocidade, ETA, status (baixando → mesclando → concluído).

### Opções avançadas

- **Vídeo:** container (MP4/MKV/WEBM/MOV/AVI), codec (H.264/H.265/VP9/AV1/original), qualidade (4K→480p), FPS, HDR/SDR, recodificação forçada para H.264
- **Áudio:** MP3/M4A/WAV/FLAC/OPUS/AAC/OGG, até 320 kbps, normalização de volume, todas as faixas de áudio, idioma preferido
- **Legendas:** oficiais e automáticas, idiomas, SRT/VTT/ASS, embutir no vídeo ou arquivo separado
- **Metadados:** thumbnail, descrição, capítulos, comentários, info JSON, incorporação no arquivo
- **Playlist:** intervalo (`1-10,15`), limite de vídeos, pular já baixados
- **Extras:** modelo de nome personalizável, copiar o comando `yt-dlp` equivalente, logs técnicos por download

---

## Arquitetura

```
omnifetch/
├── server/              # Backend — Node.js + Express + TypeScript
│   └── src/
│       ├── index.ts     # servidor HTTP local (127.0.0.1)
│       ├── routes.ts    # API REST
│       ├── queue.ts     # fila assíncrona com concorrência configurável
│       ├── args.ts      # geração SEGURA dos argumentos do yt-dlp
│       ├── analyze.ts   # análise de mídia (yt-dlp -J)
│       ├── presets.ts   # camada de presets
│       ├── security.ts  # validação de URL, sanitização, anti path-traversal
│       ├── events.ts    # progresso em tempo real (Server-Sent Events)
│       ├── deps.ts      # detecção de yt-dlp/ffmpeg/aria2c
│       ├── settings.ts  # configurações persistidas (data/settings.json)
│       └── history.ts   # histórico local (data/history.json)
├── web/                 # Frontend — React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── components/  # AppShell, Header, LinkInputPanel, VideoPreviewCard,
│       │                # QuickPresets, AdvancedOptionsDrawer, DownloadQueue…
│       ├── store.ts     # estado global (zustand) + cliente SSE
│       └── lib/         # api, tipos, presets, formatação
├── scripts/             # instaladores de binários portáteis
└── data/                # histórico/configurações (criado em runtime, fora do git)
```

### Segurança

- URLs validadas (`http/https` apenas) e passadas após `--` — nunca interpretadas como flags
- Processos iniciados com `spawn` + array de argumentos — **sem shell, sem concatenação de strings**
- O frontend nunca envia comandos: apenas um objeto de opções tipado, normalizado contra whitelists no backend
- Modelos de nome de arquivo restritos a tokens conhecidos; separadores de caminho e `..` bloqueados
- "Abrir arquivo/pasta" só funciona dentro da pasta de downloads (anti path-traversal)
- Servidor escuta apenas em `127.0.0.1` por padrão; zero telemetria, zero coleta de dados

---

## Scripts npm

| Comando | Descrição |
|---|---|
| `npm run dev` | servidor + frontend com hot reload |
| `npm run build` | compila frontend e backend |
| `npm start` | roda em produção e abre o navegador |
| `npm run typecheck` | verifica os tipos de todo o projeto |

## Solução de problemas

- **"yt-dlp não encontrado"** — instale (veja acima) e clique em "Já instalei — verificar de novo" no botão de ajuda.
- **Download falha em site específico** — atualize o yt-dlp: `yt-dlp -U` (ou rode o script de binários de novo).
- **Erro 403/login** — o conteúdo exige autenticação ou é restrito; o OMNIFETCH não contorna esses bloqueios.
- **Porta em uso** — mude `PORT` no `.env`.
- **`CERTIFICATE_VERIFY_FAILED` na análise** — sua rede tem inspeção TLS (proxy corporativo/antivírus). Defina `ALLOW_INSECURE_SSL=true` no `.env` e reinicie. ⚠ Isso desliga a verificação de certificados do yt-dlp — use apenas se necessário.

---

Feito com ⚡ para uso pessoal, legal e responsável.
