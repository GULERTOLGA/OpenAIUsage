# OpenAI Usage API - Flask Application

Bu Flask uygulaması, OpenAI kullanım API'sine erişim sağlayan bir REST API sunar.

## Özellikler

### Backend (Flask API)
- OpenAI kullanım verilerini görüntüleme
- Abonelik bilgilerini alma
- Faturalama kullanımını görüntüleme
- Maliyet verilerini alma
- Projeler listesini alma
- Kullanım özeti alma
- Hata yönetimi ve loglama
- API anahtarı doğrulama

### Frontend (React TypeScript)
- Modern ve responsive Bootstrap UI
- TypeScript ile tip güvenliği
- React ile dinamik kullanıcı arayüzü
- Navigation menüsü ve sayfa yönlendirme
- Projeler sayfası ile DataTable benzeri tablo
- Arama ve sayfalama özellikleri
- API entegrasyonu için hazır yapı

## Kurulum

### Backend (Flask API)

1. Python bağımlılıklarını yükleyin:
```bash
pip install -r requirements.txt
```

2. Environment dosyasını kurun:

**Windows:**
```bash
setup_env.bat
```

**Linux/Mac:**
```bash
chmod +x setup_env.sh
./setup_env.sh
```

3. OpenAI API anahtarınızı ayarlayın:

**Seçenek 1: .env dosyası kullanarak (Önerilen)**
```bash
# env.example dosyasını .env olarak kopyalayın
cp env.example .env

# .env dosyasını düzenleyin ve API anahtarınızı ekleyin
# Windows
notepad .env

# Linux/Mac
nano .env
```

**Seçenek 2: Environment variable olarak**
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your-api-key-here"

# Windows Command Prompt
set OPENAI_API_KEY=your-api-key-here

# Linux/Mac
export OPENAI_API_KEY="your-api-key-here"
```

3. İsteğe bağlı olarak OpenAI Organization ID'sini ayarlayın:
```bash
$env:OPENAI_ORG_ID="your-org-id-here"
```

### Frontend (React TypeScript)

1. Node.js bağımlılıklarını yükleyin:
```bash
npm install
```

2. Geliştirme modunda çalıştırın:
```bash
npm start
```

## Çalıştırma

### Hızlı Başlangıç (Tüm Uygulama)

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Manuel Çalıştırma

1. Backend'i çalıştırın:
```bash
python main.py
```

2. Frontend'i build edin ve çalıştırın:
```bash
npm install
npm run build
```

Uygulama varsayılan olarak `http://localhost:5000` adresinde çalışacaktır.

## API Endpoints

### 1. Health Check
```
GET /health
```
API'nin durumunu kontrol eder.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "api_key_configured": true
}
```

### 2. Usage Data
```
GET /usage?date=2024-01-01
GET /usage?start_date=2024-01-01&end_date=2024-01-31
```
OpenAI kullanım verilerini alır.

**Query Parameters:**
- `date`: Belirli bir tarih (YYYY-MM-DD formatında)
- `start_date`: Başlangıç tarihi
- `end_date`: Bitiş tarihi

### 3. Subscription Information
```
GET /subscription
```
OpenAI abonelik bilgilerini alır.

### 4. Billing Usage
```
GET /billing?start_date=2024-01-01&end_date=2024-01-31
```
Faturalama kullanım verilerini alır.

**Query Parameters:**
- `start_date`: Başlangıç tarihi (varsayılan: ayın ilk günü)
- `end_date`: Bitiş tarihi (varsayılan: bugün)

### 5. Costs Data
```
GET /costs?start_time=1704067200&end_time=1706745600&bucket_width=1d&limit=7
```
OpenAI maliyet verilerini alır.

**Query Parameters:**
- `start_time`: Başlangıç zamanı (Unix seconds) - **Zorunlu**
- `end_time`: Bitiş zamanı (Unix seconds) - İsteğe bağlı
- `bucket_width`: Zaman dilimi genişliği (varsayılan: "1d")
- `group_by`: Gruplandırma alanları (project_id, line_item)
- `limit`: Döndürülecek bucket sayısı (1-180, varsayılan: 7)
- `page`: Sayfalama için cursor
- `project_ids`: Belirli projeler için maliyet verileri

### 6. Projects List
```
GET /projects?after=proj_abc&limit=20&include_archived=false
```
OpenAI projelerinin listesini alır.

**Query Parameters:**
- `after`: Sayfalama için cursor (object ID)
- `include_archived`: Arşivlenmiş projeleri dahil et (varsayılan: false)
- `limit`: Döndürülecek proje sayısı (1-100, varsayılan: 20)

### 7. Usage Summary
```
GET /summary
```
Abonelik, faturalama ve maliyet bilgilerinin özetini alır.

## Örnek Kullanım

### cURL ile API çağrıları:

```bash
# Health check
curl http://localhost:5000/health

# Bugünün kullanım verileri
curl http://localhost:5000/usage

# Belirli tarih aralığındaki kullanım
curl "http://localhost:5000/usage?start_date=2024-01-01&end_date=2024-01-31"

# Abonelik bilgileri
curl http://localhost:5000/subscription

# Bu ayın faturalama verileri
curl http://localhost:5000/billing

# Bu ayın maliyet verileri (Unix timestamp kullanarak)
curl "http://localhost:5000/costs?start_time=1704067200&end_time=1706745600"

# Projeler listesi
curl "http://localhost:5000/projects?limit=20&include_archived=false"

# Kullanım özeti
curl http://localhost:5000/summary
```

### Python ile API çağrıları:

```python
import requests

# Health check
response = requests.get('http://localhost:5000/health')
print(response.json())

# Usage data
response = requests.get('http://localhost:5000/usage', 
                       params={'date': '2024-01-01'})
print(response.json())

# Subscription info
response = requests.get('http://localhost:5000/subscription')
print(response.json())

# Costs data
response = requests.get('http://localhost:5000/costs', 
                       params={'start_time': '1704067200', 'end_time': '1706745600'})
print(response.json())

# Projects list
response = requests.get('http://localhost:5000/projects', 
                       params={'limit': '20', 'include_archived': 'false'})
print(response.json())

## Hata Yönetimi

API, aşağıdaki hata durumlarını yönetir:

- **400**: Geçersiz istek parametreleri
- **401**: API anahtarı eksik veya geçersiz
- **404**: Endpoint bulunamadı
- **500**: Sunucu hatası veya OpenAI API hatası

## Güvenlik

- API anahtarı environment variable olarak saklanır
- Tüm isteklerde API anahtarı doğrulanır
- Hata mesajlarında hassas bilgiler gizlenir

## Loglama

Uygulama, tüm API çağrılarını ve hataları loglar. Loglar konsola yazdırılır.

## Notlar

- OpenAI API anahtarınızı güvenli bir şekilde saklayın
- Production ortamında debug modunu kapatın
- Rate limiting için OpenAI API sınırlarını göz önünde bulundurun 