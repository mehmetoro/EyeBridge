import SurfaceFrame from '../components/SurfaceFrame'

export default function NavigationPage({ content, labels, actions, settings, footerActions, dwellProgress = 0 }) {
  return (
    <SurfaceFrame
      badge={null}
      title={content.title}
      intro={null}
      actionsTitle={labels.actionsTitle}
      actions={actions}
      settingsTitle={labels.settingsTitle}
      settings={settings}
      footerActions={footerActions}
      className="surface-screen-navigation"
      ariaLabel={content.title}
      dwellProgress={dwellProgress}
    />
  )
}