import { useCallback, useEffect, useRef, useState } from 'react'
import { useGazeInteraction } from './hooks/useGazeInteraction'
import { getCalibrationProfileForSurface, SURFACE_ORDER } from './hooks/useCalibrationProfiles'
import { useWebGazerBridge } from './hooks/useWebGazerBridge'
import { formatCalibrationQuality } from './i18n/locales/bridgeStatus'
import { APP_CONTENT, LOCALE_LABELS, SUPPORTED_LOCALES } from './i18n/locales/appContent'
import { getSurfaceUi } from './i18n/locales/surfaceUi'
import GamesPage from './pages/GamesPage'
import GameDetailPage from './pages/GameDetailPage'
import HomePage from './pages/HomePage'
import KeyboardPage from './pages/KeyboardPage'
import NavigationPage from './pages/NavigationPage'
import SocialPage from './pages/SocialPage'
import SocialDetailPage from './pages/SocialDetailPage'
import CameraPreview from './components/CameraPreview'
import './App.css'

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['SPACE', 'BACKSPACE', 'SPEAK', 'CLEAR'],
]

const EXAMPLE_POSTS = [
  { id: 1, author: 'Ahmet B.', time: '2 saat önce', content: 'Bugün harika bir gün oldu! Güneş açıldı ve hava çok güzel.', likes: 12, stats: '12 beğeni, 3 yorum' },
  { id: 2, author: 'Ayşe K.', time: '4 saat önce', content: 'Yeni bir kitap başladım. Çok heyecan verici!', likes: 8, stats: '8 beğeni, 2 yorum' },
  { id: 3, author: 'Mehmet Y.', time: '6 saat önce', content: 'Doktor randevusu gitti. Çok iyi sonuçlar!', likes: 15, stats: '15 beğeni, 5 yorum' },
  { id: 4, author: 'Fatma Ş.', time: '8 saat önce', content: 'Ailemi çok özledim. Görüştüğümde çok mutlu oldum.', likes: 20, stats: '20 beğeni, 8 yorum' },
  { id: 5, author: 'Can T.', time: '10 saat önce', content: 'Müzik dinlemeyi çok seviyorum. En sevdiğim şarkıyı paylaşıyorum.', likes: 10, stats: '10 beğeni, 4 yorum' },
  { id: 6, author: 'Leyla D.', time: '12 saat önce', content: 'Hekim ekibim çok ilgileniyor. Kendimi iyi hissediyorum.', likes: 18, stats: '18 beğeni, 6 yorum' },
  { id: 7, author: 'Emre S.', time: '14 saat önce', content: 'Bugün Video izledim. Çok güzeldi!', likes: 7, stats: '7 beğeni, 2 yorum' },
  { id: 8, author: 'Serin K.', time: '16 saat önce', content: 'Aile telefon görüşmesi yaptık. Hepsi iyi.', likes: 11, stats: '11 beğeni, 3 yorum' },
]

const EXAMPLE_GAMES = [
  { id: 1, name: 'Hızlı Tuşlar', summary: 'Doğru tuşa hızlıca basıyorsunuz', type: 'timing' },
  { id: 2, name: 'Bellek Oyunu', summary: 'Desenleri hatırlamaya çalışın', type: 'memory' },
  { id: 3, name: 'Renk Eşleştirme', summary: 'Aynı renkli çiftleri bulun', type: 'matching' },
  { id: 4, name: 'Sayı Oyunu', summary: 'Sayıları sırayla bulun', type: 'sequence' },
  { id: 5, name: 'Sözleştirme', summary: 'Kelimeleri eşleştirin', type: 'words' },
  { id: 6, name: 'Tepki Testi', summary: 'Ne kadar hızlı tepki verirsiniz', type: 'reaction' },
]

const CALIBRATION_POINTS = [
  { x: 0.5, y: 0.5, labelKey: 'center' },
  { x: 0.06, y: 0.06, labelKey: 'topLeft' },
  { x: 0.94, y: 0.06, labelKey: 'topRight' },
  { x: 0.06, y: 0.94, labelKey: 'bottomLeft' },
  { x: 0.94, y: 0.94, labelKey: 'bottomRight' },
  { x: 0.5, y: 0.06, labelKey: 'topCenter' },
  { x: 0.5, y: 0.94, labelKey: 'bottomCenter' },
  { x: 0.06, y: 0.5, labelKey: 'leftCenter' },
  { x: 0.94, y: 0.5, labelKey: 'rightCenter' },
  { x: 0.25, y: 0.25, labelKey: 'innerTopLeft' },
  { x: 0.75, y: 0.25, labelKey: 'innerTopRight' },
  { x: 0.25, y: 0.75, labelKey: 'innerBottomLeft' },
  { x: 0.75, y: 0.75, labelKey: 'innerBottomRight' },
]

const MANUAL_CALIBRATION_MIN_POINTS = 5

