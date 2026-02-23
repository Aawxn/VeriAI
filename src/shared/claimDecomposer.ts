/**
 * Claim Decomposer — Feature 2: Verifiable Claim Extraction
 * 
 * Splits AI responses into individual factual claims, classifies each as
 * verifiable or unverifiable, and assigns confidence scores.
 * Uses Compromise.js NLP for sentence splitting and part-of-speech analysis.
 */

export interface DecomposedClaim {
  id: number;
  text: string;
  type: ClaimType;
  verifiable: boolean;
  confidence: number;          // 0–1: how confident we are in the classification
  verificationHint: string;    // how someone could verify this
  flagged: boolean;            // true if claim is suspicious
  flagReason?: string;
  category: ClaimCategory;
}

export type ClaimType = 
  | 'factual'         // Specific fact that can be checked
  | 'statistical'     // Contains numbers/percentages
  | 'causal'          // Claims X causes Y
  | 'comparative'     // Compares two things
  | 'opinion'         // Subjective statement
  | 'definition'      // Defines a concept
  | 'procedural'      // Describes steps/process
  | 'hedged'          // Contains hedging language (might, could, perhaps)
  | 'absolute';       // Uses absolute language (always, never, all)

export type ClaimCategory = 
  | 'science'
  | 'history'
  | 'technology'
  | 'health'
  | 'politics'
  | 'economics'
  | 'general'
  | 'legal'
  | 'ethics';

export interface ClaimDecompositionResult {
  claims: DecomposedClaim[];
  totalClaims: number;
  verifiableClaims: number;
  unverifiableClaims: number;
  flaggedClaims: number;
  overallReliability: number;  // 0–100
  summary: string;
}

