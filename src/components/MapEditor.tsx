import React, { useState, useRef, useEffect } from 'react';
import './MapEditor.css';

export interface Tile {
  type: 'grass' | 'water' | 'mountain';
  sprite?: string;          // optional URL (e.g., '/assets/mountain.png')
}

export interface MapData {
  width: number;
  height: number;
  tiles: Tile[][];
}

export const MapEditor: React.FC = () => {
  const [map, setMap] = useState<MapData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ----------------------------------------------------------- */
  /*  Render background mountains before drawing other tiles     */
  /* ----------------------------------------------------------- */
  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    map: MapData
  ) => {
    if (!map) return;
    const tileSize = 32;
    const mountainImg = new Image();
    mountainImg.src = '/assets/mountain.png';        // <-- adjust if you move the sprite

    /* Draw individual tiles that are not mountains (grass / water) */
    const renderRegularTiles = () => {
      if (!map) return;
      for (let x = 0; x < map.width; x++) {
        for (let y = 0; y < map.height; y++) {
          const tile = map.tiles[x][y];
          if (tile.type !== 'mountain') {
            ctx.fillStyle = getColorForTile(tile.type);
            ctx.fillRect(
              x * tileSize,
              y * tileSize,
              tileSize,
              tileSize
            );
          }
        }
      }
    };

    mountainImg.onload = () => {
      // First draw all mountains
      for (let x = 0; x < map.width; x++) {
        for (let y = 0; y < map.height; y++) {
          if (map.tiles[x][y].type === 'mountain') {
            ctx.drawImage(
              mountainImg,
              x * tileSize,
              y * tileSize,
              tileSize,
              tileSize
            );
          }
        }
      }
      // Then overlay the other tiles on top
      renderRegularTiles();
    };
  };

  const getColorForTile = (type: string) => {
    switch (type) {
      case 'water':
        return '#2e8bff';
      case 'mountain':
        return '#888888';
      default:
        return '#7cfc00';
    }
  };

  /* ----------------------------------------------------------- */
  /*  Canvas effect hook                                       */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const mapInfo = map ?? { width: 0, height: 0 };
    canvasRef.current.width  = mapInfo.width  * 32;
    canvasRef.current.height = mapInfo.height * 32;
    ctx.clearRect(
      0, 0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    drawBackground(ctx, map!);
  }, [map]);

  /* ----------------------------------------------------------- */
  /*  UI actions                                               */
  /* ----------------------------------------------------------- */
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

  /* ----------------------------------------------------------- */
  /*  Render                                               */
  /* ----------------------------------------------------------- */
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