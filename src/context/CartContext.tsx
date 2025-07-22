// File: /app/(app)/order/components/cart/CartContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

import { usePathname } from 'next/navigation'

/* ─────────────────────────────────────────────────────────────────────
   1) Types for subproducts, cart items, etc.
   ───────────────────────────────────────────────────────────────────── */

export type LinkedProductData = {
  id: string;
  name_nl: string;
  description_nl?: string;
  priceUnified: boolean;
  price: number | null;
  image?: {
    url: string;
    alt?: string;
  } | null;
};

export type SubproductSelection = {
  tax_dinein?: number | null;
  subproductId: string;
  name_nl: string;
  name_en?: string;
  name_de?: string;
  name_fr?: string;
  name_tr?: string;
  name_zh?: string;
  price: number;
  tax?: number | null;
  linkedProduct?: LinkedProductData;
  image?: {
    url: string;
    alt?: string;
  } | null;
  taxRate?: number;
  taxRateDineIn?: number;
  quantity?: number;
};

/**
 * The main product line item in the cart.
 *
 * Added `locked?: boolean` and `couponBarcode?: string`
 * so we can lock or remove if it's a product-type coupon free item.
 */
export type CartItem = {
  productId: string;
  productName: string; // fallback name
  productNameNL?: string; // localized
  productNameEN?: string;
  productNameDE?: string;
  productNameFR?: string;
  productNameTR?: string;
  productNameZH?: string;
  price: number;
  quantity: number;
  note?: string;
  image?: {
    url: string;
    alt?: string;
  } | null;
  subproducts?: SubproductSelection[];
  hasPopups?: boolean;
  taxRate?: number;
  taxRateDineIn?: number;

  /** NEW: If this item was added by a product-type coupon => locked */
  locked?: boolean;
  promo?: boolean;
  couponBarcode?: string;
  maxAmountInCart?: number;
};

/* ─────────────────────────────────────────────────────────────────────
   2) Types for Coupons, Gift Vouchers, Memberships, Loyalty, & Customer
   ───────────────────────────────────────────────────────────────────── */

export type CouponInfo = {
  id: string;
  barcode: string;
  value: number;
  value_type: 'fixed' | 'percentage';
  valid_from: string;
  valid_until: string;
  max_uses?: number | null;
  uses?: number;
  used?: boolean;

  /**
   * If the coupon is a product-type, it might have a `product` reference.
   * Up to you whether you store that in this type.
   */
  coupon_type?: string;
  product?: {
    id: string;
    name_nl: string;
    // etc. if needed
  };
};

export type GiftVoucherInfo = {
  id: string;
  barcode: string;
  value: number;
  valid_from: string;
  valid_until: string;
  used: boolean;
};

export type LoyaltyProgram = {
  id: string;
  program_name: string;
  points_per_purchase: number;
  redeem_ratio: number; // e.g. 10 => 10 points = 1 currency
  status: 'active' | 'inactive';
  description?: string;
};

export type Membership = {
  id: string;
  role: {
    id: string;
    label: string;
    value: string;
    defaultRole?: boolean;
    loyaltyPrograms?: LoyaltyProgram[];
  };
  points: number;    // how many points user currently has
  status: string;
  dateJoined?: string;
};

export type CustomerInfo = {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string | null;
  barcode?: string;
  memberships?: Membership[];
  totalCredits?: number;
  // plus other fields if needed
};

/* ─────────────────────────────────────────────────────────────────────
   3) The shape of our CartContext
   ───────────────────────────────────────────────────────────────────── */

