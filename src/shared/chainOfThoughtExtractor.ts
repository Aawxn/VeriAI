/**
 * Advanced Chain of Thought Extractor
 * Analyzes AI responses to extract reasoning patterns and thought processes
 */

import { ChainOfThought, ReasoningStep } from '../types';

export class ChainOfThoughtExtractor {
  
  /**
   * Extract chain of thought from AI response content
   */
  public static extract(content: string, platform: string = 'generic'): ChainOfThought {
    const steps: ReasoningStep[] = [];
    
    // 1. Look for explicit reasoning patterns
    steps.push(...this.extractExplicitReasoning(content));
    
    // 2. Look for numbered/bulleted lists
    steps.push(...this.extractStructuredSteps(content));
    
    // 3. Look for causal relationships
    steps.push(...this.extractCausalRelationships(content));
    
    // 4. Look for conditional logic
    steps.push(...this.extractConditionalLogic(content));
    
    // 5. Look for comparisons and contrasts
    steps.push(...this.extractComparisons(content));
    
    // 6. Identify assumptions
    steps.push(...this.extractAssumptions(content));
    
    // 7. Identify conclusions
    steps.push(...this.extractConclusions(content));
    
    // Remove duplicates and sort by position in text
    const uniqueSteps = this.deduplicateSteps(steps);
    
    // Calculate overall confidence
    const confidence = this.calculateConfidence(uniqueSteps, content);
    
    // Identify ethical considerations
    const ethicalConsiderations = this.extractEthicalConsiderations(content);
    
    // Determine if logic is inferred or explicit
    const inferredLogic = uniqueSteps.length < 3 || !this.hasExplicitReasoning(content);
    
    return {
      steps: uniqueSteps.slice(0, 10), // Limit to 10 most relevant steps
      confidence,
      inferredLogic,
      ethicalConsiderations
    };
  }
  
  /**
   * Extract explicit reasoning patterns (because, therefore, since, etc.)
   */
  private static extractExplicitReasoning(content: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    
    const patterns = [
      { 
        regex: /(?:because|since|as)\s+([^.!?]+[.!?])/gi, 
        type: 'assumption' as const,
        confidence: 0.85 
      },
      { 
        regex: /(?:therefore|thus|hence|consequently)\s+([^.!?]+[.!?])/gi, 
        type: 'conclusion' as const,
        confidence: 0.9 
      },
      { 
        regex: /(?:this means|this suggests|this indicates)\s+(?:that\s+)?([^.!?]+[.!?])/gi, 
        type: 'inference' as const,
        confidence: 0.8 
      },
      { 
        regex: /(?:if|when|assuming)\s+([^,]+),\s+(?:then\s+)?([^.!?]+[.!?])/gi, 
        type: 'inference' as const,
        confidence: 0.75 
      },
      { 
        regex: /(?:given that|considering that)\s+([^,]+),\s+([^.!?]+[.!?])/gi, 
        type: 'assumption' as const,
        confidence: 0.8 
      }
    ];
    
    patterns.forEach(({ regex, type, confidence }) => {
      const matches = content.matchAll(regex);
      for (const match of matches) {
        const description = match[1]?.trim() || match[0]?.trim();
        if (description && description.length > 10 && description.length < 300) {
          steps.push({
            description: this.cleanDescription(description),
            type,
            confidence,
            sources: []
          });
        }
      }
    });
    
    return steps;
  }
  
  /**
   * Extract structured steps (numbered lists, bullet points)
   */
  private static extractStructuredSteps(content: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    
    // Numbered lists: 1. 2. 3. or 1) 2) 3)
    const numberedPattern = /(?:^|\n)\s*(\d+)[.)]\s+([^\n]+)/g;
    const numberedMatches = content.matchAll(numberedPattern);
    
    for (const match of numberedMatches) {
      const description = match[2]?.trim();
      if (description && description.length > 10) {
        steps.push({
          description: this.cleanDescription(description),
          type: 'inference',
          confidence: 0.85,
          sources: []
        });
      }
    }
    
    // Bullet points: - * •
    const bulletPattern = /(?:^|\n)\s*[-*•]\s+([^\n]+)/g;
    const bulletMatches = content.matchAll(bulletPattern);
    
    for (const match of bulletMatches) {
      const description = match[1]?.trim();
      if (description && description.length > 10 && description.length < 200) {
        steps.push({
          description: this.cleanDescription(description),
          type: 'inference',
          confidence: 0.75,
          sources: []
        });
      }
    }
    
