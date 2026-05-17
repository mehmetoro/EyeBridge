import { useCallback, useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

const GAZE_EVENT = 'eyebridge:gaze'
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const CALIBRATION_STORAGE_KEY = 'eyebridge-calibration-v1'
const MANUAL_CALIBRATION_STORAGE_KEY = 'eyebridge-manual-calibration-v1'
const DEFAULT_CALIBRATION_PROFILE = 'global-manual'
const MANUAL_CALIBRATION_MIN_POINTS = 5
const MANUAL_CLICK_DEBOUNCE_MS = 260
const OUTPUT_SMOOTHING_WINDOW = 6
const SMALL_JITTER_PIXELS = 30

function toQualityKey(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'iyi' || normalized === 'good') return 'good'
  if (normalized === 'orta' || normalized === 'medium') return 'medium'
  if (normalized === 'dusuk' || normalized === 'low') return 'low'
  return 'unknown'
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function averageLandmark(landmarks, indices) {
  if (!landmarks?.length) return null
  const points = indices
    .map((index) => landmarks[index])
    .filter(Boolean)

  if (!points.length) return null

  const sum = points.reduce(
    (accumulator, point) => {
      accumulator.x += point.x
      accumulator.y += point.y
      accumulator.z += point.z ?? 0
      return accumulator
    },
    { x: 0, y: 0, z: 0 },
  )

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
    z: sum.z / points.length,
  }
}

function normalizeEyeAxis(center, minValue, maxValue) {
  if (maxValue === minValue) return 0.5
  return clamp((center - minValue) / (maxValue - minValue), 0, 1)
}

function applyDirectionAndGain(value, { invert = false, gain = 2.2, deadzone = 0.03 }) {
  const centered = value - 0.5
  const directed = invert ? -centered : centered
  const withDeadzone = Math.abs(directed) < deadzone ? 0 : directed
  const amplified = withDeadzone * gain
  return clamp(amplified + 0.5, 0, 1)
}

function boostEdgeCoverage(value, strength = 0.2) {
  const centered = value - 0.5
  const absCentered = Math.abs(centered) * 2
  const boosted = Math.pow(absCentered, 0.82)
  const mixed = clamp(absCentered * (1 - strength) + boosted * strength, 0, 1)
  return clamp(0.5 + Math.sign(centered) * (mixed / 2), 0, 1)
}

function dampSmallDelta(delta, threshold = SMALL_JITTER_PIXELS, factor = 0.06) {
  const magnitude = Math.abs(delta)
  if (magnitude <= threshold) {
    return delta * factor
  }

  return Math.sign(delta) * (threshold * factor + (magnitude - threshold))
}

function getManualCalibrationStorageKey(profileKey) {
  const normalizedProfile = profileKey || DEFAULT_CALIBRATION_PROFILE
  return `${MANUAL_CALIBRATION_STORAGE_KEY}:${normalizedProfile}`
}

function fitAxisLinear(pairs, rawKey, targetKey) {
  const values = pairs.map((pair) => ({ raw: pair[rawKey], target: pair[targetKey] }))
  const count = values.length
  if (count < 3) return null

  const meanRaw = values.reduce((sum, value) => sum + value.raw, 0) / count
  const meanTarget = values.reduce((sum, value) => sum + value.target, 0) / count

  let variance = 0
  let covariance = 0
  for (const value of values) {
    const rawDiff = value.raw - meanRaw
    variance += rawDiff * rawDiff
    covariance += rawDiff * (value.target - meanTarget)
  }

  if (variance < 1e-6) {
    return { scale: 1, offset: 0, mse: 0.2 }
  }

  const scale = clamp(covariance / variance, 0.35, 4)
  const offset = clamp(meanTarget - scale * meanRaw, -1, 1)

  const mse =
    values.reduce((sum, value) => {
      const prediction = clamp(value.raw * scale + offset, 0, 1)
      const error = prediction - value.target
      return sum + error * error
    }, 0) / count

  return { scale, offset, mse }
}

