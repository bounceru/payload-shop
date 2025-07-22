'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'
import dynamic from 'next/dynamic'
import { FaPen, FaPlus, FaTrash } from 'react-icons/fa'
import Switch from '@/app/(dashboard)/dashboard/components/form/switch/Switch'

// A shell layout with a top bar, "Save" & "Delete" buttons
import { DetailShell } from '@/app/(dashboard)/dashboard/components/ui/DetailShell'
// Simple section styling
import Section from '@/app/(app)/event/[slug]/components/Section'
// Optional seat map preview
import SeatAssignmentEditor from './SeatAssignmentEditor'
// Media library for uploading/picking images
import MediaLibrary, { MediaDoc } from '../../../components/shared/MediaLibrary'

const ClientOnlyTiptap = dynamic(() => import('../../../components/shared/ClientOnlyTiptap'), {
  ssr: false,
})

/** The shape for a media relationship */
interface MediaRelation {
  id?: string // the Payload media doc ID
  s3_url?: string
}

/** The sponsor array item: "logo" is a media relation or possibly null/string */
interface Sponsor {
  id?: string
  logo?: MediaRelation | null
}

/** The performer array item */
interface Performer {
  id?: string
  image?: MediaRelation | null
  stageName?: string
  realName?: string
}

/** Ticket type used for this event */
interface EventTicketType {
  id: string
  name: string
  price: number
  color?: string
}

/** A simple FAQ item */
interface FAQ {
  id?: string
  question?: string
  answer?: string
}

/** A "venue" from the shops collection */
interface VenueDoc {
  id: string
  name?: string
  company_details?: { company_name?: string }
  // ...
}

/** A seat map item from seatMaps collection */
interface SeatMapDoc {
  id: string
  name?: string
}

/** Possibly the top-level image or affiche field */
interface MediaObject {
  id?: string
  s3_url?: string
}

/** The overall Event shape from Payload's "events" collection */
interface EventDoc {
  id?: string
  title?: string
  date?: string // e.g. "2025-05-12T12:08:00.000Z"
  end?: string // e.g. "2025-05-12T14:08:00.000Z"
  type?: string
  venue?: string | VenueDoc
  introText?: string
  description?: string // store HTML
  googleMapsIframe?: string
  seatMap?: string | SeatMapDoc
  affiche?: string | MediaObject | null
  image?: string | MediaObject | null
  isPublished?: boolean
  embedAllowed?: boolean
  language?: string
  location?: string
  sponsors?: Sponsor[]
  performers?: Performer[]
  faqs?: FAQ[]

  ticketTypes?: EventTicketType[]
  seatAssignments?: Record<string, string>

  tenant?: string | { id: string }
}

/** For loading multiple docs from /api/payloadProxy/shops or seatMaps */
interface VenueResult {
  docs: VenueDoc[]
}

interface SeatMapResult {
  docs: SeatMapDoc[]
}

interface EventAdminDetailProps {
  event: EventDoc
  primaryColor: string
  /** True if creating a new event (so we do POST), else PATCH */
  isNew?: boolean
}

/**
 * A single-page form for editing an Event doc, preserving existing images
 * for sponsors & performers.
 */
