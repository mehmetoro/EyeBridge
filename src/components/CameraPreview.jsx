export default function CameraPreview({ videoRef, isTracking = false }) {
  return (
    <div className="camera-preview" aria-label="Göz takipi kamerası">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="camera-preview-video"
        aria-hidden="true"
      />
      <div className={`camera-status ${isTracking ? 'is-tracking' : 'is-idle'}`}>
        <span className="camera-indicator" />
        {isTracking ? 'İzleme Aktif' : 'Bekleniyor'}
      </div>
    </div>
  )
}
