import { drawBoard, setRouteHighlights } from './board/dartboard.js';
import {
  startGame,
  resetGame,
  validateEarly,
  undoLastDart
} from './game/gameManager.js';

// =====================
// INIT CIBLE
// =====================
const canvas = document.getElementById('dartboard');
drawBoard(canvas);

// =====================
// BOUTON PRINCIPAL (UI ONLY)
// =====================
const mainBtn = document.getElementById('mainActionBtn');
let mode = 'GO';

mainBtn.addEventListener('click', () => {
  if (mode === 'GO') {
    startGame();
    setValidateMode();
  } else if (mode === 'VALIDATE') {
    validateEarly();
    forceGoMode();
  }
});

// =====================
// MODES UI
// =====================
function forceGoMode() {
  mode = 'GO';
  mainBtn.textContent = 'GO';
  mainBtn.classList.remove('validate');
}

function setValidateMode() {
  mode = 'VALIDATE';
  mainBtn.textContent = 'VALIDER';
  mainBtn.classList.add('validate');
}

// =====================
// ACTIONS SECONDAIRES
// =====================
document.getElementById('undoBtn').addEventListener('click', undoLastDart);

document.getElementById('resetBtn').addEventListener('click', () => {
  resetGame();
  forceGoMode();
});

// =====================
// ROUTE STANDARD → CIBLE
// =====================
window.addEventListener('standardRoute', (e) => {
  const route = e.detail?.route || [];
  setRouteHighlights(route);

  // 🔒 quoi qu’il arrive, retour UI en mode GO
  forceGoMode();
});
