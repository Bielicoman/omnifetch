@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 <nul >nul
cd /d "%~dp0"
title OmniFetch - OmniTools

call :colors
call :init_app

set "ENGINES=%~dp0motores"
set "YTDLP=%ENGINES%\yt-dlp.exe"
set "FFMPEG=%ENGINES%\ffmpeg.exe"
set "FFPROBE=%ENGINES%\ffprobe.exe"
set "TOOLS_OUT=%USERPROFILE%\Downloads\OmniFetch"

:menu
cls
call :banner "OMNITOOLS" "ferramentas locais"
echo   %WHITE%%BOLD%ARSENAL LOCAL%RST%
echo.
echo     %GREEN%[1]%RST% Media Inspector       relatorio tecnico completo de video/audio
echo     %GREEN%[2]%RST% Thumbnail Maker       extrai capa/frame de qualquer video
echo     %GREEN%[3]%RST% Clip Cutter           corta trecho rapido sem reencodar
echo     %GREEN%[4]%RST% Audio Cleaner         normaliza volume e exporta MP3/WAV
echo     %GREEN%[5]%RST% Subtitle Lab          baixa ou extrai legendas
echo     %GREEN%[6]%RST% Batch Renamer         renomeia arquivos em lote com preview
echo     %GREEN%[7]%RST% Folder Report         mapa de tamanho dos arquivos de uma pasta
echo     %DIM%[O] Abrir pasta OmniFetch em Downloads%RST%
echo     %YELLOW%[Q]%RST% Sair
echo.
set "OPT="
set /p "OPT=  %GREEN%>%RST% "
if "!OPT!"=="1" goto :inspector
if "!OPT!"=="2" goto :thumbnail
if "!OPT!"=="3" goto :clipper
if "!OPT!"=="4" goto :audio_cleaner
if "!OPT!"=="5" goto :subtitle_lab
if "!OPT!"=="6" goto :batch_renamer
if "!OPT!"=="7" goto :folder_report
if /I "!OPT!"=="O" (
    start "" explorer.exe "!TOOLS_OUT!"
    goto :menu
)
if /I "!OPT!"=="Q" goto :bye
goto :menu

:inspector
cls
call :banner "INSPECTOR" "relatorio tecnico"
call :need_ffprobe
if errorlevel 1 goto :menu
call :ask_file "Cole/arraste o arquivo para analisar"
if errorlevel 1 goto :menu
call :timestamp
set "REPORT_DIR=%TOOLS_OUT%\Reports"
if not exist "!REPORT_DIR!" mkdir "!REPORT_DIR!" >nul 2>&1
for %%F in ("!INFILE!") do set "REPORT=!REPORT_DIR!\%%~nF_!STAMP!.txt"
(
    echo OmniFetch Media Inspector
    echo Arquivo: !INFILE!
    echo Data: %DATE% %TIME%
    echo.
    echo ===== FORMATO =====
    "%FFPROBE%" -v error -show_format -of default=noprint_wrappers=1 "!INFILE!"
    echo.
    echo ===== STREAMS =====
    "%FFPROBE%" -v error -show_streams -of default=noprint_wrappers=1 "!INFILE!"
) > "!REPORT!" 2>&1
echo.
echo   %GREEN%[ok]%RST% Relatorio criado:
echo   %WHITE%!REPORT!%RST%
echo.
set "OPEN="
set /p "OPEN=  Abrir relatorio agora? [S/N] "
if /I "!OPEN!"=="S" start "" notepad.exe "!REPORT!"
goto :pause_menu

:thumbnail
cls
call :banner "THUMBNAIL" "extrair frame"
call :need_ffmpeg
if errorlevel 1 goto :menu
call :ask_file "Cole/arraste o video"
if errorlevel 1 goto :menu
set "WHEN="
set /p "WHEN=  Tempo do frame [ENTER = 00:00:03]: "
if not defined WHEN set "WHEN=00:00:03"
set "OUT_DIR=%TOOLS_OUT%\Thumbnails"
if not exist "!OUT_DIR!" mkdir "!OUT_DIR!" >nul 2>&1
for %%F in ("!INFILE!") do set "OUT=!OUT_DIR!\%%~nF_thumb.jpg"
"%FFMPEG%" -y -hide_banner -loglevel warning -ss "!WHEN!" -i "!INFILE!" -frames:v 1 -q:v 2 "!OUT!"
if errorlevel 1 goto :tool_error
echo.
echo   %GREEN%[ok]%RST% Thumbnail criado:
echo   %WHITE%!OUT!%RST%
start "" explorer.exe /select,"!OUT!"
goto :pause_menu

