/**
 * AI Presence Detector — Hidden / Malicious AI Detection
 * 
 * Scans any webpage for signs of AI-generated content, hidden AI assistants,
 * or AI-powered chat widgets that users may not be aware of. This module
 * does NOT interfere with known platforms (ChatGPT, Claude, Gemini, Copilot,
 * Perplexity) — those are handled by the dedicated platform adapters.
 * 
 * Detection Strategies:
 *  1. DOM scanning — look for chat widget iframes, shadow DOMs, known widget SDKs
 *  2. Network fingerprinting — detect API calls to known AI providers
 *  3. Script analysis — identify loaded AI/LLM SDK scripts
 *  4. Content heuristics — detect AI-generated text patterns on the page
 *  5. Meta tag / header analysis — detect AI disclosure tags
 */

export interface AIPresenceReport {
  /** Is there any AI detected on this page? */
  detected: boolean;
  /** Confidence 0–100 */
  confidence: number;
  /** Individual detections */
  detections: AIDetection[];
  /** Human-readable summary */
  summary: string;
  /** Timestamp of scan */
  scannedAt: Date;
  /** URL scanned */
  url: string;
}

export interface AIDetection {
  type: DetectionType;
  name: string;
  description: string;
  confidence: number;        // 0–100
  severity: 'info' | 'warning' | 'danger';
  evidence: string;          // What triggered this detection
  category: DetectionCategory;
}

export type DetectionType =
  | 'chat_widget'          // Embedded chat widget (Intercom, Drift, etc.)
  | 'ai_api_call'          // Outbound API call to AI provider
  | 'ai_sdk_script'        // AI SDK script loaded on page
  | 'ai_generated_content' // Content that appears AI-generated
  | 'hidden_iframe'        // Hidden iframe loading AI service
  | 'ai_meta_tag'          // Meta tag disclosing AI usage
  | 'websocket_ai'         // WebSocket connection to AI service
  | 'shadow_dom_widget';   // Widget hidden in Shadow DOM

export type DetectionCategory =
  | 'chatbot'
  | 'content_generation'
  | 'recommendation'
  | 'analytics'
  | 'unknown';

// ──── Known AI Providers & Signatures ──────────────────────────

interface AISignature {
  name: string;
  category: DetectionCategory;
  /** URL patterns in scripts, iframes, or network requests */
  urlPatterns: RegExp[];
  /** DOM element selectors */
  domSelectors: string[];
  /** Global JS variable names */
  globalVars: string[];
  /** Severity: info = disclosed, warning = undisclosed, danger = potentially malicious */
  defaultSeverity: 'info' | 'warning' | 'danger';
}

