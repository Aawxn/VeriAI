<div align="center">

  <img src="icons/logo.svg" alt="VeriAI Logo" width="120" />

  # VeriAI

  **AI Transparency & Ethical Alignment Engine**

  *See what your AI is really thinking — before you trust its answer.*

  [![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://github.com/Aawxn/VeriAI)
  [![Manifest V3](https://img.shields.io/badge/Manifest-V3-00D4FF)](https://developer.chrome.com/docs/extensions/mv3/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

  ---

  [**Install**](#-quick-start) · [**Features**](#-features) · [**How It Works**](#-how-it-works) · [**Architecture**](#%EF%B8%8F-architecture) · [**Roadmap**](#-roadmap) · [**Contributing**](#-contributing)

</div>

---

## The Problem

You ask an AI a question. It gives you a confident, well-written answer. But:

- **How do you know it's not hallucinating?**
- **Is the reasoning sound, or just convincing?**
- **Is there hidden bias shaping the response?**
- **Would a different AI give a completely different answer?**

LLMs are black boxes. VeriAI cracks them open.

---

## What VeriAI Does

VeriAI is a Chrome extension that sits alongside ChatGPT, Claude, Gemini, and Copilot. Every time the AI responds, VeriAI automatically:

1. **Extracts the Chain of Thought** — maps out the AI's reasoning steps, confidence levels, and logical flow
2. **Detects Bias** — runs keyword + NLP-based semantic analysis for gender, racial, political bias, loaded language, and generalizations
3. **Cross-Verifies with Multiple AIs** — queries Claude, Gemini, and DeepSeek simultaneously and synthesizes the best answer
4. **Scores Everything** — consistency, completeness, bias risk, and per-step confidence

All in a sleek sidebar with tabbed navigation — no popups, no new tabs.

---

## ✨ Features

| Feature | Description |
|---|---|
| **🧠 Interactive Chain of Thought** | Expandable flowchart of reasoning steps with color-coded types (premise, evidence, reasoning, conclusion, caveat) and per-step confidence bars |
| **🔍 Dual Bias Detection** | Keyword-based pattern matching + Compromise.js NLP semantic analysis running in parallel |
| **⚖️ Cross-AI Verification** | One-click comparison across Claude, Gemini, and DeepSeek-R1 with meta-evaluated consensus scoring |
| **✨ Optimized Answers** | Synthesis engine combines the best parts of each AI's response |
| **📊 Trust Scoring** | Consistency (0-100), Completeness (0-100), Bias Risk (0-100) |
| **🎨 Dual Themes** | Cyan and Purple themes |
| **🔐 Encrypted API Keys** | AES-256-GCM encryption, stored in Chrome sync storage — never hardcoded |
| **🌐 Multi-Platform** | ChatGPT, Claude, Gemini, Copilot — same sidebar everywhere |

---

## 📸 Screenshots

<div align="center">

> *Screenshot of the Analysis tab, CoT tab, and Cross-AI tab go here.*
>
> To add screenshots, place them in a `docs/screenshots/` folder and reference them like:
> `![Analysis Tab](docs/screenshots/analysis.png)`

</div>

---

## 🚀 Quick Start

### Prerequisites

- **Chrome** (or any Chromium browser)
- **Node.js** v16+
- API keys (at least one) from:
  - [Anthropic Console](https://console.anthropic.com/) (Claude)
  - [Google AI Studio](https://aistudio.google.com/app/apikey) (Gemini)
  - [OpenRouter](https://openrouter.ai/keys) (DeepSeek-R1)

### Install

```bash
# Clone the repo
git clone https://github.com/Aawxn/VeriAI.git
cd VeriAI

# Install dependencies
npm install

# Build the extension
npm run build
```

### Load in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder

### Add API Keys

1. Open any supported AI platform (ChatGPT, Claude, etc.)
2. VeriAI sidebar appears automatically
3. Go to the **⚙️ Settings** tab
4. Enter your API keys → Click **Save**
5. Keys are encrypted with AES-256-GCM before storage

---

## 🔬 How It Works

### Chain of Thought Extraction

VeriAI doesn't have access to the AI's internal weights — no one does (for closed models). Instead, it performs **post-hoc reasoning analysis**:

```
AI Response → Sentence Tokenization → Pattern Classification → Reasoning Graph
```

Each sentence is classified as one of:
- `premise` — starting assumptions
- `reasoning` — logical steps
- `evidence` — factual claims
- `conclusion` — final answers
- `caveat` — hedges and limitations
- `assumption` — unstated premises
- `ethical_consideration` — ethical notes

The result is an interactive, expandable flowchart with per-step confidence scoring.

### Bias Detection Pipeline

Two engines run in parallel:

| Engine | Method | Catches |
|--------|--------|---------|
| **Keyword Detector** | Pattern matching + sentence-level scoring | Explicit bias terms, stereotypes, loaded language |
| **NLP Detector** | Compromise.js semantic analysis | Implicit bias, generalizations, political framing, gendered language patterns |

Results are merged into a unified risk score with per-sentence attribution.

### Cross-AI Consensus Engine

```
User's Question ──┬──→ Claude Sonnet 4    ─┐
                  ├──→ Gemini 2.0 Flash   ─┼──→ Meta-Evaluator ──→ Optimized Answer
                  └──→ DeepSeek-R1        ─┘
```

1. **Parallel Query** — all 3 models receive the same question simultaneously
2. **Meta-Evaluation** — Claude or Gemini analyzes all responses for accuracy, reasoning, completeness
3. **Scoring** — Consistency, Completeness, Bias Risk (0-100 each)
4. **Best Model Selection** — weighted: accuracy (40%), reasoning (30%), completeness (20%), low bias (10%)
5. **Synthesis** — combines accurate facts, fills gaps, removes bias → Final Optimized Answer

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                Chrome Extension              │
├──────────┬──────────┬────────────┬──────────┤
│ Content  │ Platform │ Background │  Popup   │
│ Scripts  │ Adapters │  Worker    │   UI     │
├──────────┼──────────┼────────────┼──────────┤
│UIManager │ ChatGPT  │ Message    │ Settings │
│TabSystem │ Claude   │ Router     │ Status   │
│COT View  │ Gemini   │ API Proxy  │          │
│Bias View │ Copilot  │ Key Store  │          │
├──────────┴──────────┴────────────┴──────────┤
│              Shared Modules                  │
├──────────┬──────────┬────────────┬──────────┤
│  Bias    │   CoT    │  Cross-AI  │  NLP     │
│Detection │Extractor │ Verifier   │ Detector │
└──────────┴──────────┴────────────┴──────────┘
```

### Project Structure

```
VeriAI/
├── src/
│   ├── background/          # Service worker — message routing, API proxying
│   ├── content/
│   │   ├── content.ts       # Main content script — orchestrates everything
│   │   ├── adapters/        # Platform-specific DOM detection
│   │   │   ├── ChatGPTAdapter.ts
│   │   │   ├── ClaudeAdapter.ts
│   │   │   ├── GeminiAdapter.ts
│   │   │   └── CopilotAdapter.ts
│   │   └── ui/
│   │       └── UIManager.ts # Tabbed sidebar UI (Analysis, CoT, Cross-AI, Settings)
│   ├── shared/
│   │   ├── biasDetection.ts         # Keyword-based bias detection
│   │   ├── nlpBiasDetector.ts       # Compromise.js NLP detection
│   │   ├── chainOfThoughtExtractor.ts # CoT pattern extraction
│   │   ├── crossAIVerifier.ts       # Multi-model verification engine
│   │   ├── geminiVerifier.ts        # Gemini ethical supervision
│   │   └── encryption.ts           # AES-256-GCM key encryption
│   ├── popup/               # Extension popup HTML + React
│   └── types/               # TypeScript type definitions
├── icons/                   # Extension icons + SVG logo
├── manifest.json            # Chrome Extension Manifest V3
├── webpack.config.js        # Build config with code splitting
└── tsconfig.json
```

### Key Technical Decisions

| Decision | Why |
|---|---|
| **Manifest V3** | Required for Chrome Web Store; uses service workers instead of background pages |
| **Webpack code splitting** | Compromise.js is ~343KB; splitting into `vendors.js` keeps content script lean |
| **Platform adapter pattern** | Each AI site has different DOM structure; adapters abstract the detection logic |
| **Chrome storage + AES-256** | API keys never touch disk unencrypted; synced across devices via Chrome sync |
| **Post-hoc CoT extraction** | Closed models don't expose internals; text pattern analysis is the only viable approach for browser extensions |

---

## 🗺️ Roadmap

### v1.1 — Deeper CoT
- [ ] **Prompt injection for structured reasoning** — silently request step-by-step output in a parseable format
- [ ] **Claim decomposition** — split responses into individual verifiable claims
- [ ] **Source verification** — cross-reference claims against web search results

### v1.2 — Confidence Heatmaps
- [ ] **Logprob analysis** — use OpenAI's logprobs to identify low-confidence tokens
- [ ] **Highlight uncertain sentences** — visual heatmap overlay on the AI response

### v1.3 — Community Intelligence
- [ ] **Shared bias reports** — opt-in anonymous reporting of detected biases
- [ ] **Model reliability scores** — community-aggregated trust scores per model per topic
- [ ] **Alert system** — notifications when a model is frequently wrong about a topic

### v2.0 — Open Model Integration
- [ ] **Local model support** — run small models (Phi, Llama) locally for private verification
- [ ] **Attention weight analysis** — extract what the model "looked at" via open model APIs
- [ ] **Self-consistency checks** — ask the same question 3x and flag divergence

---

## 🛠️ Development

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Type checking only
npm run type-check

# Clean build output
npm run clean
```

### Generating Icons

1. Open `icons/generate-icons.html` in a browser
2. Click "Generate & Download All"
3. Replace the PNGs in `icons/` with the downloads

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'Add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Areas That Need Help

- **Platform adapters** — Copilot and Gemini adapters need testing
- **NLP detection** — improve bias detection accuracy, reduce false positives
- **CoT extraction** — better pattern matching for different AI response styles
- **UI/UX** — mobile-friendly sidebar, accessibility improvements
- **Tests** — unit and integration test coverage

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Compromise.js](https://github.com/spencermountain/compromise) — lightweight NLP in the browser
- [OpenRouter](https://openrouter.ai/) — unified API gateway for DeepSeek-R1
- Built with TypeScript, Webpack, React, and Chrome Extension APIs

---

<div align="center">

  **VeriAI** — *Trust, but verify.*

  <sub>Made by <a href="https://github.com/Aawxn">@Aawxn</a></sub>

</div>
