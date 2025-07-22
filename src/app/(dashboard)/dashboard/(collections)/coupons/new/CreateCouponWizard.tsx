'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'

// Minimal shape for an event and a ticketType row, if you want to let the user pick
interface SimpleEvent {
  id: string;
  title?: string;
}

interface SimpleTicketType {
  id: string;
  name_nl?: string;
}

// The shape of your wizard local state
interface CouponWizardData {
  tenant: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  value: number;
  event?: string;       // event ID
  ticketType?: string;  // ticketType ID
  validFrom: string;
  validUntil: string;
  usageLimit: string;   // keep as string for user input
  enabled: boolean;
  note: string;
}

interface CreateCouponWizardProps {
  initialTenantId: string;
  serverEvents: SimpleEvent[];       // events from server
  serverTicketTypes: SimpleTicketType[]; // ticket types from server
}

/**
 * A multi-step wizard for creating a new Coupon.
 */
export default function CreateCouponWizard({
                                             initialTenantId,
                                             serverEvents,
                                             serverTicketTypes,
                                           }: CreateCouponWizardProps) {
  const router = useRouter()

  // Which step are we on?
  const [step, setStep] = useState(1)

  // The local coupon data
  const [couponData, setCouponData] = useState<CouponWizardData>(() => ({
    tenant: initialTenantId,
    code: '',
    discountType: 'fixed',
    value: 0,
    event: '',
    ticketType: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    enabled: true,
    note: '',
  }))

  // Step navigation
  function nextStep() {
    // minimal validation on step 1:
    if (step === 1) {
      if (!couponData.code.trim()) {
        toast.error('Een code is verplicht.')
        return
      }
      if (couponData.value < 0) {
        toast.error('Waarde mag niet negatief zijn.')
        return
      }
    }
    setStep((prev) => prev + 1)
  }

  function prevStep() {
    setStep((prev) => prev - 1)
  }

  // On final step => POST to create
  async function handleFinish() {
    try {
      const bodyToSend: any = { ...couponData }
      // Convert usageLimit from string -> number if not empty
      if (bodyToSend.usageLimit.trim()) {
        bodyToSend.usageLimit = parseInt(bodyToSend.usageLimit, 10)
      } else {
        delete bodyToSend.usageLimit
      }

      // If event is an empty string, remove
      if (!bodyToSend.event) {
        delete bodyToSend.event
      }
      // If ticketType is an empty string, remove
      if (!bodyToSend.ticketType) {
        delete bodyToSend.ticketType
      }

      // POST => /api/payloadProxy/coupons
      const res = await fetch('/api/payloadProxy/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      })
      if (!res.ok) {
        throw new Error('Aanmaken van coupon is mislukt.')
      }
      const result = await res.json()
      const newID = result?.doc?.id || result.id
      if (!newID) {
        throw new Error('Geen geldig ID van de server ontvangen.')
      }

      toast.success('Coupon succesvol aangemaakt!')
      router.push(`/dashboard/coupons/${newID}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Kon nieuwe coupon niet aanmaken.')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <Toaster position="top-center" />
      <h2 className="text-xl font-semibold text-gray-800">
        Nieuwe Coupon – Stap {step} van 3
      </h2>

      {step === 1 && (
        <StepOne couponData={couponData} setCouponData={setCouponData} />
      )}
      {step === 2 && (
        <StepTwo
          couponData={couponData}
          setCouponData={setCouponData}
          serverEvents={serverEvents}
          serverTicketTypes={serverTicketTypes}
        />
      )}
      {step === 3 && (
        <StepConfirm
          couponData={couponData}
          serverEvents={serverEvents}
          serverTicketTypes={serverTicketTypes}
        />
      )}

      <div className="flex justify-between pt-4 border-t border-gray-100">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            Terug
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={nextStep}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Volgende
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            Afronden
          </button>
        )}
      </div>
    </div>
  )
}

/** STEP 1: Basic code, discountType, value, enabled. */
function StepOne({
                   couponData,
                   setCouponData,
                 }: {
  couponData: CouponWizardData;
  setCouponData: React.Dispatch<React.SetStateAction<CouponWizardData>>;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Stap 1: Vul de basisgegevens in (code, type, waarde, actief?).
      </p>

      {/* Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
        <input
          className="border p-2 rounded w-full"
          value={couponData.code}
          onChange={(e) =>
            setCouponData((prev) => ({ ...prev, code: e.target.value }))
          }
        />
      </div>

      {/* discountType */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type Korting
        </label>
        <select
          className="border p-2 rounded w-full"
          value={couponData.discountType}
          onChange={(e) =>
            setCouponData((prev) => ({
              ...prev,
              discountType: e.target.value as 'fixed' | 'percentage',
            }))
          }
        >
          <option value="fixed">Vast (€)</option>
          <option value="percentage">Percentage (%)</option>
        </select>
      </div>

      {/* value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Waarde
        </label>
        <input
          type="number"
          step="0.01"
          className="border p-2 rounded w-full"
          value={String(couponData.value)}
          onChange={(e) =>
            setCouponData((prev) => ({
              ...prev,
              value: parseFloat(e.target.value || '0'),
            }))
          }
        />
      </div>

      {/* enabled */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={couponData.enabled}
          onChange={(e) =>
            setCouponData((prev) => ({ ...prev, enabled: e.target.checked }))
          }
        />
        <label className="text-sm">Actief?</label>
      </div>
    </div>
  )
}

/** STEP 2: optional event + ticketType selection, usageLimit, date from/until, note. */
function StepTwo({
                   couponData,
                   setCouponData,
                   serverEvents,
                   serverTicketTypes,
                 }: {
  couponData: CouponWizardData;
  setCouponData: React.Dispatch<React.SetStateAction<CouponWizardData>>;
  serverEvents: SimpleEvent[];
  serverTicketTypes: SimpleTicketType[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Stap 2: Koppel eventueel aan event/tickettype, limieten en data.
      </p>

      {/* event */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event (optioneel)
        </label>
        <select
          className="border p-2 rounded w-full"
          value={couponData.event || ''}
          onChange={(e) =>
            setCouponData((prev) => ({ ...prev, event: e.target.value }))
          }
        >
          <option value="">--Geen--</option>
          {serverEvents.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title || `(Event #${ev.id})`}
            </option>
          ))}
        </select>
      </div>

      {/* ticketType */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          TicketType (optioneel)
        </label>
        <select
          className="border p-2 rounded w-full"
          value={couponData.ticketType || ''}
          onChange={(e) =>
            setCouponData((prev) => ({ ...prev, ticketType: e.target.value }))
          }
        >
          <option value="">--Geen--</option>
          {serverTicketTypes.map((tt) => (
            <option key={tt.id} value={tt.id}>
              {tt.name_nl || `(TicketType #${tt.id})`}
            </option>
          ))}
        </select>
      </div>

      {/* usageLimit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gebruikslimiet
        </label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          placeholder="Bijv. 5"
          value={couponData.usageLimit}
          onChange={(e) =>
            setCouponData((prev) => ({ ...prev, usageLimit: e.target.value }))
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Laat leeg voor geen limiet.
        </p>
      </div>

      {/* validFrom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Geldig vanaf (YYYY-MM-DD)
        </label>
        <input
          type="date"
          className="border p-2 rounded w-full"
          value={couponData.validFrom}
          onChange={(e) =>
            setCouponData((prev) => ({ ...prev, validFrom: e.target.value }))
          }
        />
      </div>

      {/* validUntil */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Geldig tot (YYYY-MM-DD)
        </label>
        <input
          type="date"
          className="border p-2 rounded w-full"
          value={couponData.validUntil}
          onChange={(e) =>
            setCouponData((prev) => ({ ...prev, validUntil: e.target.value }))
          }
        />
      </div>

      {/* note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Interne Notitie
        </label>
        <textarea
          rows={2}
          className="border p-2 rounded w-full"
          value={couponData.note}
          onChange={(e) =>
            setCouponData((prev) => ({ ...prev, note: e.target.value }))
          }
        />
      </div>
    </div>
  )
}

/** STEP 3: Confirm & submit. */
function StepConfirm({
                       couponData,
                       serverEvents,
                       serverTicketTypes,
                     }: {
  couponData: CouponWizardData;
  serverEvents: SimpleEvent[];
  serverTicketTypes: SimpleTicketType[];
}) {
  // We can resolve the event & ticketType from the arrays
  const chosenEvent = serverEvents.find((ev) => ev.id === couponData.event)
  const chosenTicketType = serverTicketTypes.find(
    (tt) => tt.id === couponData.ticketType,
  )

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <p>
        Stap 3: Controleer de gegevens en klik op <strong>Afronden</strong>.
      </p>
      <div className="bg-gray-50 p-3 rounded space-y-1">
        <p>
          <strong>Code:</strong> {couponData.code}
        </p>
        <p>
          <strong>Type:</strong>{' '}
          {couponData.discountType === 'fixed' ? 'Vast (€)' : 'Percentage (%)'}
        </p>
        <p>
          <strong>Waarde:</strong> {couponData.value.toFixed(2)}
        </p>
        <p>
          <strong>Actief?</strong> {couponData.enabled ? 'Ja' : 'Nee'}
        </p>
        <p>
          <strong>Event:</strong>{' '}
          {chosenEvent ? chosenEvent.title || `#${chosenEvent.id}` : '(geen)'}
        </p>
        <p>
          <strong>TicketType:</strong>{' '}
          {chosenTicketType
            ? chosenTicketType.name_nl || `#${chosenTicketType.id}`
            : '(geen)'}
        </p>
        <p>
          <strong>Gebruikslimiet:</strong>{' '}
          {couponData.usageLimit || '(geen limiet)'}
        </p>
        <p>
          <strong>Geldig vanaf:</strong>{' '}
          {couponData.validFrom || '(geen)'}
        </p>
        <p>
          <strong>Geldig tot:</strong> {couponData.validUntil || '(geen)'}
        </p>
        <p>
          <strong>Interne Notitie:</strong>{' '}
          {couponData.note || '(geen)'}
        </p>
      </div>
    </div>
  )
}

