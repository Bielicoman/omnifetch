@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 <nul >nul
cd /d "%~dp0"
title OmniFetch - Conversor

call :colors
call :init_app
call :load_config
call "%~dp0..\core\omni-ui.bat" splash "CONVERSOR" "presets profissionais sem friccao"

set "ENGINES=%~dp0..\motores"
set "FFMPEG=%ENGINES%\ffmpeg.exe"
set "FFPROBE=%ENGINES%\ffprobe.exe"

if not exist "%FFMPEG%" (
    call :banner "CONVERSOR" "motor ausente"
    echo   %RED%[erro]%RST% ffmpeg.exe nao foi encontrado em %WHITE%motores%RST%.
    echo   Rode %WHITE%Instalar.bat%RST% para instalar o conversor completo.
    echo.
    pause
    endlocal
    exit /b 1
)

if not "%~1"=="" (
    set "INFILE=%~1"
    goto :load_file
)

:main
cls
call :banner "CONVERSOR" "arraste um arquivo e escolha o formato"
echo   %WHITE%%BOLD%Arquivo de entrada%RST%
echo   %DIM%Arraste o arquivo para esta janela, cole o caminho, ou ENTER para sair.%RST%
echo.
echo   %DIM%Atalhos:%RST% %GREEN%[H]%RST% historico   %GREEN%[S]%RST% configuracoes   %YELLOW%[Q]%RST% sair
echo.
set "INFILE="
set /p "INFILE=  %GREEN%>%RST% "
if /I "!INFILE!"=="Q" goto :bye
if /I "!INFILE!"=="H" goto :history
if /I "!INFILE!"=="S" goto :settings
if not defined INFILE goto :bye
set "INFILE=!INFILE:"=!"

:load_file
if not exist "!INFILE!" (
    echo.
    echo   %RED%[erro]%RST% Arquivo nao encontrado:
    echo   %WHITE%!INFILE!%RST%
    timeout /t 3 >nul
    goto :main
)

for %%F in ("!INFILE!") do (
    set "F_DIR=%%~dpF"
    set "F_NAME=%%~nF"
    set "F_EXT=%%~xF"
    set "F_SIZE=%%~zF"
)
set "F_EXT=!F_EXT:.=!"
call :detect_kind "!F_EXT!"
call :pretty_size "!F_SIZE!"

:category
cls
call :banner "CONVERSOR" "!KIND!"
echo   %CYAN%Arquivo:%RST% %WHITE%!F_NAME!.!F_EXT!%RST%
echo   %CYAN%Tipo:%RST%    !KIND!
if defined PRETTY_SIZE echo   %CYAN%Tamanho:%RST% !PRETTY_SIZE!
echo.
echo   %DIM%CATEGORIA DE SAIDA%RST%
echo     %GREEN%[P]%RST% Presets premium  WhatsApp, Instagram, podcast, compactar
echo     %GREEN%[V]%RST% Video            MP4, MKV, WEBM, MOV, GIF, AVI, etc
echo     %GREEN%[A]%RST% Audio            MP3, WAV, FLAC, OPUS, AAC, OGG, etc
echo     %GREEN%[I]%RST% Imagem           JPG, PNG, WEBP, ICO, TIFF, BMP
echo     %GREEN%[E]%RST% E-book/doc       EPUB, MOBI, AZW3, PDF, DOCX
echo     %GREEN%[F]%RST% Fonte (Texto)    TTF, OTF, WOFF, WOFF2, EOT
echo     %YELLOW%[N]%RST% Novo arquivo
echo     %DIM%[Q] Sair%RST%
echo.
set "CAT="
set /p "CAT=  %GREEN%>%RST% "
if "!CAT!"=="" set "CAT=V"

if /I "!CAT!"=="P" goto :presets
if /I "!CAT!"=="V" goto :video
if /I "!CAT!"=="A" goto :audio
if /I "!CAT!"=="I" goto :image
if /I "!CAT!"=="E" goto :ebook
if /I "!CAT!"=="F" goto :font
if /I "!CAT!"=="N" goto :main
if /I "!CAT!"=="Q" goto :bye
echo.
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :category

