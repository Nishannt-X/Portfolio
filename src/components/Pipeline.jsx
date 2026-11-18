import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { SectionLabel, Stat, Tag, Chip } from './ui';
import { pipeline } from '../data';

const STEP_MS = 2200;
const GLOW = 'bg-[radial-gradient(90%_60%_at_0%_0%,rgb(var(--accent-rgb)/0.09),transparent_60%)]';
const pct = (i) => (i / (pipeline.length - 1)) * 100;

export default function Pipeline() {
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
    <section ref={ref} id="pipeline" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="01">How AI-Setu talks</SectionLabel>

        <h2 className="max-w-5xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
          A phone call, translated <span className="text-accent">before you finish the sentence.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-dim md:text-lg">
          AI-Setu sits inside an ordinary phone call and lets two people talk across languages. Six streaming hops,
          no app on either end.
        </p>

        <article
          data-frame
          className={`card mt-12 overflow-hidden p-5 sm:p-7 md:mt-16 md:p-10 ${GLOW}`}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tag>Core pipeline</Tag>
            <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
              Amazon AI for Bharat // Grand Finalist
            </span>
          </div>

          <h3 className="mt-7 font-display text-2xl font-bold tracking-[-0.035em] sm:text-3xl md:text-4xl">
            AI-Setu — real-time voice, in any language
          </h3>
          <p className="mt-4 max-w-3xl leading-relaxed text-dim">
            Call audio is forked out of the phone network, transcribed while the caller is still talking, translated
            token by token and spoken back down the same line.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
            <Stat value={6} label="Streaming hops" className="bg-surface p-4 md:p-5" />
            <div data-layer className="bg-surface p-4 md:p-5">
              <div className="numeral text-3xl leading-none md:text-[2.6rem]">&lt;1s</div>
              <div className="mt-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">End to end</div>
            </div>
            <Stat value={6} prefix="Top " label="In India" className="bg-surface p-4 md:p-5" />
            <Stat value={95000} suffix="+" label="Submissions" className="bg-surface p-4 md:p-5" />
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink">6-stage streaming pipeline</h4>
              <p className="mt-1 text-sm text-dim">Click a stage to inspect it.</p>
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

          <div className="mt-6 flex flex-wrap gap-2">
            {['Twilio Media Streams', 'WebSockets', 'Deepgram', 'Groq', 'ElevenLabs', 'AWS'].map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