:clipper
cls
call :banner "CLIP CUTTER" "corte rapido"
call :need_ffmpeg
if errorlevel 1 goto :menu
call :ask_file "Cole/arraste o video"
if errorlevel 1 goto :menu
set "START_AT="
set "DURATION="
set /p "START_AT=  Inicio [ex: 00:01:20]: "
if not defined START_AT goto :menu
set /p "DURATION=  Duracao [ex: 00:00:30]: "
if not defined DURATION goto :menu
set "OUT_DIR=%TOOLS_OUT%\Clips"
if not exist "!OUT_DIR!" mkdir "!OUT_DIR!" >nul 2>&1
call :timestamp
for %%F in ("!INFILE!") do set "OUT=!OUT_DIR!\%%~nF_clip_!STAMP!%%~xF"
"%FFMPEG%" -y -hide_banner -loglevel warning -ss "!START_AT!" -t "!DURATION!" -i "!INFILE!" -c copy "!OUT!"
if errorlevel 1 (
    echo   %YELLOW%[aviso]%RST% Corte sem reencode falhou. Tentando modo compativel...
    for %%F in ("!INFILE!") do set "OUT=!OUT_DIR!\%%~nF_clip_!STAMP!.mp4"
    "%FFMPEG%" -y -hide_banner -loglevel warning -ss "!START_AT!" -t "!DURATION!" -i "!INFILE!" -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 192k "!OUT!"
)
if errorlevel 1 goto :tool_error
echo.
echo   %GREEN%[ok]%RST% Clipe criado:
echo   %WHITE%!OUT!%RST%
start "" explorer.exe /select,"!OUT!"
goto :pause_menu

:audio_cleaner
cls
call :banner "AUDIO CLEANER" "volume nivelado"
call :need_ffmpeg
if errorlevel 1 goto :menu
call :ask_file "Cole/arraste audio ou video"
if errorlevel 1 goto :menu
echo.
echo   %WHITE%[1]%RST% MP3 podcast 128 kbps mono
echo   %WHITE%[2]%RST% MP3 alta qualidade 320 kbps
echo   %WHITE%[3]%RST% WAV limpo 48 kHz
echo   %YELLOW%[B]%RST% Voltar
echo.
set "AOPT="
set /p "AOPT=  %GREEN%>%RST% "
set "OUT_EXT="
set "ARGS="
if "!AOPT!"=="1" (set "OUT_EXT=mp3" & set "ARGS=-vn -af loudnorm=I=-16:TP=-1.5:LRA=11 -ac 1 -ar 44100 -c:a libmp3lame -b:a 128k")
if "!AOPT!"=="2" (set "OUT_EXT=mp3" & set "ARGS=-vn -af loudnorm=I=-14:TP=-1.0:LRA=11 -ar 48000 -c:a libmp3lame -b:a 320k")
if "!AOPT!"=="3" (set "OUT_EXT=wav" & set "ARGS=-vn -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 -c:a pcm_s16le")
if /I "!AOPT!"=="B" goto :menu
if not defined OUT_EXT goto :audio_cleaner
call :timestamp
set "OUT_DIR=%TOOLS_OUT%\Audio"
if not exist "!OUT_DIR!" mkdir "!OUT_DIR!" >nul 2>&1
for %%F in ("!INFILE!") do set "OUT=!OUT_DIR!\%%~nF_clean_!STAMP!.!OUT_EXT!"
"%FFMPEG%" -y -hide_banner -loglevel warning -i "!INFILE!" !ARGS! "!OUT!"
if errorlevel 1 goto :tool_error
echo.
echo   %GREEN%[ok]%RST% Audio criado:
echo   %WHITE%!OUT!%RST%
start "" explorer.exe /select,"!OUT!"
goto :pause_menu

