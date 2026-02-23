/**
 * Prompt Injector — Feature 1: Structured Chain-of-Thought Injection
 * 
 * Silently appends structured reasoning instructions to user prompts before
 * they are sent to the AI, forcing the model to expose its chain of thought
 * in a parseable, step-by-step format.
 */

export interface InjectionProfile {
  id: string;
  name: string;
  suffix: string;
  description: string;
  /** Whether this profile forces JSON output */
  forceJSON: boolean;
}

/**
 * Pre-built injection templates ranked by aggressiveness.
 */
export const INJECTION_PROFILES: InjectionProfile[] = [
  {
    id: 'gentle',
    name: 'Gentle',
    description: 'Appends a light "think step-by-step" nudge.',
    forceJSON: false,
    suffix: '\n\n[Think through this step by step. For each step, state your assumption, your reasoning, and your confidence level (low/medium/high).]'
  },
  {
    id: 'structured',
    name: 'Structured',
    description: 'Requests numbered reasoning steps with explicit labels.',
    forceJSON: false,
    suffix: `\n\n[Please structure your answer as follows:
STEP 1 — Assumption: <state assumption>
STEP 1 — Reasoning: <explain logic>
STEP 1 — Confidence: <low|medium|high>
...continue for each reasoning step...
FINAL — Conclusion: <your answer>
FINAL — Caveats: <limitations or uncertainties>]`
  },
  {
    id: 'json',
    name: 'JSON Schema',
    description: 'Forces a structured JSON reasoning output.',
    forceJSON: true,
    suffix: `\n\n[Respond ONLY with valid JSON matching this schema:
{
  "reasoning_steps": [
    {
      "step": <number>,
      "type": "assumption" | "inference" | "evidence" | "conclusion",
      "description": "<what you are doing in this step>",
      "confidence": <0.0 to 1.0>,
      "sources": ["<optional citation or reference>"]
    }
  ],
  "final_answer": "<your conclusion>",
  "overall_confidence": <0.0 to 1.0>,
  "caveats": ["<limitation or caveat>"],
  "verifiable_claims": [
    {
      "claim": "<a specific factual claim made>",
      "verifiable": true | false,
      "source_hint": "<how someone could verify this>"
    }
  ]
}]`
  }
];

export class PromptInjector {
  private static enabled = true;
  private static activeProfileId = 'structured'; // default

