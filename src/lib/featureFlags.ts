export interface FeatureFlags {
  ENABLE_PROVIDER_GITHUB: boolean;
  ENABLE_PROVIDER_WIKIPEDIA: boolean;
  ENABLE_EXPLORATION: boolean;
  ENABLE_EXPERIENCE_COMPARISON: boolean;
  ENABLE_SOURCE_DEBUG: boolean;
  ENABLE_I18N: boolean;
}

export const featureFlags: FeatureFlags = {
  ENABLE_PROVIDER_GITHUB: true,
  ENABLE_PROVIDER_WIKIPEDIA: true,
  ENABLE_EXPLORATION: true,
  ENABLE_EXPERIENCE_COMPARISON: true,
  ENABLE_SOURCE_DEBUG: process.env.NODE_ENV === 'development',
  ENABLE_I18N: true,
};

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag] ?? false;
}
