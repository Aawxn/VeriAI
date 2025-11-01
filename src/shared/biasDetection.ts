/**
 * Bias Detection Engine
 * Analyzes text for various types of bias and ethical concerns
 */

import { BiasAnalysis, BiasPattern, BiasType, ContentFlag, RiskLevel, TextSpan } from '../types';
import { BIAS_PATTERNS } from './constants';

export class BiasDetectionEngine {
  
  /**
   * Analyze text for bias and ethical concerns
   */
  public analyzeText(text: string): BiasAnalysis {
    const detectedPatterns: BiasPattern[] = [];
    const flaggedContent: ContentFlag[] = [];
    
    // Run all detection methods
    detectedPatterns.push(...this.detectGenderBias(text));
    detectedPatterns.push(...this.detectRacialBias(text));
    detectedPatterns.push(...this.detectPoliticalBias(text));
    detectedPatterns.push(...this.detectEmotionalManipulation(text));
    detectedPatterns.push(...this.detectLogicalFallacies(text));
    detectedPatterns.push(...this.detectEvasiveness(text));
    
    // Convert patterns to flags
    detectedPatterns.forEach(pattern => {
      if (pattern.confidence >= 0.6) {
        flaggedContent.push({
          type: pattern.type,
          severity: this.calculateSeverity(pattern.confidence),
          description: pattern.explanation,
          textSpan: pattern.textSpan
        });
      }
    });
    
    // Calculate overall risk
    const overallRisk = this.calculateOverallRisk(detectedPatterns);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(detectedPatterns, overallRisk);
    
    return {
      overallRisk,
      detectedPatterns,
      recommendations,
      flaggedContent
    };
  }
  
