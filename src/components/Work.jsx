import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionLabel, Chip, Stat, Tag, ease } from './ui';
import Pipeline from './Pipeline';
import { work } from '../data';

// AI-Setu leads (in depth, with its pipeline); everything else sits in the filterable grid.
const LEAD_ID = 'ai-setu';
const lead = work.find((w) => w.id === LEAD_ID);
const others = work.filter((w) => w.id !== LEAD_ID);

const filters = [
  { id: 'All', label: 'All' },
  { id: 'Hackathon', label: 'Hackathons' },
  { id: 'Project', label: 'Projects' },
];
const GLOW = 'bg-[radial-gradient(80%_60%_at_0%_0%,rgb(var(--accent-rgb)/0.08),transparent_60%)]';
const num = (w) => String(work.indexOf(w) + 1).padStart(2, '0');

function RepoLink({ href }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="link-build mt-6">
      Source on GitHub ↗
    </a>
  );
}

/** AI-Setu, told once and in depth: card details up top, the live six-hop trace as its body. */
function Lead({ w }) {
  return (
    <article id={`work-${w.id}`} data-frame className={`card overflow-hidden p-5 sm:p-7 md:p-10 ${GLOW}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tag className="pill-accent">Flagship build</Tag>
        <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
          {num(w)} / {String(work.length).padStart(2, '0')} // {w.result}
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
        <div>
          <h3 className="font-display text-4xl font-bold leading-[1] tracking-[-0.04em] sm:text-5xl md:text-6xl">
            {w.title}
          </h3>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">{w.event}</p>
          <p className="mt-6 max-w-2xl font-display text-2xl font-bold leading-[1.1] tracking-[-0.035em] sm:text-3xl">
            A phone call, translated <span className="text-accent">before you finish the sentence.</span>
          </p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/85 md:text-lg">{w.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {w.tech.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
          <RepoLink href={w.repo} />
        </div>

        <div className="self-start">
          <div data-frame className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
            <Stat value={6} label="Streaming hops" className="bg-surface p-4 md:p-5" />
            <div data-layer className="bg-surface p-4 md:p-5">
              <div className="numeral text-3xl leading-none md:text-[2.6rem]">&lt;1s</div>
              <div className="mt-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">End to end</div>
            </div>
            <Stat value={6} prefix="Top " label="In India" className="bg-surface p-4 md:p-5" />
            <Stat value={95000} suffix="+" label="Submissions" className="bg-surface p-4 md:p-5" />
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-dim">
            {w.context} Six streaming hops, no app on either end.
          </p>
        </div>
      </div>

      <Pipeline className="mt-10 border-t border-line pt-8 md:mt-12 md:pt-10" />
    </article>
  );
}

function Card({ w, open, onToggle }) {
  const panelId = `work-${w.id}-notes`;
  return (
    <article id={`work-${w.id}`} data-frame className="card flex flex-col p-5 sm:p-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <Tag>
          {w.kind}
          {w.year ? ` · ${w.year}` : ''}
        </Tag>
        <span data-layer="label" className="font-mono text-[10px] text-dim">
          {num(w)}
        </span>
      </div>

      <div data-layer className="mt-7">
        <div className="numeral text-3xl leading-none md:text-4xl">{w.metric.n}</div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">{w.metric.l}</div>
      </div>

      <h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.035em] md:text-[1.7rem]">{w.title}</h3>
      <p className="mt-2 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.12em] text-dim">{w.event}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{w.context}</p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="group mt-6 flex items-center justify-between gap-3 border-t border-line pt-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent"
      >
        {open ? 'Hide build notes' : 'Build notes'}
        <span
          aria-hidden="true"
          className={`grid h-6 w-6 place-items-center rounded-md border transition-all duration-300 ${
            open ? 'rotate-45 border-accent bg-accent text-on-accent' : 'border-line text-accent'
          }`}
        >
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="notes"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.45, ease }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <p className="text-[15px] leading-relaxed text-dim">{w.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {w.tech.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <RepoLink href={w.repo} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export default function Work() {
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(() => new Set());
  const rows = others.filter((w) => filter === 'All' || w.kind === filter);
  const toggle = (id) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section id="work" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="01">Selected work</SectionLabel>

        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
            Proving <span className="text-accent">grounds.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-dim md:text-lg">
            National hackathons and independent builds: voice AI, risk engines and fintech, shipped against a clock.
          </p>
        </div>

        <div className="mt-12 md:mt-16">{lead && <Lead w={lead} />}</div>

        <div className="mt-16 flex flex-col justify-between gap-6 md:mt-20 lg:flex-row lg:items-center">
          <div className="[&>div]:mb-0">
            <SectionLabel index="02">Hackathons &amp; projects</SectionLabel>
          </div>
          <div role="group" aria-label="Filter work" className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const on = filter === f.id;
              const count = others.filter((w) => f.id === 'All' || w.kind === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-lg border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                    on
                      ? 'border-accent bg-accent text-on-accent'
                      : 'border-line bg-surface-2 text-dim hover:border-accent/50 hover:text-ink'
                  }`}
                >
                  {f.label} <span className={on ? 'text-on-accent/70' : 'text-dim/70'}>{String(count).padStart(2, '0')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {rows.length > 0 && (
          <div className="mt-8 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((w) => (
              <Card key={w.id} w={w} open={open.has(w.id)} onToggle={() => toggle(w.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
