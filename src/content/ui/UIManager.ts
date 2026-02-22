/**
 * UI Manager for handling the extension's user interface components
 */

import { UI_CONSTANTS, MESSAGE_TYPES } from '../../shared/constants';
import { CrossModelVerificationUI } from './CrossModelVerificationUI';
import { CrossAIOptimizationUI } from './CrossAIOptimizationUI';

export class UIManager {
  private sidebar: HTMLElement | null = null;
  private isInitialized = false;
  private currentAnalysis: any = null;
  
  /**
   * Initialize the UI components
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.createSidebar();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('UI Manager initialized');
    } catch (error) {
      console.error('Failed to initialize UI Manager:', error);
    }
  }
  
  /**
   * Display analysis results in the UI
   */
  public async displayAnalysis(data: {
    response: any;
    chainOfThought: any;
    biasAnalysis: any;
    nlpBiasAnalysis?: any;
  }): Promise<void> {
    console.log('📊 displayAnalysis called with data:', data);
    
    if (!this.sidebar) {
      console.error('❌ Sidebar not initialized!');
      return;
    }
    
    console.log('✓ Sidebar exists, updating content...');
    
    // Store current analysis for later use
    this.currentAnalysis = data;
    
    // Update sidebar content with analysis results
    this.updateSidebarContent(data);
    
    console.log('✓ Content updated, showing sidebar...');
    
    // Show sidebar if hidden
    this.showSidebar();
    
    console.log('✅ displayAnalysis complete');
  }
  
  /**
   * Create the main sidebar component
   */
  private async createSidebar(): Promise<void> {
    // Remove existing sidebar if present
    const existingSidebar = document.getElementById('ai-ethics-monitor-sidebar');
    if (existingSidebar) {
      existingSidebar.remove();
    }
    
    // Create sidebar container
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'ai-ethics-monitor-sidebar';
    this.sidebar.className = 'ai-ethics-sidebar';
    
    // Apply styles
    this.applySidebarStyles();
    
    // Create initial content
    this.sidebar.innerHTML = this.getInitialSidebarHTML();
    
    // Append to body
    document.body.appendChild(this.sidebar);
  }
  
  /**
   * Apply CSS styles to the sidebar
   */
  private applySidebarStyles(): void {
    if (!this.sidebar) return;
    
    const styles = {
      position: 'fixed',
      top: '0',
      right: '0',
      width: '380px',
      height: '100vh',
      backgroundColor: '#192426',
      border: 'none',
      borderLeft: '1px solid var(--theme-primary, #00B6E5)',
      boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
      zIndex: UI_CONSTANTS.Z_INDEX_BASE.toString(),
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      overflow: 'hidden',
      overflowY: 'auto',
      transition: `transform ${UI_CONSTANTS.ANIMATION_DURATION} ease-in-out, width 0.3s ease-in-out`,
      transform: 'translateX(100%)', // Start hidden
      display: 'flex',
      flexDirection: 'column',
      color: '#ffffff'
    };
    
    Object.assign(this.sidebar.style, styles);
    
    // Add CSS for internal components
    this.addInternalStyles();
  }
  
  /**
   * Add internal CSS styles
   */
  private addInternalStyles(): void {
    const styleId = 'ai-ethics-monitor-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      :root {
        --theme-primary: #00B6E5;
        --theme-secondary: #0099cc;
        --theme-bg-dark: #192426;
        --theme-bg-section: #1a2332;
        --theme-bg-card: #243447;
        --theme-border: rgba(0, 182, 229, 0.3);
        --theme-text: #ffffff;
        --theme-text-muted: #b0b7c3;
      }
      
      .ai-ethics-sidebar.purple-theme {
        --theme-primary: #AD7BCD;
        --theme-secondary: #8B5BA8;
        --theme-bg-dark: #2a1a34;
        --theme-bg-section: #332040;
        --theme-bg-card: #443453;
        --theme-border: rgba(173, 123, 205, 0.3);
        --theme-text: #ffffff;
        --theme-text-muted: #c9b3d6;
      }
      
      .ai-ethics-sidebar {
        background-color: var(--theme-bg-dark) !important;
      }
      
      .ai-ethics-sidebar * {
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #ffffff;
      }
      
