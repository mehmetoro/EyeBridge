# EyeBridge Etkilesim ve Kalibrasyon Standardi

Bu dokuman, EyeBridge icindeki tum sayfalar, moduller ve topluluk katkilarinin uymasi gereken temel etkilesim standardini tanimlar.

Amac:

- Hastanin piksel hassasiyetinde isabet ettirme zorunlulugunu azaltmak
- Gozle kullanimi sayfa bazli degil sistem bazli hale getirmek
- Tum yeni modulleri ortak davranis mantigina baglamak
- Oyun, sosyal alan, klavye ve genel sayfa gezinmesini tek prensip etrafinda standardize etmek

## 1. Temel Ilke

EyeBridge iki katmanda calisir:

1. Temel Gaze Motoru
- Kamera, gaze tahmini, genel manuel/otomatik kalibrasyon, titreşim azaltma, blink ve dwell mantigi.
- Bu katman tum uygulama icin ortak altyapidir.

2. Baglama Ozel Etkilesim Profili
- Klavye, genel sayfa, sosyal akis, oyun gibi farkli kullanim baglamlari icin ayri hedefleme ve kalibrasyon profilleri.
- Her profil kendi kalibrasyon verisini, tutunma ayarini ve standart yerlesimini kullanir.

## 2. Interaction Skills

EyeBridge icindeki her modül su skill setini esas almak zorundadir.

### Skill 1: Gaze Targeting
- Her etkilesimli hedef `data-gaze="true"` icermelidir.
- Hedefler buyuk, birbirinden uzak ve yuksek kontrastli olmalidir.
- Hasta, hedefin tam ortasini vurmak zorunda olmamalidir.

### Skill 2: Sticky Focus
- Kullanici hedefe yaklastiginda sistem hedefe tutunur.
- Odak, cok kucuk salinimlarda hemen kaybolmaz.
- Hedeften cikis icin giristen daha buyuk sapma gerekir.

### Skill 3: Blink Activation
- Secim icin esas aktivasyon goz kirpma veya dwell tamamlama ile olur.
- Fare tiklamasi yalnizca test ve bakici destegi icin fallback olarak kullanilabilir.

### Skill 4: Context Calibration
- Kalibrasyon tek tip degil, baglama ozel olabilir.
- Genel kullanim, klavye, sosyal ve oyun alanlari farkli profiller kullanabilir.

### Skill 5: Standard Layout Memory
- Kullanici her sayfada yeni bir kontrol cografyasi ogrenmek zorunda kalmamalidir.
- Ayni gorevler, ayni sayfa bolgelerinde kalmalidir.

### Skill 6: Low-Cognitive Navigation
- Az sayida, buyuk, net, sabit konumlu hedef tercih edilir.
- Gereksiz kontrol, ikon, sekme ve daginik hareket alanindan kacilmalidir.

## 3. Kalibrasyon Profilleri

Her profil bagimsiz saklanabilir ve yalniz kendi baglaminda aktif olur.

### 3.1 Global Automatic Calibration
- Tum uygulama icin genel otomatik kalibrasyon.
- Ekran genelinde hedef noktalarla calisir.
- Hizli ilk kurulum icin kullanilir.

### 3.2 Global Manual Calibration
- Tum uygulama icin genel manuel kalibrasyon.
- Kullanici istedigi kadar ornek verir, sonra bitirir.
- Temel fallback profilidir.

### 3.3 Keyboard Calibration
- Sadece klavye ekraninda gecerli olur.
- Kullanici istedigi harfleri, istedigi sirayla ornekleyebilir.
- Harf tuslari ve klavye aksiyon tuslari icin daha guclu sticky focus kullanilir.

### 3.4 Page Navigation Calibration
- Genel sayfa gezinme yapisi icin kullanilir.
- Kaydirma, ileri, geri, onay, iptal gibi sabit kontrol noktalarina odaklanir.
- Tum icerik sayfalari ayni bolgesel mantigi kullanir.

### 3.5 Social Calibration
- Sosyal akis icin kullanilir.
- Begen, yorum, paylas, sonraki gonderi, onceki gonderi gibi sosyal aksiyonlari kapsar.
- Genel sayfa yapisini bozmadan sosyal kontrol noktalari eklenir.

### 3.6 Game Calibration
- Oyunlar icin baglama ozel profildir.
- Oyun ici hedefleme ve oyun sayfasi gezinmesi ayni standardi kullanir.
- Oyun ailesine gore ayri alt profiller tanimlanabilir.

## 4. Standart Sayfa Bolgeleri

Tum sayfa tasarimlarinda asagidaki bolgesel mantik korunmalidir.

### Zorunlu Navigasyon Bolgeleri
- Sol ust: geri veya cikis
- Sag ust: ana menu veya ana aksiyon
- Sol alt: onceki
- Sag alt: sonraki
- Alt orta: asagi kaydir
- Alt orta ustu: yukari kaydir
- Orta sag: onay veya devam
- Orta sol: iptal veya geri don

Bu bolgeler proje genelinde sabit kalmalidir. Yeni sayfa yapan gelistirici, bu cografyayi bozacak yeni kontrol yerlestirmemelidir.

## 5. Klavye Standardi

Klavye ekranlari su kurallara uymak zorundadir:

- Klavye ekrani mumkun oldugunca tam ekran kullanir.
- Metin alani dar ama okunakli olur.
- Tuslar buyuk, esit ve aralikli olur.
- Sticky focus, genel sayfaya gore daha guclu olur.
- Klavye kalibrasyonu yalniz klavye ekraninda etkinlesir.
- Harf secimi icin kullaniciya tam orta hassasiyeti gerektirilmez.

