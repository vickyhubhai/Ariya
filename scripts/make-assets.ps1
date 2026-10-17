# One-off helper: create public/assets from the official Ariya logo.
Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot 'ariya_logo_source.png'
$out = 'd:\FlutterProjects\ariya-3d-music-website\public\assets'
New-Item -ItemType Directory -Force -Path $out | Out-Null

$img = [System.Drawing.Image]::FromFile($src)

function Save-Png([System.Drawing.Image]$img, [int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $size, $size)
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "wrote $path"
}

# Full-resolution brand logo used in header/loader (downscaled to 640 to keep weight sane)
Save-Png $img 640 (Join-Path $out 'ariya_logo.png')
# Icon sizes referenced by manifest.ts, layout.tsx and site.ts
Save-Png $img 64  (Join-Path $out 'ariya-logo-64.png')
Save-Png $img 160 (Join-Path $out 'ariya-logo-160.png')
Save-Png $img 240 (Join-Path $out 'ariya-logo-240.png')
Save-Png $img 512 (Join-Path $out 'icon-512.png')

$img.Dispose()
