import { type FastifyPluginAsync } from "fastify";
import { sendStreamResponse } from "../../utils/sse";

type ChatRequestBody = {
  modelId: string;
  message: string;
};

const chat: FastifyPluginAsync = async (fastify): Promise<void> => {
  const apiKey = process.env.OPENAI_API_KEY; // TODO: fetch from the env settings for now, will pass the api key in the future

  const createStream = (requestBody: ChatRequestBody) => {
    if (!apiKey) {
      throw fastify.httpErrors.internalServerError("OPENAI_API_KEY is not set");
    }

    return fastify.llmService
      .create({
        providerId: "openai", // TODO: fix the value for now
        apiKey,
      })
      .streamText({
        modelId: requestBody.modelId,
        prompt: requestBody.message,
      });
  };

  fastify.post<{ Body: ChatRequestBody }>("/", async function (request, reply) {
    // const apiKey = process.env.OPENAI_API_KEY; // TODO: fetch from the env settings for now, will pass the api key in the future

    if (!apiKey) {
      throw fastify.httpErrors.internalServerError("OPENAI_API_KEY is not set");
    }

    const result = await fastify.llmService
      .create({
        providerId: "openai", // TODO: fix the value for now
        apiKey,
      })
      .generateText({
        modelId: request.body.modelId,
        prompt: request.body.message,
      });

    return {
      result,
    };
  });

  fastify.post<{ Body: ChatRequestBody }>(
    "/stream",
    async function (request, reply) {
      return sendStreamResponse(reply, createStream(request.body));
    },
  );

  fastify.get<{ Querystring: ChatRequestBody }>(
    "/stream",
    async function (request, reply) {
      return sendStreamResponse(reply, createStream(request.query));
    },
  );
};

export default chat;
