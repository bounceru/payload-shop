// File: src/app/api/payloadProxy/createMedia/route.ts

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

import { sanitizeFilename } from "@/utils/sanitizeFilename";

export async function POST(request: Request) {
    try {
        // 1) Parse the form data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json(
                { error: 'No "file" was uploaded in form data.' },
                { status: 400 }
            );
        }

        const tenant = formData.get("tenant") as string | null;
        if (!tenant) {
            return NextResponse.json(
                { error: 'No "tenant" field was provided in form data.' },
                { status: 400 }
            );
        }

        // 2) Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3) Sanitize file name
        const safeName = sanitizeFilename(file.name);

        // 4) Init Payload
        const payload = await getPayload({ config });

        // 5) Create new doc in 'media'
        const doc = await payload.create({
            collection: "media",
            data: { tenant },
            file: {
                data: buffer,
                mimetype: file.type,
                size: buffer.length,
                name: safeName,
            },
        });

        // 6) Respond with the created doc
        return NextResponse.json(doc, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/payloadProxy/createMedia:", error);
        return NextResponse.json(
            { error: error.message || "Unknown error" },
            { status: 500 }
        );
    }
}
