# OmniFetch · Trinity Edition

[![Version](https://img.shields.io/badge/version-4.0-00ff88)](https://github.com/Bielicoman/omnifetch)
[![Platform](https://img.shields.io/badge/desktop-Windows-0088ff)](#)
[![Web](https://img.shields.io/badge/web-omnifetch.vercel.app-00ff88)](https://omnifetch.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-888)](#)

Suíte universal pra **baixar vídeos** e **converter arquivos** — três produtos compartilhando o mesmo design e o mesmo motor.

| Produto | O que é | Onde está | Para quem |
|---|---|---|---|
| 🌐 **Site** | Landing page de divulgação | [omnifetch.vercel.app](https://omnifetch.vercel.app) | Quem está descobrindo |
| 🟢 **Web App Online** | Baixa & converte direto no browser | [omnifetch.vercel.app/app](https://omnifetch.vercel.app/app) | Quem quer usar sem instalar |
| 🖥️ **Desktop** | Pacote Windows com terminal CLI **+** GUI local em `localhost:7777` | [Releases](https://github.com/Bielicoman/omnifetch/releases/latest) | Quem quer poder máximo, sem limites |

## 📂 Estrutura do repositório

```
OmniFetch/
├── 📂 api/                     ← Vercel Functions (Download/Jobs proxy)
├── index.html                  ← Landing page
├── app.html                    ← Web App Online
├── app.js                      ← Lógica do Web App
├── style.css                   ← Design System mestre
├── script.js                   ← Micro-interações landing
├── vercel.json                 ← Configuração Vercel
│
├── 📂 desktop/                 ← Código da versão Desktop
│   ├── 0_OMNIFETCH.bat         Menu mestre
│   ├── ...
│   └── webui/                  Interface local
│
├── 📂 online-engine/           ← Servidor Node.js autônomo (opcional)
├── build-desktop-zip.ps1       Gera o ZIP de release
└── README.md
```

## 🚀 Para usuários finais

### Online (mais rápido)
Vá em **[omnifetch.vercel.app/app](https://omnifetch.vercel.app/app)** e cole um link. Pronto.

### Desktop (poder máximo)
1. Baixe o ZIP em **[Releases](https://github.com/Bielicoman/omnifetch/releases/latest)**
2. Extraia onde quiser
3. Rode `1_SETUP.bat` — baixa os motores portáteis
4. Rode `0_OMNIFETCH.bat` — escolha entre **Web GUI**, **Downloader CLI**, **Conversor CLI**

> Atalho turbo do Downloader CLI: cole o link, aperte **ENTER duas vezes** → vídeo em melhor qualidade direto em `~/Downloads`.

## 🛠️ Para desenvolvedores

### Rodar o site localmente
```bash
cd site
npx serve .
# abre http://localhost:3000
```

### Rodar o Desktop em dev
```cmd
cd desktop
1_SETUP.bat                  REM uma vez
0_OMNIFETCH.bat              REM menu mestre
```

### Gerar o ZIP de distribuição
```powershell
# da raiz do repo
./build-desktop-zip.ps1 -Version 4.0.0
# gera dist/OmniFetch-Desktop-v4.0.0.zip

# ou incluindo os motores ja baixados (zip pesado, ~80 MB):
./build-desktop-zip.ps1 -Version 4.0.0 -IncludeMotores
```

### Publicar no GitHub Releases
```bash
gh release create v4.0.0 dist/OmniFetch-Desktop-v4.0.0.zip \
    --title "v4.0.0 — Trinity Edition" \
    --notes-file CHANGELOG.md
```

## 🧠 Como funciona

### Web App Online
- **Download** → POST para uma instância [Cobalt](https://github.com/imputnet/cobalt) (configurável em "Avançado"; padrão é `api.cobalt.tools`, que tem proteção contra bots — recomendado self-host)
- **Conversão** → [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) carregado via CDN, roda 100% no browser do usuário (privacidade total, sem upload)

### Desktop
- **Terminal CLI** → batches puros chamando `yt-dlp.exe` e `ffmpeg.exe` da pasta `motores/`
- **Web GUI** → `server.ps1` levanta `System.Net.HttpListener` na porta 7777, expõe `/api/download`, `/api/convert`, `/api/jobs/:id` e serve os estáticos de `webui/` — interface idêntica à online mas chamando os motores nativos

## 🔒 Privacidade

- Web App Online: **arquivos para conversão nunca saem do seu navegador** (FFmpeg WASM é local)
- Desktop: **100% local**, nada vai para servidor algum
- Site: zero analytics, zero cookies de tracking

## 📄 Licença

MIT — feito por [Alex Ascencio](https://instagram.com/alexascencioai).