export default function EventAdminDetail({
                                           event,
                                           primaryColor,
                                           isNew = false,
                                         }: EventAdminDetailProps) {
  const router = useRouter()

  // 1) Convert the server-supplied "event" into a local copy with IDs for images
  const [tempEvent, setTempEvent] = useState<EventDoc>(() => {
    const cloned = structuredClone(event)

    // Ensure sponsor logos are shaped like { id, s3_url }
    if (Array.isArray(cloned.sponsors)) {
      cloned.sponsors = cloned.sponsors.map((sp) => {
        // If sp.logo is an object, keep { id, s3_url }
        if (typeof sp.logo === 'object' && sp.logo) {
          return {
            ...sp,
            logo: {
              id: (sp.logo as any).id || undefined,
              s3_url: (sp.logo as any).s3_url || undefined,
            },
          }
        }
        return { ...sp, logo: null }
      })
    }

    // Ensure performer images are shaped similarly
    if (Array.isArray(cloned.performers)) {
      cloned.performers = cloned.performers.map((pf) => {
        if (pf.image && typeof pf.image === 'object') {
          return {
            ...pf,
            image: {
              id: (pf.image as any).id || undefined,
              s3_url: (pf.image as any).s3_url || undefined,
            },
          }
        }
        return { ...pf, image: null }
      })
    }

    // For top-level "image" or "affiche"
    if (cloned.image && typeof cloned.image === 'object') {
      cloned.image = {
        id: cloned.image.id || undefined,
        s3_url: cloned.image.s3_url || undefined,
      }
    }
    if (cloned.affiche && typeof cloned.affiche === 'object') {
      cloned.affiche = {
        id: cloned.affiche.id || undefined,
        s3_url: cloned.affiche.s3_url || undefined,
      }
    }

    if (!Array.isArray(cloned.ticketTypes)) {
      cloned.ticketTypes = []
    }
    if (!cloned.seatAssignments) {
      cloned.seatAssignments = {}
    }

    return cloned
  })

  // Tracks if anything changed, to enable "Save"
  const [isChanged, setIsChanged] = useState(false)

  // 2) For showing a loading spinner while we fetch
  const [isLoading, setIsLoading] = useState(true)

  // Relationship dropdown data
  const [venues, setVenues] = useState<VenueDoc[]>([])
  const [seatMaps, setSeatMaps] = useState<SeatMapDoc[]>([])

  // Media library booleans
  const [showImageLib, setShowImageLib] = useState(false)
  const [showAfficheLib, setShowAfficheLib] = useState(false)
  const [showSponsorLibIndex, setShowSponsorLibIndex] = useState<number | null>(null)
  const [showPerformerLibIndex, setShowPerformerLibIndex] = useState<number | null>(null)

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Tenant ID for the media library
  const tenantID =
    typeof tempEvent.tenant === 'string' ? tempEvent.tenant : tempEvent.tenant?.id || ''

  // 2) On mount => fetch possible "venue" shops and "seatMaps"
  useEffect(() => {
    const tID = typeof event.tenant === 'string' ? event.tenant : event.tenant?.id || ''

    ;(async () => {
      try {
        // fetch shops (venues)
        const venUrl = new URL('/api/payloadProxy/shops', window.location.origin)
        venUrl.searchParams.set('limit', '100')
        if (tID) venUrl.searchParams.set('tenantId', tID)
        const vRes = await fetch(venUrl.toString())
        const vData = (await vRes.json()) as VenueResult
        setVenues(vData.docs || [])

        // fetch seatMaps
        const smUrl = new URL('/api/payloadProxy/seatMaps', window.location.origin)
        smUrl.searchParams.set('limit', '100')
        if (tID) smUrl.searchParams.set('tenantId', tID)

        const smRes = await fetch(smUrl.toString())
        const smData = await smRes.json()
        setSeatMaps(smData.docs || [])
        // Done loading
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to fetch relationship data:', err)
        setIsLoading(false)
      }
    })()
  }, [event.tenant])

  // 3) Compare the original event => isChanged
  useEffect(() => {
    const original = JSON.stringify(event)
    const current = JSON.stringify(tempEvent)
    setIsChanged(original !== current)
  }, [tempEvent, event])

  // Field updaters
  function setFieldValue<T extends keyof EventDoc>(field: T, value: EventDoc[T]) {
    setTempEvent((prev) => ({ ...prev, [field]: value }))
  }

  function toggleFieldBoolean(field: keyof EventDoc) {
    setTempEvent((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // Sponsor array
  function addSponsor() {
    setTempEvent((prev) => ({
      ...prev,
      sponsors: [...(prev.sponsors || []), { logo: null }],
    }))
  }

  function removeSponsor(index: number) {
    const arr = [...(tempEvent.sponsors || [])]
    arr.splice(index, 1)
    setTempEvent((prev) => ({ ...prev, sponsors: arr }))
  }

  function handleSelectSponsorMedia(idx: number, doc: MediaDoc) {
    setTempEvent((prev) => {
      const arr = [...(prev.sponsors || [])]
      arr[idx] = { ...arr[idx], logo: { id: doc.id, s3_url: doc.s3_url } }
      return { ...prev, sponsors: arr }
    })
    setShowSponsorLibIndex(null)
  }

  // Performer array
  function addPerformer() {
    setTempEvent((prev) => ({
      ...prev,
      performers: [...(prev.performers || []), { stageName: 'New Performer', image: null }],
    }))
  }

  function removePerformer(index: number) {
    const arr = [...(tempEvent.performers || [])]
    arr.splice(index, 1)
    setTempEvent((prev) => ({ ...prev, performers: arr }))
  }

  function handleSelectPerformerMedia(idx: number, doc: MediaDoc) {
    setTempEvent((prev) => {
      const arr = [...(prev.performers || [])]
      arr[idx] = { ...arr[idx], image: { id: doc.id, s3_url: doc.s3_url } }
      return { ...prev, performers: arr }
    })
    setShowPerformerLibIndex(null)
  }

  // FAQ array
  function addFAQ() {
    setTempEvent((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: 'Nieuwe vraag?', answer: '' }],
    }))
  }

  function removeFAQ(index: number) {
    const arr = [...(tempEvent.faqs || [])]
    arr.splice(index, 1)
    setTempEvent((prev) => ({ ...prev, faqs: arr }))
  }

  // Ticket Types array
  const ticketColors = ['#3b82f6', '#f97316', '#a855f7']

  function addTicketType() {
    setTempEvent((prev) => {
      const count = prev.ticketTypes?.length || 0
      if (count >= ticketColors.length) return prev
      const arr = [
        ...(prev.ticketTypes || []),
        { id: `tt-${Date.now()}`, name: '', price: 0, color: ticketColors[count] },
      ]
      return { ...prev, ticketTypes: arr }
    })
  }

  function updateTicketType(idx: number, field: keyof EventTicketType, value: string | number) {
    const arr = [...(tempEvent.ticketTypes || [])]
    arr[idx] = { ...arr[idx], [field]: value } as EventTicketType
    setTempEvent((prev) => ({ ...prev, ticketTypes: arr }))
  }

  function removeTicketType(index: number) {
    const arr = [...(tempEvent.ticketTypes || [])]
    arr.splice(index, 1)
    setTempEvent((prev) => ({ ...prev, ticketTypes: arr }))
  }

  // Flatten & Save
  async function handleSave() {
    const isCreate = isNew || !tempEvent.id
    try {
      const endpoint = '/api/payloadProxy/events'
      const method = isCreate ? 'POST' : 'PATCH'

      const body: any = structuredClone(tempEvent)

      // Flatten top-level relationships
      if (typeof body.venue === 'object' && body.venue) {
        body.venue = body.venue.id
      }
      if (typeof body.seatMap === 'object' && body.seatMap) {
        body.seatMap = body.seatMap.id
      }
      // Flatten image, affiche
      if (typeof body.image === 'object' && body.image?.id) {
        body.image = body.image.id // the ID string
      } else if (!body.image) {
        // If user removed the image or never had one
        body.image = null
      }
      if (typeof body.affiche === 'object' && body.affiche?.id) {
        body.affiche = body.affiche.id
      } else if (!body.affiche) {
        body.affiche = null
      }

      // Flatten sponsors => set "logo" to string or null
      if (Array.isArray(body.sponsors)) {
        body.sponsors = body.sponsors.map((sp: Sponsor) => {
          if (sp.logo && typeof sp.logo === 'object' && sp.logo.id) {
            return { ...sp, logo: sp.logo.id }
          }
          return { ...sp, logo: null }
        })
      }
      // Flatten performers => set "image" to string or null
      if (Array.isArray(body.performers)) {
        body.performers = body.performers.map((pf: Performer) => {
          if (pf.image && pf.image.id) {
            return { ...pf, image: pf.image.id }
          }
          return { ...pf, image: null }
        })
      }

      // If editing existing
      if (!isCreate && body.id) {
        body.id = String(body.id)
      }

      console.log('Saving event with body:', body)

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(`Event ${isCreate ? 'creation' : 'update'} failed`)
      }
      const result = await res.json()
      const newID = result?.doc?.id || result.id
      if (!newID) throw new Error('No ID returned from server')

      toast.success('Event saved!')
      setIsChanged(false)

      if (isCreate) {
        router.push(`/dashboard/events/${newID}`)
      } else {
        // For an existing doc
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save event.')
    }
  }

  // Delete
  async function handleDelete() {
    if (!tempEvent.id) {
      toast.error('No ID to delete!')
      setShowDeleteModal(false)
      return
    }
    const ok = window.confirm(`Weet je zeker dat je "${tempEvent.title}" wilt verwijderen?`)
    if (!ok) {
      setShowDeleteModal(false)
      return
    }
    try {
      const delURL = `/api/payloadProxy/events?id=${tempEvent.id}`
      const res = await fetch(delURL, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Event deleted!')
      router.push('/dashboard/events')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete event')
    } finally {
      setShowDeleteModal(false)
    }
  }

  // Media library picks
  function handleSelectMedia(field: 'image' | 'affiche', doc: MediaDoc) {
    setTempEvent((prev) => ({
      ...prev,
      [field]: { id: doc.id, s3_url: doc.s3_url },
    }))
    if (field === 'image') setShowImageLib(false)
    if (field === 'affiche') setShowAfficheLib(false)
  }

  return (
    <>
      <Toaster position="top-center" />

      {/* Possibly a confirmation modal for deleting */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold">Delete Event</h2>
            <p className="text-sm text-gray-600">
              Weet je zeker dat je <strong>{tempEvent.title ?? '(unnamed)'} </strong>
              wilt verwijderen?
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
        title={isNew ? 'Evenement aanmaken' : `Bewerken: ${tempEvent.title ?? ''}`}
        description="Beheer van alle eventvelden."
        onBack={() => router.back()}
        onDelete={!isNew ? () => setShowDeleteModal(true) : undefined}
        onDeleteLabel="Verwijderen"
        onSave={handleSave}
        saveDisabled={!isChanged}
        saveLabel="Wijzigingen opslaan"
      >
        <div className="space-y-8">
          <Section title="Basisgegevens" primaryColor={primaryColor}>
            {/* Titel */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titel
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                value={tempEvent.title || ''}
                onChange={(e) => setFieldValue('title', e.target.value)}
              />
            </div>

            {/* Datum en Tijd */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Startdatum / Tijd
                </label>
                <input
                  type="datetime-local"
                  value={tempEvent.date?.slice(0, 16) || ''}
                  onChange={(e) => setFieldValue('date', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Einddatum / Tijd
                </label>
                <input
                  type="datetime-local"
                  value={tempEvent.end?.slice(0, 16) || ''}
                  onChange={(e) => setFieldValue('end', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type evenement
                </label>
                <select
                  value={tempEvent.type || ''}
                  onChange={(e) => setFieldValue('type', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">– Kies type –</option>
                  <option value="theater">Theater</option>
                  <option value="concert">Concert</option>
                  <option value="dance">Dans</option>
                  <option value="comedy">Comedy</option>
                  <option value="musical">Musical</option>
                  <option value="opera">Opera</option>
                  <option value="family">Familie</option>
                  <option value="talk">Lezing</option>
                  <option value="workshop">Workshop</option>
                  <option value="festival">Festival</option>
                  <option value="other">Anders</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              {/* Locatie */}
              <div className="flex-1 space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Locatie
                </label>
                <select
                  value={
                    typeof tempEvent.venue === 'object'
                      ? tempEvent.venue?.id
                      : tempEvent.venue || ''
                  }
                  onChange={(e) => {
                    const vID = e.target.value
                    const found = venues.find((v) => v.id === vID)
                    setFieldValue('venue', found || vID)
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">– Kies een locatie –</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zaalplan */}
              <div className="flex-1 space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Zaalplan
                </label>
                <select
                  value={
                    typeof tempEvent.seatMap === 'object'
                      ? tempEvent.seatMap.id
                      : tempEvent.seatMap || ''
                  }
                  onChange={(e) => {
                    const smID = e.target.value
                    const found = seatMaps.find((sm) => sm.id === smID)
                    setFieldValue('seatMap', found || smID)
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">– Geen zaalplan –</option>
                  {seatMaps.map((sm) => (
                    <option key={sm.id} value={sm.id}>
                      {sm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {/* isPublished */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gepubliceerd?
                </label>
                <Switch
                  defaultChecked={!!tempEvent.isPublished}
                  onChange={() => toggleFieldBoolean('isPublished')}
                />
              </div>

              {/* embedAllowed */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Embed toegestaan?
                </label>
                <Switch
                  defaultChecked={!!tempEvent.embedAllowed}
                  onChange={() => toggleFieldBoolean('embedAllowed')}
                />
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Taal
                </label>
                <select
                  value={tempEvent.language || 'nl'}
                  onChange={(e) => setFieldValue('language', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="nl">Nederlands</option>
                  <option value="fr">Frans</option>
                  <option value="en">Engels</option>
                  <option value="de">Duits</option>
                </select>
              </div>

              {/* Location / Regio */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Locatie / Regio
                </label>
                <select
                  value={tempEvent.location || ''}
                  onChange={(e) => setFieldValue('location', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">–</option>
                  <option value="Antwerpen">Antwerpen</option>
                  <option value="Vlaams-Brabant">Vlaams-Brabant</option>
                  <option value="Waals-Brabant">Waals-Brabant</option>
                  <option value="West-Vlaanderen">West-Vlaanderen</option>
                  <option value="Oost-Vlaanderen">Oost-Vlaanderen</option>
                  <option value="Henegouwen">Henegouwen</option>
                  <option value="Luik">Luik</option>
                  <option value="Limburg">Limburg</option>
                  <option value="Luxemburg">Luxemburg</option>
                  <option value="Namen">Namen</option>
                  <option value="Brussels Hoofdstedelijk Gewest">
                    Brussels Hoofdstedelijk Gewest
                  </option>
                </select>
              </div>
            </div>

            {/* Introductietekst */}
            <div className="mt-6 space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Introductietekst
              </label>
              <textarea
                rows={3}
                value={tempEvent.introText || ''}
                onChange={(e) => setFieldValue('introText', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Google Maps Iframe */}
            <div className="mt-4 space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Google Maps Iframe
              </label>
              <textarea
                rows={3}
                value={tempEvent.googleMapsIframe || ''}
                onChange={(e) => setFieldValue('googleMapsIframe', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Beschrijving */}
            <div className="mt-4 space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Beschrijving
              </label>
              <ClientOnlyTiptap
                value={tempEvent.description || '<p>Start met typen...</p>'}
                onChange={(html) =>
                  setTempEvent((prev) => ({
                    ...prev,
                    description: html,
                  }))
                }
              />
            </div>
          </Section>

          <Section title="Afbeeldingen" primaryColor={primaryColor}>
            {/* IMAGES: Banner + Affiche */}
            <div className="grid grid-cols-2 gap-4">
              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium mb-1">Header Image</label>
                {typeof tempEvent.image === 'object' && tempEvent.image?.s3_url ? (
                  <div className="relative w-48 h-32 border rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={tempEvent.image.s3_url}
                      alt="banner"
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => setShowImageLib(true)}
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:shadow transition"
                      title="Edit banner"
                    >
                      <FaPen className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setFieldValue('image', null)}
                      className="absolute top-2 right-10 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/80 text-red-600 hover:bg-white hover:shadow transition"
                      title="Remove banner"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-48 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer"
                    onClick={() => setShowImageLib(true)}
                  >
                    <FaPlus className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Affiche */}
              <div>
                <label className="block text-sm font-medium mb-1">Affiche</label>
                {typeof tempEvent.affiche === 'object' && tempEvent.affiche?.s3_url ? (
                  <div className="relative w-48 h-32 border rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={tempEvent.affiche.s3_url}
                      alt="affiche"
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => setShowAfficheLib(true)}
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:shadow transition"
                      title="Edit affiche"
                    >
                      <FaPen className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setFieldValue('affiche', null)}
                      className="absolute top-2 right-10 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/80 text-red-600 hover:bg-white hover:shadow transition"
                      title="Remove affiche"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-48 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer"
                    onClick={() => setShowAfficheLib(true)}
                  >
                    <FaPlus className="h-5 w-5" />
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Sponsors */}
          <Section title="Sponsors" primaryColor={primaryColor}>
            <div className="flex flex-wrap gap-6">
              {(tempEvent.sponsors || []).map((sp, idx) => (
                <div
                  key={sp.id || idx}
                  className="relative w-24 h-24 border border-gray-200 rounded flex items-center justify-center"
                >
                  {typeof sp.logo === 'object' && sp.logo?.s3_url ? (
                    <img
                      src={sp.logo.s3_url}
                      alt="Sponsor Logo"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">No Logo</p>
                  )}

                  <button
                    onClick={() => setShowSponsorLibIndex(idx)}
                    className="absolute top-2 right-8 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition"
                    title="Edit Sponsor Logo"
                  >
                    <FaPen className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeSponsor(idx)}
                    className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/80 text-red-500 hover:bg-white hover:shadow transition"
                    title="Remove Sponsor"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {/* +Add sponsor */}
              <div
                onClick={addSponsor}
                className="group cursor-pointer relative w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition"
              >
                <FaPlus className="h-5 w-5" />
              </div>
            </div>
          </Section>

          {/* Performers */}
          <Section title="Performers" primaryColor={primaryColor}>
            <div className="flex flex-wrap gap-6">
              {(tempEvent.performers || []).map((pf, idx) => (
                <div
                  key={pf.id || idx}
                  className="relative w-36 border border-gray-200 rounded p-2 flex flex-col items-center"
                >
                  {pf.image?.s3_url ? (
                    <img
                      src={pf.image.s3_url}
                      alt={pf.stageName || 'Performer'}
                      className="object-cover w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 border-2 border-dashed rounded-full flex items-center justify-center text-gray-400 text-sm">
                      No Photo
                    </div>
                  )}

                  <button
                    onClick={() => setShowPerformerLibIndex(idx)}
                    className="absolute top-2 right-8 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition"
                    title="Change Performer Photo"
                  >
                    <FaPen className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removePerformer(idx)}
                    className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/80 text-red-500 hover:bg-white hover:shadow transition"
                    title="Remove Performer"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>

                  <label className="text-sm font-semibold mt-2 w-full">
                    <span>Stage Name</span>
                    <input
                      value={pf.stageName || ''}
                      onChange={(e) => {
                        const arr = [...(tempEvent.performers || [])]
                        arr[idx] = { ...arr[idx], stageName: e.target.value }
                        setTempEvent((prev) => ({ ...prev, performers: arr }))
                      }}
                      className="border rounded w-full text-sm mt-1 px-2 py-1"
                    />
                  </label>
                  <label className="text-sm mt-2 w-full">
                    <span>Real Name</span>
                    <input
                      value={pf.realName || ''}
                      onChange={(e) => {
                        const arr = [...(tempEvent.performers || [])]
                        arr[idx] = { ...arr[idx], realName: e.target.value }
                        setTempEvent((prev) => ({ ...prev, performers: arr }))
                      }}
                      className="border rounded w-full text-sm mt-1 px-2 py-1"
                    />
                  </label>
                </div>
              ))}
              {/* +Add performer */}
              <div
                onClick={addPerformer}
                className="group cursor-pointer w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition"
              >
                <FaPlus className="h-5 w-5" />
              </div>
            </div>
          </Section>

          {/* FAQs */}
          <Section title="FAQs" primaryColor={primaryColor}>
            <div className="space-y-4">
              {(tempEvent.faqs || []).map((faq, idx) => (
                <div key={faq.id || idx} className="border p-3 rounded shadow-sm relative">
                  <label className="block text-sm font-semibold text-gray-800">Question</label>
                  <input
                    value={faq.question || ''}
                    onChange={(e) => {
                      const arr = [...(tempEvent.faqs || [])]
                      arr[idx] = { ...arr[idx], question: e.target.value }
                      setTempEvent((prev) => ({ ...prev, faqs: arr }))
                    }}
                    className="border rounded p-2 w-full mb-2"
                  />

                  <label className="block text-sm font-semibold text-gray-800">Answer</label>
                  <textarea
                    rows={3}
                    value={faq.answer || ''}
                    onChange={(e) => {
                      const arr = [...(tempEvent.faqs || [])]
                      arr[idx] = { ...arr[idx], answer: e.target.value }
                      setTempEvent((prev) => ({ ...prev, faqs: arr }))
                    }}
                    className="border rounded p-2 w-full"
                  />

                  <button
                    onClick={() => removeFAQ(idx)}
                    className="absolute bottom-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/80 text-red-500 hover:bg-white hover:shadow transition"
                    title="Remove FAQ"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addFAQ}
              className="mt-2 inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded text-sm text-gray-600 hover:bg-gray-200"
            >
              <FaPlus className="h-3 w-3" />
              Add FAQ
            </button>
          </Section>

          {typeof tempEvent.seatMap === 'object' && tempEvent.seatMap?.id && (
            <Section title="Tickettypes" primaryColor={primaryColor}>
              <div className="space-y-2">
                {(tempEvent.ticketTypes || []).map((tt, idx) => (
                  <div key={tt.id || idx} className="flex gap-2 items-end">
                    <input
                      className="border rounded p-1 text-sm flex-1"
                      placeholder="ID"
                      value={tt.id}
                      onChange={(e) => updateTicketType(idx, 'id', e.target.value)}
                    />
                    <input
                      className="border rounded p-1 text-sm flex-1"
                      placeholder="Naam"
                      value={tt.name}
                      onChange={(e) => updateTicketType(idx, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      className="border rounded p-1 w-24 text-sm"
                      placeholder="Prijs"
                      value={tt.price}
                      onChange={(e) => updateTicketType(idx, 'price', parseFloat(e.target.value))}
                    />
                    <span
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: tt.color || '#ccc' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeTicketType(idx)}
                      className="text-red-600 text-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTicketType}
                  disabled={(tempEvent.ticketTypes?.length || 0) >= ticketColors.length}
                  className="mt-2 inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                >
                  <FaPlus className="h-3 w-3" />
                  Add Ticket Type
                </button>
              </div>
            </Section>
          )}

          {/* seatMap preview if seatMap is selected */}
          {typeof tempEvent.seatMap === 'object' && tempEvent.seatMap?.id && (
            <Section title="Stoelselectie" primaryColor={primaryColor}>
              <SeatAssignmentEditor
                seatMap={tempEvent.seatMap}
                ticketTypes={tempEvent.ticketTypes || []}
                assignments={tempEvent.seatAssignments || {}}
                onChange={(a) => setFieldValue('seatAssignments', a)}
                onTicketTypesChange={(tt) => setFieldValue('ticketTypes', tt)}
              />
            </Section>
          )}
        </div>
      </DetailShell>

      {/* =========== Media Libraries =========== */}
      {/* Banner image */}
      {showImageLib && (
        <MediaLibrary
          tenantID={tenantID}
          isOpen
          onClose={() => setShowImageLib(false)}
          onSelect={(doc) => handleSelectMedia('image', doc)}
          allowUpload
        />
      )}
      {/* Affiche */}
      {showAfficheLib && (
        <MediaLibrary
          tenantID={tenantID}
          isOpen
          onClose={() => setShowAfficheLib(false)}
          onSelect={(doc) => handleSelectMedia('affiche', doc)}
          allowUpload
        />
      )}
      {/* Sponsor logo */}
      {showSponsorLibIndex !== null && (
        <MediaLibrary
          tenantID={tenantID}
          isOpen
          onClose={() => setShowSponsorLibIndex(null)}
          onSelect={(doc) => handleSelectSponsorMedia(showSponsorLibIndex, doc)}
          allowUpload
        />
      )}
      {/* Performer image */}
      {showPerformerLibIndex !== null && (
        <MediaLibrary
          tenantID={tenantID}
          isOpen
          onClose={() => setShowPerformerLibIndex(null)}
          onSelect={(doc) => handleSelectPerformerMedia(showPerformerLibIndex, doc)}
          allowUpload
        />
      )}
    </>
  )
}