const AI_SIGNATURES: AISignature[] = [
  // ── Chat Widgets ────────────────────────────────────
  {
    name: 'Intercom AI',
    category: 'chatbot',
    urlPatterns: [/intercom\.io/i, /intercomcdn\.com/i],
    domSelectors: ['#intercom-frame', '#intercom-container', '.intercom-lightweight-app'],
    globalVars: ['Intercom', 'intercomSettings'],
    defaultSeverity: 'info'
  },
  {
    name: 'Drift Chatbot',
    category: 'chatbot',
    urlPatterns: [/drift\.com/i, /driftt\.com/i],
    domSelectors: ['#drift-frame', '#drift-widget', '.drift-frame-controller'],
    globalVars: ['drift', 'driftt'],
    defaultSeverity: 'info'
  },
  {
    name: 'Zendesk AI',
    category: 'chatbot',
    urlPatterns: [/zdassets\.com/i, /zendesk\.com.*chat/i],
    domSelectors: ['#webWidget', '#launcher', 'iframe[title="Zendesk Chat"]'],
    globalVars: ['zE', 'zEACLoaded'],
    defaultSeverity: 'info'
  },
  {
    name: 'Tidio AI',
    category: 'chatbot',
    urlPatterns: [/tidio\.co/i, /tidiochat\.com/i],
    domSelectors: ['#tidio-chat', '#tidio-chat-iframe'],
    globalVars: ['tidioChatApi'],
    defaultSeverity: 'info'
  },
  {
    name: 'LiveChat AI',
    category: 'chatbot',
    urlPatterns: [/livechatinc\.com/i, /livechat\.com/i],
    domSelectors: ['#chat-widget-container', '#livechat-compact-container'],
    globalVars: ['LiveChatWidget', '__lc'],
    defaultSeverity: 'info'
  },
  {
    name: 'Crisp Chat',
    category: 'chatbot',
    urlPatterns: [/crisp\.chat/i, /client\.crisp\.chat/i],
    domSelectors: ['#crisp-chatbox', '.crisp-client'],
    globalVars: ['$crisp', 'CRISP_WEBSITE_ID'],
    defaultSeverity: 'info'
  },
  {
    name: 'HubSpot Chatbot',
    category: 'chatbot',
    urlPatterns: [/hubspot\.com.*conversations/i, /js\.usemessages\.com/i],
    domSelectors: ['#hubspot-messages-iframe-container', '#hs-chat-widget'],
    globalVars: ['HubSpotConversations'],
    defaultSeverity: 'info'
  },
  {
    name: 'Freshdesk / Freshchat AI',
    category: 'chatbot',
    urlPatterns: [/freshchat\.com/i, /freshdesk\.com/i, /freshbots\.ai/i],
    domSelectors: ['#freshchat-container', '#fc_frame'],
    globalVars: ['fcWidget', 'freshchat'],
    defaultSeverity: 'info'
  },
  {
    name: 'Ada AI Chatbot',
    category: 'chatbot',
    urlPatterns: [/ada\.support/i, /ada\.cx/i],
    domSelectors: ['#ada-button-frame', '#ada-chat-frame'],
    globalVars: ['adaEmbed'],
    defaultSeverity: 'info'
  },
  {
    name: 'Voiceflow AI',
    category: 'chatbot',
    urlPatterns: [/voiceflow\.com/i],
    domSelectors: ['#voiceflow-chat'],
    globalVars: ['voiceflow'],
    defaultSeverity: 'warning'
  },

  // ── AI API Providers ────────────────────────────────
  {
    name: 'OpenAI API',
    category: 'content_generation',
    urlPatterns: [/api\.openai\.com/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },
  {
    name: 'Anthropic API',
    category: 'content_generation',
    urlPatterns: [/api\.anthropic\.com/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },
  {
    name: 'Google AI / Vertex',
    category: 'content_generation',
    urlPatterns: [/generativelanguage\.googleapis\.com/i, /aiplatform\.googleapis\.com/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },
  {
    name: 'Cohere API',
    category: 'content_generation',
    urlPatterns: [/api\.cohere\.(ai|com)/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },
  {
    name: 'Hugging Face Inference',
    category: 'content_generation',
    urlPatterns: [/api-inference\.huggingface\.co/i, /huggingface\.co\/api/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },
  {
    name: 'Replicate API',
    category: 'content_generation',
    urlPatterns: [/api\.replicate\.com/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },
  {
    name: 'AI21 Labs',
    category: 'content_generation',
    urlPatterns: [/api\.ai21\.com/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },

  // ── AI Content SDKs ─────────────────────────────────
  {
    name: 'Grammarly AI',
    category: 'content_generation',
    urlPatterns: [/grammarly\.com/i, /grammarly-bg\.com/i],
    domSelectors: ['grammarly-desktop-integration', 'grammarly-extension'],
    globalVars: [],
    defaultSeverity: 'info'
  },
  {
    name: 'Copy.ai Widget',
    category: 'content_generation',
    urlPatterns: [/copy\.ai/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },
  {
    name: 'Jasper AI',
    category: 'content_generation',
    urlPatterns: [/jasper\.ai/i],
    domSelectors: [],
    globalVars: [],
    defaultSeverity: 'warning'
  },

  // ── AI Recommendation Engines ───────────────────────
  {
    name: 'Algolia AI Recommendations',
    category: 'recommendation',
    urlPatterns: [/algolia\.net.*recommend/i, /algolianet\.com/i],
    domSelectors: [],
    globalVars: ['algoliasearch', 'algoliaRecommend'],
    defaultSeverity: 'info'
  },
  {
    name: 'Dynamic Yield AI',
    category: 'recommendation',
    urlPatterns: [/dynamicyield\.com/i],
    domSelectors: [],
    globalVars: ['DY', 'DYO'],
    defaultSeverity: 'info'
  }
];

// Known platforms to SKIP (already handled by dedicated adapters)
const KNOWN_PLATFORM_DOMAINS = [
  'chatgpt.com',
  'chat.openai.com',
  'claude.ai',
  'gemini.google.com',
  'bard.google.com',
  'copilot.microsoft.com',
  'perplexity.ai'
];

// ──── AI Content Heuristic Patterns ────────────────────────────

const AI_CONTENT_PATTERNS = [
  // Disclosure patterns
  { pattern: /\b(AI[- ]generated|generated by AI|written by AI|powered by AI|AI[- ]powered)\b/i, confidence: 85, name: 'AI generation disclosure' },
  { pattern: /\b(this (response|answer|content) was generated|auto[- ]generated)\b/i, confidence: 75, name: 'Auto-generation disclosure' },
  { pattern: /\b(large language model|LLM|GPT|transformer[- ]based)\b/i, confidence: 60, name: 'LLM reference' },
  
  // AI-typical phrasing patterns (weaker signals)
  { pattern: /\bAs an AI( language model)?,? I\b/i, confidence: 95, name: 'AI self-identification' },
  { pattern: /\bI('m| am) (just )?an AI\b/i, confidence: 95, name: 'AI self-identification' },
  { pattern: /\bmy training data\b/i, confidence: 80, name: 'Training data reference' },
  { pattern: /\bmy knowledge cutoff\b/i, confidence: 90, name: 'Knowledge cutoff reference' },
];

// ──── Main Detector Class ──────────────────────────────────────

export class AIPresenceDetector {
  private static scanResults: AIPresenceReport | null = null;
  private static networkDetections: AIDetection[] = [];
  private static isMonitoring = false;

  /**
   * Check if the current site is a known AI platform (should be skipped)
   */
  public static isKnownPlatform(): boolean {
    const hostname = window.location.hostname;
    return KNOWN_PLATFORM_DOMAINS.some(domain => hostname.includes(domain));
  }

  /**
   * Perform a full AI presence scan on the current page.
   * Combines DOM scanning, script analysis, and content heuristics.
   */
  public static scan(): AIPresenceReport {
    const detections: AIDetection[] = [];
    
    // 1. DOM-based detection (chat widgets, iframes, etc.)
    detections.push(...this.scanDOM());
    
    // 2. Script analysis
    detections.push(...this.scanScripts());
    
    // 3. Global variable detection
    detections.push(...this.scanGlobalVars());
    
    // 4. Meta tag analysis
    detections.push(...this.scanMetaTags());
    
    // 5. Content heuristics (AI-generated content detection)
    detections.push(...this.scanContentHeuristics());
    
    // 6. Hidden iframe detection
    detections.push(...this.scanHiddenIframes());
    
    // 7. Shadow DOM detection
    detections.push(...this.scanShadowDOMs());
    
    // 8. Include any network detections from monitoring
    detections.push(...this.networkDetections);
    
    // Deduplicate
    const unique = this.deduplicateDetections(detections);
    
    // Calculate overall confidence
    const confidence = unique.length > 0
      ? Math.min(100, Math.round(unique.reduce((sum, d) => sum + d.confidence, 0) / unique.length))
      : 0;

    const report: AIPresenceReport = {
      detected: unique.length > 0,
      confidence,
      detections: unique,
      summary: this.generateSummary(unique),
      scannedAt: new Date(),
      url: window.location.href
    };

    this.scanResults = report;
    return report;
  }

  /**
   * Get cached scan results (null if never scanned)
   */
  public static getLastReport(): AIPresenceReport | null {
    return this.scanResults;
  }

  /**
   * Start monitoring network requests for AI API calls.
   * Uses PerformanceObserver to watch for fetch/XHR to known AI endpoints.
   */
  public static startNetworkMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    try {
      // Monitor fetch/XHR via PerformanceObserver (resource timing)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resEntry = entry as PerformanceResourceTiming;
          const url = resEntry.name;
          
          for (const sig of AI_SIGNATURES) {
            if (sig.urlPatterns.some(p => p.test(url))) {
              const detection: AIDetection = {
                type: 'ai_api_call',
                name: sig.name,
                description: `Detected network request to ${sig.name}`,
                confidence: 80,
                severity: sig.defaultSeverity,
                evidence: `Network request to: ${url.substring(0, 100)}...`,
                category: sig.category
              };
              
              // Avoid duplicates
              if (!this.networkDetections.some(d => d.name === detection.name && d.type === detection.type)) {
                this.networkDetections.push(detection);
                console.log(`🔍 VeriAI: Detected AI network call — ${sig.name}`);
              }
            }
          }
        }
      });

      observer.observe({ type: 'resource', buffered: true });
      console.log('🔍 VeriAI: Network monitoring for AI API calls started');
    } catch (e) {
      // PerformanceObserver may not be available in all contexts
      console.log('ℹ️ Network monitoring not available in this context');
    }
  }

  // ─── Scan Methods ──────────────────────────────────────────────

  /**
   * Scan DOM for known AI widget elements
   */
  private static scanDOM(): AIDetection[] {
    const detections: AIDetection[] = [];

    for (const sig of AI_SIGNATURES) {
      for (const selector of sig.domSelectors) {
        try {
          const el = document.querySelector(selector);
          if (el) {
            detections.push({
              type: 'chat_widget',
              name: sig.name,
              description: `Found ${sig.name} widget element: ${selector}`,
              confidence: 85,
              severity: sig.defaultSeverity,
              evidence: `DOM element matching "${selector}" found`,
              category: sig.category
            });
          }
        } catch {
          // Invalid selector, skip
        }
      }
    }

    return detections;
  }

  /**
   * Scan loaded scripts for AI SDK patterns
   */
  private static scanScripts(): AIDetection[] {
    const detections: AIDetection[] = [];
    const scripts = document.querySelectorAll('script[src]');

    scripts.forEach(script => {
      const src = script.getAttribute('src') || '';
      
      for (const sig of AI_SIGNATURES) {
        if (sig.urlPatterns.some(p => p.test(src))) {
          detections.push({
            type: 'ai_sdk_script',
            name: sig.name,
            description: `${sig.name} SDK script loaded on page`,
            confidence: 90,
            severity: sig.defaultSeverity,
            evidence: `Script source: ${src.substring(0, 120)}`,
            category: sig.category
          });
        }
      }
    });

    return detections;
  }

  /**
   * Check for known AI-related global JavaScript variables
   */
  private static scanGlobalVars(): AIDetection[] {
    const detections: AIDetection[] = [];

    for (const sig of AI_SIGNATURES) {
      for (const gvar of sig.globalVars) {
        try {
          if ((window as any)[gvar] !== undefined) {
            detections.push({
              type: 'ai_sdk_script',
              name: sig.name,
              description: `Global variable "${gvar}" detected (${sig.name})`,
              confidence: 80,
              severity: sig.defaultSeverity,
              evidence: `window.${gvar} is defined`,
              category: sig.category
            });
          }
        } catch {
          // Access denied, skip
        }
      }
    }

    return detections;
  }

  /**
   * Check meta tags for AI-related disclosures
   */
  private static scanMetaTags(): AIDetection[] {
    const detections: AIDetection[] = [];
    const metas = document.querySelectorAll('meta');

    metas.forEach(meta => {
      const name = (meta.getAttribute('name') || '').toLowerCase();
      const content = (meta.getAttribute('content') || '').toLowerCase();
      const property = (meta.getAttribute('property') || '').toLowerCase();

      // Check for AI-related meta tags
      const aiMeta = (
        name.includes('ai') || name.includes('generated') || name.includes('llm') ||
        property.includes('ai') || property.includes('generated') ||
        content.includes('ai-generated') || content.includes('llm') ||
        content.includes('chatbot') || content.includes('artificial intelligence')
      );

      if (aiMeta) {
        detections.push({
          type: 'ai_meta_tag',
          name: 'AI Meta Tag',
          description: `AI disclosure meta tag found: ${name || property}="${content.substring(0, 80)}"`,
          confidence: 70,
          severity: 'info',
          evidence: `<meta name="${name}" property="${property}" content="${content.substring(0, 60)}">`,
          category: 'content_generation'
        });
      }
    });

    return detections;
  }

  /**
   * Scan visible page content for AI-generated text patterns
   */
  private static scanContentHeuristics(): AIDetection[] {
    const detections: AIDetection[] = [];
    
    // Get main content text (avoid scripts, styles, etc.)
    const bodyText = this.getVisibleText();
    if (!bodyText || bodyText.length < 50) return detections;

    for (const pattern of AI_CONTENT_PATTERNS) {
      const match = bodyText.match(pattern.pattern);
      if (match) {
        detections.push({
          type: 'ai_generated_content',
          name: pattern.name,
          description: `AI content pattern detected: "${match[0]}"`,
          confidence: pattern.confidence,
          severity: pattern.confidence > 80 ? 'warning' : 'info',
          evidence: `Matched text: "${match[0]}" in page content`,
          category: 'content_generation'
        });
      }
    }

    return detections;
  }

  /**
   * Scan for hidden iframes that might be loading AI services
   */
  private static scanHiddenIframes(): AIDetection[] {
    const detections: AIDetection[] = [];
    const iframes = document.querySelectorAll('iframe');

    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src') || '';
      const style = window.getComputedStyle(iframe);
      const isHidden = (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0' ||
        parseInt(style.width) <= 1 ||
        parseInt(style.height) <= 1
      );

      // Check if hidden iframe loads AI service
      for (const sig of AI_SIGNATURES) {
        if (sig.urlPatterns.some(p => p.test(src))) {
          detections.push({
            type: isHidden ? 'hidden_iframe' : 'chat_widget',
            name: sig.name,
            description: `${isHidden ? 'Hidden ' : ''}iframe loading ${sig.name}`,
            confidence: isHidden ? 90 : 70,
            severity: isHidden ? 'warning' : sig.defaultSeverity,
            evidence: `iframe src="${src.substring(0, 100)}" ${isHidden ? '(hidden)' : '(visible)'}`,
            category: sig.category
          });
        }
      }

      // Also flag any hidden iframe with suspicious patterns
      if (isHidden && src && (
        /chat|bot|ai|assist|widget|messenger/i.test(src)
      )) {
        if (!detections.some(d => d.evidence.includes(src.substring(0, 50)))) {
          detections.push({
            type: 'hidden_iframe',
            name: 'Unknown Hidden Widget',
            description: `Hidden iframe with AI-related URL pattern detected`,
            confidence: 55,
            severity: 'warning',
            evidence: `iframe src="${src.substring(0, 100)}" (hidden, pattern match)`,
            category: 'unknown'
          });
        }
      }
    });

    return detections;
  }

  /**
   * Scan Shadow DOMs for hidden widgets
   */
  private static scanShadowDOMs(): AIDetection[] {
    const detections: AIDetection[] = [];
    
    // Find elements with shadow roots
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      try {
        if (el.shadowRoot) {
          const shadowHTML = el.shadowRoot.innerHTML || '';
          
          // Check if shadow DOM contains AI widget signatures
          for (const sig of AI_SIGNATURES) {
            const hasMatch = sig.urlPatterns.some(p => p.test(shadowHTML)) ||
                            sig.domSelectors.some(s => {
                              try { return el.shadowRoot!.querySelector(s) !== null; } catch { return false; }
                            });

            if (hasMatch) {
              detections.push({
                type: 'shadow_dom_widget',
                name: sig.name,
                description: `${sig.name} widget found inside Shadow DOM of <${el.tagName.toLowerCase()}>`,
                confidence: 80,
                severity: 'warning',
                evidence: `Shadow DOM in <${el.tagName.toLowerCase()}> contains ${sig.name} signatures`,
                category: sig.category
              });
            }
          }
        }
      } catch {
        // Closed shadow root, can't access
      }
    });

    return detections;
  }

  // ─── Helpers ───────────────────────────────────────────────────

  /**
   * Get visible text content from the page (excluding scripts/styles)
   */
  private static getVisibleText(): string {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'template'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.textContent && node.textContent.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const chunks: string[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      chunks.push(node.textContent || '');
    }
    // Limit to first 50KB to avoid performance issues
    return chunks.join(' ').substring(0, 50000);
  }

  /**
   * Deduplicate detections by name + type
   */
  private static deduplicateDetections(detections: AIDetection[]): AIDetection[] {
    const seen = new Set<string>();
    return detections.filter(d => {
      const key = `${d.name}::${d.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate human-readable summary
   */
  private static generateSummary(detections: AIDetection[]): string {
    if (detections.length === 0) {
      return 'No AI presence detected on this page.';
    }

    const byCategory = detections.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const parts: string[] = [];
    parts.push(`${detections.length} AI presence${detections.length > 1 ? 's' : ''} detected.`);

    const dangers = detections.filter(d => d.severity === 'danger');
    const warnings = detections.filter(d => d.severity === 'warning');

    if (dangers.length > 0) {
      parts.push(`🚨 ${dangers.length} high-risk detection${dangers.length > 1 ? 's' : ''}.`);
    }
    if (warnings.length > 0) {
      parts.push(`⚠ ${warnings.length} warning${warnings.length > 1 ? 's' : ''}.`);
    }

    Object.entries(byCategory).forEach(([cat, count]) => {
      parts.push(`${count} ${cat.replace('_', ' ')}.`);
    });

    return parts.join(' ');
  }

  /**
   * Generate HTML for display in the sidebar
   */
  public static toDisplayHTML(report: AIPresenceReport): string {
    if (!report.detected) {
      return `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
          <div style="font-size: 13px; color: #4caf50; font-weight: 600;">No Hidden AI Detected</div>
          <div style="font-size: 11px; color: #888; margin-top: 4px;">This page appears free of undisclosed AI systems.</div>
          <div style="font-size: 10px; color: #666; margin-top: 8px;">Scanned: ${report.scannedAt.toLocaleTimeString()}</div>
        </div>`;
    }

    const detectionsHTML = report.detections.map(d => {
      const severityColor = d.severity === 'danger' ? '#f44336' : d.severity === 'warning' ? '#ff9800' : '#4caf50';
      const severityIcon = d.severity === 'danger' ? '🚨' : d.severity === 'warning' ? '⚠️' : 'ℹ️';
      const typeIcons: Record<string, string> = {
        chat_widget: '💬',
        ai_api_call: '🌐',
        ai_sdk_script: '📜',
        ai_generated_content: '🤖',
        hidden_iframe: '👁️',
        ai_meta_tag: '🏷️',
        websocket_ai: '🔌',
        shadow_dom_widget: '🕵️'
      };

      return `
        <div class="ai-detection-card" style="margin-bottom: 8px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid ${severityColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 600; font-size: 12px; color: #eee;">${typeIcons[d.type] || '🔍'} ${this.escapeHTML(d.name)}</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; background: ${severityColor}20; color: ${severityColor};">
              ${severityIcon} ${d.severity}
            </span>
          </div>
          <div style="font-size: 11px; color: #bbb; margin-bottom: 4px;">${this.escapeHTML(d.description)}</div>
          <div style="font-size: 10px; color: #666; font-family: monospace; word-break: break-all;">${this.escapeHTML(d.evidence)}</div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px;">
            <span style="font-size: 10px; color: #888;">Confidence: ${d.confidence}%</span>
            <span style="font-size: 10px; color: #888;">${d.category.replace('_', ' ')}</span>
          </div>
        </div>`;
    }).join('');

    const overallColor = report.confidence > 70 ? '#f44336' : report.confidence > 40 ? '#ff9800' : '#4caf50';

    return `
      <div style="margin-bottom: 12px; padding: 10px; background: ${overallColor}15; border-radius: 6px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700; color: ${overallColor};">${report.detections.length}</div>
        <div style="font-size: 11px; color: #888;">AI presence${report.detections.length > 1 ? 's' : ''} detected</div>
        <div style="font-size: 10px; color: #666; margin-top: 4px;">Overall confidence: ${report.confidence}%</div>
      </div>
      <div style="font-size: 11px; color: #bbb; margin-bottom: 10px;">${this.escapeHTML(report.summary)}</div>
      ${detectionsHTML}
      <div style="font-size: 10px; color: #666; text-align: center; margin-top: 8px;">Scanned: ${report.scannedAt.toLocaleTimeString()}</div>
    `;
  }

  private static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
