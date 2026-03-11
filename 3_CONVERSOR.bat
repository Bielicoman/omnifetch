@echo off
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
set /p ARQUIVO=Caminho completo do arquivo (ex: C:\pasta\video.mkv): 

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

if not defined PASTA set "PASTA=%USERPROFILE%\Downloads"
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
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 320k "%PASTA%\%NOME%.mp4"
goto fim_sucesso

:conv_102
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx265 -preset slow -crf 23 -c:a aac -b:a 320k "%PASTA%\%NOME%_HEVC.mp4"
goto fim_sucesso

:conv_103
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -crf 18 -c:a flac "%PASTA%\%NOME%.mkv"
goto fim_sucesso

:conv_104
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libxvid -q:v 2 -c:a mp3 -b:a 320k "%PASTA%\%NOME%.avi"
goto fim_sucesso

:conv_105
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "%PASTA%\%NOME%.webm"
goto fim_sucesso

:conv_106
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v flv -c:a aac "%PASTA%\%NOME%.flv"
goto fim_sucesso

:conv_107
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vf "fps=15,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "%PASTA%\%NOME%.gif"
goto fim_sucesso

:conv_108
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vf "fps=10,scale=480:-1:flags=lanczos" -loop 0 "%PASTA%\%NOME%_leve.gif"
goto fim_sucesso

:conv_109
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v prores_ks -profile:v 3 -c:a pcm_s16le "%PASTA%\%NOME%_ProRes.mov"
goto fim_sucesso

:conv_110
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 320k "%PASTA%\%NOME%.mov"
goto fim_sucesso

:conv_111
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v dnxhd -profile:v dnxhr_hq -c:a pcm_s16le "%PASTA%\%NOME%_DNxHD.mov"
goto fim_sucesso

:conv_112
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v mpeg2video -b:v 50M -c:a pcm_s16le "%PASTA%\%NOME%.mxf"
goto fim_sucesso

:conv_113
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -c:a aac -f mpegts "%PASTA%\%NOME%.ts"
goto fim_sucesso

:conv_114
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libx264 -c:a ac3 "%PASTA%\%NOME%.mts"
goto fim_sucesso

:conv_115
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v wmv2 -c:a wmav2 "%PASTA%\%NOME%.wmv"
goto fim_sucesso

:conv_116
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -c:v libtheora -c:a libvorbis "%PASTA%\%NOME%.ogv"
goto fim_sucesso

:: ==========================================
:: BLOCOS DE CONVERSAO - AUDIO (200s)
:: ==========================================
:conv_201
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libmp3lame -b:a 320k "%PASTA%\%NOME%.mp3"
goto fim_sucesso

:conv_202
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libmp3lame -b:a 192k "%PASTA%\%NOME%_192k.mp3"
goto fim_sucesso

:conv_203
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libmp3lame -b:a 128k "%PASTA%\%NOME%_128k.mp3"
goto fim_sucesso

:conv_204
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a alac "%PASTA%\%NOME%.m4a"
goto fim_sucesso

:conv_205
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a aac -b:a 256k "%PASTA%\%NOME%.aac"
goto fim_sucesso

:conv_206
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libvorbis -q:a 5 "%PASTA%\%NOME%.ogg"
goto fim_sucesso

:conv_207
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a libopus -b:a 128k "%PASTA%\%NOME%.opus"
goto fim_sucesso

:conv_208
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a wmav2 -b:a 192k "%PASTA%\%NOME%.wma"
goto fim_sucesso

:conv_209
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a pcm_s16le "%PASTA%\%NOME%_16bit.wav"
goto fim_sucesso

:conv_210
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a pcm_s24le "%PASTA%\%NOME%_24bit.wav"
goto fim_sucesso

:conv_211
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a pcm_f32le "%PASTA%\%NOME%_32bit.wav"
goto fim_sucesso

:conv_212
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a flac -compression_level 12 "%PASTA%\%NOME%.flac"
goto fim_sucesso

:conv_213
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a ac3 -b:a 640k "%PASTA%\%NOME%.ac3"
goto fim_sucesso

:conv_214
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a eac3 -b:a 1024k "%PASTA%\%NOME%.eac3"
goto fim_sucesso

:conv_215
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a pcm_s16be "%PASTA%\%NOME%.aiff"
goto fim_sucesso

:conv_216
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vn -c:a copy "%PASTA%\%NOME%.mka"
goto fim_sucesso

:: ==========================================
:: BLOCOS DE CONVERSAO - IMAGEM (300s)
:: ==========================================
:conv_301
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -q:v 2 "%PASTA%\%NOME%.jpg"
goto fim_sucesso

:conv_302
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -q:v 5 "%PASTA%\%NOME%_web.jpg"
goto fim_sucesso

:conv_303
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 "%PASTA%\%NOME%.png"
goto fim_sucesso

:conv_304
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -compression_level 9 "%PASTA%\%NOME%_comp.png"
goto fim_sucesso

:conv_305
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v libwebp -lossless 1 "%PASTA%\%NOME%.webp"
goto fim_sucesso

:conv_306
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v libwebp -q:v 80 "%PASTA%\%NOME%_web.webp"
goto fim_sucesso

:conv_307
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v tiff "%PASTA%\%NOME%.tiff"
goto fim_sucesso

:conv_308
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 "%PASTA%\%NOME%.bmp"
goto fim_sucesso

:conv_309
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 "%PASTA%\%NOME%.ico"
goto fim_sucesso

:conv_310
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v dpx "%PASTA%\%NOME%.dpx"
goto fim_sucesso

:conv_311
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v targa "%PASTA%\%NOME%.tga"
goto fim_sucesso

:conv_312
call :checar_ffmpeg || goto fim_erro
call %FFMPEG_PATH% -i "%ARQUIVO%" -vframes 1 -c:v sgi "%PASTA%\%NOME%.sgi"
goto fim_sucesso

:: ==========================================
:: BLOCOS DE CONVERSAO - DOCS (400s)
:: ==========================================
:conv_401
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.epub"
goto fim_sucesso

:conv_402
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%_iPad.epub" --output-profile ipad
goto fim_sucesso

:conv_403
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.azw3"
goto fim_sucesso

:conv_404
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.mobi"
goto fim_sucesso

:conv_405
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.kepub"
goto fim_sucesso

:conv_406
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.fb2"
goto fim_sucesso

:conv_407
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.lrf"
goto fim_sucesso

:conv_408
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.cbz"
goto fim_sucesso

:conv_409
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.pdf"
goto fim_sucesso

:conv_410
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.docx"
goto fim_sucesso

:conv_411
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.rtf"
goto fim_sucesso

:conv_412
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.odt"
goto fim_sucesso

:conv_413
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.txt"
goto fim_sucesso

:conv_414
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%_md.txt" --txt-output-formatting=markdown
goto fim_sucesso

:conv_415
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.htmlz"
goto fim_sucesso

:conv_416
call :checar_calibre || goto fim_erro
call %EBOOK_CONVERT_PATH% "%ARQUIVO%" "%PASTA%\%NOME%.snb"
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
exit