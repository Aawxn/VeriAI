/**
 * Base platform adapter with common functionality
 */

import { AIResponse, ChainOfThought, EthicalChallenge, ReasoningStep } from '../../types';
import { generateId, debounce, waitForElement } from '../../shared/utils';

export class BasePlatformAdapter {
  protected observer: MutationObserver | null = null;
  protected responseCallback: ((response: AIResponse) => void) | null = null;
  
  /**
   * Detect new AI responses (default implementation)
   */
  public detectNewResponse(): AIResponse | null {
    return this.detectAIResponse();
  }
  
  /**
   * Force detect latest response (re-analyze current response)
   */
  public forceDetectLatest(): AIResponse | null {
    return null;
  }
  
  /**
   * Start monitoring for AI responses on the platform
   */
  public startMonitoring(callback: (response: AIResponse) => void): void {
    this.responseCallback = callback;
    this.setupDOMObserver();
  }
  
  /**
   * Stop monitoring and cleanup resources
   */
  public stopMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.responseCallback = null;
  }
  
  /**
   * Detect AI response in the DOM - to be overridden by platform-specific adapters
   */
  protected detectAIResponse(): AIResponse | null {
    // Generic implementation - look for common patterns
    const responseElements = document.querySelectorAll(
      '[data-message-author-role="assistant"], .assistant-message, .ai-response'
    );
    
    const latestResponse = responseElements[responseElements.length - 1] as HTMLElement;
    if (!latestResponse || latestResponse.dataset.processed === 'true') {
      return null;
    }
    
    // Mark as processed to avoid duplicate processing
    latestResponse.dataset.processed = 'true';
    
    return {
      id: generateId(),
      content: latestResponse.textContent || '',
      timestamp: new Date(),
      platform: 'generic',
      conversationContext: this.getConversationContext(),
      metadata: {
        conversationId: this.getConversationId(),
        responseTime: Date.now()
      }
    };
  }
  
  /**
   * Extract chain of thought from AI response
   */
  public extractChainOfThought(response: AIResponse): ChainOfThought {
    // Generic implementation - basic inference
    const steps = this.inferReasoningSteps(response.content);
    
    return {
      steps,
      confidence: 0.3, // Low confidence for generic inference
      inferredLogic: true,
      ethicalConsiderations: this.identifyEthicalConsiderations(response.content)
    };
  }
  
  /**
   * Send ethical challenge to the platform
   */
  public async sendChallenge(challenge: EthicalChallenge): Promise<void> {
    // Generic implementation - no direct API integration
    console.log('Challenge submitted (generic):', challenge);
    
    // Store challenge for community review
    // This will be handled by the background service
  }
  
  /**
   * Get conversation context from the page
   */
  protected getConversationContext(): string[] {
    const messages = document.querySelectorAll('[data-message], .message, .chat-message');
    return Array.from(messages)
      .slice(-5) // Last 5 messages for context
      .map(msg => msg.textContent || '')
      .filter(text => text.trim().length > 0);
  }
  
  /**
   * Get conversation ID if available
   */
  protected getConversationId(): string | undefined {
    // Try to extract from URL or page data
    const urlMatch = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Look for conversation ID in page data
    const conversationElement = document.querySelector('[data-conversation-id]');
    if (conversationElement) {
      return conversationElement.getAttribute('data-conversation-id') || undefined;
    }
    
    return undefined;
  }
  
  /**
   * Setup DOM observer for response detection
   */
  protected setupDOMObserver(): void {
    console.log('🔭 Setting up DOM observer for response detection...');
    
    const debouncedCheck = debounce(() => {
      console.log('⏰ Debounced check triggered');
      const response = this.detectAIResponse();
      if (response && this.responseCallback) {
        console.log('📤 Calling response callback with detected response');
        this.responseCallback(response);
      }
    }, 500);
    
    this.observer = new MutationObserver((mutations) => {
      console.log(`🔄 DOM mutation detected (${mutations.length} mutations)`);
      debouncedCheck();
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log('✅ DOM observer setup complete');
    
    // Also do an immediate check
    setTimeout(() => {
      console.log('🔍 Performing initial response check...');
      const response = this.detectAIResponse();
      if (response && this.responseCallback) {
        console.log('📤 Initial check found response, calling callback');
        this.responseCallback(response);
      }
    }, 1000);
  }
  
  /**
   * Infer reasoning steps from response content
   */
  protected inferReasoningSteps(content: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    
    // Look for common reasoning patterns
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (!trimmed) return;
      
      let stepType: 'assumption' | 'inference' | 'conclusion' | 'ethical_check' = 'inference';
      
      // Identify step types based on content
      if (trimmed.toLowerCase().includes('because') || trimmed.toLowerCase().includes('since')) {
        stepType = 'assumption';
      } else if (trimmed.toLowerCase().includes('therefore') || trimmed.toLowerCase().includes('thus')) {
        stepType = 'conclusion';
      } else if (trimmed.toLowerCase().includes('ethical') || trimmed.toLowerCase().includes('moral')) {
        stepType = 'ethical_check';
      }
      
      steps.push({
        description: trimmed,
        type: stepType,
        confidence: 0.4 + (Math.random() * 0.3), // Random confidence for generic inference
        sources: []
      });
    });
    
    return steps.slice(0, 5); // Limit to 5 steps
  }
  
  /**
   * Identify ethical considerations in the response
   */
  protected identifyEthicalConsiderations(content: string): string[] {
    const considerations: string[] = [];
    const lowerContent = content.toLowerCase();
    
    // Look for ethical keywords and patterns
    const ethicalKeywords = [
      'ethical', 'moral', 'right', 'wrong', 'should', 'ought',
      'responsibility', 'harm', 'benefit', 'fair', 'just'
    ];
    
    ethicalKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        considerations.push(`Contains ethical consideration: ${keyword}`);
      }
    });
    
    return considerations;
  }
}