param(
    [ValidateSet('splash')]
    [string]$Mode = 'splash',
    [string]$App = 'OMNIFETCH',
    [string]$Subtitle = 'desktop suite'
)

try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch {}

$esc = [char]27
$r = "$esc[0m"
$b = "$esc[1m"
$green = "$esc[38;2;0;255;136m"
$softGreen = "$esc[38;2;44;255;166m"
$cyan = "$esc[38;2;0;180;255m"
$yellow = "$esc[38;2;255;205;80m"
$red = "$esc[38;2;255;85;85m"
$amber = "$esc[38;2;255;190;60m"
$dim = "$esc[38;2;104;128;136m"
$line = "$esc[38;2;22;82;62m"
$white = "$esc[97m"

$root = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $root 'data\config.ini'
$config = @{}
if (Test-Path -LiteralPath $configPath) {
    Get-Content -LiteralPath $configPath -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
            $config[$matches[1].Trim().ToUpperInvariant()] = $matches[2].Trim()
        }
    }
}

$intro = 'full'
if ($config.ContainsKey('INTRO_ANIMATION')) { $intro = $config['INTRO_ANIMATION'].ToLowerInvariant() }
if ($intro -eq 'off') { return }

$delay = if ($intro -eq 'fast') { 8 } else { 42 }
$logoDelay = if ($intro -eq 'fast') { 0 } else { 32 }
$width = 92

function Wait-Frame([int]$ms = $delay) {
    if ($ms -gt 0) { Start-Sleep -Milliseconds $ms }
}

function Write-RawLine([string]$text = '') {
    Write-Host $text
}

function Write-AnimatedLine([string]$text = '', [string]$color = $white, [int]$ms = $delay) {
    Write-Host "$color$text$r"
    Wait-Frame $ms
}

function Write-Logo {
    $logo = Join-Path $PSScriptRoot 'brand-logo.ps1'
    if (Test-Path -LiteralPath $logo) {
        & $logo -WordmarkOnly
    } else {
        Write-Host "$green$b  ######  ##     ## ##    ## #### ######## ######## ########  ######  ##     ##$r"
        Write-Host "  $green$b>_ OMNIFETCH$r  $dim terminal cli$r"
    }
}

