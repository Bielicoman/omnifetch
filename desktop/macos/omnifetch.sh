#!/bin/bash

# Portability: Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Load libraries
source "./lib/ui.sh"
source "./lib/config.sh"

init_app() {
    mkdir -p "../data" "../logs"
    load_config
    if [ ! -f "../data/config.ini" ]; then
        save_config
    fi
}

refresh_status() {
    # On macOS, we assume engines are in PATH or handled by homebrew
    # But we can also check for local engines folder
    S_YT="${RED}off${RST}"
    S_FF="${RED}off${RST}"
    S_AR="${DIM}off${RST}"

    if command -v yt-dlp &> /dev/null; then S_YT="${GREEN}on${RST}"; fi
    if command -v ffmpeg &> /dev/null; then S_FF="${GREEN}on${RST}"; fi
    if command -v aria2c &> /dev/null; then S_AR="${GREEN}on${RST}"; fi
}

menu() {
    while true; do
        clear_screen
        draw_header
        print_banner "LAUNCHER" "universal downloader + converter"
        
        echo -e "  ${WHITE}${BOLD}COMO QUER USAR HOJE?${RST}"
        echo -e ""
        echo -e "    ${GREEN}[1]${RST}  ${WHITE}Downloader${RST}        link, fila, cookies, 4K, audio e aria2 turbo"
        echo -e "    ${GREEN}[2]${RST}  ${WHITE}Conversor${RST}         presets profissionais para video, audio, imagem e ebook"
        echo -e "    ${GREEN}[3]${RST}  ${WHITE}OmniTools${RST}         inspector, cortes, legendas, renomeador e relatorios"
        echo -e "    ${YELLOW}[4]${RST}  ${WHITE}Setup / atualizar${RST} motores via Homebrew, atalhos e icones"
        echo -e "    ${CYAN}[5]${RST}  ${WHITE}Preferencias${RST}      velocidade, qualidade, UX e atalhos salvos"
        echo -e "    ${DIM}[6]  Abrir pasta Downloads${RST}"
        echo -e "    ${DIM}[7]  Historico e logs${RST}"
        echo -e "    ${DIM}[8]  Diagnostico rapido${RST}"
        echo -e "    ${DIM}[Q]  Sair${RST}"
        echo -e ""
        echo -e "  ${BAR}"
        refresh_status
        echo -e "  motores: yt-dlp $S_YT   ffmpeg $S_FF   aria2 $S_AR"
        echo -e "  perfil: $SPEED_PROFILE   fragments: $CONCURRENT_FRAGMENTS   intro: $INTRO_ANIMATION"
        echo -e "  ${BAR}"
        echo -e ""
        echo -ne "  ${GREEN}>${RST} "
        read -r OPT

        case "$OPT" in
            1) ./downloader.sh ;;
            2) ./conversor.sh ;;
            3) echo -e "\n${RED}OmniTools em breve para Mac OS.${RST}"; sleep 2 ;;
            4) ./setup.sh ;;
            5) preferences_menu ;;
            6) open "$HOME/Downloads" ;;
            7) echo -e "\n${DIM}Historico em breve para Mac OS.${RST}"; sleep 2 ;;
            8) diagnostic ;;
            q|Q) echo -e "\n  ${GREEN}ate logo.${RST}"; exit 0 ;;
            *) echo -e "\n  ${RED}[erro]${RST} Opcao invalida."; sleep 1 ;;
        esac
    done
}

preferences_menu() {
    while true; do
        clear_screen
        draw_header
        print_banner "PREFERENCIAS" "controle fino sem complicar"
        
        echo -e "  ${WHITE}${BOLD}Perfil salvo para todos os programas${RST}"
        echo -e ""
        echo -e "  ${WHITE}[1]${RST} Pasta padrao:        $DEFAULT_DEST"
        echo -e "  ${WHITE}[2]${RST} Cookies/browser:     $DEFAULT_BROWSER"
        echo -e "  ${WHITE}[3]${RST} Abrir ao finalizar:  $OPEN_WHEN_DONE"
        echo -e "  ${WHITE}[4]${RST} Intro premium:       $INTRO_ANIMATION"
        echo -e "  ${WHITE}[5]${RST} Velocidade:          $SPEED_PROFILE  ($CONCURRENT_FRAGMENTS fragments)"
        echo -e "  ${WHITE}[6]${RST} Metadata/thumbnails: $EMBED_METADATA / $EMBED_THUMBNAIL"
        echo -e "  ${YELLOW}[B]${RST} Voltar"
        echo -e ""
        echo -ne "  ${GREEN}>${RST} "
        read -r POPT

        case "$POPT" in
            1) 
                echo -ne "\n  Nova pasta padrao: "
                read -r NEW_DEST
                if [ -n "$NEW_DEST" ]; then
                    mkdir -p "$NEW_DEST"
                    DEFAULT_DEST="$NEW_DEST"
                    save_config
                fi
                ;;
            2)
                echo -e "\n  ${WHITE}[1]${RST} Chrome   ${WHITE}[2]${RST} Firefox   ${WHITE}[3]${RST} Safari"
                read -r B_CHOICE
                case "$B_CHOICE" in
                    1) DEFAULT_BROWSER="chrome" ;;
                    2) DEFAULT_BROWSER="firefox" ;;
                    3) DEFAULT_BROWSER="safari" ;;
                esac
                save_config
                ;;
            3) [ "$OPEN_WHEN_DONE" == "S" ] && OPEN_WHEN_DONE="N" || OPEN_WHEN_DONE="S"; save_config ;;
            4)
                echo -e "\n  ${WHITE}[1]${RST} Full premium   ${WHITE}[2]${RST} Rapida   ${WHITE}[3]${RST} Off"
                read -r I_CHOICE
                case "$I_CHOICE" in
                    1) INTRO_ANIMATION="full" ;;
                    2) INTRO_ANIMATION="fast" ;;
                    3) INTRO_ANIMATION="off" ;;
                esac
                save_config
                ;;
            b|B) return ;;
        esac
    done
}

diagnostic() {
    clear_screen
    draw_header
    print_banner "DIAGNOSTICO" "estado do OmniFetch (Mac OS)"
    
    echo -e "  ${WHITE}Raiz:${RST}       $SCRIPT_DIR"
    echo -e "  ${WHITE}Downloads:${RST}  $DEFAULT_DEST"
    echo -e "  ${WHITE}Data:${RST}       $(date)"
    echo -e ""
    echo -e "  ${WHITE}${BOLD}Motores${RST}"
    
    check_tool() {
        if command -v "$1" &> /dev/null; then
            echo -e "  ${GREEN}[ok]${RST} $1   ${DIM}$($1 $2 | head -n 1)${RST}"
        else
            echo -e "  ${RED}[off]${RST} $1 nao encontrado."
        fi
    }

    check_tool "yt-dlp" "--version"
    check_tool "ffmpeg" "-version"
    check_tool "aria2c" "--version"
    check_tool "curl" "--version"
    
    echo -e ""
    echo -ne "  Pressione ENTER para voltar"
    read -r
}

# Run
init_app
if [ "$INTRO_ANIMATION" != "off" ]; then
    clear_screen
    draw_header
    # Splash logic here if needed
    sleep 1
fi
menu
