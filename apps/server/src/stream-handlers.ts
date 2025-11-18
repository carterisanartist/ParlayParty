import { logger } from './logger';

/**
 * Interface for stream providers (Twitch, Kick, etc.)
 */
export interface StreamProvider {
  getStreamEmbed(channelId: string): string;
  validateChannel(channelId: string): Promise<boolean>;
  getStreamDelay(): number;
  getName(): string;
}

/**
 * Twitch stream provider implementation
 */
export class TwitchProvider implements StreamProvider {
  private readonly TWITCH_EMBED_URL = 'https://player.twitch.tv/';
  private readonly TWITCH_API_URL = 'https://api.twitch.tv/helix';
  private readonly DEFAULT_DELAY = 10; // seconds

  getName(): string {
    return 'twitch';
  }

  getStreamDelay(): number {
    return this.DEFAULT_DELAY;
  }

  /**
   * Generate Twitch embed URL
   */
  getStreamEmbed(channelId: string): string {
    // Remove @ if present
    const cleanChannel = channelId.replace('@', '');
    
    // Twitch embed parameters
    const params = new URLSearchParams({
      channel: cleanChannel,
      parent: process.env.NODE_ENV === 'production' 
        ? 'parlay-party.fly.dev' 
        : 'localhost',
      autoplay: 'true',
      muted: 'false'
    });

    return `${this.TWITCH_EMBED_URL}?${params.toString()}`;
  }

  /**
   * Validate if Twitch channel exists and is live
   */
  async validateChannel(channelId: string): Promise<boolean> {
    try {
      // Remove @ if present
      const cleanChannel = channelId.replace('@', '');
      
      // In production, you would need to implement Twitch OAuth
      // For now, we'll do basic validation
      if (!cleanChannel || cleanChannel.length < 3) {
        return false;
      }

      // TODO: Implement actual Twitch API validation
      // This would require OAuth client credentials
      logger.info('Twitch channel validation placeholder', { channel: cleanChannel });
      
      return true;
    } catch (error) {
      logger.error('Error validating Twitch channel', error);
      return false;
    }
  }
}

/**
 * Kick stream provider implementation
 */
export class KickProvider implements StreamProvider {
  private readonly KICK_EMBED_URL = 'https://player.kick.com/';
  private readonly DEFAULT_DELAY = 7; // Kick typically has lower delay

  getName(): string {
    return 'kick';
  }

  getStreamDelay(): number {
    return this.DEFAULT_DELAY;
  }

  /**
   * Generate Kick embed URL
   */
  getStreamEmbed(channelId: string): string {
    // Remove @ if present
    const cleanChannel = channelId.replace('@', '');
    
    // Kick uses iframe embeds
    return `https://player.kick.com/${cleanChannel}`;
  }

  /**
   * Validate if Kick channel exists
   */
  async validateChannel(channelId: string): Promise<boolean> {
    try {
      // Remove @ if present
      const cleanChannel = channelId.replace('@', '');
      
      if (!cleanChannel || cleanChannel.length < 3) {
        return false;
      }

      // TODO: Implement Kick API validation
      // Kick's API is still evolving, would need to check their docs
      logger.info('Kick channel validation placeholder', { channel: cleanChannel });
      
      return true;
    } catch (error) {
      logger.error('Error validating Kick channel', error);
      return false;
    }
  }
}

/**
 * Stream manager to handle different platforms
 */
export class StreamManager {
  private providers: Map<string, StreamProvider>;

  constructor() {
    this.providers = new Map();
    this.providers.set('twitch', new TwitchProvider());
    this.providers.set('kick', new KickProvider());
  }

  /**
   * Get provider by platform name
   */
  getProvider(platform: string): StreamProvider | null {
    return this.providers.get(platform.toLowerCase()) || null;
  }

  /**
   * Get all available platforms
   */
  getAvailablePlatforms(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Parse stream URL and extract platform and channel
   */
  parseStreamUrl(url: string): { platform: string; channel: string } | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Twitch URLs
      if (hostname.includes('twitch.tv')) {
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        if (pathParts.length > 0) {
          return {
            platform: 'twitch',
            channel: pathParts[0]
          };
        }
      }
      
      // Kick URLs
      if (hostname.includes('kick.com')) {
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        if (pathParts.length > 0) {
          return {
            platform: 'kick',
            channel: pathParts[0]
          };
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Error parsing stream URL', error);
      return null;
    }
  }

  /**
   * Validate stream URL
   */
  async validateStreamUrl(url: string): Promise<{ valid: boolean; platform?: string; channel?: string; embedUrl?: string; delay?: number }> {
    const parsed = this.parseStreamUrl(url);
    
    if (!parsed) {
      return { valid: false };
    }
    
    const provider = this.getProvider(parsed.platform);
    
    if (!provider) {
      return { valid: false };
    }
    
    const isValid = await provider.validateChannel(parsed.channel);
    
    if (!isValid) {
      return { valid: false };
    }
    
    return {
      valid: true,
      platform: parsed.platform,
      channel: parsed.channel,
      embedUrl: provider.getStreamEmbed(parsed.channel),
      delay: provider.getStreamDelay()
    };
  }
}

// Export singleton instance
export const streamManager = new StreamManager();
