// src/components/GameOverOverlay.tsx
import React from 'react';
import './GameOverOverlay.css';

interface Props {
  score: number;
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverOverlay: React.FC<Props> = ({score, onRestart, onExit}) => {
  return (
    <div className="game-over-overlay">
      <div className="game-over-dialog">
        <h2 className="game-over-title">Game Over</h2>
        <p className="game-over-score">Score: {score}</p>
        <div className="game-over-buttons">
          <button onClick={onRestart}>Restart</button>
          <button onClick={onExit}>Exit</button>
        </div>
      </div>
    </div>
  );
};
