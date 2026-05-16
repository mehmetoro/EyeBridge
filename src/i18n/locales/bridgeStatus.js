const BRIDGE_STATUS_CONTENT = {
  tr: {
    status: {
      cameraDisconnected: 'Kamera bagli degil',
      cameraUnsupported: 'Bu cihazda kamera erisimi desteklenmiyor',
      cameraPaused: 'Kamera duraklatildi',
      detectionError: 'Algilama hatasi',
      cameraStarting: 'Kamera baslatiliyor...',
      cameraActive: 'Kamera aktif - goz takibi basladi',
      cameraStartFailed: 'Kamera baslatilamadi',
      calibrationReset: 'Kalibrasyon sifirlandi',
      calibrationMode: 'Kalibrasyon modu: noktaya bakip kirpin',
      calibrationUpdated: 'Kalibrasyon guncellendi: {quality} ({points} nokta)',
      calibrationPointCaptured: 'Kalibrasyon noktasi alindi ({points})',
      directionChanged: 'Kamera aktif - goz takibi basladi | Yon: {direction}',
      manualStarted: 'Manuel kalibrasyon basladi',
      manualPointCaptured: 'Nokta kaydedildi ({points} ornek)',
      manualUpdated: 'Manuel kalibrasyon guncellendi',
      manualCompleted: 'Manuel kalibrasyon tamamlandi',
      manualReset: 'Manuel kalibrasyon sifirlandi',
    },
    quality: {
      good: 'Iyi',
      medium: 'Orta',
      low: 'Dusuk',
      unknown: 'Bilinmiyor',
      none: 'Kalibrasyon yok',
      started: 'Kalibrasyon basladi',
      collecting: 'Nokta toplaniyor',
      score: '{quality} ({score}/100)',
      manualCollecting: 'Manuel kalibrasyon: ornek toplaniyor',
      manualSamples: 'Manuel kalibrasyon: {points} ornek',
      manualReady: 'Manuel: {points} ornek hazir',
      manualScore: 'Manuel: {score}/100 ({points} ornek)',
      manualReset: 'Manuel kalibrasyon sifirlandi',
      directionNormal: 'Normal',
      directionInverted: 'Ters',
    },
  },
  en: {
    status: {
      cameraDisconnected: 'Camera not connected',
      cameraUnsupported: 'Camera access is not supported on this device',
      cameraPaused: 'Camera paused',
      detectionError: 'Detection error',
      cameraStarting: 'Starting camera...',
      cameraActive: 'Camera active - gaze tracking started',
      cameraStartFailed: 'Camera could not be started',
      calibrationReset: 'Calibration reset',
      calibrationMode: 'Calibration mode: focus on the point and blink',
      calibrationUpdated: 'Calibration updated: {quality} ({points} points)',
      calibrationPointCaptured: 'Calibration point captured ({points})',
      directionChanged: 'Camera active - gaze tracking started | Direction: {direction}',
      manualStarted: 'Manual calibration started',
      manualPointCaptured: 'Point saved ({points} samples)',
      manualUpdated: 'Manual calibration updated',
      manualCompleted: 'Manual calibration completed',
      manualReset: 'Manual calibration reset',
    },
    quality: {
      good: 'Good',
      medium: 'Medium',
      low: 'Low',
      unknown: 'Unknown',
      none: 'No calibration',
      started: 'Calibration started',
      collecting: 'Collecting points',
      score: '{quality} ({score}/100)',
      manualCollecting: 'Manual calibration: collecting samples',
      manualSamples: 'Manual calibration: {points} samples',
      manualReady: 'Manual: {points} samples ready',
      manualScore: 'Manual: {score}/100 ({points} samples)',
      manualReset: 'Manual calibration reset',
      directionNormal: 'Normal',
      directionInverted: 'Inverted',
    },
  },
  de: {
    status: {
      cameraDisconnected: 'Kamera nicht verbunden',
      cameraUnsupported: 'Kamerazugriff wird auf diesem Geraet nicht unterstuetzt',
      cameraPaused: 'Kamera pausiert',
      detectionError: 'Erkennungsfehler',
      cameraStarting: 'Kamera wird gestartet...',
      cameraActive: 'Kamera aktiv - Blickverfolgung gestartet',
      cameraStartFailed: 'Kamera konnte nicht gestartet werden',
      calibrationReset: 'Kalibrierung zurueckgesetzt',
      calibrationMode: 'Kalibrierungsmodus: auf den Punkt schauen und blinzeln',
      calibrationUpdated: 'Kalibrierung aktualisiert: {quality} ({points} Punkte)',
      calibrationPointCaptured: 'Kalibrierungspunkt erfasst ({points})',
      directionChanged: 'Kamera aktiv - Blickverfolgung gestartet | Richtung: {direction}',
      manualStarted: 'Manuelle Kalibrierung gestartet',
      manualPointCaptured: 'Punkt gespeichert ({points} Proben)',
      manualUpdated: 'Manuelle Kalibrierung aktualisiert',
      manualCompleted: 'Manuelle Kalibrierung abgeschlossen',
      manualReset: 'Manuelle Kalibrierung zurueckgesetzt',
    },
    quality: {
      good: 'Gut',
      medium: 'Mittel',
      low: 'Niedrig',
      unknown: 'Unbekannt',
      none: 'Keine Kalibrierung',
      started: 'Kalibrierung gestartet',
      collecting: 'Punkte werden gesammelt',
      score: '{quality} ({score}/100)',
      manualCollecting: 'Manuelle Kalibrierung: Proben werden gesammelt',
      manualSamples: 'Manuelle Kalibrierung: {points} Proben',
      manualReady: 'Manuell: {points} Proben bereit',
      manualScore: 'Manuell: {score}/100 ({points} Proben)',
      manualReset: 'Manuelle Kalibrierung zurueckgesetzt',
      directionNormal: 'Normal',
      directionInverted: 'Umgekehrt',
    },
  },
  es: {
    status: {
      cameraDisconnected: 'Camara no conectada',
      cameraUnsupported: 'El acceso a la camara no es compatible en este dispositivo',
      cameraPaused: 'Camara en pausa',
      detectionError: 'Error de deteccion',
      cameraStarting: 'Iniciando camara...',
      cameraActive: 'Camara activa - seguimiento ocular iniciado',
      cameraStartFailed: 'No se pudo iniciar la camara',
      calibrationReset: 'Calibracion reiniciada',
      calibrationMode: 'Modo de calibracion: mira el punto y parpadea',
      calibrationUpdated: 'Calibracion actualizada: {quality} ({points} puntos)',
      calibrationPointCaptured: 'Punto de calibracion capturado ({points})',
      directionChanged: 'Camara activa - seguimiento ocular iniciado | Direccion: {direction}',
      manualStarted: 'Calibracion manual iniciada',
      manualPointCaptured: 'Punto guardado ({points} muestras)',
      manualUpdated: 'Calibracion manual actualizada',
      manualCompleted: 'Calibracion manual completada',
      manualReset: 'Calibracion manual reiniciada',
    },
    quality: {
      good: 'Buena',
      medium: 'Media',
      low: 'Baja',
      unknown: 'Desconocida',
      none: 'Sin calibracion',
      started: 'Calibracion iniciada',
      collecting: 'Recolectando puntos',
      score: '{quality} ({score}/100)',
      manualCollecting: 'Calibracion manual: recolectando muestras',
      manualSamples: 'Calibracion manual: {points} muestras',
      manualReady: 'Manual: {points} muestras listas',
      manualScore: 'Manual: {score}/100 ({points} muestras)',
      manualReset: 'Calibracion manual reiniciada',
      directionNormal: 'Normal',
      directionInverted: 'Invertida',
    },
  },
  fr: {
    status: {
      cameraDisconnected: 'Camera non connectee',
      cameraUnsupported: 'L acces a la camera n est pas pris en charge sur cet appareil',
      cameraPaused: 'Camera en pause',
      detectionError: 'Erreur de detection',
      cameraStarting: 'Demarrage de la camera...',
      cameraActive: 'Camera active - suivi du regard demarre',
      cameraStartFailed: 'La camera n a pas pu demarrer',
      calibrationReset: 'Calibration reinitialisee',
      calibrationMode: 'Mode calibration : regardez le point et clignez',
      calibrationUpdated: 'Calibration mise a jour : {quality} ({points} points)',
      calibrationPointCaptured: 'Point de calibration capture ({points})',
      directionChanged: 'Camera active - suivi du regard demarre | Direction : {direction}',
      manualStarted: 'Calibration manuelle demarree',
      manualPointCaptured: 'Point enregistre ({points} echantillons)',
      manualUpdated: 'Calibration manuelle mise a jour',
      manualCompleted: 'Calibration manuelle terminee',
      manualReset: 'Calibration manuelle reinitialisee',
    },
    quality: {
      good: 'Bonne',
      medium: 'Moyenne',
      low: 'Faible',
      unknown: 'Inconnue',
      none: 'Aucune calibration',
      started: 'Calibration demarree',
      collecting: 'Collecte des points',
      score: '{quality} ({score}/100)',
      manualCollecting: 'Calibration manuelle : collecte des echantillons',
      manualSamples: 'Calibration manuelle : {points} echantillons',
      manualReady: 'Manuel : {points} echantillons prets',
      manualScore: 'Manuel : {score}/100 ({points} echantillons)',
      manualReset: 'Calibration manuelle reinitialisee',
      directionNormal: 'Normale',
      directionInverted: 'Inversee',
    },
  },
  ru: {
    status: {
      cameraDisconnected: 'Kamera ne podklyuchena',
      cameraUnsupported: 'Dostup k kamere ne podderzhivaetsya na etom ustroistve',
      cameraPaused: 'Kamera na pauze',
      detectionError: 'Oshibka raspoznavaniya',
      cameraStarting: 'Zapusk kamery...',
      cameraActive: 'Kamera aktivna - slezhka vzglyada zapushchena',
      cameraStartFailed: 'Ne udalos zapustit kameru',
      calibrationReset: 'Kalibrovka sbroshena',
      calibrationMode: 'Rezhim kalibrovki: smotri na tochku i morgai',
      calibrationUpdated: 'Kalibrovka obnovlena: {quality} ({points} tochek)',
      calibrationPointCaptured: 'Tochka kalibrovki poluchena ({points})',
      directionChanged: 'Kamera aktivna - slezhka vzglyada zapushchena | Napravlenie: {direction}',
      manualStarted: 'Manualnaya kalibrovka nachata',
      manualPointCaptured: 'Tochka sohranena ({points} primerov)',
      manualUpdated: 'Manualnaya kalibrovka obnovlena',
      manualCompleted: 'Manualnaya kalibrovka zavershena',
      manualReset: 'Manualnaya kalibrovka sbroshena',
    },
    quality: {
      good: 'Horoshaya',
      medium: 'Srednyaya',
      low: 'Nizkaya',
      unknown: 'Neizvestno',
      none: 'Kalibrovki net',
      started: 'Kalibrovka nachata',
      collecting: 'Sobirayutsya tochki',
      score: '{quality} ({score}/100)',
      manualCollecting: 'Manualnaya kalibrovka: sobirayutsya primery',
      manualSamples: 'Manualnaya kalibrovka: {points} primerov',
      manualReady: 'Manualno: {points} primerov gotovo',
      manualScore: 'Manualno: {score}/100 ({points} primerov)',
      manualReset: 'Manualnaya kalibrovka sbroshena',
      directionNormal: 'Normalnoe',
      directionInverted: 'Invertirovano',
    },
  },
}

