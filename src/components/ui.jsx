import { createElement, useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

export const ease = [0.16, 1, 0.3, 1];

/**
 * Passthrough wrapper. The live-build engine is the entrance animation now,
 * so this renders the requested tag with no motion. `delay` is accepted and ignored.
 */
// eslint-disable-next-line no-unused-vars
export function Reveal({ children, delay, className = '', as = 'div' }) {
  return createElement(as || 'div', { className: className || undefined }, children);
}

/** Accent mono section label: ● // 02 · SELECTED WORK */
export function SectionLabel({ index, children }) {
  return (
    <div data-layer className="tag mb-8 flex items-center gap-3 md:mb-12">
      <span className="dot" aria-hidden="true" />
      <span>
        {index != null && <span className="opacity-70">{`// ${index} · `}</span>}
        {children}
      </span>
    </div>
  );
}

/** Find the nearest ancestor-or-self carrying a live-build state. */
function lbHost(el) {
  return el ? el.closest('[data-lb]') : null;
}

/**
 * Counts up once the number is both in view AND built by the live-build engine
 * (its nearest [data-lb] host reads "1"). Reduced motion jumps to the final value.
 */
export function CountUp({ to, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [built, setBuilt] = useState(false);
  const [val, setVal] = useState(0);

  // Wait for the engine to mark the host layer as built.
  useEffect(() => {
    if (!inView || built) return;
    const host = lbHost(ref.current);
    if (!host || host.getAttribute('data-lb') === '1') {
      setBuilt(true);
      return;
    }
    const mo = new MutationObserver(() => {
      if (host.getAttribute('data-lb') === '1') {
        setBuilt(true);
        mo.disconnect();
      }
    });
    mo.observe(host, { attributes: true, attributeFilter: ['data-lb'] });
    return () => mo.disconnect();
  }, [inView, built]);

  useEffect(() => {
    if (!built) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [built, to]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

/** Mono caps chip. `active` renders the accent-filled variant. */
export function Chip({ children, active = false }) {
  return (
    <span data-layer className={`chip${active ? ' chip-active' : ''}`}>
      {children}
    </span>
  );
}

/** Bordered pill with an accent dot: ● CORE ECOSYSTEM */
export function Tag({ children, className = '' }) {
  return (
    <span data-layer className={`pill ${className}`}>
      <span className="dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Accent mono numeral (counts up) with a dim mono label, optional sub caption. */
export function Stat({ value, prefix, suffix, label, sub, className = '' }) {
  return (
    <div data-layer className={className}>
      <div className="numeral text-3xl leading-none md:text-[2.6rem]">
        <CountUp to={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="mt-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
        {label}
      </div>
      {sub && <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-dim">{sub}</div>}
    </div>
  );
}
