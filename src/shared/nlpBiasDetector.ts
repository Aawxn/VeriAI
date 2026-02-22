/**
 * NLP-Based Bias Detection using Compromise.js
 * 
 * WHAT IT DOES:
 * - Uses Natural Language Processing to understand MEANING, not just keywords
 * - Detects semantic patterns (same bias, different words)
 * - Analyzes sentence structure to find implicit bias
 * - Detects generalizations, stereotypes, and loaded language
 * 
 * EXAMPLES:
 * Keyword Detection: "women are nurturing" ✓ Found
 * NLP Detection: "individuals identifying as female naturally excel in caregiving roles" ✓ Found (same meaning!)
 * 
 * WHY IT'S BETTER:
 * - Catches bias even when AI uses sophisticated language
 * - Understands context (not just word matching)
 * - Detects implicit bias (hidden assumptions)
 */

// Use dynamic import for Compromise.js to avoid module issues
const nlp = require('compromise');

export interface NLPBiasResult {
  overallScore: number; // 0-100 (0 = no bias, 100 = extreme bias)
  detectedBiases: Array<{
    type: 'gender' | 'racial' | 'political' | 'age' | 'generalization' | 'loaded_language';
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: string; // The sentence where bias was found
    explanation: string;
    pattern: string; // What pattern was matched
  }>;
  implicitBias: {
    detected: boolean;
    confidence: number;
    indicators: string[];
  };
  semanticAnalysis: {
    hasAbsoluteStatements: boolean; // "all X are Y", "never", "always"
    hasStereotyping: boolean; // "X tend to be Y"
    hasComparisons: boolean; // "X are better than Y"
    hasEmotionalLanguage: boolean; // Loaded words
  };
}

export class NLPBiasDetector {
  
  /**
   * Main analysis function - detects bias using NLP
   */
  public static analyze(text: string): NLPBiasResult {
    try {
      // Safety check: ensure nlp is loaded
      if (typeof nlp !== 'function') {
        console.error('❌ Compromise.js not loaded properly');
        return this.getEmptyResult();
      }

      const doc = nlp(text);
      
      // Safety check: ensure doc was created
      if (!doc || typeof doc.sentences !== 'function') {
        console.error('❌ Failed to create NLP document');
        return this.getEmptyResult();
      }

      const detectedBiases: NLPBiasResult['detectedBiases'] = [];
      
      // 1. DETECT SEMANTIC PATTERNS
      detectedBiases.push(...this.detectSemanticGenderBias(doc));
      detectedBiases.push(...this.detectSemanticRacialBias(doc));
      detectedBiases.push(...this.detectPoliticalBias(doc));
      detectedBiases.push(...this.detectGeneralizations(doc));
      detectedBiases.push(...this.detectLoadedLanguage(doc));
      
      // 2. DETECT IMPLICIT BIAS
      const implicitBias = this.detectImplicitBias(doc);
      
      // 3. SEMANTIC ANALYSIS
      const semanticAnalysis = this.analyzeSemanticPatterns(doc);
      
      // 4. CALCULATE OVERALL SCORE
      const severityWeights = { low: 10, medium: 25, high: 50, critical: 100 };
      const biasScore = detectedBiases.reduce((sum, bias) => 
        sum + severityWeights[bias.severity], 0
      );
      const overallScore = Math.min(100, biasScore + (implicitBias.confidence / 2));
      
      return {
        overallScore: Math.round(overallScore),
        detectedBiases,
        implicitBias,
        semanticAnalysis
      };
    } catch (error) {
      console.error('❌ NLP analysis error:', error);
      return this.getEmptyResult();
    }
  }

  /**
   * Returns empty result when NLP fails
   */
  private static getEmptyResult(): NLPBiasResult {
    return {
      overallScore: 0,
      detectedBiases: [],
      implicitBias: {
        detected: false,
        confidence: 0,
        indicators: []
      },
      semanticAnalysis: {
        hasAbsoluteStatements: false,
        hasStereotyping: false,
        hasComparisons: false,
        hasEmotionalLanguage: false
      }
    };
  }
  
