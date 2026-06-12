# OMNIFETCH — baixa binários portáteis de yt-dlp e ffmpeg para a pasta .\bin (Windows)
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\get-binaries.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$bin = Join-Path $root 'bin'
New-Item -ItemType Directory -Force $bin | Out-Null

Write-Host ''
Write-Host '  OMNIFETCH — instalador de binarios portateis' -ForegroundColor Green
Write-Host ''

# ---- yt-dlp ----
$ytdlp = Join-Path $bin 'yt-dlp.exe'
Write-Host '  [1/2] Baixando yt-dlp...' -ForegroundColor Cyan
Invoke-WebRequest -Uri 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' -OutFile $ytdlp
Write-Host "        ok -> $ytdlp" -ForegroundColor Green

# ---- ffmpeg (build essentials da gyan.dev) ----
Write-Host '  [2/2] Baixando ffmpeg (pode demorar alguns minutos)...' -ForegroundColor Cyan
$zip = Join-Path $env:TEMP 'omnifetch-ffmpeg.zip'
$extract = Join-Path $env:TEMP 'omnifetch-ffmpeg'
Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile $zip
if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
Expand-Archive -Path $zip -DestinationPath $extract -Force
$ffmpegExe = Get-ChildItem -Path $extract -Recurse -Filter 'ffmpeg.exe' | Select-Object -First 1
$ffprobeExe = Get-ChildItem -Path $extract -Recurse -Filter 'ffprobe.exe' | Select-Object -First 1
Copy-Item $ffmpegExe.FullName (Join-Path $bin 'ffmpeg.exe') -Force
if ($ffprobeExe) { Copy-Item $ffprobeExe.FullName (Join-Path $bin 'ffprobe.exe') -Force }
Remove-Item $zip -Force
Remove-Item -Recurse -Force $extract
Write-Host "        ok -> $(Join-Path $bin 'ffmpeg.exe')" -ForegroundColor Green

Write-Host ''
Write-Host '  Pronto! O OMNIFETCH vai detectar os binarios na pasta .\bin automaticamente.' -ForegroundColor Green
Write-Host ''
