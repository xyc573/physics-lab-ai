Add-Type -AssemblyName System.Drawing

$inputDir = "temp-wmf-final2"
$outputDir = "public\question-formulas"

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
        $outName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) + ".png"
        $outPath = Join-Path $outputDir $outName
        $img.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        $count++
    } catch {
        $fail++
    }
    
    if (($count + $fail) % 500 -eq 0) {
        Write-Host "  进度: $($count + $fail)/$total"
    }
}

Write-Host "完成: 成功 $count, 失败 $fail, 总共 $total"
