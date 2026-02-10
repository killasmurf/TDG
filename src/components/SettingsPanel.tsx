import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

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

interface SettingsPanelProps {
  settings: MapSettings;
  onSettingsChange: (settings: MapSettings) => void;
  waypointCount: number;
  validationErrors: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  waypointCount,
  validationErrors,
}) => {
  const updateSetting = <K extends keyof MapSettings>(
    key: K,
    value: MapSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: '#c8d0d8',
    fontSize: '11px',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    color: '#7a8a9a',
    marginBottom: '4px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '6px',
      padding: '16px',
      height: 'fit-content',
    }}>
      <h3 style={{
        margin: '0 0 16px',
        fontSize: '12px',
        color: '#e8b059',
        letterSpacing: '0.1em',
      }}>
        ⚙️ MAP SETTINGS
      </h3>

      {/* Map Info */}
      <div style={sectionStyle}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Map Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => updateSetting('name', e.target.value)}
            placeholder="Enter map name"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={settings.description}
            onChange={(e) => updateSetting('description', e.target.value)}
            placeholder="Map description"
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '60px',
            }}
          />
        </div>
      </div>

      {/* Gameplay Settings */}
      <div style={sectionStyle}>
        <h4 style={{
          margin: '0 0 12px',
          fontSize: '11px',
          color: '#4a9eff',
          letterSpacing: '0.08em',
        }}>
          💰 GAMEPLAY
        </h4>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Starting Money</label>
          <input
            type="number"
            value={settings.startingMoney}
            onChange={(e) => updateSetting('startingMoney', parseInt(e.target.value) || 0)}
            min={0}
            max={10000}
            step={10}
            style={inputStyle}
          />
          <div style={{ 
            fontSize: '9px', 
            color: '#4a5a6a', 
            marginTop: '4px',
            fontStyle: 'italic',
          }}>
            Initial money for tower purchases
          </div>
        </div>

        <div>
          <label style={labelStyle}>Starting Lives</label>
          <input
            type="number"
            value={settings.startingLives}
            onChange={(e) => updateSetting('startingLives', parseInt(e.target.value) || 0)}
            min={1}
            max={100}
            step={1}
            style={inputStyle}
          />
          <div style={{ 
            fontSize: '9px', 
            color: '#4a5a6a', 
            marginTop: '4px',
            fontStyle: 'italic',
          }}>
            Number of enemies that can leak
          </div>
        </div>
      </div>

      {/* Path Settings */}
      <div style={sectionStyle}>
        <h4 style={{
          margin: '0 0 12px',
          fontSize: '11px',
          color: '#4a9eff',
          letterSpacing: '0.08em',
        }}>
          🛤️ PATH
        </h4>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Path Width</label>
          <input
            type="number"
            value={settings.pathWidth}
            onChange={(e) => updateSetting('pathWidth', parseInt(e.target.value) || 0)}
            min={20}
            max={100}
            step={5}
            style={inputStyle}
          />
          <div style={{ 
            fontSize: '9px', 
            color: '#4a5a6a', 
            marginTop: '4px',
            fontStyle: 'italic',
          }}>
            Width in pixels (affects tower placement)
          </div>
        </div>

        <div>
          <label style={labelStyle}>Path Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={settings.pathColor}
              onChange={(e) => updateSetting('pathColor', e.target.value)}
              style={{
                width: '40px',
                height: '32px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                background: 'transparent',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={settings.pathColor}
              onChange={(e) => updateSetting('pathColor', e.target.value)}
              placeholder="#8b7355"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Canvas Settings */}
      <div style={sectionStyle}>
        <h4 style={{
          margin: '0 0 12px',
          fontSize: '11px',
          color: '#4a9eff',
          letterSpacing: '0.08em',
        }}>
          🖼️ CANVAS
        </h4>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Canvas Size</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                value={settings.canvasWidth}
                onChange={(e) => updateSetting('canvasWidth', parseInt(e.target.value) || 0)}
                min={400}
                max={1600}
                step={100}
                placeholder="Width"
                style={inputStyle}
              />
              <div style={{ fontSize: '9px', color: '#4a5a6a', marginTop: '2px' }}>
                Width
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#5a6a7a',
              fontSize: '14px',
            }}>
              ×
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                value={settings.canvasHeight}
                onChange={(e) => updateSetting('canvasHeight', parseInt(e.target.value) || 0)}
                min={300}
                max={1200}
                step={100}
                placeholder="Height"
                style={inputStyle}
              />
              <div style={{ fontSize: '9px', color: '#4a5a6a', marginTop: '2px' }}>
                Height
              </div>
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Background Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => updateSetting('backgroundColor', e.target.value)}
              style={{
                width: '40px',
                height: '32px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                background: 'transparent',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) => updateSetting('backgroundColor', e.target.value)}
              placeholder="#2d2d2d"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Map Stats */}
      <div style={{
        background: 'rgba(74,158,255,0.05)',
        border: '1px solid rgba(74,158,255,0.15)',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '16px',
      }}>
        <h4 style={{
          margin: '0 0 8px',
          fontSize: '10px',
          color: '#4a9eff',
          letterSpacing: '0.08em',
        }}>
          📊 MAP STATS
        </h4>
        <div style={{ fontSize: '10px', color: '#7a9aaa', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Waypoints:</span>
            <span style={{ 
              color: waypointCount >= 2 ? '#66ff66' : '#ff6666',
              fontWeight: 600,
            }}>
              {waypointCount} {waypointCount >= 2 ? '✓' : '✗'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Canvas:</span>
            <span style={{ color: '#c8d0d8' }}>
              {settings.canvasWidth}×{settings.canvasHeight}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Path Width:</span>
            <span style={{ color: '#c8d0d8' }}>
              {settings.pathWidth}px
            </span>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div style={{
          padding: '12px',
          background: 'rgba(255,74,74,0.1)',
          border: '1px solid rgba(255,74,74,0.3)',
          borderRadius: '4px',
          marginBottom: '16px',
        }}>
          <strong style={{ 
            fontSize: '11px', 
            color: '#ff6666',
            display: 'block',
            marginBottom: '8px',
          }}>
            ⚠️ Validation Errors:
          </strong>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            fontSize: '10px', 
            color: '#ff8888',
            lineHeight: 1.6,
          }}>
            {validationErrors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Future: Tile-Based Editing Section */}
      <div style={{
        padding: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '4px',
        opacity: 0.5,
      }}>
        <div style={{ fontSize: '10px', color: '#5a6a7a', textAlign: 'center' }}>
          🔮 Tile-Based Editing
          <div style={{ fontSize: '9px', marginTop: '4px', fontStyle: 'italic' }}>
            Coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};
