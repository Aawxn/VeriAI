/**
 * Background Service Worker for VeriAI Extension
 */

// CRITICAL DEBUG: Log at the very start to verify script loads
console.log('🚀 VeriAI: Background script starting to load...');

import { BiasDetectionEngine } from '../shared/biasDetection';
import { ChainOfThoughtExtractor } from '../shared/chainOfThoughtExtractor';
import { GeminiVerifier } from '../shared/geminiVerifier';
import { CrossAIVerifier } from '../shared/crossAIVerifier';
import { MESSAGE_TYPES } from '../shared/constants';
import type { BiasAnalysis, ChainOfThought, AIResponse, CrossModelVerificationRequest, CrossModelVerificationResult, CrossAIVerificationRequest, CrossAIVerificationResult } from '../types';

console.log('📦 VeriAI: All imports successful');

interface PlatformState {
  platform: string;
  url: string;
  isActive: boolean;
  lastSeen: number;
}

class BackgroundService {
  private biasDetector: BiasDetectionEngine;
  private thoughtExtractor: ChainOfThoughtExtractor;
  private activePlatforms: Map<number, PlatformState> = new Map();
  private analysisCache: Map<string, any> = new Map();
  private keepAliveInterval?: number;

  constructor() {
    console.log('🏗️ VeriAI: BackgroundService constructor called');
    try {
      console.log('📝 VeriAI: Creating BiasDetectionEngine...');
      this.biasDetector = new BiasDetectionEngine();
      console.log('📝 VeriAI: Creating ChainOfThoughtExtractor...');
      this.thoughtExtractor = new ChainOfThoughtExtractor();
      console.log('📝 VeriAI: Initializing background service...');
      this.initializeBackgroundService();
      console.log('📝 VeriAI: Starting keepalive...');
      this.startKeepAlive();
      console.log('✅ VeriAI: BackgroundService constructor completed successfully');
    } catch (error) {
      console.error('❌ VeriAI: Error in BackgroundService constructor:', error);
      throw error;
    }
  }

  /**
   * Keep service worker alive to prevent it from sleeping
   */
  private startKeepAlive(): void {
    // Ping every 20 seconds to keep service worker alive
    this.keepAliveInterval = setInterval(() => {
      console.log('🔄 VeriAI: Service worker keepalive ping');
    }, 20000) as unknown as number;
  }

