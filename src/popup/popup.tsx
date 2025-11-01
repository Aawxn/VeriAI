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
      const message: ExtensionMessage = {
        type: MESSAGE_TYPES.GET_EXTENSION_STATE,
        payload: {},
        sender: 'popup',
        timestamp: new Date()
      };

      const response = await chrome.runtime.sendMessage(message);
      setExtensionState(response);
    } catch (error) {
      console.error('Failed to load extension state:', error);
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
    alert('Settings functionality will be implemented in a future task');
  };

  const handleHelpClick = () => {
    window.open('https://github.com/your-repo/ai-ethics-monitor', '_blank');
  };
  
  const handleToggleSidebar = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
      }
    } catch (error) {
      console.error('Failed to toggle sidebar:', error);
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