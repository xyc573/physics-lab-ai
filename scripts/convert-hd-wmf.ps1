Add-Type -AssemblyName System.Drawing

$inputDir = "temp-wmf-final2"
$outputDir = "public\question-formulas"
$scaleFactor = 2

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$wmfFiles = Get-ChildItem -Path $inputDir -Filter "*.wmf"
$count = 0
$fail = 0
$total = $wmfFiles.Count

foreach ($file in $wmfFiles) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $origW = $img.Width
        $origH = $img.Height
        $newW = $origW * $scaleFactor
        $newH = $origH * $scaleFactor
        
        $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $bmp.SetResolution(96 * $scaleFactor, 96 * $scaleFactor)
        
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.DrawImage($img, 0, 0, $newW, $newH)
        
        $outName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) + ".png"
        $outPath = Join-Path $outputDir $outName
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $img.Dispose()
        $bmp.Dispose()
        $g.Dispose()
        
        $count++
    } catch {
        $fail++
    }
    
    if (($count + $fail) % 500 -eq 0) {
        Write-Host "  进度: $($count + $fail)/$total (成功: $count, 失败: $fail)"
    }
}

Write-Host "完成: 成功 $count, 失败 $fail, 总共 $total"
