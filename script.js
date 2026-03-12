
const codes = {
    setup: `@echo off
chcp 65001 >nul
title OmniFetch Instalador Portatil
color 0B

:: --- ELEVACAO AUTOMATICA PARA ADMINISTRADOR ---
>nul 2>&1 "%SYSTEMROOT%\\system32\\cacls.exe" "%SYSTEMROOT%\\system32\\config\\system"
if '%errorlevel%' NEQ '0' (
    echo  Solicitando privilegios de Administrador...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"
    "%temp%\\getadmin.vbs"
    del "%temp%\\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:: ----------------------------------------------

cls
echo.
echo  ██████╗ ███╗   ███╗███╗   ██╗██╗███████╗███████╗████████╗ ██████╗ ██╗  ██╗
echo ██╔═══██╗████╗ ████║████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝ ██║  ██║
echo ██║   ██║██╔████╔██║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║      ███████║
echo ██║   ██║██║╚██╔╝██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║      ██╔══██║
echo ╚██████╔╝██║ ╚═╝ ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗ ██║  ██║
echo  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
echo.
echo  =======================================
echo  ✨ INSTALADOR OMNIFETCH PORTATIL ✨
echo  =======================================
echo  Baixando motores independentes (Zero Reinicios)...
echo.

:: Cria a pasta de motores se nao existir
if not exist "%~dp0motores" mkdir "%~dp0motores"

echo  [1/3] Baixando motor de Download (yt-dlp)...
curl -L -o "%~dp0motores\\yt-dlp.exe" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"

echo.
echo  [2/3] Baixando motor de Conversao (FFmpeg)...
curl -L -o "%~dp0motores\\ffmpeg.zip" "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
echo  Extraindo arquivos...
powershell -Command "Expand-Archive -Path '%~dp0motores\\ffmpeg.zip' -DestinationPath '%~dp0motores\\ffmpeg_temp' -Force"
move /y "%~dp0motores\\ffmpeg_temp\\*\\bin\\ffmpeg.exe" "%~dp0motores\\" >nul
move /y "%~dp0motores\\ffmpeg_temp\\*\\bin\\ffprobe.exe" "%~dp0motores\\" >nul
rmdir /s /q "%~dp0motores\\ffmpeg_temp"
del /q "%~dp0motores\\ffmpeg.zip"

echo.
echo  [3/3] Instalando motor de Documentos (Calibre)...
winget install calibre.calibre --silent --accept-package-agreements --accept-source-agreements

echo.
echo  =======================================
echo  🎉 MOTORES PORTATEIS INSTALADOS! 🎉
echo  =======================================
echo  Tudo pronto! NAO e necessario reiniciar o PC.
echo  Pressione qualquer tecla para sair.
pause >nul
exit`,

    downloader: `@echo off
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
        set "OUTPUT_TEMPLATE=%%(playlist_title)s\\%%(playlist_index)02d - %%(title)s.%%(ext)s"
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

if not defined PASTA set "PASTA=%USERPROFILE%\\Downloads"
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
if "%OPCAO%"=="1" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="2" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="3" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="4" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=1080][fps>30][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="5" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=1080][fps<=30][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="6" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo+bestaudio/best" --merge-output-format mkv --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="7" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=webm]+bestaudio[ext=webm]/best" --merge-output-format webm --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="8" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo+bestaudio/best" --merge-output-format mov --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="9" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo+bestaudio/best" --merge-output-format avi --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="10" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[vcodec^=vp9.2]+bestaudio/best" --merge-output-format mkv --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

:: 11-20: VIDEO LEVE
if "%OPCAO%"=="11" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="12" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="13" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="14" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[height<=240][ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --concurrent-fragments 4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="15" yt-dlp %PLAYLIST_ARG% -f "worstvideo[ext=mp4]+worstaudio[ext=m4a]/worst" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="16" yt-dlp %PLAYLIST_ARG% -f "best[ext=3gp]/worst" -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="17" yt-dlp %PLAYLIST_ARG% -f "best[ext=flv]/worst" -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="18" yt-dlp %PLAYLIST_ARG% --merge-output-format wmv -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="19" yt-dlp %PLAYLIST_ARG% -f "bestvideo[height<=480][ext=webm]+bestaudio[ext=webm]/best" --merge-output-format webm -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="20" yt-dlp %PLAYLIST_ARG% -f "bestvideo[height<=720]+bestaudio/best" --merge-output-format mkv -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

:: 21-30: AUDIO LOSSLESS
if "%OPCAO%"=="21" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format wav -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="22" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format flac -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="23" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format alac -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="24" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format aiff -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="25" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format wav -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="26" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format flac -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="27" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mka -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="28" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format vorbis --audio-quality 0 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="29" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format opus -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="30" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

:: 31-40: AUDIO WEB
if "%OPCAO%"=="31" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 320K -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="32" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 256K -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="33" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 192K -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="34" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 128K -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="35" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio[ext=m4a]/bestaudio/best" --extract-audio --audio-format m4a -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="36" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio[ext=m4a]/bestaudio/best" --extract-audio --audio-format m4a --audio-quality 128K -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="37" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio[ext=webm]/bestaudio/best" --extract-audio --audio-format opus -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="38" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format vorbis --audio-quality 5 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="39" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format wma -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="40" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestaudio/best" --extract-audio --audio-format mp3 --audio-quality 64K -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

:: 81-90: REDES SOCIAIS
if "%OPCAO%"=="81" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="82" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="83" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="84" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="85" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="86" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="87" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="88" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="89" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim
if "%OPCAO%"=="90" yt-dlp %PLAYLIST_ARG% --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 -o "%PASTA%\\%OUTPUT_TEMPLATE%" "%LINK%" & goto fim

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
exit`,

    conversor: `@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title OmniFetch - Conversor Universal v3.0 Ultimate
color 0E

:: --- CONFIGURACOES DE FERRAMENTAS ---
set "FFMPEG_PATH=ffmpeg"
set "EBOOK_CONVERT_PATH=ebook-convert"
:: ------------------------------------

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
echo  ✨ OMNIFETCH v3.0 ULTIMATE - MOTOR DE CONVERSAO ✨
echo  ======================================================
echo.

set "ARQUIVO="
set /p ARQUIVO=Caminho completo do arquivo (ex: C:\\pasta\\video.mkv): 

if not defined ARQUIVO goto inicio
set "ARQUIVO=%ARQUIVO:"=%"
if not exist "%ARQUIVO%" (
    echo  Arquivo nao encontrado: "%ARQUIVO%"
    pause
    goto inicio
)

:menu_categorias
cls
echo.
echo  ======================================================
echo  ARQUIVO: %ARQUIVO%
echo  ======================================================
echo  ESCOLHA A CATEGORIA DE CONVERSAO:
echo.
echo  [1] VIDEO    (MP4, MKV, ProRes, WEBM, GIF...)
echo  [2] AUDIO    (MP3, WAV, FLAC, OPUS, OGG...)
echo  [3] IMAGEM   (JPG, PNG, WEBP, TIFF, ICO...)
echo  [4] DOCS     (PDF, EPUB, AZW3, DOCX, TXT...)
echo  [0] CANCELAR E VOLTAR
echo.
set "CATEGORIA="
set /p CATEGORIA=Sua escolha: 

if "%CATEGORIA%"=="1" goto menu_video
if "%CATEGORIA%"=="2" goto menu_audio
if "%CATEGORIA%"=="3" goto menu_imagem
if "%CATEGORIA%"=="4" goto menu_docs
if "%CATEGORIA%"=="0" goto inicio
goto menu_categorias

:: ==========================================
:: MENUS ESPECIFICOS
:: ==========================================

:menu_video
cls
echo.
echo  --- VIDEO: PADRAO E WEB ---
echo  [101] MP4 (H.264/AAC) - Universal      [105] WEBM (VP9/Opus) - Web Moderno
echo  [102] MP4 (H.265/HEVC) - Alta Comp.    [106] FLV (Flash Video) - Arquivo
echo  [103] MKV (H.264/FLAC) - Lossless      [107] GIF (Animado) - Alta Qualidade
echo  [104] AVI (Xvid/MP3) - Legacy          [108] GIF (Animado) - Leve/Web
echo.
echo  --- VIDEO: PROFISSIONAL E BROADCAST ---
echo  [109] MOV (ProRes 422) - Edicao        [113] TS (MPEG-TS) - Broadcast
echo  [110] MOV (H.264) - Padrao Apple       [114] MTS (AVCHD) - Cameras
echo  [111] DNxHD (Avid) - Edicao Pro        [115] WMV (Windows Media)
echo  [112] MXF (XDCAM) - Broadcast          [116] OGV (Ogg Video)
echo.
echo  [99] Voltar as categorias
echo.
set "OPCAO="
set /p OPCAO=Sua escolha: 
if "%OPCAO%"=="99" goto menu_categorias
goto processar_pasta

:menu_audio
cls
echo.
echo  --- AUDIO: MUSICA E COMPRESSAO ---
echo  [201] MP3 (320kbps) - Maxima Qualid.   [205] AAC (256kbps) - Padrao Apple
echo  [202] MP3 (192kbps) - Padrao           [206] OGG (Vorbis) - Games/Web
echo  [203] MP3 (128kbps) - Leve             [207] OPUS (128kbps) - Alta Eficiencia
echo  [204] M4A (ALAC) - Apple Lossless      [208] WMA (Windows Media Audio)
echo.
echo  --- AUDIO: ESTUDIO E CINEMA ---
echo  [209] WAV (16-bit PCM) - Qualid. CD    [213] AC3 (Dolby Digital 5.1)
echo  [210] WAV (24-bit PCM) - Estudio       [214] E-AC3 (Dolby Digital Plus)
echo  [211] WAV (32-bit Float) - Master      [215] AIFF (Mac Uncompressed)
echo  [212] FLAC (Lossless) - Compressao Max [216] MKA (Matroska Audio)
echo.
echo  [99] Voltar as categorias
echo.
set "OPCAO="
set /p OPCAO=Sua escolha: 
if "%OPCAO%"=="99" goto menu_categorias
goto processar_pasta

:menu_imagem
cls
echo.
echo  --- IMAGEM: WEB E FOTOGRAFIA ---
echo  [301] JPG (100%% Qualidade)            [305] WEBP (Lossless) - Web Moderno
echo  [302] JPG (80%% Qualidade) - Web       [306] WEBP (Lossy 80%%) - Web Leve
echo  [303] PNG (Lossless/Transparente)      [307] BMP (Uncompressed Windows)
echo  [304] PNG (Alta Compressao)            [308] ICO (Icone Windows)
echo.
echo  --- IMAGEM: PROFISSIONAL E VFX ---
echo  [309] TIFF (Uncompressed) - Print      [311] TGA (Targa) - Games/Texturas
echo  [310] DPX (Cinema Sequence)            [312] SGI (Silicon Graphics)
echo.
echo  *Nota: Se a entrada for um video, extraira o 1o frame.
echo.
echo  [99] Voltar as categorias
echo.
set "OPCAO="
set /p OPCAO=Sua escolha: 
if "%OPCAO%"=="99" goto menu_categorias
goto processar_pasta

:menu_docs
cls
echo.
echo  --- EBOOK E LEITORES ---
echo  [401] EPUB (Padrao Universal)          [405] KEPUB (Kobo)
echo  [402] EPUB (Otimizado iPad)            [406] FB2 (FictionBook)
echo  [403] AZW3 (Kindle Moderno)            [407] LRF (Sony Reader)
echo  [404] MOBI (Kindle Antigo)             [408] CBZ (Comic Book Zip)
echo.
echo  --- DOCUMENTOS E TEXTO ---
echo  [409] PDF (Documento Padrao)           [413] TXT (Texto Puro UTF-8)
echo  [410] DOCX (Microsoft Word)            [414] TXT (Markdown)
echo  [411] RTF (Rich Text Format)           [415] HTMLZ (HTML Zipado)
echo  [412] ODT (OpenDocument Text)          [416] SNB (Bambook)
echo.
echo  [99] Voltar as categorias
echo.
set "OPCAO="
set /p OPCAO=Sua escolha: 
if "%OPCAO%"=="99" goto menu_categorias
goto processar_pasta

:: ==========================================
:: PROCESSAMENTO DE PASTA E ROTEAMENTO
:: ==========================================

:processar_pasta
echo.
set "PASTA="
set /p PASTA=Pasta para salvar (deixe em branco para Downloads): 

if not defined PASTA set "PASTA=%USERPROFILE%\\Downloads"
set "PASTA=%PASTA:"=%"

if not exist "%PASTA%" (
    echo  Criando pasta: "%PASTA%"
    mkdir "%PASTA%"
    if errorlevel 1 (
        echo  Erro ao criar a pasta "%PASTA%". Verifique as permissoes.
        pause
        goto inicio
    )
)

for %%F in ("%ARQUIVO%") do set "NOME=%%~nF"

echo.
echo  Iniciando conversao tatica... Aguarde.
echo.

:: Roteamento Dinamico
goto conv_%OPCAO% 2>nul || goto opcao_invalida

:opcao_invalida
echo  Opcao invalida. Tente novamente.
pause
goto menu_categorias

:: ==========================================
:: BLOCOS DE CONVERSAO - VIDEO (100s)
:: ==========================================
:conv_101
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 320k "%PASTA%\\%NOME%.mp4"
goto fim_sucesso

:conv_102
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx265 -preset slow -crf 23 -c:a aac -b:a 320k "%PASTA%\\%NOME%_HEVC.mp4"
goto fim_sucesso

:conv_103
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -crf 18 -c:a flac "%PASTA%\\%NOME%.mkv"
goto fim_sucesso

:conv_104
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libxvid -q:v 2 -c:a mp3 -b:a 320k "%PASTA%\\%NOME%.avi"
goto fim_sucesso

:conv_105
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "%PASTA%\\%NOME%.webm"
goto fim_sucesso

:conv_106
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v flv -c:a aac "%PASTA%\\%NOME%.flv"
goto fim_sucesso

:conv_107
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vf "fps=15,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "%PASTA%\\%NOME%.gif"
goto fim_sucesso

:conv_108
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vf "fps=10,scale=480:-1:flags=lanczos" -loop 0 "%PASTA%\\%NOME%_leve.gif"
goto fim_sucesso

:conv_109
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v prores_ks -profile:v 3 -c:a pcm_s16le "%PASTA%\\%NOME%_ProRes.mov"
goto fim_sucesso

:conv_110
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 320k "%PASTA%\\%NOME%.mov"
goto fim_sucesso

:conv_111
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v dnxhd -profile:v dnxhr_hq -c:a pcm_s16le "%PASTA%\\%NOME%_DNxHD.mov"
goto fim_sucesso

:conv_112
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v mpeg2video -b:v 50M -c:a pcm_s16le "%PASTA%\\%NOME%.mxf"
goto fim_sucesso

:conv_113
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -c:a aac -f mpegts "%PASTA%\\%NOME%.ts"
goto fim_sucesso

:conv_114
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -c:a ac3 "%PASTA%\\%NOME%.mts"
goto fim_sucesso

:conv_115
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v wmv2 -c:a wmav2 "%PASTA%\\%NOME%.wmv"
goto fim_sucesso

:conv_116
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libtheora -c:a libvorbis "%PASTA%\\%NOME%.ogv"
goto fim_sucesso

:: ==========================================
:: BLOCOS DE CONVERSAO - AUDIO (200s)
:: ==========================================
:conv_201
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libmp3lame -b:a 320k "%PASTA%\\%NOME%.mp3"
goto fim_sucesso

:conv_202
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libmp3lame -b:a 192k "%PASTA%\\%NOME%_192k.mp3"
goto fim_sucesso

:conv_203
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libmp3lame -b:a 128k "%PASTA%\\%NOME%_128k.mp3"
goto fim_sucesso

:conv_204
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a alac "%PASTA%\\%NOME%.m4a"
goto fim_sucesso

:conv_205
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a aac -b:a 256k "%PASTA%\\%NOME%.aac"
goto fim_sucesso

:conv_206
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libvorbis -q:a 5 "%PASTA%\\%NOME%.ogg"
goto fim_sucesso

:conv_207
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libopus -b:a 128k "%PASTA%\\%NOME%.opus"
goto fim_sucesso

:conv_208
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a wmav2 -b:a 192k "%PASTA%\\%NOME%.wma"
goto fim_sucesso

:conv_209
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a pcm_s16le "%PASTA%\\%NOME%_16bit.wav"
goto fim_sucesso

:conv_210
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a pcm_s24le "%PASTA%\\%NOME%_24bit.wav"
goto fim_sucesso

:conv_211
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a pcm_f32le "%PASTA%\\%NOME%_32bit.wav"
goto fim_sucesso

:conv_212
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a flac -compression_level 12 "%PASTA%\\%NOME%.flac"
goto fim_sucesso

:conv_213
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a ac3 -b:a 640k "%PASTA%\\%NOME%.ac3"
goto fim_sucesso

:conv_214
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a eac3 -b:a 1024k "%PASTA%\\%NOME%.eac3"
goto fim_sucesso

:conv_215
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a pcm_s16be "%PASTA%\\%NOME%.aiff"
goto fim_sucesso

:conv_216
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a copy "%PASTA%\\%NOME%.mka"
goto fim_sucesso

:: ==========================================
:: BLOCOS DE CONVERSAO - IMAGEM (300s)
:: ==========================================
:conv_301
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -q:v 2 "%PASTA%\\%NOME%.jpg"
goto fim_sucesso

:conv_302
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -q:v 5 "%PASTA%\\%NOME%_web.jpg"
goto fim_sucesso

:conv_303
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 "%PASTA%\\%NOME%.png"
goto fim_sucesso

:conv_304
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -compression_level 9 "%PASTA%\\%NOME%_comp.png"
goto fim_sucesso

:conv_305
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v libwebp -lossless 1 "%PASTA%\\%NOME%.webp"
goto fim_sucesso

:conv_306
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v libwebp -q:v 80 "%PASTA%\\%NOME%_web.webp"
goto fim_sucesso

:conv_307
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v tiff "%PASTA%\\%NOME%.tiff"
goto fim_sucesso

:conv_308
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 "%PASTA%\\%NOME%.bmp"
goto fim_sucesso

:conv_309
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 "%PASTA%\\%NOME%.ico"
goto fim_sucesso

:conv_310
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v dpx "%PASTA%\\%NOME%.dpx"
goto fim_sucesso

:conv_311
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v targa "%PASTA%\\%NOME%.tga"
goto fim_sucesso

:conv_312
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v sgi "%PASTA%\\%NOME%.sgi"
goto fim_sucesso

:: ==========================================
:: BLOCOS DE CONVERSAO - DOCS (400s)
:: ==========================================
:conv_401
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.epub"
goto fim_sucesso

:conv_402
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%_iPad.epub" --output-profile ipad
goto fim_sucesso

:conv_403
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.azw3"
goto fim_sucesso

:conv_404
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.mobi"
goto fim_sucesso

:conv_405
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.kepub"
goto fim_sucesso

:conv_406
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.fb2"
goto fim_sucesso

:conv_407
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.lrf"
goto fim_sucesso

:conv_408
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.cbz"
goto fim_sucesso

:conv_409
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.pdf"
goto fim_sucesso

:conv_410
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.docx"
goto fim_sucesso

:conv_411
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.rtf"
goto fim_sucesso

:conv_412
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.odt"
goto fim_sucesso

:conv_413
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.txt"
goto fim_sucesso

:conv_414
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%_md.txt" --txt-output-formatting=markdown
goto fim_sucesso

:conv_415
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.htmlz"
goto fim_sucesso

:conv_416
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\\%NOME%.snb"
goto fim_sucesso

:: ==========================================
:: FUNCOES DE CHECAGEM
:: ==========================================

:checar_ffmpeg
where /q %FFMPEG_PATH%
if errorlevel 1 (
    echo  ERRO: 'ffmpeg' nao encontrado. Verifique a instalacao e o PATH.
    exit /b 1
)
exit /b 0

:checar_calibre
where /q %EBOOK_CONVERT_PATH%
if errorlevel 1 (
    echo  ERRO: 'ebook-convert' (Calibre) nao encontrado. Verifique a instalacao e o PATH.
    exit /b 1
)
exit /b 0

:: ==========================================
:: RESULTADOS
:: ==========================================

:fim_sucesso
if errorlevel 1 goto fim_erro
echo.
echo  =================================
echo  CONVERSAO CONCLUIDA COM SUCESSO! 
echo  Salvo em: %PASTA%
echo  =================================
goto perguntar_novo

:fim_erro
echo.
echo  =================================
echo  ERRO NA CONVERSAO!
echo  Ocorreu um problema durante a execucao. Verifique se o arquivo
echo  esta integro e se as ferramentas estao instaladas corretamente.
echo  =================================

:perguntar_novo
echo.
set "CONTINUAR="
set /p CONTINUAR=Converter outro? (S para sim, qualquer tecla para sair): 
if /i "%CONTINUAR%"=="S" goto inicio
exit`
};

function viewCode(type) {
    const viewer = document.getElementById('code-viewer');
    const display = document.getElementById('code-content');
    const title = document.getElementById('code-title');

    title.innerText = type.toUpperCase() + '.bat';
    display.innerText = codes[type];
    viewer.classList.remove('hidden');
}

function closeCode() {
    const viewer = document.getElementById('code-viewer');
    viewer.classList.add('hidden');
}

function copyCode() {
    const content = document.getElementById('code-content').innerText;
    navigator.clipboard.writeText(content).then(() => {
        const btn = document.querySelector('.btn-primary-small span');
        const originalText = btn.innerText;
        btn.innerText = 'Copiado!';
        setTimeout(() => btn.innerText = originalText, 2000);
    });
}
