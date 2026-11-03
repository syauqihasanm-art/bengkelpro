@echo off
title BengkelPro - Deploy ke Cloudflare Workers
cd /d "%~dp0"
echo ==============================================================================
echo BENGKELPRO - CLOUDFLARE WORKERS DEPLOYMENT
echo ==============================================================================
echo.
echo 1. Menjalankan Build OpenNext untuk Cloudflare Workers...
call npm run build:worker
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build Cloudflare Worker gagal. Silakan periksa pesan di atas.
    pause
    exit /b %errorlevel%
)

echo.
echo 2. Mengunggah Worker dan Static Assets ke Cloudflare...
call npx wrangler deploy
echo.
if %errorlevel% equ 0 (
    echo ==============================================================================
    echo [SUKSES] BengkelPro berhasil di-deploy ke Cloudflare Workers!
    echo Aplikasi Anda kini aktif di domain publik *.workers.dev
    echo ==============================================================================
) else (
    echo ==============================================================================
    echo [INFO] Jika belum login, jalankan 'npx wrangler login' di terminal Anda.
    echo ==============================================================================
)
echo.
pause
