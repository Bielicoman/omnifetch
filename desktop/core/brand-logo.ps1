param(
    [switch]$WordmarkOnly
)

$esc = [char]27
$r = "$esc[0m"
$b = "$esc[1m"
$green = "$esc[38;2;0;255;136m"
$dim = "$esc[38;2;94;122;115m"
$white = "$esc[97m"

$art = @(
    "      ██████╗ ███╗   ███╗███╗   ██╗██╗███████╗███████╗████████╗ ██████╗ ██╗  ██╗",
    "     ██╔═══██╗████╗ ████║████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝ ██║  ██║",
    "     ██║   ██║██╔████╔██║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║      ███████║",
    "     ██║   ██║██║╚██╔╝██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║      ██╔══██║",
    "     ╚██████╔╝██║ ╚═╝ ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗ ██║  ██║",
    "      ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝"
)

if ($Host.UI.RawUI.WindowSize.Width -lt 86) {
    if ($WordmarkOnly) {
        Write-Host "  $green$b OMNIFETCH$r"
    } else {
        Write-Host "  $green$b>_ OMNIFETCH$r  $dim desktop suite$r"
    }
    return
}

Write-Host ""
foreach ($line in $art) {
    Write-Host "$green$b$line$r"
}
if (-not $WordmarkOnly) {
    Write-Host "  $green$b>_ OMNIFETCH$r  $dim|$r $white downloader$r $dim+$r $white converter$r $dim+$r $white local media tools$r"
}
