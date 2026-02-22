// Core data types for the AI Ethics Monitor extension

export type SupportedPlatform = 'chatgpt' | 'copilot' | 'gemini' | 'claude' | 'generic';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type BiasType = 
  | 'gender_bias' 
  | 'racial_bias' 
  | 'political_bias' 
  | 'confirmation_bias' 
  | 'emotional_manipulation' 
  | 'logical_fallacy'
  | 'evasiveness'
  | 'reward_hacking';

export type StepType = 'assumption' | 'inference' | 'conclusion' | 'ethical_check';

export type ChallengeType = 'explain' | 'challenge_ethics' | 'suggest_alternative';

export type ConsensusStatus = 'pending' | 'consensus_reached' | 'disputed' | 'expert_review';

// AI Response representation
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

// Chain of thought structures
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

// Bias and ethical analysis
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

// Sentence-wise bias analysis
export interface SentenceBiasAnalysis {
  sentenceNumber: number;
  text: string;
  biasTypes: BiasType[];
  patterns: BiasPattern[];
  severity: RiskLevel;
  hasBias: boolean;
}

// User feedback and community system
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

// Ethical challenge structures
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

// Extension messaging
export interface ExtensionMessage {
  type: string;
  payload: any;
  sender: 'background' | 'content' | 'popup';
  timestamp: Date;
}

// User preferences and settings
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

// Cross-Model Verification types
export interface CrossModelVerificationRequest {
  userQuestion: string;
  aiResponse: string;
  sourcePlatform: SupportedPlatform;
  responseMetadata?: ResponseMetadata;
}

export interface CrossModelVerificationResult {
  bias: BiasVerification;
  hallucinationRisk: number; // 0-1 scale
  manipulationRisk: number; // 0-1 scale
  reasoningQuality: number; // 0-1 scale
  trustScore: number; // 0-100 scale
  finalVerdict: 'safe' | 'questionable' | 'unsafe';
  recommendations: string[];
  verifiedBy: 'gemini-1.5-pro';
  timestamp: Date;
}

export interface BiasVerification {
  genderBias: { detected: boolean; severity: number; examples: string[] };
  racialBias: { detected: boolean; severity: number; examples: string[] };
  culturalBias: { detected: boolean; severity: number; examples: string[] };
  politicalBias: { detected: boolean; severity: number; examples: string[] };
  overallBiasScore: number; // 0-1 scale
}

// Cross-AI Verification & Optimization Engine types
export interface ModelResponse {
  answer: string;
  responseTime: number;
  model: string;
  error?: string;
}

export interface CrossAIVerificationRequest {
  question: string;
  originalAnswer: string;
  sourcePlatform: SupportedPlatform;
}

export interface CrossAIVerificationResult {
  finalAnswer: string;
  consistencyScore: number; // 0-100
  completenessScore: number; // 0-100
  biasRiskScore: number; // 0-100
  bestModel: string;
  modelNotes: Record<string, string>;
  comparativeAnalysis: {
    agreements: string[];
    contradictions: string[];
    uniqueInsights: string[];
    commonWeaknesses: string[];
  };
  recommendations: string[];
  modelResponses: Record<string, ModelResponse>;
  timestamp: Date;
}