:presets
cls
call :banner "PRESETS" "resultados prontos"
echo     %WHITE%[1]%RST% Video para WhatsApp       MP4 leve, 720p
echo     %WHITE%[2]%RST% Video para Instagram      MP4 H.264, 1080p
echo     %WHITE%[3]%RST% Compactar video           MP4 menor mantendo qualidade boa
echo     %WHITE%[4]%RST% Audio para podcast        MP3 128 kbps mono
echo     %WHITE%[5]%RST% Audio alta qualidade      MP3 320 kbps
echo     %WHITE%[6]%RST% Imagem para web           WEBP 85
echo     %WHITE%[7]%RST% Extrair thumbnail         JPG do primeiro frame
echo     %YELLOW%[B]%RST% Voltar
echo.
set "OPT="
set /p "OPT=  %GREEN%>%RST% "
set "USE_CALIBRE="
set "FF_ARGS="
set "OUT_EXT="
set "PRESET="
if "!OPT!"=="1" (set "PRESET=Video WhatsApp" & set "FF_ARGS=-vf scale=-2:720 -c:v libx264 -preset faster -crf 26 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart" & set "OUT_EXT=mp4")
if "!OPT!"=="2" (set "PRESET=Video Instagram" & set "FF_ARGS=-vf scale=-2:1080 -c:v libx264 -preset fast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart" & set "OUT_EXT=mp4")
if "!OPT!"=="3" (set "PRESET=Compactar video" & set "FF_ARGS=-c:v libx264 -preset faster -crf 28 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart" & set "OUT_EXT=mp4")
if "!OPT!"=="4" (set "PRESET=Podcast MP3" & set "FF_ARGS=-vn -ac 1 -ar 44100 -c:a libmp3lame -b:a 128k" & set "OUT_EXT=mp3")
if "!OPT!"=="5" (set "PRESET=Audio MP3 320" & set "FF_ARGS=-vn -c:a libmp3lame -b:a 320k" & set "OUT_EXT=mp3")
if "!OPT!"=="6" (set "PRESET=Imagem WEBP web" & set "FF_ARGS=-frames:v 1 -c:v libwebp -q:v 85" & set "OUT_EXT=webp")
if "!OPT!"=="7" (set "PRESET=Thumbnail JPG" & set "FF_ARGS=-frames:v 1 -q:v 2" & set "OUT_EXT=jpg")
if /I "!OPT!"=="B" goto :category
if not defined OUT_EXT goto :bad_preset
goto :ask_dest
:bad_preset
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :presets

:video
cls
call :banner "VIDEO" "!F_NAME!.!F_EXT!"
echo     %WHITE%[1]%RST% MP4 H.264 + AAC        %GREEN%[ENTER]%RST% universal, ultra rapido
echo     %WHITE%[2]%RST% MP4 H.265 / HEVC       menor arquivo, moderno
echo     %WHITE%[3]%RST% MKV H.264 + FLAC       qualidade alta
echo     %WHITE%[4]%RST% WEBM VP9 + OPUS        web moderno
echo     %WHITE%[5]%RST% MOV Apple ProRes       perfeito p/ edicao (pesado)
echo     %WHITE%[6]%RST% GIF 720p 12fps         otimizado
echo     %WHITE%[7]%RST% Remux rapido MP4       sem recodificar, instantaneo
echo     %WHITE%[8]%RST% AVI Xvid + MP3         legado universal
echo     %WHITE%[9]%RST% WMV Windows Media      compatibilidade antiga
echo     %WHITE%[10]%RST% FLV Flash Video       web legado
echo     %WHITE%[11]%RST% OGV Theora            video aberto
echo     %YELLOW%[B]%RST% Voltar
echo.
set "OPT="
set /p "OPT=  %GREEN%>%RST% "
if "!OPT!"=="" set "OPT=1"
set "USE_CALIBRE="
set "FF_ARGS="
set "OUT_EXT="
set "PRESET="
if "!OPT!"=="1" (set "PRESET=MP4 H264" & set "FF_ARGS=-c:v libx264 -preset ultrafast -crf 16 -pix_fmt yuv420p -c:a aac -b:a 320k -movflags +faststart" & set "OUT_EXT=mp4")
if "!OPT!"=="2" (set "PRESET=MP4 HEVC" & set "FF_ARGS=-c:v libx265 -preset superfast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 320k -tag:v hvc1 -movflags +faststart" & set "OUT_EXT=mp4")
if "!OPT!"=="3" (set "PRESET=MKV alta qualidade" & set "FF_ARGS=-c:v libx264 -preset ultrafast -crf 16 -pix_fmt yuv420p -c:a flac" & set "OUT_EXT=mkv")
if "!OPT!"=="4" (set "PRESET=WEBM VP9" & set "FF_ARGS=-c:v libvpx-vp9 -row-mt 1 -cpu-used 4 -crf 24 -b:v 0 -c:a libopus -b:a 160k" & set "OUT_EXT=webm")
if "!OPT!"=="5" (set "PRESET=MOV Apple ProRes" & set "FF_ARGS=-c:v prores_ks -profile:v 3 -vendor apl0 -pix_fmt yuv422p10le -c:a pcm_s16le" & set "OUT_EXT=mov")
if "!OPT!"=="6" (set "PRESET=GIF 720p" & set "FF_ARGS=-vf fps=12,scale=720:-1:flags=lanczos -loop 0" & set "OUT_EXT=gif")
if "!OPT!"=="7" (set "PRESET=Remux MP4" & set "FF_ARGS=-c copy" & set "OUT_EXT=mp4")
if "!OPT!"=="8" (set "PRESET=AVI Xvid" & set "FF_ARGS=-c:v libxvid -qscale:v 3 -c:a libmp3lame -b:a 192k" & set "OUT_EXT=avi")
if "!OPT!"=="9" (set "PRESET=WMV" & set "FF_ARGS=-c:v wmv2 -b:v 2M -c:a wmav2 -b:a 128k" & set "OUT_EXT=wmv")
if "!OPT!"=="10" (set "PRESET=FLV" & set "FF_ARGS=-c:v flv -b:v 1M -c:a libmp3lame -b:a 128k" & set "OUT_EXT=flv")
if "!OPT!"=="11" (set "PRESET=OGV Theora" & set "FF_ARGS=-c:v libtheora -q:v 7 -c:a libvorbis -q:a 5" & set "OUT_EXT=ogv")
if /I "!OPT!"=="B" goto :category
if not defined OUT_EXT goto :bad_video
goto :ask_dest
:bad_video
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :video

