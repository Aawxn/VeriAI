/**
 * Cross-AI Verification & Optimization Engine
 * Compares responses from multiple AI models and produces the best answer
 */

import type { CrossAIVerificationRequest, CrossAIVerificationResult, ModelResponse } from '../types';

export class CrossAIVerifier {
  // 🔒 API keys are loaded from Chrome storage only - NEVER hardcode keys in source
  // Users must add their own keys via the Settings panel in the sidebar
  private static CLAUDE_API_KEY = '';   // Set via Settings → Claude API Key
  private static GEMINI_API_KEY = '';   // Set via Settings → Gemini API Key
  private static OPENROUTER_API_KEY = ''; // Set via Settings → OpenRouter API Key
  
  // Configuration flags
  private static USE_CLAUDE_FOR_VERIFICATION = true; // Enable Claude API calls
  private static USE_CLAUDE_FOR_META_EVALUATION = true; // Use Claude for meta-evaluation
  private static USE_DEEPSEEK_FOR_VERIFICATION = true; // Enable DeepSeek-R1 via OpenRouter

  // API Endpoints    
  private static readonly CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
  private static readonly GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private static readonly GEMINI_PRO_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
  private static readonly OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly DEEPSEEK_MODEL = 'deepseek/deepseek-r1'; // Free tier model on OpenRouter

