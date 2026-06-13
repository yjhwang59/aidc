# AIDC.work local dev launcher — free port 3163, then start Next.js dev server
param(
    [int]$Port = 3163,
    [switch]$CleanupOnly,
    [switch]$NewWindow
)

$ErrorActionPreference = "Stop"
$AppRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$StoppedPids = @{}

function Write-Phase {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Stop-ListenerOnPort {
    param([int]$ListenPort)

    $connections = Get-NetTCPConnection -LocalPort $ListenPort -State Listen -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        $processId = $connection.OwningProcess
        if (-not $processId -or $StoppedPids.ContainsKey($processId)) {
            continue
        }

        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        $processName = if ($process) { $process.ProcessName } else { "unknown" }
        Write-Phase "Stopping port $ListenPort listener: $processName (PID $processId)"
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        $StoppedPids[$processId] = $true
    }

    $netstatLines = netstat -ano | Select-String ":$ListenPort\s+.*LISTENING"
    foreach ($line in $netstatLines) {
        $processId = [int]($line -replace '\s+', ' ' -split ' ')[-1]
        if ($processId -le 0 -or $StoppedPids.ContainsKey($processId)) {
            continue
        }

        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        $processName = if ($process) { $process.ProcessName } else { "unknown" }
        Write-Phase "Stopping port $ListenPort listener (netstat): $processName (PID $processId)"
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        $StoppedPids[$processId] = $true
    }
}

Write-Phase "Checking port $Port ..."
Stop-ListenerOnPort -ListenPort $Port
Start-Sleep -Seconds 1

$lockFile = Join-Path $AppRoot ".next\dev\lock"
if (Test-Path $lockFile) {
    Write-Phase "Removing stale lock: $lockFile"
    Remove-Item $lockFile -Force
}

if ($CleanupOnly) {
    Write-Phase "Cleanup only - port $Port released."
    exit 0
}

if ($NewWindow) {
    $devUrl = "http://localhost:$Port"
    Write-Phase "Opening new terminal for dev server at $devUrl ..."
    $launchCommand = @"
Set-Location -LiteralPath '$AppRoot'
Write-Host 'AIDC.work dev server -> $devUrl' -ForegroundColor Green
Write-Host 'Close this window to stop the dev server.' -ForegroundColor DarkGray
npm run dev
"@
    Start-Process -FilePath "powershell.exe" -ArgumentList @(
        "-NoProfile",
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $launchCommand
    ) | Out-Null
    Write-Phase "Dev server starting in a new window."
    exit 0
}

Write-Phase "Starting dev server at http://localhost:$Port ..."
Set-Location $AppRoot
npm run dev
