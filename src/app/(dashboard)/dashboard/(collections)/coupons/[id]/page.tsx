import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import CouponAdminDetail from './CouponAdminDetail'
import type { Coupon } from '@/payload-types'

export default async function CouponDetailPage({
                                                 params: promisedParams,
                                               }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promisedParams

  // If “new”
  if (id === 'new') {
    return <CouponAdminDetail coupon={{ id: 'new' }} isNew />
  }

  const cookieStore = await cookies()
  const tenantId = cookieStore.get('payload-tenant')?.value
  if (!tenantId) {
    return notFound()
  }

  const payload = await getPayload({ config })

  // 1) fetch existing coupon doc
  const coupon = await payload.findByID({
    collection: 'coupons',
    id,
    depth: 1, // or more if needed
  })

  if (!coupon) {
    return notFound()
  }

  // 2) Tenant check
  const couponTenant =
    typeof coupon.tenant === 'object' && coupon.tenant !== null
      ? coupon.tenant.id
      : coupon.tenant

  if (couponTenant !== tenantId) {
    return notFound()
  }

  // 3) Convert any null => undefined
  const safeCoupon: Coupon = {
    ...coupon,
    usageLimit: coupon.usageLimit ?? undefined,
    used: coupon.used ?? 0,
  }

  return <CouponAdminDetail coupon={safeCoupon} />
}
