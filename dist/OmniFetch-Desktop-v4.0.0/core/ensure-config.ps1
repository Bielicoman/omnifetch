param(
    [string]$Root
)

$ErrorActionPreference = 'SilentlyContinue'
if (-not $Root) { $Root = Split-Path -Parent $PSScriptRoot }
$rootPath = (Resolve-Path -LiteralPath $Root).Path
$data = Join-Path $rootPath 'data'
$logs = Join-Path $rootPath 'logs'
New-Item -ItemType Directory -Force -Path $data | Out-Null
New-Item -ItemType Directory -Force -Path $logs | Out-Null

$configPath = Join-Path $data 'config.ini'
$defaults = [ordered]@{
    DEFAULT_DEST         = Join-Path $env:USERPROFILE 'Downloads'
    DEFAULT_BROWSER      = 'edge'
    OPEN_WHEN_DONE       = 'N'
    INTRO_ANIMATION      = 'full'
    SPEED_PROFILE        = 'turbo'
    CONCURRENT_FRAGMENTS = '16'
    DOWNLOAD_RETRIES     = '20'
    ARIA_CONNECTIONS     = '16'
    ARIA_SPLITS          = '16'
    ARIA_CHUNK           = '1M'
    EMBED_METADATA       = 'S'
    EMBED_THUMBNAIL      = 'S'
    DOWNLOAD_SUBS        = 'N'
    DOWNLOAD_ARCHIVE     = 'N'
}

$current = [ordered]@{}
if (Test-Path -LiteralPath $configPath) {
    Get-Content -LiteralPath $configPath | ForEach-Object {
        if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
            $current[$matches[1].Trim().ToUpperInvariant()] = $matches[2]
        }
    }
}

foreach ($key in $defaults.Keys) {
    if (-not $current.Contains($key) -or [string]::IsNullOrWhiteSpace([string]$current[$key])) {
        $current[$key] = $defaults[$key]
    }
}

$lines = foreach ($key in $current.Keys) { "$key=$($current[$key])" }
[System.IO.File]::WriteAllLines($configPath, $lines, [System.Text.UTF8Encoding]::new($false))
