# Generates the official OmniFetch Windows .ico assets from the project mark.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$iconDir = Join-Path $root 'desktop\assets\icons'
New-Item -ItemType Directory -Force -Path $iconDir | Out-Null

Add-Type -AssemblyName System.Drawing

$icons = @(
    @{ File = 'omnifetch.ico';  Mark = '>_';  Accent = [System.Drawing.Color]::FromArgb(0, 255, 136) },
    @{ File = 'downloader.ico'; Mark = 'DL';  Accent = [System.Drawing.Color]::FromArgb(0, 190, 255) },
    @{ File = 'conversor.ico';  Mark = 'CV';  Accent = [System.Drawing.Color]::FromArgb(255, 205, 80) },
    @{ File = 'setup.ico';      Mark = 'ST';  Accent = [System.Drawing.Color]::FromArgb(0, 255, 136) },
    @{ File = 'omnitools.ico';  Mark = 'OT';  Accent = [System.Drawing.Color]::FromArgb(160, 120, 255) }
)

function New-RoundedRectPath {
    param([float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $R * 2
    $path.AddArc($X, $Y, $d, $d, 180, 90)
    $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
    $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
    $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function New-IconPngBytes {
    param([int]$Size, [string]$Mark, [System.Drawing.Color]$Accent)

    $bmp = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.RectangleF]::new(0, 0, $Size, $Size),
        [System.Drawing.Color]::FromArgb(8, 18, 24),
        [System.Drawing.Color]::FromArgb(0, 92, 140),
        135
    )
    $card = New-RoundedRectPath 0 0 $Size $Size ([math]::Round($Size * 0.23))
    $g.FillPath($bg, $card)

    $glow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(90, $Accent))
    $g.FillEllipse($glow, $Size * 0.43, -$Size * 0.12, $Size * 0.74, $Size * 0.74)

    $ringPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(180, $Accent), [math]::Max(2, $Size * 0.035))
    $g.DrawPath($ringPen, (New-RoundedRectPath ($Size * 0.07) ($Size * 0.07) ($Size * 0.86) ($Size * 0.86) ($Size * 0.18)))

    $fontSize = if ($Mark -eq '>_') { $Size * 0.34 } else { $Size * 0.38 }
    $font = [System.Drawing.Font]::new('Consolas', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $shadow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
    $fg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
    $rect = [System.Drawing.RectangleF]::new(0, $Size * 0.03, $Size, $Size * 0.9)
    $shadowRect = [System.Drawing.RectangleF]::new($Size * 0.02, $Size * 0.05, $Size, $Size * 0.9)
    $g.DrawString($Mark, $font, $shadow, $shadowRect, $format)
    $g.DrawString($Mark, $font, $fg, $rect, $format)

    $ms = [System.IO.MemoryStream]::new()
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()

    $format.Dispose()
    $font.Dispose()
    $fg.Dispose()
    $shadow.Dispose()
    $ringPen.Dispose()
    $glow.Dispose()
    $bg.Dispose()
    $g.Dispose()
    $bmp.Dispose()
    $ms.Dispose()

    return $bytes
}

function Write-Ico {
    param([string]$Path, [string]$Mark, [System.Drawing.Color]$Accent)

    $sizes = @(256, 64, 48, 32)
    $images = foreach ($size in $sizes) {
        [pscustomobject]@{ Size = $size; Bytes = New-IconPngBytes -Size $size -Mark $Mark -Accent $Accent }
    }

    $fs = [System.IO.File]::Open($Path, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
    $bw = [System.IO.BinaryWriter]::new($fs)
    $bw.Write([UInt16]0)
    $bw.Write([UInt16]1)
    $bw.Write([UInt16]$images.Count)

    $offset = 6 + (16 * $images.Count)
    foreach ($img in $images) {
        $size = [int]$img.Size
        $data = [byte[]]$img.Bytes
        $icoSize = if ($size -eq 256) { 0 } else { $size }
        $bw.Write([byte]$icoSize)
        $bw.Write([byte]$icoSize)
        $bw.Write([byte]0)
        $bw.Write([byte]0)
        $bw.Write([UInt16]1)
        $bw.Write([UInt16]32)
        $bw.Write([UInt32]$data.Length)
        $bw.Write([UInt32]$offset)
        $offset += $data.Length
    }

    foreach ($img in $images) {
        $data = [byte[]]$img.Bytes
        $bw.Write($data)
    }
    $bw.Dispose()
    $fs.Dispose()
}

foreach ($icon in $icons) {
    $path = Join-Path $iconDir $icon.File
    Write-Ico -Path $path -Mark $icon.Mark -Accent $icon.Accent
    Write-Host "  [ok] $path"
}
