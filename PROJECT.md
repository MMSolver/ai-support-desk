# PROJECT.md - AI Support Desk

Teknik referans dokumani. Gelistirme boyunca ana mimari rehber olarak kullanilacak.

Son guncelleme: 2026-08-17

---

## 1. Product Vision

AI Support Desk, isletmelere gelen musteri destek taleplerini yapay zeka ile analiz eden ve yonetmeyi kolaylastiran bir web uygulamasi.

Bir kullanici destek talebi girdiginde sistem:
- Talebin kategorisini belirler (billing, technical, account, product, general)
- Oncelik seviyesini belirler (low, medium, high, urgent)
- Kisa bir ozet olusturur
- Uygun bir cevap onerisi hazirlar
- Orijinal talep ve AI sonucunu veritabanina kaydeder
- Sonuclari profesyonel bir dashboard uzerinden gosterir

Hedef: Gercek calisan, production-ready hissiyat veren bir MVP. Fake demo veya hardcoded response yok.

---

## 2. Portfolio ve Upwork Hedefi

Bu proje asagidaki kanallarda teknik referans olarak kullanilacak:

- **GitHub**: Temiz repo, profesyonel README, mimari dokumantasyon
- **Canli demo**: Vercel uzerinde calisan uygulama (url paylasimi icin)
- **Upwork Portfolio**: Ekran goruntuleri + teknik aciklama + canli link
- **Teknik gorusmelerde**: End-to-end AI entegrasyonu gosteren somut ornek

Portfolio'da gosterilmesi gereken yetkinlikler:
- Full-stack TypeScript gelistirme
- AI/LLM API entegrasyonu ve structured output
- Modern React (Server Components, App Router)
- PostgreSQL veri modelleme
- Profesyonel UI/UX (responsive, dark mode destegiyle)
- Production-grade error handling
- Test yazimi (unit + E2E)
- Cloud deployment (Vercel + Supabase)

---

## 3. Kullanici Akisi

```
Kullanici Dashboard'a gelir
  -> Genel istatistikleri ve son ticket'lari gorur
  -> "New Ticket" butonuna tiklar
  -> Ticket formunu doldurur (subject, message, optional: name, email)
  -> Submit eder
  -> Loading state gosterilir (AI analiz ediliyor)
  -> Sonuc sayfasina yonlendirilir:
     - Orijinal mesaj
     - AI kategorisi, onceligi, ozeti
     - Onerilen cevap
  -> Dashboard'a donerse yeni ticket listede gorunur
  -> Ticket listesinden herhangi bir ticket'a tiklayip detayini gorebilir
  -> Filtreleme: status, priority, category
```

---

## 4. MVP Kapsami

