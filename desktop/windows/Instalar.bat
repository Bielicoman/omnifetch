@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 <nul >nul
cd /d "%~dp0"
title OmniFetch - Setup

call :colors
set "ENGINES=..\motores"
set "ENGINES_DISPLAY=%~dp0..\motores"
if not exist "%ENGINES%" mkdir "%ENGINES%" >nul 2>&1
call :init_app
call "%~dp0..\core\omni-ui.bat" splash "SETUP" "motores portateis, atalhos e icones oficiais"

if /I "%~1"=="--check" goto :doctor
if /I "%~1"=="/check" goto :doctor

cls
call :banner "SETUP" "instalador local dos motores"
echo   %WHITE%%BOLD%O que sera instalado:%RST%
echo.
echo     %GREEN%yt-dlp%RST%   downloader universal
echo     %GREEN%FFmpeg%RST%   conversao, merge de audio/video e thumbnails
echo     %GREEN%ffprobe%RST%  leitura tecnica de midias
echo     %GREEN%aria2%RST%    acelerador opcional de downloads
echo.
echo   %DIM%Tudo fica dentro de:%RST%
echo   %WHITE%%ENGINES_DISPLAY%%RST%
echo.
echo   %DIM%Nao altera o PATH global e nao precisa reiniciar o computador.%RST%
echo.

set "FAIL=0"
call :check_tools
if "!FAIL!"=="1" goto :finish

call :section "1/5" "yt-dlp"
call :getfile "%ENGINES%\yt-dlp.exe" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"

call :section "2/5" "FFmpeg + ffprobe"
call :getzip "%TEMP%\omnifetch-ffmpeg.zip" "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip" "%TEMP%\omnifetch-ffmpeg-%RANDOM%" "ffmpeg.exe ffprobe.exe"

call :section "3/5" "aria2"
call :getzip "%TEMP%\omnifetch-aria2.zip" "https://github.com/aria2/aria2/releases/download/release-1.37.0/aria2-1.37.0-win-64bit-build1.zip" "%TEMP%\omnifetch-aria2-%RANDOM%" "aria2c.exe"

call :section "4/5" "Calibre opcional"
where /q ebook-convert.exe
if not errorlevel 1 (
    echo   %GREEN%[ok]%RST% ebook-convert ja esta instalado.
) else (
    echo   %YELLOW%[opcional]%RST% Calibre habilita conversao EPUB, MOBI, AZW3 e DOCX.
    where /q winget.exe
    if errorlevel 1 (
        echo   %DIM%winget nao encontrado. Pulei a instalacao do Calibre.%RST%
    ) else (
        echo   %WHITE%Quer instalar Calibre via winget agora?%RST% %DIM%[S/N, ENTER = N]%RST%
        set "CALIBRE_CHOICE="
        set /p "CALIBRE_CHOICE=  %GREEN%>%RST% "
        if /I "!CALIBRE_CHOICE!"=="S" (
            winget install --id calibre.calibre --silent --accept-package-agreements --accept-source-agreements
            if errorlevel 1 (
                echo   %YELLOW%[aviso]%RST% Calibre nao foi instalado. O resto do OmniFetch continua OK.
            ) else (
                echo   %GREEN%[ok]%RST% Calibre instalado.
            )
        ) else (
            echo   %DIM%Calibre pulado. Voce pode instalar depois se quiser e-books.%RST%
        )
    )
)

call :section "5/5" "Atalhos e estrutura"
call :create_shortcuts
call :context_menu_prompt

:finish
echo.
call :doctor
echo.
if "!FAIL!"=="0" (
    echo   %GREEN%%BOLD%Setup finalizado.%RST% Rode %WHITE%OmniFetch.bat%RST%, %WHITE%Downloader.bat%RST% ou %WHITE%Conversor.bat%RST%.
) else (
    echo   %RED%%BOLD%Setup terminou com avisos.%RST% Rode novamente quando a conexao estiver OK.
)
echo.
pause
endlocal
exit /b 0

