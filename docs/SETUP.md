# EyeBridge Kurulum Rehberi

Bu rehber, teknik bilgisi az olan katkicilar dahil herkesin projeyi calistirabilmesi icin hazirlandi.

## 1. Gereksinimler

- Node.js 20+
- npm 10+
- Git

Kontrol komutlari:

```bash
node -v
npm -v
git --version
```

## 2. Projeyi Indirme

```bash
git clone <REPO_URL>
cd EyeBridge
```

## 3. Bagimliliklar

```bash
npm install
```

## 4. Gelistirme Modu

```bash
npm run dev
```

Tarayicida verilen adrese git (genelde `http://localhost:5173`).

## 5. Test Modu (Goz Donanimi Olmadan)

- Adres cubuguna `?debugPointer=1` ekle.
- Ekranda bir tusa odaklanmisken klavyeden `B` tusuna basarak kirpma simule et.

## 6. Uretim Derlemesi

```bash
npm run build
```

Derleme ciktilari `dist` klasorune olusur.

## 7. Vercel Deploy

Bu projede Vercel kullanilabilir:

```bash
vercel
vercel --prod
```

## 8. Supabase Notu

Veritabani/sunum altyapisi sonraki adimlarda aktiflestirilecek. Migration dosyalari `supabase/migrations` altinda tutulur.
