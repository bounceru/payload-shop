'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'

type CreateEventWizardProps = {
  initialTenantId?: string;
};

export default function CreateEventWizard({ initialTenantId = '' }: CreateEventWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [eventData, setEventData] = useState({
    tenant: initialTenantId,
    title: '',
    date: '',
    end: '',
    venue: '',
    seatMap: '',
    isPublished: false,
  })

  function nextStep() {
    if (step === 1 && (!eventData.title || !eventData.date)) {
      toast.error('Vul minstens een titel en startdatum/tijd in.')
      return
    }
    setStep((prev) => prev + 1)
  }

  function prevStep() {
    setStep((prev) => prev - 1)
  }

  async function handleFinish() {
    try {
      const res = await fetch('/api/payloadProxy/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      if (!res.ok) throw new Error('Evenement aanmaken mislukt')

      const result = await res.json()
      const newID = result?.doc?.id || result.id
      if (!newID) throw new Error('Geen ID terug van server')

      toast.success('Evenement succesvol aangemaakt!')
      router.push(`/dashboard/events/${newID}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Er ging iets mis')
    }
  }

  return (
    <div
      className="max-w-xl mx-auto space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Nieuw evenement – Stap {step} van 3</h2>

      {step === 1 && <StepOne eventData={eventData} setEventData={setEventData} />}
      {step === 2 && <StepTwo eventData={eventData} setEventData={setEventData} />}
      {step === 3 && <StepConfirm eventData={eventData} />}

      <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-white/[0.05]">
        {step > 1 ? (
          <button onClick={prevStep}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">
            Terug
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button onClick={nextStep}
                  className="rounded-lg bg-stagepasssecondary px-4 py-2 text-sm text-white hover:bg-stagepasssecondary-700 hover:scale-105">
            Volgende
          </button>
        ) : (
          <button onClick={handleFinish}
                  className="rounded-lg bg-stagepasssecondary px-4 py-2 text-sm text-white hover:bg-stagepasssecondary-700 hover:scale-105">
            Afronden
          </button>
        )}
      </div>
    </div>
  )
}

function StepOne({ eventData, setEventData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titel</label>
        <input
          type="text"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          value={eventData.title}
          onChange={(e) => setEventData((prev: any) => ({ ...prev, title: e.target.value }))}
          placeholder="Titel van het evenement"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Startdatum en tijd</label>
        <input
          type="datetime-local"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          value={eventData.date}
          onChange={(e) => setEventData((prev: any) => ({ ...prev, date: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Einddatum en tijd
          (optioneel)</label>
        <input
          type="datetime-local"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          value={eventData.end}
          onChange={(e) => setEventData((prev: any) => ({ ...prev, end: e.target.value }))}
        />
      </div>
    </div>
  )
}

function StepTwo({ eventData, setEventData }: any) {
  const [shops, setShops] = useState<{ id: string; name: string }[]>([])
  const [seatMaps, setSeatMaps] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        const tenantId = eventData.tenant
        if (!tenantId) return

        const shopRes = await fetch(`/api/payloadProxy/shops?tenantId=${tenantId}&limit=100`)
        const smRes = await fetch(`/api/payloadProxy/seatMaps?tenantId=${tenantId}&limit=100`)
        const shopData = await shopRes.json()
        const smData = await smRes.json()

        if (isMounted) {
          setShops(shopData.docs || [])
          setSeatMaps(smData.docs || [])
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        toast.error('Fout bij het laden van locaties of zaalplannen.')
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [eventData.tenant])

  if (loading) {
    return <p className="text-sm text-gray-500">Laden...</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <Toaster position="top-center" />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Locatie (shop)</label>
        <select
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          value={eventData.venue}
          onChange={(e) => setEventData((prev: any) => ({ ...prev, venue: e.target.value }))}
        >
          <option value="">— Selecteer een locatie —</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zaalplan (optioneel)</label>
        <select
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          value={eventData.seatMap}
          onChange={(e) => setEventData((prev: any) => ({ ...prev, seatMap: e.target.value }))}
        >
          <option value="">— Geen zaalplan —</option>
          {seatMaps.map((map) => (
            <option key={map.id} value={map.id}>{map.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          checked={eventData.isPublished}
          onChange={() => setEventData((prev: any) => ({ ...prev, isPublished: !prev.isPublished }))}
        />
        <label className="text-sm text-gray-700 dark:text-gray-300">Meteen publiceren?</label>
      </div>
    </div>
  )
}

function StepConfirm({ eventData }: { eventData: any }) {
  return (
    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Overzicht evenement</h4>
        <p><strong>Titel:</strong> {eventData.title}</p>
        <p><strong>Start:</strong> {eventData.date}</p>
        <p><strong>Einde:</strong> {eventData.end || '—'}</p>
        <p><strong>Locatie:</strong> {eventData.venue || '—'}</p>
        <p><strong>Zaalplan:</strong> {eventData.seatMap || '—'}</p>
        <p><strong>Gepubliceerd:</strong> {eventData.isPublished ? 'Ja' : 'Nee'}</p>
      </div>
    </div>
  )
}
