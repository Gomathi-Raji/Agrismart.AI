// OpenRouter API key management for different AI features
// This allows using different API keys for different features to control costs and access
//
// USAGE:
// 1. Set feature-specific environment variables in .env:
//    - VITE_OPENROUTER_DIAGNOSIS_API_KEY (for plant disease diagnosis)
//    - VITE_OPENROUTER_CHATBOT_API_KEY (for chatbot functionality)
//    - VITE_OPENROUTER_RECOMMENDATIONS_API_KEY (for farming recommendations)
//
// 2. Or use the legacy VITE_OPENROUTER_API_KEY for all features
//
// 3. Import and use in components:
//    import { getOpenRouterApiKey, hasOpenRouterApiKey } from '@/utils/openRouterConfig';
//    const apiKey = getOpenRouterApiKey('diagnosis');

export type AIFeature = 'diagnosis' | 'chatbot' | 'recommendations';

export const getOpenRouterApiKey = (feature: AIFeature): string | undefined => {
  // Try feature-specific key first, then fall back to legacy key
  switch (feature) {
    case 'diagnosis':
      return import.meta.env.VITE_OPENROUTER_DIAGNOSIS_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY;
    case 'chatbot':
      return import.meta.env.VITE_OPENROUTER_CHATBOT_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY;
    case 'recommendations':
      return import.meta.env.VITE_OPENROUTER_RECOMMENDATIONS_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY;
    default:
      return import.meta.env.VITE_OPENROUTER_API_KEY;
  }
};

export const hasOpenRouterApiKey = (feature: AIFeature): boolean => {
  return !!getOpenRouterApiKey(feature);
};

export const getOpenRouterApiKeyName = (feature: AIFeature): string => {
  switch (feature) {
    case 'diagnosis':
      return 'VITE_OPENROUTER_DIAGNOSIS_API_KEY';
    case 'chatbot':
      return 'VITE_OPENROUTER_CHATBOT_API_KEY';
    case 'recommendations':
      return 'VITE_OPENROUTER_RECOMMENDATIONS_API_KEY';
    default:
      return 'VITE_OPENROUTER_API_KEY';
  }
};