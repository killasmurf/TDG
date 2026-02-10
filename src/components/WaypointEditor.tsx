import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SettingsPanel } from './SettingsPanel';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Point {
  x: number;
  y: number;
}

export interface MapSettings {
  name: string;
  description: string;
  startingMoney: number;
  startingLives: number;
  pathWidth: number;
  pathColor: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
}

export interface MapData {
  name: string;
  description: string;
  version: string;
  author: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  path: {
    waypoints: Point[];
    width: number;
    color: string;
  };
  settings: {
    startingMoney: number;
    startingLives: number;
  };
}

type EditorTool = 'add' | 'move' | 'delete';

interface WaypointEditorProps {
  onSave?: (mapData: MapData) => void;
  onExport?: (json: string, filename: string) => void;
  initialMapData?: MapData;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_SETTINGS: MapSettings = {
  name: 'Untitled Map',
  description: 'A custom tower defense map',
  startingMoney: 100,
  startingLives: 20,
  pathWidth: 40,
  pathColor: '#8b7355',
  canvasWidth: 800,
  canvasHeight: 600,
  backgroundColor: '#2d2d2d',
};

const WAYPOINT_RADIUS = 8;
const HOVER_RADIUS = 12;
const GRID_SIZE = 20;
const MIN_WAYPOINTS = 2;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

function isValidWaypoint(point: Point, canvasWidth: number, canvasHeight: number): boolean {
  return point.x >= 0 && point.x <= canvasWidth && 
         point.y >= 0 && point.y <= canvasHeight;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const WaypointEditor: React.FC<WaypointEditorProps> = ({
  onSave,
  onExport,
  initialMapData,
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────
  
  const [waypoints, setWaypoints] = useState<Point[]>(
    initialMapData?.path.waypoints || []
  );
  const [settings, setSettings] = useState<MapSettings>({
    ...DEFAULT_SETTINGS,
    ...(initialMapData && {
      name: initialMapData.name,
      description: initialMapData.description,
      startingMoney: initialMapData.settings.startingMoney,
      startingLives: initialMapData.settings.startingLives,
      pathWidth: initialMapData.path.width,
      pathColor: initialMapData.path.color,
      canvasWidth: initialMapData.canvas.width,
      canvasHeight: initialMapData.canvas.height,
      backgroundColor: initialMapData.canvas.backgroundColor,
    }),
  });

  const [selectedTool, setSelectedTool] = useState<EditorTool>('add');
  const [hoveredWaypointIndex, setHoveredWaypointIndex] = useState<number | null>(null);
  const [draggedWaypointIndex, setDraggedWaypointIndex] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  // ─────────────────────────────────────────────────────────────────────────
  // CANVAS RENDERING
  // ─────────────────────────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, settings.canvasWidth, settings.canvasHeight);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= settings.canvasWidth; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, settings.canvasHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y <= settings.canvasHeight; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(settings.canvasWidth, y);
        ctx.stroke();
      }
    }

    // Draw path preview
    if (waypoints.length >= 2) {
      // Draw path outline
      ctx.strokeStyle = settings.pathColor;
      ctx.lineWidth = settings.pathWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(waypoints[0].x, waypoints[0].y);
      
      for (let i = 1; i < waypoints.length; i++) {
        ctx.lineTo(waypoints[i].x, waypoints[i].y);
      }
      
      ctx.stroke();

      // Draw path centerline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(waypoints[0].x, waypoints[0].y);
      
      for (let i = 1; i < waypoints.length; i++) {
        ctx.lineTo(waypoints[i].x, waypoints[i].y);
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw waypoints
    waypoints.forEach((wp, index) => {
      const isHovered = hoveredWaypointIndex === index;
      const isDragged = draggedWaypointIndex === index;
      
      // Waypoint circle
      ctx.beginPath();
      ctx.arc(wp.x, wp.y, WAYPOINT_RADIUS, 0, Math.PI * 2);
      
      if (isDragged) {
        ctx.fillStyle = '#ffcc00';
        ctx.strokeStyle = '#ff8800';
      } else if (isHovered) {
        ctx.fillStyle = '#4a9eff';
        ctx.strokeStyle = '#2a7eff';
      } else if (index === 0) {
        ctx.fillStyle = '#44ff44'; // Start waypoint
        ctx.strokeStyle = '#22cc22';
      } else if (index === waypoints.length - 1) {
        ctx.fillStyle = '#ff4444'; // End waypoint
        ctx.strokeStyle = '#cc2222';
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#888888';
      }
      
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();

      // Waypoint number
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), wp.x, wp.y);
    });

    // Draw hover preview for add tool
    if (selectedTool === 'add' && hoveredWaypointIndex === null) {
      const mousePos = getMousePos();
      if (mousePos) {
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, WAYPOINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [waypoints, settings, showGrid, hoveredWaypointIndex, draggedWaypointIndex, selectedTool]);

  useEffect(() => {
    render();
  }, [render]);

  // ─────────────────────────────────────────────────────────────────────────
  // MOUSE INTERACTION
  // ─────────────────────────────────────────────────────────────────────────

  const getMousePos = useCallback((e?: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas || !e) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (snapEnabled) {
      return { x: snapToGrid(x, GRID_SIZE), y: snapToGrid(y, GRID_SIZE) };
    }

    return { x, y };
  }, [snapEnabled]);

  const findWaypointAtPosition = useCallback((pos: Point): number | null => {
    for (let i = waypoints.length - 1; i >= 0; i--) {
      if (distance(pos, waypoints[i]) <= HOVER_RADIUS) {
        return i;
      }
    }
    return null;
  }, [waypoints]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (!pos) return;

    const wpIndex = findWaypointAtPosition(pos);

    if (selectedTool === 'add' && wpIndex === null) {
      // Add new waypoint
      if (isValidWaypoint(pos, settings.canvasWidth, settings.canvasHeight)) {
        setWaypoints([...waypoints, pos]);
      }
    } else if (selectedTool === 'move' && wpIndex !== null) {
      // Start dragging waypoint
      isDragging.current = true;
      setDraggedWaypointIndex(wpIndex);
    } else if (selectedTool === 'delete' && wpIndex !== null) {
      // Delete waypoint
      if (waypoints.length > MIN_WAYPOINTS) {
        setWaypoints(waypoints.filter((_, i) => i !== wpIndex));
      }
    }
  }, [selectedTool, waypoints, settings, getMousePos, findWaypointAtPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (!pos) return;

    if (isDragging.current && draggedWaypointIndex !== null) {
      // Update dragged waypoint position
      if (isValidWaypoint(pos, settings.canvasWidth, settings.canvasHeight)) {
        const newWaypoints = [...waypoints];
        newWaypoints[draggedWaypointIndex] = pos;
        setWaypoints(newWaypoints);
      }
    } else {
      // Update hover state
      const wpIndex = findWaypointAtPosition(pos);
      setHoveredWaypointIndex(wpIndex);
    }

    render();
  }, [waypoints, draggedWaypointIndex, settings, getMousePos, findWaypointAtPosition, render]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    setDraggedWaypointIndex(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    setDraggedWaypointIndex(null);
    setHoveredWaypointIndex(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────

  const validate = useCallback((): string[] => {
    const errors: string[] = [];

    if (waypoints.length < MIN_WAYPOINTS) {
      errors.push(`Map must have at least ${MIN_WAYPOINTS} waypoints (currently ${waypoints.length})`);
    }

    if (!settings.name.trim()) {
      errors.push('Map name is required');
    }

    for (let i = 0; i < waypoints.length; i++) {
      if (!isValidWaypoint(waypoints[i], settings.canvasWidth, settings.canvasHeight)) {
        errors.push(`Waypoint ${i + 1} is outside canvas bounds`);
      }
    }

    return errors;
  }, [waypoints, settings]);

  useEffect(() => {
    setValidationErrors(validate());
  }, [validate]);

  // ─────────────────────────────────────────────────────────────────────────
  // MAP OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  const createMapData = useCallback((): MapData => {
    return {
      name: settings.name,
      description: settings.description,
      version: '1.0',
      author: 'Map Editor',
      canvas: {
        width: settings.canvasWidth,
        height: settings.canvasHeight,
        backgroundColor: settings.backgroundColor,
      },
      path: {
        waypoints: waypoints,
        width: settings.pathWidth,
        color: settings.pathColor,
      },
      settings: {
        startingMoney: settings.startingMoney,
        startingLives: settings.startingLives,
      },
    };
  }, [waypoints, settings]);

  const handleSave = useCallback(() => {
    const errors = validate();
    if (errors.length > 0) {
      alert('Cannot save map with validation errors:\n' + errors.join('\n'));
      return;
    }

    const mapData = createMapData();
    onSave?.(mapData);
  }, [validate, createMapData, onSave]);

  const handleExport = useCallback(() => {
    const errors = validate();
    if (errors.length > 0) {
      alert('Cannot export map with validation errors:\n' + errors.join('\n'));
      return;
    }

    const mapData = createMapData();
    const json = JSON.stringify(mapData, null, 2);
    const filename = `${settings.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    onExport?.(json, filename);
  }, [validate, createMapData, settings.name, onExport]);

  const handleClear = useCallback(() => {
    if (window.confirm('Clear all waypoints? This cannot be undone.')) {
      setWaypoints([]);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const getCursorStyle = (): string => {
    if (selectedTool === 'add') return 'crosshair';
    if (selectedTool === 'move') return hoveredWaypointIndex !== null ? 'grab' : 'default';
    if (selectedTool === 'delete') return hoveredWaypointIndex !== null ? 'not-allowed' : 'default';
    return 'default';
  };

  return (
    <div style={{ 
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      background: '#0a0e14',
      color: '#c8d0d8',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '16px',
        }}>
          <h1 style={{ 
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
            color: '#e8b059',
            letterSpacing: '0.05em',
          }}>
            🗺️ WAYPOINT MAP EDITOR
          </h1>
          <p style={{ 
            margin: '6px 0 0',
            fontSize: '12px',
            color: '#5a6a7a',
            letterSpacing: '0.08em',
          }}>
            TDG — Click to add waypoints, drag to move, right-click to delete
          </p>
        </div>

        {/* Main Editor Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          {/* Canvas */}
          <div>
            <canvas
              ref={canvasRef}
              width={settings.canvasWidth}
              height={settings.canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                cursor: getCursorStyle(),
                display: 'block',
              }}
            />

            {/* Tool Bar */}
            <div style={{ 
              marginTop: '12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}>
              <button
                onClick={() => setSelectedTool('add')}
                style={{
                  padding: '8px 16px',
                  background: selectedTool === 'add' ? 'rgba(74,158,255,0.2)' : 'transparent',
                  border: `1px solid ${selectedTool === 'add' ? '#4a9eff' : 'rgba(255,255,255,0.1)'}`,
                  color: selectedTool === 'add' ? '#4a9eff' : '#5a6a7a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                }}
              >
                ➕ ADD
              </button>
              
              <button
                onClick={() => setSelectedTool('move')}
                style={{
                  padding: '8px 16px',
                  background: selectedTool === 'move' ? 'rgba(74,158,255,0.2)' : 'transparent',
                  border: `1px solid ${selectedTool === 'move' ? '#4a9eff' : 'rgba(255,255,255,0.1)'}`,
                  color: selectedTool === 'move' ? '#4a9eff' : '#5a6a7a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                }}
              >
                ✋ MOVE
              </button>
              
              <button
                onClick={() => setSelectedTool('delete')}
                style={{
                  padding: '8px 16px',
                  background: selectedTool === 'delete' ? 'rgba(255,74,74,0.2)' : 'transparent',
                  border: `1px solid ${selectedTool === 'delete' ? '#ff4a4a' : 'rgba(255,255,255,0.1)'}`,
                  color: selectedTool === 'delete' ? '#ff4a4a' : '#5a6a7a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                }}
              >
                🗑️ DELETE
              </button>

              <div style={{ flex: 1 }} />

              <button
                onClick={() => setShowGrid(!showGrid)}
                style={{
                  padding: '8px 16px',
                  background: showGrid ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#5a6a7a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  letterSpacing: '0.08em',
                }}
              >
                GRID {showGrid ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setSnapEnabled(!snapEnabled)}
                style={{
                  padding: '8px 16px',
                  background: snapEnabled ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#5a6a7a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  letterSpacing: '0.08em',
                }}
              >
                SNAP {snapEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Settings Panel + Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              waypointCount={waypoints.length}
              validationErrors={validationErrors}
            />

            {/* Action Buttons */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              padding: '16px',
            }}>
              <h3 style={{
                margin: '0 0 12px',
                fontSize: '12px',
                color: '#e8b059',
                letterSpacing: '0.1em',
              }}>
                💾 ACTIONS
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  disabled={validationErrors.length > 0}
                  style={{
                    padding: '10px',
                    background: validationErrors.length > 0 ? '#2a2a2a' : '#1a4a1a',
                    border: validationErrors.length > 0 ? '1px solid #4a4a4a' : '1px solid #44aa44',
                    color: validationErrors.length > 0 ? '#6a6a6a' : '#66ff66',
                    borderRadius: '4px',
                    cursor: validationErrors.length > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  💾 SAVE MAP
                </button>

                <button
                  onClick={handleExport}
                  disabled={validationErrors.length > 0}
                  style={{
                    padding: '10px',
                    background: validationErrors.length > 0 ? '#2a2a2a' : '#1a1a4a',
                    border: validationErrors.length > 0 ? '1px solid #4a4a4a' : '1px solid #4444aa',
                    color: validationErrors.length > 0 ? '#6a6a6a' : '#6666ff',
                    borderRadius: '4px',
                    cursor: validationErrors.length > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  📥 EXPORT JSON
                </button>

                <button
                  onClick={handleClear}
                  style={{
                    padding: '10px',
                    background: '#4a1a1a',
                    border: '1px solid #aa4444',
                    color: '#ff6666',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  🗑️ CLEAR ALL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
