#!/bin/bash

# Portability: Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Load libraries
source "./lib/ui.sh"
source "./lib/config.sh"

load_config

apply_speed_profile() {
    case "$SPEED_PROFILE" in
        turbo)
            CONCURRENT_FRAGMENTS=16
            DOWNLOAD_RETRIES=20
            ARIA_CONNECTIONS=16
            ARIA_SPLITS=16
            ARIA_CHUNK="1M"
            ;;
        balanced)
            CONCURRENT_FRAGMENTS=8
            DOWNLOAD_RETRIES=12
            ARIA_CONNECTIONS=8
            ARIA_SPLITS=8
            ARIA_CHUNK="1M"
            ;;
        *)
            CONCURRENT_FRAGMENTS=4
            DOWNLOAD_RETRIES=8
            ARIA_CONNECTIONS=4
            ARIA_SPLITS=4
            ARIA_CHUNK="1M"
            ;;
    esac
}

run_download() {
    local link="$1"
    local format="$2"
    local preset="$3"
    local extra="$4"
    
    local log_file="../../logs/download-$(date +%Y%m%d-%H%M%S).log"
    
    clear_screen
    draw_header
    print_banner "DOWNLOADER" "baixando"
    
    echo -e "  ${CYAN}Preset:${RST}     $preset"
    echo -e "  ${CYAN}Destino:${RST}    ${WHITE}$DEFAULT_DEST${RST}"
    echo -e "  ${CYAN}Log:${RST}        $log_file"
    echo -e ""
    
    local aria_args=""
    if command -v aria2c &> /dev/null; then
        aria_args="--downloader aria2c --downloader-args aria2c:-x $ARIA_CONNECTIONS -s $ARIA_SPLITS -k $ARIA_CHUNK --file-allocation=none"
    fi
    
    local meta_args=""
    if [ "$EMBED_METADATA" == "S" ]; then meta_args="$meta_args --embed-metadata"; fi
    if [ "$EMBED_THUMBNAIL" == "S" ]; then meta_args="$meta_args --embed-thumbnail --convert-thumbnails jpg"; fi

    yt-dlp \
        --newline \
        --no-mtime \
        --retries "$DOWNLOAD_RETRIES" \
        --fragment-retries "$DOWNLOAD_RETRIES" \
        --concurrent-fragments "$CONCURRENT_FRAGMENTS" \
        $meta_args \
        $aria_args \
        -P "$DEFAULT_DEST" \
        -f "$format" \
        $extra \
        "$link" 2>&1 | tee "$log_file"
    
    local rc=${PIPESTATUS[0]}
    
    echo -e "\n  ${BAR}"
    if [ $rc -eq 0 ]; then
        echo -e "  ${GREEN}${BOLD}Concluido.${RST} Arquivo salvo em:"
        echo -e "  ${WHITE}$DEFAULT_DEST${RST}"
        if [ "$OPEN_WHEN_DONE" == "S" ]; then open "$DEFAULT_DEST"; fi
    else
        echo -e "  ${RED}${BOLD}Falhou.${RST} Erro código $rc."
    fi
    echo -e "  ${BAR}\n"
    echo -ne "  Pressione ENTER para voltar"
    read -r
}

while true; do
    clear_screen
    draw_header
    print_banner "DOWNLOADER" "universal (Mac OS)"
    
    echo -e "  ${WHITE}${BOLD}Baixar agora${RST}"
    echo -e "  ${DIM}Cole um link e pressione ENTER. ENTER vazio sai.${RST}"
    echo -e ""
    echo -e "  ${DIM}Destino:${RST} $DEFAULT_DEST"
    echo -e ""
    echo -ne "  ${GREEN}>${RST} "
    read -r LINK

    if [ -z "$LINK" ]; then exit 0; fi

    echo -e "\n  ${DIM}Escolha o formato:${RST}"
    echo -e "    ${GREEN}[ENTER]${RST} Melhor qualidade"
    echo -e "    ${WHITE}[1]${RST} MP4 automatico"
    echo -e "    ${WHITE}[2]${RST} 1080p MP4"
    echo -e "    ${WHITE}[3]${RST} 720p MP4"
    echo -e "    ${GREEN}[A]${RST} Audio MP3 320"
    echo -e "    ${YELLOW}[Q]${RST} Cancelar"
    echo -e ""
    echo -ne "    ${GREEN}>${RST} "
    read -r CHOICE

    case "$CHOICE" in
        1) run_download "$LINK" "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b" "MP4 Auto" "--merge-output-format mp4" ;;
        2) run_download "$LINK" "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/b" "1080p MP4" "--merge-output-format mp4" ;;
        3) run_download "$LINK" "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720][ext=mp4]/b" "720p MP4" "--merge-output-format mp4" ;;
        a|A) run_download "$LINK" "bestaudio/best" "Audio MP3" "--extract-audio --audio-format mp3 --audio-quality 320K" ;;
        q|Q) continue ;;
        *) run_download "$LINK" "bv*+ba/b" "Melhor Qualidade" "" ;;
    esac
done
