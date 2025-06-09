import type { Endpoint } from 'payload'
import { APIError } from 'payload'

export const meEndpoint: Endpoint = {
    method: 'get',
    path: '/me',
    handler: async (req) => {
        if (!req.user) {
            return new Response(JSON.stringify({
                error: 'Not logged in',
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        try {
            const userDoc = await req.payload.findByID({
                collection: 'users',
                id: req.user.id,
                overrideAccess: true, // important to skip normal read access
                depth: 1,
            })

            return new Response(JSON.stringify({
                user: userDoc,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        } catch (err: any) {
            console.error('Error in /me endpoint:', err)
            return new Response(JSON.stringify({
                error: err?.message || 'Internal server error',
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        }
    },
}
