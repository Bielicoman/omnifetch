# OmniFetch Online Engine

Motor online proprio do OmniFetch. Ele roda `yt-dlp` e `ffmpeg` no servidor, baixa arquivos diretos como PDF/ZIP/imagem por URL e converte uploads sem precisar abrir o Desktop Agent.

## Rodar local

```powershell
cd online-engine
npm install
npm start
```

Abra:

```text
http://localhost:8787/app.html
```

## Deploy

Use Docker em Render, Railway, Fly.io, VPS ou outro host que permita processos longos e disco temporario.

```powershell
docker build -t omnifetch-online-engine -f online-engine/Dockerfile .
docker run -p 8787:8787 omnifetch-online-engine
```

## Conectar ao site no Vercel

No projeto do site, configure a variavel:

```text
OMNIFETCH_ENGINE_URL=https://sua-engine.com
```

Depois refaca o deploy. O `omnifetch.vercel.app` vai usar `/api/*` como proxy para esta engine e o usuario final nao precisa abrir o Desktop.

## API

- `GET /api/info`
- `POST /api/download` com JSON `{ url, mode: "video|audio|mute|file", quality, audioFormat }`
- `POST /api/convert` com `multipart/form-data`: `file`, `target`
- `GET /api/jobs/:id`
- `GET /files/:jobId/:filename`

O motor nao quebra DRM e nao acessa conteudo que exige permissao privada sem credenciais validas.
