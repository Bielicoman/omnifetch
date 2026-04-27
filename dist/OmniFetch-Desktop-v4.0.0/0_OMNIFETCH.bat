@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 <nul >nul
cd /d "%~dp0"
title OmniFetch - Launcher

call :colors
call :init_app
call :refresh_status

:menu
cls
call :banner "LAUNCHER" "universal downloader + converter"
echo   %WHITE%%BOLD%COMO QUER USAR HOJE?%RST%
echo.
echo     %GREEN%[1]%RST%  %WHITE%Web GUI local%RST%        navegador em http://localhost:7777
echo     %GREEN%[2]%RST%  %WHITE%Downloader CLI%RST%       cole o link, ENTER, baixa em Downloads
echo     %GREEN%[3]%RST%  %WHITE%Conversor CLI%RST%        arraste arquivo, escolha o formato
echo     %GREEN%[4]%RST%  %WHITE%OmniTools CLI%RST%        inspector, cortes, legendas, organizador
echo     %YELLOW%[5]%RST%  %WHITE%Setup / atualizar%RST%    baixa yt-dlp, ffmpeg e aria2
echo     %DIM%[6]  Abrir pasta Downloads%RST%
echo     %DIM%[7]  Historico e logs%RST%
echo     %DIM%[8]  Diagnostico rapido%RST%
echo     %DIM%[9]  Ferramentas / manutencao%RST%
echo     %DIM%[Q]  Sair%RST%
echo.
echo   %BAR%
echo   motores: yt-dlp !S_YT!   ffmpeg !S_FF!   aria2 !S_AR!
echo   %BAR%
echo.
set "OPT="
set /p "OPT=  %GREEN%>%RST% "

if /I "!OPT!"=="1" goto :web
if /I "!OPT!"=="2" goto :downloader
if /I "!OPT!"=="3" goto :converter
if /I "!OPT!"=="4" goto :omnitools
if /I "!OPT!"=="5" goto :setup
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

:web
where /q powershell.exe
if errorlevel 1 (
    echo.
    echo   %RED%[erro]%RST% PowerShell nao encontrado no PATH.
    pause
    goto :menu
)
if not exist "server.ps1" (
    echo.
    echo   %RED%[erro]%RST% server.ps1 nao encontrado na pasta desktop.
    pause
    goto :menu
)
if not exist "motores\yt-dlp.exe" (
    echo.
    echo   %YELLOW%[setup]%RST% yt-dlp ainda nao esta instalado.
    echo   Rode o setup primeiro para liberar a Web GUI local.
    echo.
    pause
    goto :setup
)
echo.
echo   %CYAN%Iniciando Web GUI local...%RST%
echo   %DIM%O navegador abre em alguns segundos. Feche esta janela para encerrar o servidor.%RST%
start "" cmd /d /c "timeout /t 2 /nobreak >nul && start http://localhost:7777"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
call :refresh_status
goto :menu

:downloader
call "%~dp02_DOWNLOADER.bat"
call :refresh_status
goto :menu

:converter
call "%~dp03_CONVERSOR.bat"
call :refresh_status
goto :menu

:omnitools
if not exist "%~dp04_OMNITOOLS.bat" (
    echo.
    echo   %RED%[erro]%RST% 4_OMNITOOLS.bat nao encontrado.
    pause
    goto :menu
)
call "%~dp04_OMNITOOLS.bat"
call :refresh_status
goto :menu

:setup
call "%~dp01_SETUP.bat"
call :refresh_status
goto :menu

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
echo   %WHITE%[4]%RST% Abrir pasta webui
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
if "!TOPT!"=="4" (
    start "" explorer.exe "%~dp0webui"
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

:init_app
if not exist "data" mkdir "data" >nul 2>&1
if not exist "logs" mkdir "logs" >nul 2>&1
if not exist "data\config.ini" (
    (
        echo DEFAULT_DEST=%USERPROFILE%\Downloads
        echo DEFAULT_BROWSER=edge
        echo OPEN_WHEN_DONE=N
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
call "%~dp0brand-logo.bat"
echo.
echo   %WHITE%%BOLD%OmniFetch %~1%RST%   %DIM%- %~2%RST%
echo   %BAR%
echo.
exit /b