function Content-For([string]$name) {
    switch ($name.ToUpperInvariant()) {
        'SETUP' {
            return @(
                @{ Text = 'OmniFetch SETUP - instalador local dos motores'; Color = $dim },
                @{ Text = ''; Color = $white },
                @{ Text = 'O que sera instalado:'; Color = $white },
                @{ Text = 'yt-dlp   downloader universal'; Color = $softGreen },
                @{ Text = 'FFmpeg   conversao, merge de audio/video e thumbnails'; Color = $softGreen },
                @{ Text = 'ffprobe  leitura tecnica de midias'; Color = $softGreen },
                @{ Text = 'aria2    acelerador opcional de downloads'; Color = $softGreen },
                @{ Text = ''; Color = $white },
                @{ Text = 'Tudo fica dentro de:'; Color = $dim },
                @{ Text = $root + '\motores'; Color = $white },
                @{ Text = ''; Color = $white },
                @{ Text = '[1/5] yt-dlp'; Color = $cyan },
                @{ Text = 'baixando: yt-dlp.exe'; Color = $dim },
                @{ Text = '[2/5] FFmpeg + ffprobe'; Color = $cyan },
                @{ Text = 'baixando pacote: omnifetch-ffmpeg.zip'; Color = $dim },
                @{ Text = '[3/5] aria2'; Color = $cyan }
            )
        }
        'DOWNLOADER' {
            return @(
                @{ Text = 'OmniFetch DOWNLOADER - modo simples + ferramentas avancadas'; Color = $dim },
                @{ Text = ''; Color = $white },
                @{ Text = 'Baixar agora'; Color = $white },
                @{ Text = 'Cole um link e pressione ENTER. ENTER vazio sai.'; Color = $dim },
                @{ Text = ''; Color = $white },
                @{ Text = 'Destino padrao: ' + ($(if ($config.ContainsKey('DEFAULT_DEST')) { $config['DEFAULT_DEST'] } else { Join-Path $env:USERPROFILE 'Downloads' })); Color = $white },
                @{ Text = 'Navegador cookies: ' + ($(if ($config.ContainsKey('DEFAULT_BROWSER')) { $config['DEFAULT_BROWSER'] } else { 'edge' })); Color = $white },
                @{ Text = 'Performance: ' + ($(if ($config.ContainsKey('SPEED_PROFILE')) { $config['SPEED_PROFILE'] } else { 'turbo' })); Color = $softGreen },
                @{ Text = ''; Color = $white },
                @{ Text = 'ATALHOS'; Color = $dim },
                @{ Text = '[F] fila de links       [H] historico'; Color = $green },
                @{ Text = '[R] repetir ultimo      [S] configuracoes'; Color = $green },
                @{ Text = '[Q] sair'; Color = $yellow }
            )
        }
        'CONVERSOR' {
            return @(
                @{ Text = 'OmniFetch CONVERSOR - arraste um arquivo e escolha o formato'; Color = $dim },
                @{ Text = ''; Color = $white },
                @{ Text = 'Arquivo de entrada'; Color = $white },
                @{ Text = 'Arraste o arquivo para esta janela, cole o caminho, ou ENTER para sair.'; Color = $dim },
                @{ Text = ''; Color = $white },
                @{ Text = 'CATEGORIA DE SAIDA'; Color = $dim },
                @{ Text = '[P] Presets premium  WhatsApp, Instagram, podcast, compactar'; Color = $green },
                @{ Text = '[V] Video            MP4, MKV, WEBM, MOV, GIF'; Color = $green },
                @{ Text = '[A] Audio            MP3, WAV, FLAC, OPUS, AAC'; Color = $green },
                @{ Text = '[I] Imagem           JPG, PNG, WEBP, ICO'; Color = $green },
                @{ Text = '[E] E-book/doc       EPUB, MOBI, AZW3, PDF, DOCX'; Color = $green }
            )
        }
        'OMNITOOLS' {
            return @(
                @{ Text = 'OmniFetch OMNITOOLS - ferramentas locais'; Color = $dim },
                @{ Text = ''; Color = $white },
                @{ Text = 'ARSENAL LOCAL'; Color = $white },
                @{ Text = '[1] Media Inspector       relatorio tecnico completo de video/audio'; Color = $green },
                @{ Text = '[2] Thumbnail Maker       extrai capa/frame de qualquer video'; Color = $green },
                @{ Text = '[3] Clip Cutter           corta trecho rapido sem reencodar'; Color = $green },
                @{ Text = '[4] Audio Cleaner         normaliza volume e exporta MP3/WAV'; Color = $green },
                @{ Text = '[5] Subtitle Lab          baixa ou extrai legendas'; Color = $green },
                @{ Text = '[6] Batch Renamer         renomeia arquivos em lote com preview'; Color = $green },
                @{ Text = '[7] Folder Report         mapa de tamanho dos arquivos de uma pasta'; Color = $green }
            )
        }
        default {
            return @(
                @{ Text = 'OmniFetch LAUNCHER - universal downloader + converter'; Color = $dim },
                @{ Text = ''; Color = $white },
                @{ Text = 'COMO QUER USAR HOJE?'; Color = $white },
                @{ Text = '[1] Downloader        link, fila, cookies, 4K, audio e aria2 turbo'; Color = $green },
                @{ Text = '[2] Conversor         presets profissionais para video, audio, imagem e ebook'; Color = $green },
                @{ Text = '[3] OmniTools         inspector, cortes, legendas, renomeador e relatorios'; Color = $green },
                @{ Text = '[4] Setup / atualizar motores portateis, atalhos e icones oficiais'; Color = $yellow },
                @{ Text = '[5] Preferencias      velocidade, qualidade, UX e atalhos salvos'; Color = $cyan },
                @{ Text = ''; Color = $white },
                @{ Text = 'motores: yt-dlp / ffmpeg / aria2'; Color = $dim }
            )
        }
    }
}

Clear-Host

Write-RawLine "$line+$('-' * ($width - 2))+$r"
Write-RawLine "$line|$r  $red*$r $amber*$r $green*$r$dim$(' ' * 27)OmniFetch - Terminal CLI$(' ' * 28)$line|$r"
Write-RawLine "$line+$('-' * ($width - 2))+$r"

Wait-Frame 80
Write-Logo
Wait-Frame $logoDelay
Write-RawLine ("  $line$('-' * 78)$r")

$content = Content-For $App
foreach ($item in $content) {
    Write-AnimatedLine ("  " + $item['Text']) $item['Color']
}

Write-RawLine ""
Write-Host "  $green$b>$r "
Wait-Frame 220
