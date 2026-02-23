/**
 * Structured Output Schema — Feature 5
 * 
 * Defines and validates JSON schemas for AI reasoning outputs.
 * When the Prompt Injector uses JSON mode, the response parser uses these
 * schemas to extract, validate, and normalize the structured data.
 */

// ─── Schema Definitions ────────────────────────────────────────────

export interface StructuredReasoningOutput {
  reasoning_steps: StructuredStep[];
  final_answer: string;
  overall_confidence: number;
  caveats: string[];
  verifiable_claims: StructuredClaim[];
}

export interface StructuredStep {
  step: number;
  type: 'assumption' | 'inference' | 'evidence' | 'conclusion';
  description: string;
  confidence: number;
  sources?: string[];
}

export interface StructuredClaim {
  claim: string;
  verifiable: boolean;
  source_hint?: string;
}

// ─── Parser & Validator ────────────────────────────────────────────

export class StructuredOutputParser {

  /**
   * Try to parse a structured JSON reasoning output from the AI's raw response.
   * Falls back gracefully if the response is not valid JSON.
   */
  public static parse(rawResponse: string): StructuredReasoningOutput | null {
    // 1. Try direct JSON parse
    const directParse = this.tryParseJSON(rawResponse);
    if (directParse && this.validate(directParse)) {
      return this.normalize(directParse);
    }

    // 2. Try extracting JSON from a markdown code block
    const codeBlockJSON = this.extractJSONFromCodeBlock(rawResponse);
    if (codeBlockJSON) {
      const parsed = this.tryParseJSON(codeBlockJSON);
      if (parsed && this.validate(parsed)) {
        return this.normalize(parsed);
      }
    }

    // 3. Try extracting JSON substring from mixed text
    const embeddedJSON = this.extractEmbeddedJSON(rawResponse);
    if (embeddedJSON) {
      const parsed = this.tryParseJSON(embeddedJSON);
      if (parsed && this.validate(parsed)) {
        return this.normalize(parsed);
      }
    }

    console.log('ℹ️ Response is not in structured JSON format — using plain text analysis');
    return null;
  }

  /**
   * Validate that a parsed object conforms to the StructuredReasoningOutput schema
   */
  public static validate(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    // Must have reasoning_steps as an array
    if (!Array.isArray(obj.reasoning_steps)) return false;
    
    // Must have final_answer as a string
    if (typeof obj.final_answer !== 'string') return false;
    
    // Validate each step has required fields
    for (const step of obj.reasoning_steps) {
      if (typeof step.step !== 'number') return false;
      if (!['assumption', 'inference', 'evidence', 'conclusion'].includes(step.type)) return false;
      if (typeof step.description !== 'string') return false;
      if (typeof step.confidence !== 'number' || step.confidence < 0 || step.confidence > 1) return false;
    }

    return true;
  }

  /**
   * Normalize a parsed object to ensure all fields are present with defaults
   */
  public static normalize(obj: any): StructuredReasoningOutput {
    return {
      reasoning_steps: (obj.reasoning_steps || []).map((s: any, i: number) => ({
        step: s.step ?? i + 1,
        type: s.type || 'inference',
        description: s.description || '',
        confidence: typeof s.confidence === 'number' ? Math.max(0, Math.min(1, s.confidence)) : 0.5,
        sources: Array.isArray(s.sources) ? s.sources : []
      })),
      final_answer: obj.final_answer || '',
      overall_confidence: typeof obj.overall_confidence === 'number' 
        ? Math.max(0, Math.min(1, obj.overall_confidence)) : 0.5,
      caveats: Array.isArray(obj.caveats) ? obj.caveats : [],
      verifiable_claims: (obj.verifiable_claims || []).map((c: any) => ({
        claim: c.claim || '',
        verifiable: typeof c.verifiable === 'boolean' ? c.verifiable : false,
        source_hint: c.source_hint || ''
      }))
    };
  }

