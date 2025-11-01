export declare const EXTENSION_NAME = "AI Ethics Monitor";
export declare const EXTENSION_VERSION = "1.0.0";
export declare const PLATFORMS: {
    readonly CHATGPT: "chatgpt";
    readonly COPILOT: "copilot";
    readonly GEMINI: "gemini";
    readonly CLAUDE: "claude";
    readonly GENERIC: "generic";
};
export declare const PLATFORM_URLS: {
    readonly chatgpt: readonly ["chatgpt.com", "chat.openai.com"];
    readonly copilot: readonly ["copilot.microsoft.com"];
    readonly gemini: readonly ["gemini.google.com", "bard.google.com"];
    readonly claude: readonly ["claude.ai"];
};
export declare const MESSAGE_TYPES: {
    readonly REGISTER_PLATFORM: "register_platform";
    readonly STORE_FEEDBACK: "store_feedback";
    readonly FETCH_CHAIN_OF_THOUGHT: "fetch_chain_of_thought";
    readonly AI_RESPONSE_DETECTED: "ai_response_detected";
    readonly BIAS_ANALYSIS_COMPLETE: "bias_analysis_complete";
    readonly USER_CHALLENGE_SUBMITTED: "user_challenge_submitted";
    readonly GET_EXTENSION_STATE: "get_extension_state";
    readonly UPDATE_PREFERENCES: "update_preferences";
    readonly TOGGLE_PLATFORM: "toggle_platform";
};
export declare const STORAGE_KEYS: {
    readonly USER_PREFERENCES: "user_preferences";
    readonly CACHED_ANALYSIS: "cached_analysis";
    readonly OFFLINE_FEEDBACK: "offline_feedback";
    readonly PLATFORM_STATE: "platform_state";
};
export declare const UI_CONSTANTS: {
    readonly SIDEBAR_WIDTH: "350px";
    readonly SIDEBAR_MIN_WIDTH: "280px";
    readonly ANIMATION_DURATION: "0.3s";
    readonly Z_INDEX_BASE: 10000;
    readonly CHALLENGE_CHAR_MIN: 50;
    readonly CHALLENGE_CHAR_MAX: 500;
};
export declare const ANALYSIS_THRESHOLDS: {
    readonly BIAS_CONFIDENCE_MIN: 0.6;
    readonly CHAIN_OF_THOUGHT_CONFIDENCE_MIN: 0.5;
    readonly ANALYSIS_TIMEOUT_MS: 1000;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY_MS: 1000;
};
export declare const BIAS_PATTERNS: {
    readonly GENDER_KEYWORDS: readonly ["he/she", "his/her", "man/woman", "male/female"];
    readonly POLITICAL_KEYWORDS: readonly ["liberal", "conservative", "left-wing", "right-wing"];
    readonly EMOTIONAL_MANIPULATION: readonly ["you should feel", "everyone knows", "obviously"];
    readonly EVASIVE_LANGUAGE: readonly ["it depends", "perhaps", "might be", "could be"];
};
//# sourceMappingURL=constants.d.ts.map