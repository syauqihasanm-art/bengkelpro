@echo off
title BengkelPro - Sinkronisasi ke GitHub
cd /d "%~dp0"
echo ==============================================================================
echo BENGKELPRO - PUSH OTOMATIS KE GITHUB
echo ==============================================================================
echo.
echo Repositori Target: https://github.com/syauqihasanm-art/bengkelpro.git
echo Branch Target    : main
echo.
echo Menghubungkan dan mengirim kode ke GitHub...
echo Jendela browser atau autentikasi GitHub akan muncul untuk izin login.
echo Silakan selesaikan login di browser Anda...
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ==============================================================================
    echo [SUKSES] Seluruh file BengkelPro telah berhasil dikirim ke GitHub!
    echo Silakan cek: https://github.com/syauqihasanm-art/bengkelpro
    echo Sekarang Render akan otomatis mendeteksi kode dan memulai deployment!
    echo ==============================================================================
) else (
    echo ==============================================================================
    echo [CATATAN] Autentikasi GitHub belum selesai atau dibatalkan.
    echo Silakan jalankan ulang script ini dan pastikan Anda login ke akun GitHub Anda.
    echo ==============================================================================
)
echo.
pause
