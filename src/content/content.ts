/**
 * Content script entry point for VeriAI — AI Ethics Monitor
 * Initializes platform detection, monitoring, and AI presence scanning.
 * Now runs on ALL websites (manifest <all_urls>).
 */

import { detectPlatform } from '../shared/utils';
import { MESSAGE_TYPES } from '../shared/constants';
import { ExtensionMessage, SupportedPlatform } from '../types';
import { PlatformAdapterFactory } from './adapters/PlatformAdapterFactory';
import { UIManager } from './ui/UIManager';
import { biasDetector } from '../shared/biasDetection';
import { NLPBiasDetector } from '../shared/nlpBiasDetector';
import { ChainOfThoughtExtractor } from '../shared/chainOfThoughtExtractor';
import { ClaimDecomposer } from '../shared/claimDecomposer';
import { PromptInjector } from '../shared/promptInjector';
import { StructuredOutputParser } from '../shared/structuredOutput';
import { AIPresenceDetector } from '../shared/aiPresenceDetector';

class ContentScriptManager {
  private platform: SupportedPlatform;
  private platformAdapter: any;
  private uiManager: UIManager;
  private isInitialized = false;
  
  constructor() {
    console.log('=== ContentScriptManager Constructor ===');
    
    try {
      this.platform = detectPlatform(window.location.href);
      console.log('✓ Platform detected:', this.platform);
      
      this.uiManager = new UIManager();
      console.log('✓ UI Manager created');
      
      this.setupMessageListener();
      this.setupReloadListener();
      
      this.initialize();
      console.log('✓ Initialization started');
    } catch (error) {
      console.error('✗ Error in constructor:', error);
      throw error;
    }
  }
  