  /**
   * Convert a StructuredReasoningOutput into display-ready HTML sections
   */
  public static toDisplayHTML(output: StructuredReasoningOutput): string {
    const stepsHTML = output.reasoning_steps.map(step => {
      const typeEmoji = {
        assumption: '💭',
        inference: '🔗',
        evidence: '📎',
        conclusion: '✅'
      }[step.type] || '•';

      const confPct = Math.round(step.confidence * 100);
      const confColor = step.confidence > 0.7 ? '#4caf50' : step.confidence > 0.4 ? '#ff9800' : '#f44336';

      return `
        <div class="structured-step" style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid ${confColor};">
          <div style="font-size: 11px; color: #888; margin-bottom: 2px;">
            ${typeEmoji} Step ${step.step} — <span style="text-transform: capitalize;">${step.type}</span>
            <span style="float: right; color: ${confColor};">${confPct}%</span>
          </div>
          <div style="font-size: 12px; color: #ddd;">${this.escapeHTML(step.description)}</div>
          ${step.sources && step.sources.length > 0 
            ? `<div style="font-size: 10px; color: #888; margin-top: 4px;">📚 ${step.sources.map(s => this.escapeHTML(s)).join(', ')}</div>` 
            : ''}
        </div>`;
    }).join('');

    const claimsHTML = output.verifiable_claims.length > 0 
      ? output.verifiable_claims.map(c => {
          const icon = c.verifiable ? '✅' : '⚠️';
          return `<div style="font-size: 11px; margin-bottom: 4px; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px;">
            ${icon} ${this.escapeHTML(c.claim)}
            ${c.source_hint ? `<br><span style="color: #888; font-size: 10px;">🔍 ${this.escapeHTML(c.source_hint)}</span>` : ''}
          </div>`;
        }).join('')
      : '<p style="color: #888; font-size: 11px;">No explicit claims extracted.</p>';

    const caveatsHTML = output.caveats.length > 0
      ? output.caveats.map(c => `<li style="font-size: 11px; color: #ddd;">${this.escapeHTML(c)}</li>`).join('')
      : '<li style="font-size: 11px; color: #888;">None stated.</li>';

    const overallPct = Math.round(output.overall_confidence * 100);

    return `
      <div class="structured-output-display">
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; font-size: 13px; color: #00d4ff; margin-bottom: 6px;">🧠 Structured Reasoning (${output.reasoning_steps.length} steps)</div>
          ${stepsHTML}
        </div>
        <div style="margin-bottom: 12px; padding: 8px; background: rgba(0,212,255,0.08); border-radius: 6px;">
          <div style="font-weight: 600; font-size: 12px; color: #00d4ff;">📌 Final Answer</div>
          <div style="font-size: 12px; color: #eee; margin-top: 4px;">${this.escapeHTML(output.final_answer)}</div>
          <div style="margin-top: 6px; font-size: 11px; color: #888;">Overall confidence: <strong style="color: #00d4ff;">${overallPct}%</strong></div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; font-size: 12px; color: #ff9800;">✓ Verifiable Claims</div>
          ${claimsHTML}
        </div>
        <div>
          <div style="font-weight: 600; font-size: 12px; color: #f44336;">⚠ Caveats</div>
          <ul style="margin: 4px 0; padding-left: 16px;">${caveatsHTML}</ul>
        </div>
      </div>
    `;
  }

  // ─── Helpers ───────────────────────────────────────────────────

  private static tryParseJSON(text: string): any | null {
    try {
      return JSON.parse(text.trim());
    } catch {
      return null;
    }
  }

  private static extractJSONFromCodeBlock(text: string): string | null {
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  }

  private static extractEmbeddedJSON(text: string): string | null {
    // Find the first { and last } to extract potential JSON
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return text.substring(firstBrace, lastBrace + 1);
    }
    return null;
  }

  private static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
