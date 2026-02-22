/**
 * ChatGPT-specific platform adapter
 */

import { AIResponse, ChainOfThought, ReasoningStep } from '../../types';
import { generateId } from '../../shared/utils';
import { BasePlatformAdapter } from './BasePlatformAdapter';

export class ChatGPTAdapter extends BasePlatformAdapter {
  private processedMessageIds: Set<string> = new Set();
  private lastCheckTime: number = 0;
  private checkThrottleMs: number = 3000; // Only check every 3 seconds if no new content
  private lastProcessedCount: number = 0;
  
  /**
   * Wrapper method for detecting new AI responses
   */
  public detectNewResponse(): AIResponse | null {
    return this.detectAIResponse(false);
  }
  
  /**
   * Force detect the latest response (ignores processed cache)
   */
  public forceDetectLatest(): AIResponse | null {
    console.log('🔄 Force detecting latest response...');
    return this.detectAIResponse(true);
  }
  
  /**
   * Detect ChatGPT AI responses using platform-specific selectors
   */
  protected detectAIResponse(forceLatest: boolean = false): AIResponse | null {
    // Throttle checks if nothing new detected recently (unless forced)
    const now = Date.now();
    if (!forceLatest && now - this.lastCheckTime < this.checkThrottleMs) {
      return null; // Skip check, too soon
    }
    
    console.log('🔍 ChatGPT: Checking for AI responses...');
    
    // Try modern ChatGPT selectors
    const selectors = [
      '[data-message-author-role="assistant"]',
      '[data-message-author="assistant"]'
    ];
    
    let assistantMessages: Element[] = [];
    
    // Find all assistant messages
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        assistantMessages = Array.from(elements);
        console.log(`✓ Found ${assistantMessages.length} assistant messages with selector: ${selector}`);
        break;
      }
    }
    
    if (assistantMessages.length === 0) {
      console.log('✗ No assistant messages found');
      this.lastCheckTime = now;
      return null;
    }
    
    // If message count hasn't changed AND not forcing, throttle future checks
    if (!forceLatest && assistantMessages.length === this.lastProcessedCount) {
      this.lastCheckTime = now;
      console.log('✗ All messages already processed (count unchanged)');
      return null;
    }
    
    // Get the NEWEST message (always start from the end)
    for (let i = assistantMessages.length - 1; i >= 0; i--) {
      const messageElement = assistantMessages[i] as HTMLElement;
      
      // Extract content from the message
      const content = this.extractMessageContent(messageElement);
      
      if (!content || content.trim().length === 0) {
        console.log('✗ Message content is empty');
        continue;
      }
      
      // Use content hash instead of position-based ID (more reliable)
      const messageId = this.hashContent(content);
      
      // If forcing latest, clear the processed ID and process it again
      if (forceLatest && i === assistantMessages.length - 1) {
        this.processedMessageIds.delete(messageId);
        console.log('🔄 Force mode: Re-processing latest message');
      }
      
      // Skip if already processed (unless forcing)
      if (!forceLatest && this.processedMessageIds.has(messageId)) {
        continue;
      }
      if (this.processedMessageIds.has(messageId)) {
        continue;
      }
      
      // Mark as processed
      this.processedMessageIds.add(messageId);
      this.lastProcessedCount = assistantMessages.length;
      this.lastCheckTime = 0; // Reset throttle - allow immediate next check
      
      console.log('✓ ChatGPT response detected');
      console.log(`   Message Hash: ${messageId.substring(0, 16)}...`);
      console.log(`   Content length: ${content.length} characters`);
      
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
    
    // Update count even if nothing new
    this.lastProcessedCount = assistantMessages.length;
    this.lastCheckTime = now;
    console.log('✗ All messages already processed');
    return null;
  }
  
  /**
   * Hash content to create unique identifier
   */
  private hashContent(content: string): string {
    let hash = 0;
    const str = content.substring(0, 200); // Use first 200 chars
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
  
  /**
   * Generate unique ID for a message
   */
  private generateMessageId(messageElement: HTMLElement): string {
    // Use data attributes if available
    const dataTestId = messageElement.getAttribute('data-testid');
    if (dataTestId) {
      return dataTestId;
    }
    
    // Use position in DOM + first 50 chars of content as ID
    const content = this.extractMessageContent(messageElement);
    const position = Array.from(document.querySelectorAll('[data-message-author-role="assistant"], [data-message-author="assistant"]')).indexOf(messageElement);
    const contentHash = content.substring(0, 50).replace(/\s/g, '');
    
    return `msg-${position}-${contentHash}`;
  }
  
  /**
   * Extract content from message element
   */
  private extractMessageContent(messageElement: HTMLElement): string {
    // Try multiple content selectors in order of preference
    const contentSelectors = [
      '.prose',
      '.markdown', 
      '.message-content',
      '[class*="markdown"]',
      '[class*="prose"]'
    ];
    
    for (const selector of contentSelectors) {
      const contentElement = messageElement.querySelector(selector);
      if (contentElement && contentElement.textContent) {
        const content = contentElement.textContent.trim();
        if (content.length > 0) {
          console.log(`   Content extracted using selector: ${selector}`);
          return content;
        }
      }
    }
    
    // Fallback to direct textContent
    const fallbackContent = messageElement.textContent || '';
    if (fallbackContent.trim().length > 0) {
      console.log('   Content extracted from direct textContent');
      return fallbackContent.trim();
    }
    
    return '';
  }
  
  /**
   * Override startMonitoring to use modern ChatGPT selectors
   */
  public startMonitoring(callback: (response: AIResponse) => void): void {
    this.responseCallback = callback;
    console.log('🔭 ChatGPT: Starting monitoring for new responses...');
    
    // Setup MutationObserver with debouncing
    let debounceTimer: NodeJS.Timeout;
    
    this.observer = new MutationObserver((mutations) => {
      // Clear existing timer
      clearTimeout(debounceTimer);
      
      // Debounce to avoid excessive checks (increased to 1000ms)
      debounceTimer = setTimeout(() => {
        const response = this.detectAIResponse();
        
        if (response && this.responseCallback) {
          console.log('📤 ChatGPT: New response found, calling callback');
          this.responseCallback(response);
        }
      }, 1000);
    });
    
    // Observe the entire document for changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log('✅ ChatGPT: Monitoring started');
    
    // Do an immediate check after a short delay
    setTimeout(() => {
      console.log('🔍 ChatGPT: Performing initial response check...');
      const response = this.detectAIResponse();
      if (response && this.responseCallback) {
        console.log('📤 ChatGPT: Initial check found response');
        this.responseCallback(response);
      }
    }, 1000);
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