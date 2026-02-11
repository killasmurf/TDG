import React, { useState, useEffect } from 'react';
import { GameOverOverlay } from './GameOverOverlay';
import './GameOverOverlay.css';

export const Game: React.FC = () => {
  const [score, setScore] = useState(0);
  const [isGameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGameOver) {
        setGameOver(true);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isGameOver]);

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    // Optional: Reset map or other game state here
  };

  const handleExit = () => {
    console.log('Exiting – you would close the window or navigate elsewhere.');
  };

  return (
    <div className="game-wrapper">
      {!isGameOver && <div className="game-content"> {/* Main game canvas or component goes here */} </div>}
      {isGameOver && (
        <GameOverOverlay
          score={score}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      )}
    </div>
  );
};
