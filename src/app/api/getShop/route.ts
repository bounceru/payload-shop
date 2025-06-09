import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

/**
 * @openapi
 * /api/getShop:
 *   get:
 *     summary: Get one shop by slug
 *     operationId: getShop
 *     parameters:
 *       - name: host
 *         in: query
 *         required: true
 *         description: The shop's slug
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Returns the shop doc
 *       '400':
 *         description: Missing host param
 *       '404':
 *         description: No shop found for that slug
 *       '500':
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const host = searchParams.get('host')
        if (!host) {
            return NextResponse.json(
                { error: 'No host param' },
                { status: 400 },
            )
        }

        // 1) Initialize Payload
        const payload = await getPayload({ config })

        // 2) Find the shop by slug
        const shopResult = await payload.find({
            collection: 'shops',
            where: { slug: { equals: host } },
            limit: 1,
        })
        const shop = shopResult.docs[0]
        if (!shop) {
            return NextResponse.json(
                { error: `No shop found for slug: "${host}"` },
                { status: 404 },
            )
        }

        // 3) Return just the shop doc
        return NextResponse.json({ shop })

    } catch (err: any) {
        console.error('/api/getShop error:', err)
        return NextResponse.json(
            { error: err?.message || 'Unknown error' },
            { status: 500 },
        )
    }
}
