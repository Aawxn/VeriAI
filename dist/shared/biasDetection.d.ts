/**
 * Bias Detection Engine
 * Analyzes text for various types of bias and ethical concerns
 */
import { BiasAnalysis } from '../types';
export declare class BiasDetectionEngine {
    /**
     * Analyze text for bias and ethical concerns
     */
    analyzeText(text: string): BiasAnalysis;
    /**
     * Detect gender bias in text
     */
    private detectGenderBias;
    /**
     * Detect racial bias in text
     */
    private detectRacialBias;
    /**
     * Detect political bias in text
     */
    private detectPoliticalBias;
    /**
     * Detect emotional manipulation in text
     */
    private detectEmotionalManipulation;
    /**
     * Detect logical fallacies in text
     */
    private detectLogicalFallacies;
    /**
     * Detect evasive language
     */
    private detectEvasiveness;
    /**
     * Calculate severity based on confidence
     */
    private calculateSeverity;
    /**
     * Calculate overall risk level
     */
    private calculateOverallRisk;
    /**
     * Generate recommendations based on detected patterns
     */
    private generateRecommendations;
}
export declare const biasDetector: BiasDetectionEngine;
//# sourceMappingURL=biasDetection.d.ts.map