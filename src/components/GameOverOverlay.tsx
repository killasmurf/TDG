import React from 'react';
import './GameOverOverlay.css';

export interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  onRestart,
  onExit,
}) => (
  <div className="game-over-overlay">
    <div className="dialog">
      <h2 className="title">Game Over</h2>
      <p className="score">Score: {score}</p>
      <div className="buttons">
        <button onClick={onRestart}>Restart</button>
        <button onClick={onExit}>Exit</button>
      </div>
    </div>
  </div>
);
