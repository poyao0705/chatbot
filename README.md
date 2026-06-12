# chatbot
A react + vite + fastify practice project for me to get good at typescript and react


## Fastify

To start with, I'll first set up a basic Fastify server.

### Basics
1. Fastify is a web framework for Node.js that is fast and lightweight.
2. Node.js executes JavaScript. Typescript is a development-time layer that adds type system and additional syntax. To run the code, those additional syntax must be removed. The TypeScript compiler `tsc` can both type-check your code and transpile it into JavaScript.
  - `pnpm add -D typescript`
3. Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It provides additional APIs that browsers do not have, such as file system access, TCP networking, process management, and operating-system integration. TypeScript does not automatically know the runtime environment, so we need to install `@types/node` to get type definitions for Node.js APIs.
  - `pnpm add -D @types/node`
4. `tsx` is a TypeScript execution tool that allows you to run TypeScript files directly with a command such as tsx index.ts, without manually running the TypeScript compiler (tsc) beforehand. Internally, tsx transpiles TypeScript to JavaScript on the fly and then executes the resulting JavaScript using Node.js. It is commonly used during development because it provides a fast feedback loop and eliminates the need for a separate build step while coding.
  - `pnpm add -D tsx`
5. Browser also has a JavaScript runtime. That is why our frontend code can run in the browser. When in dev, **Vite** starts development server and transpiles the typescript to JavaScript on the fly and serves it to the browser.
