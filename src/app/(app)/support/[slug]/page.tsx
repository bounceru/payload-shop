import { loadMarkdownArticles } from '@/lib/support/loadMarkdownArticles'
import { parseMarkdown } from '@/lib/support/parseMarkdown'
import { fetchShopContext } from '@/lib/fetchShopContext'
import { getPayload } from 'payload'
import config from '@payload-config'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import MarkdownContent from '../components/MarkdownContent'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { isShop, shop, branding } = await fetchShopContext({})
  const mdArticles = await loadMarkdownArticles()
  const md = mdArticles.find((a) => a.slug === slug)

  let markdown = md?.content
  let title = md?.title

  if (!markdown && isShop && shop) {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'support-articles',
      where: {
        slug: { equals: slug },
        tenant: { equals: shop.tenant },
        isPublic: { equals: true },
      },
      depth: 0,
      limit: 1,
    })
    const doc = res.docs[0]
    if (doc) {
      markdown = doc.body
      title = doc.title
    }
  }

  if (!markdown) return notFound()

  const html = parseMarkdown(markdown)
  const logoUrl =
    typeof branding?.siteLogo === 'object'
      ? branding?.siteLogo?.s3_url || '/static/stagepass-logo.png'
      : branding?.siteLogo || '/static/stagepass-logo.png'

  return (
    <>
      <NavBar
        isShop={isShop}
        logoUrl={logoUrl}
        ctaColor={branding?.headerBackgroundColor || '#ED6D38'}
        shopName={isShop ? shop?.name : undefined}
      />
      <main className="w-full">
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600" />
          <div className="relative h-full flex items-center px-4">
            <a href="/support" className="text-white flex items-center gap-1 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back
            </a>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white text-center px-4">{title}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <MarkdownContent html={html} />
        </div>
      </main>
      <Footer branding={branding as any} isShop={isShop} shop={shop} />
    </>
  )
}
