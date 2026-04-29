#!/bin/bash

# Portability: Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Load libraries
source "./lib/ui.sh"

clear_screen
draw_header
print_banner "SETUP" "instalador de dependencias (Linux)"

echo -e "  Este script ira verificar e instalar as dependencias necessarias."
echo -e ""

# Detect Package Manager
if command -v apt &> /dev/null; then
    PM="sudo apt install -y"
    PM_NAME="APT (Debian/Ubuntu/Mint)"
elif command -v pacman &> /dev/null; then
    PM="sudo pacman -S --noconfirm"
    PM_NAME="Pacman (Arch/Manjaro)"
elif command -v dnf &> /dev/null; then
    PM="sudo dnf install -y"
    PM_NAME="DNF (Fedora/RHEL)"
else
    echo -e "  ${RED}Gerenciador de pacotes nao reconhecido.${RST}"
    echo -e "  Por favor, instale manualmente: ${CYAN}yt-dlp, ffmpeg, aria2${RST}"
    exit 1
fi

echo -e "  Detectado: ${CYAN}$PM_NAME${RST}"
echo -e "  Deseja prosseguir com a instalacao automatica? (S/N)"
read -r PM_OPT
if [[ ! "$PM_OPT" =~ ^[Ss]$ ]]; then
    echo -e "  ${YELLOW}Instalacao cancelada.${RST}"
    exit 0
fi

install_dep() {
    local name="$1"
    local bin="$2"
    local pkg="$3"
    if ! command -v "$bin" &> /dev/null; then
        echo -e "  ${CYAN}Instalando $name...${RST}"
        $PM "$pkg"
    else
        echo -e "  ${GREEN}[ok]${RST} $name ja instalado."
    fi
}

echo -e ""
echo -e "  ${WHITE}Verificando ferramentas...${RST}"
install_dep "yt-dlp" "yt-dlp" "yt-dlp"
install_dep "ffmpeg" "ffmpeg" "ffmpeg"
install_dep "aria2" "aria2c" "aria2"

echo -e ""
echo -e "  ${GREEN}${BOLD}Tudo pronto!${RST}"
echo -e "  Voce ja pode rodar o ${WHITE}omnifetch.sh${RST}."
echo -e ""
echo -ne "  Pressione ENTER para finalizar"
read -r
