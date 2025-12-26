import { addDart } from '../game/gameManager.js';

// =====================
// CONSTANTES
// =====================
const ORDER = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

const COLORS = {
  black: '#0b0b0f',
  white: '#f2f2f2',
  red: '#b61f2a',
  green: '#1aa35e',
  wire: '#222'
};

const HIGHLIGHT_BLUE = 'rgba(8,0,196,';

const RINGS = {
  doubleOuter: 1.0,
  doubleInner: 0.94,
  tripleOuter: 0.62,
  tripleInner: 0.56,
  bullOuter: 0.10,
  bullInner: 0.05
};

// =====================
// ÉTAT
// =====================
let CANVAS, CTX;
let CX, CY, R, SLICE, START;
let HIGHLIGHTS = [];

// =====================
// INIT
// =====================
export function drawBoard(canvas) {
  CANVAS = canvas;
  CTX = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.onclick = onClickBoard;
}

// =====================
// CANVAS RESPONSIVE + RETINA
// =====================
function resizeCanvas() {
  const cssSize = Math.min(window.innerWidth * 0.9, 700);
  const dpr = window.devicePixelRatio || 1;

  CANVAS.style.width = cssSize + 'px';
  CANVAS.style.height = cssSize + 'px';

  CANVAS.width = cssSize * dpr;
  CANVAS.height = cssSize * dpr;

  CTX.setTransform(dpr, 0, 0, dpr, 0, 0);

  CX = cssSize / 2;
  CY = cssSize / 2;
  R  = cssSize * 0.45;

  SLICE = (Math.PI * 2) / 20;
  START = -Math.PI / 2 - SLICE / 2;

  render();
}

function cssCanvasSize() {
  const dpr = window.devicePixelRatio || 1;
  return {
    w: CANVAS.width / dpr,
    h: CANVAS.height / dpr
  };
}

// =====================
// ROUTE STANDARD
// =====================
export function setRouteHighlights(route) {
  HIGHLIGHTS = Array.isArray(route) ? route : [];
  render();
}

// =====================
// RENDER
// =====================
function render() {
  const ctx = CTX;
  const { w, h } = cssCanvasSize();

  ctx.clearRect(0, 0, w, h);

  // ===== SECTEURS =====
  for (let i = 0; i < 20; i++) {
    const a0 = START + i * SLICE;
    const a1 = a0 + SLICE;

    drawSector(ctx, CX, CY, R * RINGS.doubleInner, R * RINGS.tripleOuter, a0, a1,
      i % 2 === 0 ? COLORS.black : COLORS.white);

    drawSector(ctx, CX, CY, R * RINGS.tripleInner, R * RINGS.bullOuter, a0, a1,
      i % 2 === 0 ? COLORS.black : COLORS.white);

    drawSector(ctx, CX, CY, R * RINGS.tripleInner, R * RINGS.tripleOuter, a0, a1,
      i % 2 === 0 ? COLORS.red : COLORS.green);

    drawSector(ctx, CX, CY, R * RINGS.doubleInner, R * RINGS.doubleOuter, a0, a1,
      i % 2 === 0 ? COLORS.red : COLORS.green);
  }

  // ===== BULL =====
  circle(ctx, CX, CY, R * RINGS.bullOuter, COLORS.green);
  circle(ctx, CX, CY, R * RINGS.bullInner, COLORS.red);

  drawSisal(ctx, CX, CY, R);
  drawInnerShadow(ctx, CX, CY, R);

  // ===== FILS =====
  ctx.strokeStyle = COLORS.wire;
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const a = START + i * SLICE;
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(a) * R * RINGS.bullOuter,
               CY + Math.sin(a) * R * RINGS.bullOuter);
    ctx.lineTo(CX + Math.cos(a) * R,
               CY + Math.sin(a) * R);
    ctx.stroke();
  }

  drawHighlights(ctx);

  // ===== CHIFFRES (100% PROPORTIONNELS) =====
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${R * 0.085}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < 20; i++) {
    const a = START + (i + 0.5) * SLICE;
    ctx.fillText(
      ORDER[i],
      CX + Math.cos(a) * R * 1.08,
      CY + Math.sin(a) * R * 1.08
    );
  }
}

