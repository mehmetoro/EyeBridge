import './keyboard.css'

export default function KeyboardPage({
  text = '',
  onTextChange,
  onHome,
  children,
  dwellProgress = 0,
  focusedId = '',
  dwellMs = 1000,
  onDwellMsChange,
  stickiness = 100,
  onStickinessChange,
}) {
  const decreaseDwell = () => onDwellMsChange?.(dwellMs - 100)
  const increaseDwell = () => onDwellMsChange?.(dwellMs + 100)
  const decreaseStickiness = () => onStickinessChange?.(stickiness - 10)
  const increaseStickiness = () => onStickinessChange?.(stickiness + 10)

  return (
    <section className="surface-screen surface-screen-keyboard" aria-label="Yazi Tuslari">
      <div className="keyboard-header">
        <div className="keyboard-text-area">
          <input
            type="text"
            value={text}
            onChange={(e) => onTextChange?.(e.target.value)}
            placeholder="Yazin..."
            className="keyboard-input"
            readOnly
            aria-label="Yazi alani"
          />
        </div>

        <div className="keyboard-tools">
          <div className="keyboard-dwell-panel" aria-label="Bekleme suresi">
            <span className="keyboard-dwell-value">{dwellMs} ms</span>
            <div className="keyboard-dwell-actions">
              <button
                type="button"
                className={`gaze-key keyboard-dwell-button ${focusedId === 'kb-dwell-minus' ? 'is-focused' : ''}`.trim()}
                data-gaze="true"
                data-gaze-id="kb-dwell-minus"
                data-blink-action="true"
                data-action="DWELL_MINUS"
                onClick={decreaseDwell}
                aria-label="Bekleme suresini 100 ms azalt"
              >
                -100
              </button>
              <button
                type="button"
                className={`gaze-key keyboard-dwell-button ${focusedId === 'kb-dwell-plus' ? 'is-focused' : ''}`.trim()}
                data-gaze="true"
                data-gaze-id="kb-dwell-plus"
                data-blink-action="true"
                data-action="DWELL_PLUS"
                onClick={increaseDwell}
                aria-label="Bekleme suresini 100 ms artir"
              >
                +100
              </button>
            </div>
          </div>

          <div className="keyboard-dwell-panel" aria-label="Tutunma seviyesi">
            <span className="keyboard-dwell-value">Tutunma {stickiness}%</span>
            <div className="keyboard-dwell-actions">
              <button
                type="button"
                className={`gaze-key keyboard-dwell-button ${focusedId === 'kb-stick-minus' ? 'is-focused' : ''}`.trim()}
                data-gaze="true"
                data-gaze-id="kb-stick-minus"
                data-blink-action="true"
                data-action="STICKINESS_MINUS"
                onClick={decreaseStickiness}
                aria-label="Tutunmayi 10 azalt"
              >
                -10
              </button>
              <button
                type="button"
                className={`gaze-key keyboard-dwell-button ${focusedId === 'kb-stick-plus' ? 'is-focused' : ''}`.trim()}
                data-gaze="true"
                data-gaze-id="kb-stick-plus"
                data-blink-action="true"
                data-action="STICKINESS_PLUS"
                onClick={increaseStickiness}
                aria-label="Tutunmayi 10 artir"
              >
                +10
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`gaze-key keyboard-home-button ${focusedId === 'kb-home' ? 'is-focused' : ''}`.trim()}
            data-gaze="true"
            data-gaze-id="kb-home"
            data-blink-action="true"
            data-action="SURFACE_HOME"
            onClick={onHome}
            aria-label="Ana Sayfa"
          >
            Ana
          </button>
        </div>
      </div>

      <div className="keyboard-body">
        {children}
      </div>
    </section>
  )
}
