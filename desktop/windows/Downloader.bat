@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 <nul >nul
cd /d "%~dp0"
title OmniFetch - Downloader

call :colors
call :init_app
call "%~dp0..\core\omni-ui.bat" splash "DOWNLOADER" "qualidade maxima com aceleracao real"

set "ENGINES=%~dp0..\motores"
set "YTDLP=%ENGINES%\yt-dlp.exe"
set "FFMPEG=%ENGINES%\ffmpeg.exe"
set "ARIA2=%ENGINES%\aria2c.exe"
set "HAS_FFMPEG=0"
set "HAS_ARIA=0"
if exist "%FFMPEG%" set "HAS_FFMPEG=1"
if exist "%ARIA2%" set "HAS_ARIA=1"

if not exist "%YTDLP%" (
    call :banner "DOWNLOADER" "motor ausente"
    echo   %RED%[erro]%RST% yt-dlp.exe nao foi encontrado em %WHITE%motores%RST%.
    echo   Rode %WHITE%Instalar.bat%RST% antes de baixar videos.
    echo.
    pause
    endlocal
    exit /b 1
)

:main
call :load_config
call :apply_speed_profile
call :get_clipboard_url
cls
call :banner "DOWNLOADER" "modo simples + ferramentas avancadas"
echo   %WHITE%%BOLD%Baixar agora%RST%
if defined CLIP_URL (
    echo   %GREEN%[ENTER]%RST% usar link da area de transferencia
    echo   %CYAN%!CLIP_URL!%RST%
) else (
    echo   %DIM%Cole um link e pressione ENTER. ENTER vazio sai.%RST%
)
echo.
echo   %DIM%Destino padrao:%RST% %WHITE%!DEFAULT_DEST!%RST%
echo   %DIM%Navegador cookies:%RST% %WHITE%!DEFAULT_BROWSER!%RST%    %DIM%Abrir ao finalizar:%RST% %WHITE%!OPEN_WHEN_DONE!%RST%
echo   %DIM%Performance:%RST% %WHITE%!SPEED_PROFILE!%RST%  !CONCURRENT_FRAGMENTS! fragments  aria2 !ARIA_CONNECTIONS!x  retries !DOWNLOAD_RETRIES!
echo.
echo   %DIM%ATALHOS%RST%
echo     %GREEN%[F]%RST% fila de links       %GREEN%[H]%RST% historico
echo     %GREEN%[R]%RST% repetir ultimo      %GREEN%[S]%RST% configuracoes
echo     %YELLOW%[Q]%RST% sair
echo.
set "LINK="
set /p "LINK=  %GREEN%>%RST% "

if not defined LINK if defined CLIP_URL set "LINK=!CLIP_URL!"
if /I "!LINK!"=="Q" goto :bye
if /I "!LINK!"=="F" goto :queue
if /I "!LINK!"=="H" goto :history
if /I "!LINK!"=="R" goto :repeat_last
if /I "!LINK!"=="S" goto :settings
if not defined LINK goto :bye

call :prepare_link "!LINK!"
if not "!VALID_LINK!"=="1" (
    echo.
    echo   %RED%[erro]%RST% O link precisa comecar com http:// ou https://.
    timeout /t 2 >nul
    goto :main
)
goto :choice

:prepare_link
set "VALID_LINK=0"
set "LINK=%~1"
set "LINK=!LINK:"=!"
call :trim_link
if /I "!LINK:~0,8!"=="https://" set "VALID_LINK=1"
if /I "!LINK:~0,7!"=="http://" set "VALID_LINK=1"
if not "!VALID_LINK!"=="1" exit /b 1
call :detect_platform "!LINK!"
set "DEST=!DEFAULT_DEST!"
set "COOKIE_ARGS="
set "USE_COOKIES=0"
set "PLAYLIST_ARG=--no-playlist"
set "PLAYLIST_MODE=no"
set "OUTPUT_TEMPLATE=%%(title).200s [%%(id)s].%%(ext)s"
if "!QUEUE_ACTIVE!"=="1" exit /b
echo "!LINK!" | findstr /I "list= playlist" >nul
if not errorlevel 1 (
    echo.
    echo   %YELLOW%Playlist detectada.%RST%
    echo   %WHITE%[1]%RST% so o item do link    %WHITE%[2]%RST% playlist inteira
    set "PL_CHOICE="
    set /p "PL_CHOICE=  %GREEN%>%RST% "
    if "!PL_CHOICE!"=="2" (
        set "PLAYLIST_ARG=--yes-playlist"
        set "PLAYLIST_MODE=yes"
        set "OUTPUT_TEMPLATE=%%(playlist_title).120s\%%(playlist_index)03d - %%(title).180s.%%(ext)s"
    )
)
exit /b

