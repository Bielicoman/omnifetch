#!/bin/bash

# Portability: Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Load libraries
source "./lib/ui.sh"

clear_screen
draw_header
print_banner "SETUP" "instalador de dependencias (Mac OS)"

echo -e "  Este script ira verificar e instalar as dependencias necessarias via ${CYAN}Homebrew${RST}."
echo -e ""

if ! command -v brew &> /dev/null; then
    echo -e "  ${YELLOW}Homebrew nao detectado.${RST}"
    echo -e "  Deseja instalar o Homebrew agora? (S/N)"
    read -r BREW_OPT
    if [[ "$BREW_OPT" =~ ^[Ss]$ ]]; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        echo -e "  ${RED}Homebrew e necessario para continuar.${RST}"
        exit 1
    fi
fi

install_dep() {
    local name="$1"
    local bin="$2"
    if ! command -v "$bin" &> /dev/null; then
        echo -e "  ${CYAN}Instalando $name...${RST}"
        brew install "$name"
    else
        echo -e "  ${GREEN}[ok]${RST} $name ja instalado."
    fi
}

echo -e "  ${WHITE}Verificando ferramentas...${RST}"
install_dep "yt-dlp" "yt-dlp"
install_dep "ffmpeg" "ffmpeg"
install_dep "aria2" "aria2c"

echo -e ""
echo -e "  ${GREEN}${BOLD}Tudo pronto!${RST}"
echo -e "  Voce ja pode rodar o ${WHITE}omnifetch.sh${RST}."
echo -e ""
echo -ne "  Pressione ENTER para finalizar"
read -r
