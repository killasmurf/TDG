import React, { useState, useCallback } from 'react';
import { WaypointEditor, MapData } from './WaypointEditor';
import {
  downloadMapAsJSON,
  loadMapFromFile,
  parseMapData,
  ValidationResult,
} from './MapSerializer';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MAP EDITOR APPLICATION
// ═══════════════════════════════════════════════════════════════════════════

export const MapEditorApp: React.FC = () => {
  const [currentMapData, setCurrentMapData] = useState<MapData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────

  const showNotification = useCallback((
    type: 'success' | 'error' | 'info',
    message: string,
    duration: number = 3000
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // FILE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const { data, validation } = await loadMapFromFile(file);
      
      if (!validation.valid) {
        showNotification('error', `Failed to load map: ${validation.errors.join(', ')}`);
        return;
      }

      if (validation.warnings.length > 0) {
        showNotification('info', `Map loaded with warnings: ${validation.warnings.join(', ')}`, 5000);
      } else {
        showNotification('success', `Successfully loaded "${data?.name}"`);
      }

      setCurrentMapData(data || undefined);
    } catch (error) {
      showNotification('error', `Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      // Reset file input
      event.target.value = '';
    }
  }, [showNotification]);

  const handleLoadFromJSON = useCallback(() => {
    const jsonString = prompt('Paste your map JSON here:');
    if (!jsonString) return;

    const { data, validation } = parseMapData(jsonString);
    
    if (!validation.valid) {
      showNotification('error', `Invalid map data: ${validation.errors.join(', ')}`, 5000);
      return;
    }

    if (validation.warnings.length > 0) {
      showNotification('info', `Map loaded with warnings: ${validation.warnings.join(', ')}`, 5000);
    } else {
      showNotification('success', `Successfully loaded "${data?.name}"`);
    }

    setCurrentMapData(data || undefined);
  }, [showNotification]);

  const handleNewMap = useCallback(() => {
    if (currentMapData && !window.confirm('Create a new map? Unsaved changes will be lost.')) {
      return;
    }
    setCurrentMapData(undefined);
    showNotification('info', 'Started new map');
  }, [currentMapData, showNotification]);

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE/EXPORT
  // ─────────────────────────────────────────────────────────────────────────

  const handleSave = useCallback((mapData: MapData) => {
    setCurrentMapData(mapData);
    showNotification('success', `Map "${mapData.name}" saved successfully`);
    console.log('Map saved:', mapData);
  }, [showNotification]);

  const handleExport = useCallback((json: string, filename: string) => {
    try {
      const mapData = JSON.parse(json) as MapData;
      downloadMapAsJSON(mapData, filename);
      showNotification('success', `Map exported as ${filename}`);
    } catch (error) {
      showNotification('error', 'Failed to export map');
    }
  }, [showNotification]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const notificationStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease-out',
    ...(() => {
      switch (notification?.type) {
        case 'success':
          return {
            background: '#1a4a1a',
            border: '1px solid #44aa44',
            color: '#66ff66',
          };
        case 'error':
          return {
            background: '#4a1a1a',
            border: '1px solid #aa4444',
            color: '#ff6666',
          };
        case 'info':
          return {
            background: '#1a1a4a',
            border: '1px solid #4444aa',
            color: '#6666ff',
          };
        default:
          return {};
      }
    })(),
  };

  return (
    <div>
      {/* Top Menu Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#0a0e14',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#e8b059',
          letterSpacing: '0.05em',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          🗺️ TDG MAP EDITOR
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleNewMap}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#5a6a7a',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          📄 NEW MAP
        </button>

        <label
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid rgba(74,158,255,0.3)',
            color: '#4a9eff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          📂 LOAD FILE
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={isLoading}
          />
        </label>

        <button
          onClick={handleLoadFromJSON}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid rgba(74,158,255,0.3)',
            color: '#4a9eff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          📋 PASTE JSON
        </button>

        <div style={{
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#5a6a7a',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {currentMapData ? `📍 ${currentMapData.name}` : '📍 New Map'}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            padding: '24px 32px',
            background: '#0a0e14',
            border: '1px solid rgba(74,158,255,0.3)',
            borderRadius: '8px',
            color: '#4a9eff',
            fontSize: '14px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            ⏳ Loading map...
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div style={notificationStyle}>
          {notification.message}
        </div>
      )}

      {/* Main Editor */}
      <WaypointEditor
        initialMapData={currentMapData}
        onSave={handleSave}
        onExport={handleExport}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MapEditorApp;