:choice
cls
call :banner "DOWNLOADER" "!PLATFORM!"
echo   %CYAN%Link:%RST%    !LINK!
echo   %CYAN%Destino:%RST% %WHITE%!DEST!%RST%
echo   %CYAN%Turbo:%RST%   !SPEED_PROFILE!  ^(!CONCURRENT_FRAGMENTS! fragments, aria2 !ARIA_CONNECTIONS!x^)
if "!PLAYLIST_MODE!"=="yes" echo   %CYAN%Modo:%RST%    playlist inteira
if "!USE_COOKIES!"=="1" echo   %CYAN%Login:%RST%   cookies do !DEFAULT_BROWSER!
if /I "!DOWNLOAD_SUBS!"=="S" echo   %CYAN%Legendas:%RST% pt/en automaticas quando disponiveis
echo.
echo   %GREEN%%BOLD%[ENTER]%RST%  MP4 Automatico (Max Qualidade)
echo.
echo   %DIM%PRESETS RAPIDOS%RST%
echo     %WHITE%[1]%RST% MP4 Automatico        %WHITE%[5]%RST% 720p MP4
echo     %WHITE%[2]%RST% 4K MP4                %WHITE%[6]%RST% 480p MP4
echo     %WHITE%[3]%RST% 2K MP4                %WHITE%[7]%RST% Menor arquivo
echo     %WHITE%[4]%RST% 1080p MP4             %GREEN%[A]%RST% Audio MP3 320
echo.
echo   %DIM%FERRAMENTAS%RST%
echo     %CYAN%[C]%RST% cookies/login          %CYAN%[D]%RST% trocar destino
echo     %YELLOW%[Q]%RST% cancelar
echo.
set "CHOICE="
set /p "CHOICE=  %GREEN%>%RST% "

if /I "!CHOICE!"=="Q" goto :main
if /I "!CHOICE!"=="C" goto :cookies
if /I "!CHOICE!"=="D" goto :dest
if /I "!CHOICE!"=="A" goto :audio
if "!CHOICE!"=="" goto :best
if "!CHOICE!"=="1" goto :mp4_auto
if "!CHOICE!"=="2" goto :q_2160
if "!CHOICE!"=="3" goto :q_1440
if "!CHOICE!"=="4" goto :q_1080
if "!CHOICE!"=="5" goto :q_720
if "!CHOICE!"=="6" goto :q_480
if "!CHOICE!"=="7" goto :small

echo.
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :choice

:best
set "PRESET=MP4 Automatico"
set "FORMAT=bv*[ext=mp4][vcodec^=avc1]+ba[ext=m4a]/bv*[ext=mp4][vcodec^=avc1]+ba/b[ext=mp4]/bv*+ba/b"
set "EXTRA=--merge-output-format mp4"
goto :run

:mp4_auto
set "PRESET=MP4 Automatico"
set "FORMAT=bv*[ext=mp4][vcodec^=avc1]+ba[ext=m4a]/bv*[ext=mp4][vcodec^=avc1]+ba/b[ext=mp4]/bv*+ba/b"
set "EXTRA=--merge-output-format mp4"
goto :run

:q_2160
set "PRESET=4K MP4"
set "FORMAT=bv*[height<=2160]+ba/b[height<=2160]/b"
set "EXTRA=--merge-output-format mp4"
goto :run

:q_1440
set "PRESET=2K MP4"
set "FORMAT=bv*[height<=1440]+ba/b[height<=1440]/b"
set "EXTRA=--merge-output-format mp4"
goto :run

:q_1080
set "PRESET=1080p MP4"
set "FORMAT=bv*[ext=mp4][vcodec^=avc1][height<=1080]+ba[ext=m4a]/bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4][height<=1080]/b"
set "EXTRA=--merge-output-format mp4"
goto :run

:q_720
set "PRESET=720p MP4"
set "FORMAT=bv*[ext=mp4][vcodec^=avc1][height<=720]+ba[ext=m4a]/bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4][height<=720]/b"
set "EXTRA=--merge-output-format mp4"
goto :run

:q_480
set "PRESET=480p MP4"
set "FORMAT=bv*[ext=mp4][vcodec^=avc1][height<=480]+ba[ext=m4a]/bv*[ext=mp4][height<=480]+ba[ext=m4a]/b[ext=mp4][height<=480]/b"
set "EXTRA=--merge-output-format mp4"
goto :run

:small
set "PRESET=Arquivo leve"
set "FORMAT=worstvideo*+worstaudio/worst"
set "EXTRA="
goto :run

:audio
set "PRESET=Audio MP3 320"
set "FORMAT=bestaudio/best"
set "EXTRA=--extract-audio --audio-format mp3 --audio-quality 320K"
goto :run

:dest
echo.
echo   %WHITE%Nova pasta de destino%RST% %DIM%(ENTER = !DEFAULT_DEST!)%RST%
set "NEW_DEST="
set /p "NEW_DEST=  %GREEN%>%RST% "
if defined NEW_DEST (
    set "NEW_DEST=!NEW_DEST:"=!"
    if not exist "!NEW_DEST!" mkdir "!NEW_DEST!" >nul 2>&1
    if exist "!NEW_DEST!" set "DEST=!NEW_DEST!"
)
goto :choice

:cookies
echo.
echo   %WHITE%Navegador onde voce ja esta logado:%RST%
echo     %GREEN%[1]%RST% Chrome
echo     %GREEN%[2]%RST% Edge
echo     %GREEN%[3]%RST% Firefox
echo     %GREEN%[4]%RST% Brave
echo     %DIM%[0] desativar cookies%RST%
echo.
set "BROWSER_CHOICE="
set /p "BROWSER_CHOICE=  %GREEN%>%RST% "
if "!BROWSER_CHOICE!"=="1" set "DEFAULT_BROWSER=chrome"
if "!BROWSER_CHOICE!"=="2" set "DEFAULT_BROWSER=edge"
if "!BROWSER_CHOICE!"=="3" set "DEFAULT_BROWSER=firefox"
if "!BROWSER_CHOICE!"=="4" set "DEFAULT_BROWSER=brave"
if "!BROWSER_CHOICE!"=="0" (
    set "USE_COOKIES=0"
    set "COOKIE_ARGS="
) else (
    set "USE_COOKIES=1"
    set "COOKIE_ARGS=--cookies-from-browser !DEFAULT_BROWSER!"
    call :save_config
)
goto :choice

