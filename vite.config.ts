import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

function duffelApiDevPlugin(): Plugin {
  return {
    name: 'duffel-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/duffel-offers', async (request, response) => {
        const chunks: Buffer[] = []

        request.on('data', (chunk: Buffer) => {
          chunks.push(chunk)
        })

        request.on('end', async () => {
          const requestWithBody = request as typeof request & { body?: string }
          requestWithBody.body = Buffer.concat(chunks).toString('utf8')
          const handlerPath = pathToFileURL(resolve(server.config.root, 'api/duffel-offers.js')).href + '?updated=' + Date.now()
          const handlerModule = await import(handlerPath) as {
            default: (request: IncomingMessage & { body?: string }, response: ServerResponse) => Promise<void>
          }
          await handlerModule.default(requestWithBody, response)
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.DUFFEL_ACCESS_TOKEN = env.DUFFEL_ACCESS_TOKEN

  return {
    plugins: [vue(), tailwindcss(), duffelApiDevPlugin()],
  }
})
