import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'framer-motion';
import { SectionLabel, Chip, Tag, ease } from './ui';

// Theme colours as CSS variables (applied via style so var() resolves in SVG).
const ACCENT = 'var(--accent)';
const BUILD = 'var(--build)';
const DIM = 'var(--dim)';
const GRID = 'rgb(var(--ink-rgb) / .08)';
const AXIS = 'rgb(var(--ink-rgb) / .25)';
const mono = 'font-mono text-[10px] uppercase tracking-[0.16em] text-dim sm:text-[11px]';
const money = (n) => Number(n).toFixed(2);

// <pure> (extracted verbatim by the scratchpad verification script)
const normalPdf = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);

// Composite Simpson integration of the normal density on [0, |x|]. 128 intervals keep the
// absolute CDF error far below display precision; tails beyond 8 are below 1e-15.
function normalCdf(x) {
  if (!Number.isFinite(x)) return x > 0 ? 1 : 0;
  if (x <= -8) return 0;
  if (x >= 8) return 1;
  const end = Math.abs(x);
  const step = end / 128;
  let sum = normalPdf(0) + normalPdf(end);
  for (let i = 1; i < 128; i++) sum += (i % 2 ? 4 : 2) * normalPdf(i * step);
  const result = 0.5 + Math.sign(x) * sum * step / 3;
  return Math.max(0, Math.min(1, result));
}

function blackScholes(spot, strike, time, vol, rate, side) {
  const s = Math.max(0.01, spot);
  const k = Math.max(0.01, strike);
  const t = Math.max(0.000001, time);
  const sigma = Math.max(0.000001, vol);
  const rootT = Math.sqrt(t);
  const d1 = (Math.log(s / k) + (rate + sigma * sigma / 2) * t) / (sigma * rootT);
  const d2 = d1 - sigma * rootT;
  const discount = k * Math.exp(-rate * t);
  const pdf = normalPdf(d1);
  const call = side === 'call';
  return {
    price: call ? s * normalCdf(d1) - discount * normalCdf(d2) : discount * normalCdf(-d2) - s * normalCdf(-d1),
    delta: normalCdf(d1) - (call ? 0 : 1),
    gamma: pdf / (s * sigma * rootT),
    // per calendar day
    theta: (-s * pdf * sigma / (2 * rootT) + (call ? -1 : 1) * rate * discount * normalCdf(call ? d2 : -d2)) / 365,
    // per 1 vol point / 1 rate point
    vega: s * pdf * rootT / 100,
    rho: (call ? 1 : -1) * k * t * Math.exp(-rate * t) * normalCdf(call ? d2 : -d2) / 100,
  };
}

// Price-time priority: each side is sorted best-first, FIFO within a price. Trades print at the resting price.
class OrderBook {
  constructor() { this.bids = []; this.asks = []; this.nextId = 1; this.lastTick = 2000; }
  submit(side, type, price, qty) {
    const own = side === 'buy' ? this.bids : this.asks;
    const opposite = side === 'buy' ? this.asks : this.bids;
    const order = { id: this.nextId++, side, tick: price, qty: Math.max(0, Math.floor(qty)) };
    const trades = [];
    if (type === 'limit' && !Number.isFinite(price)) return trades;
    while (order.qty > 0 && opposite.length) {
      const best = opposite[0];
      if (type === 'limit' && (side === 'buy' ? order.tick < best.tick : order.tick > best.tick)) break;
      const size = Math.min(order.qty, best.qty);
      order.qty -= size;
      best.qty -= size;
      this.lastTick = best.tick;
      trades.push({ tick: best.tick, qty: size, side, status: order.qty ? 1 : 2, id: order.id, restingId: best.id, time: Date.now() });
      if (!best.qty) opposite.shift();
    }
    if (type === 'limit' && order.qty > 0) {
      const before = own.findIndex((entry) => side === 'buy' ? entry.tick < order.tick : entry.tick > order.tick);
      own.splice(before < 0 ? own.length : before, 0, order);
    }
    return trades;
  }
  levels(side, depth = 8) {
    const orders = side === 'ask' ? this.asks : this.bids;
    const levels = [];
    for (const order of orders) {
      const last = levels[levels.length - 1];
      if (last?.tick === order.tick) last.qty += order.qty;
      else if (levels.length === depth) break;
      else levels.push({ tick: order.tick, qty: order.qty });
    }
    return levels;
  }
  // Bound the passive queues; drops the worst-priced orders and keeps priority among the rest.
  trim(max = 120) { this.bids.length = Math.min(this.bids.length, max); this.asks.length = Math.min(this.asks.length, max); }
}
// </pure>

