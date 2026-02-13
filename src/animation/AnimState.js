// src/animation/AnimState.js
// Shared animation state enumeration

/**
 * Animation state constants
 * Used by both enemy and tower animators
 */
export const AnimState = {
  IDLE: 'idle',
  WALK: 'walk',
  FIRE: 'fire',
  DEATH: 'death',
  SPECIAL: 'special',
};

/**
 * Check if a state is valid
 * @param {string} state - State to validate
 * @returns {boolean} True if valid
 */
export function isValidState(state) {
  return Object.values(AnimState).includes(state);
}
