@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 <nul >nul
cd /d "%~dp0"
title OmniFetch - Launcher

call :colors
call :init_app
call "%~dp0core\omni-ui.bat" splash "LAUNCHER" "hub premium para baixar, converter e organizar"
call :load_config
call :refresh_status

:menu
cls
call :banner "LAUNCHER" "universal downloader + converter"
echo   %WHITE%%BOLD%COMO QUER USAR HOJE?%RST%
echo.
echo     %GREEN%[1]%RST%  %WHITE%Downloader%RST%        link, fila, cookies, 4K, audio e aria2 turbo
echo     %GREEN%[2]%RST%  %WHITE%Conversor%RST%         presets profissionais para video, audio, imagem e ebook
echo     %GREEN%[3]%RST%  %WHITE%OmniTools%RST%         inspector, cortes, legendas, renomeador e relatorios
echo     %YELLOW%[4]%RST%  %WHITE%Setup / atualizar%RST% motores portateis, atalhos e icones oficiais
echo     %CYAN%[5]%RST%  %WHITE%Preferencias%RST%      velocidade, qualidade, UX e atalhos salvos
echo     %DIM%[6]  Abrir pasta Downloads%RST%
echo     %DIM%[7]  Historico e logs%RST%
echo     %DIM%[8]  Diagnostico rapido%RST%
echo     %DIM%[9]  Ferramentas / manutencao%RST%
echo     %DIM%[Q]  Sair%RST%
echo.
echo   %BAR%
echo   motores: yt-dlp !S_YT!   ffmpeg !S_FF!   aria2 !S_AR!
echo   perfil: !SPEED_PROFILE!   fragments: !CONCURRENT_FRAGMENTS!   intro: !INTRO_ANIMATION!
echo   %BAR%
echo.
set "OPT="
set /p "OPT=  %GREEN%>%RST% "

if /I "!OPT!"=="1" goto :downloader
if /I "!OPT!"=="2" goto :converter
if /I "!OPT!"=="3" goto :omnitools
if /I "!OPT!"=="4" goto :setup
if /I "!OPT!"=="5" goto :preferences
if /I "!OPT!"=="6" goto :downloads
if /I "!OPT!"=="7" goto :activity
if /I "!OPT!"=="8" goto :diagnostic
if /I "!OPT!"=="9" goto :tools
if /I "!OPT!"=="Q" goto :bye
if "!OPT!"=="" goto :menu

echo.
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :menu



:downloader
call "%~dp0Downloader.bat"
call :load_config
call :refresh_status
goto :menu

:converter
call "%~dp0Conversor.bat"
call :load_config
call :refresh_status
goto :menu

:omnitools
if not exist "%~dp0core\OmniTools.bat" (
    echo.
    echo   %RED%[erro]%RST% OmniTools.bat nao encontrado.
    pause
    goto :menu
)
call "%~dp0core\OmniTools.bat"
call :load_config
call :refresh_status
goto :menu

:setup
call "%~dp0Instalar.bat"
call :load_config
call :refresh_status
goto :menu

:preferences
call :load_config
cls
call :banner "PREFERENCIAS" "controle fino sem complicar"
echo   %WHITE%%BOLD%Perfil salvo para todos os programas%RST%
echo.
echo   %WHITE%[1]%RST% Pasta padrao:        !DEFAULT_DEST!
echo   %WHITE%[2]%RST% Cookies/browser:     !DEFAULT_BROWSER!
echo   %WHITE%[3]%RST% Abrir ao finalizar:  !OPEN_WHEN_DONE!
echo   %WHITE%[4]%RST% Intro premium:       !INTRO_ANIMATION!
echo   %WHITE%[5]%RST% Velocidade:          !SPEED_PROFILE!  ^(!CONCURRENT_FRAGMENTS! fragments, aria2 !ARIA_CONNECTIONS!x^)
echo   %WHITE%[6]%RST% Metadata/thumbnails: !EMBED_METADATA! / !EMBED_THUMBNAIL!
echo   %WHITE%[7]%RST% Legendas automaticas: !DOWNLOAD_SUBS!
echo   %WHITE%[8]%RST% Arquivo anti-duplicado: !DOWNLOAD_ARCHIVE!
echo   %WHITE%[9]%RST% Recriar atalhos com icones oficiais
echo   %YELLOW%[B]%RST% Voltar
echo.
set "POPT="
set /p "POPT=  %GREEN%>%RST% "
if "!POPT!"=="1" goto :pref_dest
if "!POPT!"=="2" goto :pref_browser
if "!POPT!"=="3" goto :pref_open
if "!POPT!"=="4" goto :pref_intro
if "!POPT!"=="5" goto :pref_speed
if "!POPT!"=="6" goto :pref_media
if "!POPT!"=="7" goto :pref_subs
if "!POPT!"=="8" goto :pref_archive
if "!POPT!"=="9" goto :pref_shortcuts
if /I "!POPT!"=="B" goto :menu
goto :preferences