  /**
   * Initialize API keys from Chrome storage (encrypted)
   */
  public static async loadAPIKeys(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(['claudeApiKey', 'geminiApiKey', 'deepseekApiKey']);
      
      // Decrypt and load Claude API key (user's key overrides hardcoded key)
      if (result.claudeApiKey) {
        try {
          const { decrypt } = await import('./encryption');
          this.CLAUDE_API_KEY = await decrypt(result.claudeApiKey);
          console.log('✅ Claude API key loaded from encrypted storage');
        } catch (decryptError) {
          this.CLAUDE_API_KEY = result.claudeApiKey;
          console.log('✅ Claude API key loaded from storage (plain format)');
        }
      } else {
        console.log('⚠️ No Claude API key configured - add one in Settings');
      }
      
      // Decrypt and load Gemini API key
      if (result.geminiApiKey) {
        try {
          const { decrypt } = await import('./encryption');
          this.GEMINI_API_KEY = await decrypt(result.geminiApiKey);
          console.log('✅ Gemini API key loaded from encrypted storage');
        } catch (decryptError) {
          this.GEMINI_API_KEY = result.geminiApiKey;
          console.log('✅ Gemini API key loaded from storage (legacy format)');
        }
      } else {
        console.log('⚠️ No Gemini API key configured - add one in Settings');
      }
      
      // Decrypt and load OpenRouter API key (for DeepSeek-R1)
      if (result.deepseekApiKey) {
        try {
          const { decrypt } = await import('./encryption');
          this.OPENROUTER_API_KEY = await decrypt(result.deepseekApiKey);
          console.log('✅ OpenRouter API key loaded from encrypted storage');
        } catch (decryptError) {
          this.OPENROUTER_API_KEY = result.deepseekApiKey;
          console.log('✅ OpenRouter API key loaded from storage (legacy format)');
        }
      }
    } catch (error) {
      console.log('ℹ️ Using default API keys (storage not available or keys not set)');
    }
  }

  /**
   * Main verification function - queries multiple AIs and produces optimized answer
   */
  public static async verifyAcrossModels(
    question: string,
    originalAnswer: string,
    sourcePlatform: string
  ): Promise<CrossAIVerificationResult> {
    console.log('🔍 Cross-AI Verification Engine: Starting multi-model analysis...');
    console.log(`   Question: ${question.substring(0, 100)}...`);
    console.log(`   Source Platform: ${sourcePlatform}`);

    // Load API keys from storage
    await this.loadAPIKeys();

    try {
      // Step 1: Gather responses from all AI models in parallel
      console.log('📡 Step 1: Querying multiple AI models...');
      const modelResponses = await this.gatherModelResponses(question, originalAnswer, sourcePlatform);
      
      console.log('✅ Collected responses from all models');

      // Step 2: Meta-evaluation (use Claude if enabled, otherwise Gemini)
      const evaluator = this.USE_CLAUDE_FOR_META_EVALUATION && this.CLAUDE_API_KEY 
        ? 'Claude' : 'Gemini';
      console.log(`🧠 Step 2: Meta-evaluation by ${evaluator}...`);
      
      const metaEvaluation = evaluator === 'Claude'
        ? await this.metaEvaluateWithClaude(question, modelResponses)
        : await this.metaEvaluateWithGemini(question, modelResponses);
      
      console.log('✅ Meta-evaluation complete');

      return {
        ...metaEvaluation,
        modelResponses,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Cross-AI verification failed:', error);
      return this.fallbackAnalysis(question, originalAnswer, sourcePlatform);
    }
  }

  /**
   * Gather responses from all AI models
   */
  private static async gatherModelResponses(
    question: string,
    originalAnswer: string,
    sourcePlatform: string
  ): Promise<Record<string, ModelResponse>> {
    const responses: Record<string, ModelResponse> = {};

    // Add original answer from the page
    responses[sourcePlatform] = {
      answer: originalAnswer,
      responseTime: 0,
      model: sourcePlatform
    };

    // Query APIs in parallel for faster results
    const apiCalls: Promise<void>[] = [];

    // Query Gemini API
    if (this.GEMINI_API_KEY) {
      console.log('🔄 Querying Gemini API...');
      apiCalls.push(
        this.callGemini(question)
          .then(response => {
            responses['Gemini'] = response;
            console.log('✅ Gemini response received:', response.answer.substring(0, 100) + '...');
          })
          .catch(error => {
            console.error('❌ Gemini query failed:', error);
            responses['Gemini'] = {
              answer: '[Gemini API Error]',
              responseTime: 0,
              model: 'gemini-2.0-flash',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          })
      );
    }

    // Query Claude API if enabled
    if (this.USE_CLAUDE_FOR_VERIFICATION && this.CLAUDE_API_KEY) {
      console.log('🔄 Querying Claude API...');
      apiCalls.push(
        this.callClaude(question)
          .then(response => {
            responses['Claude'] = response;
            console.log('✅ Claude response received:', response.answer.substring(0, 100) + '...');
          })
          .catch(error => {
            console.error('❌ Claude query failed:', error);
            responses['Claude'] = {
              answer: '[Claude API Error]',
              responseTime: 0,
              model: 'claude-sonnet-4.5',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          })
      );
    }

    // Query DeepSeek-R1 via OpenRouter if enabled
    if (this.USE_DEEPSEEK_FOR_VERIFICATION) {
      if (this.OPENROUTER_API_KEY) {
        console.log('🔄 Querying DeepSeek-R1 via OpenRouter...');
        apiCalls.push(
          this.callDeepSeek(question)
            .then(response => {
              responses['DeepSeek'] = response;
              console.log('✅ DeepSeek-R1 response received:', response.answer.substring(0, 100) + '...');
            })
            .catch(error => {
              console.error('❌ DeepSeek-R1 query failed:', error);
              responses['DeepSeek'] = {
                answer: '[DeepSeek API Error]',
                responseTime: 0,
                model: 'deepseek-r1',
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            })
        );
      } else {
        // Show DeepSeek in results even without API key
        console.log('ℹ️ OpenRouter API key not configured for DeepSeek-R1');
        responses['DeepSeek'] = {
          answer: '[OpenRouter API key not configured. Add your key from https://openrouter.ai/ in Settings]',
          responseTime: 0,
          model: 'deepseek-r1',
          error: 'API key not configured'
        };
      }
    }

    // Wait for all API calls to complete
    await Promise.all(apiCalls);

    return responses;
  }

  /**
   * Extract response from current page (ChatGPT, Claude, Gemini, Copilot)
   */
  private static async extractPageResponse(question: string): Promise<ModelResponse> {
    try {
      // Try to find AI response on page
      const selectors = [
        '[data-message-author-role="assistant"]', // ChatGPT
        '.font-claude-message', // Claude
        '[data-test-id="conversation-turn-content"]', // Various
        '.response-content', // Generic
        'article[data-testid="conversation-turn-3"]', // ChatGPT alternative
      ];

      let responseText = '';
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          const lastElement = elements[elements.length - 1];
          responseText = lastElement.textContent?.trim() || '';
          if (responseText.length > 50) break;
        }
      }

      if (!responseText) {
        throw new Error('Could not extract AI response from page');
      }

      // Detect platform
      const hostname = window.location.hostname;
      let model = 'Unknown AI';
      if (hostname.includes('chatgpt') || hostname.includes('openai')) model = 'ChatGPT';
      else if (hostname.includes('claude') || hostname.includes('anthropic')) model = 'Claude';
      else if (hostname.includes('gemini') || hostname.includes('google')) model = 'Gemini';
      else if (hostname.includes('github')) model = 'GitHub Copilot';

      return {
        model,
        answer: responseText,
        responseTime: 0
      };
    } catch (error: any) {
      return {
        model: 'Page Extract',
        answer: '',
        error: error.message,
        responseTime: 0
      };
    }
  }

  /**
   * Call Claude Sonnet 4.5 API
   */
  private static async callClaude(question: string, context?: string): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      console.log('🔄 Calling Claude API...');
      
      // Add 15 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(this.CLAUDE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: question
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Claude API response status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Claude API error body:', errorBody);
        throw new Error(`Claude API error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      console.log('✅ Claude API response received');
      
      const answer = data.content?.[0]?.text || '[No answer generated]';

      return {
        answer,
        responseTime: Date.now() - startTime,
        model: 'claude-sonnet-4'
      };
    } catch (error) {
      console.error('❌ Claude API call failed:', error);
      return {
        answer: '[Claude API Error]',
        responseTime: Date.now() - startTime,
        model: 'claude-sonnet-4',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Call Gemini 1.5 Pro API
   */
  private static async callGemini(question: string): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      console.log('🔄 Calling Gemini API...');
      
      // Add 15 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${this.GEMINI_ENDPOINT}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: question
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024 // Reduced from 2048 for faster response
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Gemini API response status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Gemini API error body:', errorBody);
        throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      console.log('✅ Gemini API response received');
      
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '[No answer generated]';

      return {
        answer,
        responseTime: Date.now() - startTime,
        model: 'gemini-2.0-flash'
      };
    } catch (error) {
      console.error('❌ Gemini API call failed:', error);
      return {
        answer: '[Gemini API Error]',
        responseTime: Date.now() - startTime,
        model: 'gemini-2.0-flash',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Call DeepSeek-R1 via OpenRouter API
   */
  private static async callDeepSeek(question: string): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      console.log('🔄 Calling DeepSeek-R1 via OpenRouter...');
      
      // Add 15 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(this.OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/your-repo/veriai', // Optional: for OpenRouter analytics
          'X-Title': 'VeriAI Extension' // Optional: for OpenRouter analytics
        },
        body: JSON.stringify({
          model: this.DEEPSEEK_MODEL,
          messages: [{
            role: 'user',
            content: question
          }],
          temperature: 0.7,
          max_tokens: 2048
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 OpenRouter API response status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ OpenRouter API error body:', errorBody);
        
        // Check for authentication error
        if (response.status === 401) {
          throw new Error(`OpenRouter Authentication Failed: Invalid API key. Get a valid key from https://openrouter.ai/keys`);
        }
        
        throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      console.log('✅ OpenRouter API response received');
      
      const answer = data.choices?.[0]?.message?.content || '[No answer generated]';

      return {
        answer,
        responseTime: Date.now() - startTime,
        model: 'deepseek-r1'
      };
    } catch (error) {
      console.error('❌ DeepSeek-R1 API call failed:', error);
      return {
        answer: '[DeepSeek API unavailable]',
        responseTime: Date.now() - startTime,
        model: 'deepseek-r1',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Meta-evaluation using Claude Sonnet 4
   */
  private static async metaEvaluateWithClaude(
    question: string,
    modelResponses: Record<string, ModelResponse>
  ): Promise<Omit<CrossAIVerificationResult, 'modelResponses' | 'timestamp'>> {
    const prompt = this.buildMetaEvaluationPrompt(question, modelResponses);

    try {
      console.log('🧠 Calling Claude for meta-evaluation...');
      
      // Add 20 second timeout for meta-evaluation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch(this.CLAUDE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: prompt + '\n\nProvide your response as a valid JSON object only, no markdown formatting.'
          }],
          temperature: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude meta-evaluation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const evaluationText = data.content?.[0]?.text || '';

      console.log('📝 Raw Claude response:', evaluationText.substring(0, 500));

      // Parse JSON response
      const cleanText = evaluationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const evaluation = JSON.parse(cleanText);

      console.log('✅ Parsed evaluation:', evaluation);

      // Ensure comparativeAnalysis is an object with arrays
      let comparativeAnalysis = evaluation.comparative_analysis || evaluation.comparativeAnalysis;
      
      // If it's a string, convert to object structure
      if (typeof comparativeAnalysis === 'string') {
        comparativeAnalysis = {
          agreements: [comparativeAnalysis],
          contradictions: [],
          uniqueInsights: [],
          commonWeaknesses: []
        };
      }
      
      // Ensure all required arrays exist
      if (!comparativeAnalysis || typeof comparativeAnalysis !== 'object') {
        comparativeAnalysis = {
          agreements: [],
          contradictions: [],
          uniqueInsights: [],
          commonWeaknesses: []
        };
      }

      // Ensure each property is an array
      comparativeAnalysis = {
        agreements: Array.isArray(comparativeAnalysis.agreements) ? comparativeAnalysis.agreements : [],
        contradictions: Array.isArray(comparativeAnalysis.contradictions) ? comparativeAnalysis.contradictions : [],
        uniqueInsights: Array.isArray(comparativeAnalysis.uniqueInsights) ? comparativeAnalysis.uniqueInsights : [],
        commonWeaknesses: Array.isArray(comparativeAnalysis.commonWeaknesses) ? comparativeAnalysis.commonWeaknesses : []
      };

      return {
        finalAnswer: evaluation.final_answer || evaluation.finalAnswer || 'No answer generated',
        consistencyScore: evaluation.consistency_score || evaluation.consistencyScore || 50,
        completenessScore: evaluation.completeness_score || evaluation.completenessScore || 50,
        biasRiskScore: evaluation.bias_risk_score || evaluation.biasRiskScore || 50,
        bestModel: evaluation.best_model || evaluation.bestModel || 'Unknown',
        modelNotes: evaluation.model_notes || evaluation.modelNotes || {},
        comparativeAnalysis,
        recommendations: Array.isArray(evaluation.recommendations) ? evaluation.recommendations : []
      };

    } catch (error) {
      console.error('❌ Claude meta-evaluation failed:', error);
      return this.fallbackMetaEvaluation(modelResponses);
    }
  }

  /**
   * Meta-evaluation using Gemini 1.5 Pro (no Claude key needed)
   */
  private static async metaEvaluateWithGemini(
    question: string,
    modelResponses: Record<string, ModelResponse>
  ): Promise<Omit<CrossAIVerificationResult, 'modelResponses' | 'timestamp'>> {
    const prompt = this.buildMetaEvaluationPrompt(question, modelResponses);

    try {
      // Add 20 second timeout for meta-evaluation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(`${this.GEMINI_PRO_ENDPOINT}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt + '\n\nProvide your response as a valid JSON object only, no markdown formatting.'
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048 // Reduced from 4096 for faster response
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini meta-evaluation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const evaluationText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      console.log('📝 Raw Gemini response:', evaluationText.substring(0, 500));

      // Parse JSON response
      const cleanText = evaluationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const evaluation = JSON.parse(cleanText);

      console.log('✅ Parsed evaluation:', evaluation);

      // Ensure comparativeAnalysis is an object with arrays
      let comparativeAnalysis = evaluation.comparative_analysis || evaluation.comparativeAnalysis;
      
      // If it's a string, convert to object structure
      if (typeof comparativeAnalysis === 'string') {
        comparativeAnalysis = {
          agreements: [comparativeAnalysis],
          contradictions: [],
          uniqueInsights: [],
          commonWeaknesses: []
        };
      }
      
      // Ensure all required arrays exist
      if (!comparativeAnalysis || typeof comparativeAnalysis !== 'object') {
        comparativeAnalysis = {
          agreements: [],
          contradictions: [],
          uniqueInsights: [],
          commonWeaknesses: []
        };
      }

      // Ensure each property is an array
      comparativeAnalysis = {
        agreements: Array.isArray(comparativeAnalysis.agreements) ? comparativeAnalysis.agreements : [],
        contradictions: Array.isArray(comparativeAnalysis.contradictions) ? comparativeAnalysis.contradictions : [],
        uniqueInsights: Array.isArray(comparativeAnalysis.uniqueInsights) ? comparativeAnalysis.uniqueInsights : [],
        commonWeaknesses: Array.isArray(comparativeAnalysis.commonWeaknesses) ? comparativeAnalysis.commonWeaknesses : []
      };

      return {
        finalAnswer: evaluation.final_answer || evaluation.finalAnswer || 'No answer generated',
        consistencyScore: evaluation.consistency_score || evaluation.consistencyScore || 50,
        completenessScore: evaluation.completeness_score || evaluation.completenessScore || 50,
        biasRiskScore: evaluation.bias_risk_score || evaluation.biasRiskScore || 50,
        bestModel: evaluation.best_model || evaluation.bestModel || 'Unknown',
        modelNotes: evaluation.model_notes || evaluation.modelNotes || {},
        comparativeAnalysis,
        recommendations: Array.isArray(evaluation.recommendations) ? evaluation.recommendations : []
      };

    } catch (error) {
      console.error('❌ Gemini meta-evaluation failed:', error);
      return this.fallbackMetaEvaluation(modelResponses);
    }
  }

  /**
   * Build meta-evaluation prompt for Claude
   */
  private static buildMetaEvaluationPrompt(
    question: string,
    modelResponses: Record<string, ModelResponse>
  ): string {
    const responsesText = Object.entries(modelResponses)
      .map(([model, response]) => `
**${model.toUpperCase()}:**
${response.answer}
${response.error ? `[Error: ${response.error}]` : ''}
${'-'.repeat(80)}
`)
      .join('\n');

    return `You are the Cross-AI Verification Engine. Your task is to analyze and compare responses from multiple AI models, then produce the BEST POSSIBLE final answer.

**USER QUESTION:**
${question}

**RESPONSES FROM DIFFERENT AI MODELS:**
${responsesText}

**YOUR TASK:**

1. **Compare all responses** - Identify:
   - Factual agreements and contradictions
   - Missing information in each response
   - Tone and style differences
   - Bias indicators
   - Hallucination likelihood
   - Reasoning quality
   - Completeness

2. **Produce the BEST final answer** by:
   - Combining accurate information from all models
   - Filling gaps where models missed important points
   - Correcting factual errors
   - Removing bias and hedging
   - Providing the most comprehensive, accurate, and helpful response

3. **Analyze model performance**:
   - Which model was most accurate?
   - Which had the best reasoning?
   - Which showed bias or uncertainty?

**OUTPUT FORMAT (STRICT JSON ONLY):**

\`\`\`json
{
  "final_answer": "The optimized, best possible answer combining insights from all models. This should be comprehensive, accurate, and directly address the user's question.",
  "consistency_score": 0-100,
  "completeness_score": 0-100,
  "biasRiskScore": 0-100,
  "best_model": "Name of the model that performed best",
  "model_notes": {
    "chatgpt": "Brief assessment of ChatGPT's response quality",
    "claude": "Brief assessment of Claude's response quality",
    "gemini": "Brief assessment of Gemini's response quality",
    "deepseek": "Brief assessment of DeepSeek's response quality"
  },
  "comparative_analysis": {
    "agreements": ["Points where all models agreed"],
    "contradictions": ["Points where models contradicted each other"],
    "unique_insights": ["Unique valuable insights from specific models"],
    "common_weaknesses": ["Common issues across multiple models"]
  },
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ]
}
\`\`\`

**IMPORTANT:**
- Be objective and evidence-based
- Prioritize factual accuracy over stylistic preferences
- The final_answer should be significantly better than any individual model's response
- Return ONLY valid JSON, no other text`;
  }

  /**
   * Fallback meta-evaluation when Claude is unavailable
   */
  private static fallbackMetaEvaluation(
    modelResponses: Record<string, ModelResponse>
  ): Omit<CrossAIVerificationResult, 'modelResponses' | 'timestamp'> {
    const availableResponses = Object.entries(modelResponses)
      .filter(([_, r]) => !r.error)
      .map(([modelName, r]) => ({ modelName, ...r }));

    // Simple heuristic: longest non-error response is probably most complete
    const bestResponse = availableResponses.length > 0
      ? availableResponses.reduce((best, current) => 
          current.answer.length > best.answer.length ? current : best
        )
      : { modelName: 'none', answer: 'All models failed', model: 'none' };

    return {
      finalAnswer: bestResponse.answer,
      consistencyScore: 50,
      completenessScore: 50,
      biasRiskScore: 50,
      bestModel: bestResponse.modelName,
      modelNotes: Object.fromEntries(
        Object.entries(modelResponses).map(([model, r]) => [
          model,
          r.error ? `Error: ${r.error}` : 'Response received'
        ])
      ),
      comparativeAnalysis: {
        agreements: ['Unable to perform comparison (fallback mode)'],
        contradictions: [],
        uniqueInsights: [],
        commonWeaknesses: ['Meta-evaluation service unavailable']
      },
      recommendations: [
        '⚠️ This analysis used fallback mode',
        '🔧 Configure Claude API key for full cross-AI verification',
        '🔍 Manually verify important information'
      ]
    };
  }

  /**
   * Fallback when entire verification system fails
   */
  private static fallbackAnalysis(
    question: string,
    originalAnswer: string,
    sourcePlatform: string
  ): CrossAIVerificationResult {
    return {
      finalAnswer: originalAnswer,
      consistencyScore: 0,
      completenessScore: 0,
      biasRiskScore: 0,
      bestModel: sourcePlatform,
      modelNotes: {
        [sourcePlatform]: 'Original response',
        error: 'Cross-AI verification system unavailable'
      },
      comparativeAnalysis: {
        agreements: [],
        contradictions: [],
        uniqueInsights: [],
        commonWeaknesses: ['Verification system failed']
      },
      recommendations: [
        '❌ Cross-AI verification failed',
        '🔧 Check API keys and network connectivity',
        '⚠️ Use the original response with caution'
      ],
      modelResponses: {
        [sourcePlatform]: {
          answer: originalAnswer,
          responseTime: 0,
          model: sourcePlatform
        }
      },
      timestamp: new Date()
    };
  }
}
