import { useLayoutEffect, useRef, useState } from 'react';

/*
 * LiveBuild: the page builds itself in front of the visitor.
 *
 * Choreography (per layer, i.e. every heading / line of copy / chip / image):
 *   hidden ──(an idle agent claims it)──▶ TRAVEL  curved bezier flight to the layer's top-left
 *          ──▶ DRAW    blue selection box is "dragged" open, arrow on the bottom-right handle
 *          ──▶ FILL    text is typed (staircase clip-path + I-beam caret), chips wipe L→R,
 *                       media wipes up from the bottom while settling from 1.04× scale
 *          ──▶ DONE    data-lb="1", counter++, box fades, agent dwells a beat, then idles.
 * Containers marked [data-frame] only get a brief outline flash (blueprint feel).
 *
 * Everything below is plain DOM work inside one rAF loop; React only renders an empty
 * overlay container (plus a debug HUD with ?hud). Content can never stay hidden: errors, timeouts,
 * reduced motion, ?static and print all lead to a fully revealed page.
 */

// ─── Tunables ────────────────────────────────────────────────────────────────
const T = {
  agentsDesktop: 18,
  agentsMobile: 10,
  bootMs: 480, // twinkling "+" swarm before work starts
  startJitter: 200, // first-task desync
  claimJitter: 90, // later-task desync
  travelMin: 350,
  travelMax: 900,
  bootTravelMax: 520, // first claims glide in faster so boxes show up ~1s after load
  drawMin: 250,
  drawMax: 450,
  typeBase: 250,
  typePerChar: 14,
  typeMax: 1800,
  chipWipe: 350,
  mediaWipe: 600,
  dwellMin: 100,
  dwellMax: 250,
  boxFadeDelay: 200,
  fadeMs: 200,
  linger: 1200, // idle agents hover as arrows this long before going "+"
  frameDraw: 450,
  frameHold: 1100,
  maxFrames: 6,
  forceRatio: 0.55, // safety net: ≥55% visible …
  forceAfter: 2800, // … for this long (at 1×) → instant reveal
  scanEvery: 100,
  statsEvery: 125,
  nearPointer: 120,
  idleSleep: 1500,
  finaleAgents: 6, // agents that gather around the email CTA once the build is done
  finaleGap: 26, // min px between the CTA box and an orbiting cursor
};

const COLORS = ['#ff4d4d', '#4dd4ff', '#ffd24d', '#7cff6b', '#c084ff', '#ff8ad8', '#ffffff', '#5b8cff', '#ff9a3c', '#3dffd1'];
const LAYER_SEL = 'h1,h2,h3,h4,h5,p,li,a,button,img,dt,dd,figcaption,label,[data-layer]';
// Text containers that stay one layer when their only matching children are inline (e.g. <p> with a link).
const TEXTY = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'P', 'DT', 'DD', 'FIGCAPTION', 'LABEL']);

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t, s = 0.9) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2; // tiny overshoot

function isStaticMode() {
  try {
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      /[?&]static\b/.test(window.location.search) ||
      window.matchMedia('print').matches
    );
  } catch {
    return true;
  }
}

/** Last-resort reveal for anything we may have hidden or clipped. */
function revealEverything() {
  document.querySelectorAll('[data-lb="0"],[data-lb="2"]').forEach((el) => {
    el.style.removeProperty('clip-path');
    el.style.removeProperty('scale');
    el.setAttribute('data-lb', '1');
  });
}

