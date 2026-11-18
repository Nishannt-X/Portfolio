export const links = {
  email: "dahiyanishant2405@gmail.com",
  github: "https://github.com/Nishannt-X",
  linkedin: "https://www.linkedin.com/in/nishant-dahiya24/",
  finova: "https://www.finovamanipal.org",
};

export const stats = [
  { value: 6, prefix: "Top ", label: "of 95,000+ submissions", sub: "Amazon AI for Bharat · Grand Finalist" },
  { value: 5, prefix: "#", suffix: "th", label: "of 2,200+ teams", sub: "Finarva AI Hackathon" },
  { value: 21000, suffix: "+", label: "sensor readings / hr", sub: "NTPC telemetry, sub-second latency" },
  { value: 500, suffix: "+", label: "people reached", sub: "FINOVA events I helped run" },
];

export const marquee = [
  "Spring Boot", "Kafka", "WebSockets", "PyTorch", "LSTM", "RAG", "AWS", "Docker",
  "TimescaleDB", "Redis", "React", "Flask", "Twilio", "Deepgram", "Groq", "ElevenLabs",
  "Amazon Bedrock", "XGBoost", "MySQL", "Python", "Java",
];

export const pipeline = [
  { id: "caller", label: "Caller", tag: "PSTN", log: "A person speaks on an ordinary phone call. No app to install." },
  { id: "twilio", label: "Twilio", tag: "Media Streams", log: "Call audio is forked out of the phone network and pushed over a WebSocket as live frames." },
  { id: "stt", label: "Deepgram", tag: "Speech → Text", log: "Streaming transcription: words arrive while the person is still talking." },
  { id: "llm", label: "Groq", tag: "LLM", log: "The model translates and decides the reply, token by token, on fast inference." },
  { id: "tts", label: "ElevenLabs", tag: "Text → Speech", log: "Synthesised speech starts streaming before the full sentence is finished." },
  { id: "back", label: "Back to caller", tag: "Streamed back", log: "Audio returns down the same call in the other person's language. Sub-second, end to end." },
];

export const work = [
  {
    id: "ai-setu",
    kind: "Hackathon",
    title: "AI-Setu",
    event: "Amazon AI for Bharat · powered by AWS",
    result: "Grand Finalist · Top 6 in India",
    metric: { n: "TOP 6", l: "of 95,000+ submissions" },
    repo: "https://github.com/Nishannt-X/AI-Setu_Bharat-Build",
    context: "Selected from 95,000+ submissions nationwide.",
    description:
      "A real-time voice AI that sits inside an ordinary phone call and lets two people talk across languages. Twilio Media Streams over WebSockets, streaming STT, an LLM in the middle and streaming TTS out, with sub-second end-to-end latency. Built for people who never touch an app.",
    tech: ["Twilio", "WebSockets", "Deepgram STT", "Groq LLM", "ElevenLabs TTS", "AWS"],
  },
  {
    id: "drivesafe",
    kind: "Hackathon",
    title: "DriveSafe AI",
    event: "Finarva AI Hackathon by Gromo",
    result: "5th place · 2,200+ teams",
    metric: { n: "#5", l: "of 2,200+ teams" },
    context: "Incubated at MIT Manipal Innovation Center.",
    description:
      "Real-time driver risk scoring from OBD-II vehicle data. LSTM and XGBoost models reach 87% accuracy and feed a dynamic risk score that insurers can use to price policies on how someone actually drives.",
    tech: ["Spring Boot", "LSTM", "XGBoost", "Python Flask"],
  },
  {
    id: "bankshield",
    kind: "Hackathon",
    title: "BankShield AI",
    event: "FinShield @ IIT Hyderabad · PSBs Hackathon Series 2025 with Bank of India",
    result: "Top 9 Finalist",
    metric: { n: "TOP 9", l: "Finalist · FinShield" },
    repo: "https://github.com/Nishannt-X/shieldai-auth",
    context: "Banking security, built around risk at login.",
    description:
      "Behaviour-based risk assessment the moment someone logs in. Low risk gets a seamless login, medium risk gets RAG-powered conversational verification, high risk escalates to Video KYC with face matching.",
    tech: ["Spring Boot", "MySQL", "React", "DeepFace", "Python ML"],
    year: "2025",
  },
  {
    id: "grid",
    kind: "Hackathon",
    title: "Flipkart GRID 7.0",
    event: "Flipkart National Hackathon",
    result: "Semi-Finalist · Top 256",
    metric: { n: "TOP 256", l: "of 1,00,000+ candidates" },
    context: "Shortlisted from 1,00,000+ candidates.",
    description:
      "Algorithmic and system-design rounds against some of the best student engineers in the country.",
    tech: ["System Design", "Algorithms", "Data Structures"],
  },
  {
    id: "paynest",
    kind: "Project",
    title: "PayNest",
    event: "Independent build",
    result: "Full-stack fintech",
    metric: { n: "JWT", l: "secured REST APIs" },
    repo: "https://github.com/Nishannt-X/PaynestApp",
    context: "A secure financial nest for families.",
    description:
      "Parent and child account management with real-time controls, JWT-secured REST APIs and automated UI testing with Selenium.",
    tech: ["Spring Boot", "MySQL", "React", "Selenium"],
    year: "2024",
  },
  {
    id: "stocks",
    kind: "Project",
    title: "Stock Market Prediction",
    event: "Independent build",
    result: "+15% accuracy from tuning",
    metric: { n: "+15%", l: "accuracy from tuning" },
    context: "10+ years of market data.",
    description:
      "Logistic Regression, SVM, Random Forest and XGBoost compared on a decade of stock data. Hyperparameter tuning lifted accuracy by 15%.",
    tech: ["Machine Learning", "XGBoost", "Random Forest"],
    year: "2023",
  },
];

