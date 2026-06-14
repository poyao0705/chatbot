import { Readable } from "node:stream";
import type { FastifyReply } from "fastify";

export const toServerSentEvents = async function* <T>(
  stream: AsyncIterable<T>,
): AsyncIterable<string> {
  for await (const event of stream) {
    yield `data: ${JSON.stringify(event)}\n\n`;
  }
};

export const sendStreamResponse = <T>(
  reply: FastifyReply,
  stream: AsyncIterable<T>,
) => {
  reply
    .header("Cache-Control", "no-cache")
    .header("Connection", "keep-alive")
    .header("X-Accel-Buffering", "no")
    .type("text/event-stream");

  return reply.send(Readable.from(toServerSentEvents(stream)));
};
