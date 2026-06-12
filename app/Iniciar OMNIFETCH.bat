@echo off
title OMNIFETCH
cd /d "%~dp0"

echo.
echo   ====================================
echo    OMNIFETCH - Downloader Universal
echo   ====================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo   [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo   Primeira execucao: instalando dependencias...
    call npm install --no-audit --no-fund
)

if not exist web\dist\index.html (
    echo   Compilando a aplicacao...
    call npm run build
)
if not exist server\dist\index.js (
    echo   Compilando o servidor...
    call npm run build
)

echo   Iniciando... o navegador vai abrir sozinho.
echo   Para PARAR o OMNIFETCH, feche esta janela.
echo.
call npm start
pause
