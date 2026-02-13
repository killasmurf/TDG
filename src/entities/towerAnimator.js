// src/entities/towerAnimator.js
// Factory/Router for Tower Animation System (Phase 2)
// Delegates to specific animator implementations based on tower type

import { SniperTowerAnimator } from '../animation/towerAnimators/SniperTowerAnimator.js';
import { ChurchTowerAnimator } from '../animation/towerAnimators/ChurchTowerAnimator.js';

// ═══════════════════════════════════════════════════════════════════════
// ANIMATOR TYPE MAPPING
// ═══════════════════════════════════════════════════════════════════════

const ANIMATOR_MAP = {
  basic: ChurchTowerAnimator,   // "basic" tower type = church support tower (Angels theme)
  sniper: SniperTowerAnimator,  // Long-range DPS tower
  rapid: SniperTowerAnimator,   // Rapid-fire tower (reuses sniper with speed modifier)
};

// ═══════════════════════════════════════════════════════════════════════
// TOWER ANIMATOR FACTORY/ROUTER
// ═══════════════════════════════════════════════════════════════════════

export class TowerAnimator {
  constructor(type, tier = 1) {
    this.type = type;
    this.tier = tier;

    // Select the appropriate animator class
    const AnimClass = ANIMATOR_MAP[type] || ChurchTowerAnimator;
    this._impl = new AnimClass(tier);

    // Apply type-specific modifiers
    this._applyTypeModifiers();
  }

  // Delegate all animation interface methods to the implementation
  update(deltaTime) {
    this._impl.update(deltaTime);
  }

  /**
   * Render the tower animation.
   * Accepts either a Renderer wrapper or a raw CanvasRenderingContext2D.
   * Sub-animators expect a raw ctx, so we unwrap if needed.
   */
  render(ctxOrRenderer, cx, cy, scale = 1) {
    const ctx = ctxOrRenderer.ctx ? ctxOrRenderer.ctx : ctxOrRenderer;
    this._impl.render(ctx, cx, cy, scale);
  }

  triggerFire() {
    this._impl.triggerFire();
  }

  setTier(tier) {
    this.tier = tier;
    this._impl.setTier(tier);
  }

  setState(state) {
    if (this._impl.setState) {
      this._impl.setState(state);
    }
  }

  getState() {
    return this._impl.getState ? this._impl.getState() : 'idle';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════

  _applyTypeModifiers() {
    // Apply type-specific animation speed modifiers
    switch (this.type) {
      case 'rapid':
        // Rapid tower uses sniper animator but fires much faster
        if (this._impl.setFireSpeed) {
          this._impl.setFireSpeed(3.0);  // 3x faster fire animation
        }
        if (this._impl.setIdleSpeed) {
          this._impl.setIdleSpeed(1.5);  // Slightly faster idle
        }
        break;

      case 'sniper':
        // Standard sniper speeds (no modifications needed)
        break;

      case 'basic':
        // Church tower - standard speeds for support role
        break;

      default:
        console.warn(`Unknown tower type: ${this.type}, using basic defaults`);
        break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION STATE CONSTANTS (Re-exported for compatibility)
// ═══════════════════════════════════════════════════════════════════════

export const TowerAnimState = {
  IDLE: 'idle',
  FIRE: 'fire'
};