// =====================
// HIGHLIGHTS (ANTI-BAVE)
// =====================
function drawHighlights(ctx) {
  if (!HIGHLIGHTS.length) return;

  HIGHLIGHTS.forEach((hit, idx) => {
    const alpha = idx === 0 ? 0.9 : idx === 1 ? 0.7 : 0.55;

    if (hit === 'Bull') {
      glowCircle(ctx, CX, CY, R * RINGS.bullInner, alpha);
      return;
    }

    if (hit === '25') {
      glowRing(ctx, CX, CY,
        R * RINGS.bullInner,
        R * RINGS.bullOuter,
        alpha
      );
      return;
    }

    const m = /^([SDT])(\d{1,2})$/.exec(hit);
    if (!m) return;

    const type = m[1];
    const num = Number(m[2]);
    const sector = ORDER.indexOf(num);
    if (sector === -1) return;

    const a0 = START + sector * SLICE;
    const a1 = a0 + SLICE;

    if (type === 'D') {
      glowSector(ctx, CX, CY,
        R * RINGS.doubleInner,
        R * RINGS.doubleOuter,
        a0, a1, alpha
      );
    } else if (type === 'T') {
      glowSector(ctx, CX, CY,
        R * RINGS.tripleInner,
        R * RINGS.tripleOuter,
        a0, a1, alpha
      );
    } else {
      glowSector(ctx, CX, CY,
        R * RINGS.doubleInner,
        R * RINGS.tripleOuter,
        a0, a1, alpha
      );
    }
  });
}

// =====================
// GLOW HELPERS (CLIP TOTAL)
// =====================
function glowSector(ctx, cx, cy, rIn, rOut, a0, a1, alpha) {
  const { w, h } = cssCanvasSize();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rOut, a0, a1);
  ctx.arc(cx, cy, rIn, a1, a0, true);
  ctx.closePath();

  ctx.save();
  ctx.clip();

  ctx.globalAlpha = 0.85 * alpha;
  ctx.fillStyle = `${HIGHLIGHT_BLUE}1)`;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 16;
  ctx.shadowColor = `${HIGHLIGHT_BLUE}1)`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = `${HIGHLIGHT_BLUE}1)`;
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function glowRing(ctx, cx, cy, rIn, rOut, alpha) {
  const { w, h } = cssCanvasSize();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rOut, 0, Math.PI * 2);
  ctx.arc(cx, cy, rIn, Math.PI * 2, 0, true);
  ctx.closePath();

  ctx.save();
  ctx.clip();

  ctx.globalAlpha = 0.85 * alpha;
  ctx.fillStyle = `${HIGHLIGHT_BLUE}1)`;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 16;
  ctx.shadowColor = `${HIGHLIGHT_BLUE}1)`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = `${HIGHLIGHT_BLUE}1)`;
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function glowCircle(ctx, cx, cy, r, alpha) {
  const { w, h } = cssCanvasSize();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();

  ctx.save();
  ctx.clip();

  ctx.globalAlpha = 0.9 * alpha;
  ctx.fillStyle = `${HIGHLIGHT_BLUE}1)`;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 18;
  ctx.shadowColor = `${HIGHLIGHT_BLUE}1)`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = `${HIGHLIGHT_BLUE}1)`;
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

// =====================
// CLICK
// =====================
function onClickBoard(e) {
  const rect = CANVAS.getBoundingClientRect();
  const x = e.clientX - rect.left - CX;
  const y = e.clientY - rect.top - CY;
  const dist = Math.hypot(x, y);
  if (dist > R) return;

  const angle =
    (Math.atan2(y, x) + Math.PI * 2 + Math.PI / 2 + SLICE / 2) % (Math.PI * 2);

  const sector = Math.floor(angle / SLICE);
  const num = ORDER[sector];

  let hit = { label: `S${num}`, value: num, isDouble: false };

  if (dist <= R * RINGS.bullInner)
    hit = { label: 'Bull', value: 50, isDouble: true };
  else if (dist <= R * RINGS.bullOuter)
    hit = { label: '25', value: 25, isDouble: false };
  else if (dist >= R * RINGS.doubleInner)
    hit = { label: `D${num}`, value: num * 2, isDouble: true };
  else if (dist >= R * RINGS.tripleInner && dist <= R * RINGS.tripleOuter)
    hit = { label: `T${num}`, value: num * 3, isDouble: false };

  addDart(hit);
}

// =====================
// HELPERS
// =====================
function drawSector(ctx, cx, cy, rIn, rOut, a0, a1, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, rOut, a0, a1);
  ctx.arc(cx, cy, rIn, a1, a0, true);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function circle(ctx, cx, cy, r, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSisal(ctx, cx, cy, r) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < r * r * 0.15; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = Math.random() * r;
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
    ctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1, 1);
  }
  ctx.restore();
}

function drawInnerShadow(ctx, cx, cy, r) {
  const g = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}
