@echo off
echo OpenAI Usage API - Environment Setup
echo ====================================

if exist .env (
    echo .env dosyası zaten mevcut!
    echo Mevcut .env dosyasını silmek istiyor musunuz? (y/n)
    set /p choice=
    if /i "%choice%"=="y" (
        del .env
        echo .env dosyası silindi.
    ) else (
        echo Kurulum iptal edildi.
        pause
        exit /b
    )
)

echo.
echo env.example dosyası .env olarak kopyalanıyor...
copy env.example .env

if exist .env (
    echo.
    echo .env dosyası başarıyla oluşturuldu!
    echo.
    echo Şimdi .env dosyasını düzenleyerek API anahtarınızı ekleyin:
    echo.
    echo 1. .env dosyasını açın
    echo 2. OPENAI_API_KEY=your-api-key-here satırını bulun
    echo 3. your-api-key-here kısmını gerçek API anahtarınızla değiştirin
    echo 4. Dosyayı kaydedin
    echo.
    echo .env dosyasını şimdi açmak istiyor musunuz? (y/n)
    set /p open_choice=
    if /i "%open_choice%"=="y" (
        notepad .env
    )
) else (
    echo Hata: .env dosyası oluşturulamadı!
    echo env.example dosyasının mevcut olduğundan emin olun.
)

echo.
echo Kurulum tamamlandı!
pause 