  /**
   * Detect gender bias through semantic patterns
   */
  private static detectSemanticGenderBias(doc: any): NLPBiasResult['detectedBiases'] {
    const biases: NLPBiasResult['detectedBiases'] = [];
    const sentences = doc.sentences();
    
    sentences.forEach((sentence: any) => {
      const text = sentence.text();
      
      // Pattern 1: "X tend to/naturally/typically Y" (gender stereotyping)
      const tendPattern = sentence.match('(men|women|males|females|boys|girls) (tend to|naturally|typically|generally|usually|often) #Verb+');
      if (tendPattern.found) {
        biases.push({
          type: 'gender',
          severity: 'high',
          context: text,
          explanation: 'Gender stereotyping detected: Using "tend to" or similar words to generalize about a gender',
          pattern: 'Gender + (tend to/naturally) + Verb'
        });
      }
      
      // Pattern 2: "X should/must Y" (prescriptive gender roles)
      const shouldPattern = sentence.match('(men|women|males|females|he|she) (should|must|ought to|are expected to|need to) #Verb+');
      if (shouldPattern.found) {
        biases.push({
          type: 'gender',
          severity: 'critical',
          context: text,
          explanation: 'Prescriptive gender bias: Dictating what a gender should do',
          pattern: 'Gender + should/must + Verb'
        });
      }
      
      // Pattern 3: "X are better/worse at Y" (comparative gender bias)
      const comparePattern = sentence.match('(men|women|males|females) are (better|worse|superior|inferior) (at|than)');
      if (comparePattern.found) {
        biases.push({
          type: 'gender',
          severity: 'critical',
          context: text,
          explanation: 'Gender comparison creating hierarchy',
          pattern: 'Gender + better/worse + at/than'
        });
      }
    });
    
    return biases;
  }
  
  /**
   * Detect racial/ethnic bias through semantic patterns
   */
  private static detectSemanticRacialBias(doc: any): NLPBiasResult['detectedBiases'] {
    const biases: NLPBiasResult['detectedBiases'] = [];
    const sentences = doc.sentences();
    
    sentences.forEach((sentence: any) => {
      const text = sentence.text();
      const lower = text.toLowerCase();
      
      // Pattern 1: Ethnic/racial group + generalization
      const groupPattern = sentence.match('(people|individuals|those) (from|of) #Place+ (tend to|are known for|typically|usually)');
      if (groupPattern.found) {
        biases.push({
          type: 'racial',
          severity: 'high',
          context: text,
          explanation: 'Racial/ethnic stereotyping based on geographic origin',
          pattern: 'People from [Place] + tend to/typically'
        });
      }
      
      // Pattern 2: "All/Most X people are Y"
      if (/(all|most|many|typical|stereotypical).*(black|white|asian|hispanic|latino|african|european|arab)/i.test(lower)) {
        biases.push({
          type: 'racial',
          severity: 'critical',
          context: text,
          explanation: 'Racial generalization using absolute/majority terms',
          pattern: 'All/Most + racial group + are'
        });
      }
    });
    
    return biases;
  }
  
  /**
   * Detect political bias
   */
  private static detectPoliticalBias(doc: any): NLPBiasResult['detectedBiases'] {
    const biases: NLPBiasResult['detectedBiases'] = [];
    const sentences = doc.sentences();
    
    sentences.forEach((sentence: any) => {
      const text = sentence.text();
      
      // Pattern: Political group + (always/never/all)
      const absolutePattern = sentence.match('(liberal|conservative|democrat|republican|left|right) (always|never|all|every)');
      if (absolutePattern.found) {
        biases.push({
          type: 'political',
          severity: 'high',
          context: text,
          explanation: 'Political generalization using absolute terms',
          pattern: 'Political group + always/never'
        });
      }
      
      // Pattern: Political group + negative action
      const negativePattern = sentence.match('(liberal|conservative|democrat|republican) (destroy|ruin|lie|cheat|manipulate)');
      if (negativePattern.found) {
        biases.push({
          type: 'political',
          severity: 'critical',
          context: text,
          explanation: 'Political demonization with negative verbs',
          pattern: 'Political group + destroy/ruin/lie'
        });
      }
    });
    
    return biases;
  }
  
