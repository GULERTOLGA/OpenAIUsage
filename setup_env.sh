#!/bin/bash

echo "OpenAI Usage API - Environment Setup"
echo "===================================="

if [ -f .env ]; then
    echo ".env dosyası zaten mevcut!"
    echo "Mevcut .env dosyasını silmek istiyor musunuz? (y/n)"
    read choice
    if [[ $choice == "y" || $choice == "Y" ]]; then
        rm .env
        echo ".env dosyası silindi."
    else
        echo "Kurulum iptal edildi."
        exit 0
    fi
fi

echo
echo "env.example dosyası .env olarak kopyalanıyor..."
cp env.example .env

if [ -f .env ]; then
    echo
    echo ".env dosyası başarıyla oluşturuldu!"
    echo
    echo "Şimdi .env dosyasını düzenleyerek API anahtarınızı ekleyin:"
    echo
    echo "1. .env dosyasını açın"
    echo "2. OPENAI_API_KEY=your-api-key-here satırını bulun"
    echo "3. your-api-key-here kısmını gerçek API anahtarınızla değiştirin"
    echo "4. Dosyayı kaydedin"
    echo
    echo ".env dosyasını şimdi açmak istiyor musunuz? (y/n)"
    read open_choice
    if [[ $open_choice == "y" || $open_choice == "Y" ]]; then
        if command -v nano &> /dev/null; then
            nano .env
        elif command -v vim &> /dev/null; then
            vim .env
        else
            echo "Metin editörü bulunamadı. .env dosyasını manuel olarak düzenleyin."
        fi
    fi
else
    echo "Hata: .env dosyası oluşturulamadı!"
    echo "env.example dosyasının mevcut olduğundan emin olun."
fi

echo
echo "Kurulum tamamlandı!" 