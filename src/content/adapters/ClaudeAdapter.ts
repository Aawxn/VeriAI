/**
 * Claude AI-specific platform adapter
 */

import { AIResponse, ChainOfThought, ReasoningStep } from '../../types';
import { generateId } from '../../shared/utils';
import { BasePlatformAdapter } from './BasePlatformAdapter';

export class ClaudeAdapter extends BasePlatformAdapter {
  
  /**
   * Detect Claude AI responses using platform-specific selectors
   */
  protected detectAIResponse(): AIResponse | null {
    // Claude-specific selectors
    const responseElements = document.querySelectorAll(
      '[data-is-streaming="false"]:not([data-processed="true"]), ' +
      '.font-claude-message:not([data-processed="true"])'
    );
    
    if (responseElements.length === 0) {
      return null;
    }
    
    const latestResponse = responseElements[responseElements.length - 1] as HTMLElement;
    
    // Mark as processed
    latestResponse.dataset.processed = 'true';
    
    // Extract content
    const content = latestResponse.textContent || '';
    
    if (!content.trim()) {
      return null;
    }
    
    return {
      id: generateId(),
      content: content.trim(),
      timestamp: new Date(),
      platform: 'claude',
      conversationContext: this.getClaudeContext(),
      metadata: {
        conversationId: this.getClaudeConversationId(),
        model: 'Claude',
        responseTime: Date.now()
      }
    };
  }
  
  /**
   * Extract chain of thought specific to Claude responses
   */
  public extractChainOfThought(response: AIResponse): ChainOfThought {
    const content = response.content;
    const steps: ReasoningStep[] = [];
    
    // Claude often provides structured, thoughtful responses
    // Look for thinking patterns
    
    // Check for numbered or structured lists
    const listItems = content.match(/(?:^|\n)(?:\d+\.|\*|\-)\s+([^\n]+)/g);
    if (listItems) {
      listItems.forEach((item: string, index: number) => {
        const cleanItem = item.replace(/^(?:\n)?(?:\d+\.|\*|\-)\s+/, '');
        steps.push({
          description: cleanItem,
          type: this.determineClaudeStepType(cleanItem, index, listItems.length),
          confidence: 0.8,
          sources: []
        });
      });
    }
    
    // Look for Claude-specific reasoning patterns
    const reasoningPatterns = [
      { pattern: /let me (think|consider|analyze|explain)\s+([^.]+\.)/gi, type: 'assumption' },
      { pattern: /based on\s+([^,]+),\s+([^.]+\.)/gi, type: 'inference' },
      { pattern: /this (suggests|indicates|means)\s+([^.]+\.)/gi, type: 'inference' },
      { pattern: /(therefore|thus|in conclusion)\s+([^.]+\.)/gi, type: 'conclusion' }
    ];
    
    reasoningPatterns.forEach(({ pattern, type }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match: string) => {
          steps.push({
            description: match,
            type: type as 'assumption' | 'inference' | 'conclusion' | 'ethical_check',
            confidence: 0.85,
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
      steps: steps.slice(0, 7),
      confidence: 0.8,
      inferredLogic: false,
      ethicalConsiderations: this.extractClaudeEthicalConsiderations(content)
    };
  }
  
  /**
   * Determine step type for Claude reasoning
   */
  private determineClaudeStepType(step: string, index: number, total: number): 'assumption' | 'inference' | 'conclusion' | 'ethical_check' {
    const lowerStep = step.toLowerCase();
    
    if (lowerStep.includes('first') || lowerStep.includes('initially') || index === 0) {
      return 'assumption';
    }
    
    if (lowerStep.includes('finally') || lowerStep.includes('conclusion') || index === total - 1) {
      return 'conclusion';
    }
    
    if (lowerStep.includes('ethical') || lowerStep.includes('important') || lowerStep.includes('consider')) {
      return 'ethical_check';
    }
    
    return 'inference';
  }
  
  /**
   * Get Claude-specific conversation context
   */
  protected getClaudeContext(): string[] {
    const messages = document.querySelectorAll('[data-is-streaming], .font-claude-message');
    return Array.from(messages)
      .slice(-6)
      .map(msg => {
        const content = msg.textContent || '';
        return content.substring(0, 200) + (content.length > 200 ? '...' : '');
      })
      .filter(text => text.trim().length > 10);
  }
  
  /**
   * Get Claude conversation ID
   */
  protected getClaudeConversationId(): string | undefined {
    // Try to extract from URL
    const urlMatch = window.location.pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    return undefined;
  }
  
  /**
   * Extract ethical considerations specific to Claude responses
   */
  private extractClaudeEthicalConsiderations(content: string): string[] {
    const considerations: string[] = [];
    const lowerContent = content.toLowerCase();
    
    // Claude-specific ethical patterns
    const patterns = [
      { pattern: /i (should|want to|need to) (mention|note|point out|clarify)/i, consideration: 'Proactive ethical disclosure' },
      { pattern: /(important|crucial|essential) to (note|consider|understand)/i, consideration: 'Important caveat highlighted' },
      { pattern: /(however|but|although).*(ethical|responsible|careful|appropriate)/i, consideration: 'Ethical qualification provided' },
      { pattern: /i (can't|cannot|won't|shouldn't)/i, consideration: 'Ethical boundary stated' },
      { pattern: /(potential|possible) (harm|risk|concern|issue)/i, consideration: 'Risk awareness demonstrated' }
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
