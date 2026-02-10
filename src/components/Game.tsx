// src/components/Game.tsx
import React, { useState, useEffect } from 'react';
import { MapEditor } from './MapEditor';
import { GameOverOverlay } from './GameOverOverlay';
import './Game.css';

export const Game: React.FC = () => {
  const [score, setScore] = useState(0);
  const [isGameOver, setGameOver] = useState(false);

  // ESC key handling for game over
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGameOver) {
        setGameOver(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isGameOver]);

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    // Optionally reset map/game state here
  };

  const handleExit = () => {
    console.log('Exit requested – replace with app close logic if needed');
    // For Electron / Desktop: window.close();
  };

  return (
    <div className="game-container">
      {!isGameOver ? (
        <>
          <h1 className="game-title">Tower Defense</h1>
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
