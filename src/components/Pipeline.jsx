import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { pipeline } from '../data';

const STEP_MS = 2200;
const pct = (i) => (i / (pipeline.length - 1)) * 100;

/**
 * AI-Setu's six-hop streaming trace. Rendered inside the lead Work entry (no section of its own);
 * keeps id="pipeline" as an inner anchor.
 */
export default function Pipeline({ className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-20% 0px' });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = userPaused || hovering || reduced;

  useEffect(() => {
    if (!inView || paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % pipeline.length), STEP_MS);
    return () => clearInterval(id);
  }, [inView, paused]);

  const step = pipeline[active];
  const pick = (i) => {
    setActive(i);
    setUserPaused(true);
  };

  return (
    <div
      ref={ref}
      id="pipeline"
      className={className || undefined}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h4 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink">6-stage streaming pipeline</h4>
          <p className="mt-2 leading-relaxed text-dim">
            Call audio is forked out of the phone network, transcribed while the caller is still talking, translated
            token by token and spoken back down the same line. Click a stage to inspect it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-pressed={userPaused}
          className="chip gap-2 transition-colors hover:border-accent"
        >
          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${paused ? 'bg-dim' : 'bg-accent'}`} />
          {userPaused ? 'Play trace' : 'Pause trace'}
        </button>
      </div>

      <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" aria-label="Pipeline stages">
        {pipeline.map((n, i) => {
          const on = i === active;
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => pick(i)}
                aria-pressed={on}
                className={`w-full rounded-lg border px-3 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-[0.08em] transition-colors duration-300 ${
                  on
                    ? 'border-accent bg-accent text-on-accent shadow-[0_8px_30px_-10px_rgb(var(--accent-rgb)/0.8)]'
                    : i < active
                      ? 'border-accent/30 bg-surface-2 text-ink'
                      : 'border-line bg-surface-2 text-dim hover:text-ink'
                }`}
              >
                <span className="opacity-70">S{i + 1}:</span> {n.label}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Signal line: an accent packet travels between stage nodes. */}
      <div data-layer="media" aria-hidden="true" className="relative mx-3 mt-6 h-6">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        <motion.div
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-accent/10 to-accent"
          initial={false}
          animate={{ width: `${pct(active)}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.9, ease: 'easeInOut' }}
        />
        {pipeline.map((n, i) => (
          <span
            key={n.id}
            className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-500 ${
              i <= active ? 'border-accent bg-accent/40' : 'border-line bg-bg'
            }`}
            style={{ left: `${pct(i)}%` }}
          />
        ))}
        <motion.span
          className="absolute top-1/2 -ml-[7px] -mt-[7px] h-3.5 w-3.5 rounded-full bg-accent shadow-[0_0_18px_4px_rgb(var(--accent-rgb)/0.55)]"
          initial={false}
          animate={{ left: `${pct(active)}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.9, ease: 'easeInOut' }}
        />
      </div>

      <div data-frame className="mt-6 rounded-xl border border-line bg-bg/60 p-5 md:p-7">
        <p className="tag">
          Stage {String(active + 1).padStart(2, '0')} // {step.tag}
        </p>
        <h4 className="mt-3 font-display text-xl font-bold tracking-[-0.03em] md:text-2xl">{step.label}</h4>
        <p className="mt-2 min-h-[3.25rem] max-w-3xl leading-relaxed text-dim">{step.log}</p>
        <p className="mt-5 font-mono leading-relaxed text-[11px] text-dim">
          <span className="text-accent">trace ›</span>{' '}
          {pipeline.map((n, i) => (
            <span key={n.id} className={i <= active ? 'text-ink' : 'text-dim/40'}>
              {n.id}
              {i < pipeline.length - 1 ? ' → ' : ''}
            </span>
          ))}
          <span aria-hidden="true" className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-accent align-middle" />
        </p>
      </div>
    </div>
  );
}