:pref_dest
echo.
set "NEW_DEST="
set /p "NEW_DEST=  Nova pasta padrao: "
if defined NEW_DEST (
    set "NEW_DEST=!NEW_DEST:"=!"
    if not exist "!NEW_DEST!" mkdir "!NEW_DEST!" >nul 2>&1
    if exist "!NEW_DEST!" set "DEFAULT_DEST=!NEW_DEST!"
)
call :save_config
goto :preferences

:pref_browser
echo.
echo   %WHITE%[1]%RST% Chrome   %WHITE%[2]%RST% Edge   %WHITE%[3]%RST% Firefox   %WHITE%[4]%RST% Brave
set "BROWSER_CHOICE="
set /p "BROWSER_CHOICE=  %GREEN%>%RST% "
if "!BROWSER_CHOICE!"=="1" set "DEFAULT_BROWSER=chrome"
if "!BROWSER_CHOICE!"=="2" set "DEFAULT_BROWSER=edge"
if "!BROWSER_CHOICE!"=="3" set "DEFAULT_BROWSER=firefox"
if "!BROWSER_CHOICE!"=="4" set "DEFAULT_BROWSER=brave"
call :save_config
goto :preferences

:pref_open
if /I "!OPEN_WHEN_DONE!"=="S" (set "OPEN_WHEN_DONE=N") else set "OPEN_WHEN_DONE=S"
call :save_config
goto :preferences

:pref_intro
echo.
echo   %WHITE%[1]%RST% Full premium   %WHITE%[2]%RST% Rapida   %WHITE%[3]%RST% Off
set "INTRO_CHOICE="
set /p "INTRO_CHOICE=  %GREEN%>%RST% "
if "!INTRO_CHOICE!"=="1" set "INTRO_ANIMATION=full"
if "!INTRO_CHOICE!"=="2" set "INTRO_ANIMATION=fast"
if "!INTRO_CHOICE!"=="3" set "INTRO_ANIMATION=off"
call :save_config
goto :preferences

:pref_speed
echo.
echo   %WHITE%[1]%RST% Turbo Max      16 fragments, aria2 16x, retries altos
echo   %WHITE%[2]%RST% Equilibrado    8 fragments, aria2 8x
echo   %WHITE%[3]%RST% Conservador    4 fragments, menos agressivo
echo   %WHITE%[4]%RST% Custom         editar numeros manualmente
set "SPEED_CHOICE="
set /p "SPEED_CHOICE=  %GREEN%>%RST% "
if "!SPEED_CHOICE!"=="1" (
    set "SPEED_PROFILE=turbo"
    set "CONCURRENT_FRAGMENTS=16"
    set "DOWNLOAD_RETRIES=20"
    set "ARIA_CONNECTIONS=16"
    set "ARIA_SPLITS=16"
    set "ARIA_CHUNK=1M"
)
if "!SPEED_CHOICE!"=="2" (
    set "SPEED_PROFILE=balanced"
    set "CONCURRENT_FRAGMENTS=8"
    set "DOWNLOAD_RETRIES=12"
    set "ARIA_CONNECTIONS=8"
    set "ARIA_SPLITS=8"
    set "ARIA_CHUNK=1M"
)
if "!SPEED_CHOICE!"=="3" (
    set "SPEED_PROFILE=conservative"
    set "CONCURRENT_FRAGMENTS=4"
    set "DOWNLOAD_RETRIES=8"
    set "ARIA_CONNECTIONS=4"
    set "ARIA_SPLITS=4"
    set "ARIA_CHUNK=1M"
)
if "!SPEED_CHOICE!"=="4" goto :pref_speed_custom
call :save_config
goto :preferences

