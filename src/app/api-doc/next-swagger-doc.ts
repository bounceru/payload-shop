// File: src/app/api-doc/next-swagger-doc.ts
import { createSwaggerSpec } from 'next-swagger-doc'

export const swaggerConfig = {
    openapi: '3.0.0',
    info: {
        title: 'Frituurapp API',
        version: '0.0.1',
    },
    servers: [
        {
            url: 'http://localhost:3000',
        },
        {
            url: 'https://frituurwebshop.be',
        },
        {
            url: 'https://orderapp.be',
        }
    ],
}

export function getSwaggerDocs() {
    return createSwaggerSpec({
        definition: swaggerConfig,
        apiFolder: 'src/app/api',
    })
}