:run
set "RETRIED_FORMAT=0"
call :run_download
goto :after_run

:run_download
call :timestamp
set "LOG=..\logs\download-!STAMP!.log"
set "ARIA_ARGS="
if "!HAS_ARIA!"=="1" set ARIA_ARGS=--downloader aria2c --downloader-args aria2c:"-x !ARIA_CONNECTIONS! -s !ARIA_SPLITS! -k !ARIA_CHUNK! --file-allocation=none --summary-interval=0"
set "META_ARGS="
if /I "!EMBED_METADATA!"=="S" set "META_ARGS=!META_ARGS! --embed-metadata"
if /I "!EMBED_THUMBNAIL!"=="S" set "META_ARGS=!META_ARGS! --embed-thumbnail --convert-thumbnails jpg"
set "SUBTITLE_ARGS="
if /I "!DOWNLOAD_SUBS!"=="S" set "SUBTITLE_ARGS=--write-subs --write-auto-subs --sub-langs pt.*,en.* --convert-subs srt"
set "ARCHIVE_ARGS="
set "ARCHIVE_FILE=%~dp0..\data\download_archive.txt"
if /I "!DOWNLOAD_ARCHIVE!"=="S" set "ARCHIVE_ARGS=--download-archive "!ARCHIVE_FILE!""
cls
call :banner "DOWNLOADER" "baixando"
echo   %CYAN%Plataforma:%RST% !PLATFORM!
echo   %CYAN%Preset:%RST%     !PRESET!
echo   %CYAN%Destino:%RST%    %WHITE%!DEST!%RST%
echo   %CYAN%Log:%RST%        !LOG!
echo   %CYAN%Motor:%RST%      !SPEED_PROFILE!  fragments=!CONCURRENT_FRAGMENTS!  retries=!DOWNLOAD_RETRIES!
if "!HAS_ARIA!"=="1" echo   %CYAN%Acelerador:%RST% aria2c -x !ARIA_CONNECTIONS! -s !ARIA_SPLITS! -k !ARIA_CHUNK!
if defined RUN_LABEL echo   %CYAN%Fila:%RST%       !RUN_LABEL!
echo.
if "!USE_COOKIES!"=="1" echo   %YELLOW%Usando cookies do !DEFAULT_BROWSER!. Feche o navegador se ele bloquear acesso aos cookies.%RST%
if "!HAS_FFMPEG!"=="0" echo   %YELLOW%FFmpeg ausente: se audio/video vierem separados, rode o Setup.%RST%
echo   %DIM%Progresso ao vivo abaixo. Se for video grande, aguarde a porcentagem aparecer.%RST%
echo.

> "!LOG!" echo [OmniFetch] Inicio: !DATE! !TIME!
if defined RUN_LABEL >> "!LOG!" echo [OmniFetch] !RUN_LABEL!
>> "!LOG!" echo [OmniFetch] Plataforma: !PLATFORM!
>> "!LOG!" echo [OmniFetch] Preset: !PRESET!
>> "!LOG!" echo [OmniFetch] Destino: !DEST!
>> "!LOG!" echo [OmniFetch] Speed: !SPEED_PROFILE! fragments=!CONCURRENT_FRAGMENTS! retries=!DOWNLOAD_RETRIES! aria2=!ARIA_CONNECTIONS!x
>> "!LOG!" echo [OmniFetch] Link: !LINK!
>> "!LOG!" echo.

"%YTDLP%" ^
  --newline ^
  --no-mtime ^
  --retries !DOWNLOAD_RETRIES! ^
  --fragment-retries !DOWNLOAD_RETRIES! ^
  --retry-sleep exp=1:20 ^
  --concurrent-fragments !CONCURRENT_FRAGMENTS! ^
  !META_ARGS! ^
  !SUBTITLE_ARGS! ^
  !ARCHIVE_ARGS! ^
  --no-overwrites ^
  --windows-filenames ^
  !PLAYLIST_ARG! ^
  !ARIA_ARGS! ^
  !COOKIE_ARGS! ^
  !EXTRA! ^
  -P "!DEST!" ^
  -o "!OUTPUT_TEMPLATE!" ^
  -f "!FORMAT!" ^
  "!LINK!" 2>&1

set "RC=!errorlevel!"
>> "!LOG!" echo ExitCode=!RC!
if not "!RC!"=="0" (
    if "!RETRIED_FORMAT!"=="0" (
        if /I not "!PRESET!"=="MP4 Automatico" (
            echo.
            echo   %YELLOW%[auto]%RST% Tentando novamente com a melhor qualidade disponivel.
            set "RETRIED_FORMAT=1"
            set "PRESET=MP4 Automatico fallback"
            set "FORMAT=bv*+ba/b"
            set "EXTRA=--merge-output-format mp4"
            timeout /t 2 >nul
            goto :run_download
        )
    )
)
exit /b

