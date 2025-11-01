/**
 * Microsoft Copilot-specific platform adapter
 */

import { AIResponse, ChainOfThought, ReasoningStep } from '../../types';
import { generateId } from '../../shared/utils';
import { BasePlatformAdapter } from './BasePlatformAdapter';

export class CopilotAdapter extends BasePlatformAdapter {
  
  /**
   * Detect Copilot AI responses using platform-specific selectors
   */
  protected detectAIResponse(): AIResponse | null {
    // Copilot-specific selectors (may need adjustment based on actual UI)
    const responseElements = document.querySelectorAll(
      '.copilot-response:not([data-processed="true"]), ' +
      '[data-role="assistant"]:not([data-processed="true"]), ' +
      '.assistant-message:not([data-processed="true"])'
    );
    
    if (responseElements.length === 0) {
      return null;
    }
    
    const latestResponse = responseElements[responseElements.length - 1] as HTMLElement;
    
    // Mark as processed
    latestResponse.dataset.processed = 'true';
    
    // Extract content from Copilot's structure
    const contentElement = latestResponse.querySelector('.message-content, .response-text, .copilot-text');
    const content = contentElement?.textContent || latestResponse.textContent || '';
    
    if (!content.trim()) {
      return null;
    }
    
    return {
      id: generateId(),
      content: content.trim(),
      timestamp: new Date(),
      platform: 'copilot',
      conversationContext: this.getCopilotContext(),
      metadata: {
        conversationId: this.getCopilotConversationId(),
        model: 'Copilot',
        responseTime: Date.now()
      }
    };
  }
  
  /**
   * Extract chain of thought specific to Copilot responses
   */
  public extractChainOfThought(response: AIResponse): ChainOfThought {
    const content = response.content;
    const steps: ReasoningStep[] = [];
    
    // Copilot often provides structured responses with clear reasoning
    // Look for step-by-step explanations or structured thinking
    
    // Check for numbered or bulleted lists
    const listItems = content.match(/(?:^|\n)(?:\d+\.|\*|\-)\s+([^\n]+)/g);
    if (listItems) {
      listItems.forEach((item: string, index: number) => {
        const cleanItem = item.replace(/^(?:\n)?(?:\d+\.|\*|\-)\s+/, '');
        steps.push({
          description: cleanItem,
          type: this.determineCopilotStepType(cleanItem, index, listItems.length),
          confidence: 0.75,
          sources: []
        });
      });
    }
    
    // Look for Copilot-specific reasoning patterns
    const reasoningPatterns = [
      { pattern: /let me (think|consider|analyze)\s+([^.]+\.)/gi, type: 'assumption' },
      { pattern: /based on\s+([^,]+),\s+([^.]+\.)/gi, type: 'inference' },
      { pattern: /this suggests\s+([^.]+\.)/gi, type: 'inference' },
      { pattern: /in conclusion\s+([^.]+\.)/gi, type: 'conclusion' }
    ];
    
    reasoningPatterns.forEach(({ pattern, type }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match: string) => {
          steps.push({
            description: match,
            type: type as 'assumption' | 'inference' | 'conclusion' | 'ethical_check',
            confidence: 0.8,
            sources: []
          });
        });
      }
    });
    
    // If no explicit reasoning found, use generic inference
    if (steps.length === 0) {
      return super.extractChainOfThought(response);
    }
    
    return {
      steps: steps.slice(0, 7), // Limit to 7 steps
      confidence: 0.75,
      inferredLogic: false,
      ethicalConsiderations: this.extractCopilotEthicalConsiderations(content)
    };
  }
  
  /**
   * Determine step type for Copilot reasoning
   */
  private determineCopilotStepType(step: string, index: number, total: number): 'assumption' | 'inference' | 'conclusion' | 'ethical_check' {
    const lowerStep = step.toLowerCase();
    
    if (lowerStep.includes('first') || lowerStep.includes('initially') || index === 0) {
      return 'assumption';
    }
    
    if (lowerStep.includes('finally') || lowerStep.includes('conclusion') || index === total - 1) {
      return 'conclusion';
    }
    
    if (lowerStep.includes('ethical') || lowerStep.includes('consider') || lowerStep.includes('important')) {
      return 'ethical_check';
    }
    
    return 'inference';
  }
  
  /**
   * Get Copilot-specific conversation context
   */
  protected getCopilotContext(): string[] {
    const messages = document.querySelectorAll('.message, .chat-message, .conversation-item');
    return Array.from(messages)
      .slice(-6) // Last 6 messages
      .map(msg => {
        const content = msg.textContent || '';
        const isUser = msg.classList.contains('user-message') || 
                      msg.querySelector('.user-avatar, .user-icon');
        const role = isUser ? 'user' : 'assistant';
        return `${role}: ${content.substring(0, 200)}...`;
      })
      .filter(text => text.trim().length > 10);
  }
  
  /**
   * Get Copilot conversation ID
   */
  protected getCopilotConversationId(): string | undefined {
    // Try to extract from URL or page data
    const urlMatch = window.location.pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Look for conversation ID in page data
    const conversationElement = document.querySelector('[data-conversation-id], [data-chat-id]');
    if (conversationElement) {
      return conversationElement.getAttribute('data-conversation-id') || 
             conversationElement.getAttribute('data-chat-id') || 
             undefined;
    }
    
    return undefined;
  }
  
  /**
   * Extract ethical considerations specific to Copilot responses
   */
  private extractCopilotEthicalConsiderations(content: string): string[] {
    const considerations = [];
    const lowerContent = content.toLowerCase();
    
    // Copilot-specific ethical patterns
    const patterns = [
      { pattern: /i should (mention|note|point out)/i, consideration: 'Proactive ethical disclosure' },
      { pattern: /(privacy|security|safety) (concern|consideration)/i, consideration: 'Privacy/security awareness' },
      { pattern: /it's worth (noting|mentioning|considering)/i, consideration: 'Additional ethical context' },
      { pattern: /(responsible|appropriate) (use|approach)/i, consideration: 'Responsible usage guidance' },
      { pattern: /please (be careful|use caution|consider)/i, consideration: 'Caution advisory provided' }
    ];
    
    patterns.forEach(({ pattern, consideration }) => {
      if (pattern.test(content)) {
        considerations.push(consideration);
      }
    });
    
    // Add generic ethical considerations
    considerations.push(...super.identifyEthicalConsiderations(content));
    
    return [...new Set(considerations)]; // Remove duplicates
  }
}