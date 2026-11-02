@echo off
title Hentikan BengkelPro & Tunnel Online
color 0C

echo ==============================================================================
echo   Menghentikan BengkelPro & Tunnel Online...
echo ==============================================================================
echo.

echo [1/3] Menutup Cloudflare Tunnel...
taskkill /f /t /im cloudflared.exe >nul 2>&1

echo [2/3] Mematikan proses Node.js pada port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Menutup proses PID %%a...
    taskkill /f /t /pid %%a >nul 2>&1
)

echo [3/3] Membersihkan seluruh window server...
taskkill /f /t /fi "WINDOWTITLE eq BengkelPro*" >nul 2>&1

echo.
echo ==============================================================================
echo   Semua server dan tunnel online BengkelPro telah dihentikan dengan aman.
echo ==============================================================================
pause