  private initializeBackgroundService(): void {
    // Listen for extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('VeriAI: Extension installed/updated', details);
    });

    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Clean up inactive platforms
    setInterval(() => {
      this.cleanupInactivePlatforms();
    }, 30000); // Every 30 seconds

    console.log('VeriAI: Background service initialized');
  }

  private async handleMessage(message: any, sender: any, sendResponse: (response: any) => void): Promise<void> {
    try {
      console.log(`✅ VeriAI: Received message type: ${message.type}`, {
        hasSender: !!sender,
        hasTab: !!sender?.tab,
        tabId: sender?.tab?.id
      });
      
      switch (message.type) {
        case 'PING':
          sendResponse({ success: true, status: 'alive' });
          break;

        case 'REGISTER_PLATFORM':
        case MESSAGE_TYPES.REGISTER_PLATFORM:
          await this.handlePlatformRegistration(message.payload, sender.tab?.id, sendResponse);
          break;

        case 'GET_PLATFORM_STATUS':
        case MESSAGE_TYPES.GET_PLATFORM_STATUS:
          await this.handleGetPlatformStatus(sendResponse);
          break;

        case 'EVALUATE_RESPONSE':
        case MESSAGE_TYPES.EVALUATE_RESPONSE:
          await this.handleEvaluateResponse(message.payload, sendResponse);
          break;

        case 'TOGGLE_SIDEBAR':
        case MESSAGE_TYPES.TOGGLE_SIDEBAR:
          await this.handleToggleSidebar(sender.tab?.id, sendResponse);
          break;

        case 'CROSS_MODEL_VERIFY':
        case MESSAGE_TYPES.CROSS_MODEL_VERIFY:
          await this.handleCrossModelVerify(message.payload, sendResponse);
          break;

        case 'CROSS_AI_OPTIMIZE':
        case MESSAGE_TYPES.CROSS_AI_OPTIMIZE:
          await this.handleCrossAIOptimize(message.payload, sendResponse);
          break;

        case 'RELOAD_API_KEYS':
          await this.handleReloadAPIKeys(sendResponse);
          break;

        default:
          console.warn('VeriAI: Unknown message type:', message.type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('VeriAI: Error handling message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }

  private async handlePlatformRegistration(payload: any, tabId: number | undefined, sendResponse: (response: any) => void): Promise<void> {
    if (!tabId) {
      sendResponse({ success: false, error: 'No tab ID' });
      return;
    }

    this.activePlatforms.set(tabId, {
      platform: payload.platform,
      url: payload.url,
      isActive: true,
      lastSeen: Date.now()
    });

    console.log(`VeriAI: Platform ${payload.platform} registered for tab ${tabId}`);
    sendResponse({ success: true, platform: payload.platform });
  }

  private async handleGetPlatformStatus(sendResponse: (response: any) => void): Promise<void> {
    const platforms = Array.from(this.activePlatforms.values()).map(state => ({
      platform: state.platform,
      isActive: state.isActive,
      url: state.url
    }));

    sendResponse({ success: true, platforms });
  }

  private async handleEvaluateResponse(payload: any, sendResponse: (response: any) => void): Promise<void> {
    const { userQuestion, aiResponse } = payload;
    
    // Check cache first
    const cacheKey = this.generateCacheKey(userQuestion, aiResponse);
    if (this.analysisCache.has(cacheKey)) {
      const cachedResult = this.analysisCache.get(cacheKey);
      sendResponse({ success: true, analysis: cachedResult });
      return;
    }

    // Perform analysis
    const analysis = await this.evaluateResponse(userQuestion, aiResponse);
    
    // Cache result
    this.cacheAnalysis(cacheKey, analysis);
    
    sendResponse({ success: true, analysis });
  }

  private async handleToggleSidebar(tabId: number | undefined, sendResponse: (response: any) => void): Promise<void> {
    if (!tabId) {
      sendResponse({ success: false, error: 'No tab ID' });
      return;
    }

    try {
      // Send message to content script to toggle sidebar
      await chrome.tabs.sendMessage(tabId, {
        type: MESSAGE_TYPES.TOGGLE_SIDEBAR,
        payload: {}
      });
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('VeriAI: Failed to toggle sidebar:', error);
      sendResponse({ success: false, error: 'Content script not available' });
    }
  }

  /**
   * Comprehensive AI response evaluation
   */
  public async evaluateResponse(userQuestion: string, aiResponse: string): Promise<{
    biasAnalysis: BiasAnalysis;
    chainOfThought: ChainOfThought;
    responseId: string;
    recommendations: string[];
  }> {
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Perform bias analysis
    const biasAnalysis = await this.biasDetector.analyzeText(aiResponse);

    // Extract chain of thought
    const chainOfThought = ChainOfThoughtExtractor.extract(aiResponse);

    // Generate recommendations
    const recommendations = this.generateEthicalRecommendations(biasAnalysis, chainOfThought, userQuestion);

    return {
      responseId,
      biasAnalysis,
      chainOfThought,
      recommendations
    };
  }

  /**
   * Generate contextual ethical recommendations
   */
  private generateEthicalRecommendations(
    biasAnalysis: BiasAnalysis,
    chainOfThought: ChainOfThought,
    userQuestion: string
  ): string[] {
    const recommendations: string[] = [];

    // Risk-based recommendations
    if (biasAnalysis.overallRisk === 'critical') {
      recommendations.push('🚨 Critical bias risk detected - exercise extreme caution with this response');
    } else if (biasAnalysis.overallRisk === 'high') {
      recommendations.push('⚠️ High bias risk detected - exercise caution with this response');
    }

    // Bias-specific recommendations
    if (biasAnalysis.flaggedContent.length > 0) {
      const biasTypes = [...new Set(biasAnalysis.flaggedContent.map((flag: any) => flag.type))];
      biasTypes.forEach(type => {
        switch (type) {
          case 'gender_bias':
            recommendations.push('⚠️ Gender stereotype detected - consider more inclusive language');
            break;
          case 'racial_bias':
            recommendations.push('⚠️ Potential racial bias detected - verify cultural sensitivity');
            break;
          case 'political_bias':
            recommendations.push('⚠️ Political bias detected - seek balanced perspectives');
            break;
        }
      });
    }

    // Chain of thought recommendations
    if (!chainOfThought.inferredLogic && chainOfThought.confidence < 0.7) {
      recommendations.push('💡 Ask the AI to explain its reasoning step by step');
    }

    if (chainOfThought.ethicalConsiderations.length > 0) {
      recommendations.push('✓ AI demonstrated ethical awareness');
    }

    // Question-specific recommendations
    const sensitiveTopics = ['politics', 'religion', 'gender', 'race', 'culture'];
    const questionLower = userQuestion.toLowerCase();
    
    if (sensitiveTopics.some(topic => questionLower.includes(topic))) {
      recommendations.push('🔍 Verify information from multiple independent sources');
      recommendations.push('🤔 Consider rephrasing your question for a more balanced answer');
    }

    return recommendations;
  }

  private generateCacheKey(userQuestion: string, aiResponse: string): string {
    const combined = `${userQuestion}|${aiResponse}`;
    // Use a simple hash instead of btoa to avoid encoding issues
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 32);
  }

  private cacheAnalysis(key: string, analysis: any): void {
    // Simple LRU cache implementation
    if (this.analysisCache.size >= 100) {
      const firstKey = this.analysisCache.keys().next().value;
      if (firstKey) {
        this.analysisCache.delete(firstKey);
      }
    }
    
    this.analysisCache.set(key, {
      ...analysis,
      cached: true,
      timestamp: Date.now()
    });
  }

  private cleanupInactivePlatforms(): void {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [tabId, state] of this.activePlatforms.entries()) {
      if (now - state.lastSeen > timeout) {
        this.activePlatforms.delete(tabId);
        console.log(`VeriAI: Removed inactive platform for tab ${tabId}`);
      }
    }
  }

  /**
   * Handle Cross-Model Verification using Google Gemini
   */
  private async handleCrossModelVerify(payload: any, sendResponse: (response: any) => void): Promise<void> {
    try {
      console.log('🔍 Starting cross-model verification with Gemini...');
      
      const request: CrossModelVerificationRequest = {
        userQuestion: payload.userQuestion || '',
        aiResponse: payload.aiResponse || '',
        sourcePlatform: payload.sourcePlatform || 'generic',
        responseMetadata: payload.responseMetadata
      };

      // Verify response using Google Gemini
      const verificationResult = await this.verifyResponseWithGemini(
        request.userQuestion,
        request.aiResponse,
        request.sourcePlatform
      );

      console.log(`✅ Verification complete. Trust Score: ${verificationResult.trustScore}/100`);
      console.log(`   Verdict: ${verificationResult.finalVerdict}`);

      sendResponse({
        success: true,
        verification: verificationResult
      });

    } catch (error) {
      console.error('❌ Cross-model verification failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Verify AI response using Google Gemini as ethical supervisor
   */
  public async verifyResponseWithGemini(
    userQuestion: string,
    aiResponse: string,
    sourcePlatform: string = 'generic'
  ): Promise<CrossModelVerificationResult> {
    try {
      console.log('🤖 Gemini Verifier: Analyzing response from', sourcePlatform);
      
      const request: CrossModelVerificationRequest = {
        userQuestion,
        aiResponse,
        sourcePlatform: sourcePlatform as any,
        responseMetadata: {
          responseTime: Date.now()
        }
      };

      // Use Gemini Verifier to analyze the response
      const result = await GeminiVerifier.verifyResponse(request);

      // Cache the verification result
      const cacheKey = this.generateCacheKey(userQuestion, aiResponse);
      this.cacheAnalysis(`verify_${cacheKey}`, result);

      return result;

    } catch (error) {
      console.error('Error in verifyResponseWithGemini:', error);
      throw error;
    }
  }
  
  /**
   * Handle Cross-AI Optimization request
   */
  private async handleCrossAIOptimize(payload: any, sendResponse: (response: any) => void): Promise<void> {
    try {
      console.log('🌟 Starting Cross-AI Optimization Engine...');
      
      const request: CrossAIVerificationRequest = {
        question: payload.question || payload.userQuestion || '',
        originalAnswer: payload.answer || payload.aiResponse || '',
        sourcePlatform: payload.sourcePlatform || 'generic'
      };

      if (!request.question || !request.originalAnswer) {
        throw new Error('Missing question or answer for Cross-AI optimization');
      }

      console.log(`   Question: ${request.question.substring(0, 100)}...`);
      console.log(`   Source: ${request.sourcePlatform}`);

      // Verify and optimize across multiple AI models
      const optimizationResult = await this.verifyAcrossModels(
        request.question,
        request.originalAnswer,
        request.sourcePlatform
      );

      console.log(`✅ Cross-AI Optimization complete`);
      console.log(`   Best Model: ${optimizationResult.bestModel}`);
      console.log(`   Consistency: ${optimizationResult.consistencyScore}/100`);
      console.log(`   Completeness: ${optimizationResult.completenessScore}/100`);

      sendResponse({
        success: true,
        optimization: optimizationResult
      });

    } catch (error) {
      console.error('❌ Cross-AI optimization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Verify and optimize answer across multiple AI models
   */
  public async verifyAcrossModels(
    question: string,
    originalAnswer: string,
    sourcePlatform: string = 'generic'
  ): Promise<CrossAIVerificationResult> {
    try {
      console.log('🤖 Cross-AI Verifier: Querying multiple AI models...');
      
      // Use Cross-AI Verifier to gather and compare responses
      const result = await CrossAIVerifier.verifyAcrossModels(
        question,
        originalAnswer,
        sourcePlatform
      );

      // Cache the optimization result
      const cacheKey = this.generateCacheKey(question, originalAnswer);
      this.cacheAnalysis(`optimize_${cacheKey}`, result);

      return result;

    } catch (error) {
      console.error('Error in verifyAcrossModels:', error);
      throw error;
    }
  }

  /**
   * Handle API key reload request
   */
  private async handleReloadAPIKeys(sendResponse: (response: any) => void): Promise<void> {
    try {
      console.log('🔄 Reloading API keys from storage...');
      await CrossAIVerifier.loadAPIKeys();
      console.log('✅ API keys reloaded successfully');
      sendResponse({ success: true });
    } catch (error) {
      console.error('❌ Failed to reload API keys:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }
}

// Initialize background service - MUST be global to keep listeners alive
console.log('🎬 VeriAI: About to instantiate BackgroundService...');
let backgroundService: BackgroundService | null = null;

try {
  backgroundService = new BackgroundService();
  console.log('🎉 VeriAI: BackgroundService instantiated successfully!', backgroundService);
  
  // Export for debugging
  (globalThis as any).veriAIBackgroundService = backgroundService;
} catch (error) {
  console.error('💥 VeriAI: FATAL ERROR - Failed to instantiate BackgroundService:', error);
  console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
  
  // Try to set up minimal message handler even if initialization fails
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.error('❌ VeriAI: Received message but service failed to initialize:', message.type);
    sendResponse({ success: false, error: 'Background service failed to initialize' });
    return true;
  });
}