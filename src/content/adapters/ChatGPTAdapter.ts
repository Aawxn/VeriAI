/**
 * ChatGPT-specific platform adapter
 */

import { AIResponse, ChainOfThought, ReasoningStep } from '../../types';
import { generateId } from '../../shared/utils';
import { BasePlatformAdapter } from './BasePlatformAdapter';

export class ChatGPTAdapter extends BasePlatformAdapter {
  
  /**
   * Detect ChatGPT AI responses using platform-specific selectors
   */
  protected detectAIResponse(): AIResponse | null {
    console.log('🔍 ChatGPT: Checking for AI responses...');
    
    // Try multiple selectors for ChatGPT's evolving DOM structure
    const selectors = [
      '[data-message-author-role="assistant"]',
      '[data-testid*="conversation-turn"]',
      '.agent-turn',
      '[class*="agent"]',
      '.group\\/conversation-turn'
    ];
    
    let responseElements: NodeListOf<Element> | null = null;
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✓ Found ${elements.length} elements with selector: ${selector}`);
        responseElements = elements;
        break;
      }
    }
    
    if (!responseElements || responseElements.length === 0) {
      console.log('✗ No response elements found');
      return null;
    }
    
    // Get the last response that hasn't been processed
    let latestResponse: HTMLElement | null = null;
    
    for (let i = responseElements.length - 1; i >= 0; i--) {
      const element = responseElements[i] as HTMLElement;
      if (element.dataset.processed !== 'true') {
        latestResponse = element;
        break;
      }
    }
    
    if (!latestResponse) {
      console.log('✗ All responses already processed');
      return null;
    }
    
    // Mark as processed
    latestResponse.dataset.processed = 'true';
    
    // Extract content from ChatGPT's structure - try multiple content selectors
    const contentSelectors = [
      '.markdown',
      '.message-content',
      '[class*="prose"]',
      '[data-message-author-role="assistant"]',
      '.whitespace-pre-wrap'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const contentElement = latestResponse.querySelector(selector);
      if (contentElement && contentElement.textContent) {
        content = contentElement.textContent;
        console.log(`✓ Content extracted using selector: ${selector}`);
        break;
      }
    }
    
    // Fallback to direct text content
    if (!content) {
      content = latestResponse.textContent || '';
      console.log('✓ Content extracted from direct textContent');
    }
    
    if (!content.trim()) {
      console.log('✗ Content is empty');
      return null;
    }
    
    console.log(`✅ ChatGPT response detected! Length: ${content.length} characters`);
    
    return {
      id: generateId(),
      content: content.trim(),
      timestamp: new Date(),
      platform: 'chatgpt',
      conversationContext: this.getChatGPTContext(),
      metadata: {
        conversationId: this.getChatGPTConversationId(),
        model: this.detectChatGPTModel(),
        responseTime: Date.now()
      }
    };
  }
  
  /**
   * Extract chain of thought specific to ChatGPT responses
   */
  public extractChainOfThought(response: AIResponse): ChainOfThought {
    const content = response.content;
    const steps: ReasoningStep[] = [];
    
    // ChatGPT often structures responses with clear reasoning
    // Look for numbered lists, bullet points, or step-by-step explanations
    const numberedSteps = content.match(/\d+\.\s+([^.]+\.)/g);
    if (numberedSteps) {
      numberedSteps.forEach((step: string, index: number) => {
        steps.push({
          description: step.replace(/^\d+\.\s+/, ''),
          type: index === numberedSteps.length - 1 ? 'conclusion' : 'inference',
          confidence: 0.8,
          sources: []
        });
      });
    }
    
    // Look for "because", "therefore", "since" patterns
    const reasoningPatterns = [
      { pattern: /because\s+([^.]+\.)/gi, type: 'assumption' },
      { pattern: /therefore\s+([^.]+\.)/gi, type: 'conclusion' },
      { pattern: /since\s+([^.]+\.)/gi, type: 'assumption' },
      { pattern: /this means\s+([^.]+\.)/gi, type: 'inference' }
    ];
    
    reasoningPatterns.forEach(({ pattern, type }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match: string) => {
          steps.push({
            description: match,
            type: type as 'assumption' | 'inference' | 'conclusion' | 'ethical_check',
            confidence: 0.7,
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
      steps: steps.slice(0, 8), // Limit to 8 steps
      confidence: 0.8,
      inferredLogic: false, // ChatGPT often provides explicit reasoning
      ethicalConsiderations: this.extractChatGPTEthicalConsiderations(content)
    };
  }
  
  /**
   * Get ChatGPT-specific conversation context
   */
  protected getChatGPTContext(): string[] {
    const messages = document.querySelectorAll('[data-message-author-role]');
    return Array.from(messages)
      .slice(-6) // Last 6 messages (3 exchanges)
      .map(msg => {
        const role = msg.getAttribute('data-message-author-role');
        const content = msg.textContent || '';
        return `${role}: ${content.substring(0, 200)}...`;
      })
      .filter(text => text.trim().length > 10);
  }
  
  /**
   * Get ChatGPT conversation ID from URL
   */
  protected getChatGPTConversationId(): string | undefined {
    const urlMatch = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    return urlMatch ? urlMatch[1] : undefined;
  }
  
  /**
   * Detect ChatGPT model being used
   */
  private detectChatGPTModel(): string | undefined {
    // Look for model indicators in the UI
    const modelElement = document.querySelector('[class*="model"], [data-model]');
    if (modelElement) {
      return modelElement.textContent || modelElement.getAttribute('data-model') || undefined;
    }
    
    // Check for GPT-4 indicators
    if (document.querySelector('[class*="gpt-4"], [class*="GPT-4"]')) {
      return 'GPT-4';
    }
    
    return 'GPT-3.5'; // Default assumption
  }
  
  /**
   * Extract ethical considerations specific to ChatGPT responses
   */
  private extractChatGPTEthicalConsiderations(content: string): string[] {
    const considerations = [];
    const lowerContent = content.toLowerCase();
    
    // ChatGPT-specific ethical patterns
    const patterns = [
      { pattern: /i (can't|cannot|won't|will not)/i, consideration: 'Refusal or limitation stated' },
      { pattern: /it's important to (note|consider|remember)/i, consideration: 'Ethical caveat provided' },
      { pattern: /(however|but|although).*(ethical|moral|responsible)/i, consideration: 'Ethical qualification given' },
      { pattern: /please (note|be aware|consider)/i, consideration: 'User guidance provided' },
      { pattern: /(bias|prejudice|discrimination)/i, consideration: 'Bias awareness demonstrated' }
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