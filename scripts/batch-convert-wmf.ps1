Add-Type -AssemblyName System.Drawing

$inputDir = "temp-wmf-all"
$outputDir = "public\question-formulas"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$wmfFiles = Get-ChildItem -Path $inputDir -Filter "*.wmf"
$count = 0
$fail = 0

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
    
    if (($count + $fail) % 100 -eq 0) {
        Write-Host "  已处理 $($count + $fail)/$($wmfFiles.Count) (成功: $count, 失败: $fail)"
    }
}

Write-Host "完成: 成功 $count, 失败 $fail, 总共 $($wmfFiles.Count)"
