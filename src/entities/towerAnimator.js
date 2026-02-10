import { towerFrames } from '../../assets/towerFrames.js';

export const TowerAnimState = {
  IDLE: 'idle',
  FIRE: 'fire',
  UPGRADE: 'upgrade',
};

export class TowerAnimator {
  constructor(type, tier = 1) {
    this.type = type;
    this.tier = tier;
    this.state = TowerAnimState.IDLE;
    this.frameIndex = 0;
    this.time = 0;
    this.frameDuration = 150; // ms per frame
    this.fireDuration = 500; // ms total of fire animation
    this.fireTimer = 0;
    this.spriteSheet = new Image();
    this.spriteSheet.src = '/assets/tower-sprites.png'; // adjust path if needed
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.frameIndex = 0;
      this.time = 0;
      if (state === TowerAnimState.FIRE) {
        this.fireTimer = 0;
      }
    }
  }

  setTier(tier) {
    if (this.tier !== tier) {
      this.tier = tier;
    }
  }

  triggerFire() {
    this.setState(TowerAnimState.FIRE);
  }

  update(deltaTime) {
    // deltaTime in ms
    this.time += deltaTime;

    if (this.state === TowerAnimState.FIRE) {
      this.fireTimer += deltaTime;
      if (this.fireTimer >= this.fireDuration) {
        this.setState(TowerAnimState.IDLE);
      }
    }

    if (this.time >= this.frameDuration) {
      this.time -= this.frameDuration;
      this.frameIndex++;
      const frames = this.getCurrentFrames();
      if (this.frameIndex >= frames.length) {
        this.frameIndex = 0;
        if (this.state === TowerAnimState.FIRE) {
          this.setState(TowerAnimState.IDLE);
        }
      }
    }
  }

  getCurrentFrames() {
    const mapping = towerFrames[this.type];
    const frames = mapping[this.state] || mapping.idle;
    return frames;
  }

  getFrameIndex() {
    const frames = this.getCurrentFrames();
    return frames[this.frameIndex % frames.length];
  }

  render(ctx, cx, cy, scale = 1) {
    if (!this.spriteSheet.complete) return;
    const frameIdx = this.getFrameIndex();
    const columns = 16; // assume 16 columns in sprite sheet
    const frameSize = 32; // 32×32 px per frame
    const sx = (frameIdx % columns) * frameSize;
    const sy = Math.floor(frameIdx / columns) * frameSize;
    const dw = frameSize * scale;
    const dh = frameSize * scale;
    ctx.drawImage(
      this.spriteSheet,
      sx,
      sy,
      frameSize,
      frameSize,
      cx - dw / 2,
      cy - dh,
      dw,
      dh
    );
  }
}