// ─── Injected CSS (independent of index.css) ────────────────────────────────
const CSS = `
[data-lb="0"]{opacity:0!important}
.lb-overlay{position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden;contain:strict}
.lb-agent{position:absolute;left:0;top:0;z-index:3;opacity:0;transition:opacity .35s ease;will-change:transform,opacity}
.lb-agent.on{opacity:1}
.lb-agent svg{position:absolute;display:none;overflow:visible}
.lb-agent[data-shape=arrow] .lb-arrow,.lb-agent[data-shape=plus] .lb-plus,.lb-agent[data-shape=ibeam] .lb-ibeam{display:block}
.lb-arrow{left:-1px;top:-1px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.55))}
.lb-plus{left:-6px;top:-6px;animation:lb-tw var(--tw,1.6s) ease-in-out infinite}
.lb-ibeam{left:-4.5px;top:-8px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))}
@keyframes lb-tw{0%,100%{transform:rotate(0) scale(1);opacity:1}50%{transform:rotate(45deg) scale(.78);opacity:.55}}
.lb-box{position:absolute;left:0;top:0;z-index:2;box-sizing:border-box;border:1px solid #2aa8ff;background:rgba(42,168,255,.06);transition:opacity .2s ease;will-change:transform;contain:layout style}
.lb-box.out{opacity:0}
.lb-box[data-mode=frame]{z-index:1;background:none;border-color:rgba(42,168,255,.75)}
.lb-h{position:absolute;width:6px;height:6px;box-sizing:border-box;background:#fff;border:1px solid #2aa8ff}
.lb-h.tl{left:-3.5px;top:-3.5px}.lb-h.tr{right:-3.5px;top:-3.5px}.lb-h.bl{left:-3.5px;bottom:-3.5px}.lb-h.br{right:-3.5px;bottom:-3.5px}
.lb-dim{position:absolute;left:-1px;top:calc(100% + 5px);padding:2px 4px;border-radius:2px;background:#2aa8ff;color:#fff;font:500 9px/1 'JetBrains Mono',ui-monospace,monospace;white-space:nowrap}
.lb-ph{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(255,255,255,.06)}
.lb-box[data-kind=media]:not([data-phase=fill]) .lb-ph{display:flex}
.lb-caret{position:absolute;left:-1px;top:-1px;width:2px;display:none;background:var(--c,#2aa8ff);box-shadow:0 0 6px var(--c,#2aa8ff)}
.lb-box[data-kind=text][data-phase=fill] .lb-caret{display:block}
.lb-hud{position:fixed;left:50%;bottom:18px;z-index:95;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:5px 6px 5px 10px;border-radius:999px;background:rgba(18,18,24,.88);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 30px rgba(0,0,0,.45);color:rgba(255,255,255,.82);font:500 11px/1 'JetBrains Mono',ui-monospace,monospace;white-space:nowrap;user-select:none}
.lb-hud.min{padding:5px 8px 5px 12px}
.lb-dots{display:flex;align-items:center}
.lb-dot{width:13px;height:13px;margin-left:-4px;border-radius:50%;border:1.5px solid #121218}
.lb-num{color:#fff;font-variant-numeric:tabular-nums}
.lb-done{color:#fff}.lb-done b{color:var(--accent,#ffb020);font-weight:700}
.lb-sep{width:1px;height:14px;background:rgba(255,255,255,.14)}
.lb-bar{width:64px;height:3px;border-radius:2px;overflow:hidden;background:rgba(255,255,255,.12)}
.lb-bar i{display:block;height:100%;background:#2aa8ff;transform-origin:left;transition:transform .3s ease}
.lb-btn{appearance:none;border:0;margin:0;cursor:pointer;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.07);color:inherit;font:inherit;line-height:1}
.lb-btn:hover{background:rgba(255,255,255,.14)}
.lb-btn:focus-visible{outline:2px solid #2aa8ff;outline-offset:1px}
.lb-btn.on{background:#2aa8ff;color:#fff}
.lb-btn.x{padding:6px 8px;background:none;color:rgba(255,255,255,.5)}
.lb-btn.bare{padding:0;background:none}
@media (max-width:767px){.lb-hud{bottom:12px;gap:7px;padding:4px 4px 4px 8px;font-size:10px}.lb-bar,.lb-sep{display:none}.lb-btn{padding:5px 8px}}
@media print{[data-lb]{opacity:1!important;clip-path:none!important}.lb-overlay,.lb-hud{display:none!important}}
`;

const ICON_IMG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/></svg>';
const BOX_HTML = `<i class="lb-h tl"></i><i class="lb-h tr"></i><i class="lb-h bl"></i><i class="lb-h br"></i><span class="lb-dim"></span><span class="lb-ph">${ICON_IMG}</span><span class="lb-caret"></span>`;
const AGENT_HTML =
  '<svg class="lb-arrow" width="14" height="18" viewBox="0 0 14 18"><path d="M1.2 1.2v13.6l3.5-3.4 2.4 5.3 2.4-1.1-2.4-5.2h4.9z" fill="currentColor" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/></svg>' +
  '<svg class="lb-plus" width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
  '<svg class="lb-ibeam" width="9" height="16" viewBox="0 0 9 16"><path d="M2 1.5h5M2 14.5h5M4.5 1.5v13" fill="none" stroke="#0b0b10" stroke-width="3" stroke-linecap="round"/><path d="M2 1.5h5M2 14.5h5M4.5 1.5v13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

// ─── Layer helpers ───────────────────────────────────────────────────────────
function classify(el) {
  const tag = el.tagName.toUpperCase();
  const dl = el.getAttribute('data-layer');
  if (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS' || tag === 'SVG' || dl === 'media') return 'media';
  if (tag === 'A' || tag === 'BUTTON' || dl === 'chip') return 'chip';
  return (el.textContent || '').trim().length ? 'text' : 'chip';
}

/** sr-only / ~1px elements: never layers (never hidden, never counted). */
function isVisuallyHidden(el) {
  if (el.closest('.sr-only')) return true;
  if (el.tagName === 'IMG') return false; // images may be 0-high until they load
  const r = el.getBoundingClientRect();
  return (r.width > 0 || r.height > 0) && (r.width <= 2 || r.height <= 2);
}

const isInlineText = (el) => el.tagName !== 'IMG' && getComputedStyle(el).display === 'inline';

/** Text lines (relative to the element box) from the Range's client rects, merged by row. */
function measureLines(el, r) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = Array.from(range.getClientRects()).filter((q) => q.width > 0.5 && q.height > 0.5);
  if (!rects.length) return [{ l: 0, r: r.width, t: 0, b: r.height }];
  rects.sort((a, b) => a.top - b.top || a.left - b.left);
  const lines = [];
  for (const q of rects) {
    const rel = { l: q.left - r.left, r: q.right - r.left, t: q.top - r.top, b: q.bottom - r.top };
    const last = lines[lines.length - 1];
    if (last && rel.t < last.b - Math.min(last.b - last.t, rel.b - rel.t) * 0.5) {
      last.l = Math.min(last.l, rel.l);
      last.r = Math.max(last.r, rel.r);
      last.t = Math.min(last.t, rel.t);
      last.b = Math.max(last.b, rel.b);
    } else lines.push(rel);
  }
  return lines;
}

