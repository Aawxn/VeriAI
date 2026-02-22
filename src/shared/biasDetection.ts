/**
 * Bias Detection Engine
 * Analyzes text for various types of bias and ethical concerns
 */

import { BiasAnalysis, BiasPattern, BiasType, ContentFlag, RiskLevel, TextSpan, SentenceBiasAnalysis } from '../types';
import { BIAS_PATTERNS } from './constants';

export class BiasDetectionEngine {
  
  /**
   * Analyze text for bias and ethical concerns (sentence-wise)
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
   * Analyze text sentence-by-sentence for bias
   * Returns detailed per-sentence analysis
   */
  public analyzeSentenceWise(text: string): SentenceBiasAnalysis[] {
    const sentences = this.splitIntoSentences(text);
    const results: SentenceBiasAnalysis[] = [];

    sentences.forEach((sentence, index) => {
      const sentencePatterns: BiasPattern[] = [];
      
      // Run detection on each sentence
      sentencePatterns.push(...this.detectGenderBias(sentence));
      sentencePatterns.push(...this.detectRacialBias(sentence));
      sentencePatterns.push(...this.detectPoliticalBias(sentence));
      sentencePatterns.push(...this.detectEmotionalManipulation(sentence));
      sentencePatterns.push(...this.detectLogicalFallacies(sentence));
      sentencePatterns.push(...this.detectEvasiveness(sentence));

      // Filter to significant patterns only
      const significantPatterns = sentencePatterns.filter(p => p.confidence >= 0.6);

      // Calculate sentence-level severity
      const maxConfidence = significantPatterns.length > 0 
        ? Math.max(...significantPatterns.map(p => p.confidence))
        : 0;

      results.push({
        sentenceNumber: index + 1,
        text: sentence,
        biasTypes: [...new Set(significantPatterns.map(p => p.type))],
        patterns: significantPatterns,
        severity: this.calculateSeverity(maxConfidence),
        hasBias: significantPatterns.length > 0
      });
    });

    return results;
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries: . ! ? followed by space or end of string
    // Handle edge cases like "Dr." or "U.S."
    const sentences = text
      .replace(/([.!?])\s+/g, '$1|SPLIT|')
      .split('|SPLIT|')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return sentences;
  }
  
  /**
   * Detect gender bias in text - Conservative approach
   * Only flags when gender terms are combined with evaluative language or stereotypes
   */
  private detectGenderBias(text: string): BiasPattern[] {
    const patterns: BiasPattern[] = [];
    
    // Define gender terms (explicit gender references only)
    const genderTerms = {
      male: ['he', 'him', 'his', 'man', 'men', 'male', 'males', 'guy', 'guys'],
      female: ['she', 'her', 'hers', 'woman', 'women', 'female', 'females', 'girl', 'girls'],
      neutral: ['they', 'them', 'their', 'person', 'people', 'individual', 'individuals']
    };
    
    // Define evaluative verbs and phrases that suggest bias
    const evaluativePatterns = [
      'should', 'must', 'supposed to', 'ought to', 'need to', 'have to',
      'better at', 'worse at', 'good at', 'bad at', 'excel at', 'struggle with',
      'naturally', 'inherently', 'typically', 'usually', 'always', 'never',
      'more likely to', 'less likely to', 'tend to', 'inclined to'
    ];
    
    // Define stereotype attributes
    const stereotypeAttributes = {
      traditional_male: ['aggressive', 'assertive', 'dominant', 'competitive', 'strong', 'logical', 'rational', 'unemotional', 'decisive', 'independent'],
      traditional_female: ['emotional', 'nurturing', 'caring', 'sensitive', 'gentle', 'cooperative', 'supportive', 'empathetic', 'intuitive', 'dependent'],
      professional_male: ['leader', 'ceo', 'engineer', 'developer', 'scientist', 'manager', 'executive'],
      professional_female: ['nurse', 'teacher', 'secretary', 'assistant', 'caregiver', 'homemaker']
    };
    
    // Convert text to lowercase for analysis but preserve original for spans
    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/);
    const lowerWords = lowerText.split(/\s+/);
    
    // Find all gender term positions
    const genderPositions: Array<{
      word: string;
      index: number;
      wordIndex: number;
      type: 'male' | 'female';
      originalText: string;
    }> = [];
    
    lowerWords.forEach((word, wordIndex) => {
      // Remove punctuation for matching
      const cleanWord = word.replace(/[^\w]/g, '');
      
      if (genderTerms.male.includes(cleanWord)) {
        const charIndex = text.toLowerCase().indexOf(word, wordIndex > 0 ? 
          lowerWords.slice(0, wordIndex).join(' ').length + 1 : 0);
        genderPositions.push({
          word: cleanWord,
          index: charIndex,
          wordIndex,
          type: 'male',
          originalText: words[wordIndex]
        });
      } else if (genderTerms.female.includes(cleanWord)) {
        const charIndex = text.toLowerCase().indexOf(word, wordIndex > 0 ? 
          lowerWords.slice(0, wordIndex).join(' ').length + 1 : 0);
        genderPositions.push({
          word: cleanWord,
          index: charIndex,
          wordIndex,
          type: 'female',
          originalText: words[wordIndex]
        });
      }
    });
    
