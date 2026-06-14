import type { LLMProvider } from "./provider";
import { OpenAIProvider } from "./openai-provider";

export type ProviderId = "openai";

const PROVIDER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type CachedLLMProvider = {
  provider: LLMProvider;
  // Stores the timer that will remove the provider from the cache after the TTL
  evictionTimer: ReturnType<typeof setTimeout>;
};

// caching provider
const llmProviders = new Map<string, CachedLLMProvider>();

// Create a cache key based on the provider ID and API key
const getCacheKey = (providerId: ProviderId, apiKey: string) => {
  return `${providerId}-${apiKey}`;
};

// Create an eviction timer that will remove the provider from the cache after the TTL
const createEvictionTimer = (cacheKey: string) => {
  const timer = setTimeout(() => {
    llmProviders.delete(cacheKey);
  }, PROVIDER_CACHE_TTL_MS);

  timer.unref();

  return timer;
};

// Get an LLM provider, using the cache if available
export const getLLMProvider = (
  providerId: ProviderId,
  apiKey: string,
): LLMProvider => {
  const cacheKey = getCacheKey(providerId, apiKey);
  const cachedProvider = llmProviders.get(cacheKey);

  if (cachedProvider) {
    // Clear the existing timer and create a new one to extend the cache duration
    clearTimeout(cachedProvider.evictionTimer);
    cachedProvider.evictionTimer = createEvictionTimer(cacheKey);

    return cachedProvider.provider;
  }

  // Otherwise, create a new provider and cache it
  const llmFactory = llmProviderFactories[providerId];

  if (!llmFactory) {
    throw new Error(`Provider not found: ${providerId}`);
  }

  const provider = llmFactory(apiKey);
  llmProviders.set(cacheKey, {
    provider,
    evictionTimer: createEvictionTimer(cacheKey),
  });

  return provider;
};

// a function type that creates an LLMProvider from an API key
type LLMProviderFactory = (apiKey: string) => LLMProvider;

// Map of provider IDs to their corresponding factory functions
const llmProviderFactories: Record<ProviderId, LLMProviderFactory> = {
  openai: (apiKey) => new OpenAIProvider(apiKey),
  // anthropic: (apiKey) => new AnthropicProvider(apiKey), // Example, add in the future
};