:audio
cls
call :banner "AUDIO" "!F_NAME!.!F_EXT!"
echo     %WHITE%[1]%RST% MP3 320 kbps           %GREEN%[ENTER]%RST% universal, qualidade max
echo     %WHITE%[2]%RST% MP3 192 kbps
echo     %WHITE%[3]%RST% WAV 16-bit PCM
echo     %WHITE%[4]%RST% WAV 24-bit PCM
echo     %WHITE%[5]%RST% FLAC lossless
echo     %WHITE%[6]%RST% AAC 256 kbps
echo     %WHITE%[7]%RST% M4A AAC 256 kbps
echo     %WHITE%[8]%RST% OPUS 128 kbps
echo     %WHITE%[9]%RST% OGG Vorbis q5
echo     %WHITE%[10]%RST% ALAC Apple Lossless
echo     %WHITE%[11]%RST% WMA Windows Media
echo     %WHITE%[12]%RST% AC3 Dolby Digital
echo     %YELLOW%[B]%RST% Voltar
echo.
set "OPT="
set /p "OPT=  %GREEN%>%RST% "
if "!OPT!"=="" set "OPT=1"
set "USE_CALIBRE="
set "FF_ARGS="
set "OUT_EXT="
set "PRESET="
if "!OPT!"=="1" (set "PRESET=MP3 320" & set "FF_ARGS=-vn -c:a libmp3lame -b:a 320k" & set "OUT_EXT=mp3")
if "!OPT!"=="2" (set "PRESET=MP3 192" & set "FF_ARGS=-vn -c:a libmp3lame -b:a 192k" & set "OUT_EXT=mp3")
if "!OPT!"=="3" (set "PRESET=WAV 16-bit" & set "FF_ARGS=-vn -c:a pcm_s16le" & set "OUT_EXT=wav")
if "!OPT!"=="4" (set "PRESET=WAV 24-bit" & set "FF_ARGS=-vn -c:a pcm_s24le" & set "OUT_EXT=wav")
if "!OPT!"=="5" (set "PRESET=FLAC" & set "FF_ARGS=-vn -c:a flac -compression_level 5" & set "OUT_EXT=flac")
if "!OPT!"=="6" (set "PRESET=AAC 256" & set "FF_ARGS=-vn -c:a aac -b:a 256k" & set "OUT_EXT=aac")
if "!OPT!"=="7" (set "PRESET=M4A AAC" & set "FF_ARGS=-vn -c:a aac -b:a 256k" & set "OUT_EXT=m4a")
if "!OPT!"=="8" (set "PRESET=OPUS" & set "FF_ARGS=-vn -c:a libopus -b:a 128k" & set "OUT_EXT=opus")
if "!OPT!"=="9" (set "PRESET=OGG Vorbis" & set "FF_ARGS=-vn -c:a libvorbis -q:a 5" & set "OUT_EXT=ogg")
if "!OPT!"=="10" (set "PRESET=ALAC" & set "FF_ARGS=-vn -c:a alac" & set "OUT_EXT=m4a")
if "!OPT!"=="11" (set "PRESET=WMA" & set "FF_ARGS=-vn -c:a wmav2 -b:a 192k" & set "OUT_EXT=wma")
if "!OPT!"=="12" (set "PRESET=AC3" & set "FF_ARGS=-vn -c:a ac3 -b:a 384k" & set "OUT_EXT=ac3")
if /I "!OPT!"=="B" goto :category
if not defined OUT_EXT goto :bad_audio
goto :ask_dest
:bad_audio
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :audio