:doctor
if /I "%~1"=="--check" cls
call :banner "CHECK" "status dos componentes"
call :version "%ENGINES%\yt-dlp.exe" "yt-dlp" "--version"
call :version "%ENGINES%\ffmpeg.exe" "ffmpeg" "-version"
call :version "%ENGINES%\ffprobe.exe" "ffprobe" "-version"
call :version "%ENGINES%\aria2c.exe" "aria2c" "--version"
where /q ebook-convert.exe
if errorlevel 1 (
    echo   %YELLOW%[opcional]%RST% Calibre / ebook-convert nao encontrado.
) else (
    set "CALIBRE_VER="
    for /f "delims=" %%V in ('ebook-convert.exe --version 2^>nul') do if not defined CALIBRE_VER set "CALIBRE_VER=%%V"
    if defined CALIBRE_VER (
        echo   %GREEN%[ok]%RST% Calibre   %DIM%!CALIBRE_VER!%RST%
    ) else (
        echo   %GREEN%[ok]%RST% Calibre instalado.
    )
)
if /I "%~1"=="--check" (
    echo.
    pause
    endlocal
    exit /b 0
)
exit /b

:check_tools
where /q powershell.exe
if errorlevel 1 (
    echo   %RED%[erro]%RST% PowerShell nao encontrado. O setup precisa dele para extrair ZIPs.
    set "FAIL=1"
)
where /q curl.exe
if errorlevel 1 (
    echo   %YELLOW%[aviso]%RST% curl nao encontrado; vou usar PowerShell para downloads.
) else (
    echo   %GREEN%[ok]%RST% curl encontrado.
)
exit /b

:init_app
if not exist "..\data" mkdir "..\data" >nul 2>&1
if not exist "..\logs" mkdir "..\logs" >nul 2>&1
if exist "%~dp0..\core\ensure-config.bat" call "%~dp0..\core\ensure-config.bat" "%~dp0..\"
if not exist "..\data\config.ini" (
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
    ) > "..\data\config.ini"
)
exit /b