type CartContextValue = {
  // Basic cart
  items: CartItem[];
  selectedShippingMethod: 'dine-in' | 'takeaway' | 'delivery' | null;

  addItem: (newItem: CartItem) => void;
  updateItem: (lineSignature: string, updates: Partial<CartItem>) => void;
  updateItemQuantity: (lineSignature: string, newQty: number) => void;
  removeItem: (lineSignature: string) => void;
  clearCart: () => void;
  setShippingMethod: (method: 'dine-in' | 'takeaway' | 'delivery') => void;

  getItemCount: () => number;
  getCartTotal: () => number;

  // Discount/loyalty fields
  coupon: CouponInfo | null;
  giftVoucher: GiftVoucherInfo | null;
  customer: CustomerInfo | null;

  fetchCustomerByCode: (barcode: string) => Promise<void>;
  fetchCouponsAndGiftVouchers: () => Promise<void>;

  applyCoupon: (barcode: string) => Promise<void>;
  removeCoupon: () => void;
  applyGiftVoucher: (barcode: string) => Promise<void>;
  removeGiftVoucher: () => void;

  /** If the user wants to redeem membership points. */
  applyPointsUsage: (points: number) => void;

  /** If the user wants to apply store credits. */
  applyCustomerCredits: (amount: number) => void;
  removeCreditsUsage: () => void;
  removePointsUsage: () => void;

  /** We store them locally so we can subtract in getCartTotalWithDiscounts. */
  pointsUsed: number;   // how many *currency units* we've discounted from membership
  creditsUsed: number;  // how many currency units we've discounted from store credits

  getCartTotalWithDiscounts: () => number;
  getKioskMode: () => boolean;
};

/* ─────────────────────────────────────────────────────────────────────
   4) Create the React context & custom hook
   ───────────────────────────────────────────────────────────────────── */

const CartContext = createContext<CartContextValue | undefined>(undefined)

function useShopSlug() {
  const [shopSlug, setShopSlug] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const parts = hostname.split('.')
      const firstPart = parts[0]
      setShopSlug(firstPart)
    }
  }, [])

  return shopSlug
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

/**
 * Utility: create a unique signature for a cart line item.
 */
export function getLineItemSignature(item: CartItem): string {
  const subIds = item.subproducts?.map((sp) => sp.subproductId).sort().join(',') || ''
  const notePart = item.note || ''
  return `${item.productId}|[${subIds}]|note=${notePart}`
}

/* ─────────────────────────────────────────────────────────────────────
   5) The CartProvider implementation
   ───────────────────────────────────────────────────────────────────── */

