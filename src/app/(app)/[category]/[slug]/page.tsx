import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import EventDetail from '../../event/[slug]/components/EventDetail'
import { fetchShopContext } from '@/lib/fetchShopContext'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'

export const dynamic = 'force-dynamic'

function getS3Url(media: string | { s3_url?: string | null } | null | undefined): string | undefined {
  if (typeof media === 'object' && media !== null && 's3_url' in media) {
    return media.s3_url || undefined
  }
  return undefined
}

export default async function EventDetailPage({
                                                params: promiseParams,
                                              }: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await promiseParams
  const payload = await getPayload({ config })

  const { isShop, shop, branding } = await fetchShopContext({ category })

  const result = await payload.find({
    collection: 'events',
    where: {
      slug: { equals: slug },
      type: { equals: category },
      isPublished: { equals: true },
    },
    depth: 3,
    limit: 1,
  })

  const event = result.docs?.[0]
  if (!event) return notFound()

  const logoUrl = getS3Url(branding?.siteLogo) || '/static/stagepass-logo.png'
  const headerBgColor = branding?.headerBackgroundColor || '#ED6D38'
  const headerTextColor = branding?.headerTextColor || '#ffffff'

  return (
    <>
      <NavBar
        isShop={isShop}
        logoUrl={logoUrl}
        ctaColor={headerBgColor}

        shopName={isShop ? shop?.name : undefined}
      />
      <EventDetail
        event={event}
        branding={
          branding
            ? {
              ...branding,
              primaryColorCTA: branding.primaryColorCTA ?? undefined,
            }
            : undefined
        }
      />
      <Footer
        branding={
          branding
            ? {
              ...branding,
              siteLogo:
                typeof branding.siteLogo === 'object' &&
                branding.siteLogo !== null
                  ? branding.siteLogo.s3_url ?? undefined
                  : branding.siteLogo,
              primaryColorCTA: branding.primaryColorCTA ?? undefined,
              headerBackgroundColor: branding.headerBackgroundColor ?? undefined,
            }
            : undefined
        }
        isShop={isShop}
        shop={shop}
      />
    </>
  )
}
