import React from 'react';
import './GameOverOverlay.css';

export interface GameOverOverlayProps {
  /** Final score to display */
  score: number;
  /** Called when user clicks "Restart" */
  onRestart: () => void;
  /** Called when user clicks "Exit" */
  onExit: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  onRestart,
  onExit,
}) => {
  const handleShowScoreboard = () => {
    // Placeholder logic – you might open a modal or log information
    console.log('Scoreboard:', { score });
  };

  return (
    <div className="game-over-overlay">
      <div className="dialog">
        <h2 className="title">Game Over</h2>
        <p className="score">Score: {score}</p>
        <div className="buttons">
          <button onClick={onRestart}>Restart</button>
          <button onClick={onExit}>Exit</button>
          <button className="debug-btn" onClick={handleShowScoreboard}>Show Scoreboard</button>
        </div>
      </div>
    </div>
  );
};