:after_run
echo.
echo   %BAR%
if "!RC!"=="0" (
    echo   %GREEN%%BOLD%Concluido.%RST% Arquivo salvo em:
    echo   %WHITE%!DEST!%RST%
    call :history_add "ok"
    if /I "!OPEN_WHEN_DONE!"=="S" start "" explorer.exe "!DEST!"
) else (
    echo   %RED%%BOLD%Falhou.%RST% yt-dlp retornou codigo !RC!.
    call :human_error
    call :history_add "falhou"
)
echo   %BAR%
echo.
echo   %DIM%ENTER = novo download    O = abrir pasta    L = abrir log    Q = sair%RST%
set "AGAIN="
set /p "AGAIN=  %GREEN%>%RST% "
if /I "!AGAIN!"=="O" start "" explorer.exe "!DEST!"
if /I "!AGAIN!"=="L" start "" notepad.exe "!LOG!"
if /I "!AGAIN!"=="Q" goto :bye
goto :main

:queue
call :timestamp
set "QUEUE_FILE=%TEMP%\omnifetch-queue-!STAMP!.txt"
if exist "!QUEUE_FILE!" del /q "!QUEUE_FILE!" >nul 2>&1
cls
call :banner "FILA" "cole varios links"
echo   %DIM%Cole um link por linha. ENTER vazio inicia a fila.%RST%
echo.
:queue_read
set "Q_LINK="
set /p "Q_LINK=  %GREEN%+%RST% "
if not defined Q_LINK goto :queue_start
set "Q_LINE=!Q_LINK!"
powershell.exe -NoProfile -Command "[IO.File]::AppendAllText($env:QUEUE_FILE, $env:Q_LINE + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))" >nul 2>&1
goto :queue_read

:queue_start
if not exist "!QUEUE_FILE!" (
    echo.
    echo   %YELLOW%Fila vazia.%RST%
    timeout /t 1 >nul
    goto :main
)
call :queue_options
if errorlevel 1 (
    if exist "!QUEUE_FILE!" del /q "!QUEUE_FILE!" >nul 2>&1
    goto :main
)
set "Q_TOTAL=0"
for /f "usebackq delims=" %%C in (`powershell.exe -NoProfile -Command "$p=$env:QUEUE_FILE; if(Test-Path -LiteralPath $p){(Get-Content -LiteralPath $p | Where-Object { $_.Trim() } | Measure-Object).Count}else{0}"`) do set "Q_TOTAL=%%C"
if not defined Q_TOTAL set "Q_TOTAL=?"
set "Q_INDEX=0"
set "Q_OK=0"
set "Q_FAIL=0"
set "Q_SKIP=0"
set "QUEUE_ACTIVE=1"
for /f "usebackq delims=" %%U in ("!QUEUE_FILE!") do (
    call :prepare_link "%%U"
    if not "!VALID_LINK!"=="1" (
        echo.
        echo   %YELLOW%[skip]%RST% linha ignorada: %%U
        set /a Q_SKIP+=1
    ) else (
        set /a Q_INDEX+=1
        set "RUN_LABEL=Item !Q_INDEX!/!Q_TOTAL!"
        set "DEST=!QUEUE_DEST!"
        set "PRESET=!QUEUE_PRESET!"
        set "FORMAT=!QUEUE_FORMAT!"
        set "EXTRA=!QUEUE_EXTRA!"
        set "COOKIE_ARGS=!QUEUE_COOKIE_ARGS!"
        set "USE_COOKIES=!QUEUE_USE_COOKIES!"
        set "PLAYLIST_ARG=!QUEUE_PLAYLIST_ARG!"
        set "PLAYLIST_MODE=!QUEUE_PLAYLIST_MODE!"
        set "OUTPUT_TEMPLATE=!QUEUE_OUTPUT_TEMPLATE!"
        set "RETRIED_FORMAT=0"
        call :run_download
        if "!RC!"=="0" (
            set /a Q_OK+=1
            call :history_add "ok"
        ) else (
            set /a Q_FAIL+=1
            call :human_error
            call :history_add "falhou"
        )
    )
)
set "QUEUE_ACTIVE="
set "RUN_LABEL="
if exist "!QUEUE_FILE!" del /q "!QUEUE_FILE!" >nul 2>&1
echo.
echo   %GREEN%Fila finalizada.%RST%
echo   %DIM%Resumo:%RST% %GREEN%!Q_OK! concluidos%RST%  %YELLOW%!Q_FAIL! falhas%RST%  %DIM%!Q_SKIP! ignorados%RST%
pause
goto :main

:queue_options
set "QUEUE_DEST=!DEFAULT_DEST!"
set "QUEUE_PRESET=MP4 Automatico"
set "QUEUE_FORMAT=bv*[ext=mp4][vcodec^=avc1]+ba[ext=m4a]/bv*[ext=mp4][vcodec^=avc1]+ba/b[ext=mp4]/bv*+ba/b"
set "QUEUE_EXTRA=--merge-output-format mp4"
set "QUEUE_COOKIE_ARGS="
set "QUEUE_USE_COOKIES=0"
set "QUEUE_PLAYLIST_ARG=--no-playlist"
set "QUEUE_PLAYLIST_MODE=no"
set "QUEUE_OUTPUT_TEMPLATE=%%(title).200s [%%(id)s].%%(ext)s"

