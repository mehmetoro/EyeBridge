import { useState } from 'react'
import SurfaceFrame from '../components/SurfaceFrame'

export default function GameDetailPage({ game, labels, footerActions, dwellProgress = 0, focusedId = '', onBackToGames, onHome }) {
  const [gameState, setGameState] = useState({ score: 0, active: true })

  if (!game) return null

  const gameFooterActions = [
    { id: 'game-detail-home', action: 'SURFACE_HOME', label: 'Ana Sayfa', onClick: onHome, isFocused: focusedId === 'game-detail-home' },
    { id: 'game-detail-back', action: 'SURFACE_GAMES', label: 'Oyunlar', onClick: onBackToGames, isFocused: focusedId === 'game-detail-back' },
  ]

  return (
    <SurfaceFrame
      badge={null}
      title={null}
      intro={null}
      actionsTitle={null}
      actions={[]}
      settingsTitle={null}
      settings={[]}
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
              data-gaze="true"
              data-gaze-id="game-up"
              data-blink-action="true"
              data-action="UP"
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
              data-blink-action="true"
              data-action="LEFT"
              onClick={() => console.log('left')}
              aria-label="Sol"
            >
              ⬅️ Sol
              {focusedId === 'game-left' && <span className="dwell-meter" style={{ width: `${Math.round(dwellProgress * 100)}%` }} />}
            </button>

            <div className="game-playfield">
              <div className="game-playfield-inner" />
            </div>

            <button
              type="button"
              className={`gaze-key game-control-button game-control-right ${focusedId === 'game-right' ? 'is-focused' : ''}`}
              data-gaze="true"
              data-gaze-id="game-right"
              data-blink-action="true"
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
              data-blink-action="true"
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
