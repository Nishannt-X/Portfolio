import { SectionLabel, Chip } from './ui';

/*
 * FloodFlow case study. Facts come from the project README (Nishannt-X/Amazon_Bharat_build_2)
 * and from re-running the app locally (Nov 2026): the bundled Connaught Place demo photo was
 * analysed by the local CV worker (SIFT + RANSAC, Faster R-CNN, Grounding DINO, CLIPSeg), then
 * screened for two vehicles. Bedrock was off, so the deterministic rules produced the guidance.
 * The live CloudFront deployment is offline, so there is no demo link on purpose.
 */

const ff = {
  repo: 'https://github.com/Nishannt-X/Amazon_Bharat_build_2',
  event: 'Built for the AWS x WeMakeDevs Bharat Builds Tour, Environmental Hacks (Heat & Water track)',
  pitch:
    'A civic flood-reporting app: turn a photo of a waterlogged road into evidence, vehicle-aware guidance and a shared map observation.',
  problem:
    'Monsoon waterlogging on Indian roads changes street by street and hour by hour. A binary "flooded / clear" map throws away what matters: how deep the water is, whether it is moving, whether the road surface is hidden, and how much clearance your vehicle actually has.',
  flow: [
    {
      k: 'Photo + GPS',
      v: 'Photo-first report with a fresh device location fix. Uploads are decoded and re-encoded, and EXIF is stripped.',
    },
    {
      k: 'Dry-reference comparison',
      v: 'The wet photo is matched against a dry view of the same place: a bundled demo baseline, or a Google Street View 360° heading sweep with a road-resemblance fallback.',
    },
    {
      k: 'CV depth range',
      v: 'A Python worker aligns the two with ORB/SIFT + RANSAC homography, takes Grounding DINO, CLIPSeg and Faster R-CNN proposals, and turns waterline spans into an indicative depth range, not a single number.',
    },
    {
      k: 'Vehicle-aware guidance',
      v: 'Depth is screened against a 300+ model Indian vehicle catalog with clearance research. Server-side rules own the metrics; Bedrock Nova Lite only explains, and a deterministic fallback covers inference failures.',
    },
    {
      k: 'Shared hotspot map',
      v: 'Saved reports join a hotspot when within 40 m, stay active for 24 h via DynamoDB TTL, and remain in a permanent archive for location history and route-exposure checks.',
    },
  ],
  aws: [
    'CloudFront',
    'ALB',
    'ECS Fargate',
    'ECR',
    'S3',
    'DynamoDB ×6',
    'EFS',
    'Secrets Manager',
    'Bedrock Nova Lite',
    'Polly',
    'CloudWatch',
    'CloudFormation',
    'Terraform',
  ],
  tech: ['Next.js 16', 'React 19', 'TypeScript', 'Python', 'OpenCV', 'PyTorch', 'Grounding DINO', 'CLIPSeg', 'Faster R-CNN', 'Leaflet', 'OSRM', 'Deepgram', 'Amazon Polly'],
};

