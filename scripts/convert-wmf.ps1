Add-Type -AssemblyName System.Drawing

$inputDir = "temp-wmf"
$outputDir = "public\question-formulas"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$wmfFiles = Get-ChildItem -Path $inputDir -Filter "*.wmf"

foreach ($file in $wmfFiles) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $outPath = Join-Path $outputDir ($file.BaseName + ".png")
        $img.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        Write-Host "OK: $($file.Name) -> $($file.BaseName).png"
    } catch {
        Write-Host "FAIL: $($file.Name) - $($_.Exception.Message)"
    }
}

Write-Host "Done!"
