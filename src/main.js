// src/main.js - add map editor integration (partial)
import MapEditor from './editor/MapEditor.js';
// ...existing imports

const canvas = document.getElementById('gameCanvas');
const entityManager = new EntityManager(game);
const waveManager = new WaveManager(entityManager, waves);
const editor = new MapEditor(canvas, entityManager);

const toggleEditorBtn = document.getElementById('toggle-editor');
let editorEnabled = false;

toggleEditorBtn.addEventListener('click', () => {
  editorEnabled = !editorEnabled;
  if (editorEnabled) {
    editor.enable();
    toggleEditorBtn.textContent = 'Stop Editing';
  } else {
    editor.disable();
    toggleEditorBtn.textContent = 'Edit Map';
  }
});

function loop(deltaTime) {
  if (!editorEnabled) {
    waveManager.update(deltaTime);
    entityManager.update(deltaTime);
    updateHud();
  }
  // render always runs; editor drawing only when enabled
  render();
}
