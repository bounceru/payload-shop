'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'

import { DetailShell } from '@/app/(dashboard)/dashboard/components/ui/DetailShell'

/**
 * The shape of your Shop doc.
 * You can expand fields based on your `Shops` collection:
 */
interface ShopDoc {
  id?: string;
  tenant?: string | { id: string };

  // Basic
  name?: string;
  slug?: string;
  domain?: string;

  // Closed days
  showExceptionallyClosedDaysOnOrderPage?: boolean;
  exceptionally_closed_days?: {
    id?: string;
    date?: string;
    reason?: string;
  }[];

  // Address + location
  address?: string;
  location?: {
    lat?: string;
    lng?: string;
  };

  // Company details group
  company_details?: {
    company_name?: string;
    contact_email?: string;
    phone?: string;
    street?: string;
    house_number?: string;
    city?: string;
    postal?: string;
    vat_nr?: string;
    website_url?: string;
  };
}

/**
 * Props:
 * - serverShop: The shop doc as fetched in your server component (e.g. page.tsx).
 *   Then we pass that doc into this client component to let the user edit fields
 *   with a nice UI (and we’ll do the “PATCH”/“DELETE” calls from here).
 */
export default function EditShopClient({ serverShop }: { serverShop: ShopDoc }) {
  const router = useRouter()

  // We'll keep a local copy of the shop doc
  const [shop, setShop] = useState<ShopDoc>(serverShop)
  const [isChanged, setIsChanged] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  /**
   * Compare the current local `shop` object to the original `serverShop`
   * whenever `shop` changes to toggle the "Save" button.
   */
  useEffect(() => {
    const original = JSON.stringify(serverShop)
    const current = JSON.stringify(shop)
    setIsChanged(original !== current)
  }, [shop, serverShop])

  /** Save => PATCH via your /api/payloadProxy/shops route */
  async function handleSave() {
    try {
      // Because we have an ID, your route will interpret it as PATCH
      const response = await fetch('/api/payloadProxy/shops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shop),
      })
      if (!response.ok) {
        throw new Error('Failed to update shop')
      }
      toast.success('Shop updated!')

      // Refresh the server component data
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Something went wrong')
    }
  }

  /** Delete => calls /api/payloadProxy/shops?id=xxx with method DELETE */
  async function handleDelete() {
    setShowDeleteModal(false)
    try {
      if (!shop?.id) {
        toast.error('No ID to delete!')
        return
      }
      const delUrl = `/api/payloadProxy/shops?id=${shop.id}`
      const res = await fetch(delUrl, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Shop deleted!')
      router.push('/dashboard/shops')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to delete shop')
    }
  }

  // Helper: top-level field
  function setField<T extends keyof ShopDoc>(field: T, value: ShopDoc[T]) {
    setShop((prev) => ({ ...prev, [field]: value }))
  }

  // Helper: nested field for location, company_details, etc.
  function setNestedField<
    P extends keyof ShopDoc,
    K extends keyof NonNullable<ShopDoc[P]>
  >(parent: P, key: K, value: NonNullable<ShopDoc[P]>[K]) {
    setShop((prev) => ({
      ...prev,
      [parent]: {
        ...(typeof prev[parent] === 'object' && prev[parent] !== null
          ? prev[parent]
          : {}),
        [key]: value,
      },
    }))
  }

  // Toggling "showExceptionallyClosedDaysOnOrderPage"
  function toggleClosedDays() {
    setShop((prev) => ({
      ...prev,
      showExceptionallyClosedDaysOnOrderPage: !prev.showExceptionallyClosedDaysOnOrderPage,
    }))
  }

  // Add a new closed day
  function addClosedDay() {
    setShop((prev) => ({
      ...prev,
      exceptionally_closed_days: [
        ...(prev.exceptionally_closed_days || []),
        { date: '', reason: '' },
      ],
    }))
  }

  // Update closed day
  function updateClosedDay(idx: number, field: 'date' | 'reason', value: string) {
    setShop((prev) => {
      const arr = [...(prev.exceptionally_closed_days || [])]
      arr[idx] = { ...arr[idx], [field]: value }
      return { ...prev, exceptionally_closed_days: arr }
    })
  }

  // Remove closed day
  function removeClosedDay(idx: number) {
    setShop((prev) => {
      const arr = [...(prev.exceptionally_closed_days || [])]
      arr.splice(idx, 1)
      return { ...prev, exceptionally_closed_days: arr }
    })
  }

  return (
    <>
      <Toaster position="top-center" />
      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold">Delete Shop</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{shop.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <DetailShell
        title={shop.name ? `Edit Shop: ${shop.name}` : 'Edit Shop'}
        description="Manage your shop details"
        onBack={() => router.back()}
        onDelete={() => setShowDeleteModal(true)}
        onDeleteLabel="Delete Shop"
        onSave={handleSave}
        saveDisabled={!isChanged}
        saveLabel="Save Changes"
      >
        {/* Our actual shop fields go here */}
        <div className="space-y-6">
          {/* Basic fields */}
          <div className="bg-white border p-4 rounded shadow-sm space-y-3">
            <div>
              <label className="block text-sm font-medium">Shop Name</label>
              <input
                className="border p-2 rounded w-full"
                value={shop.name || ''}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug</label>
              <input
                className="border p-2 rounded w-full"
                value={shop.slug || ''}
                onChange={(e) => setField('slug', e.target.value)}
              />
              <p className="text-xs text-gray-400">
                only-lowercase-letters-hyphens
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium">Domain</label>
              <input
                className="border p-2 rounded w-full"
                value={shop.domain || ''}
                onChange={(e) => setField('domain', e.target.value)}
              />
              <p className="text-xs text-gray-400">
                e.g. https://tickets.myvenue.be
              </p>
            </div>
          </div>

          {/* Show closed days toggle */}
          <div className="bg-white border p-4 rounded shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!shop.showExceptionallyClosedDaysOnOrderPage}
                onChange={toggleClosedDays}
              />
              <label className="text-sm font-medium">
                Show closed days on order page?
              </label>
            </div>
            {shop.showExceptionallyClosedDaysOnOrderPage && (
              <div className="space-y-2">
                <button
                  onClick={addClosedDay}
                  className="bg-gray-100 text-sm px-2 py-1 rounded hover:bg-gray-200"
                >
                  + Add Closed Day
                </button>
                {(shop.exceptionally_closed_days || []).map((day, idx) => (
                  <div
                    key={day.id || idx}
                    className="bg-gray-50 p-2 rounded flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="date"
                      className="border p-1 rounded"
                      value={day.date || ''}
                      onChange={(e) => updateClosedDay(idx, 'date', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Reason"
                      className="border p-1 rounded flex-1"
                      value={day.reason || ''}
                      onChange={(e) => updateClosedDay(idx, 'reason', e.target.value)}
                    />
                    <button
                      onClick={() => removeClosedDay(idx)}
                      className="text-red-600 text-sm underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address & Location */}
          <div className="bg-white border p-4 rounded shadow-sm space-y-3">
            <label className="block text-sm font-medium">Address</label>
            <input
              className="border p-2 rounded w-full"
              value={shop.address || ''}
              onChange={(e) => setField('address', e.target.value)}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium">Latitude</label>
                <input
                  className="border p-2 rounded w-full"
                  value={shop.location?.lat || ''}
                  onChange={(e) => setNestedField('location', 'lat', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Longitude</label>
                <input
                  className="border p-2 rounded w-full"
                  value={shop.location?.lng || ''}
                  onChange={(e) => setNestedField('location', 'lng', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Company Details Group */}
          <div className="bg-white border p-4 rounded shadow-sm space-y-3">
            <h4 className="font-semibold text-md">Company Details</h4>

            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input
                className="border p-2 rounded w-full"
                value={shop.company_details?.company_name || ''}
                onChange={(e) =>
                  setNestedField('company_details', 'company_name', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Contact Email</label>
              <input
                className="border p-2 rounded w-full"
                value={shop.company_details?.contact_email || ''}
                onChange={(e) =>
                  setNestedField('company_details', 'contact_email', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                className="border p-2 rounded w-full"
                value={shop.company_details?.phone || ''}
                onChange={(e) =>
                  setNestedField('company_details', 'phone', e.target.value)
                }
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium">Street</label>
                <input
                  className="border p-2 rounded w-full"
                  value={shop.company_details?.street || ''}
                  onChange={(e) =>
                    setNestedField('company_details', 'street', e.target.value)
                  }
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium">House #</label>
                <input
                  className="border p-2 rounded w-full"
                  value={shop.company_details?.house_number || ''}
                  onChange={(e) =>
                    setNestedField('company_details', 'house_number', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium">City</label>
                <input
                  className="border p-2 rounded w-full"
                  value={shop.company_details?.city || ''}
                  onChange={(e) =>
                    setNestedField('company_details', 'city', e.target.value)
                  }
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium">Postal Code</label>
                <input
                  className="border p-2 rounded w-full"
                  value={shop.company_details?.postal || ''}
                  onChange={(e) =>
                    setNestedField('company_details', 'postal', e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">VAT Number</label>
              <input
                className="border p-2 rounded w-full"
                value={shop.company_details?.vat_nr || ''}
                onChange={(e) =>
                  setNestedField('company_details', 'vat_nr', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Website URL</label>
              <input
                className="border p-2 rounded w-full"
                value={shop.company_details?.website_url || ''}
                onChange={(e) =>
                  setNestedField('company_details', 'website_url', e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </DetailShell>
    </>
  )
}
