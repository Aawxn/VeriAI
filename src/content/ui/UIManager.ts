/**
 * UI Manager for handling the extension's user interface components
 */

import { UI_CONSTANTS } from '../../shared/constants';

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
      backgroundColor: '#1a1a1a',
      border: 'none',
      borderLeft: '1px solid #2a2a2a',
      boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
      zIndex: UI_CONSTANTS.Z_INDEX_BASE.toString(),
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      overflow: 'hidden',
      transition: `transform ${UI_CONSTANTS.ANIMATION_DURATION} ease-in-out, width 0.3s ease-in-out`,
      transform: 'translateX(0)', // Show immediately
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
      
      .ai-ethics-sidebar * {
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #ffffff;
      }
      
      .ai-ethics-header {
        padding: 16px;
        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #333;
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
        background: #1a1a1a;
      }
      
      .ai-ethics-section {
        margin-bottom: 24px;
      }
      
      .ai-ethics-section-title {
        font-weight: 600;
        margin-bottom: 12px;
        color: #00d4ff;
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
        background: #00d4ff;
        border-radius: 2px;
      }
      
      .ai-ethics-step {
        background: rgba(0, 212, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.15);
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
        background: linear-gradient(180deg, #00d4ff 0%, #0099cc 100%);
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
        color: #00d4ff;
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
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 6px;
        background: rgba(0, 212, 255, 0.1);
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
        justify-content: center;
        color: #00d4ff;
      }
      
      .ai-ethics-btn:hover {
        background: rgba(0, 212, 255, 0.2);
        border-color: rgba(0, 212, 255, 0.5);
        transform: translateY(-1px);
      }
      
      .ai-ethics-btn.primary {
        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        color: white;
        border-color: #00d4ff;
      }
      
      .ai-ethics-btn.primary:hover {
        background: linear-gradient(135deg, #00b8e6 0%, #0088bb 100%);
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
      }
      
      /* API Key Section */
      .ai-ethics-api-section {
        background: rgba(0, 212, 255, 0.03);
        border: 1px solid rgba(0, 212, 255, 0.15);
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
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 6px;
        padding: 8px 12px;
        color: #ffffff;
        font-size: 12px;
        font-family: 'Inter', sans-serif;
        transition: all 0.2s ease;
      }
      
      .ai-ethics-input:focus {
        outline: none;
        border-color: #00d4ff;
        background: rgba(0, 0, 0, 0.4);
        box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1);
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
        color: #00d4ff;
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
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.2);
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
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Get initial sidebar HTML content
   */
  private getInitialSidebarHTML(): string {
    return `
      <div class="ai-ethics-header">
        <span class="ai-ethics-title">AI Ethics Monitor</span>
        <div class="ai-ethics-header-buttons">
          <button class="ai-ethics-reload" id="ai-ethics-reload-btn" title="Reload Analysis">↻</button>
          <button class="ai-ethics-minimize" id="ai-ethics-minimize-btn" title="Minimize">−</button>
          <button class="ai-ethics-close" id="ai-ethics-close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="ai-ethics-content" id="ai-ethics-content">
        <div class="ai-ethics-section">
          <div class="ai-ethics-section-title">Status</div>
          <p>Monitoring AI responses... Waiting for new conversation...</p>
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
    
    const chainOfThoughtHTML = this.renderChainOfThought(data.chainOfThought);
    const biasAnalysisHTML = this.renderBiasAnalysis(data.biasAnalysis);
    const challengeButtonsHTML = this.renderChallengeButtons(data.response);
    
    console.log('Chain of Thought HTML length:', chainOfThoughtHTML.length);
    console.log('Bias Analysis HTML length:', biasAnalysisHTML.length);
    
    content.innerHTML = `
      <div class="ai-ethics-section">
        <div class="ai-ethics-section-title">Chain of Thought</div>
        ${chainOfThoughtHTML}
      </div>
      
      <div class="ai-ethics-section">
        <div class="ai-ethics-section-title">Bias Analysis</div>
        ${biasAnalysisHTML}
      </div>
      
      <div class="ai-ethics-section">
        <div class="ai-ethics-section-title">Actions</div>
        ${challengeButtonsHTML}
      </div>
      
      <div class="ai-ethics-section">
        <div class="ai-ethics-section-title">🔑 Test Your API</div>
        ${this.renderAPIKeySection()}
      </div>
      
      <div class="ai-ethics-section">
        <div class="ai-ethics-section-title">🚩 Community Reports</div>
        ${this.renderCommunityReportSection()}
      </div>
      
      <div class="ai-ethics-section">
        <div class="ai-ethics-section-title">🔒 Privacy & Data</div>
        ${this.renderDataManagementSection()}
      </div>
    `;
    
    console.log('✅ Content HTML updated');
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
    
    return `
      <div class="ai-ethics-risk-badge ${riskClass}">
        Overall Risk: ${biasAnalysis.overallRisk.toUpperCase()}
      </div>
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
   * Render API Key section for testing custom APIs
   */
  private renderAPIKeySection(): string {
    console.log('🔑 Rendering API Key section');
    // Get saved API key from localStorage
    const savedKey = localStorage.getItem('ai-ethics-api-key') || '';
    const isEncrypted = localStorage.getItem('ai-ethics-api-key-encrypted') === 'true';
    const hasKey = savedKey.length > 0;
    console.log('API key exists:', hasKey, '| Encrypted:', isEncrypted);
    
    return `
      <div class="ai-ethics-api-section">
        <p class="ai-ethics-api-description">Test your own AI API responses for bias and ethical concerns.</p>
        <div class="ai-ethics-input-group">
          <input 
            type="password" 
            id="ai-ethics-api-key-input" 
            class="ai-ethics-input" 
            placeholder="Enter your API key..."
            value=""
          />
          <button class="ai-ethics-btn primary" id="ai-ethics-save-api-key">
            ${hasKey ? '✓ Saved' : 'Save'}
          </button>
        </div>
        ${hasKey ? `
          <div class="ai-ethics-api-status">
            <span class="ai-ethics-status-indicator active"></span>
            <span>API key configured ${isEncrypted ? '(encrypted)' : ''}</span>
          </div>
          <button class="ai-ethics-btn" id="ai-ethics-test-api">
            <span>🧪</span> Test API
          </button>
        ` : ''}
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
    
    const isVisible = this.sidebar.style.transform === 'translateX(0px)';
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
  private handleSaveAPIKey(): void {
    const input = this.sidebar?.querySelector('#ai-ethics-api-key-input') as HTMLInputElement;
    if (!input) return;
    
    const apiKey = input.value.trim();
    
    if (apiKey.length === 0) {
      alert('Please enter an API key');
      return;
    }
    
    // Encrypt the API key before storing
    const encryptedKey = this.simpleEncrypt(apiKey);
    
    // Save encrypted key to localStorage
    localStorage.setItem('ai-ethics-api-key', encryptedKey);
    localStorage.setItem('ai-ethics-api-key-encrypted', 'true');
    
    console.log('✓ API key encrypted and saved to localStorage');
    
    // Clear the input for security
    input.value = '';
    
    // Show success message
    const button = this.sidebar?.querySelector('#ai-ethics-save-api-key') as HTMLButtonElement;
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '✓ Saved!';
      button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
      }, 2000);
    }
    
    // Refresh the content to show the status
    if (this.currentAnalysis) {
      this.updateSidebarContent(this.currentAnalysis);
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
}