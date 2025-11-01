/**
 * ChatGPT-specific platform adapter
 */
import { AIResponse, ChainOfThought } from '../../types';
import { BasePlatformAdapter } from './BasePlatformAdapter';
export declare class ChatGPTAdapter extends BasePlatformAdapter {
    /**
     * Detect ChatGPT AI responses using platform-specific selectors
     */
    protected detectAIResponse(): AIResponse | null;
    /**
     * Extract chain of thought specific to ChatGPT responses
     */
    extractChainOfThought(response: AIResponse): ChainOfThought;
    /**
     * Get ChatGPT-specific conversation context
     */
    protected getChatGPTContext(): string[];
    /**
     * Get ChatGPT conversation ID from URL
     */
    protected getChatGPTConversationId(): string | undefined;
    /**
     * Detect ChatGPT model being used
     */
    private detectChatGPTModel;
    /**
     * Extract ethical considerations specific to ChatGPT responses
     */
    private extractChatGPTEthicalConsiderations;
}
//# sourceMappingURL=ChatGPTAdapter.d.ts.map