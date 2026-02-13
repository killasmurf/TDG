// src/animation/interpolation.js
// Shared interpolation utilities for skeletal animation

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Interpolate between two animation keyframes
 * Handles nested properties (e.g., {lLeg: {rot: 25, y: 5}})
 * @param {Object} a - First frame
 * @param {Object} b - Second frame
 * @param {number} t - Interpolation factor (0-1)
 * @returns {Object} Interpolated frame
 */
export function lerpFrame(a, b, t) {
  const result = {};
  for (const key of Object.keys(a)) {
    if (typeof a[key] === 'object' && a[key] !== null) {
      result[key] = {};
      for (const prop of Object.keys(a[key])) {
        const valA = a[key][prop];
        const valB = b[key]?.[prop];
        // Only lerp numeric values; snap booleans and other types
        if (typeof valA === 'number') {
          result[key][prop] = lerp(valA, typeof valB === 'number' ? valB : valA, t);
        } else {
          result[key][prop] = t < 0.5 ? valA : (valB !== undefined ? valB : valA);
        }
      }
    } else if (typeof a[key] === 'number') {
      result[key] = lerp(a[key], b[key] ?? a[key], t);
    } else {
      result[key] = t < 0.5 ? a[key] : b[key];
    }
  }
  return result;
}