:image
cls
call :banner "IMAGEM" "!F_NAME!.!F_EXT!"
echo     %WHITE%[1]%RST% JPG alta qualidade     %GREEN%[ENTER]%RST%
echo     %WHITE%[2]%RST% JPG leve para web
echo     %WHITE%[3]%RST% PNG lossless
echo     %WHITE%[4]%RST% WEBP 90
echo     %WHITE%[5]%RST% WEBP lossless
echo     %WHITE%[6]%RST% ICO 256x256
echo     %WHITE%[7]%RST% BMP sem compressao
echo     %WHITE%[8]%RST% TIFF lossless
echo     %YELLOW%[B]%RST% Voltar
echo.
set "OPT="
set /p "OPT=  %GREEN%>%RST% "
if "!OPT!"=="" set "OPT=1"
set "USE_CALIBRE="
set "FF_ARGS="
set "OUT_EXT="
set "PRESET="
if "!OPT!"=="1" (set "PRESET=JPG alta" & set "FF_ARGS=-frames:v 1 -q:v 2" & set "OUT_EXT=jpg")
if "!OPT!"=="2" (set "PRESET=JPG web" & set "FF_ARGS=-frames:v 1 -q:v 5" & set "OUT_EXT=jpg")
if "!OPT!"=="3" (set "PRESET=PNG" & set "FF_ARGS=-frames:v 1" & set "OUT_EXT=png")
if "!OPT!"=="4" (set "PRESET=WEBP 90" & set "FF_ARGS=-frames:v 1 -c:v libwebp -q:v 90" & set "OUT_EXT=webp")
if "!OPT!"=="5" (set "PRESET=WEBP lossless" & set "FF_ARGS=-frames:v 1 -c:v libwebp -lossless 1" & set "OUT_EXT=webp")
if "!OPT!"=="6" (set "PRESET=ICO" & set "FF_ARGS=-frames:v 1 -vf scale=256:256" & set "OUT_EXT=ico")
if "!OPT!"=="7" (set "PRESET=BMP" & set "FF_ARGS=-frames:v 1" & set "OUT_EXT=bmp")
if "!OPT!"=="8" (set "PRESET=TIFF" & set "FF_ARGS=-frames:v 1" & set "OUT_EXT=tiff")
if /I "!OPT!"=="B" goto :category
if not defined OUT_EXT goto :bad_image
goto :ask_dest
:bad_image
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :image

