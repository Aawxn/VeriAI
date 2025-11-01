/**
 * Factory for creating platform-specific adapters
 */
import { SupportedPlatform } from '../../types';
import { BasePlatformAdapter } from './BasePlatformAdapter';
export declare class PlatformAdapterFactory {
    static create(platform: SupportedPlatform): BasePlatformAdapter;
}
//# sourceMappingURL=PlatformAdapterFactory.d.ts.map