:pref_speed_custom
set "SPEED_PROFILE=custom"
echo.
echo   %DIM%ENTER vazio mantem o valor atual.%RST%
set "TMP="
set /p "TMP=  Fragmentos [!CONCURRENT_FRAGMENTS!]: "
if defined TMP set "CONCURRENT_FRAGMENTS=!TMP!"
set "TMP="
set /p "TMP=  Tentativas [!DOWNLOAD_RETRIES!]: "
if defined TMP set "DOWNLOAD_RETRIES=!TMP!"
set "TMP="
set /p "TMP=  Conexoes aria2 [!ARIA_CONNECTIONS!]: "
if defined TMP set "ARIA_CONNECTIONS=!TMP!"
set "TMP="
set /p "TMP=  Splits aria2 [!ARIA_SPLITS!]: "
if defined TMP set "ARIA_SPLITS=!TMP!"
set "TMP="
set /p "TMP=  Chunk aria2 [!ARIA_CHUNK!]: "
if defined TMP set "ARIA_CHUNK=!TMP!"
call :save_config
goto :preferences

:pref_media
if /I "!EMBED_METADATA!"=="S" (set "EMBED_METADATA=N") else set "EMBED_METADATA=S"
if /I "!EMBED_THUMBNAIL!"=="S" (set "EMBED_THUMBNAIL=N") else set "EMBED_THUMBNAIL=S"
call :save_config
goto :preferences

:pref_subs
if /I "!DOWNLOAD_SUBS!"=="S" (set "DOWNLOAD_SUBS=N") else set "DOWNLOAD_SUBS=S"
call :save_config
goto :preferences

:pref_archive
if /I "!DOWNLOAD_ARCHIVE!"=="S" (set "DOWNLOAD_ARCHIVE=N") else set "DOWNLOAD_ARCHIVE=S"
call :save_config
goto :preferences

:pref_shortcuts
cls
call :banner "ATALHOS" "icones oficiais"
if exist "%~dp0core\install-shortcuts.ps1" (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0core\install-shortcuts.ps1"
) else (
    echo   %RED%[erro]%RST% Instalador de atalhos nao encontrado.
)
echo.
pause
goto :preferences

:downloads
start "" explorer.exe "%USERPROFILE%\Downloads"
goto :menu

:activity
cls
call :banner "ATIVIDADE" "historico e logs"
echo   %WHITE%%BOLD%Downloads recentes%RST%
if exist "data\download_history.tsv" (
    powershell.exe -NoProfile -Command "Get-Content -LiteralPath 'data\download_history.tsv' -Tail 8 | ForEach-Object { $x=$_ -split '\|',6; if($x.Count -ge 5){ '  {0}  [{1}]  {2}' -f $x[0],$x[1],$x[4] } }"
) else (
    echo   %DIM%Ainda nao ha historico de download.%RST%
)
echo.
echo   %WHITE%%BOLD%Conversoes recentes%RST%
if exist "data\convert_history.tsv" (
    powershell.exe -NoProfile -Command "Get-Content -LiteralPath 'data\convert_history.tsv' -Tail 8 | ForEach-Object { $x=$_ -split '\|',6; if($x.Count -ge 5){ '  {0}  [{1}]  {2}' -f $x[0],$x[1],$x[4] } }"
) else (
    echo   %DIM%Ainda nao ha historico de conversao.%RST%
)
echo.
echo   %DIM%[O] abrir pasta data/logs    ENTER = voltar%RST%
set "AOPT="
set /p "AOPT=  %GREEN%>%RST% "
if /I "!AOPT!"=="O" start "" explorer.exe "%~dp0data"
goto :menu

:diagnostic
cls
call :banner "DIAGNOSTICO" "estado do OmniFetch"
call :refresh_status
echo   %WHITE%Raiz:%RST%       %~dp0
echo   %WHITE%Downloads:%RST%  %USERPROFILE%\Downloads
echo   %WHITE%Data:%RST%       %DATE% %TIME%
echo.
echo   %WHITE%%BOLD%Motores%RST%
call :version "motores\yt-dlp.exe" "yt-dlp" "--version"
call :version "motores\ffmpeg.exe" "ffmpeg" "-version"
call :version "motores\ffprobe.exe" "ffprobe" "-version"
call :version "motores\aria2c.exe" "aria2c" "--version"
where /q powershell.exe
if errorlevel 1 (echo   %RED%[off]%RST% PowerShell nao encontrado.) else echo   %GREEN%[ok]%RST% PowerShell
where /q curl.exe
if errorlevel 1 (echo   %YELLOW%[off]%RST% curl nao encontrado.) else echo   %GREEN%[ok]%RST% curl
where /q ebook-convert.exe
if errorlevel 1 (echo   %YELLOW%[opcional]%RST% Calibre nao encontrado.) else echo   %GREEN%[ok]%RST% Calibre
echo.
echo   %WHITE%%BOLD%Pastas%RST%
if exist "data" (echo   %GREEN%[ok]%RST% data) else echo   %RED%[off]%RST% data
if exist "logs" (echo   %GREEN%[ok]%RST% logs) else echo   %RED%[off]%RST% logs
echo.
pause
goto :menu

