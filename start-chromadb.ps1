# ChromaDB Quick Start Script for Windows PowerShell

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ChromaDB Server Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Use py launcher to find Python 3.11 (avoids MSYS2 python conflict)
$PYTHON = "py"
$PYTHON_VER = "-3.11"

# Check if Python 3.11 is installed
Write-Host "Checking Python 3.11 installation..." -ForegroundColor Yellow
try {
    $pythonVersion = & $PYTHON $PYTHON_VER --version 2>&1
    Write-Host "OK Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "X Python 3.11 not found!" -ForegroundColor Red
    Write-Host "Please install Python 3.11 from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    exit
}

Write-Host ""

# Add user Scripts dir to PATH so 'chroma' CLI is found
$userScripts = "$env:APPDATA\Python\Python311\Scripts"
if ($env:PATH -notlike "*$userScripts*") {
    $env:PATH = "$userScripts;$env:PATH"
    Write-Host "Added Python user Scripts to PATH: $userScripts" -ForegroundColor Gray
}

# Check if ChromaDB is installed
Write-Host "Checking ChromaDB installation..." -ForegroundColor Yellow
$chromaInstalled = & $PYTHON $PYTHON_VER -m pip show chromadb 2>&1

if ($chromaInstalled -match "Name: chromadb") {
    Write-Host "OK ChromaDB is already installed" -ForegroundColor Green
} else {
    Write-Host "Installing ChromaDB (user install)..." -ForegroundColor Yellow
    & $PYTHON $PYTHON_VER -m pip install chromadb --user

    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK ChromaDB installed successfully" -ForegroundColor Green
    } else {
        Write-Host "X Failed to install ChromaDB" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Starting ChromaDB Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will run on: http://localhost:8000" -ForegroundColor Green
Write-Host "Data saved to:      .\chroma\" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start ChromaDB server using the chroma CLI
# Host 0.0.0.0 allows Next.js (running on localhost) to connect
$env:CHROMA_SERVER_CORS_ALLOW_ORIGINS = '["*"]'
$chromaExe = "$userScripts\chroma.exe"
if (Test-Path $chromaExe) {
    & $chromaExe run --host 0.0.0.0 --port 8000
} else {
    # Fallback: run via python module
    & $PYTHON $PYTHON_VER -m chromadb.cli.cli run --host 0.0.0.0 --port 8000
}