// Patterns for claim detection
const STATISTICAL_PATTERN = /\b\d+(\.\d+)?(%| percent| million| billion| thousand| trillion)\b/i;
const CAUSAL_PATTERN = /\b(causes?|leads? to|results? in|due to|because of|contributes? to|responsible for)\b/i;
const COMPARATIVE_PATTERN = /\b(more than|less than|better|worse|faster|slower|larger|smaller|greater|compared to|versus|vs\.?)\b/i;
const OPINION_PATTERN = /\b(I think|I believe|in my opinion|arguably|it seems|I feel|personally|subjective)\b/i;
const HEDGING_PATTERN = /\b(might|could|may|perhaps|possibly|probably|likely|unlikely|it's possible|some suggest|appears to|seems to)\b/i;
const ABSOLUTE_PATTERN = /\b(always|never|every|all|none|no one|everyone|impossible|certainly|definitely|undoubtedly|without exception)\b/i;
const DEFINITION_PATTERN = /\b(is defined as|refers to|means|is a|is the|known as|called)\b/i;
const PROCEDURAL_PATTERN = /\b(first|then|next|step \d|finally|begin by|start with|followed by|after that)\b/i;

// Category detection keywords
const CATEGORY_KEYWORDS: Record<ClaimCategory, RegExp> = {
  science: /\b(scientific|research|study|experiment|hypothesis|theory|evidence|molecule|atom|physics|chemistry|biology|evolution)\b/i,
  history: /\b(historical|century|ancient|war|revolution|era|dynasty|empire|founded|discovered|invented)\b/i,
  technology: /\b(software|hardware|algorithm|AI|machine learning|computer|internet|digital|technology|programming|code|app)\b/i,
  health: /\b(health|medical|disease|treatment|symptom|diagnosis|medicine|therapy|clinical|patient|doctor|hospital)\b/i,
  politics: /\b(government|policy|political|election|democrat|republican|congress|parliament|legislation|regulation)\b/i,
  economics: /\b(economy|economic|market|trade|GDP|inflation|recession|investment|financial|stock|price|cost)\b/i,
  legal: /\b(law|legal|court|judge|rights|constitution|statute|regulation|compliance|attorney|lawsuit)\b/i,
  ethics: /\b(ethical|moral|right|wrong|should|ought|responsibility|fairness|justice|bias|discrimination)\b/i,
  general: /./  // catch-all
};

// Verification hint templates
const VERIFICATION_HINTS: Record<ClaimType, string> = {
  factual: 'Check authoritative sources, encyclopedias, or official records.',
  statistical: 'Verify the statistic against the original data source or study.',
  causal: 'Look for peer-reviewed research establishing this causal relationship.',
  comparative: 'Find comparative studies or direct measurement data.',
  opinion: 'This is a subjective claim — consider multiple perspectives.',
  definition: 'Cross-reference with authoritative definitions (dictionaries, textbooks).',
  procedural: 'Verify the procedure against official documentation or expert guides.',
  hedged: 'The claim uses hedging language — investigate the strength of evidence.',
  absolute: 'Absolute claims are often overgeneralizations — look for counterexamples.'
};

export class ClaimDecomposer {
  
  /**
   * Decompose an AI response into individual verifiable claims.
   */
  public static decompose(content: string): ClaimDecompositionResult {
    if (!content || !content.trim()) {
      return this.emptyResult();
    }

    // Split into sentences using NLP if available, otherwise regex
    const sentences = this.splitIntoSentences(content);
    
    // Process each sentence into claims
    const claims: DecomposedClaim[] = [];
    let claimId = 1;

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length < 10) continue; // Skip very short fragments
      if (this.isBoilerplate(trimmed)) continue; // Skip boilerplate

      const claim = this.analyzeClaim(claimId, trimmed);
      claims.push(claim);
      claimId++;
    }

    // Calculate aggregate metrics
    const verifiableClaims = claims.filter(c => c.verifiable).length;
    const unverifiableClaims = claims.filter(c => !c.verifiable).length;
    const flaggedClaims = claims.filter(c => c.flagged).length;
    
    // Overall reliability: ratio of verifiable + low-risk claims
    const overallReliability = claims.length > 0
      ? Math.round(((verifiableClaims - flaggedClaims * 0.5) / claims.length) * 100)
      : 0;

    const summary = this.generateSummary(claims, verifiableClaims, flaggedClaims);

    return {
      claims,
      totalClaims: claims.length,
      verifiableClaims,
      unverifiableClaims,
      flaggedClaims,
      overallReliability: Math.max(0, Math.min(100, overallReliability)),
      summary
    };
  }

  /**
   * Split text into sentences. Tries Compromise.js first, then regex fallback.
   */
  private static splitIntoSentences(text: string): string[] {
    try {
      const nlp = require('compromise');
      const doc = nlp(text);
      const sentences = doc.sentences().out('array') as string[];
      if (sentences.length > 0) return sentences;
    } catch {
      // Compromise not available, fall through to regex
    }

    // Regex fallback: split on sentence-ending punctuation
    return text
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);
  }

  /**
   * Analyze a single sentence and classify it as a claim
   */
  private static analyzeClaim(id: number, text: string): DecomposedClaim {
    const type = this.classifyClaimType(text);
    const category = this.classifyCategory(text);
    const verifiable = this.isVerifiable(type, text);
    const confidence = this.calculateClaimConfidence(type, text);
    const { flagged, flagReason } = this.checkForFlags(type, text);
    const verificationHint = VERIFICATION_HINTS[type];

    return {
      id,
      text,
      type,
      verifiable,
      confidence,
      verificationHint,
      flagged,
      flagReason,
      category
    };
  }

  /**
   * Classify the type of claim
   */
  private static classifyClaimType(text: string): ClaimType {
    if (STATISTICAL_PATTERN.test(text)) return 'statistical';
    if (ABSOLUTE_PATTERN.test(text)) return 'absolute';
    if (OPINION_PATTERN.test(text)) return 'opinion';
    if (HEDGING_PATTERN.test(text)) return 'hedged';
    if (CAUSAL_PATTERN.test(text)) return 'causal';
    if (COMPARATIVE_PATTERN.test(text)) return 'comparative';
    if (DEFINITION_PATTERN.test(text)) return 'definition';
    if (PROCEDURAL_PATTERN.test(text)) return 'procedural';
    return 'factual';
  }

  /**
   * Classify the topic category of a claim
   */
  private static classifyCategory(text: string): ClaimCategory {
    for (const [category, pattern] of Object.entries(CATEGORY_KEYWORDS)) {
      if (category === 'general') continue;
      if (pattern.test(text)) return category as ClaimCategory;
    }
    return 'general';
  }

  /**
   * Determine if a claim is verifiable
   */
  private static isVerifiable(type: ClaimType, text: string): boolean {
    switch (type) {
      case 'factual':
      case 'statistical':
      case 'definition':
        return true;
      case 'causal':
      case 'comparative':
        return true; // Can be verified with research
      case 'procedural':
        return true; // Can be verified against documentation
      case 'opinion':
        return false;
      case 'hedged':
        return false; // Too uncertain to verify
      case 'absolute':
        return true; // **definitely** verifiable — look for counterexamples
      default:
        return text.length > 15; // Short fragments unlikely to be verifiable claims
    }
  }

  /**
   * Calculate confidence in our classification
   */
  private static calculateClaimConfidence(type: ClaimType, text: string): number {
    let base = 0.7;

    // Strong pattern matches increase confidence
    if (type === 'statistical' && STATISTICAL_PATTERN.test(text)) base = 0.95;
    if (type === 'opinion' && OPINION_PATTERN.test(text)) base = 0.9;
    if (type === 'absolute' && ABSOLUTE_PATTERN.test(text)) base = 0.9;

    // Longer, more detailed claims are easier to classify
    if (text.length > 100) base += 0.05;
    if (text.length > 200) base += 0.05;

    // Very short claims are harder
    if (text.length < 30) base -= 0.15;

    return Math.max(0.1, Math.min(1.0, base));
  }

  /**
   * Check if a claim should be flagged as suspicious
   */
  private static checkForFlags(type: ClaimType, text: string): { flagged: boolean; flagReason?: string } {
    // Flag absolute claims (overgen generalizations)
    if (type === 'absolute') {
      return { flagged: true, flagReason: 'Uses absolute language — may be an overgeneralization' };
    }

    // Flag unverifiable causal claims without evidence
    if (type === 'causal' && !text.match(/\b(study|research|evidence|data|according to)\b/i)) {
      return { flagged: true, flagReason: 'Causal claim without cited evidence' };
    }

    // Flag statistics without sources
    if (type === 'statistical' && !text.match(/\b(according to|source|study|report|survey|data from)\b/i)) {
      return { flagged: true, flagReason: 'Statistic cited without source attribution' };
    }

    // Flag hedged claims that sound authoritative
    if (type === 'hedged' && text.match(/\b(most|experts?|scientists?|research)\b/i)) {
      return { flagged: true, flagReason: 'Hedged claim invoking authority without specifics' };
    }

    return { flagged: false };
  }

  /**
   * Skip boilerplate/filler sentences
   */
  private static isBoilerplate(text: string): boolean {
    const boilerplate = [
      /^(sure|okay|certainly|of course|great question|happy to help)/i,
      /^(here'?s?|let me|i'?ll|i can)/i,
      /^(thank you|thanks|you're welcome)/i,
      /^(please note|note that|keep in mind)/i,
      /^(in summary|to summarize|in conclusion|overall|to sum up)/i,
      /^(hope this helps|let me know|feel free)/i,
    ];
    return boilerplate.some(p => p.test(text.trim()));
  }

  /**
   * Generate a human-readable summary of the decomposition
   */
  private static generateSummary(
    claims: DecomposedClaim[],
    verifiable: number,
    flagged: number
  ): string {
    if (claims.length === 0) return 'No claims detected in the response.';

    const parts: string[] = [];
    parts.push(`${claims.length} claims extracted.`);
    parts.push(`${verifiable} verifiable, ${claims.length - verifiable} unverifiable.`);
    
    if (flagged > 0) {
      parts.push(`⚠ ${flagged} claim${flagged > 1 ? 's' : ''} flagged for review.`);
    }

    // Type breakdown
    const typeGroups = claims.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominant = Object.entries(typeGroups)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (dominant) {
      parts.push(`Most common type: ${dominant[0]} (${dominant[1]}).`);
    }

    return parts.join(' ');
  }

  /**
   * Empty result for no input
   */
  private static emptyResult(): ClaimDecompositionResult {
    return {
      claims: [],
      totalClaims: 0,
      verifiableClaims: 0,
      unverifiableClaims: 0,
      flaggedClaims: 0,
      overallReliability: 0,
      summary: 'No content to analyze.'
    };
  }
}
