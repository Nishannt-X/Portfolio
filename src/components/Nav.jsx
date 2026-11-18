import { motion, useScroll, useSpring } from 'framer-motion';

const items = [
  ['Work', '#work'],
  ['Experience', '#experience'],
  ['Lab', '#lab'],
  ['Leadership', '#leadership'],
  ['Contact', '#contact'],
];

export default function Nav() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <header className="nav-in fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Primary"
        className="flex items-center justify-between gap-4 border-b border-line bg-bg/75 px-4 py-3 backdrop-blur-md sm:px-6 md:px-10"
      >
        <a href="#top" className="flex items-center gap-2.5" aria-label="Nishant Dahiya, back to top">
          <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-accent font-mono text-[11px] font-bold tracking-tight text-on-accent shadow-[0_0_18px_rgb(var(--accent-rgb)/0.45)]">
            ND
          </span>
          <span className="font-display text-[15px] font-extrabold tracking-[-0.03em]">
            NISHANT<span className="text-accent">.</span>
          </span>
        </a>

        <ul className="hidden items-center gap-7 text-[13px] font-medium text-dim md:flex lg:gap-9">
          {items.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="transition-colors hover:text-ink">
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 sm:gap-5">
          <span className="hidden items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-dim lg:flex">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Open to 2027 roles
          </span>
          <a href="#contact" className="link-build text-[11px]">
            Hire me <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
      <motion.div style={{ scaleX }} className="h-px origin-left bg-accent" aria-hidden="true" />
    </header>
  );
}
