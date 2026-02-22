/**
 * Popup interface for AI Ethics Monitor
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ExtensionMessage, UserPreferences } from '../types';
import { MESSAGE_TYPES } from '../shared/constants';

interface ExtensionState {
  preferences: UserPreferences | null;
  activePlatforms: string[];
  platformState: Record<string, any>;
}

const Popup: React.FC = () => {
  const [extensionState, setExtensionState] = useState<ExtensionState>({
    preferences: null,
    activePlatforms: [],
    platformState: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExtensionState();
  }, []);

  const loadExtensionState = async () => {
    try {
      console.log('Loading platform status...');
      
      // Try to wake up background script with retries
      let connected = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const pingResponse = await chrome.runtime.sendMessage({ type: 'PING' });
          if (pingResponse?.success) {
            console.log('✅ Background script is alive');
            connected = true;
            break;
          }
        } catch (pingError) {
          console.warn(`⚠️ Background script may be asleep, attempt ${attempt}/3...`);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          }
        }
      }
      
      if (!connected) {
        console.error('❌ Could not connect to background script after 3 attempts');
        throw new Error('Background script not responding. Please reload the extension.');
      }
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PLATFORM_STATUS'
      });
      
      console.log('Platform status response:', response);
      
      if (response && response.success) {
        setExtensionState({
          preferences: null,
          activePlatforms: response.platforms.map((p: any) => p.platform),
          platformState: response.platforms.reduce((acc: any, p: any) => {
            acc[p.platform] = p;
            return acc;
          }, {})
        });
      } else {
        console.log('ℹ️ No active platforms yet');
        setExtensionState({
          preferences: null,
          activePlatforms: [],
          platformState: {}
        });
      }
    } catch (error) {
      console.error('Failed to load extension state:', error);
      // Set empty state instead of leaving it loading
      setExtensionState({
        preferences: null,
        activePlatforms: [],
        platformState: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformStatus = (platform: string): { status: string; isActive: boolean } => {
    const isActive = extensionState.activePlatforms.some(active => 
      active.includes(platform)
    );
    return {
      status: isActive ? 'Active' : 'Inactive',
      isActive
    };
  };

  const getStatusText = (): string => {
    if (isLoading) return 'Initializing...';
    if (extensionState.activePlatforms.length > 0) {
      return `Monitoring ${extensionState.activePlatforms.length} platform${extensionState.activePlatforms.length > 1 ? 's' : ''}`;
    }
    return 'No AI platforms detected';
  };

  const handleSettingsClick = () => {
    // Open settings page in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  };

  const handleHelpClick = () => {
    window.open('https://github.com/your-repo/ai-ethics-monitor', '_blank');
  };
  
  const handleToggleSidebar = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        console.error('No active tab found');
        alert('No active tab found');
        return;
      }

      // Check if we're on a supported platform
      const url = tab.url || '';
      const isSupportedPlatform = 
        url.includes('chatgpt.com') || 
        url.includes('chat.openai.com') ||
        url.includes('copilot.microsoft.com') ||
        url.includes('gemini.google.com') ||
        url.includes('bard.google.com') ||
        url.includes('claude.ai');

      if (!isSupportedPlatform) {
        alert('Please navigate to a supported AI platform (ChatGPT, Copilot, Gemini, or Claude)');
        return;
      }

      try {
        // Try to send message to content script
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
        console.log('Sidebar toggle response:', response);
      } catch (contentScriptError) {
        console.warn('Content script error:', contentScriptError);
        
        // Try to inject the content script
        try {
          console.log('Attempting to inject content script...');
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']  // Fixed: removed 'dist/' prefix
          });
          
          // Also inject CSS
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['content.css']
          });
          
          // Wait a bit for initialization
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try again
          await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
          console.log('Successfully toggled after injection');
        } catch (injectionError) {
          console.error('Failed to inject content script:', injectionError);
          alert('Failed to load extension. Please refresh the page (Ctrl+Shift+R) and try again.');
        }
      }
    } catch (error) {
      console.error('Failed to toggle sidebar:', error);
      alert('An error occurred. Please refresh the page and try again.');
    }
  };

  const platforms = [
    { id: 'chatgpt', name: 'ChatGPT' },
    { id: 'copilot', name: 'Copilot' },
    { id: 'gemini', name: 'Gemini' },
    { id: 'claude', name: 'Claude' }
  ];

  if (isLoading) {
    return (
      <div className="popup-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo-icon">🧠</div>
          <div className="logo-text">
            <div className="logo-title">AI Ethics Monitor</div>
            <div className="logo-subtitle">Chain of Thought Analysis</div>
          </div>
          <div className={`status-indicator ${extensionState.activePlatforms.length > 0 ? 'active' : ''}`}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Status Section */}
        <div className="status-section">
          <div className="status-card">
            <div className="status-title">{getStatusText()}</div>
            <div className="status-subtitle">
              {extensionState.activePlatforms.length > 0 
                ? 'Monitoring AI reasoning patterns'
                : 'Navigate to an AI platform to begin'
              }
            </div>
          </div>
        </div>

        {/* Platforms Section */}
        <div className="platforms-section">
          <div className="section-title">Platforms</div>
          {platforms.map(platform => {
            const { status, isActive } = getPlatformStatus(platform.id);
            return (
              <div key={platform.id} className="platform-item">
                <div className="platform-name">{platform.name}</div>
                <div className={`platform-status ${isActive ? 'active' : 'inactive'}`}>
                  {status}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Section */}
        <div className="actions-section">
          <button className="action-button primary" onClick={handleToggleSidebar}>
            Toggle Sidebar
          </button>
        </div>
        
        <div className="actions-section" style={{ marginTop: '8px' }}>
          <button className="action-button" onClick={handleSettingsClick}>
            Settings
          </button>
          <button className="action-button" onClick={handleHelpClick}>
            Help
          </button>
        </div>
      </div>
    </div>
  );
};

// Initialize React app
const container = document.getElementById('root');
if (!container) {
  // Create root element if it doesn't exist
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  
  const reactRoot = createRoot(root);
  reactRoot.render(<Popup />);
} else {
  const reactRoot = createRoot(container);
  reactRoot.render(<Popup />);
}