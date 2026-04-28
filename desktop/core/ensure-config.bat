@echo off
setlocal EnableExtensions
set "ROOT=%~1"
if not defined ROOT set "ROOT=%~dp0.."

if not exist "%ROOT%\data" mkdir "%ROOT%\data" >nul 2>&1
if not exist "%ROOT%\logs" mkdir "%ROOT%\logs" >nul 2>&1

where /q powershell.exe
if errorlevel 1 goto :done
if exist "%~dp0ensure-config.ps1" (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0ensure-config.ps1" -Root "%ROOT%" >nul 2>&1
)

:done
endlocal
exit /b 0
