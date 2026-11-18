// New, verified content (kept separate from data.js). Every number comes from the
// research dossier's metrics bank; see the source caption on each item.

const gh = (n) => `https://github.com/Nishannt-X/${n}`;

/* ── Impact bar ─────────────────────────────────────────────── */
export const impact = [
  {
    n: "862",
    unit: "+ 111",
    label: "Automated tests",
    note: "862 backend + 111 web, run against fake upstream servers",
    source: "G-One · repo, 10 Nov 2026",
  },
  {
    n: "+32.1%",
    label: "Cause accuracy",
    note: "67.9% → 100.0% on 56 incidents captured from a live stack · paired McNemar/Holm, p<0.0001",
    source: "OnCallify · eval report",
    mark: "*",
  },
  {
    n: "0.0%",
    label: "Unsafe actions",
    note: "Down from 16.1% on the same 56 incidents · Holm p=0.0117",
    source: "OnCallify · eval report",
    mark: "*",
  },
  {
    n: "2.12",
    unit: "days",
    label: "Forecast MAE",
    note: "44.1% better than a Random Forest baseline (3.79) · 80K synthetic invoices",
    source: "AR forecaster · HCLTech project",
  },
  {
    n: "4.75",
    unit: "ms",
    label: "Avg order latency",
    note: "FIX 4.4 broker + exchange, measured in validation runs",
    source: "FIX trading simulator",
    mark: "†",
  },
];

export const impactFootnotes = [
  { mark: "*", text: "OnCallify's safety model is adapted from Beacon (MIT licence), credited in the repo's ORIGIN doc." },
  { mark: "†", text: "Built on the open-source fix-trading-simulator for Capital Market Technology Lab coursework." },
];

/* ── Live now: G-One ────────────────────────────────────────── */
export const gOne = {
  title: "G-One",
  tagline: "The voice in the middle, on the farmer's side.",
  pitch:
    "A voice assistant that brings a buyer onto the farmer's call, translates both ways, and quietly tells the farmer what the buyer can't hear.",
  context: "Gnani.ai Great Indian AI Internship Challenge submission (team of two)",
  demo: "https://16-178-14-243.sslip.io/#/demo",
  repo: gh("G_One"),
  features: [
    { k: "Translates both ways", v: "The farmer speaks Kannada, the buyer speaks Bengali. Each hears the other in their own language." },
    { k: "Whispers to the farmer", v: "Price notes and cautions go to the farmer only. The buyer's line stays silent while G-One advises." },
    { k: "Watches for traps", v: "A buyer asking for a UPI PIN or OTP gets a fixed caution to the farmer, and the secret is never repeated." },
    { k: "Closes cleanly", v: "Terms are read back, both sides say \"yes\" out loud, and a bilingual Sauda Parchi (deal slip) is produced." },
    { k: "Remembers, with consent", v: "A returning farmer is greeted by name. Any farmer can say \"forget me\"." },
  ],
  myLane:
    "Repository owner. Call pipeline and Gnani speech integration, mediation, the web console (call stage, farmers, analytics, deal map), browser call simulator, demo and launch.",
  tests: [
    { n: "862", l: "backend tests" },
    { n: "111", l: "web tests" },
  ],
  tech: ["Java 21", "Spring Boot 3.5", "WebSockets", "Gnani Prisma STT", "Gnani Timbre TTS", "Sarvam", "SQLite", "React 19", "TypeScript", "Tailwind 4"],
  shots: [
    { src: "/img/g-one-call.jpg", alt: "G-One call stage: the farmer speaks Kannada, G-One sits in the middle, and the buyer hears nothing while G-One listens; a price check shows the offer below the dated reference", caption: "Call stage // three parties, whispers, deal card" },
    { src: "/img/g-one-home.jpg", alt: "G-One homepage: The voice in the middle, on the farmer's side", caption: "Home // the pitch" },
    { src: "/img/g-one-dealmap.jpg", alt: "G-One deal map of India with simulated example deals", caption: "Deal map // prototype, simulated deals" },
  ],
  building: {
    title: "Phone line via Twilio",
    note: "Two independent legs, each its own media stream. Designed in ADR 0002; today the full flow runs as a browser call.",
  },
  disclaimer: "All names, numbers and prices in the demo are synthetic.",
};

/* ── Credentials ────────────────────────────────────────────── */
export const research = [
  {
    status: "Co-author · IEEE conference 2025",
    title: "Can Head and Shoulders solve the long, old mystery of prediction of Stock Market Crashes of India?",
    note: "BSE Sensex, Jul 1997 – Aug 2011: the pattern predicted 2 of 4 crashes.",
  },
  {
    status: "Co-author · IEEE conference 2025",
    title: "An Empirical Investigation of Customer Attitudes Toward Mobile Banking: A Study on Dhar District",
    note: "Survey study, N = 100.",
  },
  {
    status: "Manuscript · equal contribution",
    title: "Privacy-Preserved Credit Card Fraud Detection Using Homomorphic Encryption and Machine Learning",
    note: "Fraud classifiers compared on encrypted vs plain transaction data.",
  },
];

export const certifications = [
  {
    title: "NSD Certified Penetration Tester",
    level: "Cadet level",
    issuer: "National Security Database with Manipal Academy of Higher Education",
    date: "Issued 28/03/2026 · valid 3 years",
  },
  {
    title: "Internship completion certificate",
    level: "Forecasting AI / ML use case",
    issuer: "HCLTech",
    date: "29 May – 09 Jul 2025 · dated 15 July 2025",
  },
];

export const community = {
  label: "FINOVA × eDC IIT Delhi",
  text: "Partnership between FINOVA, the fintech club of MIT Manipal, and eDC IIT Delhi.",
};