function buildManualCalibrationModel(points, screenWidth, screenHeight) {
  if (!points || points.length < 2) return null

  const rawXValues = points.map((point) => point.rawX)
  const rawYValues = points.map((point) => point.rawY)
  const targetXValues = points.map((point) => point.targetX)
  const targetYValues = points.map((point) => point.targetY)

  const rawSpanX = Math.max(...rawXValues) - Math.min(...rawXValues)
  const rawSpanY = Math.max(...rawYValues) - Math.min(...rawYValues)
  const targetSpanX = Math.max(...targetXValues) - Math.min(...targetXValues)
  const targetSpanY = Math.max(...targetYValues) - Math.min(...targetYValues)

  if (rawSpanX < 0.03 || rawSpanY < 0.03) {
    return null
  }

  const rawMinX = Math.min(...rawXValues)
  const rawMaxX = Math.max(...rawXValues)
  const rawMinY = Math.min(...rawYValues)
  const rawMaxY = Math.max(...rawYValues)

  const xFit = fitAxisLinear(points, 'rawX', 'targetX')
  const yFit = fitAxisLinear(points, 'rawY', 'targetY')
  if (!xFit || !yFit) return null

  const centerPoint = points.reduce((best, point) => {
    const bestDistance = best
      ? Math.hypot(best.targetX - 0.5, best.targetY - 0.5)
      : Number.POSITIVE_INFINITY
    const pointDistance = Math.hypot(point.targetX - 0.5, point.targetY - 0.5)
    return pointDistance < bestDistance ? point : best
  }, null)

  const centerOffset = centerPoint
    ? {
        x: clamp(
          centerPoint.targetX - clamp((centerPoint.rawX - rawMinX) / Math.max(rawMaxX - rawMinX, 1e-6), 0, 1),
          -0.2,
          0.2,
        ),
        y: clamp(
          centerPoint.targetY - clamp((centerPoint.rawY - rawMinY) / Math.max(rawMaxY - rawMinY, 1e-6), 0, 1),
          -0.2,
          0.2,
        ),
      }
    : { x: 0, y: 0 }

  // If fit error is high, fall back to conservative offset-only correction.
  if (xFit.mse > 0.08 || yFit.mse > 0.08) {
    const averageDelta = points.reduce(
      (sum, point) => ({
        x: sum.x + (point.targetX - point.rawX),
        y: sum.y + (point.targetY - point.rawY),
      }),
      { x: 0, y: 0 },
    )
    const avgDx = averageDelta.x / points.length
    const avgDy = averageDelta.y / points.length

    return {
      x: {
        scale: 1,
        offsetPx: clamp(avgDx * screenWidth, -screenWidth * 0.22, screenWidth * 0.22),
        mse: xFit.mse,
      },
      y: {
        scale: 1,
        offsetPx: clamp(avgDy * screenHeight, -screenHeight * 0.22, screenHeight * 0.22),
        mse: yFit.mse,
      },
      coverageScaleX: 1,
      coverageScaleY: 1.35,
      rawBounds: {
        minX: rawMinX,
        maxX: rawMaxX,
        minY: rawMinY,
        maxY: rawMaxY,
      },
      centerOffset,
      pointCount: points.length,
      updatedAt: Date.now(),
      conservative: true,
    }
  }

  const xScale = clamp(xFit.scale, 0.6, 2)
  const yScale = clamp(yFit.scale, 0.7, 2.3)
  const offsetPxX = clamp(xFit.offset * screenWidth, -screenWidth * 0.35, screenWidth * 0.35)
  const offsetPxY = clamp(yFit.offset * screenHeight, -screenHeight * 0.35, screenHeight * 0.35)

  return {
    x: { scale: xScale, offsetPx: offsetPxX, mse: xFit.mse },
    y: { scale: yScale, offsetPx: offsetPxY, mse: yFit.mse },
    coverageScaleX: clamp((targetSpanX + 0.02) / (rawSpanX + 0.02), 1.08, 2.8),
    coverageScaleY: clamp(((targetSpanY + 0.02) / (rawSpanY + 0.02)) * 1.25, 1.18, 3),
    rawBounds: {
      minX: rawMinX,
      maxX: rawMaxX,
      minY: rawMinY,
      maxY: rawMaxY,
    },
    centerOffset,
    pointCount: points.length,
    updatedAt: Date.now(),
  }
}