:create_shortcuts
where /q powershell.exe
if errorlevel 1 (
    echo   %YELLOW%[skip]%RST% PowerShell ausente; atalhos pulados.
    exit /b
)
if not exist "%~dp0..\core\install-shortcuts.ps1" (
    echo   %YELLOW%[aviso]%RST% instalador de atalhos nao encontrado.
    exit /b
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\core\install-shortcuts.ps1" >nul 2>&1
if errorlevel 1 (
    echo   %YELLOW%[aviso]%RST% Nao consegui criar todos os atalhos.
) else (
    echo   %GREEN%[ok]%RST% atalhos com icones criados no Desktop e Menu Iniciar.
)
exit /b

:context_menu_prompt
echo.
echo   %WHITE%Adicionar "Converter com OmniFetch" no botao direito do Windows?%RST% %DIM%[S/N, ENTER = N]%RST%
set "CTX_CHOICE="
set /p "CTX_CHOICE=  %GREEN%>%RST% "
if /I not "!CTX_CHOICE!"=="S" (
    echo   %DIM%Menu de botao direito pulado.%RST%
    exit /b
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$root=(Resolve-Path '.').Path; $parent=(Resolve-Path '..').Path; $base='HKCU:\Software\Classes\*\shell\OmniFetchConvert'; $q=[char]34; $target=Join-Path $root 'Conversor.bat'; $icon=Join-Path $parent 'assets\icons\conversor.ico'; $cmd=$q+$target+$q+' '+$q+'%%1'+$q; New-Item -Path $base -Force -Value 'Converter com OmniFetch' | Out-Null; Set-ItemProperty -Path $base -Name Icon -Value $icon; New-Item -Path ($base + '\command') -Force -Value $cmd | Out-Null" >nul 2>&1
if errorlevel 1 (
    echo   %YELLOW%[aviso]%RST% Nao consegui criar o menu de botao direito.
) else (
    echo   %GREEN%[ok]%RST% menu de botao direito ativado para arquivos.
)
exit /b

:getfile
set "DEST=%~1"
set "URL=%~2"
set "TMP=%TEMP%\omnifetch-%~nx1-%RANDOM%.download"
if exist "%TMP%" del /q "%TMP%" >nul 2>&1
if exist "%TMP%" rmdir /s /q "%TMP%" >nul 2>&1
echo   %DIM%baixando:%RST% %WHITE%%~nx1%RST%
call :fetch "%URL%" "%TMP%"
if errorlevel 1 (
    echo   %RED%[falha]%RST% Nao consegui baixar %~nx1.
    if exist "%TMP%" del /q "%TMP%" >nul 2>&1
    if exist "%TMP%" rmdir /s /q "%TMP%" >nul 2>&1
    set "FAIL=1"
    exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Copy-Item -LiteralPath '%TMP%' -Destination '%DEST%' -Force" >nul 2>&1
if errorlevel 1 (
    echo   %RED%[falha]%RST% Nao consegui copiar %~nx1 para motores.
    if exist "%TMP%" del /q "%TMP%" >nul 2>&1
    if exist "%TMP%" rmdir /s /q "%TMP%" >nul 2>&1
    set "FAIL=1"
    exit /b 1
)
if exist "%TMP%" del /q "%TMP%" >nul 2>&1
if exist "%TMP%" rmdir /s /q "%TMP%" >nul 2>&1
echo   %GREEN%[ok]%RST% %~nx1 atualizado.
exit /b 0

:getzip
set "ZIP=%~1"
set "URL=%~2"
set "TMPDIR=%~3"
set "WANTED=%~4"
if exist "%ZIP%" del /q "%ZIP%" >nul 2>&1
if exist "%TMPDIR%" rmdir /s /q "%TMPDIR%" >nul 2>&1
mkdir "%TMPDIR%" >nul 2>&1

echo   %DIM%baixando pacote:%RST% %WHITE%%~nx1%RST%
call :fetch "%URL%" "%ZIP%"
if errorlevel 1 (
    echo   %RED%[falha]%RST% Download do pacote falhou.
    set "FAIL=1"
    exit /b 1
)

echo   %DIM%extraindo pacote...%RST%
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%TMPDIR%' -Force" >nul 2>&1
if errorlevel 1 (
    echo   %RED%[falha]%RST% Nao consegui extrair o ZIP.
    set "FAIL=1"
    goto :zip_cleanup
)

for %%X in (%WANTED%) do (
    set "FOUND="
    for /r "%TMPDIR%" %%F in (%%X) do if exist "%%~fF" if not defined FOUND set "FOUND=%%~fF"
    if defined FOUND (
        powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Copy-Item -LiteralPath '!FOUND!' -Destination '%ENGINES%\%%X' -Force" >nul 2>&1
        if errorlevel 1 (
            echo   %RED%[falha]%RST% Nao consegui copiar %%X para motores.
            set "FAIL=1"
        ) else (
            echo   %GREEN%[ok]%RST% %%X instalado.
        )
    ) else (
        echo   %RED%[falha]%RST% %%X nao apareceu no pacote.
        set "FAIL=1"
    )
)

:zip_cleanup
if exist "%TMPDIR%" rmdir /s /q "%TMPDIR%" >nul 2>&1
if exist "%ZIP%" del /q "%ZIP%" >nul 2>&1
exit /b 0

:fetch
set "URL=%~1"
set "OUT=%~2"
where /q curl.exe
if not errorlevel 1 (
    curl.exe -L --fail --retry 5 --retry-all-errors --connect-timeout 15 --speed-limit 1024 --speed-time 30 --progress-bar -o "%OUT%" "%URL%"
    exit /b !errorlevel!
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='Continue'; Invoke-WebRequest -Uri '%URL%' -OutFile '%OUT%' -UseBasicParsing"
exit /b !errorlevel!

:version
set "EXE=%~1"
set "NAME=%~2"
set "ARG=%~3"
if not exist "%EXE%" (
    echo   %RED%[off]%RST% %NAME% nao encontrado.
    set "FAIL=1"
    exit /b
)
set "VER="
for /f "delims=" %%V in ('"%EXE%" %ARG% 2^>nul') do (
    if not defined VER set "VER=%%V"
)
if defined VER (
    echo   %GREEN%[ok]%RST% %NAME%   %DIM%!VER!%RST%
) else (
    echo   %GREEN%[ok]%RST% %NAME% instalado.
)
exit /b

:section
echo.
echo   %BAR%
echo   %GREEN%[%~1]%RST% %WHITE%%BOLD%%~2%RST%
echo   %BAR%
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
call "%~dp0..\core\brand-logo.bat"
echo.
echo   %WHITE%%BOLD%OmniFetch %~1%RST%   %DIM%- %~2%RST%
echo   %BAR%
echo.
exit /b