:subtitle_lab
cls
call :banner "SUBTITLE LAB" "legendas locais"
echo   %WHITE%[1]%RST% Baixar legendas de um link com yt-dlp
echo   %WHITE%[2]%RST% Extrair legenda embutida de arquivo
echo   %YELLOW%[B]%RST% Voltar
echo.
set "SOPT="
set /p "SOPT=  %GREEN%>%RST% "
if "!SOPT!"=="1" goto :subtitle_download
if "!SOPT!"=="2" goto :subtitle_extract
if /I "!SOPT!"=="B" goto :menu
goto :subtitle_lab

:subtitle_download
call :need_ytdlp
if errorlevel 1 goto :subtitle_lab
echo.
set "LINK="
set /p "LINK=  Cole o link do video: "
if not defined LINK goto :subtitle_lab
if /I "!LINK:~0,4!" NEQ "http" (
    echo   %RED%[erro]%RST% Link precisa comecar com http:// ou https://.
    goto :pause_menu
)
set "OUT_DIR=%TOOLS_OUT%\Subtitles"
if not exist "!OUT_DIR!" mkdir "!OUT_DIR!" >nul 2>&1
"%YTDLP%" --skip-download --write-subs --write-auto-subs --sub-langs "pt.*,en.*" --convert-subs srt -o "!OUT_DIR!\%%(title).120s.%%(ext)s" "!LINK!"
if errorlevel 1 goto :tool_error
start "" explorer.exe "!OUT_DIR!"
goto :pause_menu

:subtitle_extract
call :need_ffmpeg
if errorlevel 1 goto :subtitle_lab
call :ask_file "Cole/arraste o arquivo com legenda embutida"
if errorlevel 1 goto :subtitle_lab
call :timestamp
set "OUT_DIR=%TOOLS_OUT%\Subtitles"
if not exist "!OUT_DIR!" mkdir "!OUT_DIR!" >nul 2>&1
for %%F in ("!INFILE!") do set "OUT=!OUT_DIR!\%%~nF_sub_!STAMP!.srt"
"%FFMPEG%" -y -hide_banner -loglevel warning -i "!INFILE!" -map 0:s:0 "!OUT!"
if errorlevel 1 (
    echo   %YELLOW%[aviso]%RST% Nao encontrei legenda embutida compativel.
    goto :pause_menu
)
start "" explorer.exe /select,"!OUT!"
goto :pause_menu

:batch_renamer
cls
call :banner "BATCH RENAMER" "organizar arquivos"
set "FOLDER="
set /p "FOLDER=  Cole a pasta: "
if not defined FOLDER goto :menu
set "FOLDER=!FOLDER:"=!"
if not exist "!FOLDER!" (
    echo   %RED%[erro]%RST% Pasta nao encontrada.
    goto :pause_menu
)
set "PREFIX="
set /p "PREFIX=  Prefixo novo [ex: aula]: "
if not defined PREFIX goto :menu
set "OF_FOLDER=!FOLDER!"
set "OF_PREFIX=!PREFIX!"
powershell.exe -NoProfile -Command "$dir=$env:OF_FOLDER; $prefix=$env:OF_PREFIX; $files=Get-ChildItem -LiteralPath $dir -File | Sort-Object Name; $i=1; foreach($f in $files){ $new='{0}_{1:000}{2}' -f $prefix,$i,$f.Extension; '{0}  ->  {1}' -f $f.Name,$new; $i++ }" 
echo.
echo   %YELLOW%Renomear altera nomes de arquivos locais.%RST%
set "CONFIRM="
set /p "CONFIRM=  Digite RENOMEAR para aplicar: "
if /I not "!CONFIRM!"=="RENOMEAR" goto :menu
powershell.exe -NoProfile -Command "$dir=$env:OF_FOLDER; $prefix=$env:OF_PREFIX; $files=Get-ChildItem -LiteralPath $dir -File | Sort-Object Name; $i=1; foreach($f in $files){ $new='{0}_{1:000}{2}' -f $prefix,$i,$f.Extension; Rename-Item -LiteralPath $f.FullName -NewName $new; $i++ }; Write-Host ('Arquivos renomeados: {0}' -f $files.Count)"
goto :pause_menu

