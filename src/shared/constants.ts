// Shared constants across the extension

export const EXTENSION_NAME = 'AI Ethics Monitor';
export const EXTENSION_VERSION = '1.0.0';

// Platform identifiers
export const PLATFORMS = {
  CHATGPT: 'chatgpt',
  COPILOT: 'copilot', 
  GEMINI: 'gemini',
  CLAUDE: 'claude',
  GENERIC: 'generic'
} as const;

// Platform URLs for detection
export const PLATFORM_URLS = {
  [PLATFORMS.CHATGPT]: ['chatgpt.com', 'chat.openai.com'],
  [PLATFORMS.COPILOT]: ['copilot.microsoft.com'],
  [PLATFORMS.GEMINI]: ['gemini.google.com', 'bard.google.com'],
  [PLATFORMS.CLAUDE]: ['claude.ai']
} as const;

// Message types for extension communication
export const MESSAGE_TYPES = {
  // Background service messages
  REGISTER_PLATFORM: 'register_platform',
  STORE_FEEDBACK: 'store_feedback',
  FETCH_CHAIN_OF_THOUGHT: 'fetch_chain_of_thought',
  
  // Content script messages
  AI_RESPONSE_DETECTED: 'ai_response_detected',
  BIAS_ANALYSIS_COMPLETE: 'bias_analysis_complete',
  USER_CHALLENGE_SUBMITTED: 'user_challenge_submitted',
  
  // Popup messages
  GET_EXTENSION_STATE: 'get_extension_state',
  UPDATE_PREFERENCES: 'update_preferences',
  TOGGLE_PLATFORM: 'toggle_platform',
  GET_PLATFORM_STATUS: 'get_platform_status',
  TOGGLE_SIDEBAR: 'toggle_sidebar',
  
  // Analysis messages
  EVALUATE_RESPONSE: 'evaluate_response',
  CROSS_MODEL_VERIFY: 'cross_model_verify',
  CROSS_AI_OPTIMIZE: 'cross_ai_optimize'
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  CACHED_ANALYSIS: 'cached_analysis',
  OFFLINE_FEEDBACK: 'offline_feedback',
  PLATFORM_STATE: 'platform_state'
} as const;

// UI constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: '350px',
  SIDEBAR_MIN_WIDTH: '280px',
  ANIMATION_DURATION: '0.3s',
  Z_INDEX_BASE: 999999,
  CHALLENGE_CHAR_MIN: 50,
  CHALLENGE_CHAR_MAX: 500
} as const;

// Analysis thresholds
export const ANALYSIS_THRESHOLDS = {
  BIAS_CONFIDENCE_MIN: 0.6,
  CHAIN_OF_THOUGHT_CONFIDENCE_MIN: 0.5,
  ANALYSIS_TIMEOUT_MS: 1000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000
} as const;

// Bias detection patterns
export const BIAS_PATTERNS = {
  GENDER_KEYWORDS: ['he/she', 'his/her', 'man/woman', 'male/female'],
  POLITICAL_KEYWORDS: ['liberal', 'conservative', 'left-wing', 'right-wing'],
  EMOTIONAL_MANIPULATION: ['you should feel', 'everyone knows', 'obviously'],
  EVASIVE_LANGUAGE: ['it depends', 'perhaps', 'might be', 'could be']
} as const;