:ebook
cls
call :banner "E-BOOK" "!F_NAME!.!F_EXT!"
where /q ebook-convert.exe
if errorlevel 1 (
    echo   %YELLOW%[opcional]%RST% Calibre / ebook-convert nao esta instalado.
    echo   %DIM%Calibre nao instalado. Baixe em https://calibre-ebook.com/%RST%
    echo   %DIM%ou rode o Instalar.bat (tenta instalar via winget).%RST%
    echo.
    pause
    goto :category
)
echo     %WHITE%[1]%RST% EPUB
echo     %WHITE%[2]%RST% MOBI
echo     %WHITE%[3]%RST% AZW3
echo     %WHITE%[4]%RST% PDF
echo     %WHITE%[5]%RST% DOCX
echo     %WHITE%[6]%RST% RTF
echo     %WHITE%[7]%RST% TXT
echo     %WHITE%[8]%RST% LRF
echo     %WHITE%[9]%RST% FB2
echo     %YELLOW%[B]%RST% Voltar
echo.
set "OPT="
set /p "OPT=  %GREEN%>%RST% "
set "USE_CALIBRE=1"
set "FF_ARGS="
set "OUT_EXT="
set "PRESET="
if "!OPT!"=="1" (set "PRESET=EPUB" & set "OUT_EXT=epub")
if "!OPT!"=="2" (set "PRESET=MOBI" & set "OUT_EXT=mobi")
if "!OPT!"=="3" (set "PRESET=AZW3" & set "OUT_EXT=azw3")
if "!OPT!"=="4" (set "PRESET=PDF" & set "OUT_EXT=pdf")
if "!OPT!"=="5" (set "PRESET=DOCX" & set "OUT_EXT=docx")
if "!OPT!"=="6" (set "PRESET=RTF" & set "OUT_EXT=rtf")
if "!OPT!"=="7" (set "PRESET=TXT" & set "OUT_EXT=txt")
if "!OPT!"=="8" (set "PRESET=LRF" & set "OUT_EXT=lrf")
if "!OPT!"=="9" (set "PRESET=FB2" & set "OUT_EXT=fb2")
if /I "!OPT!"=="B" goto :category
if not defined OUT_EXT goto :bad_ebook
goto :ask_dest
:bad_ebook
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :ebook

:font
cls
call :banner "FONTE" "!F_NAME!.!F_EXT!"
echo   %YELLOW%Nota:%RST% A conversao de fontes de texto ^(TTF, OTF, WOFF, etc^) requer
echo         ferramentas externas especificas como %WHITE%FontForge%RST% instaladas no sistema.
echo.
echo   %DIM%Como o FFmpeg e Calibre nao processam fontes nativamente,
echo   esta ferramenta suporta apenas visualizacao da categoria no momento.%RST%
echo.
echo   Pressione qualquer tecla para voltar...
pause >nul
goto :category

:ask_dest
echo.
echo   %WHITE%Pasta de destino%RST%
echo   %DIM%ENTER = mesma pasta   D = pasta padrao (!DEFAULT_DEST!)%RST%
set "DEST="
set /p "DEST=  %GREEN%>%RST% "
if /I "!DEST!"=="D" set "DEST=!DEFAULT_DEST!"
if not defined DEST set "DEST=!F_DIR!"
set "DEST=!DEST:"=!"
if "!DEST:~-1!"=="\" set "DEST=!DEST:~0,-1!"
if not exist "!DEST!" mkdir "!DEST!" >nul 2>&1
if not exist "!DEST!" (
    echo   %RED%[erro]%RST% Nao consegui criar a pasta de destino.
    timeout /t 2 >nul
    goto :category
)

set "OUTFILE=!DEST!\!F_NAME!.!OUT_EXT!"
if exist "!OUTFILE!" (
    call :timestamp
    set "OUTFILE=!DEST!\!F_NAME!_!STAMP!.!OUT_EXT!"
)

call :timestamp
set "LOG=..\logs\convert-!STAMP!.log"
cls
call :banner "CONVERSOR" "processando"
echo   %CYAN%Preset:%RST%  !PRESET!
echo   %CYAN%Entrada:%RST% !INFILE!
echo   %CYAN%Saida:%RST%   %WHITE%!OUTFILE!%RST%
echo   %CYAN%Log:%RST%     !LOG!
echo.
if defined USE_CALIBRE (
    ebook-convert.exe "!INFILE!" "!OUTFILE!" > "!LOG!" 2>&1
    set "RC=!errorlevel!"
    type "!LOG!"
) else (
    echo [OmniFetch] Conversao iniciada. Progresso exibido no console. > "!LOG!"
    "%FFMPEG%" -nostdin -y -hide_banner -stats -i "!INFILE!" !FF_ARGS! "!OUTFILE!"
    set "RC=!errorlevel!"
    echo [OmniFetch] Codigo de saida: !RC! >> "!LOG!"
)
set "USE_CALIBRE="

