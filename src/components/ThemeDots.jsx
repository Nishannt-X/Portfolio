import { useState } from 'react';

const THEMES = [
  { id: 'amber', label: 'Amber', swatch: '#ffb020', bg: '#08080a' },
  { id: 'violet', label: 'Violet', swatch: '#9d7bff', bg: '#07060d' },
  { id: 'mint', label: 'Mint', swatch: '#3dffb0', bg: '#060909' },
];

const current = () => {
  const t = typeof document !== 'undefined' ? document.documentElement.dataset.theme : '';
  return THEMES.some((x) => x.id === t) ? t : 'amber';
};

/** Low-key footer theme switcher. Not a live-build layer (data-lb-skip). */
export default function ThemeDots() {
  const [theme, setTheme] = useState(current);

  const pick = (t) => {
    document.documentElement.dataset.theme = t.id;
    try {
      localStorage.setItem('theme', t.id);
    } catch {
      /* storage blocked: theme still applies for this visit */
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg);
    setTheme(t.id);
  };

  return (
    <span data-lb-skip="" role="group" aria-label="Colour theme" className="inline-flex items-center gap-2.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.label}
          aria-label={t.label}
          aria-pressed={theme === t.id}
          onClick={() => pick(t)}
          className={`h-3 w-3 cursor-pointer rounded-full transition-[box-shadow,transform] hover:scale-110 ${
            theme === t.id ? 'ring-2 ring-ink/70 ring-offset-2 ring-offset-bg' : 'opacity-70 hover:opacity-100'
          }`}
          style={{ background: t.swatch }}
        />
      ))}
    </span>
  );
}
