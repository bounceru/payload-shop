// src/app/api/getCustomerByBarcode/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

/**
 * @openapi
 * /api/getCustomerByBarcode:
 *   get:
 *     summary: Retrieve a single customer document by its unique barcode
 *     description: Fetches the first matching Customer by the 'barcode' field. Depth is set to 3 for nested relationships of the Customer doc. Additionally queries 'customer-credits' for all matching records.
 *     parameters:
 *       - in: query
 *         name: barcode
 *         required: true
 *         description: The unique code assigned to the customer (e.g., CUST-XXXXXX)
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved the customer document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstname:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                     barcode:
 *                       type: string
 *                 credits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       # etc
 *       '400':
 *         description: Missing barcode parameter
 *       '404':
 *         description: No customer found for the given barcode
 *       '500':
 *         description: An error occurred while retrieving the customer
 */

export async function GET(request: NextRequest) {
    try {
        const payload = await getPayload({ config })
        const { searchParams } = request.nextUrl

        const barcode = searchParams.get('barcode')

        // 1) Log the incoming param
        console.log('[getCustomerByBarcode] Called with barcode:', barcode)

        if (!barcode) {
            console.log('[getCustomerByBarcode] No barcode param provided.')
            return NextResponse.json({ error: 'Missing barcode parameter' }, { status: 400 })
        }

        // 2) Attempt to find a Customer doc by that barcode
        const customerResult = await payload.find({
            collection: 'customers',
            where: {
                barcode: { equals: barcode },
            },
            depth: 3, // fetch nested relationships in the Customer doc
            limit: 1,
        })

        // 3) Log the find result
        console.log('[getCustomerByBarcode] Customer find result:', customerResult)

        if (!customerResult?.docs?.length) {
            console.log('[getCustomerByBarcode] No matching customer found.')
            return NextResponse.json({ error: `No customer found for barcode: ${barcode}` }, { status: 404 })
        }

        const customerDoc = customerResult.docs[0]

        // 5) Combine them into a single response
        const responseData = {
            customer: customerDoc,     // includes membership, etc. from depth=3

        }



        return NextResponse.json(responseData, { status: 200 })

    } catch (error: any) {
        console.error('[getCustomerByBarcode] Error fetching customer by barcode:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve customer by barcode' },
            { status: 500 }
        )
    }
}