:tools
cls
call :banner "FERRAMENTAS" "manutencao e arsenal"
echo   %WHITE%[1]%RST% Atualizar yt-dlp agora
echo   %WHITE%[2]%RST% Limpar downloads parciais em Downloads
echo   %WHITE%[3]%RST% Abrir pasta data/logs
echo   %YELLOW%[B]%RST% Voltar
echo.
set "TOPT="
set /p "TOPT=  %GREEN%>%RST% "
if "!TOPT!"=="1" goto :tool_update_ytdlp
if "!TOPT!"=="2" goto :tool_cleanup_partials
if "!TOPT!"=="3" (
    start "" explorer.exe "%~dp0data"
    goto :tools
)
if /I "!TOPT!"=="B" goto :menu
goto :tools

:tool_update_ytdlp
cls
call :banner "UPDATE" "yt-dlp"
if not exist "motores\yt-dlp.exe" (
    echo   %YELLOW%yt-dlp ainda nao existe. Rode o Setup primeiro.%RST%
    pause
    goto :tools
)
echo   %CYAN%Atualizando yt-dlp...%RST%
"motores\yt-dlp.exe" -U
echo.
pause
goto :tools

:tool_cleanup_partials
cls
call :banner "LIMPEZA" "downloads parciais"
echo   %YELLOW%Isto remove apenas arquivos temporarios conhecidos na pasta Downloads:%RST%
echo   %WHITE%%USERPROFILE%\Downloads%RST%
echo.
echo   Extensoes: .part .ytdl .temp .tmp
echo.
set "CONFIRM="
set /p "CONFIRM=  Digite S para limpar: "
if /I not "!CONFIRM!"=="S" goto :tools
powershell.exe -NoProfile -Command "$d=Join-Path $env:USERPROFILE 'Downloads'; $patterns='*.part','*.ytdl','*.temp','*.tmp'; $removed=0; foreach($p in $patterns){ Get-ChildItem -LiteralPath $d -File -Filter $p -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue; $removed++ } }; Write-Host ('Arquivos removidos: {0}' -f $removed)"
echo.
pause
goto :tools

:bye
echo.
echo   %GREEN%ate logo.%RST%
endlocal
exit /b 0

:load_config
set "CONFIG=%~dp0data\config.ini"
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
if exist "%~dp0core\ensure-config.bat" call "%~dp0core\ensure-config.bat" "%~dp0"
if not exist "data\config.ini" (
    (
        echo DEFAULT_DEST=%USERPROFILE%\Downloads
        echo DEFAULT_BROWSER=edge
        echo OPEN_WHEN_DONE=N
        echo INTRO_ANIMATION=full
        echo SPEED_PROFILE=turbo
        echo CONCURRENT_FRAGMENTS=16
        echo DOWNLOAD_RETRIES=20
        echo ARIA_CONNECTIONS=16
        echo ARIA_SPLITS=16
        echo ARIA_CHUNK=1M
        echo EMBED_METADATA=S
        echo EMBED_THUMBNAIL=S
        echo DOWNLOAD_SUBS=N
        echo DOWNLOAD_ARCHIVE=N
    ) > "data\config.ini"
)
exit /b

:refresh_status
set "S_YT=%RED%off%RST%"
set "S_FF=%RED%off%RST%"
set "S_AR=%DIM%off%RST%"
if exist "motores\yt-dlp.exe" set "S_YT=%GREEN%on%RST%"
if exist "motores\ffmpeg.exe" set "S_FF=%GREEN%on%RST%"
if exist "motores\aria2c.exe" set "S_AR=%GREEN%on%RST%"
exit /b

:version
set "EXE=%~1"
set "NAME=%~2"
set "ARG=%~3"
if not exist "%EXE%" (
    echo   %RED%[off]%RST% %NAME% nao encontrado.
    exit /b
)
set "VER="
for /f "delims=" %%V in ('"%EXE%" %ARG% 2^>nul') do if not defined VER set "VER=%%V"
if defined VER (
    echo   %GREEN%[ok]%RST% %NAME%   %DIM%!VER!%RST%
) else (
    echo   %GREEN%[ok]%RST% %NAME%
)
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
call "%~dp0core\brand-logo.bat"
echo.
echo   %WHITE%%BOLD%OmniFetch %~1%RST%   %DIM%- %~2%RST%
echo   %BAR%
echo.
exit /b