echo.
echo   %BAR%
if "!RC!"=="0" (
    echo   %GREEN%%BOLD%Concluido.%RST% Arquivo gerado:
    echo   %WHITE%!OUTFILE!%RST%
    call :history_add "ok"
    if /I "!OPEN_WHEN_DONE!"=="S" start "" explorer.exe "!DEST!"
) else (
    echo   %RED%%BOLD%Falhou.%RST% Codigo !RC!.
    call :human_error
    call :history_add "falhou"
    if exist "!OUTFILE!" del /q "!OUTFILE!" >nul 2>&1
)
echo   %BAR%
echo.
echo   %DIM%ENTER = converter de novo    N = novo arquivo    O = abrir pasta    L = log    Q = sair%RST%
set "AGAIN="
set /p "AGAIN=  %GREEN%>%RST% "
if /I "!AGAIN!"=="Q" goto :bye
if /I "!AGAIN!"=="N" goto :main
if /I "!AGAIN!"=="O" start "" explorer.exe "!DEST!"
if /I "!AGAIN!"=="L" start "" notepad.exe "!LOG!"
goto :category

:history
cls
call :banner "HISTORICO" "ultimas conversoes"
if not exist "%CONVERT_HISTORY%" (
    echo   %DIM%Nenhuma conversao registrada ainda.%RST%
) else (
    powershell.exe -NoProfile -Command "$p=$env:CONVERT_HISTORY; Get-Content -LiteralPath $p -Tail 12 | ForEach-Object { $x=$_ -split '\|',6; if($x.Count -ge 5){ '{0}  [{1}]  {2}  ->  {3}' -f $x[0],$x[1],$x[4],$x[3] } }"
)
echo.
pause
goto :main

:settings
cls
call :banner "CONFIG" "preferencias compartilhadas"
echo   %WHITE%[1]%RST% Pasta padrao:       !DEFAULT_DEST!
echo   %WHITE%[2]%RST% Abrir ao finalizar: !OPEN_WHEN_DONE!
echo   %WHITE%[3]%RST% Intro premium:      !INTRO_ANIMATION!
echo   %WHITE%[4]%RST% Abrir data/logs
echo   %YELLOW%[B]%RST% Voltar
echo.
set "SOPT="
set /p "SOPT=  %GREEN%>%RST% "
if "!SOPT!"=="1" (
    echo.
    set "NEW_DEST="
    set /p "NEW_DEST=Nova pasta: "
    if defined NEW_DEST (
        set "NEW_DEST=!NEW_DEST:"=!"
        if not exist "!NEW_DEST!" mkdir "!NEW_DEST!" >nul 2>&1
        if exist "!NEW_DEST!" set "DEFAULT_DEST=!NEW_DEST!"
    )
    call :save_config
)
if "!SOPT!"=="2" (
    if /I "!OPEN_WHEN_DONE!"=="S" (set "OPEN_WHEN_DONE=N") else set "OPEN_WHEN_DONE=S"
    call :save_config
)
if "!SOPT!"=="3" (
    echo.
    echo   %WHITE%[1]%RST% Full premium   %WHITE%[2]%RST% Rapida   %WHITE%[3]%RST% Off
    set "I="
    set /p "I=  Intro: "
    if "!I!"=="1" set "INTRO_ANIMATION=full"
    if "!I!"=="2" set "INTRO_ANIMATION=fast"
    if "!I!"=="3" set "INTRO_ANIMATION=off"
    call :save_config
)
if "!SOPT!"=="4" start "" explorer.exe "%~dp0..\data"
if /I "!SOPT!"=="B" goto :main
goto :settings

:human_error
echo.
findstr /I /C:"Invalid argument" /C:"No such file" /C:"Permission denied" "%~dp0..\!LOG!" >nul
if not errorlevel 1 (
    echo   %YELLOW%Diagnostico:%RST% caminho, permissao ou arquivo em uso.
    echo   %DIM%Feche o arquivo em outro programa e tente uma pasta simples como Downloads.%RST%
    exit /b
)
findstr /I /C:"Unknown encoder" /C:"Encoder" /C:"not found" "%~dp0..\!LOG!" >nul
if not errorlevel 1 (
    echo   %YELLOW%Diagnostico:%RST% codec indisponivel neste motor FFmpeg.
    echo   %DIM%Rode o Setup para reparar/atualizar os motores.%RST%
    exit /b
)
findstr /I /C:"Invalid data found" /C:"moov atom not found" "%~dp0..\!LOG!" >nul
if not errorlevel 1 (
    echo   %YELLOW%Diagnostico:%RST% o arquivo parece corrompido ou incompleto.
    echo   %DIM%Tente abrir o arquivo original antes ou baixe novamente.%RST%
    exit /b
)
echo   %YELLOW%Diagnostico:%RST% falha registrada no log.
echo   %DIM%Abra o log pela opcao L para ver o detalhe tecnico.%RST%
exit /b

