# PowerShell script to fix all TypeScript errors in one pass

Write-Host "Fixing all TypeScript errors..." -ForegroundColor Cyan

# Fix 1: Replace .map(number) with .map(Number) in all files
Write-Host "`n1. Fixing number vs Number constructor errors..." -ForegroundColor Yellow
$files = Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and 
    $_.FullName -notmatch '\\.next\\' 
}

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $contentString = $content -join "`n"
    $originalContent = $contentString
    
    # Fix .map(number) to .map(Number)
    $contentString = $contentString -replace '\.map\(number\)', '.map(Number)'
    
    # Fix number(value) to Number(value)
    $contentString = $contentString -replace '\$\{number\(', '${Number('
    
    if ($contentString -ne $originalContent) {
        $contentString | Set-Content -Path $file.FullName
        Write-Host "  Fixed: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}
Write-Host "  Fixed $count files for number/Number errors" -ForegroundColor Green

# Fix 2: Replace TeammemberDoc with TeamMemberDoc
Write-Host "`n2. Fixing TeammemberDoc to TeamMemberDoc..." -ForegroundColor Yellow
$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $contentString = $content -join "`n"
    $originalContent = $contentString
    
    $contentString = $contentString -replace 'TeammemberDoc', 'TeamMemberDoc'
    
    if ($contentString -ne $originalContent) {
        $contentString | Set-Content -Path $file.FullName
        Write-Host "  Fixed: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}
Write-Host "  Fixed $count files for TeammemberDoc errors" -ForegroundColor Green

# Fix 3: Replace TEAM_memberS with TEAM_MEMBERS
Write-Host "`n3. Fixing TEAM_memberS to TEAM_MEMBERS..." -ForegroundColor Yellow
$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $contentString = $content -join "`n"
    $originalContent = $contentString
    
    $contentString = $contentString -replace 'TEAM_memberS', 'TEAM_MEMBERS'
    
    if ($contentString -ne $originalContent) {
        $contentString | Set-Content -Path $file.FullName
        Write-Host "  Fixed: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}
Write-Host "  Fixed $count files for TEAM_memberS errors" -ForegroundColor Green

# Fix 4: Replace Intl.numberFormat with Intl.NumberFormat
Write-Host "`n4. Fixing Intl.numberFormat to Intl.NumberFormat..." -ForegroundColor Yellow
$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $contentString = $content -join "`n"
    $originalContent = $contentString
    
    $contentString = $contentString -replace 'Intl\.numberFormat', 'Intl.NumberFormat'
    
    if ($contentString -ne $originalContent) {
        $contentString | Set-Content -Path $file.FullName
        Write-Host "  Fixed: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}
Write-Host "  Fixed $count files for Intl.numberFormat errors" -ForegroundColor Green

Write-Host "`nAll fixes applied!" -ForegroundColor Cyan
