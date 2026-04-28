# OmniFetch · Trinity Edition

[![Version](https://img.shields.io/badge/version-4.0-00ff88)](https://github.com/Bielicoman/omnifetch)
[![Platform](https://img.shields.io/badge/desktop-Windows-0088ff)](#)
[![Web](https://img.shields.io/badge/web-omnifetch.vercel.app-00ff88)](https://omnifetch.vercel.app)

Suite universal para baixar videos, converter arquivos e organizar midias com uma experiencia desktop premium no Windows.

## Produtos

| Produto | O que entrega | Onde fica |
|---|---|---|
| Site | Landing page do projeto | `website/` |
| Desktop Launcher | Hub principal com UX premium, status dos motores e preferencias globais | `desktop/OmniFetch.bat` |
| Downloader | yt-dlp com aria2 turbo, fila, cookies, presets 4K/MP3 e historico | `desktop/Downloader.bat` |
| Conversor | FFmpeg + Calibre opcional para video, audio, imagem e e-books | `desktop/Conversor.bat` |
| OmniTools | Inspector, thumbnails, cortes, legendas, renomeador e relatorios | `desktop/core/OmniTools.bat` |

## Estrutura

```text
OmniFetch/
├── desktop/
│   ├── OmniFetch.bat
│   ├── Instalar.bat
│   ├── Downloader.bat
│   ├── Conversor.bat
│   ├── LEIA-ME.txt
│   ├── assets/icons/          # icones oficiais dos atalhos
│   └── core/                  # UI compartilhada, logo, shortcuts e OmniTools
├── scripts/
│   ├── build-desktop-zip.ps1
│   └── generate-desktop-icons.ps1
├── website/
└── vercel.json
```

## Uso Desktop

1. Baixe o ZIP em [Releases](https://github.com/Bielicoman/omnifetch/releases/latest).
2. Extraia para uma pasta gravavel, como `C:\OmniFetch`.
3. Rode `Instalar.bat`.
4. Use `OmniFetch.bat` como entrada diaria.

O setup baixa motores portateis em `desktop/motores/`, cria atalhos com icones oficiais no Desktop/Menu Iniciar e pode adicionar o menu de contexto "Converter com OmniFetch".

## Configuracoes Premium

O launcher e o downloader salvam preferencias em `desktop/data/config.ini`:

- `SPEED_PROFILE`: `turbo`, `balanced`, `conservative` ou `custom`.
- `CONCURRENT_FRAGMENTS`, `ARIA_CONNECTIONS`, `ARIA_SPLITS`: controle de aceleracao.
- `EMBED_METADATA`, `EMBED_THUMBNAIL`, `DOWNLOAD_SUBS`: qualidade e extras.
- `INTRO_ANIMATION`: `full`, `fast` ou `off`.

## Build

```powershell
.\scripts\generate-desktop-icons.ps1
.\scripts\build-desktop-zip.ps1 -Version 4.0.0
```

Para incluir motores ja baixados:

```powershell
.\scripts\build-desktop-zip.ps1 -Version 4.0.0 -IncludeMotores
```

## Licenca

MIT — feito por Alex Ascencio.
