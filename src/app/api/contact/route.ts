// File: /app/api/contact/route.ts
import { NextResponse } from 'next/server';
import payload from 'payload'; // <-- Import the Payload instance
import { generateGeneralizedEmail } from '@/email/generateGeneralizedEmail';
import { sendEmail as customSendEmail } from '@/lib/sendEmail';

export async function POST(request: Request) {
    try {
        console.log('[contactRoute] Starting POST /api/contact...');

        // 1) Parse the JSON body
        const body = await request.json();
        const {
            siteTitle,
            brandHeaderColor,
            brandLogoUrl,
            name,
            email,
            phone,
            message,
            toEmail,
            // Honeypot field
            honeypot,
            // If you have tenant/shop info, pass them too:
            tenantId,
            shopId,
        } = body;

        // 1a) Honeypot check
        if (honeypot && honeypot.trim() !== '') {
            console.warn('[contactRoute] Spam detected via honeypot field.');
            return NextResponse.json({ success: false, error: 'Spam detected' }, { status: 400 });
        }

        // 2) Fallbacks
        const fromSiteTitle = siteTitle || 'MyShop';
        const recipientEmail = toEmail || 'contact@myshop.com';
        const usedHeaderColor = brandHeaderColor || '#dc2626';
        const usedLogoUrl = brandLogoUrl || 'https://mysite.com/logo.png';

        // 3) Build a plain text style body
        const content =
            `Er is een nieuw contact formulier ingestuurd:\n\n` +
            `Naam: ${name}\n` +
            (email ? `Email: ${email}\n` : '') +
            (phone ? `Tel: ${phone}\n` : '') +
            `\nBericht:\n${message || ''}\n`;

        // 4) Generate HTML via your generalized template
        const subject = 'Nieuw contactformulier ontvangen';
        const { html } = await generateGeneralizedEmail({
            subject,
            headline: 'Contactformulier',
            content,
            brandHeaderColor: usedHeaderColor,
            brandLogoUrl: usedLogoUrl,
            footerSignature: `Groeten,\nHet ${fromSiteTitle} Team`,
        });

        // 5) Send the email
        await customSendEmail(payload, {
            to: recipientEmail,
            subject,
            html,
            from: `${fromSiteTitle} <no-reply@orderapp.be>`,
            tenantId,  // if you want to store them in EmailLogs
            shopId,    // if you want to store them in EmailLogs
        });

        console.log('[contactRoute] Successfully sent email. Returning success.');
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error handling contact form submission:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
