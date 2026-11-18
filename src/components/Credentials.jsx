import { SectionLabel, Tag } from './ui';
import { research, certifications, community } from '../data.extra';

const pad = (n) => String(n).padStart(2, '0');

export default function Credentials() {
  return (
    <section id="credentials" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="05b">Credentials</SectionLabel>

        <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
          Papers &amp; <span className="text-accent">paper trail.</span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-dim md:text-lg">
          Research I co-authored, and the certificates behind the claims.
        </p>

        <div data-frame className="card mt-12 p-5 sm:p-7 md:mt-16 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="tag">Research // co-authorships</p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.035em] md:text-3xl">Research</h3>
            </div>
            <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
              {pad(research.length)} entries
            </span>
          </div>

          <ul className="mt-8 border-t border-line">
            {research.map((r, i) => (
              <li
                key={r.title}
                className="grid grid-cols-[2rem_1fr] gap-x-4 gap-y-2 border-b border-line py-5 md:grid-cols-[2.5rem_1fr_auto] md:px-2"
              >
                <span data-layer className="font-mono text-[10px] text-dim">{pad(i + 1)}</span>
                <div className="min-w-0">
                  <h4 className="font-display text-lg font-semibold leading-snug tracking-[-0.02em] md:text-xl">
                    {r.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-dim">{r.note}</p>
                </div>
                <span className="col-start-2 md:col-auto md:text-right">
                  <span
                    data-layer
                    className={`pill rounded-xl md:rounded-full md:whitespace-nowrap ${r.status.startsWith('Manuscript') ? '' : 'pill-accent'}`}
                  >
                    {r.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {certifications.map((c, i) => (
            <article key={c.title} data-frame className="card flex flex-col p-5 sm:p-7 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="tag">Certificate {pad(i + 1)}</p>
                <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
                  {c.issuer === 'HCLTech' ? 'Industry' : 'Security'}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.035em]">{c.title}</h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{c.level}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{c.issuer}</p>
              <p className="mt-auto pt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">{c.date}</p>
            </article>
          ))}
        </div>

        <div data-frame className="mt-6 flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 md:flex-row md:items-center md:gap-6 md:p-6">
          <Tag className="shrink-0">Community</Tag>
          <h3 className="font-display text-lg font-semibold tracking-[-0.02em] md:text-xl">{community.label}</h3>
          <p className="text-[15px] leading-relaxed text-dim">{community.text}</p>
        </div>
      </div>
    </section>
  );
}
