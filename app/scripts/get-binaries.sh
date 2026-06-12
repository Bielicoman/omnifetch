#!/usr/bin/env bash
# OMNIFETCH — baixa o yt-dlp portátil para ./bin (macOS/Linux)
# O ffmpeg deve ser instalado pelo gerenciador de pacotes (brew/apt/dnf/pacman).
# Uso:  bash scripts/get-binaries.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/bin"
mkdir -p "$BIN"

echo ""
echo "  OMNIFETCH — instalador de binários portáteis"
echo ""
echo "  [1/1] Baixando yt-dlp..."

OS="$(uname -s)"
if [ "$OS" = "Darwin" ]; then
  URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
else
  URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"
fi

curl -L --progress-bar "$URL" -o "$BIN/yt-dlp"
chmod +x "$BIN/yt-dlp"
echo "        ok -> $BIN/yt-dlp"

echo ""
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "  ⚠ ffmpeg não encontrado. Instale com:"
  if [ "$OS" = "Darwin" ]; then
    echo "      brew install ffmpeg"
  else
    echo "      sudo apt install ffmpeg    (Debian/Ubuntu)"
    echo "      sudo dnf install ffmpeg    (Fedora)"
    echo "      sudo pacman -S ffmpeg      (Arch)"
  fi
else
  echo "  ffmpeg já está instalado: $(command -v ffmpeg)"
fi
echo ""
echo "  Pronto! O OMNIFETCH vai detectar os binários automaticamente."
echo ""
