import { SectionLabel, Chip, Tag } from './ui';
import { gOne } from '../data.extra';

const GLOW = 'bg-[radial-gradient(80%_60%_at_100%_0%,rgb(var(--accent-rgb)/0.09),transparent_60%)]';

function Shot({ src, alt, caption, className = '' }) {
  return (
    <figure data-frame className={`overflow-hidden rounded-xl border border-line bg-surface-2 ${className}`}>
      <img src={src} alt={alt} loading="lazy" width="1600" height="1000" className="block aspect-[16/10] w-full object-cover object-top" />
      <figcaption className="border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function LiveNow() {
  const [main, ...rest] = gOne.shots;
  return (
    <section id="live" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="02b">Live now</SectionLabel>

        <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
          Live, on the <span className="text-accent">farmer's side.</span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-dim md:text-lg">
          The newest build, and the one you can try right now in a browser.
        </p>

        <article data-frame className={`card mt-12 overflow-hidden p-5 sm:p-7 md:mt-16 md:p-10 ${GLOW}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span data-layer className="pill pill-accent">
              <span className="dot pulse-dot" aria-hidden="true" />
              Live demo
            </span>
            <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
              {gOne.context}
            </span>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div>
              <h3 className="font-display text-4xl font-bold leading-[1] tracking-[-0.04em] md:text-6xl">{gOne.title}</h3>
              <p className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-accent md:text-2xl">
                {gOne.tagline}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/85 md:text-lg">{gOne.pitch}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a
                  href={gOne.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded px-5 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] bg-accent text-on-accent shadow-[0_12px_32px_-12px_rgb(var(--accent-rgb)/0.7)] transition-[filter,transform] hover:-translate-y-px hover:brightness-110"
                >
                  Try the live demo <span aria-hidden="true">↗</span>
                </a>
                <a href={gOne.repo} target="_blank" rel="noreferrer" className="link-build">
                  Source on GitHub ↗
                </a>
              </div>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                Voiced, scripted sample call · {gOne.disclaimer}
              </p>

              <ul className="mt-10 border-t border-line">
                {gOne.features.map((f, i) => (
                  <li key={f.k} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-line py-4">
                    <span className="font-mono text-[10px] text-dim">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="block font-display text-lg font-semibold tracking-[-0.02em]">{f.k}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-dim">{f.v}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Shot {...main} />
              <div className="grid gap-4 sm:grid-cols-2">
                {rest.map((s) => (
                  <Shot key={s.src} {...s} />
                ))}
              </div>

              <div data-frame className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
                {gOne.tests.map((t) => (
                  <div key={t.l} className="bg-surface p-5">
                    <div data-layer className="numeral text-4xl leading-none md:text-5xl">{t.n}</div>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink">{t.l}</p>
                  </div>
                ))}
              </div>

              <div data-frame className="rounded-xl border border-line bg-bg/60 p-5">
                <p className="tag">My lane // team of two</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{gOne.myLane}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {gOne.tech.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>

          <div data-frame className="mt-8 rounded-xl border border-dashed border-line p-5 md:flex md:items-center md:gap-6">
            <Tag className="shrink-0">Currently building · in progress</Tag>
            <div className="mt-4 md:mt-0">
              <h4 className="font-display text-lg font-semibold tracking-[-0.02em]">{gOne.building.title}</h4>
              <p className="mt-1 text-[15px] leading-relaxed text-dim">{gOne.building.note}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
