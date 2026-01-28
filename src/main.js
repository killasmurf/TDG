// src/main.js (excerpt) – add HUD refresh
function updateHud() {
  const waveIdx = waveManager.currentWaveIndex + 1;
  const total   = waveManager.waves.length;
  document.getElementById('wave-number').textContent =
      `Wave ${waveIdx}/${total}`;

  const status = waveManager.isWaveActive
    ? `In progress (${Object.values(waveManager.spawnCounts).join(', ')})`
    : 'Ready – awaiting next wave';
  document.getElementById('wave-status').textContent = status;
}

// In the main loop
function loop(deltaTime) {
  waveManager.update(deltaTime);
  entityManager.update(deltaTime);
  updateHud();
  render();
}
