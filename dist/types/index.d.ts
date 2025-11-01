export type SupportedPlatform = 'chatgpt' | 'copilot' | 'gemini' | 'claude' | 'generic';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type BiasType = 'gender_bias' | 'racial_bias' | 'political_bias' | 'confirmation_bias' | 'emotional_manipulation' | 'logical_fallacy' | 'evasiveness' | 'reward_hacking';
export type StepType = 'assumption' | 'inference' | 'conclusion' | 'ethical_check';
export type ChallengeType = 'explain' | 'challenge_ethics' | 'suggest_alternative';
export type ConsensusStatus = 'pending' | 'consensus_reached' | 'disputed' | 'expert_review';
export interface AIResponse {
    id: string;
    content: string;
    timestamp: Date;
    platform: SupportedPlatform;
    conversationContext: string[];
    metadata: ResponseMetadata;
}
export interface ResponseMetadata {
    userPrompt?: string;
    responseTime?: number;
    model?: string;
    conversationId?: string;
}
export interface ChainOfThought {
    steps: ReasoningStep[];
    confidence: number;
    inferredLogic: boolean;
    ethicalConsiderations: string[];
}
export interface ReasoningStep {
    description: string;
    type: StepType;
    confidence: number;
    sources?: string[];
}
export interface BiasAnalysis {
    overallRisk: RiskLevel;
    detectedPatterns: BiasPattern[];
    recommendations: string[];
    flaggedContent: ContentFlag[];
}
export interface BiasPattern {
    type: BiasType;
    confidence: number;
    textSpan: TextSpan;
    explanation: string;
}
export interface TextSpan {
    start: number;
    end: number;
    text: string;
}
export interface ContentFlag {
    type: BiasType;
    severity: RiskLevel;
    description: string;
    textSpan: TextSpan;
}
export interface UserFeedback {
    responseId: string;
    challengeType: ChallengeType;
    userCorrection?: string;
    ethicalConcerns: string[];
    timestamp: Date;
    platformContext: PlatformContext;
}
export interface PlatformContext {
    platform: SupportedPlatform;
    url: string;
    conversationId?: string;
    userAgent: string;
}
export interface CommunityConsensus {
    feedbackId: string;
    upvotes: number;
    downvotes: number;
    expertReviews: ExpertReview[];
    consensusScore: number;
    status: ConsensusStatus;
}
export interface ExpertReview {
    reviewerId: string;
    rating: number;
    comments: string;
    timestamp: Date;
}
export interface EthicalChallenge {
    responseId: string;
    challengeType: ChallengeType;
    userInput: string;
    timestamp: Date;
    context: string;
}
export interface ChainOfThoughtResponse {
    reasoning: string;
    confidence: number;
    ethicalConsiderations: string[];
    sources?: string[];
}
export interface ExtensionMessage {
    type: string;
    payload: any;
    sender: 'background' | 'content' | 'popup';
    timestamp: Date;
}
export interface UserPreferences {
    privacySettings: PrivacySettings;
    displaySettings: DisplaySettings;
    analysisSettings: AnalysisSettings;
}
export interface PrivacySettings {
    enableCommunityFeatures: boolean;
    shareAnalysisData: boolean;
    enableTelemetry: boolean;
    dataRetentionDays: number;
}
export interface DisplaySettings {
    showChainOfThought: boolean;
    showBiasFlags: boolean;
    sidebarPosition: 'left' | 'right';
    compactMode: boolean;
}
export interface AnalysisSettings {
    biasDetectionSensitivity: 'low' | 'medium' | 'high';
    enabledBiasTypes: BiasType[];
    autoFlagThreshold: RiskLevel;
}
//# sourceMappingURL=index.d.ts.map