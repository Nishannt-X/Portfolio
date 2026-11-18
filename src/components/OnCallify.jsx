import { SectionLabel, Chip } from './ui';

/*
 * OnCallify case study. Every number below comes from eval/reports/report.md in the
 * OnCallify repo (56-incident corpus, rules-v1 baseline vs rules-v2, paired exact McNemar,
 * Holm-corrected). Screenshots are a replay: the real agent code + dashboard run against
 * 5 incidents recorded from the live stack, with dry-run and verify stubbed.
 */

const oc = {
  repo: 'https://github.com/Nishannt-X/OnCallify',
  beacon: 'https://github.com/Prashant-thakur77/Beacon',
  tagline: "The model diagnoses. It never gets to choose the fix.",
  pitch:
    'An on-call agent for a Java payments service. It reads logs, metric windows and the config change history, names a root cause, and proposes exactly one allowlisted fix that a human approves by typing its SHA-256 fingerprint.',
  problem:
    'Auto-remediation agents, especially LLM-driven ones, can take unsafe actions, and they are rarely evaluated with any rigor. OnCallify treats both as the main problem: the model is kept away from infrastructure, and a new diagnoser only ships if it beats the old one in a paired test on the same incidents.',
  flow: [
    {
      k: 'Alert',
      v: 'A Node/Express gateway ingests alerts idempotently and tracks each one through pending, firing and resolved.',
    },
    {
      k: 'Evidence',
      v: 'The collector pulls log exemplars, metric windows, git config history and a vault diff from the affected service.',
    },
    {
      k: 'Diagnosis',
      v: 'A diagnoser (rules, logistic regression or IBM Granite) names the root cause and its confidence. It cannot pick an action.',
    },
    {
      k: 'Plan + approval gate',
      v: 'A deterministic planner maps the cause to one of 5 allowlisted runbooks and dry-runs it. A human approves by typing an 8-character SHA-256 fingerprint of the action and its parameters. Approvals are single-use and expire after 15 minutes.',
    },
    {
      k: 'Fix + verify',
      v: 'Bash or PowerShell runbooks execute. "Recovered" needs three checks: the alarm clears, the metric stays quiet, the post-condition holds. A postmortem follows, and every step lands in an immutable PostgreSQL audit log.',
    },
  ],
  // rules-v1 (baseline) vs rules-v2, paired over the same 56 incidents.
  eval: [
    { k: 'Root-cause accuracy', before: 67.9, after: 100.0, diff: '+32.1 pts', stat: '95% CI +19.6 to +44.6 · p<0.0001', good: true },
    { k: 'Unsafe actions', before: 16.1, after: 0.0, diff: '−16.1 pts', stat: 'p=0.0117', good: true, lowerBetter: true },
    { k: 'Correct remediation', before: 69.6, after: 73.2, diff: '+3.6 pts', stat: 'not significant (p=0.50)', neutral: true },
    { k: 'Missed alerts', before: 14.3, after: 26.8, diff: '+12.5 pts', stat: 'worse · p=0.078 after Holm', bad: true, lowerBetter: true },
  ],
  tech: ['Python 3.12', 'FastAPI', 'scikit-learn', 'IBM Granite', 'Node 22', 'Express 5', 'TypeScript', 'Java 21', 'Tomcat 10.1', 'PostgreSQL 16', 'MongoDB', 'React', 'Bash', 'PowerShell', 'GitHub Actions'],
};

const REPLAY = 'Replay of captured incidents';

function Shot({ src, alt, caption, w, h }) {
  return (
    <figure data-frame className="overflow-hidden rounded-xl border border-line bg-surface-2">
      <a href={src} target="_blank" rel="noreferrer" className="block" title="Open full-size screenshot">
        <img src={src} alt={alt} loading="lazy" width={w} height={h} className="block h-auto w-full" />
      </a>
      <figcaption className="border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-dim">
        {caption}
      </figcaption>
    </figure>
  );
}