export const experience = [
  {
    company: "NTPC Limited",
    role: "IT Intern",
    date: "May – Jul 2026",
    headline: "Industrial telemetry that reacts before the machine breaks.",
    big: { n: "21,000+", l: "readings / hour" },
    bullets: [
      "Architected a real-time sensor streaming platform with sub-second latency, on Kafka as the event-driven backbone.",
      "Deployed a PyTorch LSTM Autoencoder for predictive maintenance, 85%+ F1 across 32-feature anomaly detection.",
    ],
    tech: ["Spring Boot", "Kafka", "TimescaleDB", "PyTorch"],
  },
  {
    company: "HCLTech",
    role: "AI/ML Intern",
    date: "May – Jul 2025",
    headline: "Forecasting which invoices get paid, and when.",
    big: { n: "LSTM + FNN", l: "hybrid daily forecaster" },
    bullets: [
      "Built a full-stack Accounts Receivable forecasting system for daily payment predictions.",
      "Engineered pipelines for macroeconomic indicators, served through a Flask REST API integrated with Spring Boot.",
    ],
    tech: ["Flask", "React", "TypeScript", "LSTM"],
  },
];

export const skills = [
  { title: "Languages", items: ["Python", "Java", "C", "SQL"] },
  { title: "Frameworks", items: ["Spring Boot", "Flask", "React", "Tailwind CSS", "Selenium"] },
  { title: "Cloud & Infra", items: ["AWS (EC2, ECS, RDS, ElastiCache)", "Docker", "Kafka", "TimescaleDB", "Redis", "Git"] },
  { title: "AI / ML", items: ["LSTM", "RAG", "Anomaly Detection", "Amazon Bedrock", "Groq", "Deepgram", "ElevenLabs"] },
  { title: "System Design", items: ["Microservices", "Event-Driven Architecture", "Low-Latency Systems", "WebSockets"] },
];

export const campus = [
  { role: "Management Committee", org: "Apple Developers' Group, Manipal", note: "Two years organising technical initiatives and outreach." },
  { role: "Management Committee", org: "Economics & Finance Society of Manipal", note: "Shaping finance-driven initiatives across the university." },
];

const gh = (n) => `https://github.com/Nishannt-X/${n}`;

export const repos = [
  { name: "FIX-Trading-Sim", lang: "Java · Quarkus", desc: "Order matching engine with FIX 4.4 translation.", url: gh("FIX-Trading-Sim") },
  { name: "Black-Scholes", lang: "Java", desc: "Options pricing and risk sensitivities.", url: gh("Black-Scholes") },
  { name: "paywise-insight-backend", lang: "Java · Spring Boot", desc: "Payment reconciliation with audit trails.", url: gh("paywise-insight-backend") },
  { name: "NTPC-SCADA-Proto", lang: "TypeScript · Kafka", desc: "Industrial telemetry ingestion dashboard.", url: gh("NTPC-SCADA-Proto") },
  { name: "Bio-Assist_AI", lang: "TypeScript · FastAPI", desc: "Multimodal research copilot.", url: gh("Bio-Assist_AI") },
  { name: "Auto_Job_Applier", lang: "Node.js", desc: "Agent that automates job applications.", url: gh("Auto_Job_Applier") },
  { name: "shieldai-auth", lang: "Spring Boot · React", desc: "Risk-based banking authentication (BankShield AI).", url: gh("shieldai-auth") },
  { name: "AI-Setu_Bharat-Build", lang: "Java · AWS", desc: "Multilingual voice AI call orchestrator.", url: gh("AI-Setu_Bharat-Build") },
  { name: "HangLens", lang: "C", desc: "Computer vision utility.", url: gh("HangLens") },
  { name: "OnCallify", lang: "Python", desc: "Featured at Amazon Bharat Build.", url: gh("OnCallify") },
];

// Practice + smaller public repos (language from GitHub; no invented descriptions).
export const practice = {
  title: "Practice",
  items: ["LeetCode", "NeetCode", "DSA in Python"],
  url: gh("neetcode-submissions"),
};

export const archive = [
  { name: "Amazon_Bharat_build_2", lang: "TypeScript", desc: "Amazon Bharat Build Hackathon: Featured Project", url: gh("Amazon_Bharat_build_2") },
  { name: "FinarvaAI", lang: "HTML", url: gh("FinarvaAI") },
  { name: "Collection_Forecast", lang: "TypeScript", url: gh("Collection_Forecast") },
  { name: "ayuaahaar-connect", lang: "TypeScript", url: gh("ayuaahaar-connect") },
  { name: "chat-auth-buddy", lang: "TypeScript", url: gh("chat-auth-buddy") },
  { name: "Iso", lang: "TypeScript", url: gh("Iso") },
  { name: "G_One", lang: "Java", url: gh("G_One") },
  { name: "G_One-AI", lang: "Java", url: gh("G_One-AI") },
  { name: "FintechLab", lang: "Java", url: gh("FintechLab") },
  { name: "BTLAB1", lang: "Java", url: gh("BTLAB1") },
  { name: "PaynestApp", lang: "JavaScript", url: gh("PaynestApp") },
  { name: "neetcode-submissions", lang: "Python", url: gh("neetcode-submissions") },
];
