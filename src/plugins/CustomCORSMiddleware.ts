// File: /plugins/CustomCORSMiddleware.ts

import type { Plugin } from 'payload'
import type { Config as PayloadConfig } from 'payload'
import type { Application } from 'express'
import cors from 'cors'

/**
 * We define a plugin that returns a new config object,
 * including a `beforeExpress` hook that attaches advanced CORS logic.
 */
interface Config extends PayloadConfig {
  beforeExpress?: (app: Application, payload: any) => void;
}

export const CustomCORSMiddleware: Plugin = (existingConfig: Config): Config => {
  // Define your advanced domain checks:
  const localhostRegex = /^http:\/\/([^.]+\.)?localhost:3000$/i
  const domainRegex = /^https:\/\/([^.]+\.)?(frituurwebshop\.be|orderapp\.be|digitaste\.be|frituurapp\.be|frituurmenu\.be)(:\d+)?$/i

  // The actual cors middleware
  const customCORS = cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin) {
        // Possibly server-to-server or no origin => allow
        return callback(null, true)
      }
      // dev subdomain check
      if (localhostRegex.test(incomingOrigin)) {
        return callback(null, true)
      }
      // production subdomain check
      if (domainRegex.test(incomingOrigin)) {
        return callback(null, true)
      }
      // else block
      return callback(new Error(`CORS error: ${incomingOrigin} not allowed.`))
    },
    credentials: true,
  })

  // Return new config object
  return {
    ...existingConfig,

    // name property removed as it is not a known property of Config

    /**
     * `beforeExpress` is a special Payload hook that runs BEFORE
     * Payload mounts its own routes, so you can attach custom middleware.
     */
    beforeExpress: (app: Application, payload) => {
      // attach the cors library before Payload routes
      app.use(customCORS)
    },
  }
}