:queue_options_menu
cls
call :banner "FILA" "configurar antes de baixar"
echo   %CYAN%Destino:%RST% %WHITE%!QUEUE_DEST!%RST%
echo   %CYAN%Preset:%RST%  %WHITE%!QUEUE_PRESET!%RST%
if "!QUEUE_USE_COOKIES!"=="1" (
    echo   %CYAN%Login:%RST%   cookies do !DEFAULT_BROWSER!
) else (
    echo   %CYAN%Login:%RST%   sem cookies
)
if "!QUEUE_PLAYLIST_MODE!"=="yes" (
    echo   %CYAN%Playlist:%RST% inteira
) else (
    echo   %CYAN%Playlist:%RST% so o item de cada link
)
echo.
echo   %GREEN%%BOLD%[ENTER]%RST% iniciar fila agora
echo.
echo   %DIM%QUALIDADE DA FILA%RST%
echo     %WHITE%[1]%RST% MP4 Automatico        %WHITE%[4]%RST% 1080p MP4
echo     %WHITE%[2]%RST% 4K MP4                %WHITE%[5]%RST% 720p MP4
echo     %WHITE%[3]%RST% Arquivo leve          %GREEN%[A]%RST% Audio MP3 320
echo.
echo   %DIM%OPCOES%RST%
echo     %CYAN%[D]%RST% trocar destino         %CYAN%[C]%RST% cookies/login
echo     %CYAN%[P]%RST% alternar playlist      %YELLOW%[Q]%RST% cancelar
echo.
set "QOPT="
set /p "QOPT=  %GREEN%>%RST% "
if "!QOPT!"=="" exit /b 0
if /I "!QOPT!"=="Q" exit /b 1
if /I "!QOPT!"=="D" goto :queue_dest
if /I "!QOPT!"=="C" goto :queue_cookies
if /I "!QOPT!"=="P" goto :queue_playlist
if /I "!QOPT!"=="A" (
    set "QUEUE_PRESET=Audio MP3 320"
    set "QUEUE_FORMAT=bestaudio/best"
    set "QUEUE_EXTRA=--extract-audio --audio-format mp3 --audio-quality 320K"
    goto :queue_options_menu
)
if "!QOPT!"=="1" (
    set "QUEUE_PRESET=MP4 Automatico"
    set "QUEUE_FORMAT=bv*[ext=mp4][vcodec^=avc1]+ba[ext=m4a]/bv*[ext=mp4][vcodec^=avc1]+ba/b[ext=mp4]/bv*+ba/b"
    set "QUEUE_EXTRA=--merge-output-format mp4"
    goto :queue_options_menu
)
if "!QOPT!"=="2" (
    set "QUEUE_PRESET=4K MP4"
    set "QUEUE_FORMAT=bv*[height<=2160]+ba/b[height<=2160]/b"
    set "QUEUE_EXTRA=--merge-output-format mp4"
    goto :queue_options_menu
)
if "!QOPT!"=="3" (
    set "QUEUE_PRESET=Arquivo leve"
    set "QUEUE_FORMAT=worstvideo*+worstaudio/worst"
    set "QUEUE_EXTRA="
    goto :queue_options_menu
)
if "!QOPT!"=="4" (
    set "QUEUE_PRESET=1080p MP4"
    set "QUEUE_FORMAT=bv*[ext=mp4][vcodec^=avc1][height<=1080]+ba[ext=m4a]/bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4][height<=1080]/b"
    set "QUEUE_EXTRA=--merge-output-format mp4"
    goto :queue_options_menu
)
if "!QOPT!"=="5" (
    set "QUEUE_PRESET=720p MP4"
    set "QUEUE_FORMAT=bv*[ext=mp4][vcodec^=avc1][height<=720]+ba[ext=m4a]/bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4][height<=720]/b"
    set "QUEUE_EXTRA=--merge-output-format mp4"
    goto :queue_options_menu
)
echo.
echo   %RED%[erro]%RST% Opcao invalida.
timeout /t 1 >nul
goto :queue_options_menu

:queue_dest
echo.
echo   %WHITE%Pasta de destino da fila%RST% %DIM%(ENTER = manter atual)%RST%
set "QDEST="
set /p "QDEST=  %GREEN%>%RST% "
if defined QDEST (
    set "QDEST=!QDEST:"=!"
    if not exist "!QDEST!" mkdir "!QDEST!" >nul 2>&1
    if exist "!QDEST!" set "QUEUE_DEST=!QDEST!"
)
goto :queue_options_menu

:queue_cookies
echo.
echo   %WHITE%Navegador onde voce ja esta logado:%RST%
echo     %GREEN%[1]%RST% Chrome
echo     %GREEN%[2]%RST% Edge
echo     %GREEN%[3]%RST% Firefox
echo     %GREEN%[4]%RST% Brave
echo     %DIM%[0] desativar cookies%RST%
echo.
set "QBROWSER="
set /p "QBROWSER=  %GREEN%>%RST% "
if "!QBROWSER!"=="1" set "DEFAULT_BROWSER=chrome"
if "!QBROWSER!"=="2" set "DEFAULT_BROWSER=edge"
if "!QBROWSER!"=="3" set "DEFAULT_BROWSER=firefox"
if "!QBROWSER!"=="4" set "DEFAULT_BROWSER=brave"
if "!QBROWSER!"=="0" (
    set "QUEUE_USE_COOKIES=0"
    set "QUEUE_COOKIE_ARGS="
) else (
    set "QUEUE_USE_COOKIES=1"
    set "QUEUE_COOKIE_ARGS=--cookies-from-browser !DEFAULT_BROWSER!"
    call :save_config
)
goto :queue_options_menu

