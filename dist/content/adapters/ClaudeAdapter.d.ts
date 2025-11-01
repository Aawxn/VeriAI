/**
 * Claude AI-specific platform adapter
 */
import { AIResponse, ChainOfThought } from '../../types';
import { BasePlatformAdapter } from './BasePlatformAdapter';
export declare class ClaudeAdapter extends BasePlatformAdapter {
    /**
     * Detect Claude AI responses using platform-specific selectors
     */
    protected detectAIResponse(): AIResponse | null;
    /**
     * Extract chain of thought specific to Claude responses
     */
    extractChainOfThought(response: AIResponse): ChainOfThought;
    /**
     * Determine step type for Claude reasoning
     */
    private determineClaudeStepType;
    /**
     * Get Claude-specific conversation context
     */
    protected getClaudeContext(): string[];
    /**
     * Get Claude conversation ID
     */
    protected getClaudeConversationId(): string | undefined;
    /**
     * Extract ethical considerations specific to Claude responses
     */
    private extractClaudeEthicalConsiderations;
}
//# sourceMappingURL=ClaudeAdapter.d.ts.map