export default function SurfaceFrame({
  badge,
  title,
  intro,
  actionsTitle,
  actions = [],
  settingsTitle,
  settings = [],
  footerActions = [],
  children,
  aside,
  className = '',
  ariaLabel,
  dwellProgress = 0,
}) {
  const hasHeader = Boolean(badge || title || intro)
  const hasAside = Boolean(aside || settings.length > 0)

  return (
    <section className={`surface-screen ${className}`.trim()} aria-label={ariaLabel || title}>
      {hasHeader && (
        <header className="surface-screen-header">
          {badge && <span className="surface-badge">{badge}</span>}
          <div className="surface-screen-copy">
            {title && <h2>{title}</h2>}
            {intro && <p className="surface-lead">{intro}</p>}
          </div>
        </header>
      )}

      <div className={`surface-screen-body ${hasAside ? '' : 'is-single-column'}`.trim()}>
        <div className="surface-screen-main">
          {actions.length > 0 && (
            <section className="surface-screen-section">
              <h3>{actionsTitle}</h3>
              <div className="surface-action-grid">
                {actions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`gaze-key gaze-key-control surface-action-button ${item.isFocused || item.isActive ? 'is-focused' : ''} ${item.className || ''}`.trim()}
                    data-gaze="true"
                    data-gaze-id={item.id}
                    data-blink-action="true"
                    data-action={item.action}
                    aria-label={item.label}
                    onClick={item.onClick}
                  >
                    <span>{item.label}</span>
                    {item.description && <small>{item.description}</small>}
                    {item.isFocused && (
                      <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="surface-screen-slot">{children}</div>
        </div>

        {hasAside && (
          <aside className="surface-screen-aside">
            {settings.length > 0 && (
              <section className="surface-screen-section surface-settings-section">
                <h3>{settingsTitle}</h3>
                <div className="surface-settings-grid">
                  {settings.map((item) => (
                    <article key={`${item.title}-${item.value}`} className="surface-setting-card">
                      <span className="surface-setting-label">{item.title}</span>
                      <strong>{item.value}</strong>
                      {item.detail && <p>{item.detail}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {aside}
          </aside>
        )}
      </div>

      {footerActions.length > 0 && (
        <footer className="surface-screen-footer">
          {footerActions.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`gaze-key gaze-key-control surface-footer-button ${item.isFocused || item.isActive ? 'is-focused' : ''}`.trim()}
              data-gaze="true"
              data-gaze-id={item.id}
              data-blink-action="true"
              data-action={item.action}
              aria-label={item.label}
              onClick={item.onClick}
            >
              <span>{item.label}</span>
              {item.isFocused && (
                <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />
              )}
            </button>
          ))}
        </footer>
      )}
    </section>
  )
}