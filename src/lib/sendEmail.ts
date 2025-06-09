// File: /lib/sendEmail.ts
import nodemailer from 'nodemailer';
import type { Payload } from 'payload';

interface SendEmailArgs {
    to: string;
    subject: string;
    html: string;
    from?: string;     // optional custom "from"
    tenantId?: string; // optional tenant
    shopId?: string;   // optional shop
}

export async function sendEmail(
    payload: Payload,
    {
        to,
        subject,
        html,
        from,
        tenantId,
        shopId,
    }: SendEmailArgs
) {
    // 1) CREATE an EmailLogs entry in "pending" status
    let emailLogId: string | null = null;
    try {
        // -- CAST the collection name to `any` so TS doesn't complain
        const createdLog = await payload.create({
            collection: 'email-logs' as any,
            data: {
                tenant: tenantId || null,
                shops: shopId ? [shopId] : [],
                to,
                from: from || '"Orderapp" <no-reply@orderapp.be>',
                subject,
                // We'll also cast 'pending' if needed, but typically only the slug is the issue
                status: 'pending' as any,
                htmlBodySnippet: html.slice(0, 1000),
            },
        });
        emailLogId = (createdLog as any).id;
    } catch (err) {
        console.error('[sendEmail] Warning: could not create initial EmailLogs entry:', err);
        // Not critical — we can still send the email
    }

    // 2) Optionally, find an SMTPSettings doc for tenant/shop
    // (same logic as before, left mostly unchanged)
    let smtpDoc: any = null;
    try {
        if (shopId) {
            const findShopSmtp = await payload.find({
                collection: 'smtp-settings' as any, // if needed, cast again
                where: { shops: { in: [shopId] } },
                limit: 1,
            });
            smtpDoc = findShopSmtp.docs?.[0] || null;
        }
        if (!smtpDoc && tenantId) {
            const findTenantSmtp = await payload.find({
                collection: 'smtp-settings' as any,
                where: { tenant: { equals: tenantId } },
                limit: 1,
            });
            smtpDoc = findTenantSmtp.docs?.[0] || null;
        }
    } catch (err) {
        console.error('[sendEmail] Could not fetch smtp-settings doc:', err);
    }

    // 3) Build transporter (unchanged)
    let transporter;
    let finalFrom = from || '"Orderapp" <no-reply@orderapp.be>';

    if (smtpDoc && smtpDoc.provider !== 'orderapp') {
        const { provider, username, password, fromName, fromEmail } = smtpDoc;
        let { host, port } = smtpDoc;

        if (provider === 'gmail') {
            host = 'smtp.gmail.com';
            port = 587;
        } else if (provider === 'outlook') {
            host = host || 'smtp.office365.com';
            port = port || 587;
        }

        transporter = nodemailer.createTransport({
            host,
            port,
            secure: Number(port) === 465,
            auth: {
                user: username,
                pass: password,
            },
        });

        if (fromName || fromEmail) {
            finalFrom = `${fromName || 'No Reply'} <${fromEmail || 'no-reply@orderapp.be'}>`;
        }
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // 4) Send email
    try {
        console.log('[sendEmail] Attempting to send email:');
        console.log('   From:', finalFrom);
        console.log('   To:', to);
        console.log('   Subject:', subject);

        const result = await transporter.sendMail({
            from: finalFrom,
            to,
            subject,
            html,
        });

        console.log('[sendEmail] Mail sent successfully. nodemailer response:', result);

        // 5) Update EmailLogs => "success"
        if (emailLogId) {
            await payload.update({
                collection: 'email-logs' as any, // again, cast the slug
                id: emailLogId,
                data: {
                    status: 'success' as any, // cast if needed
                },
            });
        }

        return result;
    } catch (err) {
        console.error('[sendEmail] Error sending mail:', err);

        // 6) Update EmailLogs => "failed"
        if (emailLogId) {
            await payload.update({
                collection: 'email-logs' as any,
                id: emailLogId,
                data: {
                    status: 'failed' as any,
                    errorMessage: (err instanceof Error ? err.message : 'Unknown error') || JSON.stringify(err),
                },
            });
        }
        throw err;
    }
}
