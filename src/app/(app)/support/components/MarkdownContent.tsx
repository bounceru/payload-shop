'use client'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'

type Props = { html: string }

export default function MarkdownContent({ html }: Props) {
  const clean = DOMPurify.sanitize(html)
  return <div className="prose max-w-none">{parse(clean)}</div>
}
