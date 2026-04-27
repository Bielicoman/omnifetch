$esc = [char]27
try {
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
} catch {}

$reset = "$esc[0m"
$bold = "$esc[1m"
$green = "$esc[38;2;0;255;136m"
$greenSoft = "$esc[38;2;0;205;115m"
$greenDeep = "$esc[38;2;0;110;76m"
$cyan = "$esc[38;2;72;238;210m"
$dim = "$esc[38;2;94;122;115m"
$white = "$esc[97m"

$block = [string][char]0x2588
$shade = [string][char]0x2593

$rows = @(
    " ###  #   # #   # ##### ##### ##### #####  #### #   #",
    "#   # ## ## ##  #   #   #     #       #   #     #   #",
    "#   # # # # # # #   #   ####  ####    #   #     #   #",
    "#   # #   # #  ##   #   #     #       #   #     #####",
    "#   # #   # #   #   #   #     #       #   #     #   #",
    "#   # #   # #   #   #   #     #       #   #     #   #",
    " ###  #   # #   # ##### #     #####   #    #### #   #"
)

function Write-NeonRow {
    param(
        [string]$Pattern,
        [int]$Row
    )

    Write-Host "  " -NoNewline
    for ($i = 0; $i -lt $Pattern.Length; $i++) {
        if ($Pattern[$i] -eq '#') {
            $pulse = ($Row * 11 + $i * 7) % 10
            if ($pulse -eq 0) {
                Write-Host "$greenDeep$shade$reset" -NoNewline
            } elseif ($pulse -eq 1) {
                Write-Host "$greenSoft$block$reset" -NoNewline
            } else {
                Write-Host "$green$block$reset" -NoNewline
            }
        } else {
            Write-Host " " -NoNewline
        }
    }
    Write-Host ""
}

Write-Host ""

if ($Host.UI.RawUI.WindowSize.Width -lt 72) {
    Write-Host "  $green$bold OMNIFETCH$reset  $dim desktop suite$reset"
    return
}

foreach ($index in 0..($rows.Count - 1)) {
    Write-NeonRow -Pattern $rows[$index] -Row $index
}

Write-Host "  $green$bold OMNIFETCH$reset  $dim|$reset $white desktop downloader$reset $dim+$reset $white converter$reset $dim+$reset $white online engine$reset"
