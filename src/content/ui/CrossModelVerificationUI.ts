/**
 * Cross-Model Verification UI Component
 * Displays verification results from Google Gemini 1.5 Pro
 */

import type { CrossModelVerificationResult } from '../../types';

export class CrossModelVerificationUI {
  private container: HTMLElement | null = null;

  /**
   * Display cross-model verification report
   */
  public displayVerificationReport(data: CrossModelVerificationResult): void {
    console.log('📊 Displaying cross-model verification report...');

    // Remove existing report if any
    this.removeExistingReport();

    // Create report container
    this.container = this.createReportContainer(data);

    // Add to page
    document.body.appendChild(this.container);

    // Animate in
    setTimeout(() => {
      if (this.container) {
        this.container.style.opacity = '1';
        this.container.style.transform = 'translateX(0)';
      }
    }, 10);

    console.log('✅ Verification report displayed');
  }

  /**
   * Remove existing report
   */
  private removeExistingReport(): void {
    const existing = document.getElementById('veri-ai-cross-model-report');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Create report container with all verification data
   */
  private createReportContainer(data: CrossModelVerificationResult): HTMLElement {
    const container = document.createElement('div');
    container.id = 'veri-ai-cross-model-report';
    container.innerHTML = `
      <div class="veri-ai-report-header">
        <div class="veri-ai-report-title">
          <span class="veri-ai-icon">🔍</span>
          <h3>Cross-Model Verification</h3>
        </div>
        <button class="veri-ai-close-btn" id="veri-ai-close-report">✕</button>
      </div>

      <div class="veri-ai-report-body">
        <!-- Trust Score -->
        <div class="veri-ai-trust-section">
          <div class="veri-ai-trust-score ${this.getTrustScoreClass(data.trustScore)}">
            <div class="veri-ai-score-label">Trust Score</div>
            <div class="veri-ai-score-value">${data.trustScore}/100</div>
            <div class="veri-ai-score-bar">
              <div class="veri-ai-score-fill" style="width: ${data.trustScore}%"></div>
            </div>
          </div>
          <div class="veri-ai-verdict ${this.getVerdictClass(data.finalVerdict)}">
            <span class="veri-ai-verdict-icon">${this.getVerdictIcon(data.finalVerdict)}</span>
            <span class="veri-ai-verdict-text">${data.finalVerdict.toUpperCase()}</span>
          </div>
        </div>

        <!-- Risk Metrics -->
        <div class="veri-ai-metrics-section">
          <h4>Risk Analysis</h4>
          ${this.createMetricBar('Hallucination Risk', data.hallucinationRisk, 'high')}
          ${this.createMetricBar('Manipulation Risk', data.manipulationRisk, 'high')}
          ${this.createMetricBar('Reasoning Quality', data.reasoningQuality, 'low')}
        </div>

        <!-- Bias Detection -->
        <div class="veri-ai-bias-section">
          <h4>Bias Detection</h4>
          ${this.createBiasReport(data.bias)}
        </div>

        <!-- Recommendations -->
        <div class="veri-ai-recommendations-section">
          <h4>Recommendations</h4>
          <ul class="veri-ai-recommendations-list">
            ${data.recommendations.map(rec => `
              <li>${this.escapeHtml(rec)}</li>
            `).join('')}
          </ul>
        </div>

        <!-- Footer -->
        <div class="veri-ai-report-footer">
          <span class="veri-ai-verified-by">
            Verified by <strong>${data.verifiedBy}</strong>
          </span>
          <span class="veri-ai-timestamp">
            ${new Date(data.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    `;

    // Add styles
    this.injectStyles();

    // Add event listeners
    const closeBtn = container.querySelector('#veri-ai-close-report');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideReport());
    }