function App() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState(APP_CONTENT.tr.ui.initialStatus)
  const [locale, setLocale] = useState('tr')
  const [activeSurface, setActiveSurface] = useState('home')
  const [activeSocialPost, setActiveSocialPost] = useState(null)
  const [activeGame, setActiveGame] = useState(null)
  const [socialPage, setSocialPage] = useState(0)
  const [gamesPage, setGamesPage] = useState(0)
  const [autoStartTried, setAutoStartTried] = useState(false)
  const [keyboardDwellMs, setKeyboardDwellMs] = useState(1000)
  const [keyboardStickiness, setKeyboardStickiness] = useState(100)
  const [calibrationActive, setCalibrationActive] = useState(false)
  const [calibrationStep, setCalibrationStep] = useState(0)
  const [manualCalibrationActive, setManualCalibrationActive] = useState(false)
  const [manualCalibrationTarget, setManualCalibrationTarget] = useState(null)
  const [manualCalibrationSamples, setManualCalibrationSamples] = useState([])
  const [manualCalibrationClickCount, setManualCalibrationClickCount] = useState(0)
  const manualCalibrationStartedAtRef = useRef(0)
  const audioContextRef = useRef(null)
  const currentDwellMs = activeSurface === 'keyboard' ? keyboardDwellMs : 2000
  const holdScale = activeSurface === 'keyboard' ? keyboardStickiness / 100 : 1
  const { focusedId, dwellProgress, flashType, gazePoint } = useGazeInteraction({
    dwellMs: currentDwellMs,
    idleMs: 10000,
    focusHoldEnabled: activeSurface === 'keyboard',
    holdBaseMargin: Math.round(120 * holdScale),
    holdMaxMargin: Math.round(290 * holdScale),
    holdRampMs: Math.max(360, Math.round(currentDwellMs * (0.65 / Math.max(holdScale, 0.1)))),
  })
  const {
    isTracking,
    lastError,
    calibrationSampleCount,
    calibrationQualityMeta,
    videoRef,
    startTracking,
    stopTracking,
    resetCalibration,
    beginCalibrationSession,
    captureCalibrationPoint,
    setActiveCalibrationProfile,
    beginManualCalibrationSession,
    captureManualCalibrationPoint,
    finishManualCalibration,
    resetManualCalibration,
    toggleHorizontalDirection,
  } = useWebGazerBridge()

  const content = APP_CONTENT[locale] || APP_CONTENT.tr
  const ui = content.ui || APP_CONTENT.en.ui
  const pageUi = getSurfaceUi(locale)
  const calibrationQuality = formatCalibrationQuality(locale, calibrationQualityMeta)
  const activeProfile = getCalibrationProfileForSurface(activeSurface)
  const activeProfileLabel = activeProfile?.label?.[locale] || activeProfile?.label?.en || activeProfile?.key || ''
  const formatMessage = useCallback((template, values = {}) => {
    if (!template) return ''
    return Object.entries(values).reduce(
      (output, [key, value]) => output.replaceAll(`{${key}}`, String(value ?? '')),
      template,
    )
  }, [])

  const currentCalibrationPoint = calibrationActive ? CALIBRATION_POINTS[calibrationStep] : null
  const currentCalibrationPointLabel = currentCalibrationPoint
    ? ui.calibrationPointLabels?.[currentCalibrationPoint.labelKey] || currentCalibrationPoint.labelKey
    : ''
  const surfaceIndex = SURFACE_ORDER.indexOf(activeSurface)
  const previousSurface = SURFACE_ORDER[(surfaceIndex - 1 + SURFACE_ORDER.length) % SURFACE_ORDER.length]
  const nextSurface = SURFACE_ORDER[(surfaceIndex + 1) % SURFACE_ORDER.length]

  const openSurface = useCallback((surfaceKey) => {
    setActiveSurface(surfaceKey)
    setStatus(formatMessage(ui.surfaceOpened, { surface: content.surfaces[surfaceKey] }))
  }, [content.surfaces, formatMessage, ui.surfaceOpened])

  const startManualCalibrationForSurface = useCallback((surfaceKey) => {
    const surfaceProfile = getCalibrationProfileForSurface(surfaceKey)
    const profileLabel = surfaceProfile?.label?.[locale] || surfaceProfile?.label?.en || surfaceProfile?.key || ''

    setActiveSurface(surfaceKey)
    setActiveCalibrationProfile(surfaceProfile?.key)
    beginManualCalibrationSession()
    setManualCalibrationActive(true)
    setManualCalibrationTarget(null)
    setManualCalibrationSamples([])
    setManualCalibrationClickCount(0)
    manualCalibrationStartedAtRef.current = Date.now()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStatus(formatMessage(ui.manualCalibrationStarted, { profile: profileLabel }))
  }, [beginManualCalibrationSession, formatMessage, locale, setActiveCalibrationProfile, ui.manualCalibrationStarted])

  const calibrationSettings = []

  const footerActions = [
    { id: `page-prev-${activeSurface}`, action: 'SURFACE_PREVIOUS', label: pageUi.footerPrevious, onClick: () => activateByMouse('SURFACE_PREVIOUS'), isFocused: focusedId === `page-prev-${activeSurface}` },
    { id: `page-home-${activeSurface}`, action: 'SURFACE_HOME', label: pageUi.footerHome, onClick: () => activateByMouse('SURFACE_HOME'), isFocused: focusedId === `page-home-${activeSurface}`, isActive: activeSurface === 'home' },
    { id: `page-next-${activeSurface}`, action: 'SURFACE_NEXT', label: pageUi.footerNext, onClick: () => activateByMouse('SURFACE_NEXT'), isFocused: focusedId === `page-next-${activeSurface}` },
  ]

  const homeQuickActions = [
    { id: 'home-action-keyboard', action: 'SURFACE_KEYBOARD', label: pageUi.homeActions.keyboard, description: content.surfaces.keyboard, onClick: () => activateByMouse('SURFACE_KEYBOARD'), isFocused: focusedId === 'home-action-keyboard' },
    { id: 'home-action-manual-calibration', action: 'START_MANUAL_CALIBRATION', label: pageUi.homeActions.manualCalibration, description: ui.controlLabels.START_MANUAL_CALIBRATION, onClick: () => activateByMouse('START_MANUAL_CALIBRATION'), isFocused: focusedId === 'home-action-manual-calibration' },
    { id: 'home-action-home-calibration', action: 'CALIBRATE_SURFACE_HOME', label: pageUi.homeActions.homeCalibration, description: content.surfaces.home, onClick: () => activateByMouse('CALIBRATE_SURFACE_HOME'), isFocused: focusedId === 'home-action-home-calibration' },
    { id: 'home-action-social-calibration', action: 'CALIBRATE_SURFACE_SOCIAL', label: pageUi.homeActions.socialCalibration, description: content.surfaces.social, onClick: () => activateByMouse('CALIBRATE_SURFACE_SOCIAL'), isFocused: focusedId === 'home-action-social-calibration' },
    { id: 'home-action-games-calibration', action: 'CALIBRATE_SURFACE_GAMES', label: pageUi.homeActions.gamesCalibration, description: content.surfaces.games, onClick: () => activateByMouse('CALIBRATE_SURFACE_GAMES'), isFocused: focusedId === 'home-action-games-calibration' },
    { id: 'home-action-keyboard-calibration', action: 'CALIBRATE_SURFACE_KEYBOARD', label: pageUi.homeActions.keyboardCalibration, description: content.surfaces.keyboard, onClick: () => activateByMouse('CALIBRATE_SURFACE_KEYBOARD'), isFocused: focusedId === 'home-action-keyboard-calibration' },
  ]

  const keyboardActions = [
    { id: 'keyboard-action-home', action: 'SURFACE_HOME', label: pageUi.footerHome, description: content.surfaces.home, onClick: () => activateByMouse('SURFACE_HOME'), isFocused: focusedId === 'keyboard-action-home' },
    { id: 'keyboard-action-start', action: 'START_TRACKING', label: ui.controlLabels.START_TRACKING, description: null, onClick: () => activateByMouse('START_TRACKING'), isFocused: focusedId === 'keyboard-action-start' },
    { id: 'keyboard-action-manual', action: 'START_MANUAL_CALIBRATION', label: ui.controlLabels.START_MANUAL_CALIBRATION, description: null, onClick: () => activateByMouse('START_MANUAL_CALIBRATION'), isFocused: focusedId === 'keyboard-action-manual' },
    { id: 'keyboard-action-calibration', action: 'CALIBRATE_SURFACE_KEYBOARD', label: pageUi.homeActions.keyboardCalibration, description: null, onClick: () => activateByMouse('CALIBRATE_SURFACE_KEYBOARD'), isFocused: focusedId === 'keyboard-action-calibration' },
    { id: 'keyboard-action-speak', action: 'SPEAK', label: content.keyboardLabels.SPEAK || 'SPEAK', description: null, onClick: () => activateByMouse('SPEAK'), isFocused: focusedId === 'keyboard-action-speak' },
    { id: 'keyboard-action-clear', action: 'CLEAR', label: content.keyboardLabels.CLEAR || 'CLEAR', description: null, onClick: () => activateByMouse('CLEAR'), isFocused: focusedId === 'keyboard-action-clear' },
  ]

  const navigationActions = [
    { id: 'navigation-action-home', action: 'SURFACE_HOME', label: content.surfaces.home, description: null, onClick: () => activateByMouse('SURFACE_HOME'), isFocused: focusedId === 'navigation-action-home' },
    { id: 'navigation-action-keyboard', action: 'SURFACE_KEYBOARD', label: content.surfaces.keyboard, description: null, onClick: () => activateByMouse('SURFACE_KEYBOARD'), isFocused: focusedId === 'navigation-action-keyboard' },
    { id: 'navigation-action-social', action: 'SURFACE_SOCIAL', label: content.surfaces.social, description: null, onClick: () => activateByMouse('SURFACE_SOCIAL'), isFocused: focusedId === 'navigation-action-social' },
    { id: 'navigation-action-games', action: 'SURFACE_GAMES', label: content.surfaces.games, description: null, onClick: () => activateByMouse('SURFACE_GAMES'), isFocused: focusedId === 'navigation-action-games' },
    { id: 'navigation-action-prev', action: 'SURFACE_PREVIOUS', label: pageUi.footerPrevious, description: null, onClick: () => activateByMouse('SURFACE_PREVIOUS'), isFocused: focusedId === 'navigation-action-prev' },
    { id: 'navigation-action-next', action: 'SURFACE_NEXT', label: pageUi.footerNext, description: null, onClick: () => activateByMouse('SURFACE_NEXT'), isFocused: focusedId === 'navigation-action-next' },
  ]

  const socialActions = [
    { id: 'social-action-home', action: 'SURFACE_HOME', label: pageUi.footerHome, description: null, onClick: () => activateByMouse('SURFACE_HOME'), isFocused: focusedId === 'social-action-home' },
    { id: 'social-action-keyboard', action: 'SURFACE_KEYBOARD', label: content.surfaces.keyboard, description: null, onClick: () => activateByMouse('SURFACE_KEYBOARD'), isFocused: focusedId === 'social-action-keyboard' },
    { id: 'social-action-speak', action: 'SPEAK', label: content.keyboardLabels.SPEAK || 'SPEAK', description: null, onClick: () => activateByMouse('SPEAK'), isFocused: focusedId === 'social-action-speak' },
    { id: 'social-action-clear', action: 'CLEAR', label: content.keyboardLabels.CLEAR || 'CLEAR', description: null, onClick: () => activateByMouse('CLEAR'), isFocused: focusedId === 'social-action-clear' },
    { id: 'social-action-manual', action: 'CALIBRATE_SURFACE_SOCIAL', label: pageUi.homeActions.socialCalibration, description: null, onClick: () => activateByMouse('CALIBRATE_SURFACE_SOCIAL'), isFocused: focusedId === 'social-action-manual' },
    { id: 'social-action-tracking', action: 'START_TRACKING', label: ui.controlLabels.START_TRACKING, description: null, onClick: () => activateByMouse('START_TRACKING'), isFocused: focusedId === 'social-action-tracking' },
  ]

  const gamesActions = [
    { id: 'games-action-home', action: 'SURFACE_HOME', label: pageUi.footerHome, description: null, onClick: () => activateByMouse('SURFACE_HOME'), isFocused: focusedId === 'games-action-home' },
    { id: 'games-action-keyboard', action: 'SURFACE_KEYBOARD', label: content.surfaces.keyboard, description: null, onClick: () => activateByMouse('SURFACE_KEYBOARD'), isFocused: focusedId === 'games-action-keyboard' },
    { id: 'games-action-start-cal', action: 'START_CALIBRATION', label: ui.controlLabels.START_CALIBRATION, description: null, onClick: () => activateByMouse('START_CALIBRATION'), isFocused: focusedId === 'games-action-start-cal' },
    { id: 'games-action-manual-cal', action: 'CALIBRATE_SURFACE_GAMES', label: pageUi.homeActions.gamesCalibration, description: null, onClick: () => activateByMouse('CALIBRATE_SURFACE_GAMES'), isFocused: focusedId === 'games-action-manual-cal' },
    { id: 'games-action-blink', action: 'BLINK_TEST', label: ui.controlLabels.BLINK_TEST, description: null, onClick: () => activateByMouse('BLINK_TEST'), isFocused: focusedId === 'games-action-blink' },
    { id: 'games-action-direction', action: 'TOGGLE_X_DIRECTION', label: ui.controlLabels.TOGGLE_X_DIRECTION, description: null, onClick: () => activateByMouse('TOGGLE_X_DIRECTION'), isFocused: focusedId === 'games-action-direction' },
  ]

  const homePageActions = SURFACE_ORDER.map((surfaceKey) => {
    const action = `SURFACE_${surfaceKey.toUpperCase()}`
    const buttonId = `home-surface-${surfaceKey}`

    return {
      id: buttonId,
      action,
      label: content.surfaces[surfaceKey],
      description: null,
      onClick: () => activateByMouse(action),
      isFocused: focusedId === buttonId,
      isActive: activeSurface === surfaceKey,
    }
  })

  const homeLocaleActions = SUPPORTED_LOCALES.map((languageKey) => {
    const action = `SET_LOCALE_${languageKey.toUpperCase()}`
    const buttonId = `home-locale-${languageKey}`

    return {
      id: buttonId,
      action,
      label: LOCALE_LABELS[languageKey],
      onClick: () => activateByMouse(action),
      isFocused: focusedId === buttonId,
      isActive: locale === languageKey,
    }
  })

  const startCalibrationFlow = useCallback(() => {
    beginCalibrationSession()
    setCalibrationStep(0)
    setCalibrationActive(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStatus(ui.calibrationStarted)
  }, [beginCalibrationSession, ui.calibrationStarted])

  const startManualCalibrationFlow = useCallback(() => {
    setActiveCalibrationProfile(activeProfile?.key)
    beginManualCalibrationSession()
    setManualCalibrationActive(true)
    setManualCalibrationTarget(null)
    setManualCalibrationSamples([])
    setManualCalibrationClickCount(0)
    manualCalibrationStartedAtRef.current = Date.now()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStatus(formatMessage(ui.manualCalibrationStarted, { profile: activeProfileLabel }))
  }, [activeProfile?.key, activeProfileLabel, beginManualCalibrationSession, formatMessage, setActiveCalibrationProfile, ui.manualCalibrationStarted])

  useEffect(() => {
    setActiveCalibrationProfile(activeProfile?.key)
  }, [activeProfile?.key, setActiveCalibrationProfile])

  useEffect(() => {
    if (!calibrationActive && !manualCalibrationActive) {
      return undefined
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [calibrationActive, manualCalibrationActive])

  useEffect(() => {
    if (autoStartTried) return
    setAutoStartTried(true)

    startTracking().then((result) => {
      if (result?.ok) {
        setStatus(ui.autoCameraStarted)
        return
      }
      setStatus(ui.autoCameraFailed)
    })
  }, [autoStartTried, startTracking, ui.autoCameraFailed, ui.autoCameraStarted])

  useEffect(() => {
    // Caregiver/test fallback: keyboard shortcuts for setup steps.
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase()

      if (key === 's') {
        startTracking().then((result) => {
          if (result?.ok) {
            setStatus(ui.shortcutCameraStarted)
            return
          }
          setStatus(ui.shortcutCameraStartFailed)
        })
      }

      if (key === 'x') {
        stopTracking()
        setStatus(ui.shortcutCameraStopped)
      }

      if (key === 'r') {
        const ok = resetCalibration()
        setStatus(ok ? ui.shortcutCalibrationReset : ui.calibrationResetFailed)
      }

      if (key === 'i') {
        toggleHorizontalDirection()
        setStatus(ui.directionFlipped)
      }

      if (key === 'c') {
        startCalibrationFlow()
      }

      if (key === 'm') {
        startManualCalibrationFlow()
      }

      if (key === '1') setActiveSurface('home')
      if (key === '2') setActiveSurface('keyboard')
      if (key === '3') setActiveSurface('navigation')
      if (key === '4') setActiveSurface('social')
      if (key === '5') setActiveSurface('games')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [resetCalibration, startTracking, startCalibrationFlow, stopTracking, toggleHorizontalDirection, startManualCalibrationFlow, ui.calibrationResetFailed, ui.directionFlipped, ui.shortcutCalibrationReset, ui.shortcutCameraStartFailed, ui.shortcutCameraStarted, ui.shortcutCameraStopped])

  useEffect(() => {
    const onError = (event) => {
      const message = event?.error?.message || event?.message || ''
      if (message) {
        setStatus(formatMessage(ui.browserError, { message }))
      }
    }

    const onUnhandledRejection = (event) => {
      const message = event?.reason?.message || String(event?.reason || '')
      if (message) {
        setStatus(formatMessage(ui.promiseError, { message }))
      }
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [formatMessage, ui.browserError, ui.promiseError])

  const beep = (frequency = 620, ms = 70) => {
    if (!window.AudioContext && !window.webkitAudioContext) return
    const AudioCtor = window.AudioContext || window.webkitAudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor()
    }
    const ctx = audioContextRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequency
    osc.type = 'sine'
    gain.gain.value = 0.07
    osc.start()
    window.setTimeout(() => {
      osc.stop()
      osc.disconnect()
      gain.disconnect()
    }, ms)
  }

  const speak = (value) => {
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(value)
    utterance.lang = content.speechLanguage || 'en-US'
    utterance.rate = 0.95
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  // Test/caregiver fallback: mouse click triggers the same activation pipeline as gaze/blink.
  const activateByMouse = useCallback((action) => {
    if (!action) return
    window.dispatchEvent(
      new CustomEvent('eyebridge:activate', {
        detail: { action, source: 'mouse' },
      }),
    )
  }, [])

  useEffect(() => {
    if (!manualCalibrationActive) return

    const onClick = (event) => {
      const now = Date.now()
      if (now - manualCalibrationStartedAtRef.current < 300) {
        return
      }

      const targetElement = event.target instanceof Element ? event.target : null
      const overlayHit = targetElement?.closest('.manual-calibration-overlay')
      if (!overlayHit) {
        return
      }

      const actionButton = targetElement?.closest('[data-action="FINISH_MANUAL_CALIBRATION"]')
      if (actionButton) {
        return
      }

      const result = captureManualCalibrationPoint(event.clientX, event.clientY, manualCalibrationClickCount)

      if (!result?.ok) {
        if (result?.reason === 'step_out_of_sync') {
          setStatus(ui.manualSyncLost)
          beep(220, 140)
          return
        }
        setStatus(ui.manualCaptureFailed)
        beep(260, 120)
        return
      }

      setManualCalibrationClickCount(result.points || 0)
      setManualCalibrationTarget({
        targetX: result.targetX ?? event.clientX,
        targetY: result.targetY ?? event.clientY,
      })
      setManualCalibrationSamples((previous) => [
        ...previous.slice(-79),
        {
          x: result.targetX ?? event.clientX,
          y: result.targetY ?? event.clientY,
          id: `${Date.now()}-${result.points || previous.length}`,
        },
      ])

      setStatus(formatMessage(ui.manualPointSaved, { points: result.points || 0 }))
      beep(700, 70)
    }

    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('click', onClick)
    }
  }, [manualCalibrationActive, captureManualCalibrationPoint, beep, formatMessage, manualCalibrationClickCount, ui.manualCaptureFailed, ui.manualPointSaved, ui.manualSyncLost])

  useEffect(() => {
    const onActivate = (event) => {
      const action = event?.detail?.action
      if (!action) return

      if (calibrationActive && action !== 'CAPTURE_CALIBRATION_POINT' && action !== 'RESET_CALIBRATION') {
        return
      }

      if (
        manualCalibrationActive
        && action !== 'RESET_MANUAL_CALIBRATION'
        && action !== 'FINISH_MANUAL_CALIBRATION'
      ) {
        return
      }

      if (action.length === 1) {
        setText((prev) => prev + action)
        setStatus(formatMessage(ui.characterSelected, { value: action }))
        beep(700, 65)
        return
      }

      if (action === 'SPACE') {
        setText((prev) => `${prev} `)
        setStatus(ui.spaceAdded)
        beep(640, 65)
        return
      }

      if (action === 'BACKSPACE') {
        setText((prev) => prev.slice(0, -1))
        setStatus(ui.characterDeleted)
        beep(460, 80)
        return
      }

      if (action === 'SPEAK') {
        if (!text.trim()) {
          setStatus(ui.nothingToSpeak)
          beep(260, 110)
          return
        }
        speak(text)
        setStatus(ui.speaking)
        beep(800, 90)
        return
      }

      if (action === 'CLEAR') {
        setText('')
        setStatus(ui.textCleared)
        beep(300, 80)
        return
      }

      if (action === 'START_TRACKING') {
        startTracking().then((result) => {
          if (result?.ok) {
            setStatus(ui.trackingEnabled)
            beep(780, 90)
            return
          }
          setStatus(ui.trackingFailed)
          beep(280, 120)
        })
        return
      }

      if (action === 'STOP_TRACKING') {
        stopTracking()
        setStatus(ui.trackingStopped)
        beep(300, 85)
        return
      }

      if (action === 'RESET_CALIBRATION') {
        const ok = resetCalibration()
        setStatus(ok ? ui.calibrationReset : ui.calibrationResetFailed)
        beep(ok ? 760 : 280, ok ? 80 : 110)
        setCalibrationActive(false)
        setCalibrationStep(0)
        return
      }

      if (action === 'START_CALIBRATION') {
        startCalibrationFlow()
        beep(720, 90)
        return
      }

      if (action === 'START_MANUAL_CALIBRATION') {
        startManualCalibrationFlow()
        beep(720, 90)
        return
      }

      const calibrationSurfaceActionMap = {
        CALIBRATE_SURFACE_HOME: 'home',
        CALIBRATE_SURFACE_SOCIAL: 'social',
        CALIBRATE_SURFACE_GAMES: 'games',
        CALIBRATE_SURFACE_KEYBOARD: 'keyboard',
      }

      if (calibrationSurfaceActionMap[action]) {
        startManualCalibrationForSurface(calibrationSurfaceActionMap[action])
        beep(720, 90)
        return
      }

      if (action === 'SURFACE_PREVIOUS') {
        openSurface(previousSurface)
        beep(680, 70)
        return
      }

      if (action === 'SURFACE_NEXT') {
        openSurface(nextSurface)
        beep(680, 70)
        return
      }

      const surfaceActionMap = {
        SURFACE_HOME: 'home',
        SURFACE_KEYBOARD: 'keyboard',
        SURFACE_NAVIGATION: 'navigation',
        SURFACE_SOCIAL: 'social',
        SURFACE_GAMES: 'games',
      }

      if (surfaceActionMap[action]) {
        openSurface(surfaceActionMap[action])
        beep(680, 70)
        return
      }

      if (action === 'GAMES_PREV') {
        setGamesPage((page) => Math.max(0, page - 1))
        beep(660, 70)
        return
      }

      if (action === 'GAMES_NEXT') {
        const maxGamesPage = Math.max(0, Math.ceil(EXAMPLE_GAMES.length / 5) - 1)
        setGamesPage((page) => Math.min(maxGamesPage, page + 1))
        beep(660, 70)
        return
      }

      if (action.startsWith('OPEN_GAME_')) {
        const gameId = Number(action.replace('OPEN_GAME_', ''))
        const selectedGame = EXAMPLE_GAMES.find((game) => game.id === gameId)
        if (selectedGame) {
          setActiveGame(selectedGame)
          beep(700, 70)
        }
        return
      }

      if (action.startsWith('SET_LOCALE_')) {
        const nextLocale = action.replace('SET_LOCALE_', '').toLowerCase()
        if (!SUPPORTED_LOCALES.includes(nextLocale)) {
          return
        }

        setLocale(nextLocale)
        setStatus(formatMessage((APP_CONTENT[nextLocale] || APP_CONTENT.en).ui.localeActivated, { locale: LOCALE_LABELS[nextLocale] }))
        beep(720, 70)
        return
      }

      if (action === 'RESET_MANUAL_CALIBRATION') {
        resetManualCalibration()
        setManualCalibrationActive(false)
        setManualCalibrationTarget(null)
        setManualCalibrationClickCount(0)
        setStatus(ui.manualCalibrationReset)
        beep(300, 100)
        return
      }

      if (action === 'FINISH_MANUAL_CALIBRATION') {
        const result = finishManualCalibration()
        if (!result?.ok) {
          if (result?.reason === 'insufficient_points') {
            setStatus(formatMessage(ui.manualCalibrationNeedSamples, { minPoints: result.minPoints, points: result.points || 0 }))
            beep(240, 130)
            return
          }

          setStatus(ui.manualCalibrationFinishFailed)
          beep(240, 130)
          return
        }

        const modelX = result.model?.x?.scale?.toFixed(2) || '?'
        const modelY = result.model?.y?.scale?.toFixed(2) || '?'
        setManualCalibrationActive(false)
        setManualCalibrationTarget(null)
        setManualCalibrationSamples([])
        setManualCalibrationClickCount(0)
        setStatus(formatMessage(ui.manualCalibrationFinishSuccess, { points: result.points, modelX, modelY }))
        beep(860, 110)
        return
      }

      if (action === 'CAPTURE_CALIBRATION_POINT') {
        if (!calibrationActive || !currentCalibrationPoint) {
          setStatus(ui.calibrationModeInactive)
          beep(280, 110)
          return
        }

        const result = captureCalibrationPoint(currentCalibrationPoint)
        if (!result?.ok) {
          setStatus(ui.calibrationPointFailed)
          beep(260, 120)
          return
        }

        const nextStep = calibrationStep + 1
        if (nextStep >= CALIBRATION_POINTS.length) {
          setCalibrationActive(false)
          setCalibrationStep(0)
          const resolvedQuality = result?.qualityKey
            ? formatCalibrationQuality(locale, { key: 'score', qualityKey: result.qualityKey, score: result.score || 0 })
            : calibrationQuality
          setStatus(formatMessage(ui.calibrationComplete, { quality: resolvedQuality }))
          beep(860, 110)
          return
        }

        setCalibrationStep(nextStep)
        setStatus(formatMessage(ui.calibrationProgress, { step: nextStep + 1, total: CALIBRATION_POINTS.length }))
        beep(700, 70)
        return
      }

      if (action === 'TOGGLE_X_DIRECTION') {
        toggleHorizontalDirection()
        setStatus(ui.directionFlipped)
        beep(680, 90)
        return
      }

      if (action === 'BLINK_TEST') {
        window.dispatchEvent(new CustomEvent('eyebridge:blink'))
        setStatus(ui.blinkTestSent)
        beep(640, 75)
      }
    }

    window.addEventListener('eyebridge:activate', onActivate)
    return () => window.removeEventListener('eyebridge:activate', onActivate)
  }, [
    calibrationActive,
    calibrationQuality,
    calibrationStep,
    captureCalibrationPoint,
    captureManualCalibrationPoint,
    currentCalibrationPoint,
    finishManualCalibration,
    formatMessage,
    manualCalibrationActive,
    resetCalibration,
    resetManualCalibration,
    startCalibrationFlow,
    startManualCalibrationFlow,
    startManualCalibrationForSurface,
    openSurface,
    previousSurface,
    nextSurface,
    startTracking,
    stopTracking,
    text,
    toggleHorizontalDirection,
    ui.blinkTestSent,
    ui.calibrationComplete,
    ui.calibrationModeInactive,
    ui.calibrationPointFailed,
    ui.calibrationProgress,
    ui.calibrationReset,
    ui.calibrationResetFailed,
    ui.characterDeleted,
    ui.characterSelected,
    ui.directionFlipped,
    ui.manualCalibrationFinishFailed,
    ui.manualCalibrationFinishSuccess,
    ui.manualCalibrationNeedSamples,
    ui.manualCalibrationReset,
    ui.nothingToSpeak,
    ui.spaceAdded,
    ui.speaking,
    ui.textCleared,
    ui.trackingEnabled,
    ui.trackingFailed,
    ui.trackingStopped,
  ])

  const activePage = (() => {
    if (activeSurface === 'home') {
      return (
        <HomePage
          content={{
            ...content.home,
            title: '',
            intro: '',
          }}
          labels={pageUi}
          actions={homeQuickActions}
          settings={calibrationSettings}
          footerActions={footerActions}
          pageActions={homePageActions}
          localeActions={homeLocaleActions}
          dwellProgress={dwellProgress}
        />
      )
    }

    if (activeSurface === 'navigation') {
      return (
        <NavigationPage
          content={{
            ...content.navigation,
          }}
          labels={pageUi}
          actions={navigationActions}
          settings={calibrationSettings}
          footerActions={footerActions}
          dwellProgress={dwellProgress}
        />
      )
    }

    if (activeSurface === 'social') {
      if (activeSocialPost !== null) {
        const postIndex = EXAMPLE_POSTS.findIndex(p => p.id === activeSocialPost.id)
        const prevPost = postIndex > 0 ? EXAMPLE_POSTS[postIndex - 1] : null
        const nextPost = postIndex < EXAMPLE_POSTS.length - 1 ? EXAMPLE_POSTS[postIndex + 1] : null

        return (
          <SocialDetailPage
            post={activeSocialPost}
            labels={pageUi}
            footerActions={[
              { id: 'social-detail-home', action: 'SURFACE_HOME', label: 'Ana Sayfa', onClick: () => { setActiveSocialPost(null); openSurface('home') }, isFocused: focusedId === 'social-detail-home' },
              { id: 'social-detail-social', action: 'SURFACE_SOCIAL', label: 'Sosyal', onClick: () => { setActiveSocialPost(null); openSurface('social') }, isFocused: focusedId === 'social-detail-social' },
              prevPost && { id: 'social-detail-prev', action: 'SOCIAL_PREV', label: 'Önceki', onClick: () => setActiveSocialPost(prevPost), isFocused: focusedId === 'social-detail-prev' },
              nextPost && { id: 'social-detail-next', action: 'SOCIAL_NEXT', label: 'Sonraki', onClick: () => setActiveSocialPost(nextPost), isFocused: focusedId === 'social-detail-next' },
            ].filter(Boolean)}
            dwellProgress={dwellProgress}
            focusedId={focusedId}
            onLike={() => setStatus('Beğenildi!')}
            onShare={() => setStatus('Paylaşıldı!')}
          />
        )
      }
      return (
        <SocialPage
          posts={EXAMPLE_POSTS}
          labels={pageUi}
          actions={socialActions}
          settings={calibrationSettings}
          footerActions={footerActions}
          dwellProgress={dwellProgress}
          onSelectPost={setActiveSocialPost}
          currentPage={socialPage}
          onPageChange={setSocialPage}
        />
      )
    }

    if (activeSurface === 'games') {
      if (activeGame !== null) {
        return (
          <GameDetailPage
            game={activeGame}
            labels={pageUi}
            footerActions={[
              { id: 'game-detail-home', action: 'SURFACE_HOME', label: 'Ana Sayfa', onClick: () => { setActiveGame(null); openSurface('home') }, isFocused: focusedId === 'game-detail-home' },
            ]}
            dwellProgress={dwellProgress}
            focusedId={focusedId}
            onHome={() => { setActiveGame(null); openSurface('home') }}
            onBackToGames={() => setActiveGame(null)}
          />
        )
      }
      return (
        <GamesPage
          games={EXAMPLE_GAMES}
          labels={pageUi}
          actions={gamesActions}
          settings={calibrationSettings}
          footerActions={footerActions}
          dwellProgress={dwellProgress}
          focusedId={focusedId}
          onSelectGame={setActiveGame}
          onHome={() => openSurface('home')}
          currentPage={gamesPage}
          onPageChange={setGamesPage}
        />
      )
    }

    return (
      <KeyboardPage
        text={text}
        onTextChange={setText}
        onHome={() => openSurface('home')}
        dwellProgress={dwellProgress}
        focusedId={focusedId}
        dwellMs={keyboardDwellMs}
        onDwellMsChange={(nextValue) => setKeyboardDwellMs(Math.max(600, Math.min(2500, nextValue)))}
        stickiness={keyboardStickiness}
        onStickinessChange={(nextValue) => setKeyboardStickiness(Math.max(30, Math.min(180, nextValue)))}
      >
        <section className="keyboard keyboard-board" aria-label={ui.keyboardAria}>
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div className="key-row key-row-board" key={`row-${rowIndex}`}>
              {row.map((key) => {
                const keyId = `key-${key}`
                const isFocused = focusedId === keyId
                const isWide = ['SPACE', 'BACKSPACE', 'SPEAK', 'CLEAR'].includes(key)
                const displayLabel = content.keyboardLabels[key] || key

                return (
                  <button
                    key={keyId}
                    type="button"
                    className={`gaze-key keyboard-board-key ${isFocused ? 'is-focused' : ''} ${isWide ? 'is-wide' : ''}`}
                    data-gaze="true"
                    data-gaze-id={keyId}
                    data-blink-action="true"
                    data-action={key}
                    onClick={() => activateByMouse(key)}
                    aria-label={displayLabel}
                  >
                    <span>{displayLabel}</span>
                    {isFocused && (
                      <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </section>
      </KeyboardPage>
    )
  })()

  return (
    <main className={`app-root surface-${activeSurface}`}>
      <CameraPreview videoRef={videoRef} isTracking={isTracking} />

      <div className={`edge-flash ${flashType ?? ''}`} aria-hidden="true" />
      {gazePoint && (
        <div
          className="gaze-cursor"
          aria-hidden="true"
          style={{
            transform: `translate(${Math.round(gazePoint.x)}px, ${Math.round(gazePoint.y)}px)`,
          }}
        />
      )}

      {calibrationActive && currentCalibrationPoint && (
        <section className="calibration-overlay" aria-live="assertive" aria-label={ui.calibrationOverlayAria}>
          <p className="calibration-hint">
            {formatMessage(ui.calibrationHint, { step: calibrationStep + 1, total: CALIBRATION_POINTS.length, label: currentCalibrationPointLabel })}
          </p>
          <button
            type="button"
            className="calibration-target"
            data-gaze="true"
            data-gaze-id="calibration-target"
            data-blink-action="true"
            data-action="CAPTURE_CALIBRATION_POINT"
            onClick={() => activateByMouse('CAPTURE_CALIBRATION_POINT')}
            aria-label={formatMessage(ui.calibrationTargetAria, { label: currentCalibrationPointLabel })}
            style={{
              left: `${Math.round(currentCalibrationPoint.x * 100)}%`,
              top: `${Math.round(currentCalibrationPoint.y * 100)}%`,
            }}
          >
            +
          </button>
        </section>
      )}

      {manualCalibrationActive && (
        <section
          className="manual-calibration-overlay"
          aria-live="assertive"
          aria-label={ui.manualCalibrationAria}
          data-gaze="true"
          data-gaze-id="manual-calibration-overlay"
        >
          <p className="calibration-hint">
            {formatMessage(ui.manualCalibrationHint, { count: calibrationSampleCount, min: MANUAL_CALIBRATION_MIN_POINTS })}
          </p>
          <div className="manual-calibration-actions">
            <button
              type="button"
              className={`gaze-key gaze-key-control manual-calibration-button ${focusedId === 'manual-finish' ? 'is-focused' : ''}`}
              data-gaze="true"
              data-gaze-id="manual-finish"
              data-blink-action="true"
              data-action="FINISH_MANUAL_CALIBRATION"
              onClick={() => activateByMouse('FINISH_MANUAL_CALIBRATION')}
              aria-label={ui.finishCalibration}
            >
              <span>{ui.finishCalibration}</span>
              {focusedId === 'manual-finish' && (
                <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />
              )}
            </button>
          </div>
          <div className="manual-calibration-trace-layer" aria-hidden="true">
            {manualCalibrationSamples.map((sample, index) => (
              <div
                key={sample.id}
                className="manual-calibration-trace"
                style={{
                  left: `${Math.round(sample.x)}px`,
                  top: `${Math.round(sample.y)}px`,
                  opacity: Math.max(0.22, (index + 1) / Math.max(manualCalibrationSamples.length, 1)),
                }}
              />
            ))}
          </div>
          {manualCalibrationTarget && (
            <div
              className="manual-calibration-point"
              style={{
                left: `${Math.round(manualCalibrationTarget.targetX)}px`,
                top: `${Math.round(manualCalibrationTarget.targetY)}px`,
              }}
              aria-hidden="true"
            />
          )}
        </section>
      )}

      <div className="app-shell app-shell-pages">
        <section className={`surface-stage surface-stage-${activeSurface}`}>
          {activePage}

          {lastError && (
            <section className="idle-help idle-help-error" aria-live="assertive">
              <strong>{ui.errorLabel}</strong>
              <p>{lastError}</p>
            </section>
          )}
        </section>
      </div>
    </main>
  )
}

export default App











