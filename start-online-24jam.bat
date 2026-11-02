@echo off
title BengkelPro — Online 24 Jam & Akses Multi-Device
color 0B

echo ==============================================================================
echo   BengkelPro — Smart Automotive Workshop Management System
echo   MODE ONLINE 24 JAM & AKSES PUBLIK MULTI-DEVICE (HP / TABLET / LAPTOP)
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

echo [1/4] Memeriksa versi Node.js...
node -v
echo.

REM 2. Memeriksa file konfigurasi environment
echo [2/4] Memeriksa konfigurasi (.env.local)...
if not exist ".env.local" (
    if exist ".env.example" (
        echo [INFO] Membuat .env.local dari .env.example...
        copy ".env.example" ".env.local" >nul
    )
)
echo [OK] Konfigurasi siap.
echo.

REM 3. Memeriksa dependencies
echo [3/4] Memeriksa dependensi project...
if not exist "node_modules\" (
    echo [INFO] Menginstal dependensi...
    call npm install
)
echo [OK] Dependensi terverifikasi.
echo.

REM 4. Menjalankan Server Lokal & Cloudflare Tunnel
echo [4/4] Memulai Server BengkelPro & Cloudflare Public HTTPS Tunnel...
echo.

set "DETECTED_IP=127.0.0.1"
for /f "tokens=*" %%i in ('node -e "const os = require('os'); const nets = os.networkInterfaces(); for (const k in nets) for (const n of nets[k]) if (n.family === 'IPv4' && !n.internal && !n.address.startsWith('169.254')) { console.log(n.address); process.exit(0); }"') do set "DETECTED_IP=%%i"

echo ==============================================================================
echo   APLIKASI SEDANG DIAKTIFKAN UNTUK AKSES PUBLIK:
echo   1. Komputer Lokal    : http://localhost:3000
echo   2. HP / Wi-Fi Lokal  : http://%DETECTED_IP%:3000
echo   3. Online Publik     : Tautan HTTPS Cloudflare akan muncul di bawah ini...
echo                          (Dapat dibuka dari smartphone di mana saja via 4G/5G)
echo ==============================================================================
echo   Tekan Ctrl+C untuk menghentikan server dan tunnel.
echo ==============================================================================
echo.

REM Jalankan Next.js di background
start "BengkelPro Server (Port 3000)" cmd /k "title BengkelPro Server && npm run dev -- -H 0.0.0.0"

REM Tunggu 4 detik agar Next.js siap
timeout /t 4 /nobreak >nul

REM Buka browser lokal
start http://localhost:3000

REM Jalankan Cloudflare Tunnel untuk menghasilkan link publik HTTPS
echo [ONLINE] Menghubungkan ke Cloudflare Edge Network...
echo Salin tautan https://...trycloudflare.com yang muncul di bawah dan buka di HP Anda:
echo.

npx --yes cloudflared tunnel --url http://localhost:3000