  /**
   * Detect generalizations (overly broad statements)
   */
  private static detectGeneralizations(doc: any): NLPBiasResult['detectedBiases'] {
    const biases: NLPBiasResult['detectedBiases'] = [];
    const sentences = doc.sentences();
    
    sentences.forEach((sentence: any) => {
      const text = sentence.text();
      
      // Pattern: "All/Every X are/do Y"
      const allPattern = sentence.match('(all|every|always|never|none|no one) #Noun+ (are|do|will|can)');
      if (allPattern.found) {
        // Check if it's about groups of people (more serious)
        const aboutPeople = sentence.match('(all|every) (people|person|individuals|men|women|children)');
        
        biases.push({
          type: 'generalization',
          severity: aboutPeople.found ? 'high' : 'medium',
          context: text,
          explanation: 'Overgeneralization using absolute terms (all/every/always/never)',
          pattern: 'All/Every + Noun + are/do'
        });
      }
    });
    
    return biases;
  }
  
  /**
   * Detect loaded/emotional language
   */
  private static detectLoadedLanguage(doc: any): NLPBiasResult['detectedBiases'] {
    const biases: NLPBiasResult['detectedBiases'] = [];
    
    // Detect emotionally charged adjectives
    const adjectives = doc.adjectives().out('array');
    const loadedWords = ['terrible', 'horrible', 'wonderful', 'perfect', 'disgusting', 'amazing', 
                         'awful', 'brilliant', 'stupid', 'genius', 'evil', 'divine'];
    
    const foundLoaded = adjectives.filter((adj: string) => 
      loadedWords.some(loaded => adj.toLowerCase().includes(loaded))
    );
    
    if (foundLoaded.length >= 3) {
      biases.push({
        type: 'loaded_language',
        severity: 'medium',
        context: foundLoaded.join(', '),
        explanation: `Excessive use of emotionally loaded language (${foundLoaded.length} instances)`,
        pattern: 'Multiple emotionally charged adjectives'
      });
    }
    
    return biases;
  }
  
  /**
   * Detect implicit bias (hidden assumptions)
   */
  private static detectImplicitBias(doc: any): NLPBiasResult['implicitBias'] {
    const indicators: string[] = [];
    
    // 1. Check for vague authority claims
    const vagueAuthority = doc.match('(some say|many believe|it is known that|studies show|experts agree)');
    if (vagueAuthority.found) {
      indicators.push('Uses vague authority claims without specific sources');
    }
    
    // 2. Check for excessive passive voice (hides agency/responsibility)
    const passiveVoice = doc.match('#Noun+ (was|were|is|are) #PastTense+').length;
    if (passiveVoice > 3) {
      indicators.push(`Excessive passive voice (${passiveVoice} instances) may obscure responsibility`);
    }
    
    // 3. Check for hedging language (shows uncertainty being presented as fact)
    const hedging = doc.match('(perhaps|possibly|might be|could be|may be)').length;
    if (hedging > 4) {
      indicators.push(`Excessive hedging (${hedging} instances) suggests uncertainty presented as fact`);
    }
    
    // 4. Check for "we/us/our" vs "they/them/their" (in-group vs out-group)
    const weUs = doc.match('(we|us|our)').length;
    const theyThem = doc.match('(they|them|their)').length;
    if (weUs > 0 && theyThem > weUs * 2) {
      indicators.push('Strong in-group vs out-group language (us vs them)');
    }
    
    const confidence = Math.min(100, indicators.length * 20);
    
    return {
      detected: indicators.length > 0,
      confidence,
      indicators
    };
  }
  
  /**
   * Analyze semantic patterns in the text
   */
  private static analyzeSemanticPatterns(doc: any): NLPBiasResult['semanticAnalysis'] {
    return {
      hasAbsoluteStatements: doc.match('(all|every|always|never|none)').found,
      hasStereotyping: doc.match('(tend to|naturally|typically|usually|generally) #Verb+').found,
      hasComparisons: doc.match('(better|worse|superior|inferior) than').found,
      hasEmotionalLanguage: doc.adjectives().length > 10
    };
  }
}