function NumericPrice({ value }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const current = useRef(value);
  useEffect(() => {
    if (reduced) return;
    const control = animate(current.current, value, {
      duration: 0.38, ease,
      onUpdate: (v) => { current.current = v; setShown(v); },
    });
    return () => control.stop();
  }, [value, reduced]);
  return <span>{money(reduced ? value : shown)}</span>;
}

function Slider({ id, label, value, onChange, min, max, step = 1, format = (v) => v }) {
  return <div>
    <div className="mb-2 flex items-center justify-between gap-2">
      <label htmlFor={id} className={mono}>{label}</label>
      <output htmlFor={id} className="font-mono text-sm tabular-nums text-ink">{format(value)}</output>
    </div>
    <input id={id} type="range" min={min} max={max} step={step} value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer accent-accent" />
  </div>;
}

function PriceChart({ params, result, reduced }) {
  const { spot, strike, time, vol, rate, side } = params;
  const low = spot * 0.5;
  const high = spot * 1.5;
  const points = Array.from({ length: 81 }, (_, i) => {
    const s = low + (high - low) * i / 80;
    return { s, now: blackScholes(s, strike, time, vol, rate, side).price,
      expiry: side === 'call' ? Math.max(0, s - strike) : Math.max(0, strike - s) };
  });
  const ceiling = Math.max(1, ...points.flatMap((p) => [p.now, p.expiry])) * 1.08;
  const x = (s) => 38 + (s - low) / (high - low) * 536;
  const y = (v) => 222 - v / ceiling * 188;
  const path = (key) => points.map((p, i) => `${i ? 'L' : 'M'}${x(p.s).toFixed(2)},${y(p[key]).toFixed(2)}`).join(' ');
  return <div className="mt-7 rounded-xl border border-line bg-bg/60 p-3">
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-dim">
      <span><span className="text-accent">━━</span> Theoretical now</span>
      <span><span className="text-build">┄┄</span> Payoff at expiry</span>
    </div>
    <svg viewBox="0 0 600 260" className="h-auto w-full" role="img" aria-label={`${side} value today and payoff at expiry for spot between ${money(low)} and ${money(high)}`}>
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="38" x2="574" y1={34 + i * 47} y2={34 + i * 47} style={{ stroke: GRID }} />)}
      <line x1="38" x2="574" y1="222" y2="222" style={{ stroke: AXIS }} />
      <line x1="38" x2="38" y1="34" y2="222" style={{ stroke: AXIS }} />
      <line x1={x(strike)} x2={x(strike)} y1="34" y2="222" style={{ stroke: BUILD }} strokeOpacity=".25" />
      <path d={path('expiry')} fill="none" style={{ stroke: BUILD }} strokeWidth="1.5" strokeDasharray="6 6" />
      <path d={path('now')} fill="none" style={{ stroke: ACCENT }} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={x(spot)} x2={x(spot)} y1="34" y2="222" style={{ stroke: ACCENT }} strokeOpacity=".35" strokeDasharray="3 5" />
      <motion.circle r="5" style={{ fill: ACCENT }} initial={false} animate={{ cx: x(spot), cy: y(result.price) }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 26 }} />
      <text x={Math.min(510, x(spot) + 10)} y={Math.max(24, y(result.price) - 10)} style={{ fill: ACCENT }} fontSize="12" fontFamily="JetBrains Mono, monospace">${money(result.price)}</text>
      <text x="38" y="247" style={{ fill: DIM }} fontSize="11" fontFamily="JetBrains Mono, monospace">{money(low)}</text>
      <text x="524" y="247" style={{ fill: DIM }} fontSize="11" fontFamily="JetBrains Mono, monospace">{money(high)}</text>
    </svg>
  </div>;
}

/** Static chrome of a widget card: built by the live engine. The interactive body sits in data-lb-skip. */
function PanelHead({ code, tag, kicker, title, children }) {
  return <>
    <div className="mb-6 flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
      <Tag>{tag}</Tag>
      <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">{code}</span>
    </div>
    <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="tag">{kicker}</p>
        <h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] md:text-3xl">{title}</h3>
      </div>
      {children}
    </div>
  </>;
}

