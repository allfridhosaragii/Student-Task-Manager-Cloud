# ==============================================================================
# STUDENT TASK MANAGER - CLEAN ARCHIVE PACKAGING SCRIPT (WINDOWS)
# Menghasilkan berkas arsip ringkas student-task-manager.tar.gz yang bersih
# tanpa menyalin node_modules, .git, .env lokal, maupun file rahasia/sementara.
# ==============================================================================

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

$ArchiveName = "student-task-manager.tar.gz"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    PACKAGING STUDENT TASK MANAGER UNTUK DEPLOYMENT AZURE " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Hapus arsip lama jika ada
if (Test-Path $ArchiveName) {
    Remove-Item $ArchiveName -Force
}

Write-Host "`n[1/3] Mengompresi file proyek (mengecualikan node_modules, .git, .env)..." -ForegroundColor Yellow

# Gunakan bsdtar bawaan Windows untuk membuat arsip tar.gz
tar -czf $ArchiveName `
  --exclude="node_modules" `
  --exclude=".git" `
  --exclude=".env" `
  --exclude="*.tar.gz" `
  --exclude="*.log" `
  --exclude=".agents" `
  --exclude=".gemini" `
  .

if (Test-Path $ArchiveName) {
    $fileSize = (Get-Item $ArchiveName).Length / 1KB
    Write-Host "[OK] Berkas arsip berhasil dibuat: $ArchiveName ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Gagal membuat arsip $ArchiveName" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/3] Memeriksa keamanan isi arsip..." -ForegroundColor Yellow
$contentListing = tar -tf $ArchiveName
if ($contentListing -match "node_modules" -or $contentListing -match "\.env$" -or $contentListing -match "\.git/") {
    Write-Host "[PERINGATAN] Ditemukan file yang seharusnya diabaikan di dalam arsip!" -ForegroundColor Red
} else {
    Write-Host "[OK] Arsip bersih: node_modules, .env, dan .git berhasil dikecualikan." -ForegroundColor Green
}

Write-Host "`n[3/3] LANGKAH PENGIRIMAN KE AZURE VM:" -ForegroundColor Cyan
Write-Host "Jalankan perintah ini di PowerShell Anda untuk mengirim arsip ke VM:" -ForegroundColor White
Write-Host "  scp -i `$HOME\.ssh\id_ed25519 $ArchiveName azureuser@<IP_PUBLIC_VM>:~/" -ForegroundColor Yellow
Write-Host "`nKemudian login ke VM dan ekstrak di direktori terpisah:" -ForegroundColor White
Write-Host "  ssh -i `$HOME\.ssh\id_ed25519 azureuser@<IP_PUBLIC_VM>" -ForegroundColor Yellow
Write-Host "  mkdir -p ~/Student-Task-Manager && tar -xzf ~/student-task-manager.tar.gz -C ~/Student-Task-Manager" -ForegroundColor Yellow
Write-Host "  cd ~/Student-Task-Manager && chmod +x scripts/*.sh" -ForegroundColor Yellow
Write-Host "  ./scripts/deploy-azure.sh <IP_PUBLIC_VM>" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
