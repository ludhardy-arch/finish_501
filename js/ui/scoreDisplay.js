export function updateScore(wins, rounds) {
  const pct = rounds ? Math.round((wins / rounds) * 100) : 0;
  const el = document.getElementById('globalScore');
  el.textContent = `${pct}%`;
  el.style.color =
    pct > 75 ? '#00ff88' : pct > 50 ? '#ffaa00' : '#ff3355';
}
