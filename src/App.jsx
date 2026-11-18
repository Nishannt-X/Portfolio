import { useEffect } from 'react';
import Lenis from 'lenis';
import LiveBuild from './components/LiveBuild';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Impact from './components/Impact';
import Pipeline from './components/Pipeline';
import Work from './components/Work';
import LiveNow from './components/LiveNow';
import Experience from './components/Experience';
import Playground from './components/Playground';
import Leadership from './components/Leadership';
import Credentials from './components/Credentials';
import Stack from './components/Stack';
import Contact from './components/Contact';

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.__lenis = lenis; // LiveBuild's Tour drives scrolling through this
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Anchor links through Lenis so they glide
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]');
      const href = a?.getAttribute('href');
      if (!href || href.length < 2) return;
      let el = null;
      try {
        el = document.querySelector(href);
      } catch {
        return;
      }
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -60 });
      }
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      if (window.__lenis === lenis) delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  return (
    <div className="grain min-h-screen bg-bg text-ink">
      <Nav />
      <main>
        <Hero />
        <Impact />
        <Pipeline />
        <Work />
        <LiveNow />
        <Experience />
        <Playground />
        <Leadership />
        <Credentials />
        <Stack />
        <Contact />
      </main>
      <LiveBuild />
    </div>
  );
}