/** Staircase clip for typing progress p∈[0,1]: lines above fully shown, current line up to the caret. */
function textClip(L, p, W) {
  const { lines } = L;
  let rem = p * L.total;
  let i = 0;
  for (; i < lines.length - 1; i++) {
    const w = lines[i].r - lines[i].l;
    if (rem <= w) break;
    rem -= w;
  }
  const cur = lines[i];
  const x = cur.l + Math.min(rem, cur.r - cur.l);
  const next = lines[i + 1];
  const prev = lines[i - 1];
  const top = prev ? (prev.b + cur.t) / 2 : -40;
  const bot = next ? Math.max(cur.t + 1, (cur.b + next.t) / 2) : cur.b + 40;
  const f = (n) => n.toFixed(1);
  L.el.style.clipPath = `polygon(-40px -40px,${f(W + 40)}px -40px,${f(W + 40)}px ${f(top)}px,${f(x)}px ${f(top)}px,${f(x)}px ${f(bot)}px,-40px ${f(bot)}px)`;
  return { x, t: cur.t, b: cur.b };
}

// ─── Engine ──────────────────────────────────────────────────────────────────
function createEngine({ root, overlay, rootSelector, agentCount, onStats, onTour, onFail }) {
  const layers = new Map(); // el → layer state
  const frames = new Map(); // el → { drawn }
  const boxes = new Set();
  const pool = [];
  const agents = [];
  const timers = new Set();
  const t0 = performance.now();
  let queue = [];
  let speed = 1;
  let pressure = 1;
  let raf = 0;
  let running = false;
  let dead = false;
  let booted = false;
  let shown = false;
  let last = t0;
  let lastScan = -1e9;
  let lastStats = -1e9;
  let lastBusy = t0;
  let lastBuilt = -1;
  let lastTotal = -1;
  let lastDone = false;
  let pendingInView = 0;
  let below = false;
  let above = false;
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let px = -1e4;
  let py = -1e4;
  let tour = null;
  let moTimer = 0;
  let finale = false; // email CTA built & on screen → a few agents point at it
  let cta = null;

  // Durations shrink with the speed toggle and when lots of layers are waiting.
  const k = () => 1 / (speed * pressure);

  // ── Layer lifecycle ──
  function complete(L) {
    const el = L.el;
    L.state = 'built';
    L.agent = null;
    if (!el.isConnected) return;
    el.style.removeProperty('clip-path');
    el.style.removeProperty('scale');
    el.setAttribute('data-lb', '1');
  }

  /** Instant reveal (safety net / late-added layers). Releases any agent working on it. */
  function reveal(L, now = performance.now()) {
    const a = L.agent;
    complete(L);
    if (a) {
      if (a.box) fadeBox(a.box, now, 0);
      a.box = null;
      a.L = null;
      a.state = 'dwell';
      a.t0 = now;
      a.dur = T.dwellMin;
    }
  }

  function discover(initial) {
    const all = [];
    root.querySelectorAll(LAYER_SEL).forEach((el) => {
      if (!el.closest('[data-lb-skip]') && !isVisuallyHidden(el)) all.push(el);
    });
    // Leaf-most rule, except text containers whose matching children are all inline.
    const picked = [];
    const covered = new Set();
    for (const el of all) {
      const inner = Array.from(el.querySelectorAll(LAYER_SEL)).filter((c) => !c.closest('[data-lb-skip]'));
      if (!inner.length) picked.push(el);
      else if (TEXTY.has(el.tagName) && inner.every(isInlineText)) {
        picked.push(el);
        inner.forEach((c) => covered.add(c));
      }
    }
    const seen = new Set();
    const now = performance.now();
    for (const el of picked) {
      if (covered.has(el)) continue;
      seen.add(el);
      if (layers.has(el)) continue;
      const L = { el, kind: classify(el), state: 'hidden', since: 0, rect: null, agent: null, lines: null, total: 0, chars: 0 };
      layers.set(el, L);
      // Late arrivals already on screen were visible during the debounce: never yank them away.
      if (!initial && booted && onScreen(el)) complete(L);
      else el.setAttribute('data-lb', '0');
    }
    for (const [el, L] of layers) {
      if (seen.has(el)) continue;
      if (L.state !== 'built') reveal(L, now); // no longer a layer → make sure it is visible
      layers.delete(el);
    }
    root.querySelectorAll('[data-frame]').forEach((el) => {
      if (!frames.has(el) && !el.closest('[data-lb-skip]')) frames.set(el, { drawn: false });
    });
    for (const el of frames.keys()) if (!el.isConnected) frames.delete(el);
  }

  function onScreen(el) {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh && (r.width > 0 || r.height > 0);
  }

  // ── Every ~100ms: who is in view, safety net, task queue, frame flashes ──
  function scanView(now) {
    vw = window.innerWidth;
    vh = window.innerHeight;
    const bandTop = -vh * 0.05;
    const bandBot = vh * 1.08;
    const q = [];
    below = above = false;
    pendingInView = 0;
    for (const L of layers.values()) {
      if (L.state === 'built') continue;
      if (!L.el.isConnected) continue;
      const r = L.el.getBoundingClientRect();
      L.rect = r;
      if (r.width === 0 && r.height === 0) {
        L.since = 0;
        continue;
      }
      if (!(r.bottom > bandTop && r.top < bandBot && r.right > 0 && r.left < vw)) {
        L.since = 0;
        if (r.top >= bandBot) below = true;
        else above = true;
        continue;
      }
      pendingInView++;
      const visW = Math.min(r.right, vw) - Math.max(r.left, 0);
      const visH = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const ratio = visW > 0 && visH > 0 ? (visW * visH) / Math.max(1, Math.min(r.width * r.height, vw * vh)) : 0;
      if (ratio >= T.forceRatio) {
        if (!L.since) L.since = now;
        const limit = (L.state === 'hidden' ? T.forceAfter : T.forceAfter + 2500) / speed;
        if (now - L.since > limit) {
          reveal(L, now);
          continue;
        }
      } else L.since = 0;
      if (L.state === 'hidden') q.push(L);
    }
    // Reading order: rows (12px bands) top→bottom, then left→right.
    q.sort((a, b) => Math.round(a.rect.top / 12) - Math.round(b.rect.top / 12) || a.rect.left - b.rect.left);
    queue = q;
    pressure = clamp(1 + 0.4 * (q.length / agents.length - 1), 1, 1.9);
    updateFinale();

    if (!booted) return;
    let active = 0;
    for (const b of boxes) if (b.mode === 'frame') active++;
    for (const [el, F] of frames) {
      if (F.drawn || active >= T.maxFrames) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.top < vh * 0.88 && r.bottom > vh * 0.1) {
        F.drawn = true;
        active++;
        const b = makeBox('frame', 'frame', el, '#2aa8ff');
        b.t0 = now;
      }
    }
  }

  // ── Selection boxes (pooled) ──
  function makeBox(mode, kind, el, color) {
    let n = pool.pop();
    if (!n) {
      n = document.createElement('div');
      n.innerHTML = BOX_HTML;
      overlay.appendChild(n);
    }
    n.className = 'lb-box';
    n.dataset.mode = mode;
    n.dataset.kind = kind;
    n.dataset.phase = 'draw';
    n.style.display = '';
    n.style.width = n.style.height = '0px';
    n.style.setProperty('--c', color);
    const b = { n, el, mode, gw: 0, gh: 0, rect: null, t0: 0, fadeAt: 0, out: false, lastDim: '' };
    b.dim = n.querySelector('.lb-dim');
    b.caret = n.querySelector('.lb-caret');
    boxes.add(b);
    return b;
  }

  function fadeBox(b, now, delay) {
    if (!b.fadeAt) b.fadeAt = now + delay;
  }

  function releaseBox(b) {
    boxes.delete(b);
    b.n.style.display = 'none';
    pool.push(b.n);
  }

  function writeBoxes(now) {
    for (const b of boxes) {
      const r = b.rect;
      if (!r) {
        releaseBox(b);
        continue;
      }
      if (b.mode === 'frame') {
        const t = now - b.t0;
        b.gw = b.gh = easeOutCubic(Math.min(1, t / T.frameDraw));
        if (t > T.frameHold) fadeBox(b, now, 0);
      }
      if (b.fadeAt && now >= b.fadeAt) {
        if (!b.out) {
          b.out = true;
          b.n.classList.add('out');
        }
        if (now >= b.fadeAt + T.fadeMs + 40) {
          releaseBox(b);
          continue;
        }
      }
      const w = r.width * b.gw;
      const h = r.height * b.gh;
      b.n.style.transform = `translate3d(${r.left.toFixed(1)}px,${r.top.toFixed(1)}px,0)`;
      b.n.style.width = `${w.toFixed(1)}px`;
      b.n.style.height = `${h.toFixed(1)}px`;
      const dim = `${Math.round(w)} × ${Math.round(h)}`;
      if (dim !== b.lastDim) b.dim.textContent = b.lastDim = dim;
    }
  }

  // ── Agents ──
  function makeAgent(i) {
    const n = document.createElement('div');
    const color = COLORS[i % COLORS.length];
    n.className = 'lb-agent';
    n.innerHTML = AGENT_HTML;
    n.style.color = color;
    n.style.setProperty('--tw', `${rand(1.2, 2.2).toFixed(2)}s`);
    n.style.transitionDelay = `${Math.round(i * 40 + rand(0, 220))}ms`; // staggered boot fade-in
    n.querySelector('.lb-plus').style.animationDelay = `-${rand(0, 2).toFixed(2)}s`;
    n.dataset.shape = 'plus';
    overlay.appendChild(n);
    const x = rand(0.06, 0.94) * vw;
    const y = rand(0.08, 0.88) * vh;
    return {
      n, color, x, y, sx: x, sy: y, hx: x, hy: y,
      ax: i % 2 ? rand(0.03, 0.13) : rand(0.87, 0.97), // margin anchor (fraction of vw)
      ay: rand(0.15, 0.85),
      i, seed: rand(0, 1000), rot: 0, arc: 0, shape: 'plus', near: false,
      state: 'boot', readyAt: t0 + T.bootMs + rand(0, T.startJitter), idleSince: 0,
      t0: 0, dur: 0, L: null, box: null,
    };
  }

  function setShape(a, s) {
    if (a.shape !== s) a.n.dataset.shape = a.shape = s;
  }

  function toIdle(a, now) {
    a.state = 'idle';
    a.idleSince = now;
    a.readyAt = now;
    a.hx = a.x;
    a.hy = a.y;
    a.L = null;
  }

  function abandon(a, now) {
    if (a.box) fadeBox(a.box, now, 0);
    a.box = null;
    if (a.L && a.L.state !== 'built') {
      a.L.el.style.removeProperty('clip-path');
      a.L.el.style.removeProperty('scale');
      if (a.L.el.isConnected) a.L.el.setAttribute('data-lb', '0');
      a.L.state = 'hidden';
      a.L.agent = null;
    }
    toIdle(a, now);
  }

  function claim(a, L, now) {
    L.state = 'claimed';
    L.agent = a;
    a.L = L;
    a.state = 'travel';
    a.sx = a.x;
    a.sy = a.y;
    const dist = Math.hypot(L.rect.left - a.x, L.rect.top - a.y);
    a.dur = clamp(T.travelMin + dist * 0.6, T.travelMin, now - t0 < 2500 ? T.bootTravelMax : T.travelMax) * k();
    a.t0 = now + rand(0, T.claimJitter); // boot readyAt already carries the 0-350ms start jitter
    a.arc = rand(0.1, 0.25) * (Math.random() < 0.5 ? -1 : 1);
  }

  /** Hand the reading-ordered queue to the nearest idle agents, one agent per layer. */
  function assign(now) {
    if (!queue.length) return;
    const free = agents.filter((a) => a.state === 'idle' && now >= a.readyAt);
    for (const L of queue) {
      if (!free.length) break;
      if (L.state !== 'hidden' || !L.el.isConnected) continue;
      let best = 0;
      let bestD = Infinity;
      free.forEach((a, i) => {
        const d = Math.hypot(L.rect.left - a.x, L.rect.top - a.y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      claim(free[best], L, now);
      free.splice(best, 1);
    }
    queue = queue.filter((L) => L.state === 'hidden');
  }

  function beginFill(a, L, r, now) {
    const el = L.el;
    a.state = 'fill';
    a.t0 = now;
    L.state = 'filling';
    a.box.n.dataset.phase = 'fill';
    if (L.kind === 'text') {
      L.lines = measureLines(el, r);
      L.total = L.lines.reduce((s, l) => s + (l.r - l.l), 0) || 1;
      L.chars = Math.max(1, (el.textContent || '').trim().length);
      a.dur = Math.min(T.typeMax, T.typeBase + T.typePerChar * L.chars) * k();
      textClip(L, 0, r.width);
    } else if (L.kind === 'chip') {
      a.dur = T.chipWipe * k();
      el.style.clipPath = `inset(-3px ${(r.width + 6).toFixed(1)}px -3px -3px)`;
    } else {
      a.dur = T.mediaWipe * k();
      el.style.clipPath = 'inset(100% -3px -3px -3px)';
      el.style.scale = '1.04';
    }
    el.setAttribute('data-lb', '2'); // visible but clipped: set after the clip, same frame → no flash
  }

  /** Advance one agent; returns true while it is doing visible work. */
  function stepAgent(a, now, dt) {
    const L = a.L;
    if (L && (!L.el.isConnected || L.state === 'built')) abandon(a, now);
    let x = a.x;
    let y = a.y;
    let working = false;

    switch (a.state) {
      case 'boot':
        if (now >= a.readyAt) {
          toIdle(a, now);
          a.idleSince = now - T.linger;
          a.n.style.transitionDelay = '';
        }
        break;

      case 'idle': {
        // Linger near the last job as an arrow, then drift to a margin anchor (biased toward
        // where unbuilt content waits) and wander there as a twinkling "+".
        const ts = now / 1000;
        const s = a.seed;
        const lingering = now - a.idleSince < T.linger;
        if (!lingering) {
          const ayf = below ? a.ay * 0.4 + 0.51 : above ? a.ay * 0.4 + 0.09 : a.ay;
          const f = Math.min(1, dt * 0.35);
          a.hx += (a.ax * vw - a.hx) * f;
          a.hy += (ayf * vh - a.hy) * f;
        }
        const amp = lingering ? 0.3 : 1;
        let wx = a.hx + amp * (Math.sin(ts * 0.55 + s) * 22 + Math.sin(ts * 1.31 + s * 1.7) * 8);
        let wy = a.hy + amp * (Math.cos(ts * 0.47 + s * 2.3) * 18 + Math.sin(ts * 1.07 + s * 0.9) * 7);
        const orbit = finale && a.i < T.finaleAgents;
        if (orbit) {
          // Slow orbit around the CTA, pushed outside a keep-out box. The cursor body (~14x18,
          // down-right of the tip) gets extra clearance on the left/top so it never covers the label.
          const r = cta.getBoundingClientRect();
          const g = T.finaleGap;
          const l0 = r.left - g - 16, r0 = r.right + g + 4, tp = r.top - g - 20, b0 = r.bottom + g + 4;
          const ang = (a.i / T.finaleAgents) * Math.PI * 2 + ts * 0.35;
          wx = (l0 + r0) / 2 + Math.cos(ang) * ((r0 - l0) / 2 + 8);
          wy = (tp + b0) / 2 + Math.sin(ang) * ((b0 - tp) / 2 + 8);
          if (wx > l0 && wx < r0 && wy > tp && wy < b0) {
            const hx = Math.min(wx - l0, r0 - wx);
            const hy = Math.min(wy - tp, b0 - wy);
            if (hx < hy) wx = wx - l0 < r0 - wx ? l0 : r0;
            else wy = wy - tp < b0 - wy ? tp : b0;
          }
          a.hx = x; // on release, wander from where we are
          a.hy = y;
        }
        const f2 = 1 - Math.exp(-dt * (orbit ? 3.2 : 2.5));
        x += (wx - x) * f2;
        y += (wy - y) * f2;
        setShape(a, lingering || orbit ? 'arrow' : 'plus');
        break;
      }

      case 'travel': {
        const r = L.el.getBoundingClientRect();
        if (r.top > vh * 1.35 || r.bottom < -vh * 0.35 || (r.width === 0 && r.height === 0)) {
          abandon(a, now); // scrolled far away before we arrived: put it back in the pool
          break;
        }
        const t = (now - a.t0) / a.dur;
        if (t < 0) break; // start delay
        working = true;
        // Quadratic bezier to the (live, scroll-tracking) top-left, bowed sideways by a.arc.
        const u = easeOutBack(Math.min(1, t));
        const ex = r.left;
        const ey = r.top;
        const dx = ex - a.sx;
        const dy = ey - a.sy;
        const cx = a.sx + dx / 2 - dy * a.arc;
        const cy = a.sy + dy / 2 + dx * a.arc;
        const iu = 1 - u;
        x = iu * iu * a.sx + 2 * iu * u * cx + u * u * ex;
        y = iu * iu * a.sy + 2 * iu * u * cy + u * u * ey;
        setShape(a, 'arrow');
        if (t >= 1) {
          a.box = makeBox('layer', L.kind, L.el, a.color);
          a.box.rect = r;
          a.state = 'draw';
          a.t0 = now;
          a.dur = (T.drawMin + Math.min(T.drawMax - T.drawMin, (r.width + r.height) / 6)) * k();
        }
        break;
      }

      case 'draw': {
        // Drag the selection open from the top-left; the arrow rides the bottom-right handle.
        working = true;
        const b = a.box;
        const r = b.rect;
        const t = Math.min(1, (now - a.t0) / a.dur);
        const p = easeInOutCubic(t);
        b.gw = b.gh = p;
        x = r.left + r.width * p;
        y = r.top + r.height * p;
        setShape(a, 'arrow');
        if (t >= 1) beginFill(a, L, r, now);
        break;
      }

      case 'fill': {
        working = true;
        const b = a.box;
        const r = b.rect;
        const el = L.el;
        const t = Math.min(1, (now - a.t0) / a.dur);
        if (L.kind === 'text') {
          // Quantised to characters so it reads as typing, not a smooth wipe.
          const p = t >= 1 ? 1 : Math.floor(t * L.chars) / L.chars;
          const c = textClip(L, p, r.width);
          b.caret.style.transform = `translate3d(${c.x.toFixed(1)}px,${c.t.toFixed(1)}px,0)`;
          b.caret.style.height = `${Math.max(8, c.b - c.t).toFixed(1)}px`;
          x = r.left + c.x + 5;
          y = r.top + (c.t + c.b) / 2 + 3;
          setShape(a, 'ibeam');
        } else if (L.kind === 'chip') {
          const p = easeInOutCubic(t);
          el.style.clipPath = `inset(-3px ${((1 - p) * (r.width + 6)).toFixed(1)}px -3px -3px)`;
          x = r.left + r.width * p;
          y = r.top + r.height * 0.7;
          setShape(a, 'arrow');
        } else {
          const p = easeOutCubic(t);
          el.style.clipPath = `inset(${((1 - p) * (r.height + 6)).toFixed(1)}px -3px -3px -3px)`;
          el.style.scale = (1.04 - 0.04 * p).toFixed(4);
          x = r.left + r.width * 0.82;
          y = r.top + r.height * (1 - p);
          setShape(a, 'arrow');
        }
        if (t >= 1) {
          complete(L);
          fadeBox(b, now, T.boxFadeDelay);
          a.box = null;
          a.L = null;
          a.state = 'dwell';
          a.t0 = now;
          a.dur = rand(T.dwellMin, T.dwellMax) / speed;
        }
        break;
      }

      case 'dwell':
        working = true;
        if (now - a.t0 >= a.dur) toIdle(a, now);
        break;
    }

    // Write: base position + tiny hand jitter while working; arrows lean into their velocity.
    const vx = (x - a.x) / Math.max(dt, 0.001);
    a.x = x;
    a.y = y;
    let jx = 0;
    let jy = 0;
    if (working && a.state !== 'travel') {
      jx = Math.sin(now * 0.017 + a.seed) * 1.1;
      jy = Math.cos(now * 0.013 + a.seed * 1.3) * 1.1;
    }
    const targetRot = a.shape === 'arrow' ? clamp(vx / 40, -18, 18) : 0;
    a.rot += (targetRot - a.rot) * Math.min(1, dt * 10);
    a.n.style.transform = `translate3d(${(x + jx).toFixed(1)}px,${(y + jy).toFixed(1)}px,0) rotate(${a.rot.toFixed(1)}deg)`;
    const near = Math.hypot(x - px, y - py) < T.nearPointer;
    if (near !== a.near) {
      a.near = near;
      a.n.style.opacity = near ? '0.35' : '';
    }
    return working || a.state === 'boot';
  }

  function updateFinale() {
    if (!cta || !cta.isConnected) cta = root.querySelector('#contact [data-cta="email"]');
    const L = cta && layers.get(cta);
    const r = cta && cta.getBoundingClientRect();
    finale = !!(booted && r && (!L || L.state === 'built') && r.bottom > 0 && r.top < vh && r.width > 0);
  }

  function emitStats() {
    if (!onStats) return; // stats only feed the ?hud debug panel
    let built = 0;
    for (const L of layers.values()) if (L.state === 'built') built++;
    const done = lastDone || (layers.size > 0 && (built === layers.size || finale)); // latches once reached
    if (built !== lastBuilt || layers.size !== lastTotal || done !== lastDone) {
      lastBuilt = built;
      lastTotal = layers.size;
      lastDone = done;
      onStats({ built, total: layers.size, done });
    }
  }

  // ── Main loop ──
  function tick(now) {
    raf = 0;
    if (dead) return;
    try {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!shown && now - t0 > 40) {
        shown = true;
        agents.forEach((a) => a.n.classList.add('on'));
      }
      if (!booted && now - t0 >= T.bootMs) booted = true;
      if (now - lastScan >= T.scanEvery) {
        lastScan = now;
        scanView(now);
      }
      if (booted) assign(now);
      for (const b of boxes) b.rect = b.el.isConnected ? b.el.getBoundingClientRect() : null; // measure…
      let busy = false;
      for (const a of agents) busy = stepAgent(a, now, dt) || busy;
      writeBoxes(now); // …then write
      if (now - lastStats >= T.statsEvery) {
        lastStats = now;
        emitStats();
      }
      if (busy || boxes.size || queue.length || pendingInView || !booted || tour || finale) lastBusy = now;
      if (now - lastBusy > T.idleSleep) {
        running = false; // nothing to do: sleep until scroll / resize / mutation / pointer
        emitStats();
        return;
      }
      raf = requestAnimationFrame(tick);
    } catch (err) {
      fail(err);
    }
  }

  function wake() {
    if (dead || running || document.hidden) return;
    running = true;
    last = lastBusy = performance.now();
    raf = requestAnimationFrame(tick);
  }

  // ── Tour: auto-scroll section by section, waiting for each to finish building ──
  const sleep = (ms) =>
    new Promise((res) => {
      const id = setTimeout(() => {
        timers.delete(id);
        res();
      }, ms);
      timers.add(id);
    });

  function scrollToEl(el) {
    const lenis = window.__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') lenis.scrollTo(el, { offset: -40, duration: 1.6, lock: false });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
  }

  function stopTour() {
    if (!tour) return;
    tour.cancelled = true;
    tour = null;
    if (!dead) onTour(false);
  }

  async function runTour(token) {
    const secs = Array.from(document.querySelectorAll(`${rootSelector} section`)).filter(
      (s) => !s.parentElement?.closest(`${rootSelector} section`),
    );
    const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    let i = atEnd ? 0 : secs.findIndex((s) => s.getBoundingClientRect().bottom > window.innerHeight * 0.6);
    if (i < 0) i = 0;
    for (; i < secs.length; i++) {
      if (token.cancelled) return;
      scrollToEl(secs[i]);
      await sleep(1700);
      const until = performance.now() + 6000;
      while (!token.cancelled && pendingInView > 0 && performance.now() < until) await sleep(150);
      if (token.cancelled) return;
      await sleep(1200);
    }
    if (tour === token) stopTour();
  }

  function startTour() {
    if (tour || dead) return;
    tour = { cancelled: false };
    onTour(true);
    wake();
    runTour(tour).catch(() => stopTour());
  }

  // ── Listeners ──
  const onScroll = () => wake();
  const onResize = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    wake();
  };
  const onPointer = (e) => {
    px = e.clientX;
    py = e.clientY;
    wake();
  };
  const onUser = (e) => {
    if (!tour) return;
    const t = e.target;
    if (t && t.closest && t.closest('[data-lb-hud]')) return;
    stopTour();
  };
  const onVis = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      running = false;
    } else wake();
  };
  const USER_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  const mo = new MutationObserver(() => {
    if (moTimer || dead) return;
    moTimer = setTimeout(() => {
      moTimer = 0;
      if (dead) return;
      try {
        discover(false);
        lastScan = -1e9;
        wake();
      } catch (err) {
        fail(err);
      }
    }, 200);
  });

  function teardown() {
    dead = true;
    cancelAnimationFrame(raf);
    raf = 0;
    running = false;
    clearTimeout(moTimer);
    timers.forEach(clearTimeout);
    timers.clear();
    mo.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVis);
    USER_EVENTS.forEach((ev) => window.removeEventListener(ev, onUser, true));
    if (tour) tour.cancelled = true;
    tour = null;
    // Mark everything built (never hidden after teardown); a fresh engine re-hides on mount.
    for (const L of layers.values()) if (L.state !== 'built') complete(L);
    revealEverything();
  }

  function fail(err) {
    if (dead) return;
    teardown();
    overlay.style.display = 'none';
    if (import.meta.env?.DEV) console.warn('[LiveBuild] disabled after error:', err);
    onFail();
  }

  // ── Init ──
  try {
    discover(true);
    for (let i = 0; i < agentCount; i++) agents.push(makeAgent(i));
    mo.observe(root, { childList: true, subtree: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    USER_EVENTS.forEach((ev) => window.addEventListener(ev, onUser, { passive: true, capture: true }));
    emitStats();
    wake();
  } catch (err) {
    fail(err);
  }

  return {
    setSpeed: (s) => {
      speed = s;
      wake();
    },
    startTour,
    stopTour,
    destroy() {
      if (!dead) teardown();
      agents.forEach((a) => a.n.remove());
      boxes.forEach((b) => b.n.remove());
      pool.forEach((n) => n.remove());
    },
  };
}

// Debug HUD (agents / layers / Tour / speed) only with ?hud in the URL.
function isHudMode() {
  try {
    return /[?&]hud\b/.test(window.location.search);
  } catch {
    return false;
  }
}

// ─── React shell: overlay container (+ debug HUD) ───────────────────────────
export default function LiveBuild({ rootSelector = 'main' }) {
  const [enabled, setEnabled] = useState(() => typeof window !== 'undefined' && !isStaticMode());
  const [agentCount] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? T.agentsMobile : T.agentsDesktop,
  );
  const [hud] = useState(() => typeof window !== 'undefined' && isHudMode());
  const [stats, setStats] = useState({ built: 0, total: 0, done: false });
  const [touring, setTouring] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const overlayRef = useRef(null);
  const engineRef = useRef(null);

  // Layout effect: layers are hidden after commit but before the first paint (no flash).
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const root = document.querySelector(rootSelector);
    if (!root || !overlayRef.current) return undefined;
    const style = document.createElement('style');
    style.setAttribute('data-livebuild', '');
    style.textContent = CSS;
    document.head.appendChild(style);
    const engine = createEngine({
      root,
      overlay: overlayRef.current,
      rootSelector,
      agentCount,
      onStats: hud ? setStats : null,
      onTour: setTouring,
      onFail: () => setEnabled(false),
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
      style.remove();
    };
  }, [enabled, rootSelector, agentCount, hud]);

  if (!enabled) return null;
  if (!hud) return <div ref={overlayRef} className="lb-overlay" aria-hidden="true" data-lb-skip="" />;

  const pct = stats.total ? stats.built / stats.total : 0;
  const dots = (
    <span className="lb-dots" aria-hidden="true">
      {COLORS.slice(0, 5).map((c, i) => (
        <i key={c} className="lb-dot" style={{ background: c, zIndex: 5 - i }} />
      ))}
    </span>
  );
  const toggleTour = () => (touring ? engineRef.current?.stopTour() : engineRef.current?.startTour());
  const toggleSpeed = () => {
    const s = speed === 1 ? 2 : 1;
    setSpeed(s);
    engineRef.current?.setSpeed(s);
  };

  return (
    <>
      <div ref={overlayRef} className="lb-overlay" aria-hidden="true" data-lb-skip="" />
      {collapsed ? (
        <div className="lb-hud min" data-lb-skip="" data-lb-hud="">
          <button type="button" className="lb-btn bare" onClick={() => setCollapsed(false)} aria-label="Show live build panel">
            {dots}
          </button>
        </div>
      ) : (
        <div className="lb-hud" data-lb-skip="" data-lb-hud="" role="region" aria-label="Live build status">
          {dots}
          <span>
            <span className="lb-num">{agentCount}</span> agents
          </span>
          <span className="lb-sep" />
          {stats.done ? (
            <span className="lb-done">
              Build complete <b aria-hidden="true">✓</b>
            </span>
          ) : (
            <span>
              <span className="lb-num">{stats.built}</span> / {stats.total} layers
            </span>
          )}
          <span className="lb-bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${pct})` }} />
          </span>
          <button type="button" className={`lb-btn${touring ? ' on' : ''}`} onClick={toggleTour} aria-pressed={touring}>
            {touring ? 'Touring' : 'Tour'}
          </button>
          <button type="button" className="lb-btn" onClick={toggleSpeed} aria-label={`Build speed ${speed}x`}>
            {speed}×
          </button>
          <button type="button" className="lb-btn x" onClick={() => setCollapsed(true)} aria-label="Collapse live build panel">
            ×
          </button>
        </div>
      )}
    </>
  );
}
