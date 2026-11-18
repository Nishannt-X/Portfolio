import { useEffect, useRef } from 'react';
import { Stat, Tag } from './ui';
import { stats, marquee } from '../data';

// Quick-jump index: one-line hook + one figure each, linking to where the full story lives.
const specs = [
  { i: '01.', k: 'Voice AI', title: 'AI-Setu', href: '#work-ai-setu', hook: 'Two languages, one ordinary phone call.', metric: 'Sub-second · 6 hops' },
  { i: '02.', k: 'Real-time ML', title: 'NTPC telemetry', href: '#experience', hook: 'Kafka streams with an LSTM on anomaly watch.', metric: '85%+ F1' },
  { i: '03.', k: 'Fintech', title: 'FINOVA', href: '#leadership', hook: 'Helped start the fintech club; ran its core team.', metric: '15 core team led' },
];

/** Scale the giant word so it spans its container exactly, at any width. */
function useFitWidth(textRef, boxRef) {
  useEffect(() => {
    const el = textRef.current;
    const box = boxRef.current;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = '';
      const base = parseFloat(getComputedStyle(el).fontSize);
      const natural = el.offsetWidth;
      const target = box.clientWidth * 0.995;
      if (natural > 0 && target > 0) el.style.fontSize = `${Math.min((base * target) / natural, 520)}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [textRef, boxRef]);
}

export default function Hero() {
  const ref = useRef(null);
  const wordBox = useRef(null);
  const word = useRef(null);
  useFitWidth(word, wordBox);

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    el.style.setProperty('--px', ((x / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty('--py', ((y / r.height) * 2 - 1).toFixed(3));
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--px', '0');
    ref.current?.style.setProperty('--py', '0');
  };

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-20 md:pt-24"
    >
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent-deep/40 blur-[120px]"
        aria-hidden="true"
      />

      <h1 id="hero-title" className="sr-only">
        Nishant Dahiya, backend and AI systems engineer
      </h1>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 sm:px-6 md:px-10">
        {/* Giant outlined first name + script greeting */}
        <div ref={wordBox} className="relative mt-4 md:mt-6">
          <div className="parallax flex justify-center" aria-hidden="true">
            <div
              ref={word}
              data-layer
              className="outline-accent w-max select-none whitespace-nowrap leading-[0.84] tracking-[0.005em]"
              style={{ fontSize: '27vw' }}
            >
              Nishant
            </div>
          </div>
          <p className="absolute bottom-[-0.15em] left-0 z-20 -rotate-3 font-script text-[clamp(2.1rem,6.2vw,5rem)] leading-none text-ink drop-shadow-[0_4px_18px_rgb(0_0_0/0.9)] sm:left-1">
            Hello, I’m
          </p>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-5 grid gap-14 md:mt-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div
              data-layer
              aria-hidden="true"
              className="inline-block bg-accent px-3.5 pb-1 pt-2 font-condensed text-[clamp(2.25rem,12.4vw,5.6rem)] uppercase leading-[0.92] tracking-[0.01em] lg:text-[clamp(2.9rem,calc(6.8vw-16px),5.1rem)] text-on-accent shadow-[0_18px_50px_-14px_rgb(var(--accent-2-rgb)/0.55)] md:px-5"
            >
              Nishant Dahiya
            </div>

            <div className="mt-7">
              <Tag>Backend + AI systems engineer · Fintech</Tag>
            </div>

            <p className="mt-7 max-w-[34rem] text-[19px] font-medium leading-[1.32] tracking-[-0.025em] text-ink/80 md:text-[22px]">
              I build <strong className="font-extrabold text-ink">real-time AI systems that move money</strong>:{' '}
              <strong className="font-extrabold text-ink">voice agents</strong>,{' '}
              <strong className="font-extrabold text-ink">fraud shields</strong> and{' '}
              <strong className="font-extrabold text-ink">streaming telemetry</strong>.
            </p>
            <p className="mt-3 max-w-[30rem] text-[15px] leading-relaxed tracking-[-0.01em] text-dim">
              High-throughput, fault-tolerant financial infrastructure and real-time streaming AI.
            </p>

            <div className="mt-9 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
              <a href="#contact" className="link-build">
                Say hello <span aria-hidden="true">→</span>
              </a>
              <a href="#work" className="btn-block">
                Explore the work
              </a>
            </div>
          </div>

          {/* Portrait */}
          <div className="lg:col-span-4 lg:-mt-[7vw] xl:-mt-[6vw]">
            <figure data-frame className="relative mx-auto w-[82%] max-w-[380px] sm:w-[58%] lg:w-full">
              <div
                data-layer
                aria-hidden="true"
                className="absolute -left-3 -top-3 h-[58%] w-[72%] bg-accent sm:-left-5 sm:-top-5"
              />
              <div className="relative border border-line bg-surface-2 p-2.5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)]">
                <img
                  src="/img/portrait.jpg"
                  alt="Portrait of Nishant Dahiya in a suit"
                  className="aspect-[4/5] w-full object-cover grayscale contrast-110"
                  fetchPriority="high"
                />
              </div>
              <figcaption className="pill absolute -bottom-5 left-3 max-w-[calc(100%-1.5rem)] bg-bg/95 leading-snug backdrop-blur sm:left-5">
                <span className="dot" aria-hidden="true" />
                Grand Finalist · Amazon AI for Bharat (Top 6 / 95,000+)
              </figcaption>
            </figure>
          </div>

          {/* Spec column */}
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-3 lg:grid-cols-1 lg:content-start lg:gap-9 lg:pt-2">
            {specs.map((s) => (
              <a
                key={s.i}
                href={s.href}
                className="group block border-t border-line pt-4 transition-colors hover:border-accent"
              >
                <p className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
                  <span className="font-bold text-accent">{s.i}</span>
                  <span className="text-dim">{s.k}</span>
                </p>
                <h3 className="mt-2.5 flex items-baseline justify-between gap-3 text-[19px] font-bold leading-tight tracking-[-0.035em] transition-colors group-hover:text-accent">
                  {s.title}
                  <span aria-hidden="true" className="text-[15px] text-accent transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-snug text-dim">{s.hook}</p>
                <p className="mt-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink">{s.metric}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-20 grid grid-cols-2 gap-x-4 gap-y-8 border-t border-line pb-8 pt-7 md:grid-cols-4 lg:mt-24 md:gap-6 lg:pt-8">
          {stats.map((s) => (
            <Stat key={s.label} value={s.value} prefix={s.prefix} suffix={s.suffix} label={s.label} sub={s.sub} />
          ))}
        </div>
      </div>

      {/* Tech marquee */}
      <div data-layer aria-hidden="true" className="marquee relative z-10 overflow-hidden border-y border-line bg-surface/60 py-3.5">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-dim">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-8">
              {m}
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
