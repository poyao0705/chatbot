import fp from "fastify-plugin";
import {
  type ProviderId,
  getLLMProvider,
} from "../services/llm/provider-registry";
import type {
  LLMProvider,
  LLMTextRequest,
  LLMStreamEvent,
} from "../services/llm/provider";

type LLMSettingsParams = {
  providerId: ProviderId;
  apiKey: string;
};

export default fp(async (fastify) => {
  const create = (settings: LLMSettingsParams) => {
    // check api key
    if (!settings.apiKey) {
      throw new Error(
        `API key is required for provider: ${settings.providerId}`,
      );
    }
    if (!settings.providerId) {
      throw new Error(`Provider ID is required`);
    }
    return getLLMProvider(settings.providerId, settings.apiKey);
  };

  fastify.decorate("llmService", {
    create,

    fetchModelList: async (settings: LLMSettingsParams) => {
      return create(settings).fetchModelList();
    },
    generateText: async (
      settings: LLMSettingsParams,
      request: LLMTextRequest,
    ) => {
      return create(settings).generateText(request);
    },
    streamText: (settings: LLMSettingsParams, request: LLMTextRequest) => {
      return create(settings).streamText(request);
    },
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  interface FastifyInstance {
    llmService: {
      create(settings: LLMSettingsParams): LLMProvider;
      fetchModelList(settings: LLMSettingsParams): Promise<string[]>;
      generateText(
        settings: LLMSettingsParams,
        request: LLMTextRequest,
      ): Promise<string | null>;
      streamText(
        settings: LLMSettingsParams,
        request: LLMTextRequest,
      ): AsyncIterable<LLMStreamEvent>;
    };
  }
}
