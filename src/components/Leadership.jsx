import { SectionLabel, Stat, Tag } from './ui';
import { links, campus } from '../data';

const figures = [
  { value: 15, label: 'Core team led' },
  { value: 10, suffix: '+', label: 'Events run' },
  { value: 500, suffix: '+', label: 'Participants' },
];

const corner = 'pointer-events-none absolute h-4 w-4 border-accent';

function Photo({ src, alt, caption, className = '' }) {
  return (
    <figure data-frame className={`group relative overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover grayscale transition-[filter,scale] duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
      <span aria-hidden="true" className={`${corner} left-2 top-2 border-l-2 border-t-2`} />
      <span aria-hidden="true" className={`${corner} right-2 top-2 border-r-2 border-t-2`} />
      <span aria-hidden="true" className={`${corner} bottom-2 left-2 border-b-2 border-l-2`} />
      <span aria-hidden="true" className={`${corner} bottom-2 right-2 border-b-2 border-r-2`} />
      <figcaption className="absolute bottom-3 left-4 right-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/85">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function Leadership() {
  return (
    <section id="leadership" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="05">Leadership</SectionLabel>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl">
              I helped start <span className="text-accent">FINOVA.</span>
            </h2>
            <div className="mt-8">
              <Tag className="pill-accent">Founding member · Head of Operations</Tag>
            </div>
            <p className="mt-5 text-base leading-relaxed text-dim md:text-lg">
              The official fintech club of MIT Manipal, built from zero to bridge technology and capital markets on
              campus. I directed the core team that planned and ran the events.
            </p>
            <a href={links.finova} target="_blank" rel="noreferrer" className="btn-block mt-7">
              finovamanipal.org <span aria-hidden="true">↗</span>
            </a>

            <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
              {figures.map((f) => (
                <Stat key={f.label} value={f.value} suffix={f.suffix} label={f.label} className="bg-surface p-4 md:p-5" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3 md:gap-4 lg:col-span-7">
            <Photo
              src="/img/finova-group.jpg"
              alt="FINOVA team on stage at MIT Manipal"
              caption="FINOVA // on stage"
              className="col-span-6 aspect-[4/3] md:col-span-4 md:row-span-2 md:aspect-auto md:min-h-[520px]"
            />
            <Photo
              src="/img/finova-team.jpg"
              alt="FINOVA board in front of the club's screen"
              caption="The board"
              className="col-span-3 aspect-[4/3] md:col-span-2 md:aspect-auto"
            />
            <Photo
              src="/img/podium.jpg"
              alt="Nishant presenting at the podium"
              caption="At the podium"
              className="col-span-3 aspect-[4/3] md:col-span-2 md:aspect-auto"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {campus.map((c, i) => (
            <article key={c.org} data-frame className="card p-5 sm:p-7 md:p-8">
              <p className="tag">
                Campus {String(i + 1).padStart(2, '0')} // {c.role}
              </p>
              <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.035em]">{c.org}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-dim">{c.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
