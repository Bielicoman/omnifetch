# =============================================================
#  OmniFetch  ·  server.ps1
#  HTTP server local + API para webui/  (single-user, http://localhost:7777)
# =============================================================

$ErrorActionPreference = 'Stop'

# ---- Caminhos ----
$Script:Root        = $PSScriptRoot
$Script:WebRoot     = Join-Path $PSScriptRoot 'webui'
$Script:MotoresRoot = Join-Path $PSScriptRoot 'motores'
$Script:Downloads   = Join-Path $env:USERPROFILE 'Downloads'
$Script:Port        = 7777

if (-not (Test-Path $Script:Downloads)) { New-Item -ItemType Directory -Force -Path $Script:Downloads | Out-Null }

# ---- Job store ----
$Script:Jobs = @{}
$Script:Processes = @{}

# ---- Mime types ----
$Script:Mime = @{
    '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8'
    '.css'='text/css; charset=utf-8';   '.js'='application/javascript; charset=utf-8'
    '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml'
    '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.gif'='image/gif'
    '.webp'='image/webp'; '.ico'='image/x-icon'
    '.woff'='font/woff'; '.woff2'='font/woff2'; '.ttf'='font/ttf'
    '.txt'='text/plain; charset=utf-8'; '.map'='application/json'
}

function Get-Mime([string]$path) {
    $ext = [IO.Path]::GetExtension($path).ToLower()
    if ($Script:Mime.ContainsKey($ext)) { return $Script:Mime[$ext] }
    return 'application/octet-stream'
}

function Send-Json($resp, $obj, [int]$status = 200) {
    $resp.StatusCode = $status
    $resp.ContentType = 'application/json; charset=utf-8'
    $resp.Headers.Add('Cache-Control','no-store')
    $bytes = [Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 8 -Compress))
    $resp.ContentLength64 = $bytes.Length
    $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    $resp.OutputStream.Close()
}

function Send-Text($resp, [string]$txt, [int]$status = 200, [string]$type = 'text/plain; charset=utf-8') {
    $resp.StatusCode = $status
    $resp.ContentType = $type
    $bytes = [Text.Encoding]::UTF8.GetBytes($txt)
    $resp.ContentLength64 = $bytes.Length
    $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    $resp.OutputStream.Close()
}

function Send-File($resp, [string]$path) {
    if (-not (Test-Path -LiteralPath $path)) { Send-Text $resp 'Not Found' 404; return }
    try {
        $resp.ContentType = Get-Mime $path
        $bytes = [IO.File]::ReadAllBytes($path)
        $resp.ContentLength64 = $bytes.Length
        $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } finally {
        $resp.OutputStream.Close()
    }
}

function Read-Body($req) {
    if (-not $req.HasEntityBody) { return '' }
    $reader = [IO.StreamReader]::new($req.InputStream, $req.ContentEncoding)
    try { return $reader.ReadToEnd() } finally { $reader.Close() }
}

function New-JobId { return 'j' + [Guid]::NewGuid().ToString('N').Substring(0,10) }

function New-Job([string]$type, [string]$title) {
    $id = New-JobId
    $logFile = Join-Path $env:TEMP "omnifetch-$id.log"
    '' | Set-Content -LiteralPath $logFile -Encoding UTF8
    $job = [PSCustomObject]@{
        id        = $id
        type      = $type
        title     = $title
        status    = 'queued'
        progress  = 0
        error     = $null
        startedAt = (Get-Date).ToString('o')
        endedAt   = $null
        logFile   = $logFile
        outFile   = $null
    }
    $Script:Jobs[$id] = $job
    return $job
}

function Test-HttpUrl([string]$url) {
    if ([string]::IsNullOrWhiteSpace($url)) { return $false }
    $uri = $null
    if (-not [Uri]::TryCreate($url.Trim(), [UriKind]::Absolute, [ref]$uri)) { return $false }
    return ($uri.Scheme -eq 'http' -or $uri.Scheme -eq 'https')
}