:queue_playlist
if "!QUEUE_PLAYLIST_MODE!"=="yes" (
    set "QUEUE_PLAYLIST_ARG=--no-playlist"
    set "QUEUE_PLAYLIST_MODE=no"
    set "QUEUE_OUTPUT_TEMPLATE=%%(title).200s [%%(id)s].%%(ext)s"
) else (
    set "QUEUE_PLAYLIST_ARG=--yes-playlist"
    set "QUEUE_PLAYLIST_MODE=yes"
    set "QUEUE_OUTPUT_TEMPLATE=%%(playlist_title).120s\%%(playlist_index)03d - %%(title).180s.%%(ext)s"
)
goto :queue_options_menu

:history
cls
call :banner "HISTORICO" "ultimos downloads"
if not exist "%DOWNLOAD_HISTORY%" (
    echo   %DIM%Nenhum download registrado ainda.%RST%
) else (
    powershell.exe -NoProfile -Command "$p=$env:DOWNLOAD_HISTORY; Get-Content -LiteralPath $p -Tail 12 | ForEach-Object { $x=$_ -split '\|',6; if($x.Count -ge 5){ '{0}  [{1}]  {2}  ->  {3}' -f $x[0],$x[1],$x[4],$x[2] } }"
)
echo.
echo   %DIM%R = repetir ultimo    ENTER = voltar%RST%
set "HOPT="
set /p "HOPT=  %GREEN%>%RST% "
if /I "!HOPT!"=="R" goto :repeat_last
goto :main

:repeat_last
set "LAST_URL="
if exist "%DOWNLOAD_HISTORY%" (
    for /f "usebackq delims=" %%U in (`powershell.exe -NoProfile -Command "$p=$env:DOWNLOAD_HISTORY; if(Test-Path $p){ $l=Get-Content -LiteralPath $p | Where-Object {$_} | Select-Object -Last 1; if($l){ ($l -split '\|',6)[2] } }"`) do set "LAST_URL=%%U"
)
if not defined LAST_URL (
    echo.
    echo   %YELLOW%Nao encontrei ultimo link no historico.%RST%
    timeout /t 2 >nul
    goto :main
)
call :prepare_link "!LAST_URL!"
if not "!VALID_LINK!"=="1" (
    echo.
    echo   %YELLOW%O ultimo link salvo parece invalido.%RST%
    timeout /t 2 >nul
    goto :main
)
goto :choice

:settings
cls
call :banner "CONFIG" "download premium sob controle"
echo   %WHITE%%BOLD%Preferencias salvas%RST%
echo.
echo   %WHITE%[1]%RST% Pasta padrao:          !DEFAULT_DEST!
echo   %WHITE%[2]%RST% Navegador cookies:     !DEFAULT_BROWSER!
echo   %WHITE%[3]%RST% Abrir ao finalizar:    !OPEN_WHEN_DONE!
echo   %WHITE%[4]%RST% Perfil velocidade:     !SPEED_PROFILE! ^(!CONCURRENT_FRAGMENTS! fragments, aria2 !ARIA_CONNECTIONS!x^)
echo   %WHITE%[5]%RST% Metadata/thumbnail:    !EMBED_METADATA! / !EMBED_THUMBNAIL!
echo   %WHITE%[6]%RST% Legendas pt/en:        !DOWNLOAD_SUBS!
echo   %WHITE%[7]%RST% Anti-duplicado archive: !DOWNLOAD_ARCHIVE!
echo   %WHITE%[8]%RST% Intro premium:         !INTRO_ANIMATION!
echo   %WHITE%[9]%RST% Abrir pasta data/logs
echo   %YELLOW%[B]%RST% Voltar
echo.
set "SOPT="
set /p "SOPT=  %GREEN%>%RST% "
if "!SOPT!"=="1" (
    echo.
    set "NEW_DEST="
    set /p "NEW_DEST=Nova pasta: "
    if defined NEW_DEST (
        set "NEW_DEST=!NEW_DEST:"=!"
        if not exist "!NEW_DEST!" mkdir "!NEW_DEST!" >nul 2>&1
        if exist "!NEW_DEST!" set "DEFAULT_DEST=!NEW_DEST!"
    )
    call :save_config
)
if "!SOPT!"=="2" (
    echo.
    echo   %WHITE%[1]%RST% Chrome   %WHITE%[2]%RST% Edge   %WHITE%[3]%RST% Firefox   %WHITE%[4]%RST% Brave
    set "B="
    set /p "B=  Navegador: "
    if "!B!"=="1" set "DEFAULT_BROWSER=chrome"
    if "!B!"=="2" set "DEFAULT_BROWSER=edge"
    if "!B!"=="3" set "DEFAULT_BROWSER=firefox"
    if "!B!"=="4" set "DEFAULT_BROWSER=brave"
    call :save_config
)
if "!SOPT!"=="3" (
    if /I "!OPEN_WHEN_DONE!"=="S" (set "OPEN_WHEN_DONE=N") else set "OPEN_WHEN_DONE=S"
    call :save_config
)
if "!SOPT!"=="4" goto :settings_speed
if "!SOPT!"=="5" goto :settings_media
if "!SOPT!"=="6" (
    if /I "!DOWNLOAD_SUBS!"=="S" (set "DOWNLOAD_SUBS=N") else set "DOWNLOAD_SUBS=S"
    call :save_config
)
if "!SOPT!"=="7" (
    if /I "!DOWNLOAD_ARCHIVE!"=="S" (set "DOWNLOAD_ARCHIVE=N") else set "DOWNLOAD_ARCHIVE=S"
    call :save_config
)
if "!SOPT!"=="8" goto :settings_intro
if "!SOPT!"=="9" start "" explorer.exe "%~dp0..\data"
if /I "!SOPT!"=="B" goto :main
goto :settings

