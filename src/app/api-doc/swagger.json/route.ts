// File: src/app/api-doc/swagger.json/route.ts
import { NextResponse } from 'next/server'
import { getSwaggerDocs } from '../next-swagger-doc'

export async function GET() {
  try {
    const swaggerSpec = getSwaggerDocs()
    return NextResponse.json(swaggerSpec)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
