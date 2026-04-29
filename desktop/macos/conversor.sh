#!/bin/bash

# Portability: Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Load libraries
source "./lib/ui.sh"
source "./lib/config.sh"

load_config

run_conversion() {
    local input="$1"
    local output="$2"
    local args="$3"
    local preset="$4"
    
    clear_screen
    draw_header
    print_banner "CONVERSOR" "processando"
    
    echo -e "  ${CYAN}Preset:${RST}     $preset"
    echo -e "  ${CYAN}Entrada:${RST}    $input"
    echo -e "  ${CYAN}Saida:${RST}      $output"
    echo -e ""
    
    ffmpeg -i "$input" $args "$output" 2>&1
    
    local rc=$?
    
    echo -e "\n  ${BAR}"
    if [ $rc -eq 0 ]; then
        echo -e "  ${GREEN}${BOLD}Concluido.${RST}"
        if [ "$OPEN_WHEN_DONE" == "S" ]; then open "$(dirname "$output")"; fi
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
    print_banner "CONVERSOR" "ffmpeg engine (Mac OS)"
    
    echo -e "  ${WHITE}${BOLD}Arquivo de entrada${RST}"
    echo -e "  ${DIM}Arraste o arquivo para esta janela ou ENTER para sair.${RST}"
    echo -e ""
    echo -ne "  ${GREEN}>${RST} "
    read -r INPUT

    if [ -z "$INPUT" ]; then exit 0; fi
    # Clean input path (handle dragging from Finder)
    INPUT="${INPUT%\'}"
    INPUT="${INPUT#\'}"
    INPUT="${INPUT%\"}"
    INPUT="${INPUT#\"}"

    if [ ! -f "$INPUT" ]; then
        echo -e "\n  ${RED}[erro]${RST} Arquivo nao encontrado."; sleep 1; continue
    fi

    echo -e "\n  ${DIM}Escolha o formato de saida:${RST}"
    echo -e "    ${WHITE}[1]${RST} MP4 (H.264 + AAC)"
    echo -e "    ${WHITE}[2]${RST} MKV (High Quality)"
    echo -e "    ${WHITE}[3]${RST} MP3 (320kbps)"
    echo -e "    ${WHITE}[4]${RST} WAV (Lossless)"
    echo -e "    ${WHITE}[5]${RST} GIF (Animated)"
    echo -e "    ${YELLOW}[Q]${RST} Cancelar"
    echo -e ""
    echo -ne "    ${GREEN}>${RST} "
    read -r CHOICE

    filename=$(basename -- "$INPUT")
    extension="${filename##*.}"
    filename="${filename%.*}"
    dir=$(dirname "$INPUT")

    case "$CHOICE" in
        1) run_conversion "$INPUT" "$dir/${filename}_converted.mp4" "-c:v libx244 -crf 23 -c:a aac -b:a 192k" "MP4 Standard" ;;
        2) run_conversion "$INPUT" "$dir/${filename}_converted.mkv" "-c copy" "MKV Copy" ;;
        3) run_conversion "$INPUT" "$dir/${filename}_converted.mp3" "-vn -ab 320k" "MP3 320k" ;;
        4) run_conversion "$INPUT" "$dir/${filename}_converted.wav" "-vn" "WAV" ;;
        5) run_conversion "$INPUT" "$dir/${filename}_converted.gif" "-vf fps=10,scale=320:-1:flags=lanczos" "GIF" ;;
        q|Q) continue ;;
        *) echo -e "\n  ${RED}[erro]${RST} Opcao invalida."; sleep 1 ;;
    esac
done
