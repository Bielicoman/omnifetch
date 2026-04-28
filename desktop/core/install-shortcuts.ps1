param(
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$desktop = [Environment]::GetFolderPath('Desktop')
$programs = Join-Path ([Environment]::GetFolderPath('Programs')) 'OmniFetch'
$desktopGroup = Join-Path $desktop 'OmniFetch'

New-Item -ItemType Directory -Force -Path $programs | Out-Null
New-Item -ItemType Directory -Force -Path $desktopGroup | Out-Null

$items = @(
    @{ Name = 'OmniFetch';          Target = 'OmniFetch.bat';              Icon = 'assets\icons\omnifetch.ico';  DesktopRoot = $true  },
    @{ Name = 'OmniFetch Downloader'; Target = 'Downloader.bat';           Icon = 'assets\icons\downloader.ico'; DesktopRoot = $false },
    @{ Name = 'OmniFetch Conversor'; Target = 'Conversor.bat';             Icon = 'assets\icons\conversor.ico';  DesktopRoot = $false },
    @{ Name = 'OmniFetch Setup';    Target = 'Instalar.bat';               Icon = 'assets\icons\setup.ico';      DesktopRoot = $false },
    @{ Name = 'OmniFetch OmniTools'; Target = 'core\OmniTools.bat';        Icon = 'assets\icons\omnitools.ico';  DesktopRoot = $false }
)

$shell = New-Object -ComObject WScript.Shell

function New-OmniShortcut {
    param(
        [string]$Path,
        [string]$Target,
        [string]$Icon,
        [string]$Description
    )

    $shortcut = $shell.CreateShortcut($Path)
    $shortcut.TargetPath = $env:ComSpec
    $shortcut.Arguments = "/d /c ""$Target"""
    $shortcut.WorkingDirectory = $root
    $shortcut.Description = $Description
    if (Test-Path -LiteralPath $Icon) {
        $shortcut.IconLocation = "$Icon,0"
    }
    $shortcut.Save()
}

foreach ($item in $items) {
    $target = Join-Path $root $item.Target
    $icon = Join-Path $root $item.Icon
    if (-not (Test-Path -LiteralPath $target)) {
        if (-not $Quiet) { Write-Host "  [skip] $($item.Name) alvo ausente" -ForegroundColor Yellow }
        continue
    }

    $startPath = Join-Path $programs "$($item.Name).lnk"
    $groupPath = Join-Path $desktopGroup "$($item.Name).lnk"
    New-OmniShortcut -Path $startPath -Target $target -Icon $icon -Description $item.Name
    New-OmniShortcut -Path $groupPath -Target $target -Icon $icon -Description $item.Name

    if ($item.DesktopRoot) {
        $rootPath = Join-Path $desktop "$($item.Name).lnk"
        New-OmniShortcut -Path $rootPath -Target $target -Icon $icon -Description $item.Name
    }

    if (-not $Quiet) { Write-Host "  [ok] $($item.Name)" -ForegroundColor Green }
}
