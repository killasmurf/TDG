// tests/towerAnimator.test.js
import { TowerAnimator, TowerAnimState } from '../src/entities/towerAnimator.js';

describe('TowerAnimator', () => {
  const frameDuration = 150;
  const fireDuration = 500;

  test('initial state is idle', () => {
    const a = new TowerAnimator('basic');
    expect(a.state).toBe(TowerAnimState.IDLE);
  });

  test('triggerFire sets state to FIRE and resets timer', () => {
    const a = new TowerAnimator('basic');
    a.triggerFire();
    expect(a.state).toBe(TowerAnimState.FIRE);
    expect(a.fireTimer).toBe(0);
  });

  test('fire animation ends after fireDuration and returns to IDLE', () => {
    const a = new TowerAnimator('basic');
    a.triggerFire();
    a.update(fireDuration + 200);
    expect(a.state).toBe(TowerAnimState.IDLE);
  });

  test('frame index cycles correctly in IDLE state', () => {
    const a = new TowerAnimator('basic');
    const idleFrames = a.getCurrentFrames();
    let frameIdx = 0;
    for (let i = 0; i < 8; i++) {
      const idx = a.getFrameIndex();
      expect(idx).toBe(idleFrames[frameIdx % idleFrames.length]);
      frameIdx++;
      a.update(frameDuration);
    }
  });

  test('tier changes correctly affect mapping', () => {
    const a = new TowerAnimator('basic', 1);
    expect(a.getCurrentFrames()).toEqual([0,1,2,3]);
    a.setTier(2);
    expect(a.getCurrentFrames()).toEqual([0,1,2,3]);
  });

  test('fires proper fire animation frames', () => {
    const a = new TowerAnimator('basic');
    a.triggerFire();
    const fireFrames = a.getCurrentFrames();
    let frameIdx = 0;
    for (let i = 0; i < 4; i++) {
      const idx = a.getFrameIndex();
      expect(idx).toBe(fireFrames[frameIdx % fireFrames.length]);
      frameIdx++;
      a.update(frameDuration);
    }
  });
});
