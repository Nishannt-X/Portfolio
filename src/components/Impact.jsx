import { SectionLabel } from './ui';
import { impact, impactFootnotes } from '../data.extra';

export default function Impact() {
  return (
    <section id="impact" aria-labelledby="impact-title" className="relative px-4 py-16 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="00">Impact</SectionLabel>

        <h2
          id="impact-title"
          className="font-display text-3xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-4xl md:text-5xl"
        >
          Measured, not <span className="text-accent">adjectives.</span>
        </h2>

        <ul
          data-frame
          className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 md:mt-12 lg:grid-cols-5"
        >
          {impact.map((m, i) => (
            <li
              key={m.label}
              className={`flex flex-col bg-surface p-5 md:p-6 ${
                i === impact.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div data-layer className="flex items-baseline gap-2">
                <span className="numeral text-4xl leading-none md:text-[2.6rem]">{m.n}</span>
                {m.unit && <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-accent">{m.unit}</span>}
                {m.mark && <sup className="font-mono text-xs text-dim">{m.mark}</sup>}
              </div>
              <p className="mt-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink">{m.label}</p>
              <p className="mt-2 text-sm leading-snug text-dim">{m.note}</p>
              <p className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-accent/80">
                Source // {m.source}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1">
          {impactFootnotes.map((f) => (
            <p key={f.mark} className="font-mono text-[10px] leading-relaxed tracking-[0.04em] text-dim">
              {f.mark} {f.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
