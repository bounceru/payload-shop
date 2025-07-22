// /app/api/getAllFields/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { flattenFields } from '@/utilities/flattenFields'

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/getAllFields:
 *   get:
 *     summary: Retrieve all fields from collections
 *     description: This endpoint retrieves all fields from the collections defined in the Payload configuration.
 *     responses:
 *       200:
 *         description: A JSON array of all fields from collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   slug:
 *                     type: string
 *                     description: The slug of the collection
 *                   fields:
 *                     type: array
 *                     description: The flattened fields of the collection
 *                     items:
 *                       type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * Handles GET requests to retrieve all fields from collections.
 *
 * @param _req - The incoming request object
 * @returns A JSON response containing all fields from collections or an error message
 */
export async function GET(_req: NextRequest) {
  try {
    // 1) Get an instance of Payload with your config (unsecured)
    const payload = await getPayload({ config })

    // 2) Access the entire Payload config (specifically the collections array)
    const { collections } = await config

    // 3) Build a serializable structure by using your flattenFields helper
    const allFields = collections.map((collection) => ({
      slug: collection.slug,
      // Instead of just mapping top-level fields, flatten them recursively:
      fields: flattenFields(collection.fields || []),
    }))

    // 4) Return JSON
    return NextResponse.json(allFields, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 },
    )
  }
}
