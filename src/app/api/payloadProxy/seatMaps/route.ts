// File: src/app/(dashboard)/dashboard/(collections)/seatMaps/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest): Promise<NextResponse> {
    const contentType = req.headers.get("Content-Type") || "application/json";
    const cookie = req.headers.get("cookie") || "";

    // 1. Parse the request body
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

    // 2. We expect the seatMap ID in the request body
    const id = body?.id;
    if (!id) {
        return new NextResponse("Missing seatMap ID", { status: 400 });
    }

    // 3. Build the Payload seatMaps endpoint URL
    //    Adjust host/port for your environment
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";
    const payloadUrl = `${baseUrl}/api/seatMaps/${id}`;

    // 4. Forward the PATCH request to Payload
    const response = await fetch(payloadUrl, {
        method: "PATCH",
        headers: {
            "Content-Type": contentType,
            Cookie: cookie,
        },
        // re-serialize the request body if needed:
        body: JSON.stringify(body),
    });

    // 5. Read the response body (text or JSON)
    const responseBody = await response.text();

    // 6. Return the response from Payload back to the client
    return new NextResponse(responseBody, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
    });
}

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

    // Because we’re *creating*, we do NOT require body.id
    // We'll forward the data to Payload’s POST /api/seatMaps
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";
    const payloadUrl = `${baseUrl}/api/seatMaps`;

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

/** 
 * We allow a DELETE operation.
 * Either pass the seatMap ID as a query param or in the body.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
    const contentType = req.headers.get("Content-Type") || "application/json";
    const cookie = req.headers.get("cookie") || "";

    // Try to get the ID from the URL query param or from the JSON body
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    let body: any;
    if (!id) {
        // If not in query, check the body
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

    // If still no ID, bail out
    if (!id) {
        return new NextResponse("Missing seatMap ID", { status: 400 });
    }

    // Forward DELETE to Payload
    // e.g. http://localhost:3000/api/seatMaps/:id
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";
    const payloadUrl = `${baseUrl}/api/seatMaps/${id}`;

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

export async function GET(req: NextRequest): Promise<NextResponse> {
    const cookie = req.headers.get("cookie") || "";

    // Extract all the query params from the incoming request
    const { searchParams } = new URL(req.url);

    // We'll construct a new URL to Payload's seatMaps endpoint
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";
    const payloadUrl = new URL(`${baseUrl}/api/seatMaps`);

    // 1) If there's a "tenantId" param, convert it to Payload's `where[tenant][equals]`
    const tenantId = searchParams.get("tenantId");
    if (tenantId) {
        // Remove our custom param from the searchParams
        searchParams.delete("tenantId");

        // Inject the filter that Payload expects
        payloadUrl.searchParams.set("where[tenant][equals]", tenantId);
    }

    // 2) Copy over any remaining query params (e.g. limit=100)
    searchParams.forEach((value, key) => {
        payloadUrl.searchParams.set(key, value);
    });

    // 3) Forward a GET request to Payload’s seatMaps endpoint
    const response = await fetch(payloadUrl.toString(), {
        method: "GET",
        headers: {
            Cookie: cookie,
            // "Accept": "application/json" if needed
        },
    });

    // 4) Return Payload’s response
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
    });
}
