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
// BOUTON PRINCIPAL
// =====================
const mainBtn = document.getElementById('mainActionBtn');
let mode = 'GO';

mainBtn.addEventListener('click', () => {
  if (mode === 'GO') {
    startGame();
    setValidateMode();
  } else {
    validateEarly();
    setGoMode();
  }
});

function setGoMode() {
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
  setGoMode();
});

// =====================
// ROUTE STANDARD → CIBLE
// =====================
window.addEventListener('standardRoute', (e) => {
  const route = e.detail?.route || [];
  setRouteHighlights(route);

  // auto retour en mode GO après fin de round
  setGoMode();
});
