import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import juice from 'juice';

// We assume your template.ejs file is in `/src/email/template.ejs` relative to this file:
const templatePath = path.join(process.cwd(), 'src', 'email', 'template.ejs');

export interface GeneralizedEmailParams {
    subject: string;
    headline?: string;          // used in header if skipHeader is false
    content?: string;           // main body text or HTML snippet
    brandHeaderColor?: string;  // e.g. '#dc2626'
    brandLogoUrl?: string;      // e.g. 'https://mysite.com/logo.png'
    skipHeader?: boolean;       // if true => hide the entire header block
    cta?: {
        buttonLabel: string;
        url: string;
    };
    footerSignature?: string;   // e.g. "Groeten, \nHet Company Team"
}

/**
 * Renders an HTML email using template.ejs.
 * Optionally inlines the CSS with `juice` so it’s more email-client-friendly.
 */
export async function generateGeneralizedEmail(
    params: GeneralizedEmailParams
): Promise<{ subject: string; html: string }> {
    const {
        subject,
        headline = '',      // fallback if not provided
        content = '',
        brandHeaderColor = '#dc2626',
        brandLogoUrl = '',
        skipHeader = false,
        cta,
        footerSignature,
    } = params;

    // 1) We can add a small “footer signature” if you want a standard salutation
    //    e.g. "Groeten,\nHet Company Team"
    const finalContent = footerSignature
        ? `${content}\n\n${footerSignature}`
        : content;

    // 2) EJS expects “<%- content %>” to be raw HTML
    //    So you can either pass in string with basic line breaks, or
    //    you can convert newlines to <br> for a pseudo-plaintext feel.
    const contentWithLineBreaks = finalContent;

    // 3) Render the EJS template:
    const renderedHtml = await ejs.renderFile(templatePath, {
        skipHeader,
        brandHeaderColor,
        brandLogoUrl,
        headline,
        cta,
        content: contentWithLineBreaks,
    });

    // 4) Inline the CSS for maximum compatibility:
    const inlinedHtml = juice(renderedHtml);

    return {
        subject,
        html: inlinedHtml,
    };
}
