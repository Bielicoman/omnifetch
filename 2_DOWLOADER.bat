@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title OmniFetch Baixador Ultimate - Arsenal 100
color 0A

:inicio
cls
echo.
echo  ██████╗ ███╗   ███╗███╗   ██╗██╗███████╗███████╗████████╗ ██████╗ ██╗  ██╗
echo ██╔═══██╗████╗ ████║████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝ ██║  ██║
echo ██║   ██║██╔████╔██║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║      ███████║
echo ██║   ██║██║╚██╔╝██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║      ██╔══██║
echo ╚██████╔╝██║ ╚═╝ ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗ ██║  ██║
echo  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
echo.
echo  ======================================================
echo  ✨ OMNIFETCH BAIXADOR ULTIMATE - ARSENAL 100 ✨
echo  ======================================================
echo.

set "LINK="
set /p LINK=Cole o link aqui: 

if not defined LINK (
    echo  Nenhum link colado. Tente novamente.
    pause
    goto inicio
)

:: Limpa aspas caso o usuario cole com elas
set "LINK=!LINK:"=!"

:: --- RADAR DE PLAYLIST ---
set "PLAYLIST_ARG=--no-playlist"
set "OUTPUT_TEMPLATE=%%(title)s.%%(ext)s"

echo !LINK! | findstr /i "list=" >nul
if not errorlevel 1 (
    echo.
    echo  [!] PLAYLIST DETECTADA [!]
    echo  O link contem uma playlist ou mix. O que deseja baixar?
    echo  [1] Apenas ESTE video/audio
    echo  [2] A playlist INTEIRA
    echo.
    set "ESCOLHA_LISTA="
    set /p ESCOLHA_LISTA=Sua escolha: 

    if "!ESCOLHA_LISTA!"=="2" (
        set "PLAYLIST_ARG=--yes-playlist"
        set "OUTPUT_TEMPLATE=%%(playlist_title)s\%%(playlist_index)02d - %%(title)s.%%(ext)s"
        echo.
        echo  Modo Playlist ATIVADO.
    ) else (
        set "PLAYLIST_ARG=--no-playlist"
        echo.
        echo  Modo Video Unico ATIVADO.
    )
)
:: -------------------------

:menu_categorias
cls
echo.
echo  =========================================
echo  SELECIONE A CATEGORIA DE DOWNLOAD:
echo  =========================================
echo  [A] 01-10 : VIDEO - Alta Resolucao (4K, 1080p)
echo  [B] 11-20 : VIDEO - Leve / Mobile (720p, 480p)
echo  [C] 21-30 : AUDIO - Estudio / Lossless
echo  [D] 31-40 : AUDIO - Web / Comprimido
echo  [E] 41-50 : DOCUMENTOS (PDF, DOCX, TXT)
echo  [F] 51-60 : IMAGENS (JPG, PNG, SVG)
echo  [G] 61-70 : COMPACTADOS (ZIP, RAR, 7Z)
echo  [H] 71-80 : EXECUTAVEIS E ISOs (EXE, ISO)
echo  [I] 81-90 : REDES SOCIAIS (Shorts, Reels, TikTok)
echo  [J] 91-100: MOTOR UNIVERSAL (Qualquer outro link)
echo.
set /p CAT=Digite a letra da categoria (A-J): 

if /i "%CAT%"=="A" goto cat_A
if /i "%CAT%"=="B" goto cat_B
if /i "%CAT%"=="C" goto cat_C
if /i "%CAT%"=="D" goto cat_D
if /i "%CAT%"=="E" goto cat_E
if /i "%CAT%"=="F" goto cat_F
if /i "%CAT%"=="G" goto cat_G
if /i "%CAT%"=="H" goto cat_H
if /i "%CAT%"=="I" goto cat_I
if /i "%CAT%"=="J" goto cat_J

echo  Categoria invalida.
pause
goto menu_categorias

:cat_A
echo.
echo  -- 01-10: VIDEO ALTA RESOLUCAO --
echo  [1] MP4 - Maxima Qualidade Absoluta
echo  [2] MP4 - 4K (2160p)
echo  [3] MP4 - 2K (1440p)
echo  [4] MP4 - Full HD (1080p 60fps)
echo  [5] MP4 - Full HD (1080p 30fps)
echo  [6] MKV - Maxima Qualidade (Sem perdas de merge)
echo  [7] WEBM - Maxima Qualidade (VP9/Opus)
echo  [8] MOV - Formato Apple
echo  [9] AVI - Formato Legado Alta Qualidade
echo  [10] MP4 - HDR (Se disponivel)
goto pedir_opcao