  private setupReloadListener(): void {
    window.addEventListener('ai-ethics-reload-requested', () => {
      console.log('🔄 Reload requested by user - forcing latest response analysis');
      this.forceAnalyzeLatest();
    });
  }
  
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'TOGGLE_SIDEBAR') {
        this.uiManager.toggleSidebar();
        sendResponse({ success: true });
      }
      return true;
    });
  }
  
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 Starting initialization...');
      
      // Show a visual indicator that the extension is loaded
      this.showLoadIndicator();
      
      // Register with background service
      await this.registerPlatform();
      console.log('✓ Platform registered');
      
      // Initialize platform-specific adapter
      this.platformAdapter = PlatformAdapterFactory.create(this.platform);
      console.log('✓ Platform adapter created');
      
      // Initialize UI components
      await this.uiManager.initialize();
      console.log('✓ UI Manager initialized');

      // ─── AI Presence Detection (runs on ALL sites) ───
      // Only run full detection on non-known-platform sites
      if (!AIPresenceDetector.isKnownPlatform()) {
        AIPresenceDetector.startNetworkMonitoring();
        // Delay scan to let page finish loading
        setTimeout(() => {
          const report = AIPresenceDetector.scan();
          console.log(`🔍 AI Presence scan: ${report.detections.length} detection(s)`);
          this.uiManager.displayAIPresenceReport(report);
        }, 2000);
      }

      // ─── Prompt Injection Setup ───
      PromptInjector.interceptPromptSubmission(this.platform);
      console.log('✓ Prompt injector attached');
      
      // Show sidebar immediately
      this.uiManager.showSidebar();
      console.log('✓ Sidebar shown');
      
      // Show test analysis immediately (only on known AI platforms)
      if (this.platform !== 'generic') {
        console.log('⏰ Triggering test analysis...');
        await this.showTestAnalysis();
        console.log('✅ Test analysis should be displayed');
      }
      
      // Start monitoring
      this.startMonitoring();
      console.log('✓ Monitoring started');
      
      this.isInitialized = true;
      console.log(`✅ VeriAI fully initialized for platform: ${this.platform}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize VeriAI:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
    }
  }
  
  private showLoadIndicator(): void {
    // Add a small visual indicator that the extension is loaded
    const indicator = document.createElement('div');
    indicator.id = 'ai-ethics-monitor-indicator';
    indicator.textContent = '🧠 AI Ethics Monitor Active';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(indicator);
    
    // Remove after 3 seconds
    setTimeout(() => {
      indicator.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => indicator.remove(), 300);
    }, 3000);
  }
  
  private async registerPlatform(): Promise<void> {
    console.log('Registering platform:', this.platform);
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'REGISTER_PLATFORM',
        payload: {
          platform: this.platform,
          url: window.location.href
        }
      });
      
      console.log('Platform registration response:', response);
      
      if (response && response.success) {
        console.log(`✅ Platform ${this.platform} registered successfully`);
      } else {
        console.error('❌ Platform registration failed:', response);
      }
    } catch (error) {
      console.error('Failed to register platform:', error);
    }
  }
  
  private startMonitoring(): void {
    if (!this.platformAdapter) {
      console.warn('Platform adapter not available, using generic monitoring');
      return;
    }
    
    console.log('🔄 Starting continuous monitoring for new AI responses...');
    
    // Start monitoring for AI responses
    this.platformAdapter.startMonitoring((response: any) => {
      console.log('📨 New AI response detected!');
      this.handleAIResponse(response);
    });
    
    // Also set up a MutationObserver for dynamic content changes
    this.setupDynamicMonitoring();
  }
  
  private setupDynamicMonitoring(): void {
    console.log('👁️ Setting up dynamic content monitoring...');
    
    // Observe DOM changes to detect new AI responses
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations added new content
      const hasNewContent = mutations.some(mutation => 
        mutation.addedNodes.length > 0 || 
        mutation.type === 'characterData'
      );
      
      if (hasNewContent) {
        // Debounce: wait a bit for content to fully load
        setTimeout(() => {
          this.checkForNewResponse();
        }, 500);
      }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log('✓ Dynamic monitoring active');
  }
  
  private checkForNewResponse(): void {
    if (!this.platformAdapter) return;
    
    // Manually trigger response detection
    const response = this.platformAdapter.detectNewResponse();
    if (response) {
      console.log('🆕 New response found via dynamic monitoring');
      this.handleAIResponse(response);
    }
  }
  
  private forceAnalyzeLatest(): void {
    if (!this.platformAdapter) return;
    
    // Force detection of the latest response (re-process even if already seen)
    const response = this.platformAdapter.forceDetectLatest?.() || this.platformAdapter.detectNewResponse();
    if (response) {
      console.log('🔄 Latest response found via forced reload');
      this.handleAIResponse(response);
    } else {
      console.log('❌ No response found to analyze');
    }
  }
  
  private async handleAIResponse(response: any): Promise<void> {
    try {
      console.log('🔍 Processing AI response:', response.content.substring(0, 100) + '...');
      
      // ─── Try structured JSON parsing first (Feature 5) ───
      const structuredOutput = StructuredOutputParser.parse(response.content);
      if (structuredOutput) {
        console.log(`✓ Structured JSON output parsed: ${structuredOutput.reasoning_steps.length} steps`);
      }

      // Extract chain of thought using the advanced extractor
      console.log('🧠 Extracting chain of thought...');
      const chainOfThought = ChainOfThoughtExtractor.extract(
        response.content,
        response.platform || this.platform
      );
      console.log(`✓ Extracted ${chainOfThought.steps.length} reasoning steps`);
      
      // ─── Claim Decomposition (Feature 2) ───
      console.log('🔬 Decomposing claims...');
      const claimDecomposition = ClaimDecomposer.decompose(response.content);
      console.log(`✓ ${claimDecomposition.totalClaims} claims extracted, ${claimDecomposition.flaggedClaims} flagged`);

      // Perform keyword-based bias analysis
      console.log('🔍 Analyzing for bias (keyword-based)...');
      const biasAnalysis = await this.performBiasAnalysis(response.content);
      console.log(`✓ Keyword bias analysis complete: ${biasAnalysis.overallRisk} risk`);
      
      // Perform NLP-based bias analysis
      console.log('🧠 Analyzing for bias (NLP-based)...');
      const nlpBiasAnalysis = await this.performNLPBiasAnalysis(response.content);
      console.log(`✓ NLP bias analysis complete: ${nlpBiasAnalysis ? nlpBiasAnalysis.overallScore + '/100' : 'N/A'}`);
      
      // Display results in UI
      console.log('📊 Displaying analysis in sidebar...');
      await this.uiManager.displayAnalysis({
        response,
        chainOfThought,
        biasAnalysis,
        nlpBiasAnalysis,
        claimDecomposition,
        structuredOutput
      });
      console.log('✅ Analysis displayed successfully');
      
      // Notify background service
      const message: ExtensionMessage = {
        type: MESSAGE_TYPES.AI_RESPONSE_DETECTED,
        payload: {
          response,
          chainOfThought,
          biasAnalysis,
          nlpBiasAnalysis,
          claimDecomposition
        },
        sender: 'content',
        timestamp: new Date()
      };
      
      chrome.runtime.sendMessage(message);
      
    } catch (error) {
      console.error('❌ Error handling AI response:', error);
    }
  }
  
  private async performBiasAnalysis(content: string): Promise<any> {
    console.log('🔍 Analyzing text for bias...');
    
    // Keyword-based bias detection (existing)
    const result = biasDetector.analyzeText(content);
    
    // Also perform sentence-wise analysis
    const sentenceAnalysis = biasDetector.analyzeSentenceWise(content);
    
    console.log('✓ Keyword-based bias analysis complete:', result);
    console.log('✓ Sentence-wise analysis complete:', sentenceAnalysis.length, 'sentences analyzed');
    
    // Combine both analyses
    return {
      ...result,
      sentenceAnalysis
    };
  }

  private async performNLPBiasAnalysis(content: string): Promise<any> {
    console.log('🧠 Performing NLP-based bias analysis...');
    
    try {
      const nlpResult = NLPBiasDetector.analyze(content);
      console.log('✓ NLP bias analysis complete:', nlpResult);
      return nlpResult;
    } catch (error) {
      console.error('❌ NLP bias analysis failed:', error);
      return null;
    }
  }
  
  private async showTestAnalysis(): Promise<void> {
    if (this.platform === 'generic') return;
    
    console.log('Showing test analysis for platform:', this.platform);
    
    // TEST: Check if NLP is available
    console.log('🧪 Testing NLP availability...');
    try {
      const testNLP = require('compromise');
      console.log('✓ NLP module loaded:', typeof testNLP);
      const testDoc = testNLP('Hello world');
      console.log('✓ NLP test doc created:', testDoc ? 'YES' : 'NO');
    } catch (error) {
      console.error('❌ NLP test failed:', error);
    }
    
    // Create a test response with biased content and reasoning to demonstrate detection
    const testResponse = {
      id: 'test-response-1',
      content: `Let me explain this step by step:

1. First, we need to understand the context of your question.
2. Second, I'll analyze the available options.
3. Third, I'll provide a recommendation based on the analysis.

Because this is a complex topic, I should note that there are multiple perspectives to consider. Therefore, the best approach is to:

• Consider the pros and cons of each option
• Evaluate the potential risks and benefits
• Make an informed decision based on your specific needs

However, it's important to note that I cannot provide legal or medical advice. If you need professional guidance, please consult with a qualified expert.

In conclusion, the key takeaway is that you should carefully evaluate all factors before making a decision. This means taking time to research, asking questions, and seeking expert opinions when necessary.`,
      timestamp: new Date(),
      platform: this.platform
    };
    
    // Use the real chain of thought extractor
    console.log('Extracting chain of thought from test content...');
    const testChainOfThought = ChainOfThoughtExtractor.extract(
      testResponse.content,
      this.platform
    );
    console.log('Chain of thought extracted:', testChainOfThought);

    // Run claim decomposition on test content
    console.log('Decomposing claims from test content...');
    const testClaimDecomposition = ClaimDecomposer.decompose(testResponse.content);
    console.log('Claim decomposition complete:', testClaimDecomposition);

    // Try structured output parsing
    const testStructuredOutput = StructuredOutputParser.parse(testResponse.content);
    
    // Run real bias analysis on the test content
    console.log('Running bias analysis on test content...');
    const testBiasAnalysis = await this.performBiasAnalysis(testResponse.content);
    console.log('Bias analysis complete:', testBiasAnalysis);
    
    // Run NLP bias analysis on the test content
    console.log('Running NLP bias analysis on test content...');
    const testNLPBiasAnalysis = await this.performNLPBiasAnalysis(testResponse.content);
    console.log('NLP bias analysis complete:', testNLPBiasAnalysis);
    
    console.log('Displaying analysis in UI...');
    await this.uiManager.displayAnalysis({
      response: testResponse,
      chainOfThought: testChainOfThought,
      biasAnalysis: testBiasAnalysis,
      nlpBiasAnalysis: testNLPBiasAnalysis,
      claimDecomposition: testClaimDecomposition,
      structuredOutput: testStructuredOutput
    });
  }
}

// Initialize immediately
(function() {
  'use strict';
  
  console.log('%c🧠 VeriAI Extension Loaded!', 'background: #00d4ff; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
  console.log('URL:', window.location.href);
  console.log('Timestamp:', new Date().toISOString());
  
  // Add a small delay to ensure DOM is ready
  const initializeExtension = () => {
    try {
      console.log('Initializing ContentScriptManager...');
      new ContentScriptManager();
      console.log('✅ ContentScriptManager initialized successfully');
    } catch (error) {
      console.error('✗ Failed to initialize AI Ethics Monitor:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
      }
    }
  };
  
  if (document.readyState === 'loading') {
    console.log('⏳ Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('✓ DOM Content Loaded');
      initializeExtension();
    });
  } else {
    console.log('✓ DOM already loaded');
    initializeExtension();
  }
})();