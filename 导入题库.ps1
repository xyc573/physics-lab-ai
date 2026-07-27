param(
    [string]$WordPath = ""
)

Add-Type -AssemblyName System.Windows.Forms

if ([string]::IsNullOrEmpty($WordPath)) {
    $fileDialog = New-Object System.Windows.Forms.OpenFileDialog
    $fileDialog.Filter = "Word文档 (*.docx)|*.docx"
    $fileDialog.Title = "选择题库Word文档"
    $result = $fileDialog.ShowDialog()
    if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
        Write-Output "已取消选择"
        exit
    }
    $WordPath = $fileDialog.FileName
}

if (-not (Test-Path $WordPath)) {
    Write-Output "文件不存在：$WordPath"
    exit
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputDir = Join-Path $scriptDir "public\question-images"
$outputJson = Join-Path $scriptDir "public\custom-questions.json"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open($WordPath)

$questions = @()
$currentQ = $null
$inOptions = $false
$imgCounter = 0
$qNum = 0
$currentImages = @()

foreach ($para in $doc.Paragraphs) {
    $text = $para.Range.Text.Trim()
    $text = $text -replace "`r|`n", ""
    
    $paraImgs = @()
    foreach ($shape in $para.Range.InlineShapes) {
        $imgCounter++
        $imgFileName = "custom_q_$($imgCounter).png"
        $imgPath = Join-Path $outputDir $imgFileName
        
        try {
            $shape.Range.CopyAsPicture()
            Add-Type -AssemblyName System.Drawing
            if ([System.Windows.Forms.Clipboard]::ContainsImage()) {
                $img = [System.Windows.Forms.Clipboard]::GetImage()
                $img.Save($imgPath, [System.Drawing.Imaging.ImageFormat]::Png)
                $img.Dispose()
                $paraImgs += "question-images/$imgFileName"
            }
        } catch {}
    }
    
    if ([string]::IsNullOrWhiteSpace($text) -and $paraImgs.Count -eq 0) {
        if ($currentQ -ne $null -and $inOptions) {
            $inOptions = $false
        }
        continue
    }
    
    if ($text -match "^(\d+)[\.、]\s*【(单选题|多选题|填空题)】(.+)$") {
        if ($currentQ -ne $null) {
            $questions += $currentQ
        }
        $qNum++
        $qType = $matches[2]
        $qContent = $matches[3].Trim()
        
        $typeMap = @{
            "单选题" = "single"
            "多选题" = "multiple"
            "填空题" = "fill"
        }
        
        $currentQ = @{
            id = "custom-$qNum"
            experimentId = ""
            type = $typeMap[$qType]
            difficulty = "medium"
            content = $qContent
            options = @()
            answer = ""
            explanation = ""
            knowledgePoints = @()
            images = @()
            hasFormula = $false
        }
        $inOptions = $true
        
        if ($currentImages.Count -gt 0) {
            $currentQ.images = $currentImages
            $currentImages = @()
        }
        if ($paraImgs.Count -gt 0) {
            $currentQ.images += $paraImgs
        }
        continue
    }
    
    if ($currentQ -eq $null) { 
        if ($paraImgs.Count -gt 0) {
            $currentImages += $paraImgs
        }
        continue 
    }
    
    if ($paraImgs.Count -gt 0) {
        if ($inOptions -and $currentQ.options.Count -gt 0) {
            $lastIdx = $currentQ.options.Count - 1
            $currentQ.options[$lastIdx] = $currentQ.options[$lastIdx] + " [图片]"
        } else {
            $currentQ.images += $paraImgs
        }
    }
    
    if ([string]::IsNullOrWhiteSpace($text)) { continue }
    
    if ($text -match "^答案[:：]\s*(.+)$") {
        $ans = $matches[1].Trim()
        if ($currentQ.type -eq "multiple") {
            $ansArr = @()
            for ($i = 0; $i -lt $ans.Length; $i++) {
                $c = $ans.Substring($i, 1)
                if ($c -match "[A-D]") { $ansArr += $c }
            }
            $currentQ.answer = $ansArr
        } else {
            $currentQ.answer = $ans
        }
        $inOptions = $false
        continue
    }
    
    if ($text -match "^解析[:：]\s*(.+)$") {
        $currentQ.explanation = $matches[1].Trim()
        $inOptions = $false
        continue
    }
    
    if ($inOptions -and $text -match "^([A-D])[\.、]\s*(.+)$") {
        $optText = $matches[2].Trim()
        $currentQ.options += $optText
        continue
    }
    
    if ($inOptions -and $currentQ.options.Count -eq 0) {
        $currentQ.content += " " + $text
    }
}

if ($currentQ -ne $null) {
    $questions += $currentQ
}

$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

$jsonObj = @{
    importedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    source = (Split-Path $WordPath -Leaf)
    count = $questions.Count
    questions = $questions
}

$json = $jsonObj | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($outputJson, $json, [System.Text.Encoding]::UTF8)

Write-Output ""
Write-Output "========================================"
Write-Output "  导入完成！"
Write-Output "========================================"
Write-Output "共解析题目：$($questions.Count) 道"
Write-Output "图片保存到：$outputDir"
Write-Output "数据保存到：$outputJson"
Write-Output ""
Write-Output "刷新网页即可看到新题目"
Write-Output "========================================"

Start-Sleep -Seconds 3
