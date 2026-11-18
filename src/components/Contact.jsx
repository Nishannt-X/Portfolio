import { useState } from 'react';
import { SectionLabel } from './ui';
import ThemeDots from './ThemeDots';
import { links } from '../data';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${links.email}`;
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden pb-10 pt-20 md:pt-28">
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[480px] w-[1000px] max-w-[150vw] -translate-x-1/2 rounded-full bg-accent-deep/35 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10">
        {/* Foundation */}
        <div data-frame className="card mb-28 overflow-hidden p-0 md:mb-40">
          <div className="grid lg:grid-cols-12">
            <div className="relative h-[320px] sm:h-[340px] lg:col-span-7 lg:h-[480px]">
              <img
                src="/img/campus.jpg"
                alt="MIT Manipal campus in the rain"
                loading="lazy"
                className="h-full w-full object-cover object-[50%_58%] grayscale-[55%] contrast-110"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-surface"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:col-span-5 lg:p-12">
              <p className="tag">The foundation</p>
              <h3 className="text-3xl font-bold leading-[1.05] tracking-[-0.04em] md:text-[2.6rem]">
                Manipal Institute of Technology
              </h3>
              <p className="text-[15px] leading-relaxed text-ink/75">
                B.Tech in Computer Science &amp; Financial Technology, 2023 to 2027. Data structures, distributed
                systems, cybersecurity and capital markets.
              </p>
              <p className="pill w-fit text-dim">
                <span className="dot" aria-hidden="true" />
                MIT Manipal · Class of 2027
              </p>
            </div>
          </div>
        </div>

        <SectionLabel index="07">Contact</SectionLabel>

        <h2
          className="font-condensed uppercase leading-[0.9] tracking-[0.005em]"
          style={{ fontSize: 'clamp(3.6rem, 15vw, 15rem)' }}
        >
          <span className="outline-accent block">Let’s build</span>
          <span className="mt-2 inline-block bg-accent px-[0.12em] pt-[0.06em] text-on-accent shadow-[0_24px_60px_-18px_rgb(var(--accent-2-rgb)/0.55)]">
            Something.
          </span>
        </h2>

        <p className="mt-10 max-w-xl text-[19px] font-medium leading-[1.35] tracking-[-0.02em] text-ink/80 md:text-[22px]">
          Open to <strong className="font-extrabold text-ink">2027 roles</strong> in backend, AI and fintech
          engineering. The fastest way to reach me is email.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copy}
            data-cta="email"
            aria-label={copied ? 'Email address copied' : `Copy email address ${links.email}`}
            className="pill pill-accent px-5 py-3.5 normal-case tracking-[0.04em] text-[12px]"
          >
            <span className="dot" aria-hidden="true" />
            {copied ? 'Copied ✓' : links.email}
          </button>
          <a href={`mailto:${links.email}`} className="pill px-5 py-3.5 text-[11px]">
            Write an email <span aria-hidden="true">↗</span>
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer" className="pill px-5 py-3.5 text-[11px]">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a href={links.github} target="_blank" rel="noreferrer" className="pill px-5 py-3.5 text-[11px]">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>

        <footer
          data-layer
          className="mt-28 flex flex-col justify-between gap-3 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-dim md:flex-row"
        >
          <span>© {new Date().getFullYear()} Nishant Dahiya</span>
          <span>Designed and built in Manipal</span>
          <ThemeDots />
        </footer>
      </div>
    </section>
  );
}
