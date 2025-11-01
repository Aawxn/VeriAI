/**
 * Microsoft Copilot-specific platform adapter
 */
import { AIResponse, ChainOfThought } from '../../types';
import { BasePlatformAdapter } from './BasePlatformAdapter';
export declare class CopilotAdapter extends BasePlatformAdapter {
    /**
     * Detect Copilot AI responses using platform-specific selectors
     */
    protected detectAIResponse(): AIResponse | null;
    /**
     * Extract chain of thought specific to Copilot responses
     */
    extractChainOfThought(response: AIResponse): ChainOfThought;
    /**
     * Determine step type for Copilot reasoning
     */
    private determineCopilotStepType;
    /**
     * Get Copilot-specific conversation context
     */
    protected getCopilotContext(): string[];
    /**
     * Get Copilot conversation ID
     */
    protected getCopilotConversationId(): string | undefined;
    /**
     * Extract ethical considerations specific to Copilot responses
     */
    private extractCopilotEthicalConsiderations;
}
//# sourceMappingURL=CopilotAdapter.d.ts.map