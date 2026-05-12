# EyeBridge Projesi - Copilot Instructions

## Proje Hakkında
EyeBridge, yoğun bakımdaki hastalar için göz takipli bir iletişim ve sosyal platformdur. Kullanıcılar fare veya dokunmatik ekran KULLANAMAZ. Sadece göz hareketleri ve göz kırpma ile etkileşim kurabilirler.

## ZORUNLU KURALLAR (Kesinlikle Uyulmalı)

### 1. Tüm Etkileşimler Göz Tabanlı Olmalı
- ASLA fare tıklaması (`onClick`, `onMouseDown`) bekleyen bir element tasarlama.
- ASLA `hover` efektlerine güvenme (göz imleci "hover" kavramını desteklemez).
- Tüm butonlar, harfler, kontroller `data-gaze` attribute'ü içermeli ve göz imleci ile seçilebilir olmalı.

### 2. Göz Kırpma = Tıklama (Click)
- Kullanıcı gözünü kırptığında, o an imlecin altındaki element TIKLANMIŞ sayılır.
- Göz kırpma algılama süresi: 3 saniyeden uzun bakmak SAYILMAZ. Göz kırpma (kapat-aç) hızlı olmalı.
- `data-blink-action` attribute'ü olan elementler göz kırpmaya tepki verir.

### 3. Bakış (Gaze) ile Gezinme
- Kullanıcı ekranda bir yere baktığında, o element "odaklanmış" (focused) gibi görünmeli.
- Odaklanan elementin etrafında KALIN ve YÜKSEK KONTRASTLI bir çerçeve olmalı.
- Bu çerçeve renkli ve kalın olmalı (en az 4px), çünkü görme engelli veya kısıtlı hastalar için.

### 4. Tuş Boyutları ve Yerleşim
- Tüm tıklanabilir elementler EN AZ 80x80 piksel olmalı.
- Tuşlar arasında EN AZ 20 piksel boşluk olmalı (yanlış seçimi önlemek için).
- Klavye tuşları standart QWERTY yerine, sık kullanılan harfler merkeze yakın olacak şekilde düzenlenmeli (göz yorgunluğunu azaltmak için).

### 5. Görsel Geri Bildirim (Feedback)
- Göz kırpma ile bir şey seçildiğinde, EKRANIN HERHANGİ BİR YERİNDE gözle görülür bir efekt olmalı (örneğin ekranın kenarı yeşil yanıp söner).
- Hata durumunda (örn. yanlış harf seçimi) kırmızı yanıp sönme veya titreme olmalı.
- SESLİ GERİ BİLDİRİM de olmalı (Web Speech API ile kısa bir "bip" veya seçilen harfin okunması).

### 6. Yazı Boyutları
- Tüm metinler EN AZ 28px olmalı.
- Başlıklar EN AZ 48px olmalı.
- Tercihen "sans-serif" fontlar kullan (Arial, Roboto, Open Sans) - daha okunaklı.

### 7. Süre Bekleme (Timeout) Mekanizmaları
- Eğer kullanıcı 10 saniye boyunca hiç göz kırpmaz veya bakışını hareket ettirmezse, ekrana "Yardım istiyor musunuz?" butonu gelmeli.
- Otomatik seçim (dwell-click) süresi en az 2 saniye olmalı, tercihen kullanıcı ayarlanabilir.

## TEKNOLOJİLER
- Göz takibi: WebGazer.js veya MediaPipe Face Mesh
- Seslendirme: Web Speech API
- Veritabanı: Supabase
- Çeviri: LibreTranslate (Hugging Face üzerinde)
- Hosting: Vercel

## RENK PALETİ
- Yüksek kontrastlı renkler kullan: Siyah (#000000) arka plana açık sarı (#FFFF00) veya beyaz metin
- Odaklanan element: Kalın YEŞİL (#00FF00) çerçeve
- Hata/Kırmızı: #FF0000
- Başarı/Mavi: #0088FF

## ÖRNEK KOD ŞABLONU (React Bileşeni)

```jsx
// DOĞRU: Göz tabanlı buton
const EyeButton = ({ children, onBlink, gazeData }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    // gazeData, WebGazer.js'den gelen anlık bakış pozisyonu
    if (gazeData && isPointInsideElement(gazeData, elementRef.current)) {
      setIsFocused(true);
    } else {
      setIsFocused(false);
    }
  }, [gazeData]);
  
  return (
    <button
      ref={elementRef}
      className={`eye-button ${isFocused ? 'focused' : ''}`}
      data-blink-action="true"
      onClick={() => {}} // ASLA fare tıklamasına güvenme! Bu sadece test için.
      style={{
        minWidth: '80px',
        minHeight: '80px',
        fontSize: '32px',
        border: isFocused ? '4px solid #00FF00' : '2px solid #FFFFFF',
        backgroundColor: '#000000',
        color: '#FFFFFF',
      }}
    >
      {children}
    </button>
  );
};