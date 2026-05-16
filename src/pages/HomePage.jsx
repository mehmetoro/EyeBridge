import SurfaceFrame from '../components/SurfaceFrame'

export default function HomePage({
  content,
  labels,
  actions,
  settings,
  footerActions,
  aside,
  pageActions = [],
  localeActions = [],
  dwellProgress = 0,
}) {
  const quickPageActions = pageActions.filter((item) => item.action === 'SURFACE_SOCIAL' || item.action === 'SURFACE_GAMES')

  return (
    <SurfaceFrame
      badge={null}
      title={content.title}
      intro={content.intro}
      actionsTitle={labels.actionsTitle}
      actions={actions}
      settingsTitle={labels.settingsTitle}
      settings={settings}
      footerActions={footerActions}
      aside={aside}
      className="surface-screen-home"
      ariaLabel={content.title || labels.pageButtonsTitle}
      dwellProgress={dwellProgress}
    >
      {quickPageActions.length > 0 && (
        <section className="surface-screen-section">
          <div className="surface-card-list surface-card-list-home">
            {quickPageActions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`gaze-key surface-chip ${item.isFocused || item.isActive ? 'is-focused' : ''}`.trim()}
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
          </div>
        </section>
      )}

      <section className="surface-screen-section">
        <h3>{labels.languageButtonsTitle}</h3>
        <div className="surface-language-grid surface-language-grid-home">
          {localeActions.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`gaze-key locale-chip ${item.isFocused || item.isActive ? 'is-focused' : ''}`.trim()}
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
        </div>
      </section>
    </SurfaceFrame>
  )
}
