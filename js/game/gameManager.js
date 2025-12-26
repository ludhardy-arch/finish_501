import { startTimer, stopTimer } from '../utils/timer.js';
import { setSlots, resetSlots, validateSlots } from '../ui/arrowSlots.js';
import { updateScore } from '../ui/scoreDisplay.js';
import { getCpuRoute } from './cpuManager.js';
import { loadStats, saveStats, resetStats } from '../utils/storage.js';

// =====================
// CONSTANTES
// =====================
const IMPOSSIBLE_FINISHES = [169, 168, 166, 165, 163, 162];

// =====================
// ÉTAT DU JEU
// =====================
let stats = loadStats();
let target = 0;
let darts = [];
let locked = true;
let gameRunning = false;

const mainBtn = document.getElementById('mainActionBtn');

// =====================
// LANCER UN ROUND
// =====================
export function startGame() {
  resetSlots();
  darts = [];
  locked = false;
  gameRunning = true;

  // éteindre les highlights précédents
  window.dispatchEvent(
    new CustomEvent('standardRoute', { detail: { route: [] } })
  );

  // tirage du finish
  target = getRandomTarget();
  mainBtn.textContent = target;

  stats.rounds++;
  const diff = Number(document.getElementById('difficulty').value);
  stats.difficulty[diff].rounds++;

  saveStats(stats);

  startTimer(diff, onTimeUp);
}

// =====================
// VALIDATION MANUELLE
// =====================
export function validateEarly() {
  if (!gameRunning || locked) return;
  finishRound();
}

// =====================
// RESET COMPLET
// =====================
export function resetGame() {
  stopTimer();
  resetSlots();

  darts = [];
  locked = true;
  gameRunning = false;

  mainBtn.textContent = 'GO';
  document.getElementById('standardRoute').textContent = '';

  resetStats();
  stats = loadStats();
  updateScore(stats.wins, stats.rounds);

  window.dispatchEvent(
    new CustomEvent('standardRoute', { detail: { route: [] } })
  );
}

// =====================
// AJOUT D'UNE FLÈCHE
// =====================
export function addDart(hit) {
  if (!gameRunning || locked || darts.length >= 3) return;

  darts.push(hit);
  setSlots(darts);

  if (darts.length === 3) {
    finishRound();
  }
}

// =====================
// FIN DU TIMER
// =====================
function onTimeUp() {
  finishRound();
}

// =====================
// FIN DU ROUND
// =====================
function finishRound() {
  if (locked) return;

  locked = true;
  gameRunning = false;
  stopTimer();

  const success = validateFinish();

  if (success) {
    stats.wins++;

    const lvl = getLevelFromTarget(target);
    stats.levels[lvl].wins++;

    const last = darts[darts.length - 1];
    if (last?.isDouble) {
      stats.doubles[last.label] =
        (stats.doubles[last.label] || 0) + 1;
    }

    const diff = Number(document.getElementById('difficulty').value);
    stats.difficulty[diff].wins++;
  }

  saveStats(stats);

  const standardRoute = getStandardRoute();
  validateSlots(success, standardRoute);
  updateScore(stats.wins, stats.rounds);

  window.dispatchEvent(
    new CustomEvent('standardRoute', {
      detail: { route: getCpuRoute(target) || [] }
    })
  );
}

// =====================
// VALIDATION DU FINISH
// =====================
function validateFinish() {
  if (darts.length === 0) return false;

  const sum = darts.reduce((a, d) => a + d.value, 0);
  const last = darts[darts.length - 1];

  return sum === target && last.isDouble;
}

// =====================
// TIRAGE DU SCORE (AVEC FILTRE)
// =====================
function getRandomTarget() {
  const active = [...document.querySelectorAll('.levelBtn.active')];

  if (active.length === 0) {
    alert('Sélectionne au moins un niveau');
    return 40;
  }

  let value;

  do {
    const btn = active[Math.floor(Math.random() * active.length)];
    const min = Number(btn.dataset.min);
    const max = Number(btn.dataset.max);

    value = min + Math.floor(Math.random() * (max - min + 1));
  } while (IMPOSSIBLE_FINISHES.includes(value));

  return value;
}

// =====================
// ROUTE STANDARD CPU
// =====================
function getStandardRoute() {
  const route = getCpuRoute(target);
  return route ? route.join(' – ') : '';
}

// =====================
// NIVEAU SELON SCORE
// =====================
function getLevelFromTarget(t) {
  if (t <= 20) return 1;
  if (t <= 40) return 2;
  if (t <= 60) return 3;
  if (t <= 80) return 4;
  if (t <= 100) return 5;
  if (t <= 120) return 6;
  if (t <= 140) return 7;
  if (t <= 160) return 8;
  return 9;
}

// =====================
// ANNULER DERNIÈRE FLÈCHE
// =====================
export function undoLastDart() {
  if (locked || darts.length === 0) return;

  darts.pop();
  setSlots(darts);
}
