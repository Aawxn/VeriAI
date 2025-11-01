/**
 * Advanced Chain of Thought Extractor
 * Analyzes AI responses to extract reasoning patterns and thought processes
 */
import { ChainOfThought } from '../types';
export declare class ChainOfThoughtExtractor {
    /**
     * Extract chain of thought from AI response content
     */
    static extract(content: string, platform?: string): ChainOfThought;
    /**
     * Extract explicit reasoning patterns (because, therefore, since, etc.)
     */
    private static extractExplicitReasoning;
    /**
     * Extract structured steps (numbered lists, bullet points)
     */
    private static extractStructuredSteps;
    /**
     * Extract causal relationships
     */
    private static extractCausalRelationships;
    /**
     * Extract conditional logic
     */
    private static extractConditionalLogic;
    /**
     * Extract comparisons and contrasts
     */
    private static extractComparisons;
    /**
     * Extract assumptions
     */
    private static extractAssumptions;
    /**
     * Extract conclusions
     */
    private static extractConclusions;
    /**
     * Extract ethical considerations
     */
    private static extractEthicalConsiderations;
    /**
     * Check if content has explicit reasoning
     */
    private static hasExplicitReasoning;
    /**
     * Remove duplicate steps
     */
    private static deduplicateSteps;
    /**
     * Calculate overall confidence based on steps found
     */
    private static calculateConfidence;
    /**
     * Clean and format description
     */
    private static cleanDescription;
}
//# sourceMappingURL=chainOfThoughtExtractor.d.ts.map