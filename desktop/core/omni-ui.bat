@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 <nul >nul

set "CMD=%~1"
if not defined CMD set "CMD=splash"

rem Keep the terminal readable for the premium UI. If output is redirected,
rem Windows simply ignores this.
mode con: cols=104 lines=34 >nul 2>&1

if /I "%CMD%"=="splash" goto :splash
if /I "%CMD%"=="logo" goto :logo
if /I "%CMD%"=="divider" goto :divider
goto :done

:splash
where /q powershell.exe
if errorlevel 1 goto :fallback_splash
if exist "%~dp0omni-ui.ps1" (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0omni-ui.ps1" -Mode splash -App "%~2" -Subtitle "%~3"
    goto :done
)
goto :fallback_splash

:logo
call "%~dp0brand-logo.bat"
goto :done

:divider
echo   ----------------------------------------------------------------
goto :done

:fallback_splash
cls
call "%~dp0brand-logo.bat"
echo.
echo   OMNIFETCH %~2
echo   %~3
echo.

:done
endlocal
exit /b 0
