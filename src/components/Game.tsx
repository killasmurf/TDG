import React, { useState, useEffect } from 'react';
import { MapEditor } from './MapEditor';
import { GameOverOverlay } from './GameOverOverlay';

export const Game: React.FC = () => {
  const [score, setScore] = useState(0);
  const [isGameOver, setGameOver] = useState(false);

  /* Handle Esc key to trigger game over */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGameOver) {
        setGameOver(true);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isGameOver]);

  /* Restart logic – reset score, clear map, etc. */
  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    // Add any additional reset logic you have (e.g., clear enemy list, reset map state)
  };

  /* Exit logic – close the window or navigate */
  const handleExit = () => {
    console.log('Exit requested – replace with actual navigation logic');
    // Example: window.location.href = '/'; // redirect to home
  };

  return (
    <div className="game-wrapper">
      {!isGameOver ? (
        <>
          <h1 className="game-title">Tower Defense Game</h1>
          <MapEditor />
          <div className="scoreboard">Score: {score}</div>
        </>
      ) : (
        <GameOverOverlay
          score={score}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      )}
    </div>
  );
};
