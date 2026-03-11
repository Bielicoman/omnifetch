@echo off
chcp 65001 >nul
title OmniFetch Instalador Portatil
color 0B

:: --- ELEVACAO AUTOMATICA PARA ADMINISTRADOR ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo  Solicitando privilegios de Administrador...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
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
curl -L -o "%~dp0motores\yt-dlp.exe" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"

echo.
echo  [2/3] Baixando motor de Conversao (FFmpeg)...
curl -L -o "%~dp0motores\ffmpeg.zip" "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
echo  Extraindo arquivos...
powershell -Command "Expand-Archive -Path '%~dp0motores\ffmpeg.zip' -DestinationPath '%~dp0motores\ffmpeg_temp' -Force"
move /y "%~dp0motores\ffmpeg_temp\*\bin\ffmpeg.exe" "%~dp0motores\" >nul
move /y "%~dp0motores\ffmpeg_temp\*\bin\ffprobe.exe" "%~dp0motores\" >nul
rmdir /s /q "%~dp0motores\ffmpeg_temp"
del /q "%~dp0motores\ffmpeg.zip"

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
exit