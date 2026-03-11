@echo off
chcp 65001 >nul
title OmniFetch Instalador
color 0B

:: --- AUTO-ELEVACAO BLINDADA ---
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B
)
:: Forca o diretorio correto apos a elevacao
cd /d "%~dp0"
:: ------------------------------

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
echo  ✨ BEM-VINDO AO INSTALADOR OMNIFETCH! ✨
echo  =======================================
echo  Este script ira configurar tudo para voce.
echo.

echo  Verificando Python...
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo  Instalando Python...
    winget install Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements || goto fim_erro
) else (
    echo  Python OK.
)

echo.
echo  Instalando yt-dlp e dependencias de metadados...
pip install yt-dlp mutagen --quiet --upgrade || goto fim_erro
echo  yt-dlp e Mutagen OK.

echo.
echo  Instalando FFmpeg...
winget install Gyan.FFmpeg --silent --accept-package-agreements --accept-source-agreements || goto fim_erro
echo  FFmpeg OK.

echo.
echo  Instalando Calibre...
winget install calibre.calibre --silent --accept-package-agreements --accept-source-agreements || goto fim_erro
echo  Calibre OK.

goto fim_sucesso

:fim_sucesso
echo.
echo  =======================================
echo  🎉 OMNIFETCH CONFIGURADO COM SUCESSO! 🎉
echo  =======================================
echo  Agora voce pode usar os atalhos:
echo  ➡️ "2_DOWLOADER.bat" para downloads.
echo  ➡️ "3_CONVERSOR.bat" para conversoes.
echo.
echo  Pressione qualquer tecla para sair.
pause >nul
exit

:fim_erro
echo.
echo  =======================================
echo  ❌ INSTALACAO DO OMNIFETCH COM ERROS! ❌
echo  =======================================
echo  Alguns componentes podem nao ter sido instalados corretamente.
echo  Por favor, revise as mensagens acima.
echo.
echo  Pressione qualquer tecla para sair.
pause >nul
exit