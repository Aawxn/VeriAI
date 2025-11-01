/**
 * UI Manager for handling the extension's user interface components
 */
export declare class UIManager {
    private sidebar;
    private isInitialized;
    private currentAnalysis;
    /**
     * Initialize the UI components
     */
    initialize(): Promise<void>;
    /**
     * Display analysis results in the UI
     */
    displayAnalysis(data: {
        response: any;
        chainOfThought: any;
        biasAnalysis: any;
    }): Promise<void>;
    /**
     * Create the main sidebar component
     */
    private createSidebar;
    /**
     * Apply CSS styles to the sidebar
     */
    private applySidebarStyles;
    /**
     * Add internal CSS styles
     */
    private addInternalStyles;
    /**
     * Get initial sidebar HTML content
     */
    private getInitialSidebarHTML;
    /**
     * Update sidebar content with analysis data
     */
    private updateSidebarContent;
    /**
     * Render chain of thought steps
     */
    private renderChainOfThought;
    /**
     * Render bias analysis results
     */
    private renderBiasAnalysis;
    /**
     * Render challenge buttons
     */
    private renderChallengeButtons;
    /**
     * Render API Key section for testing custom APIs
     */
    private renderAPIKeySection;
    /**
     * Render Data Management section
     */
    private renderDataManagementSection;
    /**
     * Render Community Report section
     */
    private renderCommunityReportSection;
    /**
     * Show the sidebar
     */
    showSidebar(): void;
    /**
     * Hide the sidebar
     */
    hideSidebar(): void;
    /**
     * Toggle sidebar visibility
     */
    toggleSidebar(): void;
    /**
     * Setup event listeners
     */
    private setupEventListeners;
    /**
     * Toggle minimize/maximize state
     */
    private toggleMinimize;
    /**
     * Handle challenge button actions
     */
    private handleChallengeAction;
    /**
     * Show Explain modal with chain of thought details
     */
    private showExplainModal;
    /**
     * Render detailed chain of thought for modal
     */
    private renderChainOfThoughtDetailed;
    /**
     * Handle saving API key
     */
    private handleSaveAPIKey;
    /**
     * Simple encryption for API keys (XOR + Base64)
     */
    private simpleEncrypt;
    /**
     * Simple decryption for API keys
     */
    private simpleDecrypt;
    /**
     * Handle testing API
     */
    private handleTestAPI;
    /**
     * Handle reporting bias
     */
    private handleReportBias;
    /**
     * Detect current platform
     */
    private detectCurrentPlatform;
    /**
     * Refresh current analysis display
     */
    private refreshCurrentAnalysis;
    /**
     * Handle reload button click
     */
    private handleReload;
    /**
     * Handle export data
     */
    private handleExportData;
    /**
     * Handle clear all data
     */
    private handleClearData;
}
//# sourceMappingURL=UIManager.d.ts.map