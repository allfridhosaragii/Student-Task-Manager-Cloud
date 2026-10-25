# PowerShell script for local automated testing on Windows
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      STUDENT TASK MANAGER - LOCAL TEST RUNNER           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Run Node.js automated tests
Write-Host "`n[1/3] Menjalankan Node.js Unit & Functional Tests..." -ForegroundColor Yellow
npm test

# 2. Check Git status and ignored files
Write-Host "`n[2/3] Memeriksa status Git dan keamanan file rahasia..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus -match "\.env$") {
    Write-Host "PERINGATAN: File .env terdeteksi di git status! Pastikan tidak di-commit!" -ForegroundColor Red
} else {
    Write-Host "Aman: File .env diabaikan oleh .gitignore." -ForegroundColor Green
}

# 3. Validate compose.yaml syntax
Write-Host "`n[3/3] Memeriksa sintaks compose.yaml..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker compose config -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "compose.yaml valid dan siap dijalankan." -ForegroundColor Green
    } else {
        Write-Host "Peringatan: docker compose config gagal memeriksa. Pastikan daemon berjalan jika diperlukan." -ForegroundColor Yellow
    }
} else {
    Write-Host "Docker CLI tidak ditemukan di sistem." -ForegroundColor Red
}

Write-Host "`nPengujian lokal selesai!" -ForegroundColor Cyan
