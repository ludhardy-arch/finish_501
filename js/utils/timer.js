let timer = null;

export function startTimer(seconds, cb) {
  clearTimeout(timer);
  timer = setTimeout(cb, seconds * 1000);
}

export function stopTimer() {
  clearTimeout(timer);
}
