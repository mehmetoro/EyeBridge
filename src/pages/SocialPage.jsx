import SurfaceFrame from '../components/SurfaceFrame'

const POSTS_PER_PAGE = 3

export default function SocialPage({ 
  posts = [],
  labels, 
  actions, 
  settings, 
  footerActions, 
  dwellProgress = 0,
  onSelectPost,
  currentPage = 0,
  onPageChange,
}) {
  const startIdx = currentPage * POSTS_PER_PAGE
  const endIdx = startIdx + POSTS_PER_PAGE
  const currentPosts = posts.slice(startIdx, endIdx)
  const hasMore = endIdx < posts.length
  const hasPrev = currentPage > 0

  const customFooterActions = [
    { id: 'social-home', action: 'SURFACE_HOME', label: 'Ana Sayfa', onClick: () => {}, isFocused: false },
    hasPrev && { id: 'social-prev', action: 'SOCIAL_PREV', label: 'Önceki', onClick: () => onPageChange(currentPage - 1), isFocused: false },
    hasMore && { id: 'social-next', action: 'SOCIAL_NEXT', label: 'Sonraki', onClick: () => onPageChange(currentPage + 1), isFocused: false },
  ].filter(Boolean)

  return (
    <SurfaceFrame
      badge={null}
      title="Sosyal"
      intro={`Sayfa ${currentPage + 1}`}
      actionsTitle={null}
      actions={[]}
      settingsTitle={null}
      settings={[]}
      footerActions={customFooterActions}
      className="surface-screen-social"
      dwellProgress={dwellProgress}
    >
      <section className="surface-screen-section">
        <div className="social-feed">
          {currentPosts.map((post) => (
            <div 
              key={post.id} 
              className="social-post-card"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '2px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                cursor: 'pointer',
                minHeight: '100px'
              }}
              onClick={() => onSelectPost(post)}
            >
              <h4 style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{post.author}</h4>
              <p style={{ fontSize: '28px', marginTop: '8px', margin: '8px 0' }}>{post.content}</p>
              <small style={{ fontSize: '24px', color: '#666' }}>{post.time}</small>
            </div>
          ))}
        </div>
      </section>
    </SurfaceFrame>
  )
}