function Pricer() {
  const [params, setParams] = useState({ spot: 100, strike: 100, time: 1, vol: 20, rate: 5, side: 'call' });
  const update = (key) => (value) => setParams((old) => ({ ...old, [key]: value }));
  const reduced = useReducedMotion();
  const result = useMemo(() => blackScholes(params.spot, params.strike, params.time, params.vol / 100, params.rate / 100, params.side), [params]);
  const chartParams = { ...params, vol: params.vol / 100, rate: params.rate / 100 };
  return <article data-frame className="card min-w-0 p-5 md:p-8">
    <PanelHead code="BLACK-SCHOLES // JAVA" tag="Pricer · live" kicker="Engine 01 // European option" title="Price the risk." />
    <div data-lb-skip>
      <div className="mb-6 inline-flex rounded-lg border border-line bg-bg p-1" role="group" aria-label="Option type">
        {['call', 'put'].map((side) => <button key={side} type="button" onClick={() => update('side')(side)} aria-pressed={params.side === side} className={`rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${params.side === side ? 'bg-accent text-on-accent' : 'text-dim hover:text-ink'}`}>{side}</button>)}
      </div>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Slider id="bs-spot" label="Spot · S" value={params.spot} onChange={update('spot')} min={50} max={150} format={money} />
        <Slider id="bs-strike" label="Strike · K" value={params.strike} onChange={update('strike')} min={50} max={150} format={money} />
        <Slider id="bs-time" label="Expiry · T" value={params.time} onChange={update('time')} min={0.02} max={2} step={0.01} format={(v) => `${money(v)} yr`} />
        <Slider id="bs-vol" label="Volatility · σ" value={params.vol} onChange={update('vol')} min={5} max={100} format={(v) => `${v}%`} />
        <Slider id="bs-rate" label="Risk-free · r" value={params.rate} onChange={update('rate')} min={0} max={12} step={0.25} format={(v) => `${v}%`} />
      </div>
      <div className="mt-8 border-t border-line pt-7">
        <div className={mono}>{params.side} premium // theoretical</div>
        <div className="mt-2 font-mono text-5xl font-bold tabular-nums tracking-tight text-accent sm:text-6xl"><span className="mr-1 text-3xl">$</span><NumericPrice value={result.price} /></div>
        <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {['delta', 'gamma', 'theta', 'vega', 'rho'].map((key) => <div key={key} className="min-w-0 rounded-lg border border-line bg-bg/60 p-2.5">
            <dt className="truncate font-mono text-[9px] uppercase tracking-wider text-dim">{key}{key === 'theta' ? ' /day' : key === 'vega' || key === 'rho' ? ' /1pt' : ''}</dt>
            <dd className="mt-2 font-mono text-[11px] tabular-nums text-ink sm:text-[10px] xl:text-[11px]">{result[key].toFixed(4)}</dd>
          </div>)}
        </dl>
      </div>
      <PriceChart params={chartParams} result={result} reduced={reduced} />
    </div>
  </article>;
}

const TICK = 0.05;
const formatTick = (tick) => money(tick * TICK);
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function seedBook(book) {
  for (let distance = 1; distance <= 12; distance++) {
    book.submit('buy', 'limit', 2000 - distance, 90 + randomInt(0, 90));
    book.submit('sell', 'limit', 2000 + distance, 90 + randomInt(0, 90));
  }
}

// Churning cells are plain divs/spans so the live-build engine never treats them as layers.
function BookRow({ level, side, maxQty, flash }) {
  const ask = side === 'ask';
  return <div className={`relative grid h-8 grid-cols-2 items-center overflow-hidden rounded px-3 font-mono text-xs tabular-nums ${flash ? 'bg-ink/10' : ''}`}>
    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 transition-[width] duration-300" style={{ width: `${level ? Math.max(5, level.qty / maxQty * 75) : 0}%`, backgroundColor: ask ? 'rgb(var(--sell-rgb) / .13)' : 'rgb(var(--build-rgb) / .13)' }} />
    <span className={`relative ${ask ? 'text-sell' : 'text-build'}`}>{level ? formatTick(level.tick) : '—'}</span>
    <span className="relative text-right text-ink/80">{level ? level.qty : '—'}</span>
  </div>;
}

