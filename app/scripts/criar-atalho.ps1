# Cria um atalho "OMNIFETCH" na area de trabalho com icone proprio,
# apontando para o inicializador silencioso (sem janela preta).
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\criar-atalho.ps1

$root = Split-Path -Parent $PSScriptRoot
$vbs = Join-Path $root 'OMNIFETCH.vbs'
$ico = Join-Path $root 'omnifetch.ico'
$desktop = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $desktop 'OMNIFETCH.lnk'

if (-not (Test-Path $ico)) {
  & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'gerar-icone.ps1')
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnk)
$shortcut.TargetPath = $vbs
$shortcut.WorkingDirectory = $root
$shortcut.IconLocation = "$ico,0"
$shortcut.Description = 'OMNIFETCH - Downloader universal de videos (local e privado)'
$shortcut.Save()

Write-Host ''
Write-Host "  Atalho criado: $lnk" -ForegroundColor Green
Write-Host '  Dois cliques: abre sem janela preta, direto no navegador.' -ForegroundColor Green
Write-Host ''