    return steps;
  }
  
  /**
   * Extract causal relationships
   */
  private static extractCausalRelationships(content: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    
    const causalPatterns = [
      /([^.!?]+)\s+(?:leads to|results in|causes|produces)\s+([^.!?]+[.!?])/gi,
      /([^.!?]+)\s+(?:is caused by|results from|stems from)\s+([^.!?]+[.!?])/gi,
      /(?:due to|owing to|thanks to)\s+([^,]+),\s+([^.!?]+[.!?])/gi
    ];
    
    causalPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const cause = match[1]?.trim();
        const effect = match[2]?.trim();
        if (cause && effect && cause.length > 10 && effect.length > 10) {
          steps.push({
            description: `${this.cleanDescription(cause)} → ${this.cleanDescription(effect)}`,
            type: 'inference',
            confidence: 0.8,
            sources: []
          });
        }
      }
    });
    
    return steps;
  }
  
  /**
   * Extract conditional logic
   */
  private static extractConditionalLogic(content: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    
    const conditionalPattern = /(?:if|when|unless|provided that)\s+([^,]+),\s+(?:then\s+)?([^.!?]+[.!?])/gi;
    const matches = content.matchAll(conditionalPattern);
    
    for (const match of matches) {
      const condition = match[1]?.trim();
      const consequence = match[2]?.trim();
      if (condition && consequence && condition.length > 5) {
        steps.push({
          description: `If ${this.cleanDescription(condition)}, then ${this.cleanDescription(consequence)}`,
          type: 'inference',
          confidence: 0.75,
          sources: []
        });
      }
    }
    
    return steps;
  }
  
  /**
   * Extract comparisons and contrasts
   */
  private static extractComparisons(content: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    
    const comparisonPatterns = [
      /([^.!?]+)\s+(?:is better than|is worse than|is similar to|differs from)\s+([^.!?]+[.!?])/gi,
      /(?:compared to|in contrast to|unlike)\s+([^,]+),\s+([^.!?]+[.!?])/gi,
      /(?:on one hand|on the other hand|however|but|although)\s+([^.!?]+[.!?])/gi
    ];
    
    comparisonPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const description = match[1]?.trim() || match[0]?.trim();
        if (description && description.length > 15 && description.length < 250) {
          steps.push({
            description: this.cleanDescription(description),
            type: 'inference',
            confidence: 0.7,
            sources: []
          });
        }
      }
    });
    
    return steps;
  }
  
  /**
   * Extract assumptions
   */
  private static extractAssumptions(content: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    
    const assumptionPatterns = [
      /(?:assuming|suppose|let's say|imagine)\s+(?:that\s+)?([^.!?]+[.!?])/gi,
      /(?:it's likely|it's probable|presumably)\s+(?:that\s+)?([^.!?]+[.!?])/gi,
      /(?:we can assume|one might assume)\s+(?:that\s+)?([^.!?]+[.!?])/gi
    ];
    
    assumptionPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const description = match[1]?.trim();
        if (description && description.length > 10 && description.length < 200) {
          steps.push({
            description: this.cleanDescription(description),
            type: 'assumption',
            confidence: 0.7,
            sources: []
          });
        }
      }
    });
    
    return steps;
  }
  
  /**
   * Extract conclusions
   */
  private static extractConclusions(content: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    
    const conclusionPatterns = [
      /(?:in conclusion|to conclude|in summary|overall)\s*,?\s*([^.!?]+[.!?])/gi,
      /(?:the key point is|the main idea is|essentially)\s+(?:that\s+)?([^.!?]+[.!?])/gi,
      /(?:this shows|this demonstrates|this proves)\s+(?:that\s+)?([^.!?]+[.!?])/gi
    ];
    
    conclusionPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const description = match[1]?.trim();
        if (description && description.length > 10) {
          steps.push({
            description: this.cleanDescription(description),
            type: 'conclusion',
            confidence: 0.85,
            sources: []
          });
        }
      }
    });
    
    return steps;
  }
  
  /**
   * Extract ethical considerations
   */
  private static extractEthicalConsiderations(content: string): string[] {
    const considerations: string[] = [];
    
    const ethicalPatterns = [
      { pattern: /(?:it's important to|it's crucial to|it's essential to)\s+([^.!?]+[.!?])/gi, prefix: 'Important: ' },
      { pattern: /(?:please note|be aware|keep in mind)\s+(?:that\s+)?([^.!?]+[.!?])/gi, prefix: 'Note: ' },
      { pattern: /(?:ethically|morally|responsibly)\s+([^.!?]+[.!?])/gi, prefix: 'Ethical consideration: ' },
      { pattern: /(?:i (?:can't|cannot|won't|will not))\s+([^.!?]+[.!?])/gi, prefix: 'Limitation: ' },
      { pattern: /(?:bias|prejudice|discrimination|fairness)/gi, prefix: 'Bias awareness: ' }
    ];
    
    ethicalPatterns.forEach(({ pattern, prefix }) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const consideration = match[1]?.trim() || match[0]?.trim();
        if (consideration && consideration.length > 10) {
          considerations.push(prefix + this.cleanDescription(consideration));
        }
      }
    });
    
    return [...new Set(considerations)].slice(0, 5);
  }
  
  /**
   * Check if content has explicit reasoning
   */
  private static hasExplicitReasoning(content: string): boolean {
    const explicitKeywords = [
      'because', 'therefore', 'thus', 'hence', 'since', 'consequently',
      'this means', 'this suggests', 'given that', 'considering'
    ];
    
    const lowerContent = content.toLowerCase();
    return explicitKeywords.some(keyword => lowerContent.includes(keyword));
  }
  
  /**
   * Remove duplicate steps
   */
  private static deduplicateSteps(steps: ReasoningStep[]): ReasoningStep[] {
    const seen = new Set<string>();
    const unique: ReasoningStep[] = [];
    
    for (const step of steps) {
      const key = step.description.toLowerCase().substring(0, 50);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(step);
      }
    }
    
    return unique;
  }
  
  /**
   * Calculate overall confidence based on steps found
   */
  private static calculateConfidence(steps: ReasoningStep[], content: string): number {
    if (steps.length === 0) return 0.3;
    
    // Average confidence of all steps
    const avgConfidence = steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length;
    
    // Bonus for explicit reasoning
    const hasExplicit = this.hasExplicitReasoning(content) ? 0.1 : 0;
    
    // Bonus for multiple steps
    const stepBonus = Math.min(steps.length * 0.05, 0.2);
    
    return Math.min(avgConfidence + hasExplicit + stepBonus, 0.95);
  }
  
  /**
   * Clean and format description
   */
  private static cleanDescription(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^[,;:]\s*/, '')
      .replace(/\s+[,;:]$/, '')
      .substring(0, 250);
  }
}
