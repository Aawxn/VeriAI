# AI Ethics Monitor - Application Summary

## What It Is
A Chrome browser extension that monitors AI chatbot conversations in real-time and analyzes them for ethical concerns, bias, and reasoning transparency across multiple AI platforms (ChatGPT, Gemini, Copilot, Claude).

## Core Functionality

### 1. Real-Time Monitoring
- Automatically detects when you're using AI platforms (ChatGPT, Google Gemini, Microsoft Copilot, Claude AI)
- Monitors AI responses as they appear on the page
- Works passively in the background without interrupting your workflow

### 2. Bias Detection (6 Types)
The extension analyzes every AI response for:
- **Gender Bias**: Stereotypes, gendered assumptions, discriminatory language
- **Racial Bias**: Ethnic stereotypes, cultural assumptions, discriminatory content
- **Political Bias**: Partisan language, ideological framing, one-sided arguments
- **Emotional Manipulation**: Fear tactics, guilt induction, urgency creation
- **Logical Fallacies**: Ad hominem, false dichotomies, slippery slopes, appeals to authority
- **Evasiveness**: Vague language, question dodging, deflection tactics

### 3. Chain of Thought Analysis
- Extracts and displays the AI's reasoning process
- Shows step-by-step how the AI arrived at its answer
- Displays confidence levels for each reasoning step
- Highlights ethical considerations the AI took into account
- Identifies assumptions, inferences, and conclusions

### 4. Visual Interface
A sleek sidebar appears on the right side of AI platforms showing:
- **Chain of Thought Section**: Reasoning steps with confidence scores
- **Bias Analysis Section**: Detected biases with severity levels (low/medium/high/critical)
- **Risk Assessment**: Overall risk badge (color-coded)
- **Recommendations**: Actionable suggestions to address detected issues
- **Action Buttons**: Explain, Challenge, Suggest alternatives

### 5. Interactive Features

**Explain Button**:
- Opens a detailed modal showing the complete reasoning breakdown
- Visual confidence bars for each step
- Ethical considerations highlighted
- Sources cited (when available)

**API Testing**:
- Users can input their own API keys
- Test custom AI APIs for bias
- Same analysis applied to custom responses

**Community Reporting**:
- Report bias issues you discover
- View your report history
- See community statistics
- Track bias patterns over time

### 6. Data Storage
- All data stored locally in your browser (localStorage)
- API keys saved securely
- Reports stored with timestamps and platform info
- No data sent to external servers (privacy-first)

## How It Works

### User Journey:
1. **Install Extension** → Load into Chrome
2. **Visit AI Platform** → Go to ChatGPT, Gemini, Copilot, or Claude
3. **Sidebar Appears** → Automatically shows on the right side
4. **Ask AI Question** → Use the AI platform normally
5. **Get Analysis** → Extension analyzes the response in real-time
6. **View Results** → See bias detection, chain of thought, risk level
7. **Take Action** → Explain reasoning, report issues, test your own APIs

### Technical Flow:
```
User visits AI platform
    ↓
Extension detects platform (URL matching)
    ↓
Content script injected into page
    ↓
Platform-specific adapter monitors for responses
    ↓
AI generates response
    ↓
Adapter extracts response text
    ↓
Bias detection engine analyzes (6 algorithms)
    ↓
Chain of thought extracted
    ↓
Results displayed in sidebar
    ↓
User can interact (Explain/Challenge/Report)
```

## Key Benefits

### For Users:
- **Transparency**: See how AI thinks and reasons
- **Safety**: Detect harmful biases before acting on AI advice
- **Education**: Learn about different types of bias
- **Empowerment**: Report issues and contribute to safer AI

### For Researchers:
- **Data Collection**: Track bias patterns across platforms
- **Comparison**: Compare reasoning approaches between AI models
- **Analysis**: Study ethical considerations in AI responses

### For Developers:
- **API Testing**: Test your own AI models for bias
- **Benchmarking**: Compare your AI against major platforms
- **Improvement**: Get actionable recommendations

## Technical Stack
- **Frontend**: TypeScript, React, Vanilla JS
- **Build**: Webpack 5, Babel
- **Platform**: Chrome Extension Manifest V3
- **Storage**: localStorage, Chrome Storage API
- **Architecture**: Modular adapter pattern for extensibility

## Supported Platforms
✅ ChatGPT (chat.openai.com, chatgpt.com)
✅ Google Gemini (gemini.google.com)
✅ Microsoft Copilot (copilot.microsoft.com)
✅ Claude AI (claude.ai)

## Current Features Status

### ✅ Fully Implemented:
- Platform detection and monitoring
- Sidebar UI with modern dark theme
- Bias detection (6 algorithms)
- Chain of thought display
- Risk assessment and recommendations
- Explain modal with detailed breakdown
- API key storage and management
- Community reporting system
- Minimize/maximize sidebar
- Local data storage

### 🚧 Placeholder/Demo Mode:
- Challenge button (shows alert)
- Suggest button (shows alert)
- API testing (simulated, not connected to real APIs)
- Community statistics (randomized for demo)

## Use Cases

### 1. Personal Use
"I'm using ChatGPT for career advice. I want to make sure the advice isn't biased based on my gender or background."

### 2. Research
"I'm studying how different AI models handle controversial topics. I need to track bias patterns across platforms."

### 3. Development
"I'm building my own AI chatbot. I want to test it for bias before releasing it to users."

### 4. Education
"I'm teaching a class on AI ethics. I want to show students real examples of bias in AI responses."

### 5. Content Moderation
"I'm reviewing AI-generated content for my company. I need to flag potentially problematic responses."

## Privacy & Security
- ✅ No external API calls (all processing local)
- ✅ No user tracking or analytics
- ✅ No data sent to servers
- ✅ Open source and auditable
- ⚠️ API keys stored in plain text (should be encrypted in production)

## Installation
1. Download/clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome → `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" → Select `dist/` folder
7. Visit any supported AI platform
8. Sidebar appears automatically!

## Future Enhancements
- Real API integration for custom testing
- Server-side report aggregation
- Machine learning-based bias detection
- Multi-language support
- Export reports as PDF/JSON
- Browser compatibility (Firefox, Edge)
- Mobile support

---

**Version**: 1.0.0  
**License**: MIT  
**Last Updated**: October 24, 2025
