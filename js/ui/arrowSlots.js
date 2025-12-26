// Sélection des 3 cases de résultat
const slots = document.querySelectorAll('.slot');

// Données internes des slots
// [{ player: 'T20', solution: 'D20', show: 'solution' | 'player' }]
let slotData = [];

/**
 * Réinitialise complètement les cases
 */
export function resetSlots() {
  slotData = [];
  slots.forEach(slot => {
    slot.className = 'slot';
    slot.innerHTML = '';
    slot.onclick = null;
  });
}

/**
 * Affiche les flèches jouées par le joueur
 * @param {Array} darts
 */
export function setSlots(darts) {
  resetSlots(); // 🔥 ESSENTIEL pour undo

  darts.forEach((d, i) => {
    slotData[i] = {
      player: d.label,
      solution: null,
      show: 'player'
    };
    slots[i].innerHTML = `<div class="solution">${d.label}</div>`;
  });
}


/**
 * Valide les slots à la fin du round
 * @param {boolean} success
 * @param {string} standardRoute
 */
export function validateSlots(success, standardRoute) {
  const route = standardRoute ? standardRoute.split(' – ') : [];

  slots.forEach((slot, i) => {
    slot.classList.add(success ? 'good' : 'bad');

    const player = slotData[i]?.player || '';
    const solution = route[i] || '';

    // on conserve TOUJOURS la réponse du joueur
    slotData[i] = {
      player,
      solution,
      show: 'player'
    };

    // affichage initial
    if (player) {
      slot.innerHTML = `<div class="solution">${player}</div>`;
    } else {
      slot.innerHTML = '';
    }

    // si faux ET qu'il y a une solution → interaction
    if (!success && player && solution) {
      slot.onclick = () => toggleSlot(i);
    }
  });

  // affichage texte de la route standard (en dessous)
  const played = slotData.map(d => d.player).filter(Boolean).join(' – ');
  const el = document.getElementById('standardRoute');

  if (played && played !== standardRoute) {
    el.textContent = standardRoute;
  } else {
    el.textContent = '';
  }
}

/**
 * Bascule entre solution et flèche du joueur
 * @param {number} index
 */
function toggleSlot(index) {
  const slot = slots[index];
  const data = slotData[index];
  if (!data) return;

  if (data.show === 'solution') {
    data.show = 'player';
    slot.innerHTML = `
      <div class="solution">${data.solution}</div>
      <div class="player">${data.player}</div>
    `;
  } else {
    data.show = 'solution';
    slot.innerHTML =
      `<div class="solution">${data.solution}</div>`;
  }
}