    return container;
  }

  /**
   * Create metric bar visualization
   */
  private createMetricBar(label: string, value: number, risk: 'high' | 'low'): string {
    const percentage = Math.round(value * 100);
    const isHighRisk = risk === 'high';
    const displayValue = isHighRisk ? percentage : percentage;
    const barClass = this.getRiskClass(value, isHighRisk);

    return `
      <div class="veri-ai-metric">
        <div class="veri-ai-metric-label">${label}</div>
        <div class="veri-ai-metric-bar">
          <div class="veri-ai-metric-fill ${barClass}" style="width: ${percentage}%"></div>
        </div>
        <div class="veri-ai-metric-value">${displayValue}%</div>
      </div>
    `;
  }

  /**
   * Create bias report section
   */
  private createBiasReport(bias: any): string {
    const biasTypes = [
      { key: 'genderBias', label: 'Gender Bias', icon: '⚧' },
      { key: 'racialBias', label: 'Racial Bias', icon: '🌍' },
      { key: 'culturalBias', label: 'Cultural Bias', icon: '🌐' },
      { key: 'politicalBias', label: 'Political Bias', icon: '⚖️' }
    ];

    return biasTypes.map(({ key, label, icon }) => {
      const biasData = bias[key];
      if (!biasData) return '';

      const severity = Math.round(biasData.severity * 100);
      const statusClass = biasData.detected ? 'detected' : 'clear';
      const statusIcon = biasData.detected ? '⚠️' : '✓';

      return `
        <div class="veri-ai-bias-item ${statusClass}">
          <div class="veri-ai-bias-header">
            <span class="veri-ai-bias-icon">${icon}</span>
            <span class="veri-ai-bias-label">${label}</span>
            <span class="veri-ai-bias-status">${statusIcon}</span>
          </div>
          ${biasData.detected ? `
            <div class="veri-ai-bias-details">
              <div class="veri-ai-bias-severity">Severity: ${severity}%</div>
              ${biasData.examples && biasData.examples.length > 0 ? `
                <div class="veri-ai-bias-examples">
                  ${biasData.examples.map((ex: string) => `
                    <div class="veri-ai-bias-example">"${this.escapeHtml(ex)}"</div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Get trust score CSS class
   */
  private getTrustScoreClass(score: number): string {
    if (score >= 80) return 'trust-high';
    if (score >= 60) return 'trust-medium';
    return 'trust-low';
  }

  /**
   * Get verdict CSS class
   */
  private getVerdictClass(verdict: string): string {
    switch (verdict) {
      case 'safe': return 'verdict-safe';
      case 'questionable': return 'verdict-questionable';
      case 'unsafe': return 'verdict-unsafe';
      default: return '';
    }
  }

  /**
   * Get verdict icon
   */
  private getVerdictIcon(verdict: string): string {
    switch (verdict) {
      case 'safe': return '✅';
      case 'questionable': return '⚠️';
      case 'unsafe': return '🚫';
      default: return '?';
    }
  }

  /**
   * Get risk class based on value
   */
  private getRiskClass(value: number, isHighRisk: boolean): string {
    if (isHighRisk) {
      if (value >= 0.7) return 'risk-high';
      if (value >= 0.4) return 'risk-medium';
      return 'risk-low';
    } else {
      if (value >= 0.7) return 'risk-low';
      if (value >= 0.4) return 'risk-medium';
      return 'risk-high';
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Hide report with animation
   */
  public hideReport(): void {
    if (this.container) {
      this.container.style.opacity = '0';
      this.container.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (this.container) {
          this.container.remove();
          this.container = null;
        }
      }, 300);
    }
  }

  /**
   * Inject CSS styles for the report
   */
  private injectStyles(): void {
    if (document.getElementById('veri-ai-cross-model-styles')) return;

    const style = document.createElement('style');
    style.id = 'veri-ai-cross-model-styles';
    style.textContent = `
      #veri-ai-cross-model-report {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 450px;
        max-height: 90vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #ffffff;
        overflow: hidden;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .veri-ai-report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      }

      .veri-ai-report-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .veri-ai-icon {
        font-size: 24px;
      }

      .veri-ai-report-title h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .veri-ai-close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;
      }

      .veri-ai-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .veri-ai-report-body {
        padding: 20px;
        max-height: calc(90vh - 100px);
        overflow-y: auto;
      }

      .veri-ai-trust-section {
        margin-bottom: 24px;
      }

      .veri-ai-trust-score {
        text-align: center;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 16px;
      }

      .veri-ai-trust-score.trust-high {
        background: linear-gradient(135deg, #00ff88 0%, #00cc6f 100%);
      }

      .veri-ai-trust-score.trust-medium {
        background: linear-gradient(135deg, #ffaa00 0%, #ff8800 100%);
      }

      .veri-ai-trust-score.trust-low {
        background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
      }

      .veri-ai-score-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        opacity: 0.9;
        margin-bottom: 8px;
      }

      .veri-ai-score-value {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 12px;
      }

      .veri-ai-score-bar {
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
      }

      .veri-ai-score-fill {
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .veri-ai-verdict {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
      }

      .veri-ai-verdict.verdict-safe {
        background: rgba(0, 255, 136, 0.2);
        color: #00ff88;
      }

      .veri-ai-verdict.verdict-questionable {
        background: rgba(255, 170, 0, 0.2);
        color: #ffaa00;
      }

      .veri-ai-verdict.verdict-unsafe {
        background: rgba(255, 68, 68, 0.2);
        color: #ff4444;
      }

      .veri-ai-metrics-section,
      .veri-ai-bias-section,
      .veri-ai-recommendations-section {
        margin-bottom: 24px;
      }

      .veri-ai-metrics-section h4,
      .veri-ai-bias-section h4,
      .veri-ai-recommendations-section h4 {
        margin: 0 0 16px 0;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        opacity: 0.7;
      }

      .veri-ai-metric {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .veri-ai-metric-label {
        font-size: 13px;
      }

      .veri-ai-metric-bar {
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
      }

      .veri-ai-metric-fill {
        height: 100%;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .veri-ai-metric-fill.risk-low {
        background: linear-gradient(90deg, #00ff88 0%, #00cc6f 100%);
      }

      .veri-ai-metric-fill.risk-medium {
        background: linear-gradient(90deg, #ffaa00 0%, #ff8800 100%);
      }

      .veri-ai-metric-fill.risk-high {
        background: linear-gradient(90deg, #ff4444 0%, #cc0000 100%);
      }

      .veri-ai-metric-value {
        font-size: 13px;
        font-weight: 600;
      }

      .veri-ai-bias-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        border-left: 4px solid transparent;
      }

      .veri-ai-bias-item.detected {
        border-left-color: #ffaa00;
        background: rgba(255, 170, 0, 0.1);
      }

      .veri-ai-bias-item.clear {
        border-left-color: #00ff88;
      }

      .veri-ai-bias-header {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .veri-ai-bias-label {
        flex: 1;
        font-weight: 500;
      }

      .veri-ai-bias-details {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .veri-ai-bias-severity {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 8px;
      }

      .veri-ai-bias-example {
        background: rgba(0, 0, 0, 0.3);
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        margin-top: 4px;
        font-style: italic;
      }

      .veri-ai-recommendations-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .veri-ai-recommendations-list li {
        background: rgba(0, 212, 255, 0.1);
        border-left: 3px solid #00d4ff;
        padding: 12px;
        margin-bottom: 8px;
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.5;
      }

      .veri-ai-report-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 11px;
        opacity: 0.6;
      }

      @media (max-width: 768px) {
        #veri-ai-cross-model-report {
          width: calc(100% - 40px);
          right: 20px;
          left: 20px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}
