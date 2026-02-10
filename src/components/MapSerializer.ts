// ═══════════════════════════════════════════════════════════════════════════
// MAP SERIALIZER
// Handles JSON export/import and file operations for map data
// ═══════════════════════════════════════════════════════════════════════════

import { MapData, Point } from './WaypointEditor';

// ─────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMapData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check top-level structure
  if (!data || typeof data !== 'object') {
    errors.push('Map data must be an object');
    return { valid: false, errors, warnings };
  }

  // Required fields
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Map must have a valid name');
  }
  if (!data.version || typeof data.version !== 'string') {
    errors.push('Map must have a version');
  }

  // Canvas validation
  if (!data.canvas || typeof data.canvas !== 'object') {
    errors.push('Map must have canvas configuration');
  } else {
    if (typeof data.canvas.width !== 'number' || data.canvas.width <= 0) {
      errors.push('Canvas width must be a positive number');
    }
    if (typeof data.canvas.height !== 'number' || data.canvas.height <= 0) {
      errors.push('Canvas height must be a positive number');
    }
    if (!data.canvas.backgroundColor || typeof data.canvas.backgroundColor !== 'string') {
      warnings.push('Canvas background color not specified, will use default');
    }
  }

  // Path validation
  if (!data.path || typeof data.path !== 'object') {
    errors.push('Map must have path configuration');
  } else {
    if (!Array.isArray(data.path.waypoints)) {
      errors.push('Path waypoints must be an array');
    } else {
      if (data.path.waypoints.length < 2) {
        errors.push('Path must have at least 2 waypoints');
      }
      
      // Validate each waypoint
      data.path.waypoints.forEach((wp: any, index: number) => {
        if (typeof wp.x !== 'number' || typeof wp.y !== 'number') {
          errors.push(`Waypoint ${index + 1} must have numeric x and y coordinates`);
        }
        if (data.canvas && (
          wp.x < 0 || wp.x > data.canvas.width ||
          wp.y < 0 || wp.y > data.canvas.height
        )) {
          warnings.push(`Waypoint ${index + 1} is outside canvas bounds`);
        }
      });
    }

    if (typeof data.path.width !== 'number' || data.path.width <= 0) {
      errors.push('Path width must be a positive number');
    }
    if (!data.path.color || typeof data.path.color !== 'string') {
      warnings.push('Path color not specified, will use default');
    }
  }

  // Settings validation
  if (!data.settings || typeof data.settings !== 'object') {
    errors.push('Map must have game settings');
  } else {
    if (typeof data.settings.startingMoney !== 'number' || data.settings.startingMoney < 0) {
      errors.push('Starting money must be a non-negative number');
    }
    if (typeof data.settings.startingLives !== 'number' || data.settings.startingLives <= 0) {
      errors.push('Starting lives must be a positive number');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────

export function serializeMapData(mapData: MapData): string {
  return JSON.stringify(mapData, null, 2);
}

export function downloadMapAsJSON(mapData: MapData, filename?: string): void {
  const json = serializeMapData(mapData);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${mapData.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function copyMapToClipboard(mapData: MapData): Promise<void> {
  const json = serializeMapData(mapData);
  return navigator.clipboard.writeText(json);
}

// ─────────────────────────────────────────────────────────────────────────
// IMPORT
// ─────────────────────────────────────────────────────────────────────────

export function parseMapData(jsonString: string): { data: MapData | null; validation: ValidationResult } {
  try {
    const data = JSON.parse(jsonString);
    const validation = validateMapData(data);
    
    if (!validation.valid) {
      return { data: null, validation };
    }
    
    return { data: data as MapData, validation };
  } catch (error) {
    return {
      data: null,
      validation: {
        valid: false,
        errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      },
    };
  }
}

export function loadMapFromFile(file: File): Promise<{ data: MapData | null; validation: ValidationResult }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        reject(new Error('Failed to read file content'));
        return;
      }
      
      const result = parseMapData(content);
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

export function createDefaultMapData(): MapData {
  return {
    name: 'Untitled Map',
    description: 'A custom tower defense map',
    version: '1.0',
    author: 'Map Editor',
    canvas: {
      width: 800,
      height: 600,
      backgroundColor: '#2d2d2d',
    },
    path: {
      waypoints: [],
      width: 40,
      color: '#8b7355',
    },
    settings: {
      startingMoney: 100,
      startingLives: 20,
    },
  };
}

export function cloneMapData(mapData: MapData): MapData {
  return JSON.parse(JSON.stringify(mapData));
}

// ─────────────────────────────────────────────────────────────────────────
// PATH UTILITIES
// ─────────────────────────────────────────────────────────────────────────

export function calculatePathLength(waypoints: Point[]): number {
  if (waypoints.length < 2) return 0;
  
  let totalLength = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dy = waypoints[i].y - waypoints[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }
  
  return totalLength;
}

export function simplifyPath(waypoints: Point[], tolerance: number = 10): Point[] {
  if (waypoints.length <= 2) return waypoints;
  
  // Ramer-Douglas-Peucker algorithm
  const simplified: Point[] = [waypoints[0]];
  
  const rdp = (points: Point[], start: number, end: number, tolerance: number) => {
    if (end - start <= 1) return;
    
    let maxDist = 0;
    let maxIndex = start;
    
    const p1 = points[start];
    const p2 = points[end];
    const lineLength = Math.sqrt(
      (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
    );
    
    for (let i = start + 1; i < end; i++) {
      const p = points[i];
      
      // Calculate perpendicular distance from point to line
      const dist = Math.abs(
        (p2.y - p1.y) * p.x -
        (p2.x - p1.x) * p.y +
        p2.x * p1.y -
        p2.y * p1.x
      ) / lineLength;
      
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }
    
    if (maxDist > tolerance) {
      rdp(points, start, maxIndex, tolerance);
      simplified.push(points[maxIndex]);
      rdp(points, maxIndex, end, tolerance);
    }
  };
  
  rdp(waypoints, 0, waypoints.length - 1, tolerance);
  simplified.push(waypoints[waypoints.length - 1]);
  
  return simplified;
}

export function reversePathDirection(waypoints: Point[]): Point[] {
  return [...waypoints].reverse();
}

// ─────────────────────────────────────────────────────────────────────────
// CONVERSION (Future: Tile-Based Support)
// ─────────────────────────────────────────────────────────────────────────

export interface TileGrid {
  width: number;
  height: number;
  tileSize: number;
  tiles: ('grass' | 'water' | 'mountain' | 'path')[][];
}

// Placeholder for future tile-based conversion
export function waypointsToTileGrid(
  waypoints: Point[],
  pathWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  tileSize: number = 32
): TileGrid {
  const gridWidth = Math.ceil(canvasWidth / tileSize);
  const gridHeight = Math.ceil(canvasHeight / tileSize);
  
  // Initialize with grass
  const tiles: ('grass' | 'water' | 'mountain' | 'path')[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill('grass'));
  
  // Mark path tiles (simplified algorithm)
  for (let i = 1; i < waypoints.length; i++) {
    const p1 = waypoints[i - 1];
    const p2 = waypoints[i];
    
    // Bresenham's line algorithm to mark path
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const sx = p1.x < p2.x ? 1 : -1;
    const sy = p1.y < p2.y ? 1 : -1;
    let err = dx - dy;
    
    let x = p1.x;
    let y = p1.y;
    
    while (true) {
      const tileX = Math.floor(x / tileSize);
      const tileY = Math.floor(y / tileSize);
      
      if (tileX >= 0 && tileX < gridWidth && tileY >= 0 && tileY < gridHeight) {
        tiles[tileY][tileX] = 'path';
      }
      
      if (x === p2.x && y === p2.y) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }
  
  return {
    width: gridWidth,
    height: gridHeight,
    tileSize,
    tiles,
  };
}

// Placeholder for future tile-to-waypoint conversion
export function tileGridToWaypoints(tileGrid: TileGrid): Point[] {
  // This would implement pathfinding through 'path' tiles
  // to generate waypoints
  // For now, return empty array
  console.warn('tileGridToWaypoints not yet implemented');
  return [];
}
