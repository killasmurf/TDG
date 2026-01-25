/**
 * EventEmitter - Centralized event system for game communication
 * Enables loose coupling between entities and game systems
 */
export class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Register an event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} callback - Function to call when event occurs
   * @param {Object} context - Optional context to bind callback to
   */
  on(eventType, callback, context = null) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType).push({
      callback,
      context,
    });
  }

  /**
   * Register a one-time event listener (auto-removes after first trigger)
   * @param {string} eventType - Type of event to listen for
   * @param {Function} callback - Function to call when event occurs
   * @param {Object} context - Optional context to bind callback to
   */
  once(eventType, callback, context = null) {
    const wrapper = (data) => {
      callback.call(context, data);
      this.off(eventType, wrapper);
    };
    this.on(eventType, wrapper, context);
  }

  /**
   * Remove an event listener
   * @param {string} eventType - Type of event
   * @param {Function} callback - Callback to remove
   */
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;

    const listeners = this.listeners.get(eventType);
    const index = listeners.findIndex((l) => l.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // Clean up empty listener arrays
    if (listeners.length === 0) {
      this.listeners.delete(eventType);
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param {string} eventType - Type of event to emit
   * @param {*} data - Event data to pass to listeners
   */
  emit(eventType, data = null) {
    if (!this.listeners.has(eventType)) return;

    const listeners = this.listeners.get(eventType);

    // Create a copy to avoid issues if listeners are removed during iteration
    const listenersCopy = [...listeners];

    for (const { callback, context } of listenersCopy) {
      try {
        if (context) {
          callback.call(context, data);
        } else {
          callback(data);
        }
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    }
  }

  /**
   * Remove all listeners for a specific event type or all events
   * @param {string} eventType - Optional event type to clear (clears all if not provided)
   */
  clear(eventType = null) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get count of listeners for an event type
   * @param {string} eventType - Event type to check
   * @returns {number} Number of listeners
   */
  listenerCount(eventType) {
    return this.listeners.has(eventType) ? this.listeners.get(eventType).length : 0;
  }

  /**
   * Check if an event type has any listeners
   * @param {string} eventType - Event type to check
   * @returns {boolean} True if has listeners
   */
  hasListeners(eventType) {
    return this.listenerCount(eventType) > 0;
  }
}

/**
 * Game Event Types - Centralized definition of all game events
 */
export const GameEvents = {
  // Enemy events
  ENEMY_SPAWNED: 'enemy:spawned',
  ENEMY_KILLED: 'enemy:killed',
  ENEMY_REACHED_END: 'enemy:reached_end',
  ENEMY_DAMAGED: 'enemy:damaged',

  // Tower events
  TOWER_PLACED: 'tower:placed',
  TOWER_FIRED: 'tower:fired',
  TOWER_TARGET_ACQUIRED: 'tower:target_acquired',
  TOWER_TARGET_LOST: 'tower:target_lost',

  // Projectile events
  PROJECTILE_FIRED: 'projectile:fired',
  PROJECTILE_HIT: 'projectile:hit',
  PROJECTILE_MISSED: 'projectile:missed',

  // Game state events
  WAVE_STARTED: 'wave:started',
  WAVE_COMPLETED: 'wave:completed',
  GAME_OVER: 'game:over',
  GAME_WON: 'game:won',

  // Resource events
  GOLD_CHANGED: 'gold:changed',
  LIVES_CHANGED: 'lives:changed',
};

// Create and export a singleton instance for global use
export const gameEvents = new EventEmitter();
