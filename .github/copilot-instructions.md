# EyeBridge Projesi - Copilot Instructions

## Proje Hakkında
EyeBridge, yoğun bakımdaki hastalar için göz takipli bir iletişim ve sosyal platformdur. Kullanıcılar fare veya dokunmatik ekran KULLANAMAZ. Sadece göz hareketleri ve göz kırpma ile etkileşim kurabilirler.

## ZORUNLU KURALLAR (Kesinlikle Uyulmalı)

### 1. Tüm Etkileşimler Göz Tabanlı Olmalı
- ASLA fare tıklaması (`onClick`, `onMouseDown`) bekleyen bir element tasarlama.
- ASLA `hover` efektlerine güvenme.
- Tüm butonlar, harfler, kontroller `data-gaze` attribute'ü içermeli.

### 2. Göz Kırpma = Tıklama (Click)
- Kullanıcı gözünü kırptığında, o an imlecin altındaki element TIKLANMIŞ sayılır.
- `data-blink-action` attribute'ü olan elementler göz kırpmaya tepki verir.

### 3. Tuş Boyutları ve Yerleşim
- Tüm tıklanabilir elementler EN AZ 80x80 piksel olmalı.
- Tuşlar arasında EN AZ 20 piksel boşluk olmalı.

### 4. Görsel Geri Bildirim (Feedback)
- Göz kırpma ile bir şey seçildiğinde, ekranın kenarı yeşil yanıp söner.
- Hata durumunda (örn. yanlış harf seçimi) kırmızı yanıp sönme olmalı.
- SESLİ GERİ BİLDİRİM de olmalı (Web Speech API ile kısa bir "bip").

### 5. Yazı Boyutları
- Tüm metinler EN AZ 28px olmalı.
- Başlıklar EN AZ 48px olmalı.
- Sans-serif fontlar kullan (Arial, Roboto, Open Sans).

## RENK PALETİ
- Arka plan: Siyah (#000000)
- Metin: Beyaz (#FFFFFF) veya Açık Sarı (#FFFF00)
- Odaklanan element: Kalın YEŞİL (#00FF00) çerçeve
- Hata: Kırmızı (#FF0000)
- Başarı: Mavi (#0088FF)

## ÖRNEK KOD (React Bileşeni)

\`\`\`jsx
const EyeButton = ({ children, onBlink, isFocused }) => {
  return (
    <button
      className={`eye-button ${isFocused ? 'focused' : ''}`}
      data-blink-action="true"
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
\`\`\`

## YANLIŞ KULLANIM ÖRNEKLERİ (ASLA YAPMA)

\`\`\`jsx
// YANLIŞ: Fare hover kullanma
<button onMouseEnter={handleHover}>Yanlış</button>

// YANLIŞ: Küçük butonlar
<button style={{ width: '30px', height: '30px' }}>X</button>

// YANLIŞ: Sadece fare tıklamasını dinleme
<button onClick={handleClick}>Tıkla</button>
\`\`\`