:settings_speed
cls
call :banner "VELOCIDADE" "turbo quando da, leve quando precisa"
echo   %WHITE%[1]%RST% Turbo Max      16 fragments, aria2 16x, retries 20
echo   %WHITE%[2]%RST% Equilibrado    8 fragments, aria2 8x, retries 12
echo   %WHITE%[3]%RST% Conservador    4 fragments, aria2 4x, retries 8
echo   %WHITE%[4]%RST% Custom         escolher fragments/conexoes/retries
echo   %YELLOW%[B]%RST% Voltar
echo.
set "SPD="
set /p "SPD=  %GREEN%>%RST% "
if "!SPD!"=="1" (
    set "SPEED_PROFILE=turbo"
    set "CONCURRENT_FRAGMENTS=16"
    set "DOWNLOAD_RETRIES=20"
    set "ARIA_CONNECTIONS=16"
    set "ARIA_SPLITS=16"
    set "ARIA_CHUNK=1M"
    call :save_config
)
if "!SPD!"=="2" (
    set "SPEED_PROFILE=balanced"
    set "CONCURRENT_FRAGMENTS=8"
    set "DOWNLOAD_RETRIES=12"
    set "ARIA_CONNECTIONS=8"
    set "ARIA_SPLITS=8"
    set "ARIA_CHUNK=1M"
    call :save_config
)
if "!SPD!"=="3" (
    set "SPEED_PROFILE=conservative"
    set "CONCURRENT_FRAGMENTS=4"
    set "DOWNLOAD_RETRIES=8"
    set "ARIA_CONNECTIONS=4"
    set "ARIA_SPLITS=4"
    set "ARIA_CHUNK=1M"
    call :save_config
)
if "!SPD!"=="4" goto :settings_speed_custom
if /I "!SPD!"=="B" goto :settings
goto :settings

:settings_speed_custom
set "SPEED_PROFILE=custom"
echo.
echo   %DIM%ENTER vazio mantem o valor atual.%RST%
set "TMP="
set /p "TMP=  Fragmentos [!CONCURRENT_FRAGMENTS!]: "
if defined TMP set "CONCURRENT_FRAGMENTS=!TMP!"
set "TMP="
set /p "TMP=  Retries [!DOWNLOAD_RETRIES!]: "
if defined TMP set "DOWNLOAD_RETRIES=!TMP!"
set "TMP="
set /p "TMP=  Aria2 conexoes [!ARIA_CONNECTIONS!]: "
if defined TMP set "ARIA_CONNECTIONS=!TMP!"
set "TMP="
set /p "TMP=  Aria2 splits [!ARIA_SPLITS!]: "
if defined TMP set "ARIA_SPLITS=!TMP!"
set "TMP="
set /p "TMP=  Chunk aria2 [!ARIA_CHUNK!]: "
if defined TMP set "ARIA_CHUNK=!TMP!"
call :save_config
goto :settings

:settings_media
cls
call :banner "QUALIDADE" "metadados, capas e saidas limpas"
echo   %WHITE%[1]%RST% Embutir metadata:  !EMBED_METADATA!
echo   %WHITE%[2]%RST% Embutir thumbnail: !EMBED_THUMBNAIL!
echo   %YELLOW%[B]%RST% Voltar
echo.
set "MOPT="
set /p "MOPT=  %GREEN%>%RST% "
if "!MOPT!"=="1" (
    if /I "!EMBED_METADATA!"=="S" (set "EMBED_METADATA=N") else set "EMBED_METADATA=S"
    call :save_config
)
if "!MOPT!"=="2" (
    if /I "!EMBED_THUMBNAIL!"=="S" (set "EMBED_THUMBNAIL=N") else set "EMBED_THUMBNAIL=S"
    call :save_config
)
if /I "!MOPT!"=="B" goto :settings
goto :settings_media

:settings_intro
echo.
echo   %WHITE%[1]%RST% Full premium   %WHITE%[2]%RST% Rapida   %WHITE%[3]%RST% Off
set "I="
set /p "I=  Intro: "
if "!I!"=="1" set "INTRO_ANIMATION=full"
if "!I!"=="2" set "INTRO_ANIMATION=fast"
if "!I!"=="3" set "INTRO_ANIMATION=off"
call :save_config
goto :settings

:human_error
echo.
findstr /I /C:"HTTP Error 403" /C:"Forbidden" /C:"Sign in" /C:"login" /C:"cookies" "%~dp0..\!LOG!" >nul
if not errorlevel 1 (
    echo   %YELLOW%Diagnostico:%RST% esse site provavelmente exige login ou cookies.
    echo   %DIM%Use a opcao C e escolha o navegador onde voce ja esta logado.%RST%
    exit /b
)
findstr /I /C:"HTTP Error 404" /C:"Unsupported URL" "%~dp0..\!LOG!" >nul
if not errorlevel 1 (
    echo   %YELLOW%Diagnostico:%RST% o link nao foi aceito ou nao existe mais.
    echo   %DIM%Confira se o link abre no navegador e copie a URL completa.%RST%
    exit /b
)
findstr /I /C:"ffmpeg" /C:"Postprocessing" "%~dp0..\!LOG!" >nul
if not errorlevel 1 (
    echo   %YELLOW%Diagnostico:%RST% houve problema na etapa de conversao/merge.
    echo   %DIM%Rode o Setup para reparar FFmpeg e tente de novo.%RST%
    exit /b
)
echo   %YELLOW%Diagnostico:%RST% o yt-dlp recusou ou nao conseguiu baixar esse link.
echo   %DIM%Veja a mensagem tecnica logo acima. Se o site exigir login, use cookies/login.%RST%
exit /b

