/**
 * Factory for creating platform-specific adapters
 */

import { SupportedPlatform } from '../../types';
import { PLATFORMS } from '../../shared/constants';
import { BasePlatformAdapter } from './BasePlatformAdapter';
import { ChatGPTAdapter } from './ChatGPTAdapter';
import { CopilotAdapter } from './CopilotAdapter';
import { GeminiAdapter } from './GeminiAdapter';
import { ClaudeAdapter } from './ClaudeAdapter';

export class PlatformAdapterFactory {
  static create(platform: SupportedPlatform): BasePlatformAdapter {
    switch (platform) {
      case PLATFORMS.CHATGPT:
        return new ChatGPTAdapter();
        
      case PLATFORMS.COPILOT:
        return new CopilotAdapter();
        
      case PLATFORMS.GEMINI:
        return new GeminiAdapter();
        
      case PLATFORMS.CLAUDE:
        return new ClaudeAdapter();
        
      case PLATFORMS.GENERIC:
      default:
        return new BasePlatformAdapter();
    }
  }
}