:cat_B
echo.
echo  -- 11-20: VIDEO LEVE / MOBILE --
echo  [11] MP4 - HD (720p)
echo  [12] MP4 - SD (480p)
echo  [13] MP4 - Mobile (360p)
echo  [14] MP4 - Ultra Leve (240p)
echo  [15] MP4 - Pior Qualidade (Economia maxima de dados)
echo  [16] 3GP - Celulares Antigos
echo  [17] FLV - Flash Video
echo  [18] WMV - Windows Media Video
echo  [19] WEBM - Leve (480p)
echo  [20] MKV - Leve (720p)
goto pedir_opcao

:cat_C
echo.
echo  -- 21-30: AUDIO ESTUDIO / LOSSLESS --
echo  [21] WAV - Sem compressao (Padrao CD/Estudio)
echo  [22] FLAC - Compressao sem perdas (Alta qualidade)
echo  [23] ALAC - Apple Lossless
echo  [24] AIFF - Audio Interchange File Format
echo  [25] WAV - 32-bit float (Se suportado pela fonte)
echo  [26] FLAC - 24-bit (Se suportado pela fonte)
echo  [27] MKA - Matroska Audio Lossless
echo  [28] OGG - Qualidade Maxima (Q10)
echo  [29] OPUS - Qualidade Maxima (Estudio)
echo  [30] Extrair Melhor Audio Nativo (Sem conversao)
goto pedir_opcao

:cat_D
echo.
echo  -- 31-40: AUDIO WEB / COMPRIMIDO --
echo  [31] MP3 - 320kbps (Melhor MP3)
echo  [32] MP3 - 256kbps (Padrao iTunes)
echo  [33] MP3 - 192kbps (Bom custo-beneficio)
echo  [34] MP3 - 128kbps (Leve, para voz/podcasts)
echo  [35] M4A - AAC Alta Qualidade (Nativo YouTube)
echo  [36] M4A - AAC Leve
echo  [37] OPUS - Padrao Web Moderno (YouTube nativo)
echo  [38] OGG - Vorbis (Padrao Spotify)
echo  [39] WMA - Windows Media Audio
echo  [40] MP3 - 64kbps (Ultra leve para audiobooks)
goto pedir_opcao

:cat_E
echo.
echo  -- 41-50: DOCUMENTOS (Links Diretos) --
echo  [41] PDF - Documento Portatil
echo  [42] DOCX - Microsoft Word
echo  [43] TXT - Texto Simples
echo  [44] EPUB - E-book Padrao
echo  [45] MOBI / AZW3 - Kindle
echo  [46] XLSX - Planilha Excel
echo  [47] PPTX - Apresentacao PowerPoint
echo  [48] CSV - Dados separados por virgula
echo  [49] RTF - Rich Text Format
echo  [50] MD - Markdown
goto pedir_opcao

:cat_F
echo.
echo  -- 51-60: IMAGENS (Links Diretos) --
echo  [51] JPG / JPEG - Fotografia
echo  [52] PNG - Fundo Transparente / Alta Qualidade
echo  [53] WEBP - Imagem Web Otimizada
echo  [54] SVG - Vetor
echo  [55] GIF - Imagem Animada
echo  [56] TIFF - Imagem de Impressao
echo  [57] BMP - Bitmap Windows
echo  [58] ICO - Icone
echo  [59] HEIC - Formato Apple Foto
echo  [60] RAW / DNG - Arquivo Cru de Camera
goto pedir_opcao

:cat_G
echo.
echo  -- 61-70: COMPACTADOS (Links Diretos) --
echo  [61] ZIP - Arquivo Compactado Padrao
echo  [62] RAR - Arquivo WinRAR
echo  [63] 7Z - Arquivo 7-Zip (Alta compressao)
echo  [64] TAR.GZ - Arquivo Linux/Unix
echo  [65] TAR - Arquivo de Fita
echo  [66] BZ2 - Bzip2
echo  [67] XZ - Compressao XZ
echo  [68] GZ - Gzip
echo  [69] CAB - Windows Cabinet
echo  [70] ISO (Compactada)
goto pedir_opcao

:cat_H
echo.
echo  -- 71-80: EXECUTAVEIS E SISTEMAS (Links Diretos) --
echo  [71] EXE - Executavel Windows
echo  [72] MSI - Instalador Windows
echo  [73] ISO - Imagem de Disco (Windows/Linux)
echo  [74] DMG - Imagem de Disco Apple
echo  [75] APK - Aplicativo Android
echo  [76] APPIMAGE - Aplicativo Linux Portatil
echo  [77] DEB - Pacote Debian/Ubuntu
echo  [78] RPM - Pacote RedHat/Fedora
echo  [79] SH - Script Shell
echo  [80] BAT / CMD - Script Windows
goto pedir_opcao

