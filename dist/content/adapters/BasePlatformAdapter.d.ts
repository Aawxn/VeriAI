/**
 * Base platform adapter with common functionality
 */
import { AIResponse, ChainOfThought, EthicalChallenge, ReasoningStep } from '../../types';
export declare class BasePlatformAdapter {
    protected observer: MutationObserver | null;
    protected responseCallback: ((response: AIResponse) => void) | null;
    /**
     * Start monitoring for AI responses on the platform
     */
    startMonitoring(callback: (response: AIResponse) => void): void;
    /**
     * Stop monitoring and cleanup resources
     */
    stopMonitoring(): void;
    /**
     * Detect AI response in the DOM - to be overridden by platform-specific adapters
     */
    protected detectAIResponse(): AIResponse | null;
    /**
     * Extract chain of thought from AI response
     */
    extractChainOfThought(response: AIResponse): ChainOfThought;
    /**
     * Send ethical challenge to the platform
     */
    sendChallenge(challenge: EthicalChallenge): Promise<void>;
    /**
     * Get conversation context from the page
     */
    protected getConversationContext(): string[];
    /**
     * Get conversation ID if available
     */
    protected getConversationId(): string | undefined;
    /**
     * Setup DOM observer for response detection
     */
    protected setupDOMObserver(): void;
    /**
     * Infer reasoning steps from response content
     */
    protected inferReasoningSteps(content: string): ReasoningStep[];
    /**
     * Identify ethical considerations in the response
     */
    protected identifyEthicalConsiderations(content: string): string[];
}
//# sourceMappingURL=BasePlatformAdapter.d.ts.map