    // For each gender term, check contextual window for bias patterns
    genderPositions.forEach(genderPos => {
      const windowStart = Math.max(0, genderPos.wordIndex - 8);
      const windowEnd = Math.min(lowerWords.length, genderPos.wordIndex + 8);
      const contextWindow = lowerWords.slice(windowStart, windowEnd);
      const contextText = contextWindow.join(' ');
      
      let biasFound = false;
      let biasType = '';
      let confidence = 0;
      let matchedPattern = '';
      
      // Check for evaluative language + stereotype combinations
      evaluativePatterns.forEach(evalPattern => {
        if (contextText.includes(evalPattern.toLowerCase())) {
          // Check for stereotype attributes in the same context
          Object.entries(stereotypeAttributes).forEach(([category, attributes]) => {
            attributes.forEach(attribute => {
              if (contextText.includes(attribute.toLowerCase())) {
                // Determine if this is a stereotypical assignment
                const isMaleStereotype = category.includes('male');
                const isFemaleStereotype = category.includes('female');
                
                if ((genderPos.type === 'male' && isMaleStereotype) || 
                    (genderPos.type === 'female' && isFemaleStereotype)) {
                  biasFound = true;
                  biasType = 'reinforcing gender stereotype';
                  confidence = 0.85; // High confidence for clear stereotype reinforcement
                  matchedPattern = `${genderPos.word} + ${evalPattern} + ${attribute}`;
                } else if ((genderPos.type === 'male' && isFemaleStereotype) || 
                           (genderPos.type === 'female' && isMaleStereotype)) {
                  biasFound = true;
                  biasType = 'contradicting gender stereotype';
                  confidence = 0.75; // Slightly lower confidence
                  matchedPattern = `${genderPos.word} + ${evalPattern} + ${attribute}`;
                }
              }
            });
          });
          
          // Check for direct evaluative statements without stereotypes but with prescriptive language
          if (!biasFound) {
            const prescriptivePatterns = [
              'should be', 'must be', 'supposed to be', 'ought to be',
              'should do', 'must do', 'supposed to do', 'ought to do',
              'should handle', 'must handle', 'supposed to handle', 'need to handle',
              'should take care of', 'must take care of', 'supposed to take care of'
            ];
            
            prescriptivePatterns.forEach(pattern => {
              if (contextText.includes(pattern)) {
                biasFound = true;
                biasType = 'prescriptive gender role assignment';
                confidence = 0.80;
                matchedPattern = `${genderPos.word} + ${pattern}`;
              }
            });
          }
        }
      });
      
      // Check for explicit comparisons between genders
      if (!biasFound) {
        const comparisonPatterns = [
          /\b(men|males?|guys?)\s+(are\s+)?(better|worse|stronger|weaker|smarter|more|less)\s+.{0,20}\s+than\s+(women|females?|girls?)/gi,
          /\b(women|females?|girls?)\s+(are\s+)?(better|worse|stronger|weaker|smarter|more|less)\s+.{0,20}\s+than\s+(men|males?|guys?)/gi,
          /\b(men|males?|guys?)\s+(are\s+)?(more|less)\s+likely\s+to/gi,
          /\b(women|females?|girls?)\s+(are\s+)?(more|less)\s+likely\s+to/gi
        ];
        
        comparisonPatterns.forEach(pattern => {
          const matches = text.matchAll(pattern);
          for (const match of matches) {
            // Check if this match overlaps with our current gender position
            if (match.index !== undefined) {
              const matchStart = match.index;
              const matchEnd = match.index + match[0].length;
              const genderCharPos = genderPos.index;
              
              // Only flag if the gender position is within this comparison match
              if (genderCharPos >= matchStart - 10 && genderCharPos <= matchEnd + 10) {
                biasFound = true;
                biasType = 'explicit gender comparison';
                confidence = 0.90; // Very high confidence for explicit comparisons
                matchedPattern = match[0].substring(0, 30) + '...';
                break;
              }
            }
          }
        });
      }
      
      // Only add pattern if bias was found with sufficient confidence
      if (biasFound && confidence >= 0.75) {
        // Calculate the full span of the biased content
        const spanStart = Math.max(0, genderPos.index - 20);
        const spanEnd = Math.min(text.length, genderPos.index + genderPos.originalText.length + 30);
        const spanText = text.substring(spanStart, spanEnd).trim();
        
        patterns.push({
          type: 'gender_bias',
          confidence,
          textSpan: {
            start: spanStart,
            end: spanEnd,
            text: spanText
          },
          explanation: `Gender bias detected: ${biasType} (${matchedPattern})`
        });
      }
    });
    
    // Remove duplicate patterns that overlap significantly
    return this.deduplicateGenderPatterns(patterns);
  }
  
  /**
   * Remove overlapping gender bias patterns
   */
  private deduplicateGenderPatterns(patterns: BiasPattern[]): BiasPattern[] {
    const filtered: BiasPattern[] = [];
    
    patterns.forEach(pattern => {
      const hasOverlap = filtered.some(existing => {
        const overlapStart = Math.max(pattern.textSpan.start, existing.textSpan.start);
        const overlapEnd = Math.min(pattern.textSpan.end, existing.textSpan.end);
        const overlapLength = Math.max(0, overlapEnd - overlapStart);
        const minLength = Math.min(
          pattern.textSpan.end - pattern.textSpan.start,
          existing.textSpan.end - existing.textSpan.start
        );
        return overlapLength > minLength * 0.5; // More than 50% overlap
      });
      
      if (!hasOverlap) {
        filtered.push(pattern);
      } else {
        // Keep the one with higher confidence
        const existingIndex = filtered.findIndex(existing => {
          const overlapStart = Math.max(pattern.textSpan.start, existing.textSpan.start);
          const overlapEnd = Math.min(pattern.textSpan.end, existing.textSpan.end);
          const overlapLength = Math.max(0, overlapEnd - overlapStart);
          const minLength = Math.min(
            pattern.textSpan.end - pattern.textSpan.start,
            existing.textSpan.end - existing.textSpan.start
          );
          return overlapLength > minLength * 0.5;
        });
        
        if (existingIndex !== -1 && pattern.confidence > filtered[existingIndex].confidence) {
          filtered[existingIndex] = pattern;
        }
      }
    });
    
    return filtered;
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
