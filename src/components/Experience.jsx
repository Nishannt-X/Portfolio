import { SectionLabel, Chip, Tag } from './ui';
import { experience } from '../data';

const GLOW = 'bg-[radial-gradient(90%_55%_at_100%_0%,rgb(var(--accent-rgb)/0.07),transparent_60%)]';

export default function Experience() {
  return (
    <section id="experience" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="03">Industry</SectionLabel>

        <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
          Industrial <span className="text-accent">scale.</span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-dim md:text-lg">
          Two internships, two production problems: streaming plant telemetry and forecasting cash.
        </p>

        <div className="mt-12 grid gap-6 md:mt-16 lg:grid-cols-2">
          {experience.map((e, i) => (
            <article key={e.company} data-frame className={`card flex h-full flex-col p-5 sm:p-7 md:p-10 ${GLOW}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tag>{e.role}</Tag>
                <span data-layer="label" className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
                  {e.date}
                </span>
              </div>

              <p className="tag mt-8">Role {String(i + 1).padStart(2, '0')} // {e.tech[0]}</p>
              <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] md:text-5xl">{e.company}</h3>
              <p className="mt-3 text-lg leading-snug text-ink/85 md:text-xl">{e.headline}</p>

              <div data-layer className="mt-8 rounded-xl border border-line bg-bg/60 p-5">
                <div className="numeral text-4xl leading-none md:text-6xl">{e.big.n}</div>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">{e.big.l}</div>
              </div>

              <ul className="mt-7 space-y-3 text-[15px] leading-relaxed text-ink/80">
                {e.bullets.map((b) => (
                  <li key={b} className="relative pl-5">
                    <span aria-hidden="true" className="absolute left-0 top-[0.6em] h-1.5 w-1.5 rounded-sm bg-accent" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-wrap gap-2 pt-8">
                {e.tech.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
