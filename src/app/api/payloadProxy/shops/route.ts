// File: src/app/api/payloadProxy/shops/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// 1) GET (like you already have)
export async function GET(req: NextRequest): Promise<NextResponse> {
    const payload = await getPayload({ config });
    const url = new URL(req.url, `http://${req.headers.get("host")}`);
    const searchParams = url.searchParams;

    // filter logic
    const tenantId = searchParams.get("tenantId");
    const where: any = {};
    if (tenantId) {
        where.tenant = { equals: tenantId };
    }

    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : 50;

    const result = await payload.find({
        collection: "shops",
        where,
        limit,
        sort: "-createdAt",
    });

    return NextResponse.json(result);
}

// 2) POST => create a new shop
export async function POST(req: NextRequest): Promise<NextResponse> {
    const contentType = req.headers.get("Content-Type") || "application/json";
    const cookie = req.headers.get("cookie") || "";

    let body: any;
    if (contentType.includes("application/json")) {
        body = await req.json();
    } else {
        const textBody = await req.text();
        try {
            body = JSON.parse(textBody);
        } catch (err) {
            return new NextResponse("Invalid JSON body", { status: 400 });
        }
    }

    // Forward to Payload’s POST /api/shops
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";
    const payloadUrl = `${baseUrl}/api/shops`;

    const response = await fetch(payloadUrl, {
        method: "POST",
        headers: {
            "Content-Type": contentType,
            Cookie: cookie,
        },
        body: JSON.stringify(body),
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
    });
}

// 3) PATCH => update an existing shop (requires "id" in body)
export async function PATCH(req: NextRequest): Promise<NextResponse> {
    const contentType = req.headers.get("Content-Type") || "application/json";
    const cookie = req.headers.get("cookie") || "";

    let body: any;
    if (contentType.includes("application/json")) {
        body = await req.json();
    } else {
        const textBody = await req.text();
        try {
            body = JSON.parse(textBody);
        } catch (err) {
            return new NextResponse("Invalid JSON body", { status: 400 });
        }
    }

    const id = body?.id;
    if (!id) {
        return new NextResponse("Missing shop ID", { status: 400 });
    }

    // Forward to Payload’s PATCH /api/shops/:id
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";
    const payloadUrl = `${baseUrl}/api/shops/${id}`;

    const response = await fetch(payloadUrl, {
        method: "PATCH",
        headers: {
            "Content-Type": contentType,
            Cookie: cookie,
        },
        body: JSON.stringify(body),
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
    });
}

// 4) DELETE => pass "id" in query (?id=...) or JSON body
export async function DELETE(req: NextRequest): Promise<NextResponse> {
    const contentType = req.headers.get("Content-Type") || "application/json";
    const cookie = req.headers.get("cookie") || "";

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
        // If no ID in query, check body
        let body: any;
        if (contentType.includes("application/json")) {
            body = await req.json();
            id = body?.id;
        } else {
            const textBody = await req.text();
            try {
                body = JSON.parse(textBody);
                id = body?.id;
            } catch (err) {
                return new NextResponse("Invalid JSON body", { status: 400 });
            }
        }
    }

    if (!id) {
        return new NextResponse("Missing shop ID", { status: 400 });
    }

    // Forward DELETE to Payload => /api/shops/:id
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";
    const payloadUrl = `${baseUrl}/api/shops/${id}`;

    const response = await fetch(payloadUrl, {
        method: "DELETE",
        headers: {
            "Content-Type": contentType,
            Cookie: cookie,
        },
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
    });
}