  /**
   * Toggle prompt injection on/off
   */
  public static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`🔧 Prompt injection ${enabled ? 'enabled' : 'disabled'}`);
  }

  public static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set the active injection profile by ID
   */
  public static setProfile(profileId: string): void {
    const profile = INJECTION_PROFILES.find(p => p.id === profileId);
    if (profile) {
      this.activeProfileId = profileId;
      console.log(`🔧 Prompt injection profile set to: ${profile.name}`);
    }
  }

  public static getActiveProfile(): InjectionProfile {
    return INJECTION_PROFILES.find(p => p.id === this.activeProfileId) || INJECTION_PROFILES[1];
  }

  public static getProfiles(): InjectionProfile[] {
    return INJECTION_PROFILES;
  }

  /**
   * Inject structured CoT instructions into a user prompt.
   * Returns the original prompt if injection is disabled.
   */
  public static inject(prompt: string): string {
    if (!this.enabled || !prompt.trim()) return prompt;

    const profile = this.getActiveProfile();
    // Avoid double-injection: if the prompt already contains our markers, skip
    if (prompt.includes('[Think through this') || prompt.includes('[Please structure') || prompt.includes('[Respond ONLY with valid JSON')) {
      return prompt;
    }

    return prompt + profile.suffix;
  }

  /**
   * Detect if a prompt textarea/input is present and intercept submit.
   * This hooks into the DOM to modify prompts before they're sent.
   */
  public static interceptPromptSubmission(platform: string): void {
    if (!this.enabled) return;

    const selectors = this.getPromptSelectors(platform);
    if (!selectors) return;

    console.log(`🔧 Setting up prompt interceptor for ${platform}...`);

    // Use a MutationObserver to detect when the submit button becomes available
    const observer = new MutationObserver(() => {
      this.attachSubmitInterceptor(selectors, platform);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also try immediately
    this.attachSubmitInterceptor(selectors, platform);
  }

  /**
   * Platform-specific selectors for prompt input areas and submit buttons
   */
  private static getPromptSelectors(platform: string): { input: string; submit: string; form?: string } | null {
    switch (platform) {
      case 'chatgpt':
        return {
          input: '#prompt-textarea, textarea[data-id="root"]',
          submit: 'button[data-testid="send-button"], form button[type="submit"]',
          form: 'form'
        };
      case 'claude':
        return {
          input: '[contenteditable="true"].ProseMirror, div[contenteditable="true"]',
          submit: 'button[aria-label="Send Message"], button[type="submit"]',
          form: 'form'
        };
      case 'gemini':
        return {
          input: '.ql-editor, [contenteditable="true"], textarea',
          submit: 'button[aria-label="Send message"], .send-button',
          form: 'form'
        };
      case 'copilot':
        return {
          input: '#searchbox, textarea',
          submit: 'button[aria-label="Submit"]',
          form: 'form'
        };
      default:
        // Generic: try common patterns
        return {
          input: 'textarea, [contenteditable="true"], input[type="text"]',
          submit: 'button[type="submit"], form button',
          form: 'form'
        };
    }
  }

  private static interceptedForms = new WeakSet<Element>();

  /**
   * Attach interceptor that modifies prompt text right before submission
   */
  private static attachSubmitInterceptor(
    selectors: { input: string; submit: string; form?: string },
    platform: string
  ): void {
    // Try to intercept form submission
    if (selectors.form) {
      const forms = document.querySelectorAll(selectors.form);
      forms.forEach(form => {
        if (this.interceptedForms.has(form)) return;
        this.interceptedForms.add(form);

        form.addEventListener('submit', (e) => {
          this.modifyInputBeforeSend(selectors.input, platform);
        }, { capture: true });
      });
    }

    // Also intercept Enter key on input fields
    const inputs = document.querySelectorAll(selectors.input);
    inputs.forEach(input => {
      if (this.interceptedForms.has(input)) return;
      this.interceptedForms.add(input);

      input.addEventListener('keydown', (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Enter' && !ke.shiftKey) {
          // Slight delay to let the natural handler run after modification
          this.modifyInputBeforeSend(selectors.input, platform);
        }
      }, { capture: true });
    });

    // Intercept submit button clicks
    const submitBtns = document.querySelectorAll(selectors.submit);
    submitBtns.forEach(btn => {
      if (this.interceptedForms.has(btn)) return;
      this.interceptedForms.add(btn);

      btn.addEventListener('click', () => {
        this.modifyInputBeforeSend(selectors.input, platform);
      }, { capture: true });
    });
  }

  /**
   * Modify the prompt text in the input element
   */
  private static modifyInputBeforeSend(inputSelector: string, platform: string): void {
    if (!this.enabled) return;

    const input = document.querySelector(inputSelector) as HTMLElement;
    if (!input) return;

    let currentText = '';

    if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
      currentText = input.value;
    } else if (input.getAttribute('contenteditable') === 'true') {
      currentText = input.innerText || input.textContent || '';
    }

    if (!currentText.trim()) return;

    const injected = this.inject(currentText);
    if (injected === currentText) return; // No change needed

    // Write back the modified text
    if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
      // Use native input setter to trigger React/Vue change events
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement?.prototype || window.HTMLInputElement?.prototype,
        'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, injected);
      } else {
        input.value = injected;
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      input.innerText = injected;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    console.log(`🧠 Prompt injected with ${this.getActiveProfile().name} CoT template`);
  }
}
