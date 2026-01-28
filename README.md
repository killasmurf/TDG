# README.md excerpt – Waves section

## 🎯 Waves

Waves are defined in `data/waves.json`. Each wave contains an array of **enemy** definitions:

```json
{
  "type": "basic",
  "count": 5,
  "interval": 1
}
```

- **type** – matches a key in `config.enemy`.
- **count** – number of enemies to spawn.
- **interval** – seconds between successive spawns of that type.

### Starting a Wave

Press the **Start Wave** button, or let the game auto‑start the first wave. The HUD shows current wave and progress.

```html
<button id="start-wave" class="btn">Start Wave</button>
```

```js
document.getElementById("start-wave").addEventListener("click", () => {
  waveManager.startNextWave();
});
```

