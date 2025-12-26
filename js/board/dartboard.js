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
// ÉTAT INTERNE
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

  CX = canvas.width / 2;
  CY = canvas.height / 2;
  R  = canvas.width * 0.45;

  SLICE = (Math.PI * 2) / 20;
  START = -Math.PI / 2 - SLICE / 2;

  canvas.addEventListener('click', onClickBoard);
  render();
}

// =====================
// ROUTE STANDARD (HIGHLIGHT)
// =====================
export function setRouteHighlights(route) {
  HIGHLIGHTS = Array.isArray(route) ? route : [];
  render();
}

// =====================
// RENDER GLOBAL
// =====================
function render() {
  const ctx = CTX;
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);

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

  // ===== SISAL (VERSION ORIGINALE) =====
  drawSisal(ctx, CX, CY, R * RINGS.doubleOuter);

  // ===== OMBRE =====
  drawInnerShadow(ctx, CX, CY, R);

  // ===== FILS =====
  ctx.strokeStyle = COLORS.wire;
  ctx.lineWidth = 2;

  for (let i = 0; i < 20; i++) {
    const a = START + i * SLICE;
    ctx.beginPath();
    ctx.moveTo(
      CX + Math.cos(a) * R * RINGS.bullOuter,
      CY + Math.sin(a) * R * RINGS.bullOuter
    );
    ctx.lineTo(
      CX + Math.cos(a) * R,
      CY + Math.sin(a) * R
    );
    ctx.stroke();
  }

  drawHighlights(ctx);

  // ===== CHIFFRES =====
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < 20; i++) {
    const a = START + (i + 0.5) * SLICE;
    ctx.fillText(
      ORDER[i],
      CX + Math.cos(a) * R * 1.06,
      CY + Math.sin(a) * R * 1.06
    );
  }
}

// =====================
// CLIC SUR LA CIBLE
// =====================
function onClickBoard(e) {
  const rect = CANVAS.getBoundingClientRect();
  const x = e.clientX - rect.left - CX;
  const y = e.clientY - rect.top - CY;
  const dist = Math.hypot(x, y);

  if (dist > R) return;

  const angle =
    (Math.atan2(y, x) + Math.PI * 2 + Math.PI / 2 + SLICE / 2) % (Math.PI * 2);

  const sector = Math.min(19, Math.floor(angle / SLICE));
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
  const density = 0.15;
  for (let i = 0; i < r * r * density; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = Math.random() * r;
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
    ctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1, 1);
  }
  ctx.restore();
}

function drawInnerShadow(ctx, cx, cy, r) {
  const grad = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}