function buildCalibrationModel(pairs) {
  const xFit = fitAxisLinear(pairs, 'rawX', 'targetX')
  const yFit = fitAxisLinear(pairs, 'rawY', 'targetY')
  if (!xFit || !yFit) return null

  const edgePaddingX = clamp(28 / window.innerWidth, 0.012, 0.05)
  const edgePaddingY = clamp(28 / window.innerHeight, 0.012, 0.06)
  const pairCoverage = clamp(pairs.length / 9, 0, 1)
  const errorPenalty = clamp(((xFit.mse + yFit.mse) / 2) / 0.03, 0, 1)
  const score = Math.round(clamp(pairCoverage * 0.6 + (1 - errorPenalty) * 0.4, 0, 1) * 100)

  const qualityLabel = score >= 82 ? 'Iyi' : score >= 62 ? 'Orta' : 'Dusuk'
  const qualityKey = score >= 82 ? 'good' : score >= 62 ? 'medium' : 'low'

  return {
    x: xFit,
    y: yFit,
    edgePaddingX,
    edgePaddingY,
    score,
    qualityKey,
    qualityLabel,
    sampleCount: pairs.length,
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
    },
    updatedAt: Date.now(),
  }
}

function stretchToEdges(value, padding) {
  if (padding <= 0 || padding >= 0.48) return clamp(value, 0, 1)
  return clamp((value - padding) / (1 - padding * 2), 0, 1)
}

function applyCalibrationModel(value, axisModel, edgePadding) {
  const mapped = clamp(value * axisModel.scale + axisModel.offset, 0, 1)
  return stretchToEdges(mapped, edgePadding)
}

function estimateGazeFromFace(landmarks) {
  if (!landmarks?.length || landmarks.length < 478) return null

  const leftOuter = landmarks[33]
  const leftInner = landmarks[133]
  const leftTop = landmarks[159]
  const leftBottom = landmarks[145]
  const rightOuter = landmarks[362]
  const rightInner = landmarks[263]
  const rightTop = landmarks[386]
  const rightBottom = landmarks[374]

  const leftIris = averageLandmark(landmarks, [468, 469, 470, 471, 472])
  const rightIris = averageLandmark(landmarks, [473, 474, 475, 476, 477])

  if (!leftIris || !rightIris) return null
  if (!leftOuter || !leftInner || !leftTop || !leftBottom) return null
  if (!rightOuter || !rightInner || !rightTop || !rightBottom) return null

  const leftHorizontal = normalizeEyeAxis(leftIris.x, leftOuter.x, leftInner.x)
  const rightHorizontal = normalizeEyeAxis(rightIris.x, rightOuter.x, rightInner.x)
  const leftVertical = normalizeEyeAxis(leftIris.y, leftTop.y, leftBottom.y)
  const rightVertical = normalizeEyeAxis(rightIris.y, rightTop.y, rightBottom.y)

  const horizontal = clamp((leftHorizontal + rightHorizontal) / 2, 0, 1)
  const vertical = clamp((leftVertical + rightVertical) / 2, 0, 1)

  return { x: horizontal, y: vertical }
}

