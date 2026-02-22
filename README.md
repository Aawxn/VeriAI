# AI Ethics Monitor Chrome Extension

Universal Conversational AI Ethical Alignment & Chain-of-Thought Monitor

## Overview

The AI Ethics Monitor is a Chrome extension that provides transparency into AI reasoning processes across major web-based conversational AI platforms. It enables users to view AI chain-of-thought reasoning, challenge ethical decisions, detect bias, and contribute to community-driven ethical oversight of AI systems.

## Features

- **Chain-of-Thought Display**: View AI reasoning processes in real-time
- **Cross-AI Verification**: Compare responses from Claude, Gemini, and DeepSeek APIs
- **Multi-Model Consensus Engine**: Get optimized answers combining insights from multiple AIs using sophisticated meta-evaluation
- **Bias Detection**: Automated NLP-based detection of gender, racial, political bias, emotional manipulation, and logical fallacies
- **Trust Scoring**: Comprehensive trust scores with hallucination and manipulation risk metrics
- **Consistency Analysis**: See how different AI models agree or contradict on facts and reasoning
- **Ethical Challenges**: Interactive tools to question and improve AI responses
- **Community Feedback**: Collaborative system for ethical oversight
- **Educational Resources**: Learn about AI ethics and reasoning processes with in-app explanations
- **Privacy-First**: Local processing with optional community features
- **Theme Switching**: Cyan and Purple theme options for personalized UI

## How Cross-AI Consensus Works

VeriAI uses a **5-step Multi-Model Consensus System** to verify AI responses:

### 1️⃣ **Parallel Model Querying** (3-5 seconds)
When you click "Optimize with Multiple AIs":
- Simultaneously queries **Claude Sonnet 4**, **Gemini 2.0 Flash**, and **DeepSeek Chat**
- Each model responds independently with their answer
- No single AI bias influences the result

### 2️⃣ **Meta-Evaluation** (2-5 seconds)
A meta-evaluator AI (Claude or Gemini) analyzes ALL responses:
- Compares factual accuracy across models
- Evaluates reasoning quality and completeness
- Identifies contradictions and unique insights
- Detects bias indicators

### 3️⃣ **Scoring Algorithm**
Three key metrics are calculated:

| Metric | Description | Score Range |
|--------|-------------|-------------|
| **Consistency** | How much models agree | 90+ = Strong consensus<br>50-89 = Some agreement<br>0-49 = Contradictions |
| **Completeness** | How comprehensive the answer is | 90+ = All aspects covered<br>50-89 = Main points covered<br>0-49 = Incomplete |
| **Bias Risk** | Potential bias detected | 0-20 = Safe<br>21-50 = Medium risk<br>51+ = High risk |

### 4️⃣ **Best Model Selection**
Models are scored on weighted criteria:
- **40%** - Factual accuracy
- **30%** - Reasoning quality
- **20%** - Completeness
- **10%** - Low bias

The highest-scoring model is marked as "Best Model" 🏆

### 5️⃣ **Final Synthesis**
The meta-evaluator produces the "Final Optimized Answer" by:
- ✅ Combining accurate facts from all models
- ✅ Filling gaps where models missed points
- ✅ Correcting factual errors
- ✅ Removing bias and contradictions

**Why This Works:**
- **Diverse Perspectives**: Each AI has different strengths and training data
- **Error Cancellation**: One model's mistake is caught by others
- **Bias Reduction**: Averaging reduces systematic bias
- **Confidence Calibration**: High agreement = High confidence

📚 **[Read Full Consensus Engine Documentation](./docs/CONSENSUS_ENGINE.md)**

## Supported Platforms

- ChatGPT (chat.openai.com)
- Claude (claude.ai)
- Microsoft Copilot (copilot.microsoft.com)
- Google Gemini (gemini.google.com)

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome browser for testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-ethics-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` directory

5. Configure API Keys (Required for Cross-AI Verification):
   - **Option 1 - Via Extension Sidebar (Recommended)**:
     - Go to ChatGPT, Claude, Gemini, or Copilot website
     - Click the VeriAI toggle button to open the sidebar
     - Scroll down to "🔑 TEST YOUR API" section
     - Enter your API keys:
       - 🤖 **Claude API Key**: Get from [Anthropic Console](https://console.anthropic.com/)
       - ✨ **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
       - 🧠 **DeepSeek API Key** (Optional): Get from [DeepSeek Platform](https://platform.deepseek.com/)
     - Click "💾 Save All API Keys"
   
   - **Option 2 - Via Extension Popup**:
     - Click the VeriAI extension icon in Chrome toolbar
     - Click "Settings"
     - Same fields available
     - Keys are stored securely in Chrome sync storage
   
   - See [Quick Start Guide](./docs/QUICK_START.md) for detailed instructions

### Development Commands

- `npm run dev` - Build in development mode with watch
- `npm run build` - Build for production
- `npm run clean` - Clean build directory
- `npm run type-check` - Run TypeScript type checking

## Documentation

- 📖 [Quick Start Guide](./docs/QUICK_START.md) - Get started in 5 minutes
- 🔧 [Claude API Setup](./docs/CLAUDE_API_SETUP.md) - Detailed API configuration
- 📋 [Integration Summary](./docs/CLAUDE_INTEGRATION_SUMMARY.md) - Technical details

## Project Structure

```
src/
├── background/          # Background service worker
├── content/            # Content scripts and platform adapters
│   ├── adapters/       # Platform-specific adapters
│   └── ui/            # UI components
├── popup/             # Extension popup interface
├── shared/            # Shared utilities and constants
└── types/             # TypeScript type definitions

dist/                  # Built extension files
icons/                 # Extension icons
manifest.json          # Chrome extension manifest
```

## Architecture

The extension uses a modular architecture with:

- **Background Service Worker**: Handles extension lifecycle and cross-component communication
- **Content Scripts**: Platform-specific monitoring and UI injection
- **Platform Adapters**: Modular system for supporting different AI platforms
- **UI Manager**: Handles sidebar display and user interactions
- **Popup Interface**: Extension settings and status display

## Privacy & Security

- **Local-First Processing**: All analysis performed locally by default
- **Opt-in Community Features**: Users control data sharing preferences
- **No Personal Data Collection**: Extension focuses on AI response analysis only
- **Secure Communication**: Encrypted data transmission for community features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[License information to be added]

## Support

For issues, questions, or feature requests, please [create an issue](link-to-issues) in the repository.