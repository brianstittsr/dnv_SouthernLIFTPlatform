# PowerShell script to fix all TeammemberDoc and TEAM_memberS references

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
    
    # Replace TeammemberDoc with TeamMemberDoc
    $contentString = $contentString -replace 'TeammemberDoc', 'TeamMemberDoc'
    
    # Replace TEAM_memberS with TEAM_MEMBERS
    $contentString = $contentString -replace 'TEAM_memberS', 'TEAM_MEMBERS'
    
    if ($contentString -ne $originalContent) {
        $contentString | Set-Content -Path $file.FullName
        Write-Host "Fixed: $($file.FullName)"
        $count++
    }
}

Write-Host "`nTotal files fixed: $count"