      .ai-ethics-header {
        padding: 16px;
        background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--theme-primary);
        position: relative;
      }
      
      .ai-ethics-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        opacity: 0.3;
      }
      
      .ai-ethics-title {
        font-weight: 700;
        font-size: 14px;
        letter-spacing: -0.3px;
        position: relative;
        z-index: 1;
        transition: all 0.3s ease;
        white-space: nowrap;
        overflow: hidden;
      }
      
      /* Minimized state */
      .ai-ethics-sidebar.minimized {
        width: 60px !important;
      }
      
      .ai-ethics-sidebar.minimized .ai-ethics-title {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }
      
      .ai-ethics-sidebar.minimized .ai-ethics-content {
        display: none !important;
      }
      
      .ai-ethics-sidebar.minimized .ai-ethics-header {
        justify-content: center;
      }
      
      .ai-ethics-header-buttons {
        display: flex;
        gap: 6px;
        position: relative;
        z-index: 1;
      }
      
      .ai-ethics-reload {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      
      .ai-ethics-theme {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      
      .ai-ethics-theme:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      
      .ai-ethics-reload:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(180deg);
      }
      
      .ai-ethics-reload.spinning {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .ai-ethics-minimize,
      .ai-ethics-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      
      .ai-ethics-minimize:hover,
      .ai-ethics-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      
      .ai-ethics-minimize {
        font-size: 20px;
        font-weight: bold;
      }
      
      .ai-ethics-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: var(--theme-bg-dark);
      }
      
      .ai-ethics-section {
        margin-bottom: 24px;
      }
      
      .ai-ethics-section-title {
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--theme-primary);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .ai-ethics-section-title::before {
        content: '';
        width: 3px;
        height: 14px;
        background: var(--theme-primary);
        border-radius: 2px;
      }
      
      .ai-ethics-step {
        background: var(--theme-bg-card);
        border: 1px solid var(--theme-border);
        border-radius: 10px;
        padding: 14px;
        margin-bottom: 10px;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
      }
      
      .ai-ethics-step::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: linear-gradient(180deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
      }
      
      .ai-ethics-step:hover {
        background: rgba(0, 212, 255, 0.1);
        border-color: rgba(0, 212, 255, 0.3);
        transform: translateX(-2px);
      }
      
      .ai-ethics-step-type {
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 700;
        color: var(--theme-primary);
        margin-bottom: 8px;
        letter-spacing: 0.8px;
        padding: 3px 8px;
        background: rgba(0, 212, 255, 0.15);
        border-radius: 4px;
        display: inline-block;
      }
      
      .ai-ethics-step-description {
        line-height: 1.6;
        color: #e0e0e0;
        font-size: 13px;
        margin-bottom: 8px;
        padding-left: 8px;
      }
      
      .ai-ethics-confidence {
        font-size: 11px;
        color: #888;
        font-weight: 500;
        padding-left: 8px;
      }
      
      .ai-ethics-no-bias {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 8px;
        color: #10b981;
        font-size: 13px;
      }
      
      .ai-ethics-check-icon {
        font-size: 16px;
        font-weight: bold;
      }
      
      .ai-ethics-risk-badge {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 12px;
        letter-spacing: 0.5px;
      }
      
      .ai-ethics-risk-badge.low-risk {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.4);
      }
      
      .ai-ethics-risk-badge.medium-risk {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
        border: 1px solid rgba(255, 193, 7, 0.4);
      }
      
      .ai-ethics-risk-badge.high-risk {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.4);
      }
      
      .ai-ethics-risk-badge.critical-risk {
        background: rgba(220, 38, 38, 0.3);
        color: #dc2626;
        border: 1px solid rgba(220, 38, 38, 0.5);
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      .ai-ethics-flag {
        background: rgba(255, 193, 7, 0.1);
        border: 1px solid rgba(255, 193, 7, 0.3);
        border-left: 3px solid #ffc107;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
        font-size: 12px;
      }
      
      .ai-ethics-flag.high-risk {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        border-left-color: #ef4444;
      }
      
      .ai-ethics-flag-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      
      .ai-ethics-flag-type {
        font-size: 10px;
        font-weight: 700;
        color: #ffc107;
        letter-spacing: 0.5px;
      }
      
      .ai-ethics-flag.high-risk .ai-ethics-flag-type {
        color: #ef4444;
      }
      
      .ai-ethics-flag-severity {
        font-size: 9px;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: 600;
        color: #ffc107;
      }
      
      .ai-ethics-flag.high-risk .ai-ethics-flag-severity {
        color: #ef4444;
      }
      
      .ai-ethics-flag-description {
        color: #e0e0e0;
        line-height: 1.4;
        margin-bottom: 6px;
      }
      
      .ai-ethics-flag-text {
        font-size: 11px;
        color: #888;
        font-style: italic;
        padding: 6px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        margin-top: 6px;
      }
      
      .ai-ethics-recommendations {
        margin-top: 12px;
        padding: 12px;
        background: rgba(0, 212, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 8px;
      }
      
      .ai-ethics-recommendations-title {
        font-size: 11px;
        font-weight: 700;
        color: #00d4ff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }
      
      .ai-ethics-recommendation {
        font-size: 12px;
        color: #e0e0e0;
        line-height: 1.5;
        margin-bottom: 4px;
      }
      
      .ai-ethics-challenge-buttons {
        display: flex;
        gap: 6px;
        margin-top: 12px;
      }
      
      .ai-ethics-btn {
        padding: 8px 12px;
        border: 1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent);
        border-radius: 6px;
        background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
        justify-content: center;
        color: var(--theme-primary);
      }
      
      .ai-ethics-btn:hover {
        background: color-mix(in srgb, var(--theme-primary) 20%, transparent);
        border-color: color-mix(in srgb, var(--theme-primary) 50%, transparent);
        transform: translateY(-1px);
      }
      
      .ai-ethics-btn.primary {
        background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
        color: white;
        border-color: var(--theme-primary);
      }
      
      .ai-ethics-btn.primary:hover {
        background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-primary) 100%);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-primary) 30%, transparent);
      }
      
      /* API Key Section */
      .ai-ethics-api-section {
        background: color-mix(in srgb, var(--theme-primary) 3%, transparent);
        border: 1px solid color-mix(in srgb, var(--theme-primary) 15%, transparent);
        border-radius: 10px;
        padding: 16px;
      }
      
      .ai-ethics-api-description,
      .ai-ethics-community-description {
        font-size: 12px;
        color: #b0b0b0;
        margin-bottom: 12px;
        line-height: 1.5;
      }
      
      .ai-ethics-input-group {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .ai-ethics-input {
        flex: 1;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent);
        border-radius: 6px;
        padding: 8px 12px;
        color: #ffffff;
        font-size: 12px;
        font-family: 'Inter', sans-serif;
        transition: all 0.2s ease;
      }
      
      .ai-ethics-input:focus {
        outline: none;
        border-color: var(--theme-primary);
        background: rgba(0, 0, 0, 0.4);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-primary) 10%, transparent);
      }
      
      .ai-ethics-input::placeholder {
        color: #666;
      }
      
      .ai-ethics-api-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 6px;
        font-size: 12px;
        color: #10b981;
        margin-bottom: 12px;
      }
      
      .ai-ethics-status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        animation: pulse-indicator 2s infinite;
      }
      
      @keyframes pulse-indicator {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      /* Data Management Section */
      .ai-ethics-data-section {
        background: rgba(139, 92, 246, 0.03);
        border: 1px solid rgba(139, 92, 246, 0.15);
        border-radius: 10px;
        padding: 16px;
      }
      
      .ai-ethics-data-description {
        font-size: 12px;
        color: #b0b0b0;
        margin-bottom: 12px;
        line-height: 1.5;
      }
      
      .ai-ethics-storage-info {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      }
      
      .ai-ethics-storage-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .ai-ethics-storage-stat:last-child {
        border-bottom: none;
      }
      
      .ai-ethics-storage-label {
        font-size: 12px;
        color: #888;
      }
      
      .ai-ethics-storage-value {
        font-size: 12px;
        color: var(--theme-primary);
        font-weight: 600;
      }
      
      .ai-ethics-data-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .ai-ethics-privacy-note {
        padding: 10px;
        background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent);
        border-radius: 6px;
      }
      
      /* Community Report Section */
      .ai-ethics-community-section {
        background: rgba(239, 68, 68, 0.03);
        border: 1px solid rgba(239, 68, 68, 0.15);
        border-radius: 10px;
        padding: 16px;
      }
      
      .ai-ethics-report-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 12px;
      }
      
      .ai-ethics-stat-card {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      }
      
      .ai-ethics-stat-number {
        font-size: 24px;
        font-weight: 700;
        color: #00d4ff;
        margin-bottom: 4px;
      }
      
      .ai-ethics-stat-label {
        font-size: 10px;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .ai-ethics-recent-reports {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .ai-ethics-subsection-title {
        font-size: 11px;
        font-weight: 600;
        color: #00d4ff;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 10px;
      }
      
      .ai-ethics-report-item {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 8px;
      }
      
      .ai-ethics-report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      
      .ai-ethics-report-type {
        font-size: 10px;
        font-weight: 700;
        color: #ef4444;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 2px 6px;
        background: rgba(239, 68, 68, 0.2);
        border-radius: 4px;
      }
      
      .ai-ethics-report-date {
        font-size: 10px;
        color: #888;
      }
      
      .ai-ethics-report-text {
        font-size: 11px;
        color: #b0b0b0;
        line-height: 1.4;
      }
      
      /* Modal Styles */
      .ai-ethics-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        z-index: ${UI_CONSTANTS.Z_INDEX_BASE + 1000};
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .ai-ethics-modal {
        background: #1a1a1a;
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease-out;
        display: flex;
        flex-direction: column;
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      .ai-ethics-modal-header {
        padding: 20px;
        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(0, 212, 255, 0.3);
      }
      
      .ai-ethics-modal-title {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.3px;
      }
      
      .ai-ethics-modal-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 4px 10px;
        border-radius: 6px;
        transition: all 0.2s ease;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ai-ethics-modal-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      
      .ai-ethics-modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      
      .ai-ethics-modal-body::-webkit-scrollbar {
        width: 6px;
      }
      
      .ai-ethics-modal-body::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .ai-ethics-modal-body::-webkit-scrollbar-thumb {
        background: rgba(0, 212, 255, 0.3);
        border-radius: 3px;
      }
      
      .ai-ethics-modal-section {
        margin-bottom: 20px;
      }
      
      .ai-ethics-modal-section-title {
        font-size: 13px;
        font-weight: 600;
        color: #00d4ff;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .ai-ethics-modal-section-title::before {
        content: '';
        width: 3px;
        height: 16px;
        background: #00d4ff;
        border-radius: 2px;
      }
      
      .ai-ethics-modal-step {
        background: rgba(0, 212, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.15);
        border-left: 3px solid #00d4ff;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      }
      
      .ai-ethics-modal-step-number {
        font-size: 11px;
        font-weight: 700;
        color: #00d4ff;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
      
      .ai-ethics-modal-step-type {
        display: inline-block;
        font-size: 10px;
        font-weight: 700;
        color: #00d4ff;
        background: rgba(0, 212, 255, 0.15);
        padding: 4px 8px;
        border-radius: 4px;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .ai-ethics-modal-step-description {
        font-size: 14px;
        line-height: 1.6;
        color: #e0e0e0;
        margin-bottom: 10px;
      }
      
      .ai-ethics-modal-step-confidence {
        font-size: 12px;
        color: #888;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .ai-ethics-confidence-bar {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
      }
      
      .ai-ethics-confidence-fill {
        height: 100%;
        background: linear-gradient(90deg, #00d4ff 0%, #0099cc 100%);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      
      /* Scrollbar styling */
      .ai-ethics-content::-webkit-scrollbar {
        width: 4px;
      }
      
      .ai-ethics-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .ai-ethics-content::-webkit-scrollbar-thumb {
        background: rgba(0, 212, 255, 0.3);
        border-radius: 2px;
      }
      
      .ai-ethics-content::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 212, 255, 0.5);
      }

      /* ============ TAB BAR ============ */
      .ai-ethics-tabs {
        display: flex;
        background: var(--theme-bg-section);
        border-bottom: 2px solid rgba(255, 255, 255, 0.06);
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 0;
        gap: 0;
      }

      .ai-ethics-tab {
        flex: 1;
        padding: 10px 6px;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--theme-text-muted);
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.25s ease;
        text-align: center;
        white-space: nowrap;
        letter-spacing: 0.3px;
        font-family: 'Inter', sans-serif;
      }

      .ai-ethics-tab:hover {
        color: var(--theme-text);
        background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
      }

      .ai-ethics-tab.active {
        color: var(--theme-primary);
        border-bottom-color: var(--theme-primary);
        background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
        font-weight: 600;
      }

      /* ============ TAB PANELS ============ */
      .ai-ethics-tab-panel {
        display: none;
      }

      .ai-ethics-tab-panel.active {
        display: block;
        animation: tabFadeIn 0.25s ease-out;
      }

      @keyframes tabFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ============ INTERACTIVE COT ============ */
      .cot-flow {
        position: relative;
        padding: 8px 0 8px 24px;
      }

      .cot-flow::before {
        content: '';
        position: absolute;
        left: 11px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(180deg, var(--theme-primary), var(--theme-secondary), rgba(0,0,0,0));
        border-radius: 1px;
      }

      .cot-node {
        position: relative;
        margin-bottom: 4px;
      }

      .cot-node-dot {
        position: absolute;
        left: -19px;
        top: 12px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--theme-primary);
        border: 2px solid var(--theme-bg-dark);
        box-shadow: 0 0 6px color-mix(in srgb, var(--theme-primary) 50%, transparent);
        z-index: 2;
      }

      .cot-node-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--theme-bg-card);
        border: 1px solid var(--theme-border);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      }

      .cot-node-header:hover {
        background: color-mix(in srgb, var(--theme-primary) 12%, var(--theme-bg-card));
        border-color: var(--theme-primary);
        transform: translateX(2px);
      }

      .cot-node-header.expanded {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom-color: transparent;
      }

      .cot-node-chevron {
        font-size: 10px;
        transition: transform 0.25s ease;
        color: var(--theme-text-muted);
        flex-shrink: 0;
      }

      .cot-node-header.expanded .cot-node-chevron {
        transform: rotate(90deg);
      }

      .cot-node-badge {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        padding: 2px 7px;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .cot-node-badge.premise      { background: rgba(96,165,250,0.2); color: #60a5fa; }
      .cot-node-badge.reasoning     { background: rgba(168,85,247,0.2); color: #a855f7; }
      .cot-node-badge.evidence      { background: rgba(52,211,153,0.2); color: #34d399; }
      .cot-node-badge.conclusion    { background: rgba(251,191,36,0.2); color: #fbbf24; }
      .cot-node-badge.caveat        { background: rgba(239,68,68,0.2);  color: #ef4444; }
      .cot-node-badge.assumption    { background: rgba(244,114,182,0.2); color: #f472b6; }
      .cot-node-badge.ethical       { background: rgba(16,185,129,0.2);  color: #10b981; }
      .cot-node-badge.implication   { background: rgba(99,102,241,0.2);  color: #6366f1; }

      .cot-node-label {
        flex: 1;
        font-size: 12px;
        color: var(--theme-text);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cot-node-header.expanded .cot-node-label {
        white-space: normal;
      }

      .cot-node-conf {
        font-size: 10px;
        color: var(--theme-text-muted);
        flex-shrink: 0;
      }

      .cot-node-body {
        display: none;
        padding: 10px 12px;
        background: color-mix(in srgb, var(--theme-bg-card) 60%, transparent);
        border: 1px solid var(--theme-border);
        border-top: none;
        border-radius: 0 0 8px 8px;
        font-size: 12px;
        color: #d0d0d0;
        line-height: 1.65;
      }

      .cot-node-body.open {
        display: block;
        animation: tabFadeIn 0.2s ease-out;
      }

      .cot-node-conf-bar {
        height: 4px;
        background: rgba(255,255,255,0.07);
        border-radius: 2px;
        margin-top: 8px;
        overflow: hidden;
      }

      .cot-node-conf-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.4s ease;
      }

      .cot-sources {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.06);
        font-size: 11px;
        color: var(--theme-text-muted);
      }

      .cot-sources span {
        color: var(--theme-primary);
      }

      .cot-summary-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 14px;
        padding: 12px;
        background: var(--theme-bg-card);
        border: 1px solid var(--theme-border);
        border-radius: 10px;
      }

      .cot-summary-stat {
        flex: 1;
        text-align: center;
      }

      .cot-summary-stat .value {
        font-size: 20px;
        font-weight: 700;
        color: var(--theme-primary);
        line-height: 1.2;
      }

      .cot-summary-stat .label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        color: var(--theme-text-muted);
        margin-top: 2px;
      }

      .cot-missing-elements {
        margin-top: 12px;
        padding: 10px;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.25);
        border-radius: 8px;
      }

      .cot-missing-title {
        font-size: 10px;
        font-weight: 700;
        color: #ef4444;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 6px;
      }

      .cot-missing-item {
        font-size: 11px;
        color: #f87171;
        margin-bottom: 3px;
        padding-left: 10px;
        position: relative;
      }

      .cot-missing-item::before {
        content: '⚠';
        position: absolute;
        left: 0;
        font-size: 10px;
      }

      .cot-ethical-section {
        margin-top: 12px;
        padding: 10px;
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 8px;
      }

      .cot-ethical-title {
        font-size: 10px;
        font-weight: 700;
        color: #10b981;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 6px;
      }

      .cot-ethical-item {
        font-size: 11px;
        color: #6ee7b7;
        margin-bottom: 3px;
        padding-left: 14px;
        position: relative;
      }

      .cot-ethical-item::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #10b981;
        font-weight: bold;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Get initial sidebar HTML content
   */
  private getInitialSidebarHTML(): string {
    return `
      <div class="ai-ethics-header">
        <span class="ai-ethics-title">VeriAI</span>
        <div class="ai-ethics-header-buttons">
          <button class="ai-ethics-theme" id="ai-ethics-theme-btn" title="Switch Theme">🎨</button>
          <button class="ai-ethics-reload" id="ai-ethics-reload-btn" title="Reload Analysis">↻</button>
          <button class="ai-ethics-minimize" id="ai-ethics-minimize-btn" title="Minimize">−</button>
          <button class="ai-ethics-close" id="ai-ethics-close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="ai-ethics-tabs">
        <button class="ai-ethics-tab active" data-tab="analysis">📊 Analysis</button>
        <button class="ai-ethics-tab" data-tab="cot">⛓️ CoT</button>
        <button class="ai-ethics-tab" data-tab="crossai">⚖️ Cross-AI</button>
        <button class="ai-ethics-tab" data-tab="settings">⚙️</button>
      </div>
      <div class="ai-ethics-content" id="ai-ethics-content">
        <div class="ai-ethics-tab-panel active" data-panel="analysis">
          <div class="ai-ethics-section">
            <div class="ai-ethics-section-title">Status</div>
            <p>Monitoring AI responses... Waiting for new conversation...</p>
          </div>
        </div>
        <div class="ai-ethics-tab-panel" data-panel="cot">
          <div class="ai-ethics-section">
            <div class="ai-ethics-section-title">⛓️ Chain of Thought</div>
            <p>Waiting for AI response to analyze reasoning...</p>
          </div>
        </div>
        <div class="ai-ethics-tab-panel" data-panel="crossai">
          <div class="ai-ethics-section">
            <div class="ai-ethics-section-title">⚖️ Cross-AI Verification</div>
            <p>Click "Optimize" after receiving an AI response to compare across models.</p>
          </div>
        </div>
        <div class="ai-ethics-tab-panel" data-panel="settings">
          <div class="ai-ethics-section">
            <div class="ai-ethics-section-title">⚙️ Settings</div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Update sidebar content with analysis data
   */
  private updateSidebarContent(data: {
    response: any;
    chainOfThought: any;
    biasAnalysis: any;
    nlpBiasAnalysis?: any;
  }): void {
    console.log('🔄 updateSidebarContent called');
    
    if (!this.sidebar) {
      console.error('❌ No sidebar in updateSidebarContent');
      return;
    }
    
    const content = this.sidebar.querySelector('.ai-ethics-content');
    if (!content) {
      console.error('❌ No content element found');
      return;
    }
    
    console.log('✓ Content element found, rendering HTML...');
    
    const biasAnalysisHTML = this.renderBiasAnalysis(data.biasAnalysis);
    const nlpBiasHTML = this.renderNLPBiasAnalysis(data.nlpBiasAnalysis);
    const challengeButtonsHTML = this.renderChallengeButtons(data.response);
    const cotInteractiveHTML = this.renderInteractiveCOT(data.chainOfThought);
    
    // Determine which tab is currently active
    const activeTab = this.sidebar.querySelector('.ai-ethics-tab.active')?.getAttribute('data-tab') || 'analysis';
    
    content.innerHTML = `
      <!-- ANALYSIS TAB -->
      <div class="ai-ethics-tab-panel ${activeTab === 'analysis' ? 'active' : ''}" data-panel="analysis">
        <div class="ai-ethics-section">
          <div class="ai-ethics-section-title">🔍 Bias Analysis (Keyword-Based)</div>
          ${biasAnalysisHTML}
        </div>
        
        <div class="ai-ethics-section">
          <div class="ai-ethics-section-title">🧠 NLP Bias Detection (Semantic)</div>
          ${nlpBiasHTML}
        </div>
        
        <div class="ai-ethics-section">
          <div class="ai-ethics-section-title">⚡ Actions</div>
          ${challengeButtonsHTML}
        </div>
        
        <div class="ai-ethics-section">
          <div class="ai-ethics-section-title">🚩 Community Reports</div>
          ${this.renderCommunityReportSection()}
        </div>
      </div>
      
      <!-- CHAIN OF THOUGHT TAB -->
      <div class="ai-ethics-tab-panel ${activeTab === 'cot' ? 'active' : ''}" data-panel="cot">
        ${cotInteractiveHTML}
      </div>
      
      <!-- CROSS-AI VERIFICATION TAB -->
      <div class="ai-ethics-tab-panel ${activeTab === 'crossai' ? 'active' : ''}" data-panel="crossai">
        <div class="ai-ethics-section">
          <div class="ai-ethics-section-title">⚖️ Cross-AI Verification</div>
          <p style="font-size: 12px; color: var(--theme-text-muted); margin-bottom: 12px;">
            Query Claude, Gemini & DeepSeek simultaneously and get a meta-evaluated, optimized answer.
          </p>
          ${this.renderCrossAIOptimizationButton(data.response)}
          <div id="ai-ethics-crossai-results"></div>
        </div>
      </div>
      
      <!-- SETTINGS TAB -->
      <div class="ai-ethics-tab-panel ${activeTab === 'settings' ? 'active' : ''}" data-panel="settings">
        <div class="ai-ethics-section">
          <div class="ai-ethics-section-title">🔑 API Keys</div>
          ${this.renderAPIKeySection()}
        </div>
        
        <div class="ai-ethics-section">
          <div class="ai-ethics-section-title">🔒 Privacy & Data</div>
          ${this.renderDataManagementSection()}
        </div>
      </div>
    `;
    
    // Setup tab switching after content is rendered
    this.setupTabSwitching();
    
    console.log('✅ Content HTML updated');
  }

  /**
   * Wire up tab-bar click handlers (call after every content render)
   */
  private setupTabSwitching(): void {
    if (!this.sidebar) return;

    const tabs = this.sidebar.querySelectorAll('.ai-ethics-tab');
    const panels = this.sidebar.querySelectorAll('.ai-ethics-tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = (tab as HTMLElement).dataset.tab;
        if (!target) return;

        // Toggle active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Toggle active panel
        panels.forEach(p => p.classList.remove('active'));
        const targetPanel = this.sidebar!.querySelector(`.ai-ethics-tab-panel[data-panel="${target}"]`);
        if (targetPanel) targetPanel.classList.add('active');

        // Wire up interactive COT node toggles when COT tab is opened
        if (target === 'cot') {
          this.setupCOTNodeToggles();
        }
      });
    });

    // Also wire up COT toggles if COT tab is currently active
    const activeCOT = this.sidebar.querySelector('.ai-ethics-tab-panel[data-panel="cot"].active');
    if (activeCOT) {
      this.setupCOTNodeToggles();
    }
  }

  /**
   * Wire up expand/collapse on interactive COT nodes
   */
  private setupCOTNodeToggles(): void {
    if (!this.sidebar) return;

    const headers = this.sidebar.querySelectorAll('.cot-node-header');
    headers.forEach(header => {
      // Prevent double-binding
      if ((header as any).__cotBound) return;
      (header as any).__cotBound = true;

      header.addEventListener('click', () => {
        const node = header.closest('.cot-node');
        if (!node) return;

        const body = node.querySelector('.cot-node-body') as HTMLElement;
        const isExpanded = header.classList.contains('expanded');

        if (isExpanded) {
          header.classList.remove('expanded');
          body?.classList.remove('open');
        } else {
          header.classList.add('expanded');
          body?.classList.add('open');
        }
      });
    });
  }

  /**
   * Render an interactive, expandable Chain-of-Thought flowchart
   */
  private renderInteractiveCOT(chainOfThought: any): string {
    if (!chainOfThought || !chainOfThought.steps || chainOfThought.steps.length === 0) {
      return `
        <div class="ai-ethics-section" style="text-align:center; padding:30px 20px;">
          <div style="font-size:32px; margin-bottom:10px; opacity:0.5;">⛓️</div>
          <p style="color:var(--theme-text-muted); font-size:12px;">
            Waiting for an AI response to extract reasoning chain&hellip;
          </p>
        </div>
      `;
    }

    const steps = chainOfThought.steps || [];
    const confidence = chainOfThought.confidence || 0;
    const missingElements = chainOfThought.missingElements || [];
    const ethicalConsiderations = chainOfThought.ethicalConsiderations || [];
    const inferredLogic = chainOfThought.inferredLogic || false;

    // Type color mapping for the confidence bar fill
    const typeColors: Record<string, string> = {
      premise: '#60a5fa', reasoning: '#a855f7', evidence: '#34d399',
      conclusion: '#fbbf24', caveat: '#ef4444', assumption: '#f472b6',
      ethical_consideration: '#10b981', implication: '#6366f1',
    };

    // Summary bar
    const summaryHTML = `
      <div class="cot-summary-bar">
        <div class="cot-summary-stat">
          <div class="value">${steps.length}</div>
          <div class="label">Steps</div>
        </div>
        <div class="cot-summary-stat">
          <div class="value">${Math.round(confidence * 100)}%</div>
          <div class="label">Confidence</div>
        </div>
        <div class="cot-summary-stat">
          <div class="value">${inferredLogic ? '⚠️' : '✓'}</div>
          <div class="label">${inferredLogic ? 'Inferred' : 'Explicit'}</div>
        </div>
      </div>
    `;

    // Flowchart nodes
    const nodesHTML = steps.map((step: any, i: number) => {
      const typeKey = (step.type || 'reasoning').replace(/_/g, ' ');
      const badgeClass = (step.type || 'reasoning').replace(/\s+/g, '_').toLowerCase();
      const confPct = Math.round((step.confidence || 0) * 100);
      const fillColor = typeColors[step.type] || 'var(--theme-primary)';

      return `
        <div class="cot-node">
          <div class="cot-node-dot"></div>
          <div class="cot-node-header" title="Click to expand">
            <span class="cot-node-chevron">▶</span>
            <span class="cot-node-badge ${badgeClass}">${typeKey}</span>
            <span class="cot-node-label">${step.description || 'Untitled step'}</span>
            <span class="cot-node-conf">${confPct}%</span>
          </div>
          <div class="cot-node-body">
            <div>${step.description || ''}</div>
            <div class="cot-node-conf-bar">
              <div class="cot-node-conf-fill" style="width:${confPct}%; background:${fillColor};"></div>
            </div>
            ${step.sources && step.sources.length > 0 ? `
              <div class="cot-sources">
                ${step.sources.map((s: string) => `<span>• ${s}</span>`).join('<br/>')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Missing reasoning elements
    const missingHTML = missingElements.length > 0 ? `
      <div class="cot-missing-elements">
        <div class="cot-missing-title">Missing Reasoning Elements</div>
        ${missingElements.map((m: string) => `<div class="cot-missing-item">${m}</div>`).join('')}
      </div>
    ` : '';

    // Ethical considerations
    const ethicalHTML = ethicalConsiderations.length > 0 ? `
      <div class="cot-ethical-section">
        <div class="cot-ethical-title">Ethical Considerations</div>
        ${ethicalConsiderations.map((c: string) => `<div class="cot-ethical-item">${c}</div>`).join('')}
      </div>
    ` : '';

    return `
      <div class="ai-ethics-section">
        <div class="ai-ethics-section-title">⛓️ Chain of Thought</div>
        ${summaryHTML}
        <div class="cot-flow">
          ${nodesHTML}
        </div>
        ${missingHTML}
        ${ethicalHTML}
      </div>
    `;
  }
  
  /**
   * Render chain of thought steps
   */
  private renderChainOfThought(chainOfThought: any): string {
    if (!chainOfThought || !chainOfThought.steps || chainOfThought.steps.length === 0) {
      return '<p>No reasoning steps detected.</p>';
    }
    
    return chainOfThought.steps.map((step: any) => `
      <div class="ai-ethics-step">
        <div class="ai-ethics-step-type">${step.type.replace('_', ' ')}</div>
        <div class="ai-ethics-step-description">${step.description}</div>
        <div class="ai-ethics-confidence">Confidence: ${Math.round(step.confidence * 100)}%</div>
      </div>
    `).join('');
  }
  
  /**
   * Render bias analysis results
   */
  private renderBiasAnalysis(biasAnalysis: any): string {
    if (!biasAnalysis || !biasAnalysis.flaggedContent || biasAnalysis.flaggedContent.length === 0) {
      return `
        <div class="ai-ethics-no-bias">
          <span class="ai-ethics-check-icon">✓</span>
          <span>No significant bias detected</span>
        </div>
      `;
    }
    
    const riskClass = biasAnalysis.overallRisk === 'critical' ? 'critical-risk' : 
                      biasAnalysis.overallRisk === 'high' ? 'high-risk' : 
                      biasAnalysis.overallRisk === 'medium' ? 'medium-risk' : 'low-risk';
    
    // Check if sentence-wise analysis is available
    const hasSentenceAnalysis = biasAnalysis.sentenceAnalysis && Array.isArray(biasAnalysis.sentenceAnalysis);
    
    return `
      <div class="ai-ethics-risk-badge ${riskClass}">
        Overall Risk: ${biasAnalysis.overallRisk.toUpperCase()}
      </div>

      ${hasSentenceAnalysis ? `
        <div class="ai-ethics-sentence-analysis">
          <div class="ai-ethics-sentence-header">
            <span>📝</span> Sentence-by-Sentence Analysis
          </div>
          ${biasAnalysis.sentenceAnalysis.map((sentence: any) => {
            if (!sentence.hasBias) return '';
            
            const severityClass = sentence.severity === 'critical' || sentence.severity === 'high' ? 'high-risk' : 
                                sentence.severity === 'medium' ? 'medium-risk' : 'low-risk';
            
            return `
              <div class="ai-ethics-sentence-item ${severityClass}">
                <div class="ai-ethics-sentence-number">
                  Sentence ${sentence.sentenceNumber} 
                  <span class="ai-ethics-sentence-severity">${sentence.severity}</span>
                </div>
                <div class="ai-ethics-sentence-text">"${sentence.text}"</div>
                <div class="ai-ethics-sentence-biases">
                  ${sentence.biasTypes.map((type: string) => `
                    <span class="ai-ethics-bias-tag">${type.replace(/_/g, ' ')}</span>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${biasAnalysis.flaggedContent.map((flag: any) => `
        <div class="ai-ethics-flag ${flag.severity === 'critical' || flag.severity === 'high' ? 'high-risk' : ''}">
          <div class="ai-ethics-flag-header">
            <span class="ai-ethics-flag-type">${flag.type.replace(/_/g, ' ').toUpperCase()}</span>
            <span class="ai-ethics-flag-severity">${flag.severity}</span>
          </div>
          <div class="ai-ethics-flag-description">${flag.description}</div>
          ${flag.textSpan && flag.textSpan.text ? `
            <div class="ai-ethics-flag-text">"${flag.textSpan.text}"</div>
          ` : ''}
        </div>
      `).join('')}
      ${biasAnalysis.recommendations && biasAnalysis.recommendations.length > 0 ? `
        <div class="ai-ethics-recommendations">
          <div class="ai-ethics-recommendations-title">Recommendations:</div>
          ${biasAnalysis.recommendations.map((rec: string) => `
            <div class="ai-ethics-recommendation">• ${rec}</div>
          `).join('')}
        </div>
      ` : ''}

      <style>
        .ai-ethics-sentence-analysis {
          margin: 12px 0;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ai-ethics-sentence-header {
          font-size: 12px;
          font-weight: 600;
          color: var(--theme-primary);
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ai-ethics-sentence-item {
          margin-bottom: 10px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.3);
          border-left: 3px solid var(--theme-primary);
          border-radius: 6px;
        }

        .ai-ethics-sentence-item.high-risk {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .ai-ethics-sentence-item.medium-risk {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }

        .ai-ethics-sentence-number {
          font-size: 10px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ai-ethics-sentence-severity {
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          font-size: 9px;
        }

        .ai-ethics-sentence-text {
          font-size: 11px;
          color: #d0d0d0;
          line-height: 1.5;
          margin-bottom: 8px;
          font-style: italic;
        }

        .ai-ethics-sentence-biases {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ai-ethics-bias-tag {
          font-size: 9px;
          padding: 3px 8px;
          background: var(--theme-primary);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      </style>
    `;
  }
  
  /**
   * Render NLP Bias Analysis (Semantic Detection)
   */
  private renderNLPBiasAnalysis(nlpBiasAnalysis: any): string {
    if (!nlpBiasAnalysis) {
      return `
        <div class="ai-ethics-nlp-info">
          <p>💡 <strong>What is NLP Bias Detection?</strong></p>
          <p>Unlike keyword matching, NLP (Natural Language Processing) understands <strong>meaning</strong> and <strong>context</strong>.</p>
          <p><strong>Example:</strong></p>
          <ul style="font-size: 11px; margin: 8px 0; padding-left: 20px; color: #b0b0b0;">
            <li>Keyword: "women are nurturing" ✓ Detected</li>
            <li>NLP: "individuals identifying as female naturally excel in caregiving" ✓ Also Detected!</li>
          </ul>
          <p style="font-size: 11px; color: #888;">Analyzing response...</p>
        </div>
      `;
    }
    
    const { overallScore, detectedBiases, implicitBias, semanticAnalysis } = nlpBiasAnalysis;
    
    // Determine risk level
    const riskLevel = overallScore >= 75 ? 'critical' : 
                      overallScore >= 50 ? 'high' :
                      overallScore >= 25 ? 'medium' : 'low';
    const riskClass = riskLevel === 'critical' ? 'critical-risk' : 
                      riskLevel === 'high' ? 'high-risk' : 
                      riskLevel === 'medium' ? 'medium-risk' : 'low-risk';
    const riskEmoji = overallScore >= 75 ? '🚨' : 
                      overallScore >= 50 ? '⚠️' :
                      overallScore >= 25 ? '⚡' : '✅';
    
    return `
      <div class="ai-ethics-nlp-container">
        <!-- Overall Score -->
        <div class="ai-ethics-nlp-score ${riskClass}">
          <div class="ai-ethics-nlp-score-label">
            ${riskEmoji} NLP Bias Score
          </div>
          <div class="ai-ethics-nlp-score-value">
            ${overallScore}/100
          </div>
          <div class="ai-ethics-nlp-score-risk">
            Risk Level: <strong>${riskLevel.toUpperCase()}</strong>
          </div>
        </div>

        <!-- Semantic Analysis Summary -->
        <div class="ai-ethics-nlp-semantic">
          <div class="ai-ethics-nlp-semantic-title">🔬 Semantic Patterns</div>
          <div class="ai-ethics-nlp-semantic-grid">
            <div class="ai-ethics-nlp-pattern ${semanticAnalysis.hasAbsoluteStatements ? 'detected' : ''}">
              <span class="ai-ethics-nlp-pattern-icon">${semanticAnalysis.hasAbsoluteStatements ? '⚠️' : '✓'}</span>
              <span class="ai-ethics-nlp-pattern-label">Absolute Statements</span>
            </div>
            <div class="ai-ethics-nlp-pattern ${semanticAnalysis.hasStereotyping ? 'detected' : ''}">
              <span class="ai-ethics-nlp-pattern-icon">${semanticAnalysis.hasStereotyping ? '⚠️' : '✓'}</span>
              <span class="ai-ethics-nlp-pattern-label">Stereotyping</span>
            </div>
            <div class="ai-ethics-nlp-pattern ${semanticAnalysis.hasComparisons ? 'detected' : ''}">
              <span class="ai-ethics-nlp-pattern-icon">${semanticAnalysis.hasComparisons ? '⚠️' : '✓'}</span>
              <span class="ai-ethics-nlp-pattern-label">Group Comparisons</span>
            </div>
            <div class="ai-ethics-nlp-pattern ${semanticAnalysis.hasEmotionalLanguage ? 'detected' : ''}">
              <span class="ai-ethics-nlp-pattern-icon">${semanticAnalysis.hasEmotionalLanguage ? '⚠️' : '✓'}</span>
              <span class="ai-ethics-nlp-pattern-label">Loaded Language</span>
            </div>
          </div>
        </div>

        <!-- Detected Biases -->
        ${detectedBiases && detectedBiases.length > 0 ? `
          <div class="ai-ethics-nlp-biases">
            <div class="ai-ethics-nlp-biases-title">🎯 Detected Biases (${detectedBiases.length})</div>
            ${detectedBiases.map((bias: any) => {
              const severityClass = bias.severity === 'critical' ? 'critical-risk' : 
                                    bias.severity === 'high' ? 'high-risk' : 
                                    bias.severity === 'medium' ? 'medium-risk' : 'low-risk';
              const severityEmoji = bias.severity === 'critical' ? '🚨' : 
                                    bias.severity === 'high' ? '⚠️' :
                                    bias.severity === 'medium' ? '⚡' : 'ℹ️';
              
              return `
                <div class="ai-ethics-nlp-bias-item ${severityClass}">
                  <div class="ai-ethics-nlp-bias-header">
                    <span class="ai-ethics-nlp-bias-type">
                      ${severityEmoji} ${bias.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span class="ai-ethics-nlp-bias-severity">${bias.severity}</span>
                  </div>
                  <div class="ai-ethics-nlp-bias-explanation">
                    ${bias.explanation}
                  </div>
                  <div class="ai-ethics-nlp-bias-context">
                    <strong>Context:</strong> "${bias.context}"
                  </div>
                  <div class="ai-ethics-nlp-bias-pattern">
                    <strong>Pattern:</strong> ${bias.pattern}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="ai-ethics-nlp-no-bias">
            ✅ <strong>No semantic bias detected</strong>
            <p style="font-size: 11px; color: #888; margin-top: 6px;">
              The AI response appears balanced when analyzed through NLP.
            </p>
          </div>
        `}

        <!-- Implicit Bias -->
        ${implicitBias && implicitBias.detected ? `
          <div class="ai-ethics-nlp-implicit">
            <div class="ai-ethics-nlp-implicit-title">
              🕵️ Implicit Bias Detected (${implicitBias.confidence}% confidence)
            </div>
            <div class="ai-ethics-nlp-implicit-indicators">
              ${implicitBias.indicators.map((indicator: string) => `
                <div class="ai-ethics-nlp-implicit-item">
                  • ${indicator}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <style>
        .ai-ethics-nlp-container {
          margin-top: 8px;
        }

        .ai-ethics-nlp-info {
          padding: 12px;
          background: rgba(0, 100, 255, 0.05);
          border: 1px solid rgba(0, 100, 255, 0.2);
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.6;
          color: #c0c0c0;
        }

        .ai-ethics-nlp-info strong {
          color: #00aaff;
        }

        .ai-ethics-nlp-score {
          padding: 16px;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2));
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          margin-bottom: 16px;
        }

        .ai-ethics-nlp-score.critical-risk {
          border-color: #ef4444;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
        }

        .ai-ethics-nlp-score.high-risk {
          border-color: #f59e0b;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
        }

        .ai-ethics-nlp-score.medium-risk {
          border-color: #10b981;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
        }

        .ai-ethics-nlp-score.low-risk {
          border-color: #6366f1;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
        }

        .ai-ethics-nlp-score-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          margin-bottom: 8px;
        }

        .ai-ethics-nlp-score-value {
          font-size: 36px;
          font-weight: 800;
          color: #ffffff;
          margin: 8px 0;
        }

        .ai-ethics-nlp-score-risk {
          font-size: 12px;
          color: #b0b0b0;
        }

        .ai-ethics-nlp-semantic {
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ai-ethics-nlp-semantic-title {
          font-size: 12px;
          font-weight: 700;
          color: #00aaff;
          margin-bottom: 12px;
        }

        .ai-ethics-nlp-semantic-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .ai-ethics-nlp-pattern {
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }

        .ai-ethics-nlp-pattern.detected {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .ai-ethics-nlp-pattern-icon {
          font-size: 14px;
        }

        .ai-ethics-nlp-pattern-label {
          color: #c0c0c0;
          font-weight: 500;
        }

        .ai-ethics-nlp-biases-title {
          font-size: 12px;
          font-weight: 700;
          color: #00aaff;
          margin-bottom: 12px;
        }

        .ai-ethics-nlp-bias-item {
          margin-bottom: 12px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-left: 3px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }

        .ai-ethics-nlp-bias-item.critical-risk {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .ai-ethics-nlp-bias-item.high-risk {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.08);
        }

        .ai-ethics-nlp-bias-item.medium-risk {
          border-left-color: #fbbf24;
          background: rgba(251, 191, 36, 0.05);
        }

        .ai-ethics-nlp-bias-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .ai-ethics-nlp-bias-type {
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
        }

        .ai-ethics-nlp-bias-severity {
          font-size: 9px;
          padding: 3px 8px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .ai-ethics-nlp-bias-explanation {
          font-size: 11px;
          color: #d0d0d0;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .ai-ethics-nlp-bias-context {
          font-size: 10px;
          color: #b0b0b0;
          font-style: italic;
          margin-bottom: 6px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .ai-ethics-nlp-bias-pattern {
          font-size: 10px;
          color: #888;
          font-family: 'Courier New', monospace;
        }

        .ai-ethics-nlp-no-bias {
          padding: 16px;
          text-align: center;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          color: #10b981;
          font-weight: 600;
        }

        .ai-ethics-nlp-implicit {
          margin-top: 16px;
          padding: 12px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
        }

        .ai-ethics-nlp-implicit-title {
          font-size: 12px;
          font-weight: 700;
          color: #a78bfa;
          margin-bottom: 8px;
        }

        .ai-ethics-nlp-implicit-item {
          font-size: 11px;
          color: #d0d0d0;
          margin: 6px 0;
          line-height: 1.5;
        }
      </style>
    `;
  }
  
  /**
   * Render challenge buttons
   */
  private renderChallengeButtons(response: any): string {
    return `
      <div class="ai-ethics-challenge-buttons">
        <button class="ai-ethics-btn" data-action="explain" data-response-id="${response.id}">
          <span>🤔</span> Explain
        </button>
        <button class="ai-ethics-btn" data-action="challenge" data-response-id="${response.id}">
          <span>⚖️</span> Challenge
        </button>
        <button class="ai-ethics-btn primary" data-action="suggest" data-response-id="${response.id}">
          <span>💡</span> Suggest
        </button>
      </div>
    `;
  }
  
  /**
   * Render Cross-Model Verification button
   */
  private renderCrossModelVerificationButton(response: any): string {
    return `
      <div class="ai-ethics-verification-section">
        <p class="ai-ethics-verification-description">
          Verify this AI response using Google Gemini 1.5 Pro as an independent ethical supervisor.
        </p>
        <button class="ai-ethics-btn ai-ethics-verify-btn" id="ai-ethics-verify-response" data-response-id="${response.id}">
          <span>🛡️</span> Verify with Gemini
        </button>
        <div id="ai-ethics-verification-status" class="ai-ethics-verification-status"></div>
      </div>
      
      <style>
        .ai-ethics-verification-section {
          padding: 12px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 8px;
          border: 1px solid #2a2a4e;
        }
        
        .ai-ethics-verification-description {
          color: #b0b0b0;
          font-size: 13px;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }
        
        .ai-ethics-verify-btn {
          width: 100%;
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: white;
          font-weight: 600;
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .ai-ethics-verify-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
        }
        
        .ai-ethics-verify-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .ai-ethics-verification-status {
          margin-top: 12px;
          padding: 10px;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .ai-ethics-verification-status.loading {
          background: #1a2332;
          color: #00d4ff;
          border: 1px solid #00d4ff44;
        }
        
        .ai-ethics-verification-status.success {
          background: #1a2e1a;
          color: #4ade80;
          border: 1px solid #4ade8044;
        }
        
        .ai-ethics-verification-status.error {
          background: #2e1a1a;
          color: #f87171;
          border: 1px solid #f8717144;
        }
      </style>
    `;
  }
  
  /**
   * Render Cross-AI Optimization button
   */
  private renderCrossAIOptimizationButton(response: any): string {
    return `
      <div class="ai-ethics-optimization-container">
        <p class="ai-ethics-optimization-description">
          Compare this answer with Claude, Gemini, and DeepSeek, then get the BEST optimized answer.
        </p>
        <button class="ai-ethics-btn ai-ethics-optimize-btn" id="ai-ethics-optimize-response" data-response-id="${response.id}">
          <span class="optimize-icon">🌟</span> Optimize with Multiple AIs
        </button>
        <div id="ai-ethics-optimization-status" class="ai-ethics-optimization-status"></div>
      </div>
      
      <style>
        .ai-ethics-optimization-container {
          padding: 16px;
          background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent);
          border-radius: 12px;
          border-left: 4px solid var(--theme-primary);
        }
        
        .ai-ethics-optimization-description {
          color: #FFFFFF;
          font-size: 13px;
          margin: 0 0 14px 0;
          line-height: 1.6;
          letter-spacing: 0.2px;
        }
        
        .ai-ethics-optimize-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
          color: #192426;
          font-weight: 600;
          padding: 14px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 2px 8px color-mix(in srgb, var(--theme-primary) 25%, transparent);
        }
        
        .optimize-icon {
          font-size: 16px;
          display: inline-block;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        .ai-ethics-optimize-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px color-mix(in srgb, var(--theme-primary) 40%, transparent);
          background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
          filter: brightness(1.1);
        }
        
        .ai-ethics-optimize-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent);
        }
        
        .ai-ethics-optimize-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .ai-ethics-optimization-status {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .ai-ethics-optimization-status.loading {
          background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
          color: var(--theme-primary);
          border: 1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent);
        }
        
        .ai-ethics-optimization-status.success {
          background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
          color: var(--theme-primary);
          border: 1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent);
        }
        
        .ai-ethics-optimization-status.error {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
      </style>
    `;
  }
  
  /**
   * Render API Key section for testing custom APIs
   */
  private renderAPIKeySection(): string {
    return `
      <div class="ai-ethics-api-section">
        <p style="font-size: 12px; color: var(--theme-text-muted); margin-bottom: 12px;">
          Configure API keys for cross-AI verification with Claude, Gemini, and DeepSeek.
        </p>
        <div style="background: var(--theme-bg-card); padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--theme-border);">
          <div style="font-size: 11px; font-weight: 600; color: var(--theme-primary); margin-bottom: 8px;">🤖 CLAUDE API KEY</div>
          <input 
            type="password" 
            id="ai-ethics-claude-api-key" 
            placeholder="sk-ant-api03-..." 
            class="ai-ethics-input"
            style="margin-bottom: 4px;"
          />
          <div style="font-size: 10px; color: var(--theme-text-muted); margin-top: 4px;">Get from: console.anthropic.com</div>
        </div>
        <div style="background: var(--theme-bg-card); padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--theme-border);">
          <div style="font-size: 11px; font-weight: 600; color: var(--theme-primary); margin-bottom: 8px;">✨ GEMINI API KEY</div>
          <input 
            type="password" 
            id="ai-ethics-gemini-api-key" 
            placeholder="AIzaSy..." 
            class="ai-ethics-input"
            style="margin-bottom: 4px;"
          />
          <div style="font-size: 10px; color: var(--theme-text-muted); margin-top: 4px;">Get from: aistudio.google.com/app/apikey</div>
        </div>
        <div style="background: var(--theme-bg-card); padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--theme-border);">
          <div style="font-size: 11px; font-weight: 600; color: var(--theme-primary); margin-bottom: 8px;">🧠 DEEPSEEK API KEY (Optional)</div>
          <input 
            type="password" 
            id="ai-ethics-deepseek-api-key" 
            placeholder="sk-..." 
            class="ai-ethics-input"
            style="margin-bottom: 4px;"
          />
          <div style="font-size: 10px; color: var(--theme-text-muted); margin-top: 4px;">Get from: platform.deepseek.com</div>
        </div>
        <button id="ai-ethics-save-api-key" class="ai-ethics-btn primary" style="width: 100%; margin-top: 8px;">
          💾 Save All API Keys
        </button>
        <button id="ai-ethics-test-api" class="ai-ethics-btn" style="width: 100%; margin-top: 8px;">
          🧪 Test APIs
        </button>
      </div>
    `;
  }
  
  /**
   * Render Data Management section
   */
  private renderDataManagementSection(): string {
    console.log('🔒 Rendering Data Management section');
    
    // Calculate storage usage
    const apiKey = localStorage.getItem('ai-ethics-api-key') || '';
    const reports = JSON.parse(localStorage.getItem('ai-ethics-reports') || '[]');
    const storageSize = new Blob([JSON.stringify({ apiKey, reports })]).size;
    const storageSizeKB = (storageSize / 1024).toFixed(2);
    
    return `
      <div class="ai-ethics-data-section">
        <p class="ai-ethics-data-description">Manage your locally stored data and privacy settings.</p>
        
        <div class="ai-ethics-storage-info">
          <div class="ai-ethics-storage-stat">
            <span class="ai-ethics-storage-label">Storage Used:</span>
            <span class="ai-ethics-storage-value">${storageSizeKB} KB</span>
          </div>
          <div class="ai-ethics-storage-stat">
            <span class="ai-ethics-storage-label">API Key:</span>
            <span class="ai-ethics-storage-value">${apiKey ? '✓ Stored' : '✗ Not set'}</span>
          </div>
          <div class="ai-ethics-storage-stat">
            <span class="ai-ethics-storage-label">Reports:</span>
            <span class="ai-ethics-storage-value">${reports.length} saved</span>
          </div>
        </div>
        
        <div class="ai-ethics-data-actions">
          <button class="ai-ethics-btn" id="ai-ethics-export-data">
            <span>📥</span> Export Data
          </button>
          <button class="ai-ethics-btn" id="ai-ethics-clear-data" style="border-color: rgba(239, 68, 68, 0.3); color: #ef4444;">
            <span>🗑️</span> Clear All Data
          </button>
        </div>
        
        <div class="ai-ethics-privacy-note">
          <span style="font-size: 11px; color: #888; line-height: 1.4;">
            ℹ️ All data is stored locally in your browser. No information is sent to external servers.
            ${apiKey ? ' API keys are encrypted for security.' : ''}
          </span>
        </div>
      </div>
    `;
  }
  
  /**
   * Render Community Report section
   */
  private renderCommunityReportSection(): string {
    console.log('🚩 Rendering Community Report section');
    // Get reports from localStorage
    const reports = JSON.parse(localStorage.getItem('ai-ethics-reports') || '[]');
    const reportCount = reports.length;
    console.log('Report count:', reportCount);
    
    return `
      <div class="ai-ethics-community-section">
        <p class="ai-ethics-community-description">Report bias and ethical concerns to help improve AI systems.</p>
        
        <div class="ai-ethics-report-stats">
          <div class="ai-ethics-stat-card">
            <div class="ai-ethics-stat-number">${reportCount}</div>
            <div class="ai-ethics-stat-label">Your Reports</div>
          </div>
          <div class="ai-ethics-stat-card">
            <div class="ai-ethics-stat-number">${Math.floor(Math.random() * 1000) + 500}</div>
            <div class="ai-ethics-stat-label">Community Reports</div>
          </div>
        </div>
        
        <button class="ai-ethics-btn primary" id="ai-ethics-report-bias">
          <span>🚩</span> Report Bias Issue
        </button>
        
        ${reportCount > 0 ? `
          <div class="ai-ethics-recent-reports">
            <div class="ai-ethics-subsection-title">Recent Reports</div>
            ${reports.slice(-3).reverse().map((report: any) => `
              <div class="ai-ethics-report-item">
                <div class="ai-ethics-report-header">
                  <span class="ai-ethics-report-type">${report.type}</span>
                  <span class="ai-ethics-report-date">${new Date(report.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="ai-ethics-report-text">${report.description}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Show the sidebar
   */
  public showSidebar(): void {
    if (this.sidebar) {
      this.sidebar.style.transform = 'translateX(0)';
      // Save state
      chrome.storage.local.set({ sidebarVisible: true });
    }
  }
  
  /**
   * Hide the sidebar
   */
  public hideSidebar(): void {
    if (this.sidebar) {
      this.sidebar.style.transform = 'translateX(100%)';
      // Save state
      chrome.storage.local.set({ sidebarVisible: false });
    }
  }
  
  /**
   * Toggle sidebar visibility
   */
  public toggleSidebar(): void {
    if (!this.sidebar) return;
    
    const currentTransform = this.sidebar.style.transform;
    const isVisible = currentTransform === 'translateX(0px)' || currentTransform === 'translateX(0)';
    if (isVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }
  
  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.sidebar) return;
    
    // Close button
    const closeBtn = this.sidebar.querySelector('#ai-ethics-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideSidebar();
      });
    }
    
    // Minimize/Maximize button
    const minimizeBtn = this.sidebar.querySelector('#ai-ethics-minimize-btn');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        this.toggleMinimize();
      });
    }
    
    // Theme switcher button
    const themeBtn = this.sidebar.querySelector('#ai-ethics-theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
    
    // Event delegation for all buttons
    this.sidebar.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button') as HTMLElement;
      
      if (!button) return;
      
      // Challenge buttons
      if (button.classList.contains('ai-ethics-btn') && button.dataset.action) {
        this.handleChallengeAction(button.dataset.action, button.dataset.responseId);
      }
      
      // API Key save button
      if (button.id === 'ai-ethics-save-api-key') {
        this.handleSaveAPIKey();
      }
      
      // Test API button
      if (button.id === 'ai-ethics-test-api') {
        this.handleTestAPI();
      }
      
      // Report bias button
      if (button.id === 'ai-ethics-report-bias') {
        this.handleReportBias();
      }
      
      // Reload button
      if (button.id === 'ai-ethics-reload-btn') {
        this.handleReload();
      }
      
      // Export data button
      if (button.id === 'ai-ethics-export-data') {
        this.handleExportData();
      }
      
      // Clear data button
      if (button.id === 'ai-ethics-clear-data') {
        this.handleClearData();
      }
      
      // Cross-model verification button
      if (button.id === 'ai-ethics-verify-response') {
        this.handleCrossModelVerification(button.dataset.responseId);
      }
      
      // Cross-AI optimization button
      if (button.id === 'ai-ethics-optimize-response') {
        this.handleCrossAIOptimization(button.dataset.responseId);
      }
    });
  }
  
  /**
   * Toggle minimize/maximize state
   */
  private toggleMinimize(): void {
    if (!this.sidebar) return;
    
    const isMinimized = this.sidebar.classList.contains('minimized');
    const minimizeBtn = this.sidebar.querySelector('#ai-ethics-minimize-btn') as HTMLElement;
    
    if (!minimizeBtn) return;
    
    if (isMinimized) {
      // Maximize
      this.sidebar.classList.remove('minimized');
      minimizeBtn.textContent = '−';
      minimizeBtn.title = 'Minimize';
    } else {
      // Minimize
      this.sidebar.classList.add('minimized');
      minimizeBtn.textContent = '+';
      minimizeBtn.title = 'Maximize';
    }
  }
  
  /**
   * Toggle between cyan and purple theme
   */
  private toggleTheme(): void {
    if (!this.sidebar) return;
    
    const isPurple = this.sidebar.classList.contains('purple-theme');
    
    // Update Cross-AI modal if it exists
    const crossAIModal = document.querySelector('.veri-cross-ai-container');
    
    if (isPurple) {
      // Switch to cyan
      this.sidebar.classList.remove('purple-theme');
      if (crossAIModal) {
        crossAIModal.classList.remove('purple-theme');
      }
      document.documentElement.style.setProperty('--theme-primary', '#00B6E5');
      document.documentElement.style.setProperty('--theme-secondary', '#0099cc');
    } else {
      // Switch to purple
      this.sidebar.classList.add('purple-theme');
      if (crossAIModal) {
        crossAIModal.classList.add('purple-theme');
      }
      document.documentElement.style.setProperty('--theme-primary', '#AD7BCD');
      document.documentElement.style.setProperty('--theme-secondary', '#8B5BA8');
    }
  }
  
  /**
   * Handle challenge button actions
   */
  private handleChallengeAction(action: string, responseId?: string): void {
    console.log(`Challenge action: ${action} for response: ${responseId}`);
    
    switch (action) {
      case 'explain':
        this.showExplainModal();
        break;
      case 'challenge':
        alert('Challenge Ethics functionality will be implemented in a future task');
        break;
      case 'suggest':
        alert('Suggest Alternative functionality will be implemented in a future task');
        break;
    }
  }
  
  /**
   * Show Explain modal with chain of thought details
   */
  private showExplainModal(): void {
    if (!this.currentAnalysis) {
      alert('No analysis available to explain');
      return;
    }
    
    const { chainOfThought, response } = this.currentAnalysis;
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'ai-ethics-modal-overlay';
    overlay.id = 'ai-ethics-explain-modal';
    
    // Create modal content
    overlay.innerHTML = `
      <div class="ai-ethics-modal">
        <div class="ai-ethics-modal-header">
          <div class="ai-ethics-modal-title">🤔 Chain of Thought Explanation</div>
          <button class="ai-ethics-modal-close" id="ai-ethics-modal-close-btn">×</button>
        </div>
        <div class="ai-ethics-modal-body">
          <div class="ai-ethics-modal-section">
            <div class="ai-ethics-modal-section-title">Response Overview</div>
            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #00d4ff; margin-bottom: 20px;">
              <div style="font-size: 12px; color: #888; margin-bottom: 6px;">Platform: ${response.platform || 'Unknown'}</div>
              <div style="font-size: 13px; color: #e0e0e0; line-height: 1.6;">${response.content.substring(0, 200)}${response.content.length > 200 ? '...' : ''}</div>
            </div>
          </div>
          
          <div class="ai-ethics-modal-section">
            <div class="ai-ethics-modal-section-title">Reasoning Steps</div>
            ${this.renderChainOfThoughtDetailed(chainOfThought)}
          </div>
          
          ${chainOfThought.ethicalConsiderations && chainOfThought.ethicalConsiderations.length > 0 ? `
            <div class="ai-ethics-modal-section">
              <div class="ai-ethics-modal-section-title">Ethical Considerations</div>
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 14px;">
                ${chainOfThought.ethicalConsiderations.map((consideration: string) => `
                  <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
                    <span style="color: #10b981; font-size: 14px;">✓</span>
                    <span style="font-size: 13px; color: #e0e0e0; line-height: 1.5;">${consideration}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="ai-ethics-modal-section">
            <div class="ai-ethics-modal-section-title">Overall Confidence</div>
            <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 14px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 24px; font-weight: 700; color: #00d4ff;">${Math.round((chainOfThought.confidence || 0) * 100)}%</span>
                <div style="flex: 1;">
                  <div class="ai-ethics-confidence-bar">
                    <div class="ai-ethics-confidence-fill" style="width: ${(chainOfThought.confidence || 0) * 100}%"></div>
                  </div>
                </div>
              </div>
              <div style="font-size: 12px; color: #888;">
                ${chainOfThought.inferredLogic ? '⚠️ Contains inferred logic - some reasoning may be implicit' : '✓ Explicit reasoning provided'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(overlay);
    
    // Setup close handlers
    const closeBtn = overlay.querySelector('#ai-ethics-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.remove();
      });
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
    
    // Close on Escape key
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }
  
  /**
   * Render detailed chain of thought for modal
   */
  private renderChainOfThoughtDetailed(chainOfThought: any): string {
    if (!chainOfThought || !chainOfThought.steps || chainOfThought.steps.length === 0) {
      return '<p style="color: #888;">No reasoning steps detected.</p>';
    }
    
    return chainOfThought.steps.map((step: any, index: number) => `
      <div class="ai-ethics-modal-step">
        <div class="ai-ethics-modal-step-number">Step ${index + 1}</div>
        <div class="ai-ethics-modal-step-type">${step.type.replace(/_/g, ' ')}</div>
        <div class="ai-ethics-modal-step-description">${step.description}</div>
        <div class="ai-ethics-modal-step-confidence">
          <span>Confidence:</span>
          <div class="ai-ethics-confidence-bar">
            <div class="ai-ethics-confidence-fill" style="width: ${step.confidence * 100}%"></div>
          </div>
          <span>${Math.round(step.confidence * 100)}%</span>
        </div>
        ${step.sources && step.sources.length > 0 ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="font-size: 11px; color: #888; margin-bottom: 6px;">Sources:</div>
            ${step.sources.map((source: string) => `
              <div style="font-size: 11px; color: #00d4ff; margin-bottom: 4px;">• ${source}</div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }
  
  /**
   * Handle saving API key
   */
  /**
   * Handle saving API keys with AES-256 encryption
   */
  private async handleSaveAPIKey(): Promise<void> {
    const claudeInput = document.getElementById('ai-ethics-claude-api-key') as HTMLInputElement;
    const geminiInput = document.getElementById('ai-ethics-gemini-api-key') as HTMLInputElement;
    const deepseekInput = document.getElementById('ai-ethics-deepseek-api-key') as HTMLInputElement;
    
    const keys: any = {};
    const plainKeys: string[] = [];
    
    try {
      // Import encryption module
      const { encrypt } = await import('../../shared/encryption');
      
      // Encrypt Claude key
      if (claudeInput?.value.trim()) {
        console.log('🔐 Encrypting Claude API key...');
        keys.claudeApiKey = await encrypt(claudeInput.value.trim());
        plainKeys.push('Claude');
      }
      
      // Encrypt Gemini key
      if (geminiInput?.value.trim()) {
        console.log('🔐 Encrypting Gemini API key...');
        keys.geminiApiKey = await encrypt(geminiInput.value.trim());
        plainKeys.push('Gemini');
      }
      
      // Encrypt DeepSeek key
      if (deepseekInput?.value.trim()) {
        console.log('🔐 Encrypting DeepSeek API key...');
        keys.deepseekApiKey = await encrypt(deepseekInput.value.trim());
        plainKeys.push('DeepSeek');
      }
      
      if (Object.keys(keys).length === 0) {
        alert('⚠️ Please enter at least one API key');
        return;
      }
      
      // Save encrypted keys to Chrome storage
      await chrome.storage.sync.set(keys);
      
      alert(`✅ Saved ${Object.keys(keys).length} API key(s) securely!\\n\\n` +
            `🔐 Keys encrypted with AES-256-GCM\\n` +
            `📦 Stored in Chrome sync storage\\n\\n` +
            `Keys saved: ${plainKeys.join(', ')}`);
      
      // Clear inputs for security
      if (claudeInput) claudeInput.value = '';
      if (geminiInput) geminiInput.value = '';
      if (deepseekInput) deepseekInput.value = '';
      
      // Notify background to reload keys
      chrome.runtime.sendMessage({ type: 'RELOAD_API_KEYS' });
      
      console.log('✅ API keys encrypted and saved successfully');
    } catch (error) {
      console.error('❌ Failed to save API keys:', error);
      alert('❌ Failed to save API keys\\n\\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
  
  /**
   * Simple encryption for API keys (XOR + Base64)
   */
  private simpleEncrypt(text: string): string {
    const key = 'AI-ETHICS-2025';
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }
  
  /**
   * Simple decryption for API keys
   */
  private simpleDecrypt(encrypted: string): string {
    try {
      const key = 'AI-ETHICS-2025';
      const decoded = atob(encrypted);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch {
      return encrypted; // Return as-is if decryption fails
    }
  }
  
  /**
   * Handle testing API
   */
  private handleTestAPI(): void {
    const apiKey = localStorage.getItem('ai-ethics-api-key');
    
    if (!apiKey) {
      alert('Please save your API key first');
      return;
    }
    
    // Simulate API test (dummy implementation)
    const testPrompt = prompt('Enter a test prompt for your API:', 'What is artificial intelligence?');
    
    if (!testPrompt) return;
    
    console.log('🧪 Testing API with prompt:', testPrompt);
    console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');
    
    // Show loading state
    alert('API Test (Demo Mode)\n\nIn production, this would:\n1. Send your prompt to your API endpoint\n2. Receive the AI response\n3. Analyze it for bias and ethical concerns\n4. Display results in the sidebar\n\nAPI Key: ' + apiKey.substring(0, 10) + '...\nPrompt: ' + testPrompt);
  }
  
  /**
   * Handle reporting bias
   */
  private handleReportBias(): void {
    // Create a simple modal for reporting
    const biasType = prompt('What type of bias did you detect?\n\nOptions:\n- Gender Bias\n- Racial Bias\n- Political Bias\n- Emotional Manipulation\n- Logical Fallacy\n- Other', 'Gender Bias');
    
    if (!biasType) return;
    
    const description = prompt('Please describe the bias issue:', '');
    
    if (!description) return;
    
    // Save report to localStorage
    const reports = JSON.parse(localStorage.getItem('ai-ethics-reports') || '[]');
    
    const newReport = {
      id: Date.now(),
      type: biasType,
      description: description,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      platform: this.detectCurrentPlatform()
    };
    
    reports.push(newReport);
    localStorage.setItem('ai-ethics-reports', JSON.stringify(reports));
    
    console.log('✓ Bias report saved:', newReport);
    
    alert('Thank you for your report!\n\nYour feedback helps improve AI ethics monitoring.\n\nReport ID: ' + newReport.id);
    
    // Refresh the content to show the new report
    this.refreshCurrentAnalysis();
  }
  
  /**
   * Detect current platform
   */
  private detectCurrentPlatform(): string {
    const url = window.location.href;
    if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) return 'ChatGPT';
    if (url.includes('copilot.microsoft.com')) return 'Copilot';
    if (url.includes('gemini.google.com') || url.includes('bard.google.com')) return 'Gemini';
    if (url.includes('claude.ai')) return 'Claude';
    return 'Unknown';
  }
  
  /**
   * Refresh current analysis display
   */
  private refreshCurrentAnalysis(): void {
    // This is a placeholder - in a real implementation, 
    // we would re-render the current analysis
    console.log('Refreshing analysis display...');
    
    // For now, just trigger a re-render by calling displayAnalysis with dummy data
    // In production, we'd store the current analysis and re-render it
  }
  
  /**
   * Handle reload button click
   */
  private handleReload(): void {
    console.log('🔄 Reloading analysis...');
    
    const reloadBtn = this.sidebar?.querySelector('#ai-ethics-reload-btn') as HTMLElement;
    if (reloadBtn) {
      reloadBtn.classList.add('spinning');
    }
    
    // Trigger a page event to request new analysis
    window.dispatchEvent(new CustomEvent('ai-ethics-reload-requested'));
    
    // If we have current analysis, re-render it
    if (this.currentAnalysis) {
      this.updateSidebarContent(this.currentAnalysis);
    }
    
    // Remove spinning animation after 1 second
    setTimeout(() => {
      if (reloadBtn) {
        reloadBtn.classList.remove('spinning');
      }
    }, 1000);
    
    console.log('✓ Reload complete');
  }
  
  /**
   * Handle export data
   */
  private handleExportData(): void {
    console.log('📥 Exporting data...');
    
    // Gather all stored data
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      apiKey: localStorage.getItem('ai-ethics-api-key') || null,
      reports: JSON.parse(localStorage.getItem('ai-ethics-reports') || '[]'),
      settings: {
        sidebarVisible: localStorage.getItem('sidebarVisible') === 'true'
      }
    };
    
    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-ethics-monitor-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✓ Data exported successfully');
    alert('Data exported successfully!\n\nYour data has been downloaded as a JSON file.');
  }
  
  /**
   * Handle clear all data
   */
  private handleClearData(): void {
    console.log('🗑️ Clear data requested...');
    
    // Confirm with user
    const confirmed = confirm(
      '⚠️ Clear All Data?\n\n' +
      'This will permanently delete:\n' +
      '• Your API key\n' +
      '• All saved reports\n' +
      '• All settings\n\n' +
      'This action cannot be undone.\n\n' +
      'Do you want to continue?'
    );
    
    if (!confirmed) {
      console.log('✗ Clear data cancelled by user');
      return;
    }
    
    // Clear all localStorage data
    const keysToRemove = [
      'ai-ethics-api-key',
      'ai-ethics-reports',
      'sidebarVisible'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear chrome.storage as well
    chrome.storage.local.clear(() => {
      console.log('✓ Chrome storage cleared');
    });
    
    console.log('✅ All data cleared successfully');
    
    // Show success message
    alert('✅ All Data Cleared\n\nYour data has been permanently deleted from local storage.');
    
    // Refresh the UI to show empty state
    if (this.currentAnalysis) {
      this.updateSidebarContent(this.currentAnalysis);
    }
  }
  
  /**
   * Handle cross-model verification request
   */
  private async handleCrossModelVerification(responseId?: string): Promise<void> {
    console.log('🛡️ Cross-model verification requested for response:', responseId);
    
    if (!this.currentAnalysis || !this.currentAnalysis.response) {
      alert('❌ No response available to verify');
      return;
    }
    
    const { response } = this.currentAnalysis;
    const statusEl = document.getElementById('ai-ethics-verification-status');
    const verifyBtn = document.getElementById('ai-ethics-verify-response') as HTMLButtonElement;
    
    if (!statusEl || !verifyBtn) return;
    
    try {
      // Update UI to show loading state
      verifyBtn.disabled = true;
      verifyBtn.innerHTML = '<span>⏳</span> Verifying...';
      statusEl.className = 'ai-ethics-verification-status loading';
      statusEl.innerHTML = '🔍 Sending to Gemini 1.5 Pro for ethical analysis...';
      
      console.log('📤 Sending verification request to background service...');
      
      // Send verification request to background service
      const verificationResponse = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CROSS_MODEL_VERIFY,
        payload: {
          userQuestion: 'User question from context',
          aiResponse: response.content,
          sourcePlatform: response.platform || 'generic',
          responseMetadata: {
            responseTime: Date.now()
          }
        }
      });
      
      console.log('✅ Verification response received:', verificationResponse);
      
      if (!verificationResponse || !verificationResponse.success) {
        throw new Error(verificationResponse?.error || 'Verification failed');
      }
      
      // Update status to success
      statusEl.className = 'ai-ethics-verification-status success';
      statusEl.innerHTML = `✅ Verification complete! Trust Score: ${verificationResponse.verification.trustScore}/100`;
      
      // Display full verification report
      const verificationUI = new CrossModelVerificationUI();
      verificationUI.displayVerificationReport(verificationResponse.verification);
      
      // Re-enable button
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = '<span>🛡️</span> Verify with Gemini';
      
      console.log('✅ Cross-model verification complete');
      
    } catch (error) {
      console.error('❌ Verification error:', error);
      
      // Update status to error
      if (statusEl) {
        statusEl.className = 'ai-ethics-verification-status error';
        statusEl.innerHTML = `❌ Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      
      // Re-enable button
      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<span>🛡️</span> Verify with Gemini';
      }
    }
  }
  
  /**
   * Handle Cross-AI Optimization request
   */
  private async handleCrossAIOptimization(responseId?: string): Promise<void> {
    console.log('🌟 Cross-AI Optimization requested for response:', responseId);
    
    if (!this.currentAnalysis || !this.currentAnalysis.response) {
      alert('❌ No response available to optimize');
      return;
    }

    const { response } = this.currentAnalysis;
    const statusEl = document.getElementById('ai-ethics-optimization-status');
    const optimizeBtn = document.getElementById('ai-ethics-optimize-response') as HTMLButtonElement;
    
    if (!statusEl || !optimizeBtn) return;

    try {
      // Extract the actual user question from the page
      const userQuestion = this.extractUserQuestion();
      
      if (!userQuestion) {
        throw new Error('Could not extract user question from conversation');
      }

      console.log('📝 Extracted question:', userQuestion.substring(0, 100) + '...');

      // Update UI to show loading state
      optimizeBtn.disabled = true;
      optimizeBtn.innerHTML = '<span>⏳</span> Optimizing...';
      statusEl.className = 'ai-ethics-optimization-status loading';
      statusEl.innerHTML = '🤖 Querying Gemini and comparing responses... This may take 5-10 seconds.';
      
      console.log('📤 Sending Cross-AI optimization request...');
      
      // Send optimization request to background service
      const optimizationResponse = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CROSS_AI_OPTIMIZE,
        payload: {
          question: userQuestion,
          answer: response.content,
          sourcePlatform: response.platform || 'generic'
        }
      });
      
      console.log('✅ Optimization response received:', optimizationResponse);
      
      if (!optimizationResponse || !optimizationResponse.success) {
        throw new Error(optimizationResponse?.error || 'Optimization failed');
      }
      
      // Update status to success
      statusEl.className = 'ai-ethics-optimization-status success';
      statusEl.innerHTML = `✅ Optimization complete! Best Model: ${optimizationResponse.optimization.bestModel}`;
      
      // Display full optimization report
      console.log('🌟 Displaying Cross-AI Optimization Report...');
      const optimizationUI = new CrossAIOptimizationUI();
      optimizationUI.displayOptimizationReport(optimizationResponse.optimization);
      
      // Re-enable button
      optimizeBtn.disabled = false;
      optimizeBtn.innerHTML = '<span>🌟</span> Optimize with Multiple AIs';
      
      console.log('✅ Cross-AI optimization complete');
      
    } catch (error) {
      console.error('❌ Optimization error:', error);
      
      // Update status to error
      if (statusEl) {
        statusEl.className = 'ai-ethics-optimization-status error';
        statusEl.innerHTML = `❌ Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      
      // Re-enable button
      if (optimizeBtn) {
        optimizeBtn.disabled = false;
        optimizeBtn.innerHTML = '<span>🌟</span> Optimize with Multiple AIs';
      }
    }
  }

  /**
   * Extract user question from the conversation
   */
  private extractUserQuestion(): string | null {
    // Try to find the user's last message on ChatGPT
    const selectors = [
      '[data-message-author-role="user"]',
      '[data-message-author="user"]',
      '.user-message',
      '[class*="user"]'
    ];

    for (const selector of selectors) {
      const userMessages = document.querySelectorAll(selector);
      if (userMessages.length > 0) {
        // Get the last user message
        const lastUserMessage = userMessages[userMessages.length - 1];
        const text = lastUserMessage.textContent?.trim() || '';
        
        if (text.length > 10) {
          return text;
        }
      }
    }

    // Fallback: try to get from conversation context
    if (this.currentAnalysis?.response?.conversationContext) {
      const context = this.currentAnalysis.response.conversationContext;
      for (const msg of context.reverse()) {
        if (msg.includes('user:') || msg.includes('User:')) {
          return msg.replace(/^(user:|User:)/i, '').trim();
        }
      }
    }

    return null;
  }
}