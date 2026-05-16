export const CALIBRATION_PROFILES = {
  'global-auto': {
    key: 'global-auto',
    label: { tr: 'Genel Otomatik', en: 'Global Automatic', de: 'Global Automatisch', es: 'Global Automatico', fr: 'Global Automatique', ru: 'Globalnaya Avtomaticheskaya' },
    description: {
      tr: 'Tum uygulama icin hizli otomatik kalibrasyon.',
      en: 'Fast automatic calibration for the whole app.',
      de: 'Schnelle automatische Kalibrierung fuer die gesamte App.',
      es: 'Calibracion automatica rapida para toda la aplicacion.',
      fr: 'Calibration automatique rapide pour toute l application.',
      ru: 'Bystraya avtomaticheskaya kalibrovka dlya vsego prilozheniya.',
    },
  },
  'global-manual': {
    key: 'global-manual',
    label: { tr: 'Genel Manuel', en: 'Global Manual', de: 'Global Manuell', es: 'Global Manual', fr: 'Global Manuel', ru: 'Globalnaya Manualnaya' },
    description: {
      tr: 'Tum uygulama icin elle ornek toplanan kalibrasyon.',
      en: 'Manual sample-based calibration for the whole app.',
      de: 'Manuelle, stichprobenbasierte Kalibrierung fuer die gesamte App.',
      es: 'Calibracion manual basada en muestras para toda la aplicacion.',
      fr: 'Calibration manuelle basee sur des echantillons pour toute l application.',
      ru: 'Manualnaya kalibrovka na osnove primerov dlya vsego prilozheniya.',
    },
  },
  'keyboard-manual': {
    key: 'keyboard-manual',
    label: { tr: 'Klavye Kalibrasyonu', en: 'Keyboard Calibration', de: 'Tastatur Kalibrierung', es: 'Calibracion de Teclado', fr: 'Calibration du Clavier', ru: 'Kalibrovka Klaviatury' },
    description: {
      tr: 'Sadece klavye ekraninda kullanilan hedef profili.',
      en: 'Targeting profile used only on the keyboard screen.',
      de: 'Zielfokusprofil nur fuer den Tastaturbildschirm.',
      es: 'Perfil de objetivo usado solo en la pantalla del teclado.',
      fr: 'Profil de ciblage utilise uniquement sur l ecran clavier.',
      ru: 'Profil navedenia, ispolzuemyi tolko na ekrane klaviatury.',
    },
  },
  'page-manual': {
    key: 'page-manual',
    label: { tr: 'Sayfa Gezinme', en: 'Page Navigation', de: 'Seitennavigation', es: 'Navegacion de Pagina', fr: 'Navigation de Page', ru: 'Navigaciya po Stranice' },
    description: {
      tr: 'Genel sayfa gezinme butonlari icin profil.',
      en: 'Profile for general page navigation controls.',
      de: 'Profil fuer allgemeine Seitennavigationssteuerungen.',
      es: 'Perfil para controles generales de navegacion de pagina.',
      fr: 'Profil pour les commandes generales de navigation de page.',
      ru: 'Profil dlya obshchih elementov navigacii po stranice.',
    },
  },
  'social-manual': {
    key: 'social-manual',
    label: { tr: 'Sosyal Kalibrasyon', en: 'Social Calibration', de: 'Soziale Kalibrierung', es: 'Calibracion Social', fr: 'Calibration Sociale', ru: 'Socialnaya Kalibrovka' },
    description: {
      tr: 'Begen, yorum ve paylas aksiyonlari icin profil.',
      en: 'Profile for like, comment, and share actions.',
      de: 'Profil fuer Liken, Kommentieren und Teilen.',
      es: 'Perfil para acciones de me gusta, comentar y compartir.',
      fr: 'Profil pour les actions aimer, commenter et partager.',
      ru: 'Profil dlya deistvii laik, kommentarii i podelitsya.',
    },
  },
  'game-manual': {
    key: 'game-manual',
    label: { tr: 'Oyun Kalibrasyonu', en: 'Game Calibration', de: 'Spiel Kalibrierung', es: 'Calibracion de Juego', fr: 'Calibration de Jeu', ru: 'Kalibrovka Igry' },
    description: {
      tr: 'Oyun sayfasi ve oyun ici hedefler icin profil.',
      en: 'Profile for game pages and in-game targets.',
      de: 'Profil fuer Spielseiten und Ziele im Spiel.',
      es: 'Perfil para paginas de juego y objetivos dentro del juego.',
      fr: 'Profil pour les pages de jeu et les cibles en jeu.',
      ru: 'Profil dlya igrovyh stranic i celei vnutri igry.',
    },
  },
}

export const SURFACE_PROFILE_MAP = {
  home: 'page-manual',
  keyboard: 'keyboard-manual',
  navigation: 'page-manual',
  social: 'social-manual',
  games: 'game-manual',
}

export const SURFACE_ORDER = ['home', 'keyboard', 'navigation', 'social', 'games']

export function getCalibrationProfileForSurface(surfaceKey) {
  const profileKey = SURFACE_PROFILE_MAP[surfaceKey] || 'global-manual'
  return CALIBRATION_PROFILES[profileKey]
}