function Get-Diagnostics {
    $downloadOk = $false
    try {
        $probe = Join-Path $Script:Downloads '.omnifetch-write-test'
        'ok' | Set-Content -LiteralPath $probe -Encoding UTF8 -Force
        Remove-Item -LiteralPath $probe -Force -ErrorAction SilentlyContinue
        $downloadOk = $true
    } catch {}

    $drive = $null
    try {
        $root = [IO.Path]::GetPathRoot($Script:Downloads)
        $drive = Get-PSDrive -Name $root.Substring(0,1) -ErrorAction SilentlyContinue
    } catch {}

    $versions = Get-Versions
    return @{
        ok = [bool]($versions.ytdlp -and $versions.ffmpeg -and $downloadOk)
        engines = @{
            ytdlp = $versions.ytdlp
            ffmpeg = $versions.ffmpeg
            ffprobe = $versions.ffprobe
            aria2c = $versions.aria2c
        }
        downloads = @{
            path = $Script:Downloads
            writable = $downloadOk
            freeGB = if ($drive) { [Math]::Round($drive.Free / 1GB, 2) } else { $null }
        }
        jobs = @{
            total = $Script:Jobs.Count
            running = @($Script:Jobs.Values | Where-Object { $_.status -eq 'running' }).Count
            error = @($Script:Jobs.Values | Where-Object { $_.status -eq 'error' }).Count
        }
        server = @{
            port = $Script:Port
            root = $Script:Root
            version = '4.1'
        }
    }
}

