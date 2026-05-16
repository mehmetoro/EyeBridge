import SurfaceFrame from '../components/SurfaceFrame'

export default function SocialDetailPage({ post, labels, footerActions, dwellProgress = 0, focusedId = '', onLike, onShare }) {
  if (!post) return null

  // Build footer with nav + actions
  const fullFooterActions = [
    { id: 'social-detail-like', action: 'LIKE', label: `❤️ (${post.likes || 0})`, onClick: onLike, isFocused: focusedId === 'social-detail-like' },
    { id: 'social-detail-share', action: 'SHARE', label: '📤', onClick: onShare, isFocused: focusedId === 'social-detail-share' },
    ...footerActions,
  ]

  return (
    <SurfaceFrame
      badge={null}
      title={post.author}
      intro={post.time}
      actionsTitle={null}
      actions={[]}
      settingsTitle={null}
      settings={[]}
      footerActions={fullFooterActions}
      className="surface-screen-social-detail"
      ariaLabel={`${post.author} - ${post.content}`}
      dwellProgress={dwellProgress}
    >
      <section className="surface-screen-section">
        <div className="social-detail-content">
          <p style={{ fontSize: '28px', marginTop: '8px' }}>{post.content}</p>
          <small style={{ fontSize: '24px', color: '#666', marginTop: '8px' }}>{post.stats}</small>
        </div>
      </section>
    </SurfaceFrame>
  )
}
