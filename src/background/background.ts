/**
 * Background service worker for AI Ethics Monitor
 * Handles extension lifecycle, storage, and cross-component communication
 */

import { ExtensionMessage, UserFeedback, UserPreferences } from '../types';
import { MESSAGE_TYPES, STORAGE_KEYS } from '../shared/constants';
import { generateId } from '../shared/utils';

class BackgroundService {
  private activePlatforms: Set<string> = new Set();
  
  constructor() {
    this.initializeExtension();
    this.setupMessageHandlers();
    this.setupNetworkMonitoring();
  }
  
  private initializeExtension(): void {
    console.log('AI Ethics Monitor: Background service initialized');
    
    // Set default preferences on first install
    chrome.runtime.onInstalled.addListener(async (details) => {
      if (details.reason === 'install') {
        await this.setDefaultPreferences();
      }
    });
  }
  
  private async setDefaultPreferences(): Promise<void> {
    const defaultPreferences: UserPreferences = {
      privacySettings: {
        enableCommunityFeatures: false,
        shareAnalysisData: false,
        enableTelemetry: false,
        dataRetentionDays: 30
      },
      displaySettings: {
        showChainOfThought: true,
        showBiasFlags: true,
        sidebarPosition: 'right',
        compactMode: false
      },
      analysisSettings: {
        biasDetectionSensitivity: 'medium',
        enabledBiasTypes: ['gender_bias', 'racial_bias', 'political_bias', 'emotional_manipulation'],
        autoFlagThreshold: 'medium'
      }
    };
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.USER_PREFERENCES]: defaultPreferences
    });
  }
  
  private setupMessageHandlers(): void {
    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage, sender, sendResponse) => {
        this.handleMessage(message, sender)
          .then(sendResponse)
          .catch(error => {
            console.error('Background message handler error:', error);
            sendResponse({ error: error.message });
          });
        
        return true; // Keep message channel open for async response
      }
    );
  }
  
  private async handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender
  ): Promise<any> {
    switch (message.type) {
      case MESSAGE_TYPES.REGISTER_PLATFORM:
        return this.registerPlatform(message.payload, sender.tab?.id);
        
      case MESSAGE_TYPES.STORE_FEEDBACK:
        return this.storeFeedback(message.payload);
        
      case MESSAGE_TYPES.FETCH_CHAIN_OF_THOUGHT:
        return this.fetchChainOfThought(message.payload);
        
      case MESSAGE_TYPES.GET_EXTENSION_STATE:
        return this.getExtensionState();
        
      case MESSAGE_TYPES.UPDATE_PREFERENCES:
        return this.updatePreferences(message.payload);
        
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }
  
  private async registerPlatform(
    platformData: { platform: string; url: string },
    tabId?: number
  ): Promise<void> {
    const platformKey = `${platformData.platform}-${tabId}`;
    this.activePlatforms.add(platformKey);
    
    console.log(`Platform registered: ${platformData.platform} on tab ${tabId}`);
    
    // Store platform state
    const result = await chrome.storage.local.get(STORAGE_KEYS.PLATFORM_STATE);
    const currentPlatformState = result[STORAGE_KEYS.PLATFORM_STATE] || {};
    
    const updatedPlatformState = {
      ...currentPlatformState,
      [platformKey]: {
        platform: platformData.platform,
        url: platformData.url,
        registeredAt: new Date().toISOString(),
        active: true
      }
    };
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.PLATFORM_STATE]: updatedPlatformState
    });
  }
  
  private async storeFeedback(feedback: UserFeedback): Promise<void> {
    const feedbackId = generateId();
    const timestampedFeedback = {
      ...feedback,
      id: feedbackId,
      timestamp: new Date()
    };
    
    // Store in offline queue first
    const offlineQueue = await this.getOfflineFeedbackQueue();
    offlineQueue.push(timestampedFeedback);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.OFFLINE_FEEDBACK]: offlineQueue
    });
    
    // TODO: Attempt to sync with community database if enabled
    console.log('Feedback stored:', feedbackId);
  }
  
  private async getOfflineFeedbackQueue(): Promise<UserFeedback[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.OFFLINE_FEEDBACK);
    return result[STORAGE_KEYS.OFFLINE_FEEDBACK] || [];
  }
  
  private async fetchChainOfThought(payload: {
    prompt: string;
    platform: string;
  }): Promise<any> {
    // TODO: Implement API integration for supported platforms
    // For now, return a placeholder response
    console.log('Chain of thought requested for:', payload.platform);
    
    return {
      reasoning: 'Chain of thought extraction not yet implemented for this platform',
      confidence: 0.1,
      ethicalConsiderations: ['API integration pending'],
      sources: []
    };
  }
  
  private async getExtensionState(): Promise<any> {
    const preferencesResult = await chrome.storage.local.get(STORAGE_KEYS.USER_PREFERENCES);
    const platformStateResult = await chrome.storage.local.get(STORAGE_KEYS.PLATFORM_STATE);
    
    return {
      preferences: preferencesResult[STORAGE_KEYS.USER_PREFERENCES],
      activePlatforms: Array.from(this.activePlatforms),
      platformState: platformStateResult[STORAGE_KEYS.PLATFORM_STATE] || {}
    };
  }
  
  private async updatePreferences(newPreferences: Partial<UserPreferences>): Promise<void> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.USER_PREFERENCES);
    const currentPreferences = result[STORAGE_KEYS.USER_PREFERENCES] || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...newPreferences
    };
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.USER_PREFERENCES]: updatedPreferences
    });
    
    console.log('Preferences updated');
  }
  
  private setupNetworkMonitoring(): void {
    // Monitor network requests for AI platform API calls
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        // TODO: Implement network request analysis
        console.log('Network request intercepted:', details.url);
      },
      {
        urls: [
          'https://chat.openai.com/backend-api/*',
          'https://copilot.microsoft.com/api/*',
          'https://gemini.google.com/api/*'
        ]
      },
      ['requestBody']
    );
  }
}

// Initialize the background service
new BackgroundService();