export function CartProvider({ children }: { children: ReactNode }) {
  // Basic cart states
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<'dine-in' | 'takeaway' | 'delivery' | null>(null)

  const shopSlug = useShopSlug()

  // Discounts / loyalty
  const [coupon, setCoupon] = useState<CouponInfo | null>(null)
  const [giftVoucher, setGiftVoucher] = useState<GiftVoucherInfo | null>(null)
  const [customer, setCustomer] = useState<CustomerInfo | null>(null)

  // We store how many membership points & store credits the user has *converted into currency*
  const [pointsUsed, setPointsUsed] = useState<number>(0)
  const [creditsUsed, setCreditsUsed] = useState<number>(0)

  // For membership points reversion
  const [pointsSpentFromMembership, setPointsSpentFromMembership] = useState<number>(0)

  // 1) Load from localStorage on mount
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('cartItems')
      const storedMethod = localStorage.getItem('selectedShippingMethod')
      const storedCoupon = localStorage.getItem('appliedCoupon')
      const storedGiftVoucher = localStorage.getItem('appliedGiftVoucher')
      const storedPoints = localStorage.getItem('pointsUsed')
      const storedCredits = localStorage.getItem('creditsUsed')
      const storedCustomerDetails = localStorage.getItem('customerDetails')
      const storedKioskMode = localStorage.getItem('kioskNumber') !== null

      if (storedItems) setItems(JSON.parse(storedItems))
      if (storedMethod) setSelectedShippingMethod(storedMethod as any)
      if (storedCoupon) setCoupon(JSON.parse(storedCoupon))
      if (storedGiftVoucher) setGiftVoucher(JSON.parse(storedGiftVoucher))
      if (storedPoints) setPointsUsed(parseFloat(storedPoints))
      if (storedCredits) setCreditsUsed(parseFloat(storedCredits))
      if (storedCustomerDetails) {
        const parsed = JSON.parse(storedCustomerDetails)
        setCustomer(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // 2) Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items))
    localStorage.setItem('selectedShippingMethod', selectedShippingMethod || '')
    localStorage.setItem('pointsUsed', pointsUsed.toString())
    localStorage.setItem('creditsUsed', creditsUsed.toString())
  }, [items, selectedShippingMethod, pointsUsed, creditsUsed])

  // 3) Watch coupon => store or remove in localStorage
  useEffect(() => {
    if (coupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(coupon))
    } else {
      localStorage.removeItem('appliedCoupon')
    }
  }, [coupon])

  // 4) Gift voucher => store or remove
  useEffect(() => {
    if (giftVoucher) {
      localStorage.setItem('appliedGiftVoucher', JSON.stringify(giftVoucher))
    } else {
      localStorage.removeItem('appliedGiftVoucher')
    }
  }, [giftVoucher])

  /* ──────────────────────────
     Cart CRUD
     ────────────────────────── */

  function addItem(newItem: CartItem) {
    const newSig = getLineItemSignature(newItem)

    setItems((prev) => {
      // 1) Check if this exact line item (signature) already exists
      const existingIndex = prev.findIndex(
        (i) => getLineItemSignature(i) === newSig,
      )

      // 2) Merge the quantity
      let totalQty = newItem.quantity
      if (existingIndex >= 0) {
        totalQty += prev[existingIndex].quantity
      }

      // 3) If max is defined and we exceed it, clamp or block
      if (
        typeof newItem.maxAmountInCart === 'number' &&
        totalQty > newItem.maxAmountInCart
      ) {
        // Option A: clamp
        totalQty = newItem.maxAmountInCart

        // Option B: or show an error and bail
        // alert(`You can only add up to ${newItem.maxAmountInCart} of this product.`);
        // return prev;
      }

      if (existingIndex >= 0) {
        // Overwrite the existing line’s quantity
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: totalQty } : item,
        )
      } else {
        // No existing line => add a new entry
        const itemToAdd = { ...newItem, quantity: totalQty }
        return [...prev, itemToAdd]
      }
    })
  }

  function updateItem(lineSignature: string, updates: Partial<CartItem>) {
    setItems((prev) =>
      prev.map((item) =>
        getLineItemSignature(item) === lineSignature
          ? { ...item, ...updates }
          : item,
      ),
    )
  }

  /**
   * If item is locked => ignore changes, so user can't increment a free item
   */
  function updateItemQuantity(lineSignature: string, newQty: number) {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (getLineItemSignature(item) !== lineSignature) {
            return item
          }

          // If locked (like a free coupon item), ignore
          if (item.locked) return item

          // If the item has a max and newQty is above it => clamp
          if (
            typeof item.maxAmountInCart === 'number' &&
            newQty > item.maxAmountInCart
          ) {
            newQty = item.maxAmountInCart
          }

          return { ...item, quantity: newQty }
        })
        // Remove any lines that go to zero
        .filter((item) => item.quantity > 0)
    })
  }

  function removeItem(lineSignature: string) {
    setItems((prev) =>
      prev.filter((i) => getLineItemSignature(i) !== lineSignature),
    )
  }

  function clearCart() {
    setItems([])
    setSelectedShippingMethod(null)

    // also clear discount states
    setCoupon(null)
    setGiftVoucher(null)
    setCustomer(null)

    // reset applied points/credits
    setPointsUsed(0)
    setCreditsUsed(0)
  }

  function setShippingMethod(method: 'dine-in' | 'takeaway' | 'delivery') {
    setSelectedShippingMethod(method)
  }

  function getItemCount() {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  function getCartTotal() {
    let total = 0
    for (const item of items) {
      let linePrice = item.price * item.quantity
      if (item.subproducts) {
        for (const sp of item.subproducts) {
          const subQty = sp.quantity ?? 1
          linePrice += sp.price * subQty * item.quantity
        }
      }
      total += linePrice
    }
    return total
  }

  /* ─────────────────────────────────────────────────────────────────────
     Additional (Discount / Loyalty) Methods
     ───────────────────────────────────────────────────────────────────── */

  async function fetchCustomerByCode(barcode: string) {
    try {
      const res = await fetch(`/api/getCustomerByBarcode?barcode=${encodeURIComponent(barcode)}`)
      if (!res.ok) {
        return
      }
      const data = await res.json()
      const totalCredits: number = data.credits?.reduce(
        (sum: number, c: { value?: number }) => sum + (c.value || 0),
        0,
      ) || 0

      const customerWithCredits = {
        ...data.customer,
        totalCredits,
      }

      setCustomer(customerWithCredits)

      // also store in localStorage
      if (data.customer) {
        localStorage.setItem('customerID', data.customer.id)
        localStorage.setItem('customerBarcode', data.customer.barcode)
        localStorage.setItem('customerDetails', JSON.stringify(customerWithCredits))
      }
    } catch (err) {
      console.error('fetchCustomerByCode error:', err)
    }
  }

  async function fetchCouponsAndGiftVouchers() {
    try {
      const res = await fetch(`/api/getCouponsAndGiftVouchers?shop=${encodeURIComponent(shopSlug)}`)
      if (!res.ok) {
        return
      }
      const data = await res.json()
      console.log('All coupons + giftVouchers =>', data)
    } catch (err) {
      console.error('fetchCouponsAndGiftVouchers error:', err)
    }
  }

  /*
     NEW: If coupon_type = 'product', we add a free item to the cart with locked=true
  */
  async function applyCoupon(code: string) {
    try {
      // 0) If we already have a product coupon, bail out:
      if (coupon && coupon.coupon_type === 'product') {
        // optionally show a user message or console.error
        console.log('A product coupon is already in use.')
        return
      }

      const res = await fetch(
        `/api/getCouponsAndGiftVouchers?shop=${encodeURIComponent(shopSlug)}`,
      )
      if (!res.ok) return

      const data = await res.json()
      const match = data.coupons.find((c: any) => c.barcode === code)
      if (!match) return

      // If normal discount coupon => store it in state
      // You may also store `coupon_type` in your type if you wish
      if (match.coupon_type !== 'product') {
        setCoupon({
          id: match.id,
          barcode: match.barcode,
          value: match.value,
          value_type: match.value_type,
          valid_from: match.valid_from,
          valid_until: match.valid_until,
          max_uses: match.max_uses ?? null,
          uses: match.uses ?? 0,
          used: match.used ?? false,
          coupon_type: match.coupon_type,
        })
        return
      }

      // It's a product-type coupon => add a locked line item with price=0
      // 1) check if already in cart
      const existingFree = items.find((i) => i.couponBarcode === match.barcode)
      if (existingFree) {
        // Already applied => do nothing or handle conflict
        return
      }

      // If the product field is not included at depth, do another fetch or adapt the data:
      // For example, if match.product has { id, name_nl }, we can use that
      const firstProd = match.product[0]
      const productId = firstProd?.id || `coupon-free-${match.id}`
      const productName = firstProd?.name_nl || 'Free Reward'

      const productImg = match.product?.image

      // 2) Create the free item
      const freeItem: CartItem = {
        productId: productId || `coupon-free-${match.id}`,
        productName,
        price: 0,
        quantity: 1,
        locked: true, // can't change quantity
        promo: true, // optional flag for styling
        couponBarcode: match.barcode,
        // Fill in the .image property:
        image: productImg
          ? {
            // If your actual URL is in s3_url, use that:
            url: productImg.s3_url || productImg.url || '',
            alt: productName,
          }
          : undefined,
      }

      setItems((prev) => [...prev, freeItem])

      // Optionally also store some partial coupon data so you can remove it from state
      setCoupon({
        id: match.id,
        barcode: match.barcode,
        value: match.value,
        value_type: match.value_type,
        valid_from: match.valid_from,
        valid_until: match.valid_until,
        max_uses: match.max_uses ?? null,
        uses: match.uses ?? 0,
        used: match.used ?? false,
        coupon_type: match.coupon_type,
        product: match.product,
      })
    } catch (err) {
      console.error('applyCoupon error:', err)
    }
  }

  function removeCoupon() {
    if (!coupon) return

    // If it’s a product coupon => remove the free item from the cart
    if (coupon.coupon_type === 'product') {
      // filter out any item with couponBarcode === coupon.barcode
      setItems((prev) =>
        prev.filter((i) => i.couponBarcode !== coupon.barcode),
      )
    }

    // then clear the coupon from state
    setCoupon(null)
  }

  async function applyGiftVoucher(code: string) {
    try {
      const res = await fetch(
        `/api/getCouponsAndGiftVouchers?shop=${encodeURIComponent(shopSlug)}`,
      )
      if (!res.ok) return

      const data = await res.json()
      const match = data.giftVouchers.find((gv: any) => gv.barcode === code)
      if (!match) return

      setGiftVoucher({
        id: match.id,
        barcode: match.barcode,
        value: match.value,
        valid_from: match.valid_from,
        valid_until: match.valid_until,
        used: match.used,
      })
    } catch (err) {
      console.error('applyGiftVoucher error:', err)
    }
  }

  function removeGiftVoucher() {
    setGiftVoucher(null)
  }

  /**
   * applyPointsUsage => user wants to apply some membership points.
   * We'll convert those points into currency using membership's redeem_ratio.
   * E.g. if ratio=10 => 10 points = 1 currency => pointsRequested / ratio = discount in currency
   */
  function applyPointsUsage(pointsRequested: number) {
    if (!customer || !customer.memberships || !customer.memberships.length) {
      return
    }
    const membership = customer.memberships[0]
    if (membership.points < pointsRequested) {
      // Not enough points => do nothing
      return
    }

    let ratio = 1
    const loyaltyArray = membership.role.loyaltyPrograms
    if (loyaltyArray && loyaltyArray.length > 0) {
      ratio = loyaltyArray[0].redeem_ratio || 1
    }
    const discountAmount = pointsRequested / ratio

    // Subtract from membership
    const updatedMembership = {
      ...membership,
      points: membership.points - pointsRequested,
    }
    const updatedCustomer: CustomerInfo = {
      ...customer,
      memberships: [updatedMembership, ...customer.memberships.slice(1)],
    }
    setCustomer(updatedCustomer)

    // Increase local discount
    setPointsUsed((prev) => prev + discountAmount)

    // record how many raw points we used
    setPointsSpentFromMembership((prev) => prev + pointsRequested)
  }

  function removePointsUsage() {
    if (!customer || !customer.memberships || customer.memberships.length === 0) {
      return
    }
    if (pointsSpentFromMembership <= 0) return

    const membership = customer.memberships[0]
    membership.points += pointsSpentFromMembership

    setPointsUsed(0)
    setPointsSpentFromMembership(0)

    const updatedMembership = { ...membership }
    const updatedCustomer: CustomerInfo = {
      ...customer,
      memberships: [updatedMembership, ...customer.memberships.slice(1)],
    }
    setCustomer(updatedCustomer)
  }

  /**
   * applyCustomerCredits => user has e.g. 1000 credits => use X => 1 credit=1 currency
   */
  function applyCustomerCredits(amount: number) {
    setCreditsUsed((prev) => prev + amount)
  }

  function removeCreditsUsage() {
    setCreditsUsed(0)
  }

  /**
   * getCartTotalWithDiscounts => final total after coupon, gift voucher,
   * membership points usage (in currency), and store credits usage
   */
  function getCartTotalWithDiscounts() {
    let base = getCartTotal()
    const nowIso = new Date().toISOString()

    // 1) coupon discount
    if (coupon) {
      const withinDates =
        nowIso >= coupon.valid_from && nowIso <= coupon.valid_until
      if (withinDates && !coupon.used && coupon.coupon_type !== 'product') {
        // product-type coupons => free item is already in the cart, no additional discount needed
        if (coupon.value_type === 'fixed') {
          base = Math.max(0, base - coupon.value)
        } else if (coupon.value_type === 'percentage') {
          base = base * (1 - coupon.value / 100)
        }
      }
    }

    // 2) gift voucher discount
    if (giftVoucher) {
      const withinDates =
        nowIso >= giftVoucher.valid_from && nowIso <= giftVoucher.valid_until
      if (withinDates && !giftVoucher.used) {
        base = Math.max(0, base - giftVoucher.value)
      }
    }

    // 3) membership points usage => we have `pointsUsed` in currency
    if (pointsUsed > 0) {
      base = Math.max(0, base - pointsUsed)
    }

    // 4) store credits usage => 1:1 with currency
    if (creditsUsed > 0) {
      base = Math.max(0, base - creditsUsed)
    }

    return parseFloat(base.toFixed(2))
  }

  /* ─────────────────────────────────────────────────────────────────────
     6) Final context value
     ───────────────────────────────────────────────────────────────────── */

  const value: CartContextValue = {
    // cart core
    items,
    selectedShippingMethod,
    addItem,
    updateItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    setShippingMethod,
    getItemCount,
    getCartTotal,

    // discount/loyalty
    coupon,
    giftVoucher,
    customer,
    fetchCustomerByCode,
    fetchCouponsAndGiftVouchers,
    applyCoupon,
    removeCoupon,
    applyGiftVoucher,
    removeGiftVoucher,

    // points & credits usage
    pointsUsed,
    creditsUsed,
    applyPointsUsage,
    applyCustomerCredits,
    removeCreditsUsage,
    removePointsUsage,

    // final total
    getCartTotalWithDiscounts,

    // kiosk mode check
    getKioskMode: () => {
      return localStorage.getItem('kioskMode') === 'true'
    },
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