:cat_I
echo.
echo  -- 81-90: REDES SOCIAIS (Midia) --
echo  [81] YouTube Shorts (MP4 Vertical)
echo  [82] Instagram Reels / Post (Melhor Qualidade)
echo  [83] TikTok Video (Sem marca d'agua se suportado)
echo  [84] Twitter / X Video
echo  [85] Facebook Video
echo  [86] Vimeo Video
echo  [87] Twitch VOD / Clip
echo  [88] Reddit Video (Com Audio)
echo  [89] Pinterest Video
echo  [90] LinkedIn Video
goto pedir_opcao

:cat_J
echo.
echo  -- 91-100: MOTOR UNIVERSAL (Forca Bruta) --
echo  [91] Baixar Arquivo Generico 1
echo  [92] Baixar Arquivo Generico 2
echo  [93] Baixar Arquivo Generico 3
echo  [94] Baixar Arquivo Generico 4
echo  [95] Baixar Arquivo Generico 5
echo  [96] Baixar Arquivo Generico 6
echo  [97] Baixar Arquivo Generico 7
echo  [98] Baixar Arquivo Generico 8
echo  [99] Baixar Arquivo Generico 9
echo  [100] FORCA BRUTA - Forcar download de qualquer URL
goto pedir_opcao

:pedir_opcao
echo.
set /p OPCAO=Digite o numero da sua escolha (1-100): 

echo.
set "PASTA="
set /p PASTA=Caminho da pasta para salvar (deixe em branco para Downloads): 

if not defined PASTA set "PASTA=%USERPROFILE%\Downloads"
set "PASTA=!PASTA:"=!"

if not exist "%PASTA%" (
    echo  Criando pasta: "%PASTA%"
    mkdir "%PASTA%"
)

echo.
echo  Iniciando download tatico... Aguarde.
echo.

:: --- ROTEAMENTO DE MOTORES ---

:: Se a opcao for de 41 a 80 ou 91 a 100, vai para o Motor Universal (cURL)
if %OPCAO% GEQ 41 if %OPCAO% LEQ 80 goto motor_universal
if %OPCAO% GEQ 91 if %OPCAO% LEQ 100 goto motor_universal

:: --- MOTOR DE MIDIA (yt-dlp) ---
:: 01-10: VIDEO ALTA
if "%OPCAO%"=="1" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="2" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="3" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="4" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=1080][fps>30][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="5" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=1080][fps<=30][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="6" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo+bestaudio/best" --merge-output-format mkv --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="7" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=webm]+bestaudio[ext=webm]/best" --merge-output-format webm --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="8" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo+bestaudio/best" --merge-output-format mov --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="9" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo+bestaudio/best" --merge-output-format avi --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="10" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[vcodec^=vp9.2]+bestaudio/best" --merge-output-format mkv --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

:: 11-20: VIDEO LEVE
if "%OPCAO%"=="11" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="12" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="13" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="14" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=240][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="15" yt-dlp %PLAYLIST_ARG% -f "worstvideo[ext=mp4]+worstaudio[ext=m4a]/worst" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="16" yt-dlp %PLAYLIST_ARG% -f "best[ext=3gp]/worst" -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="17" yt-dlp %PLAYLIST_ARG% -f "best[ext=flv]/worst" -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="18" yt-dlp %PLAYLIST_ARG% --merge-output-format wmv -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="19" yt-dlp %PLAYLIST_ARG% -f "bestvideo[height<=480][ext=webm]+bestaudio[ext=webm]/best" --merge-output-format webm -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="20" yt-dlp %PLAYLIST_ARG% -f "bestvideo[height<=720]+bestaudio/best" --merge-output-format mkv -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

:: 21-30: AUDIO LOSSLESS
if "%OPCAO%"=="21" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format wav -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="22" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format flac -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="23" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format alac -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="24" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format aiff -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="25" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format wav -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="26" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format flac -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="27" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mka -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="28" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format vorbis --audio-quality 0 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="29" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format opus -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="30" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

:: 31-40: AUDIO WEB
if "%OPCAO%"=="31" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 320K -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="32" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 256K -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="33" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 192K -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="34" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 128K -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="35" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio[ext=m4a]/bestaudio/best" --extract-audio --audio-format m4a -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="36" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio[ext=m4a]/bestaudio/best" --extract-audio --audio-format m4a --audio-quality 128K -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="37" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio[ext=webm]/bestaudio/best" --extract-audio --audio-format opus -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="38" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format vorbis --audio-quality 5 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="39" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format wma -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="40" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 64K -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

:: 81-90: REDES SOCIAIS
if "%OPCAO%"=="81" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="82" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="83" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="84" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="85" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="86" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="87" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="88" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="89" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="90" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

echo  Opcao invalida.
pause
goto menu_categorias

:: --- MOTOR UNIVERSAL (cURL) ---
:motor_universal
echo  [ RADAR ] Acionando Motor Universal de Download Direto...
cd /d "%PASTA%"
curl -L -O -J "%LINK%"
goto fim

:fim
echo.
echo  ================================
echo  CONCLUIDO! Arquivo(s) salvo(s) em:
echo  %PASTA%
echo  ================================
echo.
set /p CONTINUAR=Baixar outro? S para sim, qualquer tecla para sair: 
if /i "%CONTINUAR%"=="S" goto inicio
exit