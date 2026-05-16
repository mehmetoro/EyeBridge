# EyeBridge

EyeBridge, yogun bakimda olan ve konusma/hareket yetisini kaybetmis hastalar icin gelistirilen acik kaynakli goz tabanli iletisim platformudur.

Amacimiz:

- Hastanin goz hareketleri ve goz kirpmasi ile yazi olusturabilmesi
- Yazinin sesli okunmasi (TTS)
- Zamanla mesajlasma, oyun ve sosyal etkilesim modullerini eklemek
- Sifir maliyetli, herkesin ulasabilecegi bir altyapi kurmak

## Neden Bu Proje?

Bir hasta konusamiyor olabilir, ellerini kullanamiyor olabilir. Buna ragmen dusunur, hisseder, iletisim kurmak ister.
EyeBridge, bu temel insan ihtiyacini acik kaynak topluluk gucuyle karsilamayi hedefler.

## V1 Durumu

Su an uygulamada:

- Goz odakli secim sistemi (`data-gaze`)
- Kirpma ile tetikleme (`data-blink-action`)
- 2 saniye dwell secimi
- 10 saniye hareketsizlikte yardim paneli
- Sanal klavye (buyuk tuslar)
- TTS ile metin seslendirme
- Sesli ve gorsel geri bildirim
- WebGazer kamera baslat/durdur/kalibrasyon sifirlama kontrolleri

## Teknoloji

- Frontend: React + Vite
- Veritabani/Realtime: Supabase
- Hosting: Vercel
- Goz takibi: MediaPipe Face Landmarker tabanli gaze bridge
- Seslendirme: Web Speech API

## Standart Mimari

Bu proje artik yalnizca genel gaze takibi mantigi ile degil, standartlastirilmis etkilesim profilleri ile ilerler.

- Temel gaze motoru: tum uygulama icin ortak altyapi
- Baglama ozel kalibrasyon profilleri: klavye, genel sayfa, sosyal, oyun
- Sticky focus: kullanicinin hedefe yaklasinca butona tutunabilmesi
- Standart sayfa bolgeleri: geri, ileri, kaydirma, onay gibi aksiyonlarin sabit bolgelerde kalmasi

Bu yapinin resmi tanimi icin [docs/INTERACTION_STANDARD.md](docs/INTERACTION_STANDARD.md) dosyasini oku.

## Dil Destegi

Disa acik tum sayfalar ve sabit arayuz metinleri 6 dilde sunulmak zorundadir: `tr`, `en`, `de`, `es`, `fr`, `ru`.

- Varsayilan icerik Turkce olabilir
- Tum diger dil karsiliklari ayni anda eklenmelidir
- Yeni sayfa, oyun veya sosyal moduller tek dilde birakilamaz
- Gelistiriciye yonelik dokumanlar ve plan dosyalari Turkce + Ingilizce tutulur

## Hizli Baslangic

1. Depoyu klonla.
2. Bagimliliklari kur:

```bash
npm install
```

3. Gelistirme sunucusunu baslat:

```bash
npm run dev
```

4. Uretim derlemesi al:

```bash
npm run build
```

Detayli kurulum notlari icin [docs/SETUP.md](docs/SETUP.md) dosyasina bak.

## Goz Takibi Kullanimi

Uygulama icinde gozle secilebilen kontrol tuslari vardir:

- Kamerayi Baslat
- Kamerayi Durdur
- Kalibrasyon Sifirla

Kamera acik oldugunda WebGazer verisi otomatik olarak `eyebridge:gaze` eventi ile sisteme aktarilir.

## Gelistirici Event Arayuzu

Uygulama goz koordinatini su event ile bekler:

```js
window.dispatchEvent(
	new CustomEvent('eyebridge:gaze', {
		detail: { x: 320, y: 240 },
	}),
)
```

Kirpma tetigi:

```js
window.dispatchEvent(new CustomEvent('eyebridge:blink'))
```

Gelistirme test modu:

- URL sonuna `?debugPointer=1` eklenirse pointer goz gibi kullanilir.
- `B` tusu kirpma simulasyonu yapar.

## Yol Haritasi

- Kalibrasyon profil altyapisi (global, klavye, sayfa, sosyal, oyun)
- Sticky focus tabanli standart etkilesim sistemi
- Standart sayfa bolgesi iskeleti
- MediaPipe ile gercek zamanli goz verisi iyilestirmeleri
- Supabase Auth ve hasta/yakin rol sistemi
- Cok dilli mesajlasma + ceviri servisi
- Sosyal paylasim akisi
- Gozle oynanabilir oyun modulleri
- Rozet/puan/seviye sistemi

## Katki Vermek Istiyorum

Kod yazmayi bilmesen bile katkida bulunabilirsin:

- Hata bildirimi ac
- Fikir/ozellik onerisi paylas
- UI/UX test geri bildirimi ver
- Dokumantasyon duzeltmeleri yap

Katki kurallari: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

Ozellikle sayfa, klavye, sosyal akis veya oyun gelistirecek katkicilar once [docs/INTERACTION_STANDARD.md](docs/INTERACTION_STANDARD.md) dosyasini okumak zorundadir.

## Lisans

Bu proje acik kaynaklidir. Ayrintilar icin [LICENSE](LICENSE) dosyasina bak.

---

# EyeBridge

EyeBridge is an open-source gaze-first communication platform designed for ICU patients who cannot easily move or speak.

## Why This Project Exists

Patients may lose speech or motor control without losing thought, emotion, or the need to communicate. EyeBridge aims to turn that need into a practical, low-cost, open-source system.

## Architecture Standard

EyeBridge now follows a standardized interaction architecture:

- a shared gaze engine for tracking and calibration
- context-specific calibration profiles for keyboard, page navigation, social, and games
- sticky focus for easier target acquisition
- fixed page zones for recurring actions

The official definition lives in [docs/INTERACTION_STANDARD.md](docs/INTERACTION_STANDARD.md).

## Language Support

All public-facing pages and fixed UI text must support six languages: `tr`, `en`, `de`, `es`, `fr`, `ru`.

Developer-facing documentation and plan files are maintained in Turkish and English.

## Contributor Note

Contributors building pages, keyboards, social modules, or games must read [docs/INTERACTION_STANDARD.md](docs/INTERACTION_STANDARD.md) before adding new UI.