:detect_platform
set "PLATFORM=link generico"
echo "%~1" | findstr /I "youtube.com youtu.be" >nul && set "PLATFORM=YouTube"
echo "%~1" | findstr /I "vimeo.com" >nul && set "PLATFORM=Vimeo"
echo "%~1" | findstr /I "instagram.com" >nul && set "PLATFORM=Instagram"
echo "%~1" | findstr /I "tiktok.com" >nul && set "PLATFORM=TikTok"
echo "%~1" | findstr /I "twitter.com x.com" >nul && set "PLATFORM=Twitter/X"
echo "%~1" | findstr /I "facebook.com fb.watch" >nul && set "PLATFORM=Facebook"
echo "%~1" | findstr /I "twitch.tv" >nul && set "PLATFORM=Twitch"
echo "%~1" | findstr /I "soundcloud.com" >nul && set "PLATFORM=SoundCloud"
echo "%~1" | findstr /I "reddit.com" >nul && set "PLATFORM=Reddit"
exit /b

:trim_link
where /q powershell.exe
if not errorlevel 1 (
    set "RAW_LINK=!LINK!"
    for /f "usebackq delims=" %%T in (`powershell.exe -NoProfile -Command "$s=$env:RAW_LINK; if($null -ne $s){ $s=$s.Trim([char]0xFEFF,[char]0x200B,[char]0xA0,' ',[char]9,[char]13,[char]10); [Console]::WriteLine($s) }" 2^>nul`) do set "LINK=%%T"
    exit /b
)
:trim_left
if "!LINK:~0,1!"==" " set "LINK=!LINK:~1!" & goto :trim_left
:trim_right
if "!LINK:~-1!"==" " set "LINK=!LINK:~0,-1!" & goto :trim_right
exit /b

:history_add
set "H_STATUS=%~1"
set "H_URL=!LINK!"
set "H_DEST=!DEST!"
set "H_PRESET=!PRESET!"
set "H_LOG=!LOG!"
call :timestamp
set "H_STAMP=!STAMP!"
powershell.exe -NoProfile -Command "$line=$env:H_STAMP+'|'+$env:H_STATUS+'|'+$env:H_URL+'|'+$env:H_DEST+'|'+$env:H_PRESET+'|'+$env:H_LOG; Add-Content -LiteralPath $env:DOWNLOAD_HISTORY -Value $line -Encoding UTF8" >nul 2>&1
exit /b

:load_config
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
if not exist "!DEFAULT_DEST!" mkdir "!DEFAULT_DEST!" >nul 2>&1
exit /b

:apply_speed_profile
if /I "!SPEED_PROFILE!"=="turbo" (
    set "CONCURRENT_FRAGMENTS=16"
    set "DOWNLOAD_RETRIES=20"
    set "ARIA_CONNECTIONS=16"
    set "ARIA_SPLITS=16"
    set "ARIA_CHUNK=1M"
)
if /I "!SPEED_PROFILE!"=="balanced" (
    set "CONCURRENT_FRAGMENTS=8"
    set "DOWNLOAD_RETRIES=12"
    set "ARIA_CONNECTIONS=8"
    set "ARIA_SPLITS=8"
    set "ARIA_CHUNK=1M"
)
if /I "!SPEED_PROFILE!"=="conservative" (
    set "CONCURRENT_FRAGMENTS=4"
    set "DOWNLOAD_RETRIES=8"
    set "ARIA_CONNECTIONS=4"
    set "ARIA_SPLITS=4"
    set "ARIA_CHUNK=1M"
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
set "CONFIG=%~dp0data\config.ini"
set "DOWNLOAD_HISTORY=%~dp0data\download_history.tsv"
if exist "%~dp0core\ensure-config.bat" call "%~dp0core\ensure-config.bat" "%~dp0"
if not exist "%CONFIG%" (
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
    call :save_config
)
exit /b

:get_clipboard_url
set "CLIP_URL="
where /q powershell.exe
if errorlevel 1 exit /b
for /f "usebackq delims=" %%L in (`powershell.exe -NoProfile -Command "$c=(Get-Clipboard -Raw -ErrorAction SilentlyContinue).Trim(); if($c -match '^https?://'){ ($c -split \"`r?`n\")[0] }" 2^>nul`) do if not defined CLIP_URL set "CLIP_URL=%%L"
exit /b

:timestamp
set "STAMP=%DATE%_%TIME%"
set "STAMP=!STAMP:/=-!"
set "STAMP=!STAMP::=-!"
set "STAMP=!STAMP:,=-!"
set "STAMP=!STAMP: =0!"
where /q powershell.exe
if not errorlevel 1 for /f "usebackq delims=" %%T in (`powershell.exe -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss" 2^>nul`) do set "STAMP=%%T"
exit /b

:bye
echo.
echo   %GREEN%ate logo.%RST%
endlocal
exit /b 0

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