function Shot({ src, alt, caption, w, h, tone }) {
  return (
    <figure data-frame className="overflow-hidden rounded-xl border border-line bg-surface-2">
      <a href={src} target="_blank" rel="noreferrer" className="block" title="Open full-size image">
        <img src={src} alt={alt} loading="lazy" width={w} height={h} className="block h-auto w-full" />
      </a>
      <figcaption
        className={`border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] ${tone || 'text-dim'}`}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

export default function FloodFlow() {
  return (
    <section id="floodflow" aria-labelledby="floodflow-title" className="relative px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionLabel index="02c">Environmental hack</SectionLabel>

        <h2
          id="floodflow-title"
          className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-7xl"
        >
          The same road. <span className="text-accent">A different risk for every vehicle.</span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-dim md:text-lg">{ff.event}.</p>

        <article
          data-frame
          className="card mt-12 overflow-hidden bg-[radial-gradient(80%_60%_at_100%_0%,rgb(var(--accent-rgb)/0.09),transparent_60%)] p-5 sm:p-7 md:mt-16 md:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span data-layer className="pill">
              <span className="dot" aria-hidden="true" />
              Hackathon build · AWS
            </span>
            <span data-layer="label" className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
              Next.js / Python CV / AWS
            </span>
          </div>

          {/* Intro + problem */}
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <h3 className="font-display text-4xl font-bold leading-[1] tracking-[-0.04em] md:text-6xl">FloodFlow</h3>
              <p className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-accent md:text-2xl">
                Is this water too deep for what I drive?
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/85 md:text-lg">{ff.pitch}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a href={ff.repo} target="_blank" rel="noreferrer" className="link-build">
                  Source on GitHub ↗
                </a>
              </div>
              <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-dim">
                Deployed on AWS for the hackathon; live deployment is currently offline
              </p>
            </div>

            <div data-frame className="min-w-0 self-start rounded-xl border border-line bg-bg/60 p-5 md:p-6">
              <p className="tag">The monsoon problem</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{ff.problem}</p>
            </div>
          </div>

          {/* Proof: one photo, two vehicles */}
          <div className="mt-14">
            <p className="tag">One photo, two vehicles // same 110 mm estimate</p>
            <h4 className="mt-4 max-w-3xl font-display text-2xl font-bold leading-tight tracking-[-0.03em] md:text-3xl">
              A hatchback gets a lower-risk note. A scooter is told to turn back.
            </h4>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-dim">
              The CV worker estimated 110 mm (indicative range 0–562 mm) for a waterlogged Delhi street. The same estimate
              then meets each vehicle's clearance reference and class rules: 53 mm below a Swift's 163 mm reference, but
              above the 70 mm threshold used to screen scooters.
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Shot
                src="/img/floodflow-guide-car.jpg"
                alt="FloodFlow next-step card for a 2022 Maruti Swift: lower depth-related risk, 110 mm water is 53 mm below the 163 mm clearance reference, confidence 83%"
                caption="Maruti Swift // lower depth-related risk"
                w={1200}
                h={582}
              />
              <Shot
                src="/img/floodflow-guide-scooter.jpg"
                alt="FloodFlow next-step card for a 2023 Honda Activa 6G: high risk, turn back, 110 mm water raises low-component and traction concerns"
                caption="Honda Activa 6G // high risk · turn back"
                tone="text-sell"
                w={1200}
                h={619}
              />
            </div>
            <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.04em] text-dim">
              Re-run locally from the bundled demo incident (Nov 2026) with Bedrock off, so the deterministic rules wrote
              this guidance. The confidence is an evidence-quality index, not a calibrated probability.
            </p>
          </div>

          {/* How it works */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div className="min-w-0">
              <p className="tag">How it works // photo to map</p>
              <ol className="mt-5 border-t border-line">
                {ff.flow.map((f, i) => (
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
                src="/img/floodflow-cv-pipeline.jpg"
                alt="Illustrative diagram of the FloodFlow CV pipeline: input photo, feature matching against a dry reference image, object detection, waterline segmentation and an output card"
                caption="CV pipeline // illustrative diagram, sample values"
                w={1376}
                h={768}
              />
              <Shot
                src="/img/floodflow-map.jpg"
                alt="FloodFlow map of central Delhi with water-drop hotspot markers and a list of labelled sample incidents"
                caption="Shared map // labelled sample incidents"
                w={1280}
                h={800}
              />
            </div>
          </div>

          {/* Architecture */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <Shot
                src="/img/floodflow-architecture.jpg"
                alt="FloodFlow AWS architecture: commuters and voice input reach CloudFront, then an Application Load Balancer, then an ECS Fargate task running the Next.js app and the Python CV service, which use Bedrock Nova Lite, DynamoDB, S3 and Polly"
                caption="AWS architecture // one Fargate task, two containers"
                w={1376}
                h={768}
              />
            </div>

            <div className="min-w-0">
              <p className="tag">On AWS // what ran where</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/85">
                CloudFront → ALB → one ECS Fargate task (2 vCPU · 8 GB) running the Next.js web container and the Python CV
                container side by side, with images in ECR. Evidence photos go to S3, reports, archives, accounts, sessions,
                garage and analyses to 6 DynamoDB tables, and the remaining SQLite state to EFS. Keys live in Secrets
                Manager behind IAM task roles; Bedrock Nova Lite reads scene context, Polly speaks, CloudWatch collects
                logs, and CloudFormation plus Terraform provision it.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {ff.aws.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <div data-frame className="mt-6 rounded-xl border border-dashed border-line p-5">
                <p className="tag">Honest limit</p>
                <p className="mt-3 text-[15px] leading-relaxed text-dim">
                  A single-instance hackathon deployment, not a stateless, horizontally scaled backend: EFS keeps the
                  leftover SQLite state alive across task replacement while the storage migration was unfinished.
                </p>
              </div>
            </div>
          </div>

          {/* Voice + tests */}
          <div data-frame className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
            <div className="bg-surface p-5 md:p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink">Hindi / English voice chat</p>
              <p className="mt-2 text-[15px] leading-relaxed text-dim">
                When the photo is not enough, a separate context chat asks about safely observable conditions. Speech in
                via Deepgram (Amazon Transcribe was blocked in the AWS org), questions spoken back by Polly's bilingual
                Kajal voice, with typing always available. Answers can only nudge the score within bounds.
              </p>
            </div>
            <div className="bg-surface p-5 md:p-6">
              <div data-layer className="flex items-baseline gap-2">
                <span className="numeral text-4xl leading-none md:text-5xl">15</span>
                <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-accent">test commands</span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-dim">
                Type-check, lint, build, 8 npm suites, 4 node scripts and Python unittest: geometry inputs, evidence
                preservation, report ownership, clustering, route exposure, GPS handling. They verify software rules; they
                are not a field accuracy benchmark.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {ff.tech.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
