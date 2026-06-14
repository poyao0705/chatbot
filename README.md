# chatbot
A react + vite + fastify practice project for me to get good at typescript and react


## Fastify

To start with, I'll first set up a basic Fastify server. In this project, we are using fastify cli.
```bash
fastify generate backend --lang=ts
```

### Basics
1. Fastify is a web framework for Node.js that is fast and lightweight.
2. Node.js executes JavaScript. Typescript is a development-time layer that adds type system and additional syntax. To run the code, those additional syntax must be removed. The TypeScript compiler `tsc` can both type-check your code and transpile it into JavaScript.
  - `pnpm add -D typescript`
3. Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It provides additional APIs that browsers do not have, such as file system access, TCP networking, process management, and operating-system integration. TypeScript does not automatically know the runtime environment, so we need to install `@types/node` to get type definitions for Node.js APIs.
  - `pnpm add -D @types/node`
4. Browser also has a JavaScript runtime. That is why our frontend code can run in the browser. When in dev, **Vite** starts development server and transpiles the typescript to JavaScript on the fly and serves it to the browser.


## LLM Service
I am planning to build a Open WebUI-style chatbot that supports multiple LLM providers. Users can BYOK (bring your own key) to use their own LLM provider.

### 0. Response types
There are two types of responses from the LLM service: 
  - `text`: the LLM service returns a plain text response.
  - `stream`: the LLM service returns a stream of text responses.

### 1. Contract
Before building the LLM service, we need to define the contract of the LLM provider and the input/output format of the LLM service, so we can allow user to select multiple providers, without knowing the detail implementation.
  - Request format: `prompt`, `model`
  - Response format: 
    - **Text**: `text`
    - **Stream**: `text-delta`
    - LLMUsage
    - FinishReason
  - LLMProvider: an interface that defines the contract of the LLM provider, including listing available models and generating text (both sync and async).

### 2. Provider interface:
  - `listModels`: lists the available models for the provider.
  - `generateText`: generates text synchronously.
  - `streamText`: generates text asynchronously, returning a stream of events.

### 3. OpenAI provider
We start with OpenAI provider as the default provider.
  - Class `OpenAIProvider` implements `LLMProvider`.
  - If api key is not provided, throws an error.
  - Implements with OpenAI SDK.
  - Default model is `gpt-5.4`.
  - `generateText` returns a promise type `Promise<string | null>`.
  - `streamText` returns a stream of `TextDelta` events. Implemented with async generator.

### 4. Provider Factory
Before we use the LLM directly, it is important to think of the future implementation. We are allowing users to select multiple providers. Therefore, factory pattern is used to allow future extensions on different providers, such as Anthropic, Google, etc.

- A TypeScript object that maps `ProviderId` to `LLMProviderFactory` function type.
- This helps to decouple the provider selection logic from the LLM usage code. We can easily add new providers (anthropic, google) by registering them in the factory.
- Cache the provider instance by `ProviderId` and `apiKey`, and set a TTL (time-to-live): 10 mins for the cache.

### 5. LLM Plugin
We want the LLM service to be a plugin, so we can do dependency injection. Example usage: `const llmProvider: LLMProvider = fastify.llmService.create({providerId: ..., apiKey: ...})`
- create(): creates an LLMProvider instance based on the provided configuration.
- fetchModelList(): returns a list of available models for the provider.
- generateText(): generates text synchronously.
- streamText(): generates text asynchronously, returning a stream of events.
