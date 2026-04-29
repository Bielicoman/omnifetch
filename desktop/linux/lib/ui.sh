#!/bin/bash

# Colors & Style
RST="\033[0m"
BOLD="\033[1m"
GREEN="\033[38;2;0;255;136m"
SOFT_GREEN="\033[38;2;44;255;166m"
CYAN="\033[38;2;0;180;255m"
YELLOW="\033[38;2;255;205;80m"
RED="\033[38;2;255;85;85m"
AMBER="\033[38;2;255;190;60m"
DIM="\033[38;2;104;128;136m"
LINE="\033[38;2;22;82;62m"
WHITE="\033[97m"
BAR="${DIM}----------------------------------------------------------------${RST}"

WIDTH=92

wait_frame() {
    local ms=${1:-42}
    if [ "$ms" -gt 0 ]; then
        sleep "$(echo "scale=3; $ms/1000" | bc)"
    fi
}

write_animated_line() {
    local text="$1"
    local color="${2:-$WHITE}"
    local ms="${3:-42}"
    echo -e "${color}${text}${RST}"
    wait_frame "$ms"
}

write_logo() {
    echo -e "${GREEN}${BOLD}  ######  ##     ## ##    ## #### ######## ######## ########  ######  ##     ##${RST}"
    echo -e "  ${GREEN}${BOLD}>_ OMNIFETCH${RST}  ${DIM} terminal cli (Mac OS)${RST}"
}

print_banner() {
    local title="$1"
    local subtitle="$2"
    echo -e "\n"
    write_logo
    echo -e "\n"
    echo -e "  ${WHITE}${BOLD}OmniFetch ${title}${RST}   ${DIM}- ${subtitle}${RST}"
    echo -e "  ${BAR}"
    echo -e ""
}

clear_screen() {
    clear
}

draw_header() {
    echo -e "${LINE}+$(printf -- '-%.0s' $(seq 1 $((WIDTH - 2))))+${RST}"
    echo -e "${LINE}|${RST}  ${RED}*${RST} ${AMBER}*${RST} ${GREEN}*${RST}${DIM}$(printf -- ' %.0s' $(seq 1 27))OmniFetch - Terminal CLI$(printf -- ' %.0s' $(seq 1 28))${LINE}|${RST}"
    echo -e "${LINE}+$(printf -- '-%.0s' $(seq 1 $((WIDTH - 2))))+${RST}"
}
