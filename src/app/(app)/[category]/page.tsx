import { fetchShopContext } from '@/lib/fetchShopContext'
import { fetchFilterContext } from '@/lib/fetchFilterContext'
import GeneralHomePage from '../components/GeneralHomePage'
import ShopHomePage from '../components/ShopHomePage'
import NavBar from '../components/NavBar'
import Loading from '../loading'
import { getS3Url } from '@/utils/media'
import Footer from '../components/Footer'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({
                                             params: promiseParams,
                                             searchParams: searchParamsPromise,
                                           }: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { category } = await promiseParams
  const { location, start, end, search } = (await searchParamsPromise) || {}
  const normalizedLocation = location?.trim()
  const normalizedSearch = search?.trim()

  try {
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
        {isShop ? (

          <ShopHomePage events={events} shop={shop} branding={branding} emptyCategory={category} />


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
      </>
    )
  } catch (error) {
    console.error('Error loading category page:', error)
    // Use the default color since headerBgColor is not available here
    return <Loading color="#ED6D38" />
  }
}
