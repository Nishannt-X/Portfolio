import { SectionLabel, Chip } from './ui';
import { skills, repos, links, practice, archive } from '../data';

const pad = (n) => String(n).padStart(2, '0');

export default function Stack() {
  const matrix = [...skills, practice];

  return (
    <section id="stack" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="06">Stack &amp; more builds</SectionLabel>

        <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
          Stack &amp; <span className="text-accent">more builds.</span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-dim md:text-lg">
          The systems matrix: what I reach for, from the language up to the architecture.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {matrix.map((s, i) => (
            <article key={s.title} data-frame className="card flex flex-col p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="tag">Matrix {pad(i + 1)}</p>
                <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
                  {pad(s.items.length)} items
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.03em] md:text-2xl">{s.title}</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {s.items.map((it) => (
                  <Chip key={it}>{it}</Chip>
                ))}
              </div>
              {s.url && (
                <a href={s.url} target="_blank" rel="noreferrer" className="link-build mt-auto pt-6">
                  neetcode-submissions ↗
                </a>
              )}
            </article>
          ))}
        </div>

        <div data-frame className="card mt-14 p-5 sm:p-7 md:mt-20 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="tag">Also shipped // open source</p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.035em] md:text-3xl">More builds on GitHub</h3>
            </div>
            <a href={links.github} target="_blank" rel="noreferrer" className="link-build">
              All repos ↗
            </a>
          </div>

          <ul className="mt-8 border-t border-line">
            {repos.map((r, i) => (
              <li key={r.name} className="border-b border-line">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-4 transition-colors hover:bg-surface-2/60 md:grid-cols-[2.5rem_1.1fr_1.5fr_10rem_auto] md:px-2"
                >
                  <span className="font-mono text-[10px] text-dim">{pad(i + 1)}</span>
                  <span className="min-w-0 break-words font-display text-lg font-semibold tracking-[-0.02em] transition-colors group-hover:text-accent md:text-xl">
                    {r.name}
                  </span>
                  <span aria-hidden="true" className="font-mono text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:order-last">
                    ↗
                  </span>
                  <span className="col-start-2 col-end-4 text-sm text-dim md:col-auto">{r.desc}</span>
                  <span className="col-start-2 col-end-4 font-mono text-[10px] uppercase tracking-[0.12em] text-dim md:col-auto">
                    {r.lang}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <h4 className="mt-10 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink">Archive</h4>
          <ul className="mt-4 flex flex-wrap gap-2">
            {archive.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  title={r.desc}
                  className="chip gap-2 normal-case tracking-normal transition-colors hover:border-accent hover:text-ink"
                >
                  {r.name}
                  <span className="text-dim uppercase tracking-[0.08em]">{r.lang}</span>
                  {r.desc && <span className="text-accent">★ Featured</span>}
                  <span aria-hidden="true" className="text-accent">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
