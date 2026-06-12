# ⚡ OMNIFETCH

[![Version](https://img.shields.io/badge/version-5.0-00ff88)](https://github.com/Bielicoman/omnifetch/releases/latest)
[![Platform](https://img.shields.io/badge/desktop-Windows%20·%20macOS%20·%20Linux-0088ff)](#)
[![Web](https://img.shields.io/badge/web-omnifetch.vercel.app-00ff88)](https://omnifetch.vercel.app)

**Downloader e conversor universal de vídeos — 100% local, rápido e privado.**

Interface moderna no navegador: cole um link, analise, escolha o formato e baixe na melhor qualidade. Compatível com YouTube, Instagram, TikTok, X/Twitter, Vimeo, Twitch, Facebook, Reddit e +1000 sites suportados pelo [yt-dlp](https://github.com/yt-dlp/yt-dlp).

> ⚠️ **Uso legal e responsável:** baixe apenas conteúdos próprios, livres, autorizados ou permitidos pela lei e pelos termos de cada plataforma. O OMNIFETCH **não** contorna DRM, paywall ou login.

## Download

**[⬇ Baixar a última versão](https://github.com/Bielicoman/omnifetch/releases/latest)** — ou visite [omnifetch.vercel.app](https://omnifetch.vercel.app)

### Como usar (Windows)

1. Instale o [Node.js](https://nodejs.org) (LTS, grátis)
2. Extraia o ZIP e dê dois cliques em **`OMNIFETCH.vbs`**
   - Na primeira vez, o app baixa os motores (`yt-dlp` + `ffmpeg`) automaticamente
   - A interface abre no navegador — sem janela preta
3. Opcional: `scripts\criar-atalho.ps1` cria um atalho com ícone na área de trabalho

### Como usar (macOS / Linux)

```bash
# macOS:  brew install node ffmpeg
# Linux:  sudo apt install nodejs npm ffmpeg
bash iniciar.sh
```

## Destaques

- 🖥️ Dashboard escuro com verde neon, preview com thumbnail e fila em tempo real
- 📦 Vídeos, playlists, canais e listas de links
- 🎚️ Presets prontos: MP4 H.264 (padrão), 4K, 1080p, 720p, MP3 320, WAV, MKV, modo completo
- 📝 Legendas, metadados, capítulos, thumbnail embutida e mais
- 🔒 Tudo roda localmente — zero telemetria, zero anúncios
- 📱 Responsivo/PWA — controle pelo celular na mesma rede (opcional)

## Estrutura do repositório

```text
omnifetch/
├── app/                    # O aplicativo (Node + Express + React + Vite)
│   ├── server/             # Backend local: fila, yt-dlp, ffmpeg, SSE
│   ├── web/                # Interface (React + Tailwind + Framer Motion)
│   └── scripts/            # get-binaries, atalho, ícone
├── website/                # Site oficial (Vercel)
├── scripts/                # build-desktop-zip.ps1 (gera o ZIP de release)
└── .github/workflows/      # Release automático ao enviar tag v*
```

## Desenvolvimento

```bash
cd app
npm install
npm run dev      # hot reload (server + web)
npm run build    # produção
npm start
```

Para gerar o pacote de download localmente:

```powershell
./scripts/build-desktop-zip.ps1 -Version "5.0.0" -Clean
```

Releases são publicados automaticamente pelo GitHub Actions ao enviar um tag `v*`.

---

Feito com ⚡ por [Alex Ascencio](https://instagram.com/alexascencioai) · Licença MIT
