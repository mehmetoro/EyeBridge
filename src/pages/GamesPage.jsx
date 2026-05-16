import SurfaceFrame from '../components/SurfaceFrame'

const GAMES_PER_PAGE = 5

const SLOT_LAYOUT = [
  { key: 'up', className: 'games-slot-up' },
  { key: 'left', className: 'games-slot-left' },
  { key: 'right', className: 'games-slot-right' },
  { key: 'click', className: 'games-slot-click' },
  { key: 'center', className: 'games-slot-center' },
]

export default function GamesPage({
  games = [],
  labels,
  actions,
  settings,
  footerActions,
  dwellProgress = 0,
  focusedId = '',
  onSelectGame,
  onHome,
  currentPage = 0,
  onPageChange,
}) {
  const startIdx = currentPage * GAMES_PER_PAGE
  const endIdx = startIdx + GAMES_PER_PAGE
  const currentGames = games.slice(startIdx, endIdx)
  const hasMore = endIdx < games.length
  const hasPrev = currentPage > 0
  const totalPages = Math.max(1, Math.ceil(games.length / GAMES_PER_PAGE))

  const customFooterActions = [
    { id: 'games-home', action: 'SURFACE_HOME', label: `S${currentPage + 1}/${totalPages} Ana Sayfa`, onClick: onHome, isFocused: focusedId === 'games-home' },
    hasPrev && { id: 'games-prev', action: 'GAMES_PREV', label: 'Onceki', onClick: () => onPageChange(currentPage - 1), isFocused: focusedId === 'games-prev' },
    hasMore && { id: 'games-next', action: 'GAMES_NEXT', label: 'Sonraki', onClick: () => onPageChange(currentPage + 1), isFocused: focusedId === 'games-next' },
  ].filter(Boolean)

  return (
    <SurfaceFrame
      badge={null}
      title={null}
      intro={null}
      actionsTitle={null}
      actions={[]}
      settingsTitle={null}
      settings={[]}
      footerActions={customFooterActions}
      className='surface-screen-games'
      dwellProgress={dwellProgress}
    >
      <section className='surface-screen-section games-layout-stage'>
        <div className='games-layout-screen'>
          <div className='games-spatial-shell' aria-label='Oyun secim duzeni'>
            {SLOT_LAYOUT.map((slot, index) => {
              const game = currentGames[index]

              if (!game) {
                return <div key={`empty-${slot.key}`} className={`games-slot-card games-slot-empty ${slot.className}`.trim()} />
              }

              const gazeId = `games-slot-${slot.key}-${game.id}`
              const isFocused = focusedId === gazeId
              return (
                <button
                  key={game.id}
                  type='button'
                  className={`gaze-key games-slot-card ${slot.className} ${isFocused ? 'is-focused' : ''}`.trim()}
                  data-gaze='true'
                  data-gaze-id={gazeId}
                  data-blink-action='true'
                  data-action={`OPEN_GAME_${game.id}`}
                  onClick={() => onSelectGame(game)}
                  aria-label={`${game.name} oyununu ac`}
                >
                  <strong>{game.name}</strong>
                  <p>{game.summary}</p>
                  {isFocused && (
                    <span className='dwell-meter' style={{ width: `${Math.round(dwellProgress * 100)}%` }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </SurfaceFrame>
  )
}




