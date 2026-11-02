@echo off
title Hentikan Server BengkelPro
color 0E

echo ==============================================================================
echo   Menghentikan Server BengkelPro (Port 3000)
echo ==============================================================================
echo.

cd /d "%~dp0"

echo Memeriksa proses yang sedang berjalan pada port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    set "PID=%%a"
    goto :kill
)

echo [INFO] Tidak ada server BengkelPro yang aktif di port 3000.
goto :done

:kill
echo [INFO] Menemukan proses server BengkelPro dengan PID: %PID%
taskkill /f /t /pid %PID% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUKSES] Server BengkelPro berhasil dihentikan secara aman.
) else (
    echo [WARNING] Gagal menghentikan PID %PID% atau proses telah berhenti.
)

:done
echo.
pause