:history_add
set "H_STATUS=%~1"
set "H_INPUT=!INFILE!"
set "H_OUTPUT=!OUTFILE!"
set "H_PRESET=!PRESET!"
set "H_LOG=!LOG!"
call :timestamp
set "H_STAMP=!STAMP!"
powershell.exe -NoProfile -Command "$line=$env:H_STAMP+'|'+$env:H_STATUS+'|'+$env:H_INPUT+'|'+$env:H_OUTPUT+'|'+$env:H_PRESET+'|'+$env:H_LOG; Add-Content -LiteralPath $env:CONVERT_HISTORY -Value $line -Encoding UTF8" >nul 2>&1
exit /b

:detect_kind
set "EXT=%~1"
set "KIND=generico"
for %%X in (mp4 mkv mov avi webm wmv flv mpg mpeg ts mts m4v 3gp ogv) do if /I "!EXT!"=="%%X" set "KIND=video"
for %%X in (mp3 m4a aac wav flac ogg opus wma aiff alac mka ac3) do if /I "!EXT!"=="%%X" set "KIND=audio"
for %%X in (jpg jpeg png webp gif bmp tiff tif heic heif raw dng svg ico) do if /I "!EXT!"=="%%X" set "KIND=imagem"
for %%X in (epub mobi azw3 pdf docx rtf txt fb2 lit lrf cbz) do if /I "!EXT!"=="%%X" set "KIND=e-book/doc"
for %%X in (ttf otf woff woff2 eot) do if /I "!EXT!"=="%%X" set "KIND=fonte"
exit /b

:pretty_size
set "PRETTY_SIZE="
where /q powershell.exe
if errorlevel 1 exit /b
for /f "usebackq delims=" %%S in (`powershell.exe -NoProfile -Command "$b=[double]'%~1'; if($b -ge 1GB){'{0:N2} GB' -f ($b/1GB)} elseif($b -ge 1MB){'{0:N1} MB' -f ($b/1MB)} elseif($b -ge 1KB){'{0:N1} KB' -f ($b/1KB)} else {'{0:N0} bytes' -f $b}" 2^>nul`) do set "PRETTY_SIZE=%%S"
exit /b

:load_config
set "DEFAULT_DEST=%USERPROFILE%\Downloads"
set "DEFAULT_BROWSER=edge"
set "OPEN_WHEN_DONE=N"
set "INTRO_ANIMATION=full"
set "SPEED_PROFILE=turbo"
set "CONCURRENT_FRAGMENTS=16"
set "DOWNLOAD_RETRIES=20"
set "ARIA_CONNECTIONS=16"
set "ARIA_SPLITS=16"
set "ARIA_CHUNK=1M"
set "EMBED_METADATA=S"
set "EMBED_THUMBNAIL=S"
set "DOWNLOAD_SUBS=N"
set "DOWNLOAD_ARCHIVE=N"
if exist "%CONFIG%" (
    for /f "usebackq tokens=1,* delims==" %%A in ("%CONFIG%") do (
        if /I "%%A"=="DEFAULT_DEST" set "DEFAULT_DEST=%%B"
        if /I "%%A"=="DEFAULT_BROWSER" set "DEFAULT_BROWSER=%%B"
        if /I "%%A"=="OPEN_WHEN_DONE" set "OPEN_WHEN_DONE=%%B"
        if /I "%%A"=="INTRO_ANIMATION" set "INTRO_ANIMATION=%%B"
        if /I "%%A"=="SPEED_PROFILE" set "SPEED_PROFILE=%%B"
        if /I "%%A"=="CONCURRENT_FRAGMENTS" set "CONCURRENT_FRAGMENTS=%%B"
        if /I "%%A"=="DOWNLOAD_RETRIES" set "DOWNLOAD_RETRIES=%%B"
        if /I "%%A"=="ARIA_CONNECTIONS" set "ARIA_CONNECTIONS=%%B"
        if /I "%%A"=="ARIA_SPLITS" set "ARIA_SPLITS=%%B"
        if /I "%%A"=="ARIA_CHUNK" set "ARIA_CHUNK=%%B"
        if /I "%%A"=="EMBED_METADATA" set "EMBED_METADATA=%%B"
        if /I "%%A"=="EMBED_THUMBNAIL" set "EMBED_THUMBNAIL=%%B"
        if /I "%%A"=="DOWNLOAD_SUBS" set "DOWNLOAD_SUBS=%%B"
        if /I "%%A"=="DOWNLOAD_ARCHIVE" set "DOWNLOAD_ARCHIVE=%%B"
    )
)
if not exist "!DEFAULT_DEST!" mkdir "!DEFAULT_DEST!" >nul 2>&1
exit /b

