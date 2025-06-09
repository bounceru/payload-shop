import { loadMarkdownArticles } from '@/lib/support/loadMarkdownArticles'
import { fetchShopContext } from '@/lib/fetchShopContext'
import { getPayload } from 'payload'
import config from '@payload-config'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SupportPage() {
  const { isShop, shop, branding } = await fetchShopContext({})
  const markdownArticles = await loadMarkdownArticles()
  let shopArticles: { slug: string; title: string; excerpt: string }[] = []

  if (isShop && shop) {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'support-articles',
      where: { tenant: { equals: shop.tenant }, isPublic: { equals: true } },
      depth: 0,
    })
    shopArticles = res.docs.map((d: any) => ({
      slug: d.slug,
      title: d.title,
      excerpt: typeof d.body === 'string' ? d.body.split(/\r?\n/)[0].slice(0, 120) : '',
    }))
  }

  const articles = [
    ...markdownArticles.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
    })),
    ...shopArticles,
  ]

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
        {/* Hero */}
        <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600" />
          <div className="relative h-full flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">Helpdesk</h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <a
                key={article.slug}
                href={`/support/${article.slug}`}
                className="block bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h2>
                {article.excerpt && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                )}
                <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer branding={branding as any} isShop={isShop} shop={shop} />
    </>
  )
}
