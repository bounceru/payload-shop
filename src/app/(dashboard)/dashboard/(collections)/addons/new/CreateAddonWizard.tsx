'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'

// If you have a MediaLibrary for images
import MediaLibrary, { MediaDoc } from '@/app/(dashboard)/dashboard/components/shared/MediaLibrary'

/** Minimal shape for one event. */
interface SimpleEvent {
  id: string
  title: string
}

/** Wizard state shape, including `events: string[]` for the chosen event IDs. */
interface AddonWizardData {
  tenant: string
  name: string
  price: number
  available: boolean
  isPerTicket: boolean
  maxQuantity: string
  description: string
  image?: { id: string; s3_url?: string }
  events: string[]  // store event IDs here
}

interface CreateAddonWizardProps {
  initialTenantId: string
  serverEvents: SimpleEvent[]  // passed from server
}

export default function CreateAddonWizardWithEvents({
                                                      initialTenantId,
                                                      serverEvents,
                                                    }: CreateAddonWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showMediaLib, setShowMediaLib] = useState(false)

  // Initialize wizard data
  const [addonData, setAddonData] = useState<AddonWizardData>(() => ({
    tenant: initialTenantId,
    name: '',
    price: 0,
    available: true,
    isPerTicket: false,
    maxQuantity: '',
    description: '',
    image: undefined,
    events: [],  // user picks from `serverEvents`
  }))

  /** Move to next step, do minimal validation. */
  function nextStep() {
    if (step === 1) {
      if (!addonData.name.trim()) {
        toast.error('Naam is verplicht.')
        return
      }
      if (addonData.price < 0) {
        toast.error('Prijs kan niet negatief zijn.')
        return
      }
    }
    setStep((prev) => prev + 1)
  }

  function prevStep() {
    setStep((prev) => prev - 1)
  }

  /** Final step => POST to create the new Add-On. */
  async function handleFinish() {
    try {
      // Flatten relationships
      const bodyToSend: any = { ...addonData }

      // Convert maxQuantity from string -> number if not empty
      if (bodyToSend.maxQuantity.trim()) {
        bodyToSend.maxQuantity = parseInt(bodyToSend.maxQuantity, 10)
      } else {
        delete bodyToSend.maxQuantity
      }

      // Flatten image if present
      if (bodyToSend.image?.id) {
        bodyToSend.image = bodyToSend.image.id
      } else {
        delete bodyToSend.image
      }

      // `events` is already an array of IDs

      const res = await fetch('/api/payloadProxy/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      })
      if (!res.ok) {
        throw new Error('Aanmaken van add-on is mislukt.')
      }
      const result = await res.json()
      const newID = result?.doc?.id || result.id
      if (!newID) {
        throw new Error('Geen geldig ID van server.')
      }

      toast.success('Add-On succesvol aangemaakt!')
      router.push(`/dashboard/addons/${newID}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Kon nieuwe add-on niet aanmaken.')
    }
  }

  /** If user picks a media doc in the library. */
  function handleSelectMedia(doc: MediaDoc) {
    setAddonData((prev) => ({
      ...prev,
      image: { id: doc.id, s3_url: doc.s3_url },
    }))
    setShowMediaLib(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 border border-gray-200 bg-white p-6 shadow-sm">
      <Toaster position="top-center" />
      <h2 className="text-xl font-semibold text-gray-800">
        Nieuwe Add-On – Stap {step} van 3
      </h2>

      {step === 1 && (
        <StepOne addonData={addonData} setAddonData={setAddonData} />
      )}
      {step === 2 && (
        <StepTwo
          addonData={addonData}
          setAddonData={setAddonData}
          onShowMediaLib={() => setShowMediaLib(true)}
          allEvents={serverEvents}
        />
      )}
      {step === 3 && (
        <StepConfirm addonData={addonData} allEvents={serverEvents} />
      )}

      {/* Footer nav */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            Terug
          </button>
        ) : <div />}

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

      {/* Media library */}
      {showMediaLib && (
        <MediaLibrary
          tenantID={addonData.tenant}
          isOpen
          allowUpload
          onClose={() => setShowMediaLib(false)}
          onSelect={handleSelectMedia}
        />
      )}
    </div>
  )
}

/** Step 1: Basic name & price. */
function StepOne({
                   addonData,
                   setAddonData,
                 }: {
  addonData: AddonWizardData
  setAddonData: React.Dispatch<React.SetStateAction<AddonWizardData>>
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Stap 1: Vul de basisgegevens in (naam & prijs).
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
        <input
          className="border p-2 rounded w-full"
          value={addonData.name}
          onChange={(e) =>
            setAddonData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prijs (€)
        </label>
        <input
          type="number"
          step="0.01"
          className="border p-2 rounded w-full"
          value={addonData.price}
          onChange={(e) =>
            setAddonData((prev) => ({
              ...prev,
              price: parseFloat(e.target.value || '0'),
            }))
          }
        />
      </div>
    </div>
  )
}

/** Step 2: Additional settings, pick events, and optional image. */
function StepTwo({
                   addonData,
                   setAddonData,
                   onShowMediaLib,
                   allEvents,
                 }: {
  addonData: AddonWizardData
  setAddonData: React.Dispatch<React.SetStateAction<AddonWizardData>>
  onShowMediaLib: () => void
  allEvents: { id: string; title: string }[]
}) {
  /** Toggle a single event ID in `addonData.events` array. */
  function toggleEventSelection(eventID: string) {
    setAddonData((prev) => {
      const already = prev.events.includes(eventID)
      if (already) {
        return { ...prev, events: prev.events.filter((id) => id !== eventID) }
      } else {
        return { ...prev, events: [...prev.events, eventID] }
      }
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Stap 2: Extra instellingen en koppel events.
      </p>

      {/* Available? */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={addonData.available}
          onChange={(e) =>
            setAddonData((prev) => ({ ...prev, available: e.target.checked }))
          }
        />
        <label className="text-sm">Beschikbaar?</label>
      </div>

      {/* isPerTicket */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={addonData.isPerTicket}
          onChange={(e) =>
            setAddonData((prev) => ({
              ...prev,
              isPerTicket: e.target.checked,
            }))
          }
        />
        <label className="text-sm">Per Ticket?</label>
      </div>

      {/* maxQuantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max. Aantal Per Bestelling
        </label>
        <input
          type="number"
          min="0"
          placeholder="Bijv. 5"
          className="border p-2 rounded w-full"
          value={addonData.maxQuantity}
          onChange={(e) =>
            setAddonData((prev) => ({ ...prev, maxQuantity: e.target.value }))
          }
        />
        <p className="text-xs text-gray-500 mt-1">Laat leeg voor geen limiet.</p>
      </div>

      {/* description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Omschrijving
        </label>
        <textarea
          rows={2}
          className="border p-2 rounded w-full"
          value={addonData.description}
          onChange={(e) =>
            setAddonData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      {/* events multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Koppel aan welke events?
        </label>
        {allEvents.length === 0 ? (
          <p className="text-sm text-gray-500">Geen events gevonden.</p>
        ) : (
          <div className="space-y-1 border p-2 rounded max-h-44 overflow-auto">
            {allEvents.map((ev) => {
              const isSelected = addonData.events.includes(ev.id)
              return (
                <label key={ev.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleEventSelection(ev.id)}
                  />
                  <span>{ev.title || `(Event #${ev.id})`}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Optional image pick */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Afbeelding
        </label>
        {addonData.image ? (
          <div className="relative w-32 h-32 border rounded flex items-center justify-center overflow-hidden">
            <img
              src={addonData.image.s3_url}
              alt="AddOn"
              className="object-cover w-full h-full"
            />
            <button
              onClick={onShowMediaLib}
              className="absolute top-2 right-2 bg-white/80 text-gray-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow"
              title="Wijzig afbeelding"
            >
              ✎
            </button>
            <button
              onClick={() =>
                setAddonData((prev) => ({ ...prev, image: undefined }))
              }
              className="absolute bottom-2 right-2 bg-white/80 text-red-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow"
              title="Verwijder afbeelding"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onClick={onShowMediaLib}
            className="cursor-pointer w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400"
          >
            + Foto
          </div>
        )}
      </div>
    </div>
  )
}

/** Step 3: Confirm & Submit */
function StepConfirm({
                       addonData,
                       allEvents,
                     }: {
  addonData: AddonWizardData
  allEvents: SimpleEvent[]
}) {
  // Convert the chosen event IDs into event titles for display
  const chosenEvents = addonData.events.map((id) => {
    const found = allEvents.find((ev) => ev.id === id)
    return found ? found.title || `#${id}` : `#${id}`
  })

  return (
    <div className="space-y-4 text-sm text-gray-800">
      <p>
        Stap 3: Controleer de gegevens en klik op <strong>Afronden</strong>.
      </p>
      <div className="bg-gray-50 p-3 rounded space-y-1 text-gray-700">
        <p><strong>Naam:</strong> {addonData.name}</p>
        <p><strong>Prijs:</strong> €{addonData.price.toFixed(2)}</p>
        <p><strong>Beschikbaar?</strong> {addonData.available ? 'Ja' : 'Nee'}</p>
        <p><strong>Per Ticket?</strong> {addonData.isPerTicket ? 'Ja' : 'Nee'}</p>
        <p>
          <strong>Max. Aantal:</strong>{' '}
          {addonData.maxQuantity || '(geen limiet)'}
        </p>
        <p>
          <strong>Omschrijving:</strong>{' '}
          {addonData.description || '(geen)'}
        </p>
        <p>
          <strong>Afbeelding:</strong>{' '}
          {addonData.image ? `Media ID: ${addonData.image.id}` : '(geen)'}
        </p>
        <p>
          <strong>Gekoppelde Events:</strong>{' '}
          {chosenEvents.length > 0 ? chosenEvents.join(', ') : '(geen events)'}
        </p>
      </div>
    </div>
  )
}
