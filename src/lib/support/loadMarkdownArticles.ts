import fs from 'fs'
import path from 'path'

export type MarkdownArticle = {
  slug: string
  title: string
  excerpt: string
  content: string
}

const articlesDir = path.join(process.cwd(), 'content/support')

export async function loadMarkdownArticles(): Promise<MarkdownArticle[]> {
  try {
    const files = await fs.promises.readdir(articlesDir)
    const articles: MarkdownArticle[] = []
    for (const file of files) {
      if (file.endsWith('.md')) {
        const slug = file.replace(/\.md$/, '')
        const fullPath = path.join(articlesDir, file)
        const content = await fs.promises.readFile(fullPath, 'utf-8')
        const lines = content.split(/\r?\n/)
        const title = lines[0]?.replace(/^#\s*/, '').trim() || slug
        const bodyLines = lines.slice(1).filter((l) => l.trim() !== '')
        const firstBody = bodyLines[0]?.replace(/^[-*]\s+/, '').trim() || ''
        const excerpt = firstBody.length > 120 ? `${firstBody.slice(0, 117)}...` : firstBody
        articles.push({ slug, title, excerpt, content })
      }
    }
    return articles
  } catch {
    return []
  }
}
