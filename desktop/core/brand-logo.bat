@echo off
rem OmniFetch official terminal wordmark. Called after :colors in the main BAT files.
where /q powershell.exe
if not errorlevel 1 if exist "%~dp0brand-logo.ps1" (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0brand-logo.ps1"
    if not errorlevel 1 exit /b 0
)
echo   %GREEN%%BOLD%OMNIFETCH%RST% %DIM%^|%RST% %WHITE%downloader%RST% %DIM%+%RST% %WHITE%converter%RST% %DIM%+%RST% %WHITE%local media tools%RST%
exit /b 0
