import type { LLMProvider } from "./provider";
import { OpenAIProvider } from "./openai-provider";

export type ProviderId = "openai";

// a function type that creates an LLMProvider from an API key
type LLMProviderFactory = (apiKey: string) => LLMProvider;

export const llmProviderFactories: Record<ProviderId, LLMProviderFactory> = {
  openai: (apiKey?) => new OpenAIProvider(apiKey),
  // anthropic: (apiKey) => new AnthropicProvider(apiKey), // Example, add in the future
};