export function useWebGazerBridge() {
  const [isSupported, setIsSupported] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [statusMeta, setStatusMeta] = useState({ key: 'cameraDisconnected' })
  const [sampleCount, setSampleCount] = useState(0)
  const [lastSampleAt, setLastSampleAt] = useState(null)
  const [lastError, setLastError] = useState('')
  const [invertX, setInvertX] = useState(true)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [calibrationSampleCount, setCalibrationSampleCount] = useState(0)
  const [calibrationQualityMeta, setCalibrationQualityMeta] = useState({ key: 'none' })

  const videoRef = useRef(null)
  const landmarkerRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const animationFrameRef = useRef(0)
  const startPromiseRef = useRef(null)
  const lastDispatchRef = useRef(0)
  const lastPointRef = useRef(null)
  const rawHistoryRef = useRef([])
  const calibrationPairsRef = useRef([])
  const calibrationModelRef = useRef(null)
  const manualCalibrationPointsRef = useRef([])
  const manualCalibrationModelRef = useRef(null)
  const manualCalibrationModelsRef = useRef({})
  const activeCalibrationProfileRef = useRef(DEFAULT_CALIBRATION_PROFILE)
  const rawScreenPointRef = useRef(null)
  const screenHistoryRef = useRef([])
  const outputHistoryRef = useRef([])
  const manualHoldPointRef = useRef(null)
  const manualHoldUntilRef = useRef(0)
  const lastManualTargetRef = useRef(null)
  const lastBlinkEventRef = useRef(0)

  const dispatchGaze = useCallback((x, y) => {
    const now = Date.now()
    if (now - lastDispatchRef.current < 16) return
    lastDispatchRef.current = now

    window.dispatchEvent(
      new CustomEvent(GAZE_EVENT, {
        detail: { x, y },
      }),
    )
  }, [])

  useEffect(() => {
    const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    setIsSupported(hasMedia)
    if (!hasMedia) {
      setStatusMeta({ key: 'cameraUnsupported' })
    }
  }, [])

  useEffect(() => {
    try {
      const serialized = window.localStorage.getItem(CALIBRATION_STORAGE_KEY)
      if (!serialized) return

      const parsed = JSON.parse(serialized)
      if (!parsed?.x || !parsed?.y) return

      calibrationModelRef.current = parsed
      setCalibrationSampleCount(parsed.sampleCount || 0)
      setCalibrationQualityMeta({
        key: 'score',
        qualityKey: parsed.qualityKey || toQualityKey(parsed.qualityLabel),
        score: parsed.score || 0,
      })
      setIsCalibrated(true)
    } catch {
      // Keep operating without persisted calibration if parsing fails.
    }
  }, [])

  useEffect(() => {
    try {
      const serialized = window.localStorage.getItem(
        getManualCalibrationStorageKey(DEFAULT_CALIBRATION_PROFILE),
      )
      if (!serialized) return

      const parsed = JSON.parse(serialized)
      if (parsed?.x && parsed?.y) {
        manualCalibrationModelsRef.current[DEFAULT_CALIBRATION_PROFILE] = parsed
        manualCalibrationModelRef.current = parsed
      }
    } catch {
      // Continue if parsing fails.
    }
  }, [])

  const setActiveCalibrationProfile = useCallback((profileKey) => {
    const normalizedProfile = profileKey || DEFAULT_CALIBRATION_PROFILE
    activeCalibrationProfileRef.current = normalizedProfile

    if (manualCalibrationModelsRef.current[normalizedProfile]) {
      manualCalibrationModelRef.current = manualCalibrationModelsRef.current[normalizedProfile]
      return true
    }

    try {
      const serialized = window.localStorage.getItem(getManualCalibrationStorageKey(normalizedProfile))
      if (!serialized) {
        manualCalibrationModelRef.current =
          manualCalibrationModelsRef.current[DEFAULT_CALIBRATION_PROFILE] || null
        return false
      }

      const parsed = JSON.parse(serialized)
      if (parsed?.x && parsed?.y) {
        manualCalibrationModelsRef.current[normalizedProfile] = parsed
        manualCalibrationModelRef.current = parsed
        return true
      }
    } catch {
      // Ignore profile loading errors and fall back to the global profile.
    }

    manualCalibrationModelRef.current = manualCalibrationModelsRef.current[DEFAULT_CALIBRATION_PROFILE] || null
    return false
  }, [])

  const ensureLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current

    const vision = await FilesetResolver.forVisionTasks(WASM_URL)
    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: false,
    })

    landmarkerRef.current = faceLandmarker
    return faceLandmarker
  }, [])

  const emitPrediction = useCallback(
    (landmarks) => {
      const predicted = estimateGazeFromFace(landmarks)
      if (!predicted) return false

      const normalizedX = clamp(predicted.x, 0, 1)
      const normalizedY = clamp(predicted.y, 0, 1)

      rawHistoryRef.current.push({ x: normalizedX, y: normalizedY, at: Date.now() })
      if (rawHistoryRef.current.length > 40) {
        rawHistoryRef.current.shift()
      }

      const calibrationModel = calibrationModelRef.current
      const calibratedX = calibrationModel
        ? applyCalibrationModel(normalizedX, calibrationModel.x, calibrationModel.edgePaddingX)
        : normalizedX
      const calibratedY = calibrationModel
        ? applyCalibrationModel(normalizedY, calibrationModel.y, calibrationModel.edgePaddingY)
        : normalizedY

      const tunedX = applyDirectionAndGain(calibratedX, {
        invert: invertX,
        gain: 1.24,
        deadzone: 0.008,
      })
      const tunedY = applyDirectionAndGain(calibratedY, {
        invert: true,
        gain: 1.28,
        deadzone: 0.004,
      })

      const tunedPoint = {
        x: tunedX * window.innerWidth,
        y: tunedY * window.innerHeight,
      }
      rawScreenPointRef.current = tunedPoint
      screenHistoryRef.current.push({
        x: clamp(tunedPoint.x / window.innerWidth, 0, 1),
        y: clamp(tunedPoint.y / window.innerHeight, 0, 1),
      })
      if (screenHistoryRef.current.length > 60) {
        screenHistoryRef.current.shift()
      }

      const now = Date.now()
      if (manualHoldPointRef.current && now < manualHoldUntilRef.current) {
        const holdPoint = manualHoldPointRef.current
        lastPointRef.current = holdPoint
        setSampleCount((count) => count + 1)
        setLastSampleAt(now)
        dispatchGaze(holdPoint.x, holdPoint.y)
        return true
      }

      const manualModel = manualCalibrationModelRef.current
      const tunedNormX = clamp(tunedPoint.x / window.innerWidth, 0, 1)
      const tunedNormY = clamp(tunedPoint.y / window.innerHeight, 0, 1)

      const mappedPoint = manualModel
        ? (() => {
            const bounds = manualModel.rawBounds
            const boundsMappedX = bounds
              ? clamp((tunedNormX - bounds.minX) / Math.max(bounds.maxX - bounds.minX, 1e-6), 0, 1)
              : tunedNormX
            const boundsMappedY = bounds
              ? clamp((tunedNormY - bounds.minY) / Math.max(bounds.maxY - bounds.minY, 1e-6), 0, 1)
              : tunedNormY

            const centerOffsetX = manualModel.centerOffset?.x ?? 0
            const centerOffsetY = manualModel.centerOffset?.y ?? 0

            const blendedX = clamp(
              boundsMappedX * 0.84 + clamp(tunedNormX * manualModel.x.scale + manualModel.x.offsetPx / window.innerWidth, 0, 1) * 0.16 + centerOffsetX * 0.3,
              0,
              1,
            )
            const blendedY = clamp(
              boundsMappedY * 0.84 + clamp(tunedNormY * manualModel.y.scale + manualModel.y.offsetPx / window.innerHeight, 0, 1) * 0.16 + centerOffsetY * 0.45,
              0,
              1,
            )

            const edgeBoostedX = boostEdgeCoverage(blendedX, 0.24)
            const edgeBoostedY = boostEdgeCoverage(blendedY, 0.3)

            return {
              x: edgeBoostedX * window.innerWidth,
              y: edgeBoostedY * window.innerHeight,
            }
          })()
        : tunedPoint

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      const remappedPoint = manualModel
        ? {
            x: clamp(centerX + (mappedPoint.x - centerX) * (manualModel.coverageScaleX ?? 1), 0, window.innerWidth),
            y: clamp(centerY + (mappedPoint.y - centerY) * (manualModel.coverageScaleY ?? 1), 0, window.innerHeight),
          }
        : tunedPoint

      outputHistoryRef.current.push(remappedPoint)
      if (outputHistoryRef.current.length > OUTPUT_SMOOTHING_WINDOW) {
        outputHistoryRef.current.shift()
      }

      const smoothedTarget = outputHistoryRef.current.reduce(
        (sum, point) => ({
          x: sum.x + point.x,
          y: sum.y + point.y,
        }),
        { x: 0, y: 0 },
      )

      const averagedPoint = {
        x: smoothedTarget.x / outputHistoryRef.current.length,
        y: smoothedTarget.y / outputHistoryRef.current.length,
      }

      const previous = lastPointRef.current
      const nextPoint = previous
        ? (() => {
            const dx = dampSmallDelta(averagedPoint.x - previous.x)
            const dy = dampSmallDelta(averagedPoint.y - previous.y)
            const distance = Math.hypot(dx, dy)

            const alpha = manualModel
              ? clamp(distance / 110, 0.2, 0.5)
              : clamp(distance / 145, 0.16, 0.42)

            return {
              x: previous.x + dx * alpha,
              y: previous.y + dy * alpha,
            }
          })()
        : averagedPoint

      lastPointRef.current = nextPoint
      setSampleCount((count) => count + 1)
      setLastSampleAt(Date.now())
      dispatchGaze(nextPoint.x, nextPoint.y)
      return true
    },
    [dispatchGaze, invertX],
  )

  const stopTracking = useCallback(() => {
    window.cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = 0

    const landmarker = landmarkerRef.current
    if (landmarker && typeof landmarker.close === 'function') {
      landmarker.close()
    }
    landmarkerRef.current = null

    const video = videoRef.current
    if (video) {
      video.pause()
      video.srcObject = null
    }

    const stream = mediaStreamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    mediaStreamRef.current = null
    lastPointRef.current = null
    outputHistoryRef.current = []

    setIsTracking(false)
    setIsReady(false)
    setStatusMeta({ key: 'cameraPaused' })
  }, [])

  const loop = useCallback(async () => {
    const landmarker = landmarkerRef.current
    const video = videoRef.current

    if (!landmarker || !video || video.readyState < 2) {
      animationFrameRef.current = window.requestAnimationFrame(loop)
      return
    }

    try {
      const result = landmarker.detectForVideo(video, performance.now())
      const faceLandmarks = result?.faceLandmarks?.[0]
      if (faceLandmarks) {
        emitPrediction(faceLandmarks)
      }

      const faceBlendshapes = result?.faceBlendshapes?.[0]?.categories
      if (faceBlendshapes) {
        const leftBlink = faceBlendshapes.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0
        const rightBlink = faceBlendshapes.find(c => c.categoryName === 'eyeBlinkRight')?.score || 0

        if (leftBlink > 0.45 && rightBlink > 0.45) {
          const now = Date.now()
          if (now - lastBlinkEventRef.current > 700) {
            lastBlinkEventRef.current = now
            window.dispatchEvent(new CustomEvent('eyebridge:blink'))
          }
        }
      }
    } catch (error) {
      setLastError(error?.message || 'unknown')
      setStatusMeta({ key: 'detectionError' })
      stopTracking()
      return
    }

    animationFrameRef.current = window.requestAnimationFrame(loop)
  }, [emitPrediction, stopTracking])

  const startTracking = useCallback(async () => {
    if (!isSupported) return { ok: false, reason: 'unsupported' }
    if (isTracking) return { ok: true, alreadyRunning: true }
    if (startPromiseRef.current) return startPromiseRef.current

    const startPromise = (async () => {
      try {
        setLastError('')
        setStatusMeta({ key: 'cameraStarting' })

        const video = videoRef.current
        if (!video) throw new Error('Video elementi bulunamadi')

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        mediaStreamRef.current = stream
        video.srcObject = stream
        video.playsInline = true
        video.muted = true

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve()
        })
        await video.play()

        await ensureLandmarker()

        setIsReady(true)
        setIsTracking(true)
        setStatusMeta({ key: 'cameraActive' })

        animationFrameRef.current = window.requestAnimationFrame(loop)
        return { ok: true }
      } catch (error) {
        setStatusMeta({ key: 'cameraStartFailed' })
        setLastError(error?.message || 'unknown')
        stopTracking()
        return { ok: false, reason: error?.message || 'unknown' }
      } finally {
        startPromiseRef.current = null
      }
    })()

    startPromiseRef.current = startPromise
    return startPromise
  }, [ensureLandmarker, isReady, isSupported, isTracking, loop, stopTracking])

  const resetCalibration = useCallback(() => {
    lastPointRef.current = null
    rawHistoryRef.current = []
    calibrationPairsRef.current = []
    calibrationModelRef.current = null
    window.localStorage.removeItem(CALIBRATION_STORAGE_KEY)

    setSampleCount(0)
    setLastSampleAt(null)
    setCalibrationSampleCount(0)
    setCalibrationQualityMeta({ key: 'none' })
    setIsCalibrated(false)
    setStatusMeta({ key: 'calibrationReset' })
    return true
  }, [])

  const beginCalibrationSession = useCallback(() => {
    calibrationPairsRef.current = []
    rawHistoryRef.current = []
    calibrationModelRef.current = null
    setCalibrationSampleCount(0)
    setCalibrationQualityMeta({ key: 'started' })
    setIsCalibrated(false)
    setStatusMeta({ key: 'calibrationMode' })
    return true
  }, [])

  const captureCalibrationPoint = useCallback((targetPoint) => {
    const targetX = clamp(Number(targetPoint?.x), 0, 1)
    const targetY = clamp(Number(targetPoint?.y), 0, 1)
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
      return { ok: false, reason: 'invalid_target' }
    }

    const stableWindow = rawHistoryRef.current.slice(-16)
    if (stableWindow.length < 8) {
      return { ok: false, reason: 'insufficient_samples' }
    }

    const averageRaw = stableWindow.reduce(
      (sum, point) => ({
        x: sum.x + point.x,
        y: sum.y + point.y,
      }),
      { x: 0, y: 0 },
    )

    const point = {
      rawX: averageRaw.x / stableWindow.length,
      rawY: averageRaw.y / stableWindow.length,
      targetX,
      targetY,
      at: Date.now(),
    }

    calibrationPairsRef.current.push(point)
    const pairs = calibrationPairsRef.current
    setCalibrationSampleCount(pairs.length)

    const model = buildCalibrationModel(pairs)
    if (model) {
      calibrationModelRef.current = model
      window.localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(model))
      setIsCalibrated(true)
      setCalibrationQualityMeta({ key: 'score', qualityKey: model.qualityKey, score: model.score })
      setStatusMeta({ key: 'calibrationUpdated', params: { qualityKey: model.qualityKey, points: pairs.length } })
      return { ok: true, points: pairs.length, qualityKey: model.qualityKey, score: model.score }
    }

    setCalibrationQualityMeta({ key: 'collecting' })
    setStatusMeta({ key: 'calibrationPointCaptured', params: { points: pairs.length } })
    return { ok: true, points: pairs.length, qualityKey: 'collecting' }
  }, [])

  const toggleHorizontalDirection = useCallback(() => {
    setInvertX((value) => {
      const nextValue = !value
      setStatusMeta({ key: 'directionChanged', params: { directionKey: nextValue ? 'inverted' : 'normal' } })
      return nextValue
    })
  }, [])

  const beginManualCalibrationSession = useCallback(() => {
    manualCalibrationPointsRef.current = []
    manualCalibrationModelRef.current = null
    screenHistoryRef.current = []
    outputHistoryRef.current = []
    manualHoldPointRef.current = null
    manualHoldUntilRef.current = 0
    lastManualTargetRef.current = null
    captureManualCalibrationPoint.lastCaptureAt = 0
    setCalibrationSampleCount(0)
    setCalibrationQualityMeta({ key: 'manualCollecting' })
    setStatusMeta({ key: 'manualStarted' })
    return true
  }, [])

  const captureManualCalibrationPoint = useCallback((screenX, screenY, expectedStep = null) => {
    const targetX = clamp(screenX, 0, window.innerWidth)
    const targetY = clamp(screenY, 0, window.innerHeight)

    if (
      typeof expectedStep === 'number'
      && Number.isFinite(expectedStep)
      && expectedStep !== manualCalibrationPointsRef.current.length
    ) {
      return {
        ok: false,
        reason: 'step_out_of_sync',
        message: 'Kalibrasyon adim senkronu bozuldu',
        points: manualCalibrationPointsRef.current.length,
      }
    }

    const now = Date.now()
    if (now - (captureManualCalibrationPoint.lastCaptureAt ?? 0) < MANUAL_CLICK_DEBOUNCE_MS) {
      return { ok: false, reason: 'debounced', message: 'Cok hizli tiklama algilandi' }
    }

    const lastTarget = lastManualTargetRef.current
    if (lastTarget) {
      const dx = targetX - lastTarget.x
      const dy = targetY - lastTarget.y
      const distance = Math.hypot(dx, dy)
      if (distance < 42 && now - lastTarget.at < 1200) {
        return { ok: false, reason: 'same_target', message: 'Ayni noktaya tekrar tiklandi' }
      }
    }

    captureManualCalibrationPoint.lastCaptureAt = now
    lastManualTargetRef.current = { x: targetX, y: targetY, at: now }

    manualHoldPointRef.current = { x: targetX, y: targetY }
    manualHoldUntilRef.current = now + 1100

    const stableWindow = screenHistoryRef.current.slice(-12)
    const averagedRaw = stableWindow.length
      ? stableWindow.reduce(
          (sum, point) => ({
            x: sum.x + point.x,
            y: sum.y + point.y,
          }),
          { x: 0, y: 0 },
        )
      : null

    const rawXNorm = averagedRaw
      ? averagedRaw.x / stableWindow.length
      : clamp((rawScreenPointRef.current?.x ?? targetX) / window.innerWidth, 0, 1)
    const rawYNorm = averagedRaw
      ? averagedRaw.y / stableWindow.length
      : clamp((rawScreenPointRef.current?.y ?? targetY) / window.innerHeight, 0, 1)

    const pointEntry = {
      observedX: rawXNorm * window.innerWidth,
      observedY: rawYNorm * window.innerHeight,
      rawX: rawXNorm,
      rawY: rawYNorm,
      targetX: clamp(targetX / window.innerWidth, 0, 1),
      targetY: clamp(targetY / window.innerHeight, 0, 1),
      at: Date.now(),
    }

    manualCalibrationPointsRef.current.push(pointEntry)
    const points = manualCalibrationPointsRef.current

    if (points.length < 3) {
      setCalibrationSampleCount(points.length)
      setCalibrationQualityMeta({ key: 'manualSamples', points: points.length })
      setStatusMeta({ key: 'manualPointCaptured', params: { points: points.length } })
      lastPointRef.current = { x: targetX, y: targetY }
      dispatchGaze(targetX, targetY)
      return { ok: true, points: points.length, needsMore: true, targetX, targetY, isComplete: false }
    }

    setCalibrationSampleCount(points.length)
    setCalibrationQualityMeta({
      key: points.length >= MANUAL_CALIBRATION_MIN_POINTS ? 'manualReady' : 'manualSamples',
      points: points.length,
    })

    setStatusMeta({ key: 'manualUpdated' })
    lastPointRef.current = { x: targetX, y: targetY }
    dispatchGaze(targetX, targetY)

    return {
      ok: true,
      points: points.length,
      targetX,
      targetY,
      needsMore: true,
      isComplete: false,
    }
  }, [dispatchGaze])

  const finishManualCalibration = useCallback(() => {
    const points = manualCalibrationPointsRef.current
    if (points.length < MANUAL_CALIBRATION_MIN_POINTS) {
      return {
        ok: false,
        reason: 'insufficient_points',
        points: points.length,
        minPoints: MANUAL_CALIBRATION_MIN_POINTS,
      }
    }

    const manualModel = buildManualCalibrationModel(points, window.innerWidth, window.innerHeight) || {
      x: { scale: 1, offsetPx: 0, mse: 0.12 },
      y: { scale: 1, offsetPx: 0, mse: 0.12 },
      pointCount: points.length,
      direct: true,
      updatedAt: Date.now(),
    }

    const profileKey = activeCalibrationProfileRef.current || DEFAULT_CALIBRATION_PROFILE
    manualCalibrationModelsRef.current[profileKey] = manualModel
    manualCalibrationModelRef.current = manualModel
    window.localStorage.setItem(getManualCalibrationStorageKey(profileKey), JSON.stringify(manualModel))
    manualHoldPointRef.current = null
    manualHoldUntilRef.current = 0

    const modelScore = Math.round(clamp(100 - ((manualModel.x.mse + manualModel.y.mse) / 2) * 800, 20, 99))
    setCalibrationSampleCount(points.length)
    setCalibrationQualityMeta({ key: 'manualScore', score: modelScore, points: points.length })
    setStatusMeta({ key: 'manualCompleted' })

    return {
      ok: true,
      model: manualModel,
      points: points.length,
      isComplete: true,
    }
  }, [])

  const resetManualCalibration = useCallback(() => {
    const profileKey = activeCalibrationProfileRef.current || DEFAULT_CALIBRATION_PROFILE
    manualCalibrationPointsRef.current = []
    manualCalibrationModelRef.current = null
    rawScreenPointRef.current = null
    screenHistoryRef.current = []
    outputHistoryRef.current = []
    manualHoldPointRef.current = null
    manualHoldUntilRef.current = 0
    lastManualTargetRef.current = null
    captureManualCalibrationPoint.lastCaptureAt = 0
    delete manualCalibrationModelsRef.current[profileKey]
    window.localStorage.removeItem(getManualCalibrationStorageKey(profileKey))
    setCalibrationSampleCount(0)
    setCalibrationQualityMeta({ key: 'manualReset' })
    setStatusMeta({ key: 'manualReset' })
    return true
  }, [captureManualCalibrationPoint])

  useEffect(() => {
    return () => {
      startPromiseRef.current = null
      window.cancelAnimationFrame(animationFrameRef.current)
      const landmarker = landmarkerRef.current
      if (landmarker && typeof landmarker.close === 'function') {
        landmarker.close()
      }
      const stream = mediaStreamRef.current
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return {
    isSupported,
    isReady,
    isTracking,
    statusMeta,
    sampleCount,
    lastSampleAt,
    lastError,
    invertX,
    isCalibrated,
    calibrationSampleCount,
    calibrationQualityMeta,
    activeCalibrationProfile: activeCalibrationProfileRef.current,
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
  }
}


