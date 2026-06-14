export type LLMTextRequest = {
  prompt: string;
  modelId?: string;
};

// for whole text generation result
export type LLMTextResult = {
  type: "text";
  text: string;
  modelId?: string;
  finishReason?: string;
  usage?: LLMUsage;
};

export type LLMUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type LLMStreamEvent =
  | { type: "text-delta"; text: string }
  | {
      type: "done";
      finishReason?: string;
      usage?: LLMUsage;
      modelId?: string;
    };

export interface LLMProvider {
  generateText: (request: LLMTextRequest) => Promise<string | null>;
  fetchModelList: () => Promise<string[]>;
  streamText: (request: LLMTextRequest) => AsyncIterable<LLMStreamEvent>;
}
