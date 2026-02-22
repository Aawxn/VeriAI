/**
 * Cross-AI Optimization UI Component
 * Displays optimized answer and comparative analysis from multiple AI models
 */

import type { CrossAIVerificationResult } from '../../types';

export class CrossAIOptimizationUI {
  private container: HTMLElement | null = null;

  /**
   * Display cross-AI optimization results
   */
  public displayOptimizationReport(data: CrossAIVerificationResult): void {
    console.log('🌟 Displaying Cross-AI Optimization Report...');
    console.log('📊 Report data:', data);

    // Validate data structure
    if (!data || typeof data !== 'object') {
      console.error('❌ Invalid data for optimization report:', data);
      alert('❌ Invalid optimization data received');
      return;
    }

    // Remove existing report if any
    this.removeExistingReport();

    try {
      // Create report container
      this.container = this.createReportContainer(data);
      
      // Check if main sidebar has purple theme and apply it
      const mainSidebar = document.querySelector('.ai-ethics-sidebar');
      if (mainSidebar && mainSidebar.classList.contains('purple-theme')) {
        this.container.classList.add('purple-theme');
      }

      // Add to page
      document.body.appendChild(this.container);

      // Animate in
      setTimeout(() => {
        if (this.container) {
          this.container.style.opacity = '1';
          this.container.style.transform = 'translateY(0)';
        }
      }, 10);

      console.log('✅ Optimization report displayed successfully');
    } catch (error) {
      console.error('❌ Error displaying optimization report:', error);
      alert(`❌ Failed to display report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove existing report
   */
  private removeExistingReport(): void {
    const existing = document.getElementById('veri-ai-cross-ai-report');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Create report container
   */
  private createReportContainer(data: CrossAIVerificationResult): HTMLElement {
    const container = document.createElement('div');
    container.id = 'veri-ai-cross-ai-report';
    container.className = 'veri-cross-ai-container';

    container.innerHTML = `
      ${this.injectStyles()}
      
      <div class="veri-cross-ai-overlay">
        <div class="veri-cross-ai-modal">
          <!-- Header -->
          <div class="veri-cross-ai-header">
            <div class="veri-cross-ai-title">
              <span class="veri-cross-ai-icon">⚖️</span>
              <span>Cross-AI Optimization</span>
            </div>
            <button class="veri-cross-ai-close" onclick="document.getElementById('veri-ai-cross-ai-report').remove()">
              ×
            </button>
          </div>

          <!-- Scrollable Content -->
          <div class="veri-cross-ai-content">

          <!-- Scores Section -->
          <div class="veri-cross-ai-scores">
            <div class="veri-score-card">
              <div class="veri-score-label">Consistency</div>
              <div class="veri-score-value ${this.getScoreClass(data.consistencyScore)}">
                ${data.consistencyScore}/100
              </div>
              ${this.createScoreBar(data.consistencyScore)}
            </div>
            <div class="veri-score-card">
              <div class="veri-score-label">Completeness</div>
              <div class="veri-score-value ${this.getScoreClass(data.completenessScore)}">
                ${data.completenessScore}/100
              </div>
              ${this.createScoreBar(data.completenessScore)}
            </div>
            <div class="veri-score-card">
              <div class="veri-score-label">Bias Risk</div>
              <div class="veri-score-value ${this.getBiasScoreClass(data.biasRiskScore)}">
                ${data.biasRiskScore}/100
              </div>
              ${this.createScoreBar(data.biasRiskScore, true)}
            </div>
          </div>

          <!-- Best Model Badge -->
          <div class="veri-best-model-badge">
            🏆 Best Model: <strong>${data.bestModel}</strong>
          </div>

          <!-- Final Optimized Answer -->
          <div class="veri-cross-ai-section">
            <div class="veri-section-title">✨ Final Optimized Answer</div>
            <div class="veri-final-answer">
              ${this.formatAnswer(data.finalAnswer)}
            </div>
          </div>

          <!-- Comparative Analysis -->
          <div class="veri-cross-ai-section">
            <div class="veri-section-title">🔍 Comparative Analysis</div>
            ${this.renderComparativeAnalysis(data.comparativeAnalysis)}
          </div>

          <!-- Model Responses Comparison -->
          <div class="veri-cross-ai-section">
            <div class="veri-section-title">🤖 Model Responses</div>
            ${this.renderModelResponses(data.modelResponses)}
          </div>

          <!-- Model Notes -->
          <div class="veri-cross-ai-section">
            <div class="veri-section-title">📝 Model Performance Notes</div>
            ${this.renderModelNotes(data.modelNotes)}
          </div>

          <!-- Recommendations -->
          <div class="veri-cross-ai-section">
            <div class="veri-section-title">💡 Recommendations</div>
            <div class="veri-recommendations-list">
              ${data.recommendations.map(rec => `
                <div class="veri-recommendation-item">${rec}</div>
              `).join('')}
            </div>
          </div>

          <!-- How Consensus Works (Collapsible) -->
          <div class="veri-cross-ai-section">
            <div class="veri-section-title veri-collapsible-header" onclick="this.nextElementSibling.classList.toggle('veri-collapsed')">
              🧠 How Consensus Works
              <span class="veri-collapse-icon">▼</span>
            </div>
            <div class="veri-consensus-explanation veri-collapsed">
              <div class="veri-consensus-step">
                <div class="veri-step-number">1</div>
                <div class="veri-step-content">
                  <strong>Parallel Model Querying</strong>
                  <p>When you click "Optimize", we simultaneously query Claude, Gemini, and DeepSeek with your question. Each model responds independently.</p>
                </div>
              </div>
              
              <div class="veri-consensus-step">
                <div class="veri-step-number">2</div>
                <div class="veri-step-content">
                  <strong>Meta-Evaluation</strong>
                  <p>A meta-evaluator AI (Claude or Gemini) analyzes ALL responses, comparing facts, reasoning quality, and completeness.</p>
                </div>
              </div>
              
              <div class="veri-consensus-step">
                <div class="veri-step-number">3</div>
                <div class="veri-step-content">
                  <strong>Scoring Algorithm</strong>
                  <ul class="veri-scoring-list">
                    <li><strong>Consistency (0-100):</strong> How much models agree. 90+ = strong consensus, &lt;50 = contradictions.</li>
                    <li><strong>Completeness (0-100):</strong> How comprehensive the answer is. 90+ = all aspects covered.</li>
                    <li><strong>Bias Risk (0-100):</strong> Potential bias detected. 0-20 = safe, 75+ = critical risk.</li>
                  </ul>
                </div>
              </div>
              
              <div class="veri-consensus-step">
                <div class="veri-step-number">4</div>
                <div class="veri-step-content">
                  <strong>Best Model Selection</strong>
                  <p>Models are scored on: <strong>Factual accuracy (40%)</strong>, <strong>Reasoning quality (30%)</strong>, <strong>Completeness (20%)</strong>, and <strong>Low bias (10%)</strong>. The highest scorer is marked as "Best Model".</p>
                </div>
              </div>
              
              <div class="veri-consensus-step">
                <div class="veri-step-number">5</div>
                <div class="veri-step-content">
                  <strong>Final Synthesis</strong>
                  <p>The meta-evaluator combines accurate facts from all models, fills gaps, corrects errors, and removes bias to produce the "Final Optimized Answer".</p>
                </div>
              </div>
              
              <div class="veri-consensus-benefits">
                <strong>Why This Works:</strong>
                <ul>
                  <li>✓ <strong>Diverse Perspectives:</strong> Each AI has different strengths and training data</li>
                  <li>✓ <strong>Error Cancellation:</strong> One model's mistake is caught by others</li>
                  <li>✓ <strong>Bias Reduction:</strong> Averaging reduces systematic bias</li>
                  <li>✓ <strong>Confidence Calibration:</strong> High agreement = high confidence</li>
                </ul>
              </div>
              
              <div class="veri-consensus-footer">
                📚 <a href="https://github.com/yourusername/VeriAI/blob/main/docs/CONSENSUS_ENGINE.md" target="_blank" style="color: var(--theme-primary)">Read Full Documentation</a>
              </div>
            </div>
          </div>

          </div>

          <!-- Metadata -->
          <div class="veri-cross-ai-meta">
            <span class="veri-meta-item">🕐 ${this.formatTime(data.timestamp)}</span>
            <span class="veri-meta-item">🔬 Verified by ${Object.keys(data.modelResponses).length} AI models</span>
          </div>
        </div>
      </div>
    `;

    return container;
  }

  /**
   * Render comparative analysis
   */
  private renderComparativeAnalysis(analysis: CrossAIVerificationResult['comparativeAnalysis']): string {
    // Safety check
    if (!analysis || typeof analysis !== 'object') {
      return '<div class="veri-error">⚠️ Comparative analysis data unavailable</div>';
    }

    const agreements = Array.isArray(analysis.agreements) ? analysis.agreements : [];
    const contradictions = Array.isArray(analysis.contradictions) ? analysis.contradictions : [];
    const uniqueInsights = Array.isArray(analysis.uniqueInsights) ? analysis.uniqueInsights : [];
    const commonWeaknesses = Array.isArray(analysis.commonWeaknesses) ? analysis.commonWeaknesses : [];

    return `
      <div class="veri-analysis-grid">
        <div class="veri-analysis-card">
          <div class="veri-analysis-card-title">✅ Agreements</div>
          <ul class="veri-analysis-list">
            ${agreements.length > 0
              ? agreements.map(item => `<li>${item}</li>`).join('')
              : '<li class="veri-no-issues">Models provided similar information</li>'
            }
          </ul>
        </div>
        
        <div class="veri-analysis-card">
          <div class="veri-analysis-card-title">⚠️ Contradictions</div>
          <ul class="veri-analysis-list">
            ${contradictions.length > 0 
              ? contradictions.map(item => `<li>${item}</li>`).join('')
              : '<li class="veri-no-issues">No major contradictions found</li>'
            }
          </ul>
        </div>
        
        <div class="veri-analysis-card">
          <div class="veri-analysis-card-title">💎 Unique Insights</div>
          <ul class="veri-analysis-list">
            ${uniqueInsights.length > 0
              ? uniqueInsights.map(item => `<li>${item}</li>`).join('')
              : '<li class="veri-no-issues">No unique insights identified</li>'
            }
          </ul>
        </div>
        
        <div class="veri-analysis-card">
          <div class="veri-analysis-card-title">🔧 Common Weaknesses</div>
          <ul class="veri-analysis-list">
            ${commonWeaknesses.length > 0
              ? commonWeaknesses.map(item => `<li>${item}</li>`).join('')
              : '<li class="veri-no-issues">No common weaknesses identified</li>'
            }
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Render model responses comparison
   */
  private renderModelResponses(responses: Record<string, any>): string {
    return `
      <div class="veri-model-responses">
        ${Object.entries(responses).map(([model, response]) => `
          <div class="veri-model-response-card">
            <div class="veri-model-name">
              ${this.getModelIcon(model)} ${this.formatModelName(model)}
              <span class="veri-response-time">${response.responseTime}ms</span>
            </div>
            <div class="veri-model-answer">
              ${response.error 
                ? `<span class="veri-error">❌ ${response.error}</span>`
                : this.truncateText(response.answer, 200)
              }
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render model performance notes
   */
  private renderModelNotes(notes: Record<string, string>): string {
    return `
      <div class="veri-model-notes">
        ${Object.entries(notes).map(([model, note]) => `
          <div class="veri-model-note">
            <span class="veri-model-label">${this.formatModelName(model)}:</span>
            <span class="veri-model-note-text">${note}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Helper: Create score bar visualization
   */
  private createScoreBar(score: number, inverted: boolean = false): string {
    const percentage = Math.min(100, Math.max(0, score));
    const color = inverted 
      ? (score < 30 ? '#4ade80' : score < 70 ? '#fbbf24' : '#f87171')
      : (score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171');
    
    return `
      <div class="veri-score-bar">
        <div class="veri-score-fill" style="width: ${percentage}%; background: ${color};"></div>
      </div>
    `;
  }

  /**
   * Helper: Get score class
   */
  private getScoreClass(score: number): string {
    if (score >= 80) return 'veri-score-high';
    if (score >= 60) return 'veri-score-medium';
    return 'veri-score-low';
  }

  /**
   * Helper: Get bias score class (inverted)
   */
  private getBiasScoreClass(score: number): string {
    if (score < 30) return 'veri-score-high';
    if (score < 70) return 'veri-score-medium';
    return 'veri-score-low';
  }

  /**
   * Helper: Format answer with paragraphs
   */
  private formatAnswer(answer: string): string {
    // Convert markdown to HTML
    let html = answer;
    
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_ (but not if it's part of **)
    html = html.replace(/(?<!\*)\*([^\*]+?)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>');
    
    // Headers: ## text or ### text
    html = html.replace(/^### (.+)$/gm, '<h4 style="font-size: 14px; font-weight: 600; color: var(--theme-primary); margin: 15px 0 8px 0;">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 style="font-size: 15px; font-weight: 700; color: var(--theme-primary); margin: 18px 0 10px 0;">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 style="font-size: 16px; font-weight: 700; color: var(--theme-primary); margin: 20px 0 12px 0;">$1</h2>');
    
    // Bullet lists: * item or - item
    html = html.replace(/^[\*\-] (.+)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>');
    
    // Numbered lists: 1. item
    html = html.replace(/^\d+\. (.+)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px; list-style-type: decimal;">$1</li>');
    
    // Wrap consecutive <li> in <ul> or <ol>
    html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, (match) => {
      if (match.includes('list-style-type: decimal')) {
        return `<ol style="margin: 10px 0; padding-left: 20px;">${match}</ol>`;
      }
      return `<ul style="margin: 10px 0; padding-left: 20px;">${match}</ul>`;
    });
    
    // Code blocks: ```text```
    html = html.replace(/```(.+?)```/gs, '<pre style="background: var(--theme-bg-dark); padding: 10px; border-radius: 5px; overflow-x: auto; margin: 10px 0;"><code>$1</code></pre>');
    
    // Inline code: `text`
    html = html.replace(/`([^`]+)`/g, '<code style="background: var(--theme-bg-dark); padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 12px;">$1</code>');
    
    // Links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--theme-primary); text-decoration: underline;">$1</a>');
    
    // Blockquotes: > text
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left: 3px solid var(--theme-primary); padding-left: 12px; margin: 10px 0; color: var(--theme-text-muted); font-style: italic;">$1</blockquote>');
    
    // Horizontal rules: --- or ***
    html = html.replace(/^(---|\*\*\*)$/gm, '<hr style="border: none; border-top: 1px solid var(--theme-border); margin: 20px 0;">');
    
    // Paragraphs: Split by double newlines
    html = html
      .split('\n\n')
      .map(para => {
        para = para.trim();
        // Don't wrap if already wrapped in HTML tags
        if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<ol') || 
            para.startsWith('<pre') || para.startsWith('<blockquote') || para.startsWith('<hr')) {
          return para;
        }
        // Replace single newlines with <br>
        para = para.replace(/\n/g, '<br>');
        return para ? `<p style="margin: 10px 0; line-height: 1.6;">${para}</p>` : '';
      })
      .join('');
    
    return html;
  }

  /**
   * Helper: Get model icon
   */
  private getModelIcon(model: string): string {
    const icons: Record<string, string> = {
      'chatgpt': '🟢',
      'claude': '🟣',
      'gemini': '🔵',
      'deepseek': '🔶',
      'copilot': '🟦'
    };
    return icons[model.toLowerCase()] || '🤖';
  }

  /**
   * Helper: Format model name
   */
  private formatModelName(model: string): string {
    const names: Record<string, string> = {
      'chatgpt': 'ChatGPT',
      'claude': 'Claude',
      'gemini': 'Gemini',
      'deepseek': 'DeepSeek',
      'copilot': 'Copilot',
      'claude-sonnet-4.5': 'Claude Sonnet 4.5',
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'deepseek-chat': 'DeepSeek Chat'
    };
    return names[model.toLowerCase()] || model;
  }

  /**
   * Helper: Truncate text
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Helper: Format timestamp
   */
  private formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString();
  }

  /**
   * Inject CSS styles
   */
  private injectStyles(): string {
    return `
      <style>
        .veri-cross-ai-container {
          --theme-primary: #00B6E5;
          --theme-secondary: #0099cc;
        }
        
        .veri-cross-ai-container.purple-theme {
          --theme-primary: #AD7BCD;
          --theme-secondary: #8B5BA8;
        }
        
        .veri-cross-ai-container * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .veri-cross-ai-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 2147483647;
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          pointer-events: auto;
        }
        
        .veri-cross-ai-modal {
          position: fixed;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          background: #192426;
          border-right: 1px solid var(--theme-primary, #00B6E5);
          border-radius: 0;
          width: 480px;
          height: 100vh;
          overflow: hidden;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
          animation: veri-slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          z-index: 2147483647;
          pointer-events: auto;
        }
        
        @keyframes veri-slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .veri-cross-ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--theme-primary, #00B6E5);
          background: linear-gradient(135deg, var(--theme-primary, #00B6E5) 0%, var(--theme-secondary, #0099cc) 100%);
          flex-shrink: 0;
        }
        
        .veri-cross-ai-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: 0.3px;
        }
        
        .veri-cross-ai-icon {
          font-size: 24px;
          line-height: 1;
        }
        
        .veri-cross-ai-close {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 24px;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .veri-cross-ai-close:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          color: #f87171;
          transform: scale(1.05);
        }
        
        .veri-cross-ai-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        .veri-cross-ai-scores {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 20px;
          background: color-mix(in srgb, var(--theme-primary, #00B6E5) 5%, transparent);
        }
        
        .veri-score-card {
          background: #1a2d2e;
          border: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 30%, transparent);
          border-left: 3px solid var(--theme-primary, #00B6E5);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .veri-score-card:hover {
          background: #1f3536;
          transform: translateX(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .veri-score-label {
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .veri-score-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 14px;
          letter-spacing: -1px;
        }
        
        .veri-score-high { color: #4ade80; }
        .veri-score-medium { color: #fbbf24; }
        .veri-score-low { color: #f87171; }
        
        .veri-score-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .veri-score-fill {
          height: 100%;
          transition: width 0.5s ease;
          border-radius: 3px;
        }
        
        .veri-best-model-badge {
          margin: 0 20px 16px 20px;
          padding: 10px 14px;
          background: color-mix(in srgb, var(--theme-primary, #00B6E5) 15%, transparent);
          color: var(--theme-primary, #00B6E5);
          border: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 30%, transparent);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        
        .veri-best-model-badge strong {
          color: var(--theme-primary, #00B6E5);
          font-weight: 700;
        }
        
        .veri-cross-ai-section {
          padding: 20px;
          border-top: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 20%, transparent);
        }
        
        .veri-section-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--theme-primary, #00B6E5);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          padding-left: 4px;
          border-left: 3px solid var(--theme-primary, #00B6E5);
        }
        
        .veri-final-answer {
          background: #1a2d2e;
          border: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 20%, transparent);
          border-left: 3px solid var(--theme-primary, #00B6E5);
          border-radius: 8px;
          padding: 14px;
          color: #e0e0e0;
          line-height: 1.6;
          font-size: 13px;
        }
        
        .veri-final-answer p {
          margin-bottom: 12px;
        }
        
        .veri-final-answer p:last-child {
          margin-bottom: 0;
        }
        
        .veri-analysis-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        
        .veri-analysis-card {
          background: #1a2d2e;
          border: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 20%, transparent);
          border-left: 3px solid var(--theme-primary, #00B6E5);
          border-radius: 8px;
          padding: 14px;
          transition: all 0.2s ease;
        }
        
        .veri-analysis-card:hover {
          background: #1f3536;
          transform: translateX(-2px);
        }
        
        .veri-analysis-card-title {
          font-size: 10px;
          font-weight: 600;
          color: var(--theme-primary, #00B6E5);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 3px 8px;
          background: color-mix(in srgb, var(--theme-primary, #00B6E5) 15%, transparent);
          border-radius: 4px;
          display: inline-block;
        }
        
        .veri-analysis-list {
          list-style: none;
          padding: 0;
        }
        
        .veri-analysis-list li {
          color: #d1d5db;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }
        
        .veri-analysis-list li:before {
          content: "•";
          position: absolute;
          left: 8px;
          color: var(--theme-primary, #00B6E5);
        }
        
        .veri-analysis-list li.veri-no-issues {
          color: #9ca3af;
          font-style: italic;
        }
        
        .veri-model-responses {
          display: grid;
          gap: 12px;
        }
        
        .veri-model-response-card {
          background: #1a2d2e;
          border: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 20%, transparent);
          border-left: 3px solid var(--theme-primary, #00B6E5);
          border-radius: 8px;
          padding: 12px;
          transition: all 0.2s ease;
        }
        
        .veri-model-response-card:hover {
          background: #1f3536;
          transform: translateX(-2px);
        }
        
        .veri-model-name {
          font-size: 11px;
          font-weight: 600;
          color: var(--theme-primary, #00B6E5);
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .veri-response-time {
          font-size: 11px;
          color: #9ca3af;
          font-weight: normal;
        }
        
        .veri-model-answer {
          font-size: 12px;
          color: #e0e0e0;
          line-height: 1.6;
        }
        
        .veri-error {
          color: #f87171;
        }
        
        .veri-model-notes {
          display: grid;
          gap: 8px;
        }
        
        .veri-model-note {
          background: #1a2d2e;
          border: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 20%, transparent);
          border-left: 3px solid var(--theme-primary, #00B6E5);
          padding: 10px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .veri-model-note:hover {
          background: #1f3536;
          transform: translateX(-2px);
        }
        
        .veri-model-label {
          font-weight: 600;
          color: var(--theme-primary, #00B6E5);
          margin-right: 8px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .veri-model-note-text {
          color: #e0e0e0;
          font-size: 12px;
        }
        
        .veri-recommendations-list {
          display: grid;
          gap: 8px;
        }
        
        .veri-recommendation-item {
          background: #1a2d2e;
          border: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 20%, transparent);
          border-left: 3px solid var(--theme-primary, #00B6E5);
          border-radius: 6px;
          padding: 10px 12px;
          color: #e0e0e0;
          font-size: 12px;
          line-height: 1.6;
          transition: all 0.2s ease;
        }
        
        .veri-recommendation-item:hover {
          background: #1f3536;
          transform: translateX(-2px);
        }
        
        .veri-cross-ai-meta {
          padding: 16px 20px;
          background: color-mix(in srgb, var(--theme-primary, #00B6E5) 5%, transparent);
          border-top: 1px solid color-mix(in srgb, var(--theme-primary, #00B6E5) 20%, transparent);
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 10px;
          color: #888;
          flex-shrink: 0;
        }
        
        .veri-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        /* Scrollbar styling */
        .veri-cross-ai-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .veri-cross-ai-content::-webkit-scrollbar-track {
          background: #192426;
        }
        
        .veri-cross-ai-content::-webkit-scrollbar-thumb {
          background: var(--theme-primary, #00B6E5);
          border-radius: 4px;
        }
        
        .veri-cross-ai-content::-webkit-scrollbar-thumb:hover {
          background: var(--theme-secondary, #0099cc);
        }
        
        /* Consensus Explanation Styles */
        .veri-collapsible-header {
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
          transition: all 0.2s ease;
        }
        
        .veri-collapsible-header:hover {
          transform: translateX(2px);
        }
        
        .veri-collapse-icon {
          font-size: 12px;
          transition: transform 0.3s ease;
          color: var(--theme-primary, #00B6E5);
        }
        
        .veri-collapsible-header:hover .veri-collapse-icon {
          color: var(--theme-secondary, #0099cc);
        }
        
        .veri-consensus-explanation {
          max-height: 2000px;
          overflow: hidden;
          transition: max-height 0.5s ease, opacity 0.3s ease;
          opacity: 1;
        }
        
        .veri-consensus-explanation.veri-collapsed {
          max-height: 0;
          opacity: 0;
        }
        
        .veri-collapsed + .veri-collapsible-header .veri-collapse-icon {
          transform: rotate(-90deg);
        }
        
        .veri-consensus-step {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .veri-consensus-step:last-of-type {
          border-bottom: none;
        }
        
        .veri-step-number {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--theme-primary, #00B6E5), var(--theme-secondary, #0099cc));
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }
        
        .veri-step-content {
          flex: 1;
        }
        
        .veri-step-content strong {
          display: block;
          color: var(--theme-primary, #00B6E5);
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .veri-step-content p {
          color: #e0e0e0;
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 8px;
        }
        
        .veri-scoring-list {
          list-style: none;
          padding: 0;
          margin: 8px 0 0 0;
        }
        
        .veri-scoring-list li {
          color: #e0e0e0;
          font-size: 11px;
          line-height: 1.6;
          padding: 4px 0;
          padding-left: 16px;
          position: relative;
        }
        
        .veri-scoring-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--theme-primary, #00B6E5);
        }
        
        .veri-consensus-benefits {
          background: rgba(0, 182, 229, 0.05);
          border: 1px solid rgba(0, 182, 229, 0.2);
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }
        
        .veri-consensus-benefits strong {
          display: block;
          color: var(--theme-primary, #00B6E5);
          margin-bottom: 12px;
          font-size: 13px;
        }
        
        .veri-consensus-benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .veri-consensus-benefits li {
          color: #e0e0e0;
          font-size: 12px;
          line-height: 1.8;
          padding: 4px 0;
        }
        
        .veri-consensus-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
          font-size: 11px;
          color: #888;
        }
        
        .veri-consensus-footer a {
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        
        .veri-consensus-footer a:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
      </style>
    `;
  }
}
