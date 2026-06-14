import OpenAI from "openai";
import type { LLMProvider, LLMStreamEvent, LLMTextRequest } from "./provider";
import type { Model } from "openai/resources/models";

const DEFAULT_MODEL = "gpt-5.4";

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    this.openai = new OpenAI({ apiKey });
  }

  //
  async generateText(request: LLMTextRequest): Promise<string | null> {
    const response = await this.openai.chat.completions.create({
      model: request.modelId ?? DEFAULT_MODEL,
      messages: [{ role: "user", content: request.prompt }],
    });
    return response.choices[0].message.content;
  }

  async fetchModelList(): Promise<string[]> {
    const models = await this.openai.models.list();
    return models.data.map((model: Model) => model.id);
  }

  // stream text using the OpenAI API
  async *streamText(request: LLMTextRequest): AsyncIterable<LLMStreamEvent> {
    const stream = await this.openai.chat.completions.create({
      model: request.modelId ?? DEFAULT_MODEL,
      messages: [{ role: "user", content: request.prompt }],
      stream: true,
    });

    let finishReason: string | undefined;

    for await (const chunk of stream) {
      const choice = chunk.choices[0];

      const text = choice?.delta?.content;
      if (text) {
        yield {
          type: "text-delta",
          text,
        };
      }

      if (choice?.finish_reason) {
        finishReason = choice.finish_reason;
      }
    }

    yield finishReason === undefined
      ? { type: "done" }
      : {
          type: "done",
          finishReason,
        };
  }
}
