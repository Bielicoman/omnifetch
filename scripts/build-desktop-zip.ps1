# =============================================================
#  OMNIFETCH  ·  build-desktop-zip.ps1
#  Empacota o app (app/) num zip pronto para download.
#  Saida: dist/OmniFetch-Desktop-vX.Y.Z.zip
#  Conteudo: server compilado + deps de producao + web compilado
#            + inicializadores Windows/macOS/Linux. Requer Node no
#            computador do usuario; yt-dlp/ffmpeg baixaveis por script.
# =============================================================

param(
    [string]$Version = '5.0.0',
    [switch]$Clean
)

$ErrorActionPreference = 'Stop'
$root    = Split-Path -Parent $PSScriptRoot
$appDir  = Join-Path $root 'app'
$distDir = Join-Path $root 'dist'
$stage   = Join-Path $distDir "OmniFetch-Desktop-v$Version"
$zipPath = "$stage.zip"

if (-not (Test-Path $appDir)) {
    Write-Host "[X] Pasta app\ nao encontrada em $root" -ForegroundColor Red
    exit 1
}

if ($Clean -and (Test-Path $distDir)) {
    Write-Host "[*] Limpando dist\ ..." -ForegroundColor DarkGray
    Remove-Item -LiteralPath $distDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
if (Test-Path $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Write-Host ''
Write-Host "  OMNIFETCH Desktop v$Version" -ForegroundColor Green
Write-Host '  -----------------------------------------------' -ForegroundColor DarkGray

# ---------- 1. compila o frontend ----------
Write-Host '  [1/4] Compilando interface (web)...' -ForegroundColor Cyan
Push-Location (Join-Path $appDir 'web')
npm install --no-audit --no-fund | Out-Null
npm run build | Out-Null
Pop-Location

# ---------- 2. compila o servidor ----------
Write-Host '  [2/4] Compilando servidor...' -ForegroundColor Cyan
Push-Location (Join-Path $appDir 'server')
npm install --no-audit --no-fund | Out-Null
npm run build | Out-Null
Pop-Location

# ---------- 3. monta o pacote ----------
Write-Host '  [3/4] Montando pacote...' -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path (Join-Path $stage 'server') | Out-Null
Copy-Item (Join-Path $appDir 'server\dist') (Join-Path $stage 'server\dist') -Recurse
Copy-Item (Join-Path $appDir 'server\package.json') (Join-Path $stage 'server\')
Copy-Item (Join-Path $appDir 'server\package-lock.json') (Join-Path $stage 'server\')

# dependencias de producao (express, nanoid) direto no pacote = roda sem npm install
Push-Location (Join-Path $stage 'server')
npm ci --omit=dev --no-audit --no-fund | Out-Null
Remove-Item 'package-lock.json'
Pop-Location

New-Item -ItemType Directory -Force -Path (Join-Path $stage 'web') | Out-Null
Copy-Item (Join-Path $appDir 'web\dist') (Join-Path $stage 'web\dist') -Recurse

New-Item -ItemType Directory -Force -Path (Join-Path $stage 'scripts') | Out-Null
foreach ($s in 'get-binaries.ps1', 'get-binaries.sh', 'criar-atalho.ps1', 'gerar-icone.ps1') {
    $p = Join-Path $appDir "scripts\$s"
    if (Test-Path $p) { Copy-Item $p (Join-Path $stage 'scripts\') }
}

# garante LF nos .sh do pacote (CRLF quebra bash no macOS/Linux)
Get-ChildItem $stage -Recurse -Filter '*.sh' | ForEach-Object {
    $txt = [System.IO.File]::ReadAllText($_.FullName)
    [System.IO.File]::WriteAllText($_.FullName, $txt.Replace("`r`n", "`n"))
}

Copy-Item (Join-Path $appDir 'omnifetch.ico') $stage
Copy-Item (Join-Path $appDir '.env.example') $stage

# ---------- inicializadores do pacote (sem npm: usam node direto) ----------

@'
@echo off
title OMNIFETCH
cd /d "%~dp0"

echo.
echo   ====================================
echo    OMNIFETCH - Downloader Universal
echo   ====================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo   [ERRO] Node.js nao encontrado.
    echo   Baixe e instale em:  https://nodejs.org  ^(versao LTS^)
    echo   Depois abra o OMNIFETCH de novo.
    echo.
    pause
    exit /b 1
)

set MOTORES_OK=1
if not exist "bin\yt-dlp.exe" (
    where yt-dlp >nul 2>nul
    if errorlevel 1 set MOTORES_OK=0
)
if not exist "bin\ffmpeg.exe" (
    where ffmpeg >nul 2>nul
    if errorlevel 1 set MOTORES_OK=0
)

if "%MOTORES_OK%"=="0" (
    echo   O OMNIFETCH precisa do yt-dlp e do ffmpeg para funcionar.
    echo   Posso baixar os dois automaticamente agora ^(uma vez so^).
    echo.
    choice /C SN /M "  Baixar agora"
    if errorlevel 2 (
        echo   Ok. Instale manualmente e abra de novo.
        pause
        exit /b 1
    )
    powershell -ExecutionPolicy Bypass -File "scripts\get-binaries.ps1"
)

echo   Iniciando... o navegador vai abrir sozinho.
echo   Para PARAR: feche esta janela ou use "Encerrar" nas configuracoes do app.
echo.
node server\dist\index.js
pause
'@ | Set-Content -LiteralPath (Join-Path $stage 'Iniciar OMNIFETCH.bat') -Encoding Ascii

@'
' OMNIFETCH - abre sem janela preta. Na primeira vez (ou faltando algo) abre o modo visivel.
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = dir

If sh.Run("cmd /c where node", 0, True) <> 0 Then
  MsgBox "O OMNIFETCH precisa do Node.js." & vbCrLf & "Baixe gratis em https://nodejs.org (versao LTS) e abra de novo.", 48, "OMNIFETCH"
  WScript.Quit
End If

hasYt = fso.FileExists(dir & "\bin\yt-dlp.exe")
If Not hasYt Then hasYt = (sh.Run("cmd /c where yt-dlp", 0, True) = 0)
hasFf = fso.FileExists(dir & "\bin\ffmpeg.exe")
If Not hasFf Then hasFf = (sh.Run("cmd /c where ffmpeg", 0, True) = 0)

If hasYt And hasFf Then
  sh.Run "cmd /c cd /d """ & dir & """ && node server\dist\index.js", 0, False
Else
  sh.Run """" & dir & "\Iniciar OMNIFETCH.bat""", 1, False
End If
'@ | Set-Content -LiteralPath (Join-Path $stage 'OMNIFETCH.vbs') -Encoding Ascii

$shScript = @'
#!/usr/bin/env bash
# OMNIFETCH - macOS / Linux
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERRO] Node.js nao encontrado. Instale em https://nodejs.org (LTS)."
  exit 1
fi

if ! command -v yt-dlp >/dev/null 2>&1 && [ ! -x bin/yt-dlp ]; then
  echo "Baixando o yt-dlp (uma vez so)..."
  bash scripts/get-binaries.sh
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "[AVISO] ffmpeg nao encontrado. Instale com:"
  echo "  macOS:  brew install ffmpeg"
  echo "  Linux:  sudo apt install ffmpeg"
fi

node server/dist/index.js
'@
[System.IO.File]::WriteAllText((Join-Path $stage 'iniciar.sh'), $shScript.Replace("`r`n", "`n"))

@'
OMNIFETCH v__VERSION__ - Downloader e conversor universal de videos
====================================================================

COMO USAR (Windows):
  1. Instale o Node.js (gratis): https://nodejs.org  (versao LTS)
  2. De dois cliques em "OMNIFETCH.vbs"
     - Na primeira vez ele oferece baixar os motores (yt-dlp + ffmpeg)
     - Depois disso, abre direto no navegador, sem janela preta
  3. Opcional: rode scripts\criar-atalho.ps1 para criar um atalho
     com icone na area de trabalho

COMO USAR (macOS / Linux):
  1. Instale o Node.js: https://nodejs.org
  2. No terminal:  bash iniciar.sh

PRIVACIDADE:
  Tudo roda localmente no seu computador. Nenhum link e enviado
  para servidores externos. Sem anuncios, sem telemetria.

USO RESPONSAVEL:
  Baixe apenas conteudos proprios, livres, autorizados ou
  permitidos pela lei e pelos termos de cada plataforma.
  O OMNIFETCH nao contorna DRM, paywall ou login.
'@ -replace '__VERSION__', $Version | Set-Content -LiteralPath (Join-Path $stage 'LEIA-ME.txt') -Encoding UTF8

# ---------- 4. gera o zip ----------
Write-Host '  [4/4] Compactando...' -ForegroundColor Cyan
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath -CompressionLevel Optimal

$zipSize = (Get-Item $zipPath).Length
Write-Host ''
Write-Host '  [ok] ' -NoNewline -ForegroundColor Green
Write-Host "$([math]::Round($zipSize/1MB,2)) MB  " -NoNewline
Write-Host '->  ' -NoNewline -ForegroundColor DarkGray
Write-Host $zipPath -ForegroundColor Cyan
Write-Host ''