function OrderPanel({ active }) {
  const book = useRef(null);
  if (!book.current) { book.current = new OrderBook(); seedBook(book.current); }
  const tape = useRef([]);
  const totalVolume = useRef(0);
  const recentTimes = useRef([]);
  const lastRender = useRef(0);
  const drift = useRef(2000);
  const flash = useRef(new Set());
  const flashTimer = useRef(null);
  const trailingRender = useRef(null);
  const submitRef = useRef(null);
  const [snapshot, setSnapshot] = useState(() => ({ asks: book.current.levels('ask'), bids: book.current.levels('bid'), tape: [], volume: 0, last: 2000, rate: 0, flash: [] }));
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden);

  const publish = () => {
    const now = Date.now();
    if (now - lastRender.current < 100) {
      if (!trailingRender.current) trailingRender.current = window.setTimeout(() => {
        trailingRender.current = null;
        publish();
      }, 100 - (now - lastRender.current));
      return;
    }
    lastRender.current = now;
    recentTimes.current = recentTimes.current.filter((time) => now - time < 1000);
    setSnapshot({ asks: book.current.levels('ask'), bids: book.current.levels('bid'), tape: [...tape.current], volume: totalVolume.current,
      last: book.current.lastTick, rate: recentTimes.current.length, flash: [...flash.current] });
  };
  const submit = (side, type, tick, qty, manual = false) => {
    const trades = book.current.submit(side, type, tick, qty);
    if (trades.length) {
      for (const trade of trades) {
        tape.current.unshift(trade);
        totalVolume.current += trade.qty;
        recentTimes.current.push(trade.time);
        if (manual) flash.current.add(trade.tick);
      }
      tape.current.length = Math.min(tape.current.length, 7);
      if (manual) {
        window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => { flash.current.clear(); publish(); }, 650);
      }
    }
    book.current.trim();
    publish();
  };
  submitRef.current = submit;
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(flashTimer.current);
      window.clearTimeout(trailingRender.current);
    };
  }, []);
  useEffect(() => {
    if (!active || !visible || paused) return;
    const timer = window.setInterval(() => {
      const b = book.current;
      // Mean-reverting random walk around tick 2000 (= 100.00) for where passive orders land.
      drift.current += Math.sign(2000 - drift.current) * (Math.random() < 0.3 ? 1 : 0);
      if (Math.random() < 0.42) drift.current += randomInt(-1, 1);
      const side = Math.random() < 0.5 ? 'buy' : 'sell';
      const aggressive = Math.random() < 0.28;
      const best = side === 'buy' ? b.asks[0]?.tick : b.bids[0]?.tick;
      const anchor = best ?? drift.current;
      const offset = 1 + randomInt(0, 3) + randomInt(0, 3);
      const tick = aggressive ? anchor : (side === 'buy' ? Math.min(anchor - 1, drift.current - offset) : Math.max(anchor + 1, drift.current + offset));
      submitRef.current(side, aggressive ? 'market' : 'limit', tick, randomInt(10, 85));
    }, 350);
    return () => window.clearInterval(timer);
  }, [active, visible, paused]);
  const asks = [...snapshot.asks].reverse();
  const maxQty = Math.max(1, ...snapshot.asks.map((p) => p.qty), ...snapshot.bids.map((p) => p.qty));
  const bestAsk = snapshot.asks[0]?.tick;
  const bestBid = snapshot.bids[0]?.tick;
  const spread = bestAsk != null && bestBid != null ? formatTick(bestAsk - bestBid) : '—';
  const lastTrade = snapshot.tape[0];
  const previousTrade = snapshot.tape[1];
  const direction = lastTrade && previousTrade ? Math.sign(lastTrade.tick - previousTrade.tick) : 0;
  const running = !paused && active && visible;
  return <article data-frame className="card min-w-0 p-5 md:p-8">
    <PanelHead code="FIX-TRADING-SIM // QUARKUS" tag="Matching engine" kicker="Engine 02 // NIFTYFUT · simulated" title="The order flow."><Chip>FIX 4.4</Chip></PanelHead>
    <div data-lb-skip>
      <div className="mb-5 grid grid-cols-3 gap-2 border-b border-line pb-5 font-mono tabular-nums">
        <div><div className={mono}>Last</div><div className={`mt-2 text-base ${direction > 0 ? 'text-build' : direction < 0 ? 'text-sell' : 'text-ink'}`}>{formatTick(snapshot.last)}</div></div>
        <div><div className={mono}>Volume</div><div className="mt-2 text-base text-ink">{snapshot.volume.toLocaleString('en-IN')}</div></div>
        <div><div className={mono}>Trades/s</div><div className="mt-2 text-base text-ink">{snapshot.rate}</div></div>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-bg/60 p-2" role="group" aria-label="Simulated order book, 8 levels each side">
        <div className="grid grid-cols-2 px-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-dim"><span>Price</span><span className="text-right">Qty</span></div>
        <div className="space-y-0.5">{Array.from({ length: 8 }, (_, i) => <BookRow key={`a${i}`} level={asks[i]} side="ask" maxQty={maxQty} flash={snapshot.flash.includes(asks[i]?.tick)} />)}</div>
        <div className="my-2 flex items-center justify-between border-y border-line bg-ink/[0.03] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-dim"><span>Spread</span><span className="text-ink">{spread}</span></div>
        <div className="space-y-0.5">{Array.from({ length: 8 }, (_, i) => <BookRow key={`b${i}`} level={snapshot.bids[i]} side="bid" maxQty={maxQty} flash={snapshot.flash.includes(snapshot.bids[i]?.tick)} />)}</div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => submit('buy', 'market', null, 50, true)} className="rounded-lg bg-build px-2 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-bg transition-opacity hover:opacity-85">Buy 50 at market</button>
        <button type="button" onClick={() => submit('sell', 'market', null, 50, true)} className="rounded-lg bg-sell px-2 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-on-accent transition-opacity hover:opacity-85">Sell 50 at market</button>
        <button type="button" onClick={() => setPaused((old) => !old)} aria-pressed={paused} className="col-span-2 rounded-lg border border-line px-2 py-3 font-mono text-[10px] uppercase tracking-wider text-ink transition-colors hover:border-accent sm:col-span-1">
          <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${running ? 'bg-accent' : 'bg-dim'}`} aria-hidden="true" />{paused ? 'Resume' : 'Pause'} sim
        </button>
      </div>
      <div className="mt-7 border-t border-line pt-5">
        <div className="mb-3 flex justify-between"><div className={mono}>Execution reports // tape</div><span className="font-mono text-[10px] text-dim">newest ↑</span></div>
        {/* Fixed height fits all 7 tape rows (7 × ~51px + gaps ≈ 390px), so the card never grows while the sim runs. */}
        <div className="h-[400px] space-y-1.5 overflow-hidden" aria-label="Recent trades">
          {snapshot.tape.length === 0 && <div className="py-8 font-mono text-xs text-dim">Waiting for first fill…</div>}
          {snapshot.tape.map((trade) => <div key={`${trade.id}-${trade.restingId}`} className="min-w-0 rounded-md border border-line bg-bg/60 px-2.5 py-2 font-mono text-[10px] tabular-nums">
            <div className="flex flex-wrap justify-between gap-x-2"><span className="text-dim">{new Date(trade.time).toLocaleTimeString('en-GB', { hour12: false })}</span><span className={trade.side === 'buy' ? 'text-build' : 'text-sell'}>{trade.side.toUpperCase()}</span><span className="text-ink">{formatTick(trade.tick)} × {trade.qty}</span></div>
            <div className="mt-1 break-all text-[9px] text-dim">35=8|55=NIFTYFUT|54={trade.side === 'buy' ? 1 : 2}|31={formatTick(trade.tick)}|32={trade.qty}|39={trade.status}</div>
          </div>)}
        </div>
      </div>
    </div>
  </article>;
}

export default function Playground() {
  const section = useRef(null);
  const inView = useInView(section, { margin: '0px 0px -80px 0px' });
  return <section id="lab" ref={section} className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
    <div className="mx-auto max-w-[1280px]">
      <SectionLabel index="04">Lab</SectionLabel>
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
            Finance, but you can <span className="text-accent">poke it.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-dim md:text-lg">
            Two engines from my GitHub, re-implemented to run live in your browser. Drag the sliders, hit the market.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="https://github.com/Nishannt-X/Black-Scholes" target="_blank" rel="noreferrer" className="link-build font-mono text-[11px] uppercase tracking-[0.14em]">Black-Scholes ↗</a>
          <a href="https://github.com/Nishannt-X/FIX-Trading-Sim" target="_blank" rel="noreferrer" className="link-build font-mono text-[11px] uppercase tracking-[0.14em]">FIX-Trading-Sim ↗</a>
        </div>
      </div>
      <div className="mt-12 grid items-start gap-6 md:mt-16 lg:grid-cols-2"><Pricer /><OrderPanel active={inView} /></div>
    </div>
  </section>;
}
