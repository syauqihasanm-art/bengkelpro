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

REM 4. Menjalankan server development Next.js
echo [4/4] Memulai BengkelPro Development Server...
echo.
echo ==============================================================================
echo   Aplikasi dapat diakses melalui browser:
echo   - Komputer Lokal    : http://localhost:3000
echo   - HP / Tablet (Wi-Fi): http://10.100.17.166:3000
echo   - Portal Masuk      : http://localhost:3000/login
echo   - Booking Online    : http://localhost:3000/booking/sahabat-motor
echo   - Status Sistem     : http://localhost:3000/api/health
echo ==============================================================================
echo   Untuk akses 24 jam non-stop dari internet, baca: DEPLOY_24JAM.md
echo   Tekan Ctrl+C untuk menghentikan server.
echo ==============================================================================
echo.

set "PORT=3000"
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Server berhenti dengan kode keluar %ERRORLEVEL%.
)

pause