function formatTemplate(template, values = {}) {
  return Object.entries(values).reduce(
    (output, [key, value]) => output.replaceAll(`{${key}}`, String(value ?? '')),
    template,
  )
}

function getLocaleContent(locale) {
  return BRIDGE_STATUS_CONTENT[locale] || BRIDGE_STATUS_CONTENT.en
}

export function formatBridgeStatus(locale, statusMeta) {
  const copy = getLocaleContent(locale)
  if (!statusMeta?.key) return copy.status.cameraDisconnected

  const template = copy.status[statusMeta.key]
  if (!template) return copy.status.cameraDisconnected

  const values = { ...(statusMeta.params || {}) }
  if (values.qualityKey) {
    values.quality = copy.quality[values.qualityKey] || copy.quality.unknown
  }
  if (values.directionKey) {
    values.direction = values.directionKey === 'inverted' ? copy.quality.directionInverted : copy.quality.directionNormal
  }

  return formatTemplate(template, values)
}

export function formatCalibrationQuality(locale, qualityMeta) {
  const copy = getLocaleContent(locale)
  if (!qualityMeta?.key) return copy.quality.none

  switch (qualityMeta.key) {
    case 'score':
      return formatTemplate(copy.quality.score, {
        quality: copy.quality[qualityMeta.qualityKey] || copy.quality.unknown,
        score: qualityMeta.score,
      })
    case 'manualSamples':
      return formatTemplate(copy.quality.manualSamples, { points: qualityMeta.points })
    case 'manualReady':
      return formatTemplate(copy.quality.manualReady, { points: qualityMeta.points })
    case 'manualScore':
      return formatTemplate(copy.quality.manualScore, { score: qualityMeta.score, points: qualityMeta.points })
    default:
      return copy.quality[qualityMeta.key] || copy.quality.none
  }
}