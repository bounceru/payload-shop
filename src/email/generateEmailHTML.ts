// File: /src/email/generateEmailHTML.ts
import ejs from 'ejs'
import fs from 'fs'
import juice from 'juice'
import path from 'path'

export interface GenerateEmailParams {
  headline?: string;
  content?: string;
  cta?: { buttonLabel?: string; url?: string };
  brandLogoUrl?: string;
  brandHeaderColor?: string;
  /** If true, skip rendering the entire header block. */
  skipHeader?: boolean;
}

export const generateEmailHTML = async (params: GenerateEmailParams): Promise<string> => {
  const templatePath = path.join(process.cwd(), 'src/email/template.ejs')
  const templateContent = fs.readFileSync(templatePath, 'utf8')

  const preInlined = ejs.render(templateContent, {
    headline: params.headline || '',
    content: params.content || '',
    cta: params.cta || null,
    brandLogoUrl: params.brandLogoUrl || '',
    brandHeaderColor: params.brandHeaderColor || '#dc2626',
    skipHeader: params.skipHeader || false, // default to false if not provided
  })

  const html = juice(preInlined)
  return html
}
