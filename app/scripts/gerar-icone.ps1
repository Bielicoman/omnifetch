# Gera o arquivo omnifetch.ico (256x256, PNG embutido) na raiz do projeto.
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\gerar-icone.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'omnifetch.ico'
$size = 256

$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

# --- fundo arredondado com gradiente verde-escuro ---
$radius = 58
$rect = New-Object System.Drawing.Rectangle(4, 4, ($size - 8), ($size - 8))
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$d = $radius * 2
$path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
$path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
$path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
$path.CloseFigure()

$bgTop = [System.Drawing.Color]::FromArgb(255, 16, 46, 30)
$bgBottom = [System.Drawing.Color]::FromArgb(255, 4, 8, 10)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point(0, $size)), $bgTop, $bgBottom)
$g.FillPath($bgBrush, $path)

$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 0, 230, 118), 6)
$g.DrawPath($borderPen, $path)

# --- seta para baixo (marca do OMNIFETCH) ---
$green = [System.Drawing.Color]::FromArgb(255, 0, 230, 118)
$greenBright = [System.Drawing.Color]::FromArgb(255, 57, 255, 160)
$arrowBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 40)), (New-Object System.Drawing.Point(0, 180)), $greenBright, $green)
$arrowPen = New-Object System.Drawing.Pen($arrowBrush, 28)
$arrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

# haste
$g.DrawLine($arrowPen, 128, 52, 128, 140)
# cabeca da seta
$pts = @(
  (New-Object System.Drawing.Point(80, 116)),
  (New-Object System.Drawing.Point(128, 164)),
  (New-Object System.Drawing.Point(176, 116))
)
$g.DrawLines($arrowPen, $pts)

# linha de base
$basePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(170, 0, 230, 118), 18)
$basePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$basePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLine($basePen, 70, 204, 186, 204)

$g.Dispose()

# --- PNG em memoria -> container ICO ---
$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray()
$bmp.Dispose()

$ico = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ico)
$bw.Write([uint16]0)            # reservado
$bw.Write([uint16]1)            # tipo: icone
$bw.Write([uint16]1)            # quantidade de imagens
$bw.Write([byte]0)              # largura (0 = 256)
$bw.Write([byte]0)              # altura  (0 = 256)
$bw.Write([byte]0)              # paleta
$bw.Write([byte]0)              # reservado
$bw.Write([uint16]1)            # planos
$bw.Write([uint16]32)           # bits por pixel
$bw.Write([uint32]$png.Length)  # tamanho dos dados
$bw.Write([uint32]22)           # offset dos dados
$bw.Write($png)
[System.IO.File]::WriteAllBytes($out, $ico.ToArray())
$bw.Dispose()

Write-Host "  Icone gerado: $out" -ForegroundColor Green
