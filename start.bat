@echo off
title BengkelPro — Smart Automotive Workshop Management System
color 0F

echo ==============================================================================
echo   BengkelPro — Smart Automotive Workshop Management System
echo   "Kelola Bengkel Lebih Mudah, Cepat, dan Profesional."
echo ==============================================================================
echo.

cd /d "%~dp0"

REM 1. Pastikan Node.js dan Git ada di PATH
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    ) else (
        echo [ERROR] Node.js belum terpasang atau belum ada di PATH.
        echo Silakan unduh dan pasang Node.js LTS dari: https://nodejs.org/
        pause
        exit /b 1
    )
)

where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "PATH=C:\Program Files\Git\cmd;%PATH%"
    )
)

echo [1/4] Memeriksa versi Node.js dan npm...
node -v
npm -v
echo.

REM 2. Memeriksa file konfigurasi environment
echo [2/4] Memeriksa konfigurasi environment (.env.local)...
if not exist ".env.local" (
    if exist ".env.example" (
        echo [INFO] .env.local belum ditemukan. Membuat dari .env.example...
        copy ".env.example" ".env.local" >nul
        echo [OK] .env.local berhasil dibuat.
    ) else (
        echo [WARNING] .env.example tidak ditemukan.
    )
) else (
    echo [OK] File .env.local siap digunakan.
)
echo.

REM 3. Memeriksa dependencies (node_modules)
echo [3/4] Memeriksa dependencies project...
if not exist "node_modules\" (
    echo [INFO] Direktori node_modules belum ada. Menginstal dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Gagal menginstal dependencies.
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies terverifikasi.
)
echo.

REM 4. Pilihan Mode Menjalankan Aplikasi
echo [4/4] Pilih Mode Menjalankan BengkelPro:
echo.
echo   [1] Mode Lokal & Wi-Fi Kantor / Rumah (Default)
echo   [2] Mode Online Publik 24 Jam (Cloudflare Tunnel - Langsung dapat link HTTPS untuk HP)
echo   [3] Buka Panduan Cloud Deployment (Vercel + Supabase)
echo.
set /p "CHOICE=Masukkan pilihan Anda (1/2/3, default 1): "

if "%CHOICE%"=="2" (
    call "%~dp0start-online-24jam.bat"
    exit /b 0
)

if "%CHOICE%"=="3" (
    start notepad "%~dp0DEPLOY_24JAM.md"
    exit /b 0
)

echo.
echo Memulai BengkelPro Mode Lokal & Wi-Fi...

set "DETECTED_IP=127.0.0.1"
for /f "tokens=*" %%i in ('node -e "const os = require('os'); const nets = os.networkInterfaces(); for (const k in nets) for (const n of nets[k]) if (n.family === 'IPv4' && !n.internal && !n.address.startsWith('169.254')) { console.log(n.address); process.exit(0); }"') do set "DETECTED_IP=%%i"

echo ==============================================================================
echo   Aplikasi dapat diakses melalui browser:
echo   - Komputer Lokal    : http://localhost:3000
echo   - HP / Tablet (Wi-Fi): http://%DETECTED_IP%:3000
echo   - Pusat Fitur (1-Klik): http://localhost:3000/#pusat-fitur
echo   - Portal Masuk      : http://localhost:3000/login
echo   - Booking Online    : http://localhost:3000/booking/sahabat-motor
echo   - Status Sistem     : http://localhost:3000/api/health
echo ==============================================================================
echo   Untuk mode online publik, jalankan: start-online-24jam.bat
echo   Tekan Ctrl+C untuk menghentikan server.
echo ==============================================================================
echo.

start http://localhost:3000

set "PORT=3000"
call npm run dev -- -H 0.0.0.0

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Server berhenti dengan kode keluar %ERRORLEVEL%.
)

pause