  /**
   * Detect gender bias in text
   */
  private detectGenderBias(text: string): BiasPattern[] {
    const patterns: BiasPattern[] = [];
    const lowerText = text.toLowerCase();
    
    // Gendered language patterns
    const genderPatterns = [
      { pattern: /\b(he|him|his)\b(?!\s+(or|\/)\s+(she|her))/gi, bias: 'male-centric language' },
      { pattern: /\b(she|her|hers)\b(?!\s+(or|\/)\s+(he|him))/gi, bias: 'female-centric language' },
      { pattern: /\b(mankind|manpower|man-made)\b/gi, bias: 'gendered terminology' },
      { pattern: /\b(guys|dudes|bros)\b/gi, bias: 'male-defaulting terms' },
      { pattern: /\b(emotional|nurturing|caring)\b.*\b(woman|women|female)\b/gi, bias: 'gender stereotyping' },
      { pattern: /\b(aggressive|assertive|strong)\b.*\b(man|men|male)\b/gi, bias: 'gender stereotyping' }
    ];
    
    genderPatterns.forEach(({ pattern, bias }) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          patterns.push({
            type: 'gender_bias',
            confidence: 0.7,
            textSpan: {
              start: match.index,
              end: match.index + match[0].length,
              text: match[0]
            },
            explanation: `Potential gender bias detected: ${bias}`
          });
        }
      }
    });
    
    return patterns;
  }
  
  /**
   * Detect racial bias in text
   */
  private detectRacialBias(text: string): BiasPattern[] {
    const patterns: BiasPattern[] = [];
    
    // Racial stereotyping patterns
    const racialPatterns = [
      /\b(all|every|most)\s+(black|white|asian|hispanic|latino)\s+(people|person|individuals?)\s+(are|is)/gi,
      /\b(typical|stereotypical)\s+(black|white|asian|hispanic|latino)/gi,
      /\b(those|these)\s+(people|folks)\b/gi // Context-dependent
    ];
    
    racialPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          patterns.push({
            type: 'racial_bias',
            confidence: 0.75,
            textSpan: {
              start: match.index,
              end: match.index + match[0].length,
              text: match[0]
            },
            explanation: 'Potential racial stereotyping or generalization detected'
          });
        }
      }
    });
    
    return patterns;
  }
  
  /**
   * Detect political bias in text
   */
  private detectPoliticalBias(text: string): BiasPattern[] {
    const patterns: BiasPattern[] = [];
    
    // Political bias indicators
    const politicalPatterns = [
      { pattern: /\b(liberals?|conservatives?)\s+(always|never|all)\b/gi, bias: 'political generalization' },
      { pattern: /\b(left-wing|right-wing)\s+(agenda|propaganda|lies)\b/gi, bias: 'political demonization' },
      { pattern: /\b(obviously|clearly|everyone knows)\s+.*\b(democrat|republican|liberal|conservative)\b/gi, bias: 'political assumption' }
    ];
    
    politicalPatterns.forEach(({ pattern, bias }) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          patterns.push({
            type: 'political_bias',
            confidence: 0.8,
            textSpan: {
              start: match.index,
              end: match.index + match[0].length,
              text: match[0]
            },
            explanation: `Political bias detected: ${bias}`
          });
        }
      }
    });
    
    return patterns;
  }
  
  /**
   * Detect emotional manipulation in text
   */
  private detectEmotionalManipulation(text: string): BiasPattern[] {
    const patterns: BiasPattern[] = [];
    
    // Emotional manipulation patterns
    const manipulationPatterns = [
      { pattern: /\b(you should feel|you must feel|everyone feels)\b/gi, type: 'emotional coercion' },
      { pattern: /\b(obviously|clearly|everyone knows|it's common sense)\b/gi, type: 'appeal to obviousness' },
      { pattern: /\b(always|never|all|none|every single)\b/gi, type: 'absolutist language' },
      { pattern: /\b(trust me|believe me|take my word)\b/gi, type: 'appeal to trust' }
    ];
    
    manipulationPatterns.forEach(({ pattern, type }) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          patterns.push({
            type: 'emotional_manipulation',
            confidence: 0.65,
            textSpan: {
              start: match.index,
              end: match.index + match[0].length,
              text: match[0]
            },
            explanation: `Emotional manipulation detected: ${type}`
          });
        }
      }
    });
    
    return patterns;
  }
  
  /**
   * Detect logical fallacies in text
   */
  private detectLogicalFallacies(text: string): BiasPattern[] {
    const patterns: BiasPattern[] = [];
    
    // Logical fallacy patterns
    const fallacyPatterns = [
      { pattern: /\b(if .+ then .+ must)\b/gi, fallacy: 'false causation' },
      { pattern: /\b(either .+ or .+)\b/gi, fallacy: 'false dichotomy' },
      { pattern: /\b(everyone|nobody|all|none)\s+(thinks|believes|knows)\b/gi, fallacy: 'appeal to popularity' },
      { pattern: /\b(has always been|has never been)\b/gi, fallacy: 'appeal to tradition' }
    ];
    
    fallacyPatterns.forEach(({ pattern, fallacy }) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          patterns.push({
            type: 'logical_fallacy',
            confidence: 0.6,
            textSpan: {
              start: match.index,
              end: match.index + match[0].length,
              text: match[0]
            },
            explanation: `Logical fallacy detected: ${fallacy}`
          });
        }
      }
    });
    
    return patterns;
  }
  
  /**
   * Detect evasive language
   */
  private detectEvasiveness(text: string): BiasPattern[] {
    const patterns: BiasPattern[] = [];
    
    // Evasive language patterns
    const evasivePatterns = [
      /\b(it depends|perhaps|might be|could be|possibly|maybe)\b/gi,
      /\b(some people say|it's been said|there are those who)\b/gi,
      /\b(in some cases|sometimes|occasionally)\b/gi
    ];
    
    let evasiveCount = 0;
    evasivePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        evasiveCount++;
      }
    });
    
    // Only flag if excessive evasiveness (more than 3 instances)
    if (evasiveCount > 3) {
      patterns.push({
        type: 'evasiveness',
        confidence: 0.7,
        textSpan: {
          start: 0,
          end: text.length,
          text: text.substring(0, 100) + '...'
        },
        explanation: `Excessive evasive language detected (${evasiveCount} instances)`
      });
    }
    
    return patterns;
  }
  
  /**
   * Calculate severity based on confidence
   */
  private calculateSeverity(confidence: number): RiskLevel {
    if (confidence >= 0.85) return 'critical';
    if (confidence >= 0.75) return 'high';
    if (confidence >= 0.65) return 'medium';
    return 'low';
  }
  
  /**
   * Calculate overall risk level
   */
  private calculateOverallRisk(patterns: BiasPattern[]): RiskLevel {
    if (patterns.length === 0) return 'low';
    
    const highConfidencePatterns = patterns.filter(p => p.confidence >= 0.75);
    const criticalPatterns = patterns.filter(p => p.confidence >= 0.85);
    
    if (criticalPatterns.length > 0) return 'critical';
    if (highConfidencePatterns.length >= 2) return 'high';
    if (patterns.length >= 3) return 'medium';
    
    return 'low';
  }
  
  /**
   * Generate recommendations based on detected patterns
   */
  private generateRecommendations(patterns: BiasPattern[], overallRisk: RiskLevel): string[] {
    const recommendations: string[] = [];
    
    if (overallRisk === 'low' && patterns.length === 0) {
      recommendations.push('No significant bias detected. Response appears balanced.');
      return recommendations;
    }
    
    // Group patterns by type
    const patternsByType = patterns.reduce((acc, pattern) => {
      if (!acc[pattern.type]) acc[pattern.type] = [];
      acc[pattern.type].push(pattern);
      return acc;
    }, {} as Record<BiasType, BiasPattern[]>);
    
    // Generate type-specific recommendations
    Object.entries(patternsByType).forEach(([type, typePatterns]) => {
      switch (type as BiasType) {
        case 'gender_bias':
          recommendations.push('Consider using gender-neutral language');
          break;
        case 'racial_bias':
          recommendations.push('Avoid racial generalizations and stereotypes');
          break;
        case 'political_bias':
          recommendations.push('Present multiple political perspectives fairly');
          break;
        case 'emotional_manipulation':
          recommendations.push('Use factual language instead of emotional appeals');
          break;
        case 'logical_fallacy':
          recommendations.push('Strengthen logical reasoning and avoid fallacies');
          break;
        case 'evasiveness':
          recommendations.push('Provide more direct and specific answers');
          break;
      }
    });
    
    if (overallRisk === 'high' || overallRisk === 'critical') {
      recommendations.push('⚠️ Multiple bias indicators detected - review response carefully');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const biasDetector = new BiasDetectionEngine();
