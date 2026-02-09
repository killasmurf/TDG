import React, { useState, useRef, useEffect } from 'react';
import './MapEditor.css';

export interface Tile {
  type: string; // e.g., "grass", "water", "mountain"
  sprite?: string; // optional image or sprite name
}

export interface MapData {
  width: number;
  height: number;
  tiles: Tile[][]; // 2D array [x][y]
}

export const MapEditor: React.FC = () => {
  const [map, setMap] = useState<MapData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    if (!map) return;
    const tileSize = 32;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const tile = map.tiles[x][y];
        ctx.fillStyle = getColorForTile(tile.type);
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }, [map]);

  const createEmptyMap = () => {
    const width = 20;
    const height = 15;
    const tiles: Tile[][] = [];
    for (let x = 0; x < width; x++) {
      tiles[x] = [];
      for (let y = 0; y < height; y++) {
        tiles[x][y] = { type: 'grass' };
      }
    }
    setMap({ width, height, tiles });
  };

  const getColorForTile = (type: string) => {
    switch (type) {
      case 'water': return '#2e8bff';
      case 'mountain': return '#888888';
      default: return '#7cfc00';
    }
  };

  return (
    <div className="map-editor">
      <h2>Map Editor</h2>
      <button onClick={createEmptyMap}>Create New Map</button>
      <div className="canvas-container">
        {map && (
          <canvas
            ref={canvasRef}
            width={map.width * 32}
            height={map.height * 32}
          />
        )}
      </div>
    </div>
  );
};