## 6. Sosyal Ekran Standardi

Sosyal ekranlar su kontrollere odaklanir:

- Begen
- Yorum
- Paylas
- Sonraki gonderi
- Onceki gonderi
- Geri
- Ana menu

Bu aksiyonlar sabit bolgelerde tutulmalidir. Sosyal akis tasarimi, kart bazli ama dusuk kontrol yogunluklu olmalidir.

## 7. Oyun Standardi

Toplulugun gelistirdigi her oyun su kurallara uymak zorundadir:

- Oyun sadece gaze, dwell ve blink ile oynanabilir olmali
- Oyun arayuzu buyuk hedeflere dayanmali
- Oyun navigasyonu standart sayfa bolgelerini bozmamali
- Oyun ici hedefler ile menuler farkli davranis profiline sahip olabilmeli
- Oyun, hassas nişan istemek yerine bolge hedefleme mantigi kullanmali

## 8. Gelistirici Zorunluluklari

Yeni ekran, modül veya oyun ekleyen herkes sunlari uygulamak zorundadir:

1. Standart bolgesel yerlesime uy
2. `data-gaze` ve `data-blink-action` kurallarini bozma
3. Sticky focus mantigini by-pass etme
4. Baglama ozel kalibrasyon gerekiyorsa ilgili profil tipini kullan
5. Yeni kontrol ekliyorsan neden standart bolgelerle cozumlenemedigini belgele

## 9. Dil ve Disa Acik Sayfa Standardi

Gelistiriciye yonelik dokumanlar ve plan dosyalari Turkce ve Ingilizce olarak sunulmak zorundadir.

Disa acik tum sayfalar su 6 dili desteklemek zorundadir:

- Turkce (`tr`)
- Ingilizce (`en`)
- Almanca (`de`)
- Ispanyolca (`es`)
- Fransizca (`fr`)
- Rusca (`ru`)

- Ana sayfa
- Tanitim sayfalari
- Yardim ve kurulum sayfalari
- Topluluk ve katki sayfalari
- Sosyal, oyun ve genel gezinme ekranlarinin kullaniciya gorunen sabit metinleri

Kurallar:

1. Yeni eklenen her disa acik ekranin `tr`, `en`, `de`, `es`, `fr`, `ru` metinleri ayni anda hazirlanir.
2. Bir ozellik yalnizca tek dilde birakilamaz.
3. Katki yapan gelistirici, ekledigi sabit metinlerin 6 dilde karsiligini saglamak zorundadir.
4. Oyun gelistiricileri dahil tum katkicilar, oyun ici sabit UI metinlerini de 6 dilde vermelidir.
5. Varsayilan dil Turkce olabilir, ancak diger 5 dil secenegi her zaman mevcut olmalidir.

## 10. Uygulama Plani

Bu standardin koda gecis sirasi:

1. Mevcut genel manuel/otomatik kalibrasyonu koru
2. Kalibrasyon profil altyapisini ekle
3. Klavye kalibrasyonunu ilk baglama ozel profil olarak uygula
4. Standart sayfa gezinme iskeletini kur
5. Sosyal profil ve sosyal sayfa standardini ekle
6. Oyun profili ve oyun gelistirme standardini ekle

## 11. Acik Kaynak Katki Notu

EyeBridge acik kaynakli bir projedir. Bu nedenle davranis standardi sadece kodda degil dokumantasyonda da acik ve zorunlu olmalidir. Katki yapan herkes, ozellikle oyun gelistiricileri, bu dokumana gore hareket etmelidir.

---

# EyeBridge Interaction and Calibration Standard

This document defines the mandatory interaction standard for all EyeBridge pages, modules, and open-source contributions.

## 1. Core Principle

EyeBridge works in two layers:

1. Core Gaze Engine
- Camera access, gaze estimation, global manual/automatic calibration, jitter reduction, blink, and dwell behavior.
- This layer is shared by the whole application.

2. Context-Specific Interaction Profile
- Keyboard, page navigation, social feed, and game contexts can use separate calibration and targeting profiles.
- Each profile can keep its own calibration data, adhesion level, and layout rules.

## 2. Interaction Skills

- Gaze Targeting: the patient must not be forced to hit the exact center of a target.
- Sticky Focus: when the user gets close to a target, the system holds onto it.
- Blink Activation: blink or dwell completion remains the primary selection method.
- Context Calibration: each surface may use its own calibration profile.
- Standard Layout Memory: recurring actions must stay in the same zones.
- Low-Cognitive Navigation: a small number of large, stable, high-contrast targets is preferred.

## 3. Calibration Profiles

- Global Automatic Calibration
- Global Manual Calibration
- Keyboard Calibration
- Page Navigation Calibration
- Social Calibration
- Game Calibration

## 4. Standard Page Zones

- Top left: back or exit
- Top right: main menu or primary action
- Bottom left: previous
- Bottom right: next
- Bottom center: scroll down
- Above bottom center: scroll up
- Mid right: confirm / continue
- Mid left: cancel / go back

## 5. Language Standard

Developer-facing documentation and plan files must be bilingual in Turkish and English.

All public-facing pages must support these six languages:

- Turkish (`tr`)
- English (`en`)
- German (`de`)
- Spanish (`es`)
- French (`fr`)
- Russian (`ru`)

Rules:

1. New public-facing UI must ship with all six language strings.
2. Features cannot remain single-language.
3. Contributors must provide six-language equivalents for fixed UI text.
4. Game contributors must also localize in-game fixed UI text.

## 6. Contributor Obligation

Anyone adding a page, module, or game must follow this standard. Designs that break the standard page zones, sticky focus logic, or profile-based calibration model are not accepted.