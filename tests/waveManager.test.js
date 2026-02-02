import WaveManager from '../src/core/waveManager.js';
import EntityManager from '../src/core/entityManager.js';

class MockEntityManager {
  constructor() {
    this.enemies = [];
    this.path = [{x:0, y:0}];
    this.listeners = {};
  }
  spawnEnemy(type, path) {
    this.enemies.push({type, path, active:true});
  }
  on(event, callback) {
    this.listeners[event] = callback;
  }
  off(event, callback) {
    delete this.listeners[event];
  }
}

describe('WaveManager', () => {
  const waves = [
    {
      name: 'Test',
      enemies: [{type:'basic', count:2, interval:1}]
    }
  ];
  const mockEm = new MockEntityManager();
  const wm = new WaveManager(mockEm, waves);

  test('starts next wave', () => {
    expect(wm.startNextWave()).toBe(true);
    expect(wm.isWaveActive).toBe(true);
  });

  test('spawns enemies over time', () => {
    wm.startNextWave();
    for(let t = 0; t < 3000; t+=1000){
       wm.update(1000);
    }
    expect(mockEm.enemies.length).toBe(2);
  });
});