function ConvertTo-ProcessArgument([string]$arg) {
    if ($null -eq $arg) { return '""' }
    if ($arg.Length -eq 0) { return '""' }
    if ($arg -notmatch '[\s"]') { return $arg }

    $result = '"'
    $slashCount = 0
    foreach ($ch in $arg.ToCharArray()) {
        if ($ch -eq '\') {
            $slashCount++
            continue
        }
        if ($ch -eq '"') {
            $result += ('\' * (($slashCount * 2) + 1))
            $result += '"'
            $slashCount = 0
            continue
        }
        if ($slashCount -gt 0) {
            $result += ('\' * $slashCount)
            $slashCount = 0
        }
        $result += $ch
    }
    if ($slashCount -gt 0) { $result += ('\' * ($slashCount * 2)) }
    $result += '"'
    return $result
}

function Join-ProcessArguments([string[]]$args) {
    return (($args | ForEach-Object { ConvertTo-ProcessArgument $_ }) -join ' ')
}

# Capturado num scriptblock para ser usado no event handler
$Script:OutputHandler = {
    param($s, $e)
    $jobId = $Event.MessageData
    if (-not $Script:Jobs.ContainsKey($jobId)) { return }
    $job = $Script:Jobs[$jobId]
    if ($null -ne $e.Data) {
        try { Add-Content -LiteralPath $job.logFile -Value $e.Data -Encoding UTF8 } catch {}
        if ($e.Data -match '\[download\]\s+([0-9]+\.[0-9]+)%') {
            $job.progress = [double]$matches[1]
        }
        if ($e.Data -match '\[download\]\s+Destination:\s+(.+)$') {
            $job.outFile = $matches[1].Trim().Trim('"')
        }
        if ($e.Data -match '\[Merger\]\s+Merging formats into "(.+)"') {
            $job.outFile = $matches[1]
        }
        if ($e.Data -match '\[ExtractAudio\]\s+Destination:\s+(.+)$') {
            $job.outFile = $matches[1].Trim().Trim('"')
        }
    }
}

function Start-ProcessJob([object]$job, [string]$exe, [string[]]$jobArgs) {
    if (-not (Test-Path -LiteralPath $exe)) {
        $job.status = 'error'; $job.error = "executavel ausente: $exe"
        return
    }
    $psi = [Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $exe
    if ($null -ne $psi.ArgumentList) {
        foreach ($a in $jobArgs) { [void]$psi.ArgumentList.Add($a) }
    } else {
        $psi.Arguments = Join-ProcessArguments $jobArgs
    }
    $psi.WorkingDirectory = $Script:Root
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError  = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow  = $true
    $psi.StandardOutputEncoding = [Text.Encoding]::UTF8
    $psi.StandardErrorEncoding  = [Text.Encoding]::UTF8

    $p = [Diagnostics.Process]::new()
    $p.StartInfo = $psi
    $p.EnableRaisingEvents = $true

    Register-ObjectEvent -InputObject $p -EventName 'OutputDataReceived' -MessageData $job.id -Action $Script:OutputHandler | Out-Null
    Register-ObjectEvent -InputObject $p -EventName 'ErrorDataReceived'  -MessageData $job.id -Action $Script:OutputHandler | Out-Null
    Register-ObjectEvent -InputObject $p -EventName 'Exited' -MessageData $job.id -Action {
        $jid = $Event.MessageData
        if ($Script:Jobs.ContainsKey($jid)) {
            $j = $Script:Jobs[$jid]
            if ($j.status -eq 'cancelled') { return }
            $j.endedAt = (Get-Date).ToString('o')
            $proc = $Sender
            if ($proc.ExitCode -eq 0) {
                $j.status = 'done'; $j.progress = 100
            } else {
                $j.status = 'error'; $j.error = "exit code $($proc.ExitCode)"
            }
        }
    } | Out-Null

    try {
        $job.status = 'running'
        [void]$p.Start()
        $Script:Processes[$job.id] = $p
        $p.BeginOutputReadLine()
        $p.BeginErrorReadLine()
    } catch {
        $job.status = 'error'
        $job.error = $_.Exception.Message
    }
}

function Tail-Log([string]$path, [int]$maxLines = 60) {
    if (-not (Test-Path -LiteralPath $path)) { return @() }
    try {
        $lines = Get-Content -LiteralPath $path -Tail $maxLines -Encoding UTF8 -ErrorAction SilentlyContinue
        return @($lines)
    } catch { return @() }
}

function Get-Versions {
    function ver([string]$exe) {
        $p = Join-Path $Script:MotoresRoot $exe
        if (-not (Test-Path -LiteralPath $p)) { return $null }
        try {
            $v = & $p --version 2>$null | Select-Object -First 1
            return [string]$v
        } catch { return 'instalado' }
    }
    return @{
        ytdlp     = ver 'yt-dlp.exe'
        ffmpeg    = ver 'ffmpeg.exe'
        ffprobe   = ver 'ffprobe.exe'
        aria2c    = ver 'aria2c.exe'
        downloads = $Script:Downloads
        version   = '4.0'
    }
}

# =============================================================
# REQUEST DISPATCH
# =============================================================
function Handle-Request($ctx) {
    $req = $ctx.Request
    $resp = $ctx.Response
    $resp.Headers.Add('Access-Control-Allow-Origin','*')
    $resp.Headers.Add('Access-Control-Allow-Methods','GET, POST, OPTIONS')
    $resp.Headers.Add('Access-Control-Allow-Headers','Content-Type')
    $resp.Headers.Add('Access-Control-Allow-Private-Network','true')

    if ($req.HttpMethod -eq 'OPTIONS') { Send-Text $resp '' 204; return }

    $path = $req.Url.AbsolutePath
    $method = $req.HttpMethod

    try {
        # ---- API ----
        if ($path -eq '/api/info' -and $method -eq 'GET') {
            Send-Json $resp (Get-Versions); return
        }

        if ($path -eq '/api/diagnostics' -and $method -eq 'GET') {
            Send-Json $resp (Get-Diagnostics); return
        }

        if ($path -eq '/api/download' -and $method -eq 'POST') {
            $body = Read-Body $req | ConvertFrom-Json
            $url = [string]$body.url
            if (-not (Test-HttpUrl $url)) { Send-Json $resp @{error='url invalida'} 400; return }

            $mode = if ($body.mode) { [string]$body.mode } else { 'video' }
            $quality = if ($body.quality) { [string]$body.quality } else { 'best' }
            $audioFmt = if ($body.audioFormat) { [string]$body.audioFormat } else { 'mp3' }
            $dest = if ($body.dest) { [string]$body.dest } else { $Script:Downloads }
            if (-not (Test-Path -LiteralPath $dest)) { New-Item -ItemType Directory -Force -Path $dest | Out-Null }

            $job = New-Job 'download' $url

            $jobArgs = @(
                '--newline','--no-mtime','--retries','10','--fragment-retries','10','--concurrent-fragments','8',
                '--embed-metadata','--embed-thumbnail','--embed-chapters',
                '--no-overwrites','--windows-filenames',
                '--no-playlist',
                '-o', (Join-Path $dest '%(title).200s [%(id)s].%(ext)s')
            )

            if (Test-Path (Join-Path $Script:MotoresRoot 'aria2c.exe')) {
                $jobArgs += @('--downloader','aria2c','--downloader-args','aria2c:-x16 -k1M --console-log-level=warn')
            }

            switch ($mode) {
                'audio' {
                    $jobArgs += @('-f','bestaudio/best','--extract-audio','--audio-format',$audioFmt)
                    if ($audioFmt -eq 'mp3') { $jobArgs += @('--audio-quality','320K') }
                }
                'mute' {
                    $jobArgs += @('-f','bestvideo*','--remux-video','mp4')
                }
                Default {
                    $fmt = switch ($quality) {
                        '2160' { 'bv*[height<=2160]+ba/b[height<=2160]' }
                        '1440' { 'bv*[height<=1440]+ba/b[height<=1440]' }
                        '1080' { 'bv*[height<=1080]+ba/b[height<=1080]' }
                        '720'  { 'bv*[height<=720]+ba/b[height<=720]' }
                        '480'  { 'bv*[height<=480]+ba/b[height<=480]' }
                        Default { 'bv*+ba/b' }
                    }
                    $jobArgs += @('-f', $fmt, '--remux-video','mp4')
                }
            }

            $jobArgs += $url

            Start-ProcessJob $job (Join-Path $Script:MotoresRoot 'yt-dlp.exe') $jobArgs
            Send-Json $resp @{ jobId = $job.id }
            return
        }

        if ($path -match '^/api/jobs/([^/]+)/cancel$' -and $method -eq 'POST') {
            $id = $matches[1]
            if (-not $Script:Jobs.ContainsKey($id)) { Send-Json $resp @{error='job nao encontrado'} 404; return }
            $job = $Script:Jobs[$id]
            if ($Script:Processes.ContainsKey($id)) {
                try {
                    $proc = $Script:Processes[$id]
                    if ($proc -and -not $proc.HasExited) { $proc.Kill($true) }
                } catch {}
            }
            $job.status = 'cancelled'
            $job.error = 'cancelado pelo usuario'
            $job.endedAt = (Get-Date).ToString('o')
            Send-Json $resp @{ ok = $true; id = $id; status = $job.status }
            return
        }

        if ($path -eq '/api/convert' -and $method -eq 'POST') {
            $body = Read-Body $req | ConvertFrom-Json
            $file = [string]$body.filePath
            $target = [string]$body.target
            if (-not $file -or -not (Test-Path -LiteralPath $file)) {
                Send-Json $resp @{error='arquivo nao existe'} 400; return
            }
            if (-not $target) { Send-Json $resp @{error='formato alvo ausente'} 400; return }

            $info = Get-Item -LiteralPath $file
            $dest = if ($body.dest) { [string]$body.dest } else { $info.DirectoryName }
            if (-not (Test-Path -LiteralPath $dest)) { New-Item -ItemType Directory -Force -Path $dest | Out-Null }

            $outName = "$($info.BaseName).$target"
            $outPath = Join-Path $dest $outName
            if (Test-Path -LiteralPath $outPath) {
                $stamp = Get-Date -Format 'yyyyMMddHHmmss'
                $outPath = Join-Path $dest "$($info.BaseName)_$stamp.$target"
            }

            $recipes = @{
                'mp4'  = @('-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k')
                'mkv'  = @('-c:v','libx264','-crf','18','-c:a','flac')
                'webm' = @('-c:v','libvpx-vp9','-crf','30','-b:v','0','-c:a','libopus')
                'mov'  = @('-c:v','libx264','-preset','fast','-crf','20','-c:a','aac')
                'gif'  = @('-vf','fps=12,scale=720:-1:flags=lanczos','-loop','0')
                'mp3'  = @('-vn','-c:a','libmp3lame','-b:a','320k')
                'wav'  = @('-vn','-c:a','pcm_s16le')
                'flac' = @('-vn','-c:a','flac')
                'ogg'  = @('-vn','-c:a','libvorbis','-q:a','5')
                'opus' = @('-vn','-c:a','libopus','-b:a','128k')
                'aac'  = @('-vn','-c:a','aac','-b:a','256k')
                'm4a'  = @('-vn','-c:a','aac','-b:a','256k')
                'jpg'  = @('-vframes','1','-q:v','2')
                'png'  = @('-vframes','1')
                'webp' = @('-vframes','1','-c:v','libwebp','-q:v','85')
            }
            if (-not $recipes.ContainsKey($target)) {
                Send-Json $resp @{error="formato $target nao suportado"} 400; return
            }

            $job = New-Job 'convert' $outName
            $job.outFile = $outPath

            $jobArgs = @('-y','-hide_banner','-stats','-i', $file) + $recipes[$target] + @($outPath)
            Start-ProcessJob $job (Join-Path $Script:MotoresRoot 'ffmpeg.exe') $jobArgs
            Send-Json $resp @{ jobId = $job.id }
            return
        }

        if ($path -match '^/api/jobs/([^/]+)$' -and $method -eq 'GET') {
            $id = $matches[1]
            if (-not $Script:Jobs.ContainsKey($id)) { Send-Json $resp @{error='job nao encontrado'} 404; return }
            $job = $Script:Jobs[$id]
            $log = Tail-Log $job.logFile 40
            Send-Json $resp @{
                id        = $job.id
                type      = $job.type
                title     = $job.title
                status    = $job.status
                progress  = $job.progress
                error     = $job.error
                outFile   = $job.outFile
                startedAt = $job.startedAt
                endedAt   = $job.endedAt
                log       = $log
            }
            return
        }

        if ($path -eq '/api/jobs' -and $method -eq 'GET') {
            $list = $Script:Jobs.Values | Sort-Object -Property startedAt -Descending | Select-Object id,type,title,status,progress,outFile
            Send-Json $resp @{ jobs = @($list) }
            return
        }

        if ($path -eq '/api/open' -and $method -eq 'GET') {
            $p = $req.QueryString['path']
            if ($p -and (Test-Path -LiteralPath $p)) {
                Start-Process explorer.exe ('/select,"{0}"' -f $p)
            } elseif ($p) {
                Start-Process explorer.exe $p
            } else {
                Start-Process explorer.exe $Script:Downloads
            }
            Send-Json $resp @{ ok = $true }; return
        }

        # ---- Static (webui/) ----
        if ($path -eq '/') {
            Send-File $resp (Join-Path $Script:WebRoot 'index.html')
            return
        }
        $clean = $path.TrimStart('/')
        $localPath = Join-Path $Script:WebRoot $clean
        if (Test-Path -LiteralPath $localPath -PathType Leaf) {
            Send-File $resp $localPath
            return
        }

        Send-Text $resp 'Not Found' 404
    } catch {
        try { Send-Json $resp @{ error = $_.Exception.Message } 500 } catch {}
    }
}

# =============================================================
# BOOT
# =============================================================
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$($Script:Port)/")
$listener.Prefixes.Add("http://127.0.0.1:$($Script:Port)/")
try {
    $listener.Start()
} catch {
    Write-Host "[X] Nao consegui abrir a porta $($Script:Port). Outra app ja usa essa porta?" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  OmniFetch · webui pronta em " -NoNewline
Write-Host "http://localhost:$($Script:Port)" -ForegroundColor Green
Write-Host "  (Ctrl+C ou feche esta janela para encerrar)" -ForegroundColor DarkGray
Write-Host ""

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        Handle-Request $ctx
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
