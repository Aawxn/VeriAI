/**
 * Google Gemini-specific platform adapter
 */

import { AIResponse, ChainOfThought, ReasoningStep } from '../../types';
import { generateId } from '../../shared/utils';
import { BasePlatformAdapter } from './BasePlatformAdapter';

export class GeminiAdapter extends BasePlatformAdapter {
  
  /**
   * Wrapper method for detecting new AI responses
   */
  public detectNewResponse(): AIResponse | null {
    return this.detectAIResponse();
  }
  
  /**
   * Detect Gemini AI responses using platform-specific selectors
   */
  protected detectAIResponse(): AIResponse | null {
    // Gemini-specific selectors (may need adjustment based on actual UI)
    const responseElements = document.querySelectorAll(
      '[data-role="model"]:not([data-processed="true"]), ' +
      '.model-response:not([data-processed="true"]), ' +
      '.gemini-response:not([data-processed="true"]), ' +
      '[class*="assistant"]:not([data-processed="true"])'
    );
    
    if (responseElements.length === 0) {
      return null;
    }
    
    const latestResponse = responseElements[responseElements.length - 1] as HTMLElement;
    
    // Mark as processed
    latestResponse.dataset.processed = 'true';
    
    // Extract content from Gemini's structure
    const contentElement = latestResponse.querySelector('.response-content, .message-text, .gemini-text');
    const content = contentElement?.textContent || latestResponse.textContent || '';
    
    if (!content.trim()) {
      return null;
    }
    
    return {
      id: generateId(),
      content: content.trim(),
      timestamp: new Date(),
      platform: 'gemini',
      conversationContext: this.getGeminiContext(),
      metadata: {
        conversationId: this.getGeminiConversationId(),
        model: this.detectGeminiModel(),
        responseTime: Date.now()
      }
    };
  }
  
  /**
   * Extract chain of thought specific to Gemini responses
   */
  public extractChainOfThought(response: AIResponse): ChainOfThought {
    const content = response.content;
    const steps: ReasoningStep[] = [];
    
    // Gemini often provides detailed, structured responses
    // Look for paragraph-based reasoning or structured explanations
    
    // Split into paragraphs and analyze each
    const paragraphs = content.split(/\n\s*\n/).filter((p: string) => p.trim().length > 20);
    
    paragraphs.forEach((paragraph: string, index: number) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return;
      
      // Determine step type based on content and position
      let stepType: 'assumption' | 'inference' | 'conclusion' | 'ethical_check' = 'inference';
      
      if (index === 0 && (trimmed.toLowerCase().includes('let me') || trimmed.toLowerCase().includes('first'))) {
        stepType = 'assumption';
      } else if (index === paragraphs.length - 1 && 
                (trimmed.toLowerCase().includes('therefore') || 
                 trimmed.toLowerCase().includes('in conclusion') ||
                 trimmed.toLowerCase().includes('overall'))) {
        stepType = 'conclusion';
      } else if (trimmed.toLowerCase().includes('ethical') || 
                trimmed.toLowerCase().includes('important to note') ||
                trimmed.toLowerCase().includes('consider')) {
        stepType = 'ethical_check';
      }
      
      steps.push({
        description: trimmed.substring(0, 200) + (trimmed.length > 200 ? '...' : ''),
        type: stepType,
        confidence: 0.7,
        sources: []
      });
    });
    
    // Look for Gemini-specific reasoning patterns
    const reasoningPatterns = [
      { pattern: /here's my (thinking|analysis|approach):\s*([^.]+\.)/gi, type: 'assumption' },
      { pattern: /this (leads to|suggests|indicates)\s+([^.]+\.)/gi, type: 'inference' },
      { pattern: /the key (point|insight|factor) is\s+([^.]+\.)/gi, type: 'inference' },
      { pattern: /ultimately\s+([^.]+\.)/gi, type: 'conclusion' }
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
      steps: steps.slice(0, 6), // Limit to 6 steps
      confidence: 0.7,
      inferredLogic: paragraphs.length <= 1, // If single paragraph, likely inferred
      ethicalConsiderations: this.extractGeminiEthicalConsiderations(content)
    };
  }
  
  /**
   * Get Gemini-specific conversation context
   */
  protected getGeminiContext(): string[] {
    const messages = document.querySelectorAll('[data-role], .message, .conversation-turn');
    return Array.from(messages)
      .slice(-6) // Last 6 messages
      .map(msg => {
        const role = msg.getAttribute('data-role') || 
                    (msg.classList.contains('user-message') ? 'user' : 'model');
        const content = msg.textContent || '';
        return `${role}: ${content.substring(0, 200)}...`;
      })
      .filter(text => text.trim().length > 10);
  }
  
  /**
   * Get Gemini conversation ID
   */
  protected getGeminiConversationId(): string | undefined {
    // Try to extract from URL
    const urlMatch = window.location.pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Look for conversation ID in page data
    const conversationElement = document.querySelector('[data-conversation-id], [data-session-id]');
    if (conversationElement) {
      return conversationElement.getAttribute('data-conversation-id') || 
             conversationElement.getAttribute('data-session-id') || 
             undefined;
    }
    
    return undefined;
  }
  
  /**
   * Detect Gemini model being used
   */
  private detectGeminiModel(): string | undefined {
    // Look for model indicators in the UI
    const modelElement = document.querySelector('[class*="gemini"], [data-model*="gemini"]');
    if (modelElement) {
      return modelElement.textContent || modelElement.getAttribute('data-model') || undefined;
    }
    
    // Check for specific Gemini model indicators
    if (document.querySelector('[class*="pro"], [class*="ultra"]')) {
      return 'Gemini Pro';
    }
    
    return 'Gemini'; // Default
  }
  
  /**
   * Extract ethical considerations specific to Gemini responses
   */
  private extractGeminiEthicalConsiderations(content: string): string[] {
    const considerations = [];
    const lowerContent = content.toLowerCase();
    
    // Gemini-specific ethical patterns
    const patterns = [
      { pattern: /it's important to (note|remember|consider)/i, consideration: 'Important caveat highlighted' },
      { pattern: /(however|but|although).*(ethical|responsible|careful)/i, consideration: 'Ethical qualification provided' },
      { pattern: /please (note|be aware|keep in mind)/i, consideration: 'User awareness guidance' },
      { pattern: /(potential|possible) (risks|concerns|issues)/i, consideration: 'Risk awareness demonstrated' },
      { pattern: /i (should|must) (mention|note|emphasize)/i, consideration: 'Proactive ethical disclosure' }
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