import { useEffect, useRef, useState } from 'react'

const BLINK_EVENT = 'eyebridge:blink'
const GAZE_EVENT = 'eyebridge:gaze'
const ACTIVATE_EVENT = 'eyebridge:activate'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function findGazeElement(point) {
  const target = document.elementFromPoint(point.x, point.y)
  if (!target) return null
  return target.closest('[data-gaze="true"]')
}

function findNearestGazeElement(point, maxDistance = 240) {
  const candidates = document.querySelectorAll('[data-gaze="true"]')
  if (!candidates.length) return null

  let best = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const element of candidates) {
    const rect = element.getBoundingClientRect()
    if (!rect.width || !rect.height) continue

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = centerX - point.x
    const dy = centerY - point.y
    const distance = Math.hypot(dx, dy)

    if (distance < bestDistance) {
      bestDistance = distance
      best = element
    }
  }

  if (bestDistance <= maxDistance) return best
  return null
}

function isPointInsideExpandedRect(point, rect, margin = 0) {
  return (
    point.x >= rect.left - margin
    && point.x <= rect.right + margin
    && point.y >= rect.top - margin
    && point.y <= rect.bottom + margin
  )
}

export function useGazeInteraction({
  dwellMs = 2000,
  idleMs = 10000,
  focusHoldEnabled = false,
  holdBaseMargin = 90,
  holdMaxMargin = 170,
  holdRampMs,
} = {}) {
  const [focusedId, setFocusedId] = useState(null)
  const [dwellProgress, setDwellProgress] = useState(0)
  const [flashType, setFlashType] = useState(null)
  const [showIdleHelp, setShowIdleHelp] = useState(false)
  const [gazePoint, setGazePoint] = useState(null)

  const gazePointRef = useRef(null)
  const focusedRef = useRef({ id: null, element: null, startedAt: 0 })
  const lastActivityRef = useRef(Date.now())
  const lastActivationRef = useRef(0)

  useEffect(() => {
    const onGaze = (event) => {
      const detail = event?.detail
      if (!detail || typeof detail.x !== 'number' || typeof detail.y !== 'number') {
        return
      }
      gazePointRef.current = { x: detail.x, y: detail.y }
      lastActivityRef.current = Date.now()
      setShowIdleHelp(false)
    }

    const params = new URLSearchParams(window.location.search)
    const allowPointer = params.get('debugPointer') === '1'
    const onPointerMove = (event) => {
      if (!allowPointer) return
      gazePointRef.current = { x: event.clientX, y: event.clientY }
      lastActivityRef.current = Date.now()
      setShowIdleHelp(false)
    }

    const onBlink = () => {
      const focused = focusedRef.current.element
      if (!focused) {
        setFlashType('error')
        return
      }
      triggerAction(focused, 'blink')
    }

    const onDebugBlinkKey = (event) => {
      if (event.key.toLowerCase() === 'b') {
        onBlink()
      }
    }

    window.addEventListener(GAZE_EVENT, onGaze)
    window.addEventListener(BLINK_EVENT, onBlink)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('keydown', onDebugBlinkKey)

    return () => {
      window.removeEventListener(GAZE_EVENT, onGaze)
      window.removeEventListener(BLINK_EVENT, onBlink)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('keydown', onDebugBlinkKey)
    }
  }, [])

  useEffect(() => {
    let rafId = 0

    const tick = () => {
      const now = Date.now()
      const point = gazePointRef.current

      if (now - lastActivityRef.current > idleMs) {
        setShowIdleHelp(true)
      }

      if (!point) {
        setFocusedId(null)
        setDwellProgress(0)
        setGazePoint(null)
        rafId = window.requestAnimationFrame(tick)
        return
      }

      setGazePoint(point)

      const directElement = findGazeElement(point)
      const currentFocusedElement = focusedRef.current.element
      const focusElapsed = focusedRef.current.startedAt ? now - focusedRef.current.startedAt : 0
      const effectiveRampMs = holdRampMs || dwellMs
      const holdProgress = clamp(focusElapsed / Math.max(effectiveRampMs, 1), 0, 1)
      const holdStrength = focusHoldEnabled ? Math.pow(holdProgress, 1.6) : 0
      const holdMargin = focusHoldEnabled
        ? holdBaseMargin + (holdMaxMargin - holdBaseMargin) * holdStrength + holdStrength * holdStrength * 36
        : holdBaseMargin
      const nearestDistance = focusHoldEnabled
        ? 300 + holdStrength * 180 + holdStrength * holdStrength * 60
        : 300

      const keepCurrentFocus = currentFocusedElement
        && isPointInsideExpandedRect(point, currentFocusedElement.getBoundingClientRect(), holdMargin)

      const stickyFocusElement = focusHoldEnabled && keepCurrentFocus ? currentFocusedElement : null
      const nextElement = stickyFocusElement
        || directElement
        || (keepCurrentFocus ? currentFocusedElement : null)
        || findNearestGazeElement(point, nearestDistance)
      const nextId = nextElement?.getAttribute('data-gaze-id') ?? null

      if (!nextElement || !nextId) {
        focusedRef.current = { id: null, element: null, startedAt: 0 }
        setFocusedId(null)
        setDwellProgress(0)
        rafId = window.requestAnimationFrame(tick)
        return
      }

      if (focusedRef.current.id !== nextId) {
        focusedRef.current = {
          id: nextId,
          element: nextElement,
          startedAt: now,
        }
      }

      const elapsed = now - focusedRef.current.startedAt
      const progress = clamp(elapsed / dwellMs, 0, 1)
      setFocusedId(nextId)
      setDwellProgress(progress)

      const isBlinkAction = nextElement.getAttribute('data-blink-action') === 'true'
      const cooldownElapsed = now - lastActivationRef.current > 500

      if (isBlinkAction && progress >= 1 && cooldownElapsed) {
        triggerAction(nextElement, 'dwell')
      }

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [dwellMs, idleMs, focusHoldEnabled, holdBaseMargin, holdMaxMargin, holdRampMs])

  const triggerAction = (element, source) => {
    lastActivationRef.current = Date.now()
    focusedRef.current.startedAt = Date.now()
    setDwellProgress(0)
    setFlashType('success')

    const action = element.getAttribute('data-action')
    const id = element.getAttribute('data-gaze-id')

    window.dispatchEvent(
      new CustomEvent(ACTIVATE_EVENT, {
        detail: { action, id, source },
      }),
    )
  }

  useEffect(() => {
    if (!flashType) return
    const timeout = window.setTimeout(() => setFlashType(null), 180)
    return () => window.clearTimeout(timeout)
  }, [flashType])

  return {
    focusedId,
    dwellProgress,
    flashType,
    showIdleHelp,
    gazePoint,
  }
}


