/**
 * Google Gemini-specific platform adapter
 */
import { AIResponse, ChainOfThought } from '../../types';
import { BasePlatformAdapter } from './BasePlatformAdapter';
export declare class GeminiAdapter extends BasePlatformAdapter {
    /**
     * Detect Gemini AI responses using platform-specific selectors
     */
    protected detectAIResponse(): AIResponse | null;
    /**
     * Extract chain of thought specific to Gemini responses
     */
    extractChainOfThought(response: AIResponse): ChainOfThought;
    /**
     * Get Gemini-specific conversation context
     */
    protected getGeminiContext(): string[];
    /**
     * Get Gemini conversation ID
     */
    protected getGeminiConversationId(): string | undefined;
    /**
     * Detect Gemini model being used
     */
    private detectGeminiModel;
    /**
     * Extract ethical considerations specific to Gemini responses
     */
    private extractGeminiEthicalConsiderations;
}
//# sourceMappingURL=GeminiAdapter.d.ts.map