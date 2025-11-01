# AI Ethics Monitor - Technical Documentation

## 📋 Table of Contents
1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [How It Works](#how-it-works)
4. [Component Breakdown](#component-breakdown)
5. [Data Flow](#data-flow)
6. [File Structure](#file-structure)
7. [Key Features](#key-features)

---

## 🛠️ Tech Stack

### Core Technologies
- **TypeScript** - Type-safe JavaScript for better development experience
- **Chrome Extension Manifest V3** - Latest Chrome extension API
- **Webpack 5** - Module bundler for building the extension
- **React 18** - UI library for the popup interface
- **Vanilla JavaScript/TypeScript** - For content scripts (better performance)

### Build Tools
- **webpack** - Module bundler
- **ts-loader** - TypeScript loader for webpack
- **babel** - JavaScript transpiler
- **mini-css-extract-plugin** - CSS extraction
- **copy-webpack-plugin** - Asset copying

### Development Tools
- **TypeScript Compiler** - Type checking
- **ESLint** - Code linting (optional)
- **npm** - Package management

### Browser APIs Used
- **Chrome Storage API** - For storing user preferences and data
- **Chrome Runtime API** - For message passing between components
- **Chrome Scripting API** - For injecting content scripts
- **DOM APIs** - For UI manipulation and monitoring

---

## 🏗️ Architecture Overview

The extension follows a **modular, event-driven architecture** with three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Popup UI   │    │  Background  │    │   Content    │  │
│  │   (React)    │◄──►│   Service    │◄──►│   Script     │  │
│  │              │    │   Worker     │    │  (Injected)  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                   │           │
│                                                   ▼           │
│                                          ┌──────────────┐    │
│                                          │  AI Platform │    │
│                                          │  (ChatGPT,   │    │
│                                          │   Gemini,    │    │
│                                          │   etc.)      │    │
│                                          └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Roles

1. **Popup UI** - User interface for extension settings and status
2. **Background Service Worker** - Coordinates between components, manages state
3. **Content Script** - Injected into AI platforms, monitors and analyzes responses
4. **Platform Adapters** - Platform-specific logic for different AI services

---

## 🔄 How It Works

### 1. Extension Initialization

```
User visits AI platform (e.g., ChatGPT)
         ↓
Chrome detects URL match in manifest.json
         ↓
Content script (content.js) is injected
         ↓
ContentScriptManager initializes
         ↓
Platform detection (detectPlatform)
         ↓
Platform-specific adapter created
         ↓
UI Manager creates sidebar
         ↓
Monitoring starts
```

### 2. Response Monitoring Flow

```
AI generates response on page
         ↓
Platform Adapter detects new content
         ↓
Adapter extracts response text
         ↓
Chain of Thought extraction (if available)
         ↓
Bias Detection Engine analyzes text
         ↓
Results displayed in sidebar
         ↓
User can interact (Explain, Challenge, Report)
```

### 3. Bias Detection Process

```
Text Input
    ↓
┌───────────────────────────────────┐
│   Bias Detection Engine           │
├───────────────────────────────────┤
│  1. Gender Bias Detection         │
│  2. Racial Bias Detection         │
│  3. Political Bias Detection      │
│  4. Emotional Manipulation Check  │
│  5. Logical Fallacy Detection     │
│  6. Evasiveness Analysis          │
└───────────────────────────────────┘
    ↓
Risk Assessment (low/medium/high/critical)
    ↓
Recommendations Generated
    ↓
Display in Sidebar
```

---

## 🧩 Component Breakdown

### 1. Content Script (`src/content/content.ts`)

**Purpose**: Main entry point injected into AI platform pages

**Key Responsibilities**:
- Platform detection
- Adapter initialization
- UI management
- Response monitoring coordination
- Message passing with background service

**Key Classes**:
```typescript
class ContentScriptManager {
  - platform: SupportedPlatform
  - platformAdapter: BasePlatformAdapter
  - uiManager: UIManager
  - initialize()
  - startMonitoring()
  - handleAIResponse()
  - performBiasAnalysis()
}
```

### 2. UI Manager (`src/content/ui/UIManager.ts`)

**Purpose**: Manages all UI components and user interactions

**Key Features**:
- Sidebar creation and styling
- Content rendering (Chain of Thought, Bias Analysis)
- Modal dialogs (Explain functionality)
- Event handling (buttons, inputs)
- API Key management
- Community reporting

**Key Methods**:
```typescript
class UIManager {
  - initialize()
  - displayAnalysis()
  - showExplainModal()
  - renderAPIKeySection()
  - renderCommunityReportSection()
  - handleSaveAPIKey()
  - handleReportBias()
}
```

### 3. Platform Adapters (`src/content/adapters/`)

**Purpose**: Platform-specific logic for different AI services

**Adapter Pattern**:
```typescript
BasePlatformAdapter (Abstract)
    ↓
├── ChatGPTAdapter
├── CopilotAdapter
├── GeminiAdapter
└── ClaudeAdapter
```

**Key Methods**:
```typescript
abstract class BasePlatformAdapter {
  - startMonitoring(callback)
  - extractChainOfThought(response)
  - detectNewResponse()
  - parseResponse()
}
```

### 4. Bias Detection Engine (`src/shared/biasDetection.ts`)

**Purpose**: Analyzes text for various types of bias

**Detection Algorithms**:

1. **Gender Bias**
   - Pattern matching for gendered language
   - Stereotype detection
   - Pronoun analysis

2. **Racial Bias**
   - Ethnic stereotype detection
   - Discriminatory language
   - Cultural assumptions

3. **Political Bias**
   - Partisan language detection
   - Ideological framing
   - One-sided arguments

4. **Emotional Manipulation**
   - Fear-based language
   - Guilt induction
   - Urgency creation

5. **Logical Fallacies**
   - Ad hominem attacks
   - False dichotomies
   - Slippery slope arguments
   - Appeal to authority

6. **Evasiveness**
   - Vague language
   - Question dodging
   - Deflection tactics

**Output Structure**:
```typescript
{
  overallRisk: 'low' | 'medium' | 'high' | 'critical',
  flaggedContent: [
    {
      type: 'gender_bias' | 'racial_bias' | ...,
      severity: 'low' | 'medium' | 'high' | 'critical',
      description: string,
      textSpan: { start, end, text }
    }
  ],
  recommendations: string[]
}
```

### 5. Background Service Worker (`src/background/background.ts`)

**Purpose**: Coordinates extension-wide state and communication

**Key Responsibilities**:
- Platform registration tracking
- Message routing
- State management
- Extension lifecycle management

### 6. Popup UI (`src/popup/popup.tsx`)

**Purpose**: Extension popup interface (React-based)

**Features**:
- Platform status display
- Quick settings access
- Statistics overview
- Extension controls

---

## 📊 Data Flow

### Message Passing Architecture

```
Content Script ←→ Background Service ←→ Popup UI
       ↓
   localStorage
   (API keys, reports)
```

**Message Types**:
```typescript
{
  REGISTER_PLATFORM: 'Platform detected and registered',
  AI_RESPONSE_DETECTED: 'New AI response found',
  TOGGLE_SIDEBAR: 'Show/hide sidebar',
  UPDATE_SETTINGS: 'User changed settings'
}
```

### Data Storage

**localStorage** (Client-side):
```javascript
{
  'ai-ethics-api-key': 'user_api_key_here',
  'ai-ethics-reports': [
    {
      id: timestamp,
      type: 'gender_bias',
      description: 'User description',
      timestamp: ISO_string,
      url: 'platform_url',
      platform: 'ChatGPT'
    }
  ],
  'sidebarVisible': true/false
}
```

**chrome.storage.local** (Extension storage):
```javascript
{
  sidebarVisible: boolean,
  userPreferences: {...}
}
```

---

## 📁 File Structure

```
ai-ethics-monitor/
├── src/
│   ├── content/              # Content scripts
│   │   ├── content.ts        # Main content script
│   │   ├── ui/
│   │   │   └── UIManager.ts  # UI management
│   │   └── adapters/         # Platform adapters
│   │       ├── BasePlatformAdapter.ts
│   │       ├── ChatGPTAdapter.ts
│   │       ├── CopilotAdapter.ts
│   │       ├── GeminiAdapter.ts
│   │       ├── ClaudeAdapter.ts
│   │       └── PlatformAdapterFactory.ts
│   │
│   ├── background/           # Background service
│   │   └── background.ts
│   │
│   ├── popup/                # Popup UI
│   │   ├── popup.tsx         # React component
│   │   └── popup.html
│   │
│   ├── shared/               # Shared utilities
│   │   ├── biasDetection.ts  # Bias detection engine
│   │   ├── constants.ts      # Constants
│   │   └── utils.ts          # Utility functions
│   │
│   └── types/                # TypeScript types
│       └── index.ts
│
├── dist/                     # Built extension (output)
│   ├── content.js
│   ├── background.js
│   ├── popup.js
│   └── popup.html
│
├── icons/                    # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
│
├── manifest.json             # Extension manifest
├── webpack.config.js         # Build configuration
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies
└── README.md                # Documentation
```

---

## 🎯 Key Features

### 1. Platform Detection
- Automatic detection of AI platforms via URL matching
- Support for: ChatGPT, Copilot, Gemini, Claude
- Extensible adapter pattern for adding new platforms

### 2. Chain of Thought Analysis
- Extracts reasoning steps from AI responses
- Displays confidence levels
- Shows ethical considerations
- Interactive "Explain" modal with detailed breakdown

### 3. Bias Detection
- 6 different bias detection algorithms
- Real-time analysis
- Risk level assessment
- Actionable recommendations

### 4. User Interactions
- **Explain**: Shows detailed chain of thought modal
- **Challenge**: (Placeholder) Challenge ethical concerns
- **Suggest**: (Placeholder) Suggest alternative responses
- **Report**: Community bias reporting system

### 5. API Testing
- Custom API key storage
- Test your own AI APIs
- Bias analysis for custom responses

### 6. Community Reporting
- Local report storage
- Report statistics
- Recent reports display
- Bias type categorization

---

## 🔧 Build Process

### Development Build
```bash
npm run build
```

**What happens**:
1. TypeScript compilation (`tsc`)
2. Webpack bundling
3. Code minification (production mode)
4. Asset copying (icons, HTML)
5. Output to `dist/` folder

### Webpack Configuration
```javascript
{
  entry: {
    content: './src/content/content.ts',
    background: './src/background/background.ts',
    popup: './src/popup/popup.tsx'
  },
  output: {
    path: './dist',
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
}
```

---

## 🚀 Extension Loading

### Chrome Extension Installation
1. Build the extension: `npm run build`
2. Open Chrome: `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` folder
6. Extension is now active!

### Manifest V3 Configuration
```json
{
  "manifest_version": 3,
  "name": "AI Ethics Monitor",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": [
    "https://chatgpt.com/*",
    "https://copilot.microsoft.com/*",
    "https://gemini.google.com/*",
    "https://claude.ai/*"
  ],
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["dist/content.js"],
    "run_at": "document_end"
  }],
  "background": {
    "service_worker": "dist/background.js"
  }
}
```

---

## 🎨 UI/UX Design

### Design System
- **Color Palette**:
  - Primary: `#00d4ff` (Cyan)
  - Background: `#1a1a1a` (Dark)
  - Text: `#ffffff` (White)
  - Success: `#10b981` (Green)
  - Warning: `#ffc107` (Yellow)
  - Error: `#ef4444` (Red)

- **Typography**:
  - Font: Inter (Google Fonts)
  - Sizes: 10px - 24px
  - Weights: 400, 500, 600, 700

- **Spacing**:
  - Base unit: 4px
  - Common: 8px, 12px, 16px, 20px, 24px

### Responsive Design
- Sidebar width: 380px (desktop)
- Minimized width: 60px
- Modal max-width: 600px
- Mobile-friendly (future enhancement)

---

## 🔐 Security & Privacy

### Data Storage
- All data stored locally (localStorage)
- No external API calls (currently)
- API keys stored in plain text (⚠️ should be encrypted in production)

### Permissions
- `storage`: For saving user preferences
- `activeTab`: For accessing current tab
- `scripting`: For injecting content scripts
- `host_permissions`: Limited to specific AI platforms

### Privacy Considerations
- No data sent to external servers
- No user tracking
- No analytics
- All processing done client-side

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Sidebar appears on supported platforms
- [ ] Bias detection works correctly
- [ ] Explain modal displays properly
- [ ] API key can be saved
- [ ] Reports can be created
- [ ] Minimize/maximize works
- [ ] Close button works
- [ ] All buttons are functional

### Browser Console Debugging
Look for these log messages:
```
🧠 AI Ethics Monitor Extension Loaded!
✓ Platform detected: chatgpt
✓ UI Manager initialized
✓ Sidebar shown
📊 displayAnalysis called with data
```

---

## 🚧 Future Enhancements

### Planned Features
1. **Real API Integration**
   - Connect to actual AI APIs
   - Real-time bias analysis
   - API response caching

2. **Server-side Reporting**
   - Centralized report database
   - Community statistics
   - Trend analysis

3. **Enhanced Bias Detection**
   - Machine learning models
   - Context-aware analysis
   - Multi-language support

4. **Challenge & Suggest Features**
   - Interactive challenge dialogs
   - Alternative response generation
   - Ethical reasoning explanations

5. **Export & Sharing**
   - Export reports as PDF/JSON
   - Share findings with community
   - Integration with social platforms

6. **Settings & Customization**
   - Adjustable sensitivity levels
   - Custom bias categories
   - Theme customization

---

## 📚 Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.0.0",
  "webpack": "^5.88.0",
  "webpack-cli": "^5.1.0",
  "ts-loader": "^9.4.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/chrome": "^0.0.246"
}
```

---

## 🤝 Contributing

### Development Setup
```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Build extension
npm run build

# Watch mode (auto-rebuild)
npm run watch
```

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For issues, questions, or contributions:
- GitHub Issues: [Create an issue]
- Documentation: This file
- Email: [Your email]

---

**Last Updated**: October 24, 2025
**Version**: 1.0.0
**Author**: AI Ethics Monitor Team
