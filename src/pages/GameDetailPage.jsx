import { useState, useEffect } from 'react'
import SurfaceFrame from '../components/SurfaceFrame'
import TetrisGame from '../components/TetrisGame'

export default function GameDetailPage({ game, labels, settings = [], footerActions, dwellProgress = 0, focusedId = '', onBackToGames, onHome }) {
  const [gameState, setGameState] = useState({ score: 0, active: true, restartKey: 0 })

  useEffect(() => {
    const handleActivate = (e) => {
      if (e.detail?.action === 'RESTART_GAME') {
        setGameState(s => ({ score: 0, active: true, restartKey: s.restartKey + 1 }))
      }
    }
    window.addEventListener('eyebridge:activate', handleActivate)
    return () => window.removeEventListener('eyebridge:activate', handleActivate)
  }, [])

  if (!game) return null

  const gameFooterActions = [
    { id: 'game-detail-home', action: 'SURFACE_HOME', label: 'Ana Sayfa', onClick: onHome, isFocused: focusedId === 'game-detail-home' },
    { id: 'game-detail-back', action: 'SURFACE_GAMES', label: 'Oyunlar', onClick: onBackToGames, isFocused: focusedId === 'game-detail-back' },
    { id: 'game-detail-restart', action: 'RESTART_GAME', label: 'Tekrar Başlat', onClick: () => setGameState(s => ({ score: 0, active: true, restartKey: s.restartKey + 1 })), isFocused: focusedId === 'game-detail-restart' },
  ]

  return (
    <SurfaceFrame
      badge={null}
      title={null}
      intro={null}
      actionsTitle={null}
      actions={[]}
      settingsTitle={labels?.calibrationSettings || 'Ayarlar'}
      settings={settings}
      footerActions={gameFooterActions}
      className="surface-screen-game-detail"
      ariaLabel={game.name}
      dwellProgress={dwellProgress}
    >
      <section className="surface-screen-section game-detail-stage">
        <div className="game-detail-screen">
          <div className="game-playfield-shell" aria-label={`${game.name} oyun alanı`}>
            <p className="game-score-chip game-score-chip-inline">Skor: {gameState.score}</p>

            <button
              type="button"
              className={`gaze-key game-control-button game-control-up ${focusedId === 'game-up' ? 'is-focused' : ''}`}
              data-gaze={game.id !== 'tetris' ? "true" : "false"}
              data-gaze-id="game-up"
              data-instant-action={game.id !== 'tetris' ? "true" : "false"}
              data-action="UP"
              disabled={game.id === 'tetris'}
              style={{ opacity: game.id === 'tetris' ? 0.3 : 1 }}
              onClick={() => console.log('up')}
              aria-label="İleri"
            >
              ⬆️ İleri
              <small>Yukarı</small>
              {focusedId === 'game-up' && <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />}
            </button>

            <button
              type="button"
              className={`gaze-key game-control-button game-control-left ${focusedId === 'game-left' ? 'is-focused' : ''}`}
              data-gaze="true"
              data-gaze-id="game-left"
              data-instant-action="true"
              data-action="LEFT"
              onClick={() => console.log('left')}
              aria-label="Sol"
            >
              ⬅️ Sol
              {focusedId === 'game-left' && <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />}
            </button>

            <div className="game-playfield">
              <div className="game-playfield-inner" data-gaze="true" data-gaze-id="game-center">
                {game.id === 'tetris' ? (
                  <TetrisGame key={gameState.restartKey} onScoreUpdate={(score) => setGameState(s => ({ ...s, score }))} isFocused={focusedId === 'game-center'} />
                ) : (
                  <div style={{ color: '#888', textAlign: 'center', paddingTop: '20vh' }}>Oyun içeriği: {game.name}</div>
                )}
              </div>
            </div>

            <button
              type="button"
              className={`gaze-key game-control-button game-control-right ${focusedId === 'game-right' ? 'is-focused' : ''}`}
              data-gaze="true"
              data-gaze-id="game-right"
              data-instant-action="true"
              data-action="RIGHT"
              onClick={() => console.log('right')}
              aria-label="Sağ"
            >
              Sağ ➡️
              {focusedId === 'game-right' && <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />}
            </button>

            <button
              type="button"
              className={`gaze-key game-control-button game-control-click ${focusedId === 'game-click' ? 'is-focused' : ''}`}
              data-gaze="true"
              data-gaze-id="game-click"
              data-instant-action="true"
              data-action="CLICK"
              onClick={() => setGameState((s) => ({ ...s, score: s.score + 1 }))}
              aria-label="Mouse tıklama"
            >
              🖱️ Tıkla
              {focusedId === 'game-click' && <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />}
            </button>
          </div>
        </div>
      </section>
    </SurfaceFrame>
  )
}
