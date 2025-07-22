// File: payload.server.config.ts
import baseConfig from './payload.base.config'
import { CustomCORSMiddleware } from './plugins/CustomCORSMiddleware'
import type { Config, RichTextAdapterProvider } from 'payload'

const resolvedBaseConfig = await baseConfig

export default {
  ...resolvedBaseConfig,
  plugins: [
    ...(resolvedBaseConfig.plugins || []),
    CustomCORSMiddleware, // only used server-side
  ],
  editor: resolvedBaseConfig.editor as RichTextAdapterProvider<any, any, any> | undefined,
} satisfies Config