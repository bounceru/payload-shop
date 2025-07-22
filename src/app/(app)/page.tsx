import { fetchShopContext } from '@/lib/fetchShopContext'
import { fetchFilterContext } from '@/lib/fetchFilterContext'
import GeneralHomePage from './components/GeneralHomePage'
import ShopHomePage from './components/ShopHomePage'
import NavBar from './components/NavBar'
import Footer from './components/Footer'

export const dynamic = 'force-dynamic'

function getS3Url(media: string | { s3_url?: string | null } | null | undefined): string | undefined {
  if (typeof media === 'object' && media !== null && 's3_url' in media) {
    return media.s3_url || undefined
  }
  return undefined
}

export default async function HomePage({
                                         searchParams: searchParamsPromise,
                                       }: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { location, start, end, type, search } = (await searchParamsPromise) || {}
  const normalizedLocation = location?.trim()
  const normalizedSearch = search?.trim()
  const category = type || undefined

  const { isShop, shop, branding } = await fetchShopContext({ category })

  const events = await fetchFilterContext({
    category,
    location: normalizedLocation,
    start,
    end,
    search: normalizedSearch,
    shopId: isShop ? shop?.id : undefined,
  })

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

      <div>
        {isShop ? (
          <ShopHomePage events={events} shop={shop} branding={branding} />
        ) : (
          <GeneralHomePage events={events} emptyCategory={category} />
        )}

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
      </div>
    </>
  )
}