:save_config
(
    echo DEFAULT_DEST=!DEFAULT_DEST!
    echo DEFAULT_BROWSER=!DEFAULT_BROWSER!
    echo OPEN_WHEN_DONE=!OPEN_WHEN_DONE!
    echo INTRO_ANIMATION=!INTRO_ANIMATION!
    echo SPEED_PROFILE=!SPEED_PROFILE!
    echo CONCURRENT_FRAGMENTS=!CONCURRENT_FRAGMENTS!
    echo DOWNLOAD_RETRIES=!DOWNLOAD_RETRIES!
    echo ARIA_CONNECTIONS=!ARIA_CONNECTIONS!
    echo ARIA_SPLITS=!ARIA_SPLITS!
    echo ARIA_CHUNK=!ARIA_CHUNK!
    echo EMBED_METADATA=!EMBED_METADATA!
    echo EMBED_THUMBNAIL=!EMBED_THUMBNAIL!
    echo DOWNLOAD_SUBS=!DOWNLOAD_SUBS!
    echo DOWNLOAD_ARCHIVE=!DOWNLOAD_ARCHIVE!
) > "%CONFIG%"
exit /b

:init_app
if not exist "data" mkdir "data" >nul 2>&1
if not exist "logs" mkdir "logs" >nul 2>&1
set "CONFIG=%~dp0..\data\config.ini"
set "CONVERT_HISTORY=%~dp0..\data\convert_history.tsv"
if exist "%~dp0..\core\ensure-config.bat" call "%~dp0..\core\ensure-config.bat" "%~dp0..\"
if not exist "%CONFIG%" (
    set "DEFAULT_DEST=%USERPROFILE%\Downloads"
    set "DEFAULT_BROWSER=edge"
    set "OPEN_WHEN_DONE=N"
    set "INTRO_ANIMATION=full"
    set "SPEED_PROFILE=turbo"
    set "CONCURRENT_FRAGMENTS=16"
    set "DOWNLOAD_RETRIES=20"
    set "ARIA_CONNECTIONS=16"
    set "ARIA_SPLITS=16"
    set "ARIA_CHUNK=1M"
    set "EMBED_METADATA=S"
    set "EMBED_THUMBNAIL=S"
    set "DOWNLOAD_SUBS=N"
    set "DOWNLOAD_ARCHIVE=N"
    call :save_config
)
exit /b

:timestamp
set "STAMP=%DATE%_%TIME%"
set "STAMP=!STAMP:/=-!"
set "STAMP=!STAMP::=-!"
set "STAMP=!STAMP:,=-!"
set "STAMP=!STAMP: =0!"
where /q powershell.exe
if not errorlevel 1 for /f "usebackq delims=" %%T in (`powershell.exe -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss" 2^>nul`) do set "STAMP=%%T"
exit /b

:bye
echo.
echo   %GREEN%ate logo.%RST%
endlocal
exit /b 0

:colors
for /F "tokens=1 delims=#" %%A in ('"prompt #$E# & echo on & for %%B in (1) do rem"') do set "ESC=%%A"
set "RST=%ESC%[0m"
set "BOLD=%ESC%[1m"
set "GREEN=%ESC%[38;2;0;255;136m"
set "CYAN=%ESC%[38;2;0;180;255m"
set "YELLOW=%ESC%[38;2;255;200;60m"
set "RED=%ESC%[38;2;255;80;80m"
set "DIM=%ESC%[38;2;130;130;145m"
set "WHITE=%ESC%[97m"
set "BAR=%DIM%----------------------------------------------------------------%RST%"
exit /b

:banner
echo.
call "%~dp0..\core\brand-logo.bat"
echo.
echo   %WHITE%%BOLD%OmniFetch %~1%RST%   %DIM%- %~2%RST%
echo   %BAR%
echo.
exit /b
