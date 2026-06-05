<#
.SYNOPSIS
  AIDC.work Remote Deployment Script
.DESCRIPTION
  Packages local code and deploys to 10.23.1.53 via SSH.
  Same pattern as fyhGoogle deploy_remote.ps1.
#>

$remoteUser = "yjhwang"
$remoteHost = "10.23.1.53"
$remotePath = "/home/yjhwang/aidc-work"
$archiveName = "deploy_temp.tar.gz"

Write-Host "--- [1/4] Packaging project files ---" -ForegroundColor Cyan
& tar `
  --exclude="node_modules" `
  --exclude=".next" `
  --exclude="out" `
  --exclude=".git" `
  -czf $archiveName `
  app components content lib public docs `
  Dockerfile nginx.conf docker-compose.yml `
  package.json package-lock.json `
  next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts eslint.config.mjs next-env.d.ts AGENTS.md

if ($LASTEXITCODE -ne 0) {
    Write-Error "Packaging failed!"
    exit 1
}

Write-Host "--- [2/4] Uploading to server ($remoteHost) ---" -ForegroundColor Cyan
& scp $archiveName "${remoteUser}@${remoteHost}:${remotePath}/"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Upload failed!"
    Remove-Item $archiveName -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "--- [3/4] Remote extract and restart ---" -ForegroundColor Cyan
$remoteCmd = "cd $remotePath && tar -xzf $archiveName && rm $archiveName && docker compose up -d --build"
& ssh "${remoteUser}@${remoteHost}" $remoteCmd

if ($LASTEXITCODE -ne 0) {
    Write-Error "Remote execution failed!"
    Remove-Item $archiveName -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "`n--- [4/4] Deployment Successful! ---" -ForegroundColor Green
Write-Host "App URL: http://10.23.1.53:3163" -ForegroundColor Green

Remove-Item $archiveName -ErrorAction SilentlyContinue
