# 🔐 SecureScan

> Siber güvenlik analiz platformu — URL, IP ve domain tarama

**[dia_template](https://github.com/diadelmes/dia_template)** üzerine inşa edilmiştir.

## 🚀 Özellikler

| Modül | API | Açıklama |
|-------|-----|----------|
| **VirusTotal** | virustotal.com | 70+ antivirüs motoru ile zararlı yazılım taraması |
| **IP Analizi** | ipinfo.io | Konum, ISP, VPN/Proxy/TOR/Hosting tespiti |
| **SSL Kontrolü** | Node TLS | Sertifika geçerliliği, süre, self-signed kontrolü |
| **WHOIS** | RDAP | Domain kayıt, sahiplik, name server bilgileri |
| **Shodan** | shodan.io | Açık portlar, servisler, CVE güvenlik açıkları |

- 🎯 **Otomatik hedef tespiti** — URL/IP/domain otomatik algılanır
- 📊 **Tehdit skoru** — Tüm sonuçlar birleştirilerek risk seviyesi hesaplanır
- 💾 **Tarama geçmişi** — Supabase ile kayıt, filtreleme, silme
- ⚡ **Paralel tarama** — Tüm API'lar eş zamanlı çağrılır
- 🌙 **Dark/Light mode** + i18n (TR/EN)

## 🛠 Kurulum

```bash
git clone https://github.com/diadelmes/securescan.git
cd securescan
npm install
cp .env.example .env.local
```

### API Anahtarları

| Servis | Ücretsiz Plan | Link |
|--------|--------------|------|
| VirusTotal | 4 istek/dk | [virustotal.com](https://www.virustotal.com/gui/my-apikey) |
| IPInfo | 50k istek/ay | [ipinfo.io](https://ipinfo.io/account/token) |
| Shodan | Sınırlı | [shodan.io](https://account.shodan.io) |
| SSL | Ücretsiz (Node TLS) | — |
| WHOIS | Ücretsiz (RDAP) | — |

### Supabase Kurulumu

1. [supabase.com](https://supabase.com) → Yeni proje
2. SQL Editor → `supabase/schema.sql` çalıştır
3. `.env.local` içine URL ve key'leri ekle

```bash
npm run dev
# http://localhost:3000
```

## 📁 Yapı

```
src/
├── app/
│   ├── api/scan/route.ts         # Ana tarama API endpoint
│   └── [locale]/(dashboard)/
│       ├── scan/page.tsx         # Tarama sayfası
│       └── history/page.tsx      # Geçmiş
├── lib/scanners/
│   ├── virustotal.ts             # VirusTotal entegrasyonu
│   ├── ipinfo.ts                 # IPInfo + DNS çözümleme
│   ├── ssl.ts                    # Node TLS SSL kontrolü
│   ├── whois.ts                  # RDAP tabanlı WHOIS
│   └── shodan.ts                 # Shodan API
├── components/
│   ├── scan/                     # ScanInput, ScanProgress
│   └── results/                  # Sonuç kartları (VT, IP, SSL, WHOIS, Shodan)
├── stores/scan-store.ts          # Zustand store
└── types/scan.ts                 # TypeScript tipleri
supabase/schema.sql               # DB şeması
```

## 🗄 Veritabanı

```sql
profiles  → Kullanıcı profilleri
scans     → Tarama sonuçları (JSONB kolonlar ile tüm API yanıtları)
```

## 📄 Lisans

MIT © diadelmes