function EvalRow({ m }) {
  const tone = m.bad ? 'text-sell' : m.neutral ? 'text-ink' : 'text-accent';
  const afterBar = m.bad ? 'bg-sell' : m.neutral ? 'bg-ink/60' : 'bg-accent';
  return (
    <li className="border-b border-line py-5 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="font-display text-lg font-semibold tracking-[-0.02em]">
          {m.k}
          {m.lowerBetter && <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-dim">lower is better</span>}
        </h4>
        <p className={`font-mono text-sm font-bold ${tone}`}>{m.diff}</p>
      </div>

      <div className="mt-3 grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-x-3 gap-y-2 sm:grid-cols-[5.5rem_1fr_4rem]">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">rules-v1</p>
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div data-layer="chip" className="h-full min-w-[2px] rounded-full bg-dim/70" style={{ width: `${m.before}%` }} />
        </div>
        <p className="text-right font-mono text-[13px] text-dim">{m.before.toFixed(1)}%</p>

        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink">rules-v2</p>
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div data-layer="chip" className={`h-full min-w-[2px] rounded-full ${afterBar}`} style={{ width: `${m.after}%` }} />
        </div>
        <p className={`text-right font-mono text-[13px] font-bold ${tone}`}>{m.after.toFixed(1)}%</p>
      </div>

      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-dim">{m.stat}</p>
    </li>
  );
}

export default function OnCallify() {
  return (
    <section id="oncallify" aria-labelledby="oncallify-title" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="02d">Case study</SectionLabel>

        <h2
          id="oncallify-title"
          className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl"
        >
          An agent that <span className="text-accent">can't touch prod alone.</span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-dim md:text-lg">
          OnCallify, in depth: how it decides, who signs off, and how a model earns the right to ship.
        </p>

        <article
          data-frame
          className="card mt-12 overflow-hidden bg-[radial-gradient(80%_60%_at_100%_0%,rgb(var(--accent-rgb)/0.09),transparent_60%)] p-5 sm:p-7 md:mt-16 md:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span data-layer className="pill pill-accent">
              <span className="dot" aria-hidden="true" />
              Open source · MIT
            </span>
            <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
              Java / Node / Python / React
            </span>
          </div>

          {/* Intro + problem */}
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <h3 className="font-display text-4xl font-bold leading-[1] tracking-[-0.04em] md:text-6xl">OnCallify</h3>
              <p className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-accent md:text-2xl">{oc.tagline}</p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/85 md:text-lg">{oc.pitch}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a href={oc.repo} target="_blank" rel="noreferrer" className="link-build">
                  Source on GitHub ↗
                </a>
                <a href="#impact" className="link-build">
                  Headline numbers in Impact ↑
                </a>
              </div>
            </div>

            <div data-frame className="min-w-0 self-start rounded-xl border border-line bg-bg/60 p-5 md:p-6">
              <p className="tag">The on-call problem</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{oc.problem}</p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div className="min-w-0">
              <p className="tag">How it works // alert to verified fix</p>
              <ol className="mt-5 border-t border-line">
                {oc.flow.map((f, i) => (
                  <li key={f.k} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-line py-4">
                    <span className="font-mono text-[10px] text-dim">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="block font-display text-lg font-semibold tracking-[-0.02em]">{f.k}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-dim">{f.v}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <Shot
                src="/img/oncallify-incidents.jpg"
                alt="OnCallify incident list: five incidents with status, diagnosed root cause, confidence and diagnoser variant"
                caption={`${REPLAY} · rules-v2 diagnosed all 5 correctly`}
                w={1328}
                h={450}
              />
              <Shot
                src="/img/oncallify-approval.jpg"
                alt="Approval panel asking the operator to type the fingerprint 11dc557d to approve, with a reject-with-reason field"
                caption={`${REPLAY} · approve by typing the fingerprint`}
                w={1288}
                h={222}
              />
              <p className="font-mono text-[10px] leading-relaxed tracking-[0.04em] text-dim">
                The real diagnosis code, planner and dashboard, run against 5 incidents recorded from the live stack. Dry-run
                and verification were stubbed for this replay.
              </p>
            </div>
          </div>

          {/* Evaluation */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div className="min-w-0">
              <p className="tag">Evaluation // paired, same 56 incidents</p>
              <h4 className="mt-4 font-display text-2xl font-bold leading-tight tracking-[-0.03em] md:text-3xl">
                rules-v1 vs rules-v2, replayed on the same incidents.
              </h4>
              <p className="mt-3 text-[15px] leading-relaxed text-dim">
                56 incidents captured from the live stack (7 fault types × 8). Each diagnoser sees identical evidence; exact
                McNemar tests, Holm-corrected. A logistic-regression diagnoser scored the same as rules-v2.
              </p>
              <ul data-frame className="mt-6 rounded-xl border border-line bg-bg/60 px-5">
                {oc.eval.map((m) => (
                  <EvalRow key={m.k} m={m} />
                ))}
              </ul>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <Shot
                src="/img/oncallify-experiments.jpg"
                alt="Experiments page: variant summary table for rules-v1, rules-v2 and ml-logreg over the 56-incident corpus"
                caption="Experiments page · values from the eval report"
                w={1328}
                h={306}
              />
              <div data-frame className="rounded-xl border border-dashed border-line p-5">
                <p className="tag">The honest part</p>
                <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink/80">
                  <li>
                    Measured on its own 56-incident corpus. The rules were written for the same 7 fault types, so 100% is not a
                    claim about unseen outages.
                  </li>
                  <li>
                    The tradeoff: missed alerts rose from 14.3% to 26.8% (not significant after Holm, but real on this corpus).
                  </li>
                  <li>With 56 pairs, a cause-accuracy difference under ~21% would usually go undetected (80% power).</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {oc.tech.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>

          <div data-frame className="mt-8 rounded-xl border border-line bg-bg/60 p-5 md:flex md:items-center md:gap-6">
            <p className="tag shrink-0">Credit</p>
            <p className="mt-3 text-[15px] leading-relaxed text-dim md:mt-0">
              The safety model (fingerprint-bound single-use approvals, standing contracts, allowlist with dry-run, three-check
              recovery, kill switch) is adapted from{' '}
              <a href={oc.beacon} target="_blank" rel="noreferrer" className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
                Beacon
              </a>{' '}
              by Prashant Thakur (MIT licence). It was re-implemented, not copied, and is credited in the repo&apos;s ORIGIN doc.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
