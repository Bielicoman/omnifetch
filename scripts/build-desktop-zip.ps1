# =============================================================
#  OmniFetch  ·  build-desktop-zip.ps1
#  Gera o pacote distribuivel da versao Desktop.
#  Saida: dist/OmniFetch-Desktop-vX.Y.zip
# =============================================================

param(
    [string]$Version = '4.0.0',
    [switch]$IncludeMotores,    # se passado, inclui yt-dlp/ffmpeg ja baixados (zip pesado)
    [switch]$Clean
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$desktopDir = Join-Path $root 'desktop'
$distDir    = Join-Path $root 'dist'
$stage      = Join-Path $distDir "OmniFetch-Desktop-v$Version"
$zipPath    = "$stage.zip"

if (-not (Test-Path $desktopDir)) {
    Write-Host "[X] Pasta desktop\ nao encontrada em $root" -ForegroundColor Red
    exit 1
}

if ($Clean -and (Test-Path $distDir)) {
    Write-Host "[*] Limpando dist\ ..." -ForegroundColor DarkGray
    Remove-Item -LiteralPath $distDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
if (Test-Path $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Write-Host ""
Write-Host "  OmniFetch Desktop v$Version" -ForegroundColor Green
Write-Host "  -----------------------------------------------" -ForegroundColor DarkGray

# Itens que vao pro zip
$items = @(
    'windows',
    'macos',
    'linux',
    'core',
    'assets',
    'LEIA-ME.txt'
)

foreach ($it in $items) {
    $src = Join-Path $desktopDir $it
    if (-not (Test-Path -LiteralPath $src)) {
        Write-Host "  [skip] $it (nao existe)" -ForegroundColor Yellow
        continue
    }
    $dst = Join-Path $stage $it
    Copy-Item -LiteralPath $src -Destination $dst -Recurse -Force
    Write-Host "  [+]    $it" -ForegroundColor Cyan
}

# motores/  (sempre cria o folder vazio; opcionalmente copia)
$motorDst = Join-Path $stage 'motores'
New-Item -ItemType Directory -Force -Path $motorDst | Out-Null

if ($IncludeMotores) {
    $motorSrc = Join-Path $desktopDir 'motores'
    if (Test-Path $motorSrc) {
        Get-ChildItem $motorSrc -File | ForEach-Object {
            Copy-Item $_.FullName -Destination $motorDst -Force
            Write-Host "  [+]    motores\$($_.Name) ($([math]::Round($_.Length/1MB,1)) MB)" -ForegroundColor Cyan
        }
    }
} else {
    @"
Esta pasta sera preenchida automaticamente quando voce rodar
o Instalar.bat pela primeira vez.

Conteudo esperado:
  - yt-dlp.exe   (downloader universal)
  - ffmpeg.exe   (conversao + merge)
  - ffprobe.exe  (analise de midia)
  - aria2c.exe   (acelerador opcional)
"@ | Set-Content -LiteralPath (Join-Path $motorDst 'README.txt') -Encoding UTF8
}

# Gera o ZIP
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Write-Host ""
Write-Host "  Compactando -> $(Split-Path $zipPath -Leaf) ..." -ForegroundColor DarkGray
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath -CompressionLevel Optimal

$zipSize = (Get-Item $zipPath).Length
Write-Host ""
Write-Host "  [ok] " -NoNewline -ForegroundColor Green
Write-Host "$([math]::Round($zipSize/1MB,2)) MB  " -NoNewline
Write-Host "->  " -NoNewline -ForegroundColor DarkGray
Write-Host $zipPath -ForegroundColor Cyan
Write-Host ""
Write-Host "  Proximos passos:" -ForegroundColor DarkGray
Write-Host "    1) gh release create v$Version `"$zipPath`" --title `"v$Version`" --notes `"OmniFetch Desktop v$Version`"" -ForegroundColor White
Write-Host "    2) atualizar o link de download no site/index.html (ja aponta para /releases/latest)" -ForegroundColor White
Write-Host ""