:folder_report
cls
call :banner "FOLDER REPORT" "mapa de arquivos"
set "FOLDER="
set /p "FOLDER=  Cole a pasta: "
if not defined FOLDER goto :menu
set "FOLDER=!FOLDER:"=!"
if not exist "!FOLDER!" (
    echo   %RED%[erro]%RST% Pasta nao encontrada.
    goto :pause_menu
)
call :timestamp
set "REPORT_DIR=%TOOLS_OUT%\Reports"
if not exist "!REPORT_DIR!" mkdir "!REPORT_DIR!" >nul 2>&1
set "REPORT=!REPORT_DIR!\folder_report_!STAMP!.txt"
set "OF_FOLDER=!FOLDER!"
set "OF_REPORT=!REPORT!"
powershell.exe -NoProfile -Command "$dir=$env:OF_FOLDER; $out=$env:OF_REPORT; $files=Get-ChildItem -LiteralPath $dir -File -Recurse -ErrorAction SilentlyContinue | Sort-Object Length -Descending; $total=($files | Measure-Object Length -Sum).Sum; $lines=@(); $lines+='OmniFetch Folder Report'; $lines+='Pasta: '+$dir; $lines+='Total: '+('{0:N2} GB' -f ($total/1GB)); $lines+='Arquivos: '+$files.Count; $lines+=''; $lines+='TOP 50 MAIORES'; $files | Select-Object -First 50 | ForEach-Object { $lines += ('{0,10:N2} MB  {1}' -f ($_.Length/1MB), $_.FullName) }; Set-Content -LiteralPath $out -Value $lines -Encoding UTF8; Write-Host $out"
echo.
echo   %GREEN%[ok]%RST% Relatorio criado:
echo   %WHITE%!REPORT!%RST%
set "OPEN="
set /p "OPEN=  Abrir relatorio agora? [S/N] "
if /I "!OPEN!"=="S" start "" notepad.exe "!REPORT!"
goto :pause_menu

:ask_file
echo   %WHITE%%~1%RST%
echo   %DIM%ENTER vazio volta.%RST%
echo.
set "INFILE="
set /p "INFILE=  %GREEN%>%RST% "
if not defined INFILE exit /b 1
set "INFILE=!INFILE:"=!"
if not exist "!INFILE!" (
    echo.
    echo   %RED%[erro]%RST% Arquivo nao encontrado:
    echo   %WHITE%!INFILE!%RST%
    timeout /t 2 >nul
    exit /b 1
)
exit /b 0

:need_ffmpeg
if exist "%FFMPEG%" exit /b 0
echo   %RED%[erro]%RST% ffmpeg.exe nao encontrado. Rode 1_SETUP.bat.
pause
exit /b 1

:need_ffprobe
if exist "%FFPROBE%" exit /b 0
echo   %RED%[erro]%RST% ffprobe.exe nao encontrado. Rode 1_SETUP.bat.
pause
exit /b 1

:need_ytdlp
if exist "%YTDLP%" exit /b 0
echo   %RED%[erro]%RST% yt-dlp.exe nao encontrado. Rode 1_SETUP.bat.
pause
exit /b 1

:timestamp
set "STAMP=%DATE%_%TIME%"
set "STAMP=!STAMP:/=-!"
set "STAMP=!STAMP::=-!"
set "STAMP=!STAMP:,=-!"
set "STAMP=!STAMP: =0!"
where /q powershell.exe
if not errorlevel 1 for /f "usebackq delims=" %%T in (`powershell.exe -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss" 2^>nul`) do set "STAMP=%%T"
exit /b

:tool_error
echo.
echo   %RED%[erro]%RST% A ferramenta nao conseguiu concluir.
echo   %DIM%Se o arquivo estiver aberto em outro programa, feche e tente de novo.%RST%
goto :pause_menu

:pause_menu
echo.
pause
goto :menu

:bye
echo.
echo   %GREEN%ate logo.%RST%
endlocal
exit /b 0

:init_app
if not exist "data" mkdir "data" >nul 2>&1
if not exist "logs" mkdir "logs" >nul 2>&1
if not exist "%TOOLS_OUT%" mkdir "%TOOLS_OUT%" >nul 2>&1
exit /b

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
call "%~dp0brand-logo.bat"
echo.
echo   %WHITE%%BOLD%OmniFetch %~1%RST%   %DIM%- %~2%RST%
echo   %BAR%
echo.
exit /b