### Dahil:
- Ticket olusturma formu (subject, message, optional name/email)
- OpenAI ile otomatik analiz (kategori, oncelik, ozet, cevap onerisi)
- Supabase/PostgreSQL'e kayit
- Dashboard sayfasi (istatistik kartlari + son ticket'lar)
- Ticket listesi (filtreleme + sayfalama)
- Ticket detay sayfasi
- Loading, empty, error state'leri
- Input validation (client + server)
- Responsive tasarim
- Vercel deployment

### Scope sinirlari:
- Tek kullanici (auth yok ama mimari auth-ready)
- Tek dil (Ingilizce UI)
- Sadece web form uzerinden ticket girisi

---

## 5. MVP Disi Birakilacak Ozellikler

Asagidakiler MVP'ye dahil DEGIL. Mimari engel olmayacak sekilde tasarlanacak ama implement edilmeyecek:

- Kullanici authentication / multi-tenancy
- Email entegrasyonu (inbound email -> ticket)
- WhatsApp / web chat widget entegrasyonu
- CRM entegrasyonu
- Ticket'a cevap yazma ve gonderme
- Team assignment / routing
- SLA tracking
- Real-time notifications (WebSocket)
- Analytics / raporlama sayfalari
- Export (CSV, PDF)
- Bulk islemler
- Dark mode toggle (shadcn/ui ile altyapi hazir olacak ama explicit toggle MVP'de yok)
- Rate limiting (production seviye)
- i18n / coklu dil

---

## 6. Teknoloji Stack'i ve Secim Gerekceleri

### Next.js 14+ (App Router)

**Neden**: SSR ve API route'lari tek projede. Vercel ile zero-config deployment. React Server Components performans avantaji. Portfolio'da modern Next.js bilgisi gosterir.

**Neden alternatifler degil**:
- Vite + Express ayri: Iki proje yonetimi, deployment karmasikligi, portfolio'da daha az etkileyici
- Remix: Daha az yaygin, Vercel destegi Next.js kadar native degil
- SvelteKit: React ekosistemi daha genis, Upwork'te React talebi daha yuksek

### TypeScript (strict mode)

**Neden**: Compile-time tip guvenligi. AI response validation icin Zod ile birlikte runtime + compile-time double check. Portfolio'da profesyonel kod kalitesi gosterir. `strict: true`, `noUncheckedIndexedAccess: true`.

### Tailwind CSS + shadcn/ui

**Neden Tailwind**: Utility-first, hizli gelistirme, responsive kolay, bundle size kucuk.

**Neden shadcn/ui**: Profesyonel SaaS gorunumu icin hazir, erisilebilir komponentler (Button, Card, Badge, Table, Dialog, Skeleton, Toast, Form). Copy-paste modeli — framework bagimi yok, her komponenti ozellestirilebilir. Portfolio'da custom design system kurabildigini gosterir.

**Neden Material UI / Ant Design / Chakra degil**: Bundle size buyuk, opinionated styling, ozellestirilmesi zor, shadcn/ui kadar modern gorunmuyor.

### Supabase (PostgreSQL)

**Neden**: Hosted PostgreSQL + REST API + realtime + auth hepsi hazir. Ucretsiz tier yeterli (500MB DB, 50K MAU). SQL migration destegi. Row Level Security (RLS) ile guvenlik. Portfolio'da BaaS + SQL bilgisi gosterir.

**Neden raw PostgreSQL (self-hosted) degil**: Hosting maliyeti ve yonetim yuku. MVP icin overkill.

**Neden Firebase/Mongo degil**: PostgreSQL relational veri modeli bu use case icin daha uygun. SQL bilgisi Upwork'te daha degerli. Supabase open-source.

### OpenAI GPT-4o-mini

**Neden**: En iyi structured output destegi (JSON mode + response_format). Portfolio'da en taninir AI brand. Cok ucuz (~$0.15/1M input token). Function calling ve JSON Schema validation native.

**Provider-agnostic tasarim**: AI service layer interface uzerinden soyutlanacak. `.env`'de provider degistirerek Gemini veya OpenRouter'a gecis mumkun.

### Zod

**Neden**: Runtime validation. TypeScript tipleriyle sync. Client ve server ayni schema'yi paylasir. AI response validation icin kritik — LLM ciktisi garanti degildir, Zod ile enforce edilir.

### Vitest + Playwright

**Neden Vitest**: Jest'e gore hizli, ESM native, Next.js uyumlu.

**Neden Playwright**: Cross-browser E2E, modern API, CI'da headless calisir, Claude Code'da plugin olarak mevcut.

### Vercel

**Neden**: Next.js creator'u. Zero-config deployment. Ucretsiz hobby plan. Preview deployments. Edge network. Portfolio'da canli demo icin ideal.

---

## 7. Genel Sistem Mimarisi

```
+------------------+       +-------------------+       +------------------+
|                  |       |                   |       |                  |
|    Next.js       | ----> |   Next.js API     | ----> |    OpenAI API    |
|    Frontend      |       |   Route Handlers  |       |    (GPT-4o-mini) |
|    (React)       | <---- |   (Server-side)   | <---- |                  |
|                  |       |                   |       +------------------+
+------------------+       +-------------------+
                                    |    ^
                                    |    |
                                    v    |
                           +-------------------+
                           |                   |
                           |    Supabase       |
                           |    (PostgreSQL)   |
                           |                   |
                           +-------------------+
```

Tum katmanlar tek Next.js projesi icinde:
- Frontend: React komponentleri (App Router, Server + Client Components)
- Backend: Next.js Route Handlers (`/app/api/...`)
- AI: Server-side only (API key frontend'e hic cikmaz)
- Database: Supabase client (server-side, service role key ile)

---

## 8. Frontend Mimarisi

### Dizin Yapisi

```
src/
  app/
    layout.tsx              # Root layout (font, tema, providers)
    page.tsx                # Dashboard sayfasi
    tickets/
      page.tsx              # Ticket listesi
      new/
        page.tsx            # Yeni ticket formu
      [id]/
        page.tsx            # Ticket detay
    api/
      tickets/
        route.ts            # POST (create), GET (list)
        [id]/
          route.ts          # GET (detail)
      dashboard/
        stats/
          route.ts          # GET (istatistikler)
  components/
    ui/                     # shadcn/ui komponentleri (button, card, badge, ...)
    dashboard/
      stats-cards.tsx       # Istatistik kartlari
      recent-tickets.tsx    # Son ticket listesi
    tickets/
      ticket-form.tsx       # Ticket olusturma formu
      ticket-card.tsx       # Liste icin kompakt ticket karti
      ticket-detail.tsx     # Detay gorunumu
      ticket-filters.tsx    # Filtreleme kontrolleri
    shared/
      priority-badge.tsx    # Renk kodlu oncelik gostergesi
      category-badge.tsx    # Kategori etiketi
      status-badge.tsx      # Durum gostergesi
      empty-state.tsx       # Veri yokken gosterilen ekran
      error-state.tsx       # Hata ekrani (retry butonu ile)
      loading-skeleton.tsx  # Skeleton loader
      page-header.tsx       # Sayfa basligi + breadcrumb
  lib/
    ai/
      types.ts              # AI response tipleri
      service.ts             # Provider-agnostic AI service interface
      openai.ts              # OpenAI implementasyonu
      prompts.ts              # System/user prompt sablonlari
    db/
      supabase.ts            # Supabase client (server + client)
      queries.ts              # DB sorgu fonksiyonlari
      types.ts                # Database tipleri (Supabase generated veya manual)
    validations/
      ticket.ts               # Zod schemalari (ticket input, AI response)
    utils/
      format.ts                # Tarih, metin formatlama
      constants.ts              # Sabitler (kategoriler, oncelikler, statusler)
  types/
    index.ts                  # Global tip tanimlari
```

### Component Prensipleri

- Server Components varsayilan. `"use client"` sadece interaktivite gerektiginde.
- Form, filter, toast gibi interaktif komponentler Client Component.
- Dashboard istatistikleri Server Component (SSR ile hizli ilk yukleme).
- Her komponent tek sorumluluk. Buyuk komponent parcalanir.
- Props ile veri, callback ile event. Global state yok (MVP'de gerek yok).

---

## 9. Backend/API Mimarisi

### Route Handlers

Tum API route'lari Next.js App Router icinde `src/app/api/` altinda.

#### POST /api/tickets
```
Request body: { subject, message, customerName?, customerEmail? }
1. Zod ile input validation
2. Supabase'e ticket kaydet (status: 'processing')
3. OpenAI'a gonder (structured output)
4. AI response'u Zod ile validate et
5. Ticket'i AI sonuclariyla guncelle (status: 'open')
6. 201 Created + complete ticket dondir

Hata durumlari:
- Validation fail -> 400 + hata detaylari
- DB kayit fail -> 500 + hata mesaji
- AI fail -> ticket kaydedilir, status: 'needs_review', 201 dondirilir (kismi basari)
- AI response invalid -> yukaridakiyle ayni
```

#### GET /api/tickets
```
Query params: ?status=open&priority=high&category=billing&page=1&limit=10
1. Query param'lari Zod ile validate et
2. Supabase'den filtreli, sayfalanmis sorgu
3. 200 + { data: Ticket[], total: number, page: number }
```

#### GET /api/tickets/[id]
```
1. UUID format validation
2. Supabase'den tek ticket
3. Bulunamazsa 404
4. 200 + Ticket
```

#### GET /api/dashboard/stats
```
1. Supabase'den aggregate sorgulari:
   - Toplam ticket sayisi
   - Oncelik dagilimi (low/medium/high/urgent sayilari)
   - Kategori dagilimi
   - Status dagilimi
   - Son 7 gun trend (gun basina ticket sayisi)
2. 200 + DashboardStats
```

### API Response Formati

```typescript
// Basarili
{ success: true, data: T }

// Hata
{ success: false, error: { message: string, code: string, details?: unknown } }
```

Tutarli response formati. Frontend her zaman `success` field'ini kontrol eder.

---

## 10. Supabase/PostgreSQL Veri Modeli

### tickets tablosu

```sql
CREATE TABLE tickets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject               TEXT NOT NULL,
  message               TEXT NOT NULL,
  customer_name         TEXT,
  customer_email        TEXT,
  source                TEXT NOT NULL DEFAULT 'web_form',
  status                TEXT NOT NULL DEFAULT 'open',

  -- AI analiz sonuclari
  ai_category           TEXT,
  ai_priority           TEXT,
  ai_summary            TEXT,
  ai_suggested_response TEXT,
  ai_confidence         REAL,
  ai_model              TEXT,
  ai_processing_time_ms INTEGER,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeksler
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_ai_priority ON tickets(ai_priority);
CREATE INDEX idx_tickets_ai_category ON tickets(ai_category);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- updated_at otomatik guncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Tasarim Kararlari

- **Tek tablo**: Ticket ve AI analizi 1:1 iliski. Ayri tablo gereksiz join ve karmasiklik ekler. YAGNI.
- **TEXT yerine ENUM kullanilmadi**: Supabase migration'larinda enum degisikligi zahmetli. Application-level validation (Zod) yeterli. Ileride yeni kategori/status eklemek kolay.
- **source field**: MVP'de sadece 'web_form'. Ileride 'email', 'api', 'whatsapp' eklenebilir. Schema degisikligi gerekmez.
- **ai_ prefix**: AI tarafindan uretilen field'lari acikca ayirt eder. Nullable cunku AI basarisiz olabilir.
- **UUID**: Auto-increment yerine UUID. URL'de tahmin edilemez. Distributed sistemlere gecis kolay.

### Row Level Security (RLS)

MVP'de auth yok ama RLS policy'leri tanimlanacak (portfolio icin iyi gosterir):

```sql
-- Simdilik: anon key ile tum islemler acik
-- Auth eklendiginde: user_id field + RLS policy
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for now" ON tickets
  FOR ALL USING (true) WITH CHECK (true);
```

---

## 11. AI Integration Yaklasimi

### Provider-Agnostic Service Layer

```typescript
// lib/ai/types.ts
interface TicketAnalysis {
  category: 'billing' | 'technical' | 'account' | 'product' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  summary: string;
  suggestedResponse: string;
  confidence: number;
}

// lib/ai/service.ts
interface AIService {
  analyzeTicket(subject: string, message: string): Promise<TicketAnalysis>;
}
```

### OpenAI Implementasyonu

- Model: `gpt-4o-mini`
- Response format: `response_format: { type: "json_schema", json_schema: {...} }`
- Structured output: OpenAI native JSON Schema enforcement
- Temperature: 0.3 (tutarli sonuclar icin dusuk)
- Max tokens: 500 (cevap onerisi dahil yeterli)

### System Prompt Tasarimi

```
You are a customer support ticket analyzer for a business.
Analyze the following support ticket and provide:
1. Category: billing, technical, account, product, or general
2. Priority: low, medium, high, or urgent
3. A brief 1-2 sentence summary
4. A professional suggested response to the customer
5. Your confidence score (0.0 to 1.0)

Guidelines:
- Urgent: system down, security breach, data loss
- High: service disruption, billing error, account locked
- Medium: feature question, minor bug, general inquiry
- Low: feedback, feature request, documentation question
```

### Fallback Stratejisi

AI cagrisinin basarisiz olma senaryolari:
1. **API timeout** (10 saniye limit): Ticket kaydedilir, `status: 'needs_review'`
2. **Invalid response format**: Zod validation fail, ayni fallback
3. **Rate limit**: Retry 1 kez (1 saniye bekle), sonra fallback
4. **API key invalid**: 500 dondir, ticket kaydetme

Hic bir senaryoda kullanicinin mesaji kaybolmaz.

---

## 12. AI Structured Output Modeli

### Zod Schema

```typescript
const ticketAnalysisSchema = z.object({
  category: z.enum(['billing', 'technical', 'account', 'product', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  summary: z.string().min(10).max(200),
  suggestedResponse: z.string().min(20).max(1000),
  confidence: z.number().min(0).max(1),
});
```

### OpenAI JSON Schema (response_format)

```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "ticket_analysis",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "category": { "type": "string", "enum": ["billing", "technical", "account", "product", "general"] },
        "priority": { "type": "string", "enum": ["low", "medium", "high", "urgent"] },
        "summary": { "type": "string" },
        "suggestedResponse": { "type": "string" },
        "confidence": { "type": "number" }
      },
      "required": ["category", "priority", "summary", "suggestedResponse", "confidence"],
      "additionalProperties": false
    }
  }
}
```

Cift katmanli validation: OpenAI `strict: true` ile schema enforce eder + Zod ile runtime'da dogrulama. Belt and suspenders.

---

## 13. Request Lifecycle (Frontend -> API -> AI -> Database -> Frontend)

### Basarili Akis

```
1. FRONTEND: Kullanici formu doldurur, submit eder
2. FRONTEND: Loading state aktif (spinner + "AI analyzing..." mesaji)
3. FRONTEND: POST /api/tickets { subject, message, customerName?, customerEmail? }
4. API: Zod ile input validation (basarisiz -> 400 dondir)
5. API: Supabase'e INSERT (status: 'processing', ai_* alanlari null)
6. API: OpenAI'a istek gonder (structured output)
7. API: AI response'u Zod ile validate et
8. API: Supabase UPDATE (ai_* alanlari doldur, status: 'open')
9. API: 201 { success: true, data: completeTicket }
10. FRONTEND: Loading state kaldir
11. FRONTEND: Ticket detay sayfasina yonlendir (veya sonucu yerinde goster)
```

### AI Hatasi Akisi

```
4-5. Ayni (ticket kaydedilir)
6. OpenAI hatasi (timeout, rate limit, vs)
7. API: status 'needs_review' olarak guncelle
8. API: 201 { success: true, data: ticketWithoutAnalysis, warning: "AI analysis failed" }
9. FRONTEND: Ticket detay gosterilir, AI bolumu "Analysis pending" mesaji
```

### Tam Hata Akisi

```
4. Validation fail -> 400 + field-level hatalar -> FRONTEND: form'da hatalari goster
5. DB fail -> 500 -> FRONTEND: error state + retry butonu
```

---

## 14. Input Validation

### Client-Side (form UX icin)

- Zod schemalari client ve server arasinda paylasimli
- Real-time validation: `onBlur` veya debounced `onChange`
- Submit oncesi tam form validation
- Field-level hata mesajlari

### Server-Side (guvenlik icin)

- Her API route girisinde Zod validation
- Client validation'a GUVENME — server her zaman kendi dogrular
- Validation hatalari 400 status + detayli field-level hatalar

### Ticket Input Schema

```typescript
const createTicketSchema = z.object({
  subject: z.string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be under 200 characters'),
  message: z.string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be under 5000 characters'),
  customerName: z.string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
  customerEmail: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
});
```

### Query Parameter Validation

```typescript
const listTicketsSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'needs_review']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['billing', 'technical', 'account', 'product', 'general']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
```

---

## 15. Error Handling Stratejisi

### Prensip

Her hata katmaninda yakalanir, loglanir, ve kullaniciya anlamli bir mesaj dondurulur. Stack trace veya teknik detay kullaniciya gosterilmez.

### Katmanlar

1. **Input Validation Hatalari (400)**: Field-level mesajlar, form'da inline gosterim
2. **Not Found (404)**: "Ticket not found" mesaji, dashboard'a yonlendirme linki
3. **AI Service Hatalari**: Graceful degradation — ticket kaydedilir, analiz eksik
4. **Database Hatalari (500)**: Generic hata mesaji, console'a detayli log
5. **Beklenmeyen Hatalar (500)**: Global error handler, Sentry-ready (Sentry MVP'de yok ama yapi hazir)

### API Error Response Formati

```typescript
interface APIError {
  success: false;
  error: {
    message: string;      // Kullaniciya gosterilebilir mesaj
    code: string;         // Programatik hata kodu: 'VALIDATION_ERROR', 'NOT_FOUND', 'AI_FAILURE', 'INTERNAL_ERROR'
    details?: unknown;    // Field-level validation hatalari gibi ek bilgi
  };
}
```

### AI Hata Yonetimi

```typescript
try {
  const analysis = await aiService.analyzeTicket(subject, message);
  // basarili: ticket'i guncelle
} catch (error) {
  // AI hatasi: ticket'i 'needs_review' yap, hatayi logla, devam et
  console.error('AI analysis failed:', error);
  // ticket yine dondirilur, analiz kismi bos
}
```

AI hatasi kullaniciyi engellemez. Ticket her zaman kaydedilir.

---

## 16. Loading / Empty / Failure States

### Loading States

| Konum | Davranis |
|-------|----------|
| Dashboard yukleniyor | Skeleton kartlar (stats) + skeleton ticket satirlari |
| Ticket listesi yukleniyor | Skeleton tablo satirlari |
| Ticket detay yukleniyor | Skeleton layout |
| Ticket submit (AI analiz) | Full-page loading: spinner + "Analyzing your ticket..." mesaji + progress bar (indeterminate) |

shadcn/ui `Skeleton` komponenti kullanilacak. Spinner veya shimmer efekti degil, icerik boyutunda skeleton placeholder.

### Empty States

| Konum | Davranis |
|-------|----------|
| Dashboard (hic ticket yok) | Illustration + "No tickets yet" + "Create your first ticket" butonu |
| Ticket listesi (filtre sonucu bos) | "No tickets match your filters" + filtre temizleme linki |
| Ticket detay (AI analiz eksik) | "Analysis pending — this ticket will be analyzed shortly" bilgi karti |

### Failure States

| Konum | Davranis |
|-------|----------|
| API istegi basarisiz | Error card: hata mesaji + "Try again" butonu |
| Ticket bulunamadi (404) | "Ticket not found" + Dashboard'a don linki |
| Form validation hatasi | Inline field-level hata mesajlari (kirmizi) |
| AI analiz basarisiz | Ticket detayinda info banner: "AI analysis could not be completed" |

---

## 17. Environment Variables ve Secret Management

### .env.local (lokal gelistirme, .gitignore'da)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### .env.example (repo'ya commit edilir, degerler bos)

```env
# Supabase - https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI - https://platform.openai.com/api-keys
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Kurallar

- `NEXT_PUBLIC_` prefix'li degiskenler: client bundle'a dahil edilir. Sadece public bilgi (Supabase URL, anon key).
- Prefix'siz degiskenler: Sadece server-side. `OPENAI_API_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` ASLA client'a cikmaz.
- Vercel'de: Environment Variables dashboard'undan ayarlanir (Production/Preview/Development ayri).
- `.env.local` dosyasi `.gitignore`'a eklenecek.

---

## 18. Guvenlik Yaklasimi

### API Key Guvenligi

- OpenAI API key sadece server-side (Route Handlers). Client Component'lerden erisilemez.
- Supabase service role key sadece server-side. Client tarafinda anon key kullanilir.
- `.env.local` asla commit edilmez.

### Input Sanitization

- Zod validation tum user input'lari icin (trim, length limit, format check).
- SQL injection riski yok — Supabase client parameterized query kullanir.
- XSS: React varsayilan olarak HTML escape eder. `dangerouslySetInnerHTML` kullanilmayacak.

### HTTP Security Headers

Next.js middleware veya `next.config.js` ile:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

### Rate Limiting (MVP seviye)

MVP'de tam rate limiting yok. Temel onlem:
- AI endpoint'inde basit in-memory rate check (IP basina dakikada max 10 istek)
- Production'da Vercel'in Edge Middleware + Upstash Redis ile upgrade edilebilir

### CORS

Next.js API routes varsayilan olarak same-origin. Ek CORS konfigurasyonu gerekmez.

---

## 19. UI/UX Yaklasimi

### Tasarim Prensipleri

- **Temiz ve minimal**: Gereksiz dekorasyon yok. Icerik ve islem on planda.
- **Profesyonel SaaS hissi**: shadcn/ui'nin varsayilan temasi uzerine minimal ozellestime.
- **Tutarli spacing**: Tailwind'in spacing scale'i (4, 8, 12, 16, 24, 32, 48...).
- **Tipografi hiyerarsisi**: Baslik seviyeleri net. Body text okunabilir boyutta.
- **Renk kodlamasi**: Priority ve status icin tutarli renkler.

### Renk Paleti (Priority)

| Oncelik | Renk | Kullanim |
|---------|------|----------|
| Urgent | Kirmizi (`destructive`) | Badge, border accent |
| High | Turuncu (`warning`) | Badge, border accent |
| Medium | Mavi (`default`) | Badge |
| Low | Gri (`secondary`) | Badge |

### Renk Paleti (Status)

| Status | Renk |
|--------|------|
| Open | Mavi |
| In Progress | Sari |
| Resolved | Yesil |
| Closed | Gri |
| Needs Review | Turuncu |

### Navigasyon

Basit sidebar veya top navigation:
- Dashboard (ana sayfa)
- Tickets (liste)
- New Ticket (CTA butonu, her sayfadan erisilebilir)

### Interaksiyon Geri Bildirimi

- Form submit: Button disabled + loading spinner
- Ticket olusturuldu: Toast notification + sayfa yonlendirme
- Hata: Toast notification (kirmizi) + inline mesaj
- Filtre degisikligi: Aninda sonuc guncelleme (client-side state)

---

## 20. Responsive Design Yaklasimi

### Breakpoints (Tailwind varsayilan)

| Breakpoint | Piksel | Hedef |
|------------|--------|-------|
| sm | 640px | Buyuk telefon |
| md | 768px | Tablet |
| lg | 1024px | Kucuk laptop |
| xl | 1280px | Desktop |

### Komponent Davranislari

| Komponent | Mobile (<768px) | Desktop (>=768px) |
|-----------|-----------------|-------------------|
| Navigation | Hamburger menu | Sidebar veya top nav |
| Dashboard stats | 1 kolon, yigin | 4 kolon grid |
| Ticket listesi | Card gorunumu | Tablo gorunumu |
| Ticket form | Full-width | Max-width 600px, centered |
| Ticket detay | Tek kolon | 2 kolon (mesaj + analiz yan yana) |

### Prensipler

- Mobile-first: Tailwind'de base stil mobile, `md:` ile desktop override
- Tablo'lar kucuk ekranda card'a donusur (veya horizontal scroll)
- Touch-friendly: min 44px tap target
- Viewport meta tag dogru ayarli

---

## 21. Test Stratejisi

### Test Piramidi

```
        /  E2E  \          Playwright: 3-5 kritik akis
       /----------\
      / Integration \      API route testleri: her endpoint
     /----------------\
    /     Unit Tests    \   Zod validation, utility, AI parse
   /----------------------\
```

### Unit Tests (Vitest)

- Zod schema validation (gecerli/gecersiz input cesitleri)
- AI response parsing ve validation
- Utility fonksiyonlari (tarih formatlama, vs.)
- Supabase query builder fonksiyonlari (mocked)

### Integration Tests (Vitest)

- API route handler testleri
- Mock: Supabase client, OpenAI client
- Her endpoint icin: basarili, validation hatasi, DB hatasi, AI hatasi senaryolari

### E2E Tests (Playwright)

Kritik akislar:
1. **Ticket olusturma**: Form doldur -> submit -> sonuc goruntulensin
2. **Dashboard**: Istatistikler dogru gosteriliyor mu
3. **Ticket listesi**: Filtreleme calisiyor mu
4. **Hata durumu**: Bos form submit -> validation hatalari gorunuyor mu

### Test Calistirma

```bash
npm run test          # Vitest (unit + integration)
npm run test:e2e      # Playwright (E2E)
npm run test:coverage # Vitest coverage raporu
```

---

## 22. Playwright/E2E Test Yaklasimi

### Setup

- Playwright Test runner
- Test ortami: lokal dev server (next dev veya next build + next start)
- Test DB: Supabase'de ayri test projesi veya mevcut DB'de test prefix'li kayitlar
- CI'da: headless Chromium

### Test Dosya Yapisi

```
e2e/
  tickets.spec.ts      # Ticket CRUD akislari
  dashboard.spec.ts    # Dashboard istatistikleri
  navigation.spec.ts   # Sayfa gecisleri
  fixtures/
    test-data.ts       # Test ticket verileri
```

### Ornek Test

```typescript
test('should create a ticket and show AI analysis', async ({ page }) => {
  await page.goto('/tickets/new');
  await page.fill('[name="subject"]', 'Cannot access my account');
  await page.fill('[name="message"]', 'I have been locked out of my account since yesterday...');
  await page.click('button[type="submit"]');

  // AI analiz tamamlanana kadar bekle
  await page.waitForSelector('[data-testid="ai-analysis"]');

  // Sonuclari dogrula
  await expect(page.getByTestId('ai-category')).toBeVisible();
  await expect(page.getByTestId('ai-priority')).toBeVisible();
  await expect(page.getByTestId('ai-summary')).toBeVisible();
});
```

### MVP'de E2E Scope

3-5 test yeterli. Her biri kritik bir kullanici akisini kapsar. Exhaustive E2E test suite MVP'de gereksiz.

---

## 23. Code Review ve Security Review Asamalari

### Code Review

Her development fazinin sonunda `code-review` plugini kullanilacak:

1. Faz 2 (Database) tamamlandiginda: Schema ve migration review
2. Faz 3 (AI katmani) tamamlandiginda: AI service review (secret handling, error handling)
3. Faz 4 (API routes) tamamlandiginda: Endpoint review (validation, error handling, response format)
4. Faz 5-6 (Frontend) tamamlandiginda: Component review (erisilebilirlik, state yonetimi)
5. Final: Tum codebase review

### Security Review

Deployment oncesi `security-review` yaklasimi:

- API key exposure kontrolu (client bundle'da secret var mi?)
- Input validation kontrolu (tum endpoint'lerde Zod var mi?)
- SQL injection kontrolu (parameterized query kullaniliyor mu?)
- XSS kontrolu (dangerouslySetInnerHTML yok mu?)
- CORS ve header kontrolu
- Environment variable kontrolu (.env.local gitignore'da mi?)

---

## 24. Plugin/Subagent Gorev Dagilimi

| Plugin | Kullanim Asamasi | Gorev |
|--------|------------------|-------|
| superpowers | Tum fazlar | Gorev bolme, paralel subagent koordinasyonu, plan/spec yazimi |
| frontend-design | Faz 5-6 (Frontend) | UI komponent tasarimi, layout kararlari, responsive yaklasim |
| code-review | Her faz sonu | Kod kalite incelemesi |
| security-review | Faz 7-8 (Test/Deploy) | Guvenlik denetimi |
| playwright | Faz 7 (Test) | E2E test yazimi ve calistirma |

### Kullanim Kurallari

- Plugin sadece ilgili asamada kullanilir, sirt kurulu oldugu icin degil
- Yeni/custom agent olusturulmaz, mevcut altyapi kullanilir
- Ana oturum koordinasyondan, gorev bolmeden ve sonuc kontrolunden sorumlu

---

## 25. Paralel Yapilabilecek Gorevler

### Faz 1: Proje Kurulumu
Sirayla — birbirine bagimli

### Faz 2-3: Database + AI (PARALEL)
- **Agent A**: Supabase schema, migration, DB client setup
- **Agent B**: AI service layer, OpenAI implementasyonu, Zod schemalari

### Faz 4: API Routes
Sirayla — DB ve AI katmanina bagimli

### Faz 5-6: Frontend (KISMI PARALEL)
- **Agent A**: Dashboard sayfasi + istatistik komponentleri
- **Agent B**: Ticket form + ticket detay sayfalari
- **Agent C**: Ticket listesi + filtreleme

### Faz 7: Test (PARALEL)
- **Agent A**: Unit testler (Vitest)
- **Agent B**: E2E testler (Playwright)

---

## 26. Development Fazlari ve Uygulama Sirasi

### Faz 1: Proje Kurulumu
- Next.js projesi olustur (create-next-app, TypeScript, Tailwind, App Router)
- shadcn/ui kur ve temel komponentleri ekle
- Supabase client setup
- ESLint + Prettier konfigurasyonu
- `.env.example` olustur
- Git init + ilk commit

### Faz 2: Database
- Supabase'de tickets tablosu olustur
- Indeksler ve trigger tanimla
- DB client ve query fonksiyonlari yaz
- DB tip tanimlari

### Faz 3: AI Katmani
- AI service interface tanimla
- OpenAI implementasyonu yaz
- Zod schemalari (input + AI response)
- System prompt
- Fallback/error handling

### Faz 4: API Routes
- POST /api/tickets (create + analyze)
- GET /api/tickets (list + filter + paginate)
- GET /api/tickets/[id] (detail)
- GET /api/dashboard/stats (aggregates)
- Tutarli error response formati

### Faz 5: Frontend Sayfalari
- Root layout (navigation, font, providers)
- Dashboard sayfasi (stats + recent tickets)
- Ticket listesi sayfasi (tablo/card + filtreler)
- Yeni ticket formu sayfasi
- Ticket detay sayfasi

### Faz 6: UI Polish
- Loading skeletons
- Empty states
- Error states
- Toast notifications
- Responsive ayarlamalar
- frontend-design plugin ile inceleme

### Faz 7: Test
- Vitest unit testler
- Vitest integration testler (API routes)
- Playwright E2E testler
- code-review ve security review

### Faz 8: Deployment
- Vercel'e deploy
- Environment variable'lari ayarla
- Production build test
- Canli URL dogrulama

### Faz 9: Documentation ve Portfolio
- README.md (profesyonel, mimari diagram, setup talimatlari, ekran goruntuleri)
- Ekran goruntuleri al (dashboard, form, detay, mobile)
- Demo akisi hazirla

---

## 27. Git/GitHub Yaklasimi

### Repository

- Public repo: `ai-support-desk`
- `main` branch: her zaman deployable
- Feature branch'ler: `feat/database-schema`, `feat/ai-integration`, `feat/dashboard-ui`, vs.
- Her faz kendi branch'inde gelistirilir, tamamlaninca main'e merge edilir
- Commit mesajlari Conventional Commits formati: `feat:`, `fix:`, `chore:`, `docs:`

### .gitignore

```
node_modules/
.next/
.env.local
.env*.local
*.tsbuildinfo
```

### Ilk Commit Sirasi

1. Proje kurulumu + konfigrasyon
2. Database schema + client
3. AI service layer
4. API routes
5. Frontend sayfalari
6. Testler
7. README + dokumantasyon

---

## 28. Deployment Plani

### Platform: Vercel (Hobby Plan - Ucretsiz)

| Ozellik | Deger |
|---------|-------|
| Build command | `next build` |
| Output directory | `.next` |
| Node version | 20.x |
| Region | Auto (en yakin) |
| Domain | `ai-support-desk.vercel.app` (veya custom) |

### Deployment Akisi

1. GitHub repo'yu Vercel'e bagla
2. Environment variable'lari Vercel dashboard'dan ayarla
3. `main` branch'e push = otomatik deployment
4. Preview deployment: her PR icin otomatik preview URL

### Vercel Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL = ...
NEXT_PUBLIC_SUPABASE_ANON_KEY = ...
SUPABASE_SERVICE_ROLE_KEY = ...
OPENAI_API_KEY = ...
NEXT_PUBLIC_APP_URL = https://ai-support-desk.vercel.app
```

### Pre-Deployment Checklist

- [ ] Tum testler geciyor
- [ ] Build hatasi yok (`next build` basarili)
- [ ] Environment variable'lar ayarli
- [ ] API key'ler gecerli
- [ ] Supabase tablosu ve indeksler hazir
- [ ] Security review tamamlandi

---

## 29. README ve Portfolio Gereksinimleri

### README.md Icerigi

1. **Baslik + kisa aciklama** (1 paragraf)
2. **Tech stack badge'leri** (Next.js, TypeScript, Tailwind, Supabase, OpenAI, Vercel)
3. **Canli demo linki**
4. **Ekran goruntuleri** (dashboard, ticket form, ticket detay, mobile gorunum)
5. **Ozellikler listesi** (bullet points)
6. **Mimari diagram** (ASCII veya gorsel)
7. **Teknik akis** (Frontend -> API -> AI -> DB -> Frontend)
8. **Kurulum talimatlari** (clone, install, env setup, run)
9. **Test calistirma**
10. **Deployment talimatlari**
11. **Teknoloji secim gerekceleri** (kisa)
12. **Lisans**

### Portfolio Materyalleri

- 4-6 ekran goruntusu (desktop + mobile)
- 30 saniyelik GIF veya demo video senaryosu
- Upwork portfolio aciklamasi (2-3 paragraf)

---

## 30. MVP Completion / Definition of Done

MVP tamamlanmis sayilir YALNIZCA asagidakilerin hepsi saglandiginda:

### Fonksiyonel

- [ ] Ticket olusturma formu calisiyor (validation dahil)
- [ ] OpenAI ile gercek AI analiz yapiliyor (hardcoded degil)
- [ ] Analiz sonucu veritabanina kaydediliyor
- [ ] Dashboard istatistikleri dogru hesaplaniyor
- [ ] Ticket listesi filtreleme ve sayfalama ile calisiyor
- [ ] Ticket detay sayfasi tum bilgileri gosteriyor
- [ ] AI hatasi durumunda graceful degradation calisiyor

### Kalite

- [ ] TypeScript strict mode, sifir type hatasi
- [ ] Tum loading/empty/error state'leri implement
- [ ] Responsive: mobile ve desktop'ta kullanilabilir
- [ ] Vitest unit testler geciyor
- [ ] Playwright E2E testler geciyor (en az 3 kritik akis)
- [ ] code-review tamamlandi, kritik bulgu yok
- [ ] security review tamamlandi, kritik bulgu yok

### Deployment

- [ ] Vercel'de canli calisiyor
- [ ] Canli URL'de tum ozellikler test edildi
- [ ] Environment variable'lar guvenli sekilde ayarli

### Documentation

- [ ] README.md profesyonel ve eksiksiz
- [ ] Ekran goruntuleri ekli
- [ ] Setup talimatlari test edildi (baskasi takip edebilir mi?)

---

## 31. Potansiyel Teknik Riskler

| Risk | Etki | Azaltma |
|------|------|---------|
| OpenAI API yanit suresi degisken (1-10 sn) | UX: kullanici bekler | Loading state + timeout (10 sn) + fallback |
| OpenAI structured output bazen schema'ya uymuyor | Veri tutarsizligi | Zod runtime validation + fallback |
| Supabase free tier rate limit | Gelistirme yavaslar | Lokal cache, gereksiz sorgudan kacin |
| Next.js App Router server/client component karisikligi | Build hatalari | Net "use client" kurallari, compile-time kontrol |
| shadcn/ui komponent version uyumsuzlugu | UI kirilma | Package lock, major upgrade dikkatli |
| Vercel Hobby plan serverless function timeout (10 sn) | AI uzun surerse timeout | GPT-4o-mini hizli (~1-3 sn), timeout handling |

---

## 32. Potansiyel Guvenlik Riskleri

| Risk | Etki | Onlem |
|------|------|-------|
| API key client bundle'a sizinti | Key calinti, maliyet | NEXT_PUBLIC_ prefix kontrolu, build-time check |
| Supabase service role key exposure | Tam DB erisimi | Sadece server-side kullan, anon key client'ta |
| XSS via ticket mesaji | Script injection | React auto-escape, dangerouslySetInnerHTML yasak |
| SSRF via AI prompt injection | AI manipulasyonu | AI output'u validate et, kullaniciya ham AI ciktisi gosterme |
| DDoS / abuse via ticket endpoint | API maliyet artisi | Basit rate limiting, Vercel Edge middleware |
| Supabase anon key ile yetkisiz veri erisimi | Veri sizintisi | RLS policy'leri (MVP'de open ama auth-ready) |

---

## 33. API ve Servis Maliyetleri

### Ucretsiz Katmanlar

| Servis | Ucretsiz Limit | MVP icin Yeterli mi? |
|--------|----------------|---------------------|
| Supabase | 500MB DB, 50K MAU, 500MB storage, 2M edge function calls | Evet, fazlasiyla |
| Vercel | 100GB bandwidth, 100 build saat/ay, 10 sn function timeout | Evet |
| GitHub | Unlimited public repos | Evet |

### Ucretli Noktalar

| Servis | Maliyet | Zorunlu mu? | Not |
|--------|---------|-------------|-----|
| OpenAI API | ~$5 min depozit, gercek kullanim ~$0.01-0.10 | **Evet** (production AI icin) | Gelistirme/test sirasinda az token harcanir |
| Custom domain | ~$10-15/yil | Hayir | Vercel .vercel.app ucretsiz |
| Supabase Pro | $25/ay | Hayir | Free tier yeterli |
| Vercel Pro | $20/ay | Hayir | Hobby plan yeterli |

### Toplam MVP Maliyeti

**Minimum: ~$5** (OpenAI depozit). Geri kalan hepsi ucretsiz.

---

## 34. Ucretsiz Kullanilabilecek Servisler

| Servis | Kullanim | Plan |
|--------|----------|------|
| Supabase | Database + API | Free tier |
| Vercel | Hosting + deployment | Hobby (ucretsiz) |
| GitHub | Kaynak kod + CI | Free |
| shadcn/ui | UI komponentleri | Acik kaynak |
| Tailwind CSS | Styling | Acik kaynak |
| Next.js | Framework | Acik kaynak |
| Vitest | Unit test | Acik kaynak |
| Playwright | E2E test | Acik kaynak |

### Olasi Ileride Ucretli Noktalar (MVP'de degil)

- Custom domain: portfolio icin `aisupportdesk.com` gibi bir domain istenirse (~$10-15/yil)
- Supabase Pro: auth + storage + RLS ihtiyaci artarsa ($25/ay)
- Sentry: Error monitoring ($0 developer plan, 5K events/ay ucretsiz)
- Upstash Redis: Rate limiting icin ($0 free tier, 10K cmd/gun)

---

## 35. Manuel Yapilmasi Gereken Islemler

Asagidaki islemler kullanici tarafindan manuel yapilacak. Otomasyon mumkun degil.

### Gelistirme Oncesi (Zorunlu)

1. **Supabase hesabi olustur**: https://supabase.com -> Sign Up (GitHub ile giris yapilabilir)
2. **Supabase projesi olustur**: Dashboard -> New Project -> Region: EU Central (veya en yakin) -> DB password belirle
3. **Supabase credentials al**: Project Settings -> API -> `URL`, `anon key`, `service_role key`
4. **OpenAI hesabi olustur**: https://platform.openai.com -> Sign Up
5. **OpenAI kredi yukle**: Billing -> Add payment method -> $5 yukle
6. **OpenAI API key olustur**: API Keys -> Create new secret key

### Deployment Oncesi (Zorunlu)

7. **GitHub'da repo olustur**: `ai-support-desk` ismiyle, public
8. **Vercel hesabi olustur**: https://vercel.com -> Sign Up (GitHub ile)
9. **Vercel'de proje olustur**: Import Git Repository -> `ai-support-desk` sec
10. **Vercel environment variables**: Settings -> Environment Variables -> 5 degiskeni gir

### Opsiyonel

11. **Custom domain**: Vercel -> Domains -> domain ekle ve DNS ayarla
12. **Upwork portfolio**: Projeyi Upwork profiline ekle (screenshot + aciklama + link)

---

## 36. Olusturulmasi Gereken Hesaplar ve Credentials

| Servis | URL | Hesap Gerekli? | Credential | Maliyet |
|--------|-----|----------------|------------|---------|
| Supabase | supabase.com | Evet (ucretsiz) | URL + anon key + service role key | $0 |
| OpenAI | platform.openai.com | Evet (ucretli) | API key | ~$5 min |
| Vercel | vercel.com | Evet (ucretsiz) | GitHub OAuth yeterli | $0 |
| GitHub | github.com | Mevcut | Repo olustur | $0 |

### Credential Kullanim Yerleri

```
Supabase URL          -> .env.local (NEXT_PUBLIC_SUPABASE_URL)     + Vercel
Supabase Anon Key     -> .env.local (NEXT_PUBLIC_SUPABASE_ANON_KEY) + Vercel
Supabase Service Key  -> .env.local (SUPABASE_SERVICE_ROLE_KEY)     + Vercel
OpenAI API Key        -> .env.local (OPENAI_API_KEY)                + Vercel
```

Tum credential'lar `.env.local` dosyasinda tutulur (lokal) ve Vercel dashboard'dan ayarlanir (production). Repository'ye ASLA commit edilmez.
