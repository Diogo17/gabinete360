export interface SpriteWorkerConfig {
  spriteName: string;
  environmentKeyConfigured: boolean;
  outboundOnly: boolean;
  idleSleepEnabled: boolean;
}

/**
 * Configuration helper for Gemini Managed Agents on Fly.io Sprites (BYOS).
 * Keeps GEMINI_API_KEY outside the Sprite; Sprite only holds an environment key.
 */
export function getSpriteWorkerConfig(tenantSlug: string): SpriteWorkerConfig {
  return {
    spriteName: `gabinete360-${tenantSlug}`,
    environmentKeyConfigured: Boolean(process.env.SPRITE_ENV_KEY),
    outboundOnly: true,
    idleSleepEnabled: true,
  };
}
