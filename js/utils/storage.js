const KEY = 'finish501_stats_v1';

const defaultStats = {
  rounds: 0,
  wins: 0,
levels: {
  1:{rounds:0,wins:0},
  2:{rounds:0,wins:0},
  3:{rounds:0,wins:0},
  4:{rounds:0,wins:0},
  5:{rounds:0,wins:0},
  6:{rounds:0,wins:0},
  7:{rounds:0,wins:0},
  8:{rounds:0,wins:0},
  9:{rounds:0,wins:0}
},

  difficulty: {
    10: { rounds: 0, wins: 0 },
    7: { rounds: 0, wins: 0 },
    5: { rounds: 0, wins: 0 },
    3: { rounds: 0, wins: 0 }
  },
  doubles: {}
};

export function loadStats() {
  return JSON.parse(localStorage.getItem(KEY)) || structuredClone(defaultStats);
}

export function saveStats(stats) {
  localStorage.setItem(KEY, JSON.stringify(stats));
}

export function resetStats() {
  localStorage.removeItem(KEY);
}
