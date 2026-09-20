# ============================================================
#  Member 1 Core Simulation - PowerShell Build and Test Script
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "[1/3] Creating output directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "out/production" | Out-Null
New-Item -ItemType Directory -Force -Path "out/test" | Out-Null

Write-Host "[2/3] Compiling Java source files..." -ForegroundColor Cyan
$mainFiles = (Get-ChildItem -Recurse -Filter *.java src/main/java).FullName
javac -d out/production $mainFiles

$testFiles = (Get-ChildItem -Recurse -Filter *.java src/test/java).FullName
javac -cp out/production -d out/test $testFiles

Write-Host "[3/3] Executing Member 1 Unit Tests..." -ForegroundColor Cyan
java -cp "out/production;out/test" simulator.TestRunner
