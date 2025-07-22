'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'
import Image from 'next/image'

import { DetailShell } from '@/app/(dashboard)/dashboard/components/ui/DetailShell'

/** Row/column label formats */
type FormatOption = 'Numeric' | 'Letter' | 'RNumber' | 'RowNumber' | 'Continuous';


/** Representation of a seat. */
export type Seat = {
  id?: string;
  pinnedRow: number;
  pinnedCol: number;
  row: string;
  seat: string;

  lockedRowLabel?: boolean;
  lockedSeatLabel?: boolean;

  ticketType: string;
  priceModifier?: number | null;
  status?: string | null;
  locks?: { eventId: string; lockedUntil: string }[];
  purpose?: 'none' | 'techniek' | 'ingang' | 'nooduitgang' | 'handicap';
  groupLabel?: string;
  groupReleaseOrder?: number;
  groupMinToReleaseNext?: number;
};

export interface SeatMap {
  id?: string;
  name: string;
  rows: number;
  columns: number;
  basePrice?: number;
  curve?: number;
  isDefault?: boolean;
  seats?: Seat[];
  groupReleaseOrder?: number;
  groupMinToReleaseNext?: number;
  venue?: string | { id: string; name: string };
  tenant?: string | { id: string };
  rowFormat?: string;
  colFormat?: string;
}

export interface Shop {
  id: string;
  name: string;
}

interface SeatMapAdminDetailProps {
  seatMap: SeatMap;
  isNew?: boolean;
}

/** Modal for editing a single seat's details */
function SeatEditModal({
                         seat,
                         onClose,
                         onSave,
                       }: {
  seat: Seat;
  onClose: () => void;
  onSave: (updatedSeat: Seat) => void;
}) {
  const [rowLabel, setRowLabel] = useState(seat.row || '')
  const [seatLabel, setSeatLabel] = useState(seat.seat || '')
  const [status, setStatus] = useState(seat.status || 'Seat')
  const [purpose, setPurpose] = useState(seat.purpose || 'none')
  const [groupLabel, setGroupLabel] = useState(seat.groupLabel || '')


  function handleSave() {
    const updated: Seat = { ...seat }
    if (rowLabel.trim() !== seat.row) updated.lockedRowLabel = true
    if (seatLabel.trim() !== seat.seat) updated.lockedSeatLabel = true

    updated.row = rowLabel.trim()
    updated.seat = seatLabel.trim()
    updated.status = status
    updated.purpose = purpose as Seat['purpose']
    updated.groupLabel = groupLabel.trim() || ''

    onSave(updated)
  }


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md max-w-sm w-full space-y-4">
        <h2 className="text-lg font-semibold">Stoel bewerken</h2>

        {/* Row Label */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Rijlabel</label>
          <input
            type="text"
            className="border rounded p-2"
            value={rowLabel}
            onChange={(e) => setRowLabel(e.target.value)}
          />
        </div>

        {/* Seat Label */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Stoellabel</label>
          <input
            type="text"
            className="border rounded p-2"
            value={seatLabel}
            onChange={(e) => setSeatLabel(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Status</label>
          <select
            className="border rounded p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Seat">Stoel</option>
            <option value="Empty">Leeg</option>
            <option value="Hallway">Gang</option>
            <option value="Stage">Podium</option>
            <option value="Sold">Verkocht</option>
          </select>
        </div>


        {/* Purpose */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Doel</label>
          <select
            className="border rounded p-2"
            value={purpose}
            onChange={(e) =>
              setPurpose(
                (e.target.value as Seat['purpose']) || 'none',
              )
            }
          >
            <option value="none">geen</option>
            <option value="techniek">techniek</option>
            <option value="ingang">ingang</option>
            <option value="nooduitgang">nooduitgang</option>
            <option value="handicap">handicap</option>
          </select>
        </div>

        {/* Group Label */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Groepslabel</label>
          <input
            type="text"
            className="border rounded p-2"
            value={groupLabel}
            onChange={(e) => setGroupLabel(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  )
}


export default function SeatMapAdminDetail({ seatMap, isNew = false }: SeatMapAdminDetailProps) {
  const router = useRouter()

  // Basic seat‐map fields
  const [name, setName] = useState(seatMap.name || '')
  const [venueId, setVenueId] = useState(
    typeof seatMap.venue === 'object' ? seatMap.venue.id : String(seatMap.venue || ''),
  )
  const [rows, setRows] = useState(seatMap.rows || 0)
  const [columns, setColumns] = useState(seatMap.columns || 0)
  const [basePrice, setBasePrice] = useState(seatMap.basePrice || 0)
  const [curve, setCurve] = useState(seatMap.curve ?? 24)
  const [isDefault, setIsDefault] = useState<boolean>(seatMap.isDefault || false)

  // seatMap-level gating
  const [groupReleaseOrder, setGroupReleaseOrder] = useState<number>(
    seatMap.groupReleaseOrder ?? 0,
  )
  const [groupMinToReleaseNext, setGroupMinToReleaseNext] = useState<number>(
    seatMap.groupMinToReleaseNext ?? 0,
  )

  const [rowFormat, setRowFormat] = useState<FormatOption>(
    (seatMap.rowFormat as FormatOption) || 'Numeric',
  )
  const [colFormat, setColFormat] = useState<FormatOption>(
    (seatMap.colFormat as FormatOption) || 'Numeric',
  )

  // The seat array
  const [seats, setSeats] = useState<Seat[]>(() => {
    const raw = seatMap.seats || []
    return normalizeAndSortSeats(
      raw.map((s) => ({
        ...s,
        id: s.id ?? undefined,
        pinnedRow: s.pinnedRow || 1,
        pinnedCol: s.pinnedCol || 1,
        row: s.row || '',
        seat: s.seat || '',
        lockedRowLabel: s.lockedRowLabel || false,
        lockedSeatLabel: s.lockedSeatLabel || false,
        locks: s.locks || [],
        purpose: s.purpose ?? 'none',
        groupLabel: s.groupLabel ?? '',
        groupReleaseOrder: s.groupReleaseOrder ?? 0,
        groupMinToReleaseNext: s.groupMinToReleaseNext ?? 0,
      })),
    )
  })

  // Fetched from server
  const [allVenues, setAllVenues] = useState<Shop[]>([])

  // For seat editing
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Track if doc changed => toggles "Save"
  const [isChanged, setIsChanged] = useState(false)

  // Row/col selection + seat selection
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set())
  const [rowSelected, setRowSelected] = useState<boolean[]>(
    Array.from({ length: rows }, () => false),
  )
  const [colSelected, setColSelected] = useState<boolean[]>(
    Array.from({ length: columns }, () => false),
  )

  // “Edit Selection” modal
  const [showSelectionModal, setShowSelectionModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('Seat')
  const [selectedPurpose, setSelectedPurpose] = useState<string>('')
  const [selectedGroupLabel, setSelectedGroupLabel] = useState<string>('')

  // -------------- Snippet: Template states & modals --------------
  const [showImportModal, setShowImportModal] = useState(false)
  const [templatesList, setTemplatesList] = useState<any[]>([]) // array of seat-map-templates
  const [selectedTemplateID, setSelectedTemplateID] = useState<string>('')

  // -------------- State for Save-as-Template modal --------------
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState<string>(name + ' (Template Copy)')


  /**
   * Called when user clicks "Save as Template" (and confirms in the modal).
   */
  async function handleSaveAsTemplateConfirmed() {
    try {
      // Optionally “finalRenumber” seats:
      const finalSeats = finalRenumberSeats([...seats], rowFormat, colFormat)

      const templateBody = {
        name: templateName, // <-- use the custom name
        rows,
        columns,
        basePrice,
        curve,
        rowFormat,
        colFormat,
        seats: finalSeats,
        // isPublic: false, or tenant, etc...
      }

      const res = await fetch('/api/payloadProxy/seat-map-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateBody),
      })
      if (!res.ok) {
        throw new Error('Failed to create template.')
      }

      toast.success('Saved current seat map as a template!')
      setShowTemplateModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Could not save as template')
    }
  }

  /**
   * Called when user clicks "Save as Template" button
   */
  async function handleSaveAsTemplate() {
    try {
      // Optionally "finalRenumber" seats, or keep them as-is:
      const finalSeats = finalRenumberSeats([...seats], rowFormat, colFormat)

      // Build a body for the template
      const templateBody = {
        name: name + ' (Template Copy)',
        rows,
        columns,
        basePrice,
        curve,
        rowFormat,
        colFormat,
        // If you want to store them: seats
        seats: finalSeats,
        // Possibly an "isPublic: false" or use your seatMap.tenant if required
        isPublic: false,
        // tenant: typeof seatMap.tenant === "string" ? seatMap.tenant : seatMap.tenant?.id || "",
      }

      const res = await fetch('/api/payloadProxy/seat-map-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateBody),
      })
      if (!res.ok) {
        throw new Error('Failed to create template.')
      }
      toast.success('Saved current seat map as a template!')
    } catch (err) {
      console.error(err)
      toast.error('Could not save as template')
    }
  }

  /**
   * Called when user selects a template in import modal and clicks "Import"
   */
  async function handleImportTemplate() {
    if (!selectedTemplateID) {
      toast.error('Please select a template first!')
      return
    }
    try {
      // 1) Fetch the single template doc.
      // If your route supports GET /api/seat-map-templates/:id, do that.
      // Otherwise do find with a where param. Example:

      const res = await fetch(`/api/payloadProxy/seat-map-templates?limit=1&where[id][equals]=${selectedTemplateID}`)
      if (!res.ok) {
        throw new Error('Template fetch failed')
      }
      const data = await res.json()
      const tmpl = data.docs?.[0]
      if (!tmpl) {
        throw new Error('No template found with that ID')
      }

      // 2) "Import" => set local state from template
      setRows(tmpl.rows || 0)
      setColumns(tmpl.columns || 0)
      setBasePrice(tmpl.basePrice || 0)
      setCurve(tmpl.curve ?? 16)
      setRowFormat(tmpl.rowFormat || 'Numeric')
      setColFormat(tmpl.colFormat || 'Numeric')
      // seats:
      const seatData = Array.isArray(tmpl.seats) ? tmpl.seats : []
      const sortedSeats = normalizeAndSortSeats(seatData)
      setSeats(sortedSeats)

      toast.success('Template imported!')
      setShowImportModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to import template')
    }
  }

  /**
   * Replace ticket types of all seats (excluding non-seat statuses) with the
   * currently selected default ticket type. Shows a progress bar while
   * processing.
   */

  // 1) On mount => fetch shops
  useEffect(() => {
    (async () => {
      try {
        const tenantID =
          typeof seatMap.tenant === 'string' ? seatMap.tenant : seatMap.tenant?.id || ''
        // fetch shops
        const shopParams = new URLSearchParams({ limit: '100', tenantId: tenantID })
        const venuesRes = await fetch(`/api/payloadProxy/shops?${shopParams}`)
        const venuesData = await venuesRes.json()
        setAllVenues(venuesData.docs || [])
      } catch (err) {
        console.error('Failed to fetch shops:', err)
      }
    })()
  }, [seatMap.tenant, venueId])

  // 2) If we change rows/columns => recalc seats
  useEffect(() => {
    const neededCount = rows * columns
    if (neededCount <= 0) {
      setSeats([])
      return
    }

    const existingByKey: Record<string, Seat> = {}
    seats.forEach((st) => {
      const key = `${st.pinnedRow}-${st.pinnedCol}`
      existingByKey[key] = st
    })

    const newArr: Seat[] = []
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= columns; c++) {
        const key = `${r}-${c}`
        const existing = existingByKey[key]
        if (existing) {
          newArr.push(existing)
        } else {
          const assignType = ''
          newArr.push({
            id: `pinned-${r}-${c}`,
            pinnedRow: r,
            pinnedCol: c,
            row: '',
            seat: '',
            lockedRowLabel: false,
            lockedSeatLabel: false,
            ticketType: assignType,
            status: 'Seat',
            locks: [],
            purpose: 'none',
            groupLabel: '',
            groupReleaseOrder: 0,
            groupMinToReleaseNext: 0,
          })
        }
      }
    }

    const labeled = applyDisplayLabels(newArr, rowFormat, colFormat)
    const sorted = labeled.sort((a, b) => {
      if (a.pinnedRow !== b.pinnedRow) return a.pinnedRow - b.pinnedRow
      return a.pinnedCol - b.pinnedCol
    })
    setSeats(sorted)

    // Reset row/col selection
    setRowSelected(Array.from({ length: rows }, () => false))
    setColSelected(Array.from({ length: columns }, () => false))
    setSelectedSeatIds(new Set())
  }, [rows, columns, rowFormat, colFormat])

  // 3) Compare doc => toggles "Save"
  useEffect(() => {
    const originalVenueId =
      typeof seatMap.venue === 'object' ? seatMap.venue.id : String(seatMap.venue || '')

    const changed =
      name !== (seatMap.name || '') ||
      venueId !== originalVenueId ||
      rows !== (seatMap.rows || 0) ||
      columns !== (seatMap.columns || 0) ||
      basePrice !== (seatMap.basePrice || 0) ||
      curve !== (seatMap.curve ?? 24) ||
      isDefault !== (seatMap.isDefault || false) ||
      groupReleaseOrder !== (seatMap.groupReleaseOrder ?? 0) ||
      groupMinToReleaseNext !== (seatMap.groupMinToReleaseNext ?? 0) ||
      rowFormat !== (seatMap.rowFormat || 'Numeric') ||
      colFormat !== (seatMap.colFormat || 'Numeric') ||
      JSON.stringify(seats) !== JSON.stringify(seatMap.seats)

    setIsChanged(changed)
  }, [
    name,
    venueId,
    rows,
    columns,
    basePrice,
    curve,
    isDefault,
    groupReleaseOrder,
    groupMinToReleaseNext,
    rowFormat,
    colFormat,
    seats,
    seatMap,
  ])

  // 4) Save => transform seats => pinned coords remain, re‐label
  async function handleSave() {
    if (!name.trim()) {
      toast.error('You must provide a seat‐map name.')
      return
    }
    try {
      const finalSeats = finalRenumberSeats([...seats], rowFormat, colFormat)

      const isCreate = isNew || !seatMap.id
      const endpoint = '/api/payloadProxy/seatMaps'
      const method = isCreate ? 'POST' : 'PATCH'

      const body: any = {
        name,
        venue: venueId,
        rows,
        columns,
        basePrice,
        curve,
        isDefault,
        seats: finalSeats,
        tenant: seatMap.tenant,
        groupReleaseOrder,
        groupMinToReleaseNext,
        rowFormat,
        colFormat,
      }
      if (!isCreate) {
        body.id = seatMap.id
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(`Seat map ${isCreate ? 'creation' : 'update'} failed.`)
      }
      const result = await res.json()
      const newID = result?.doc?.id || result.id
      if (!newID) {
        toast.error('No seatMap ID returned from server.')
        return
      }
      toast.success('Seat map saved!')
      setIsChanged(false)

      if (isCreate) {
        router.push(`/dashboard/seat-map/${newID}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save seat map')
    }
  }

  // 5) Delete seat‐map
  async function handleDelete() {
    if (!seatMap.id || seatMap.id === 'new') {
      toast.error('Nothing to delete — seat map not saved yet.')
      setShowDeleteModal(false)
      return
    }
    try {
      const res = await fetch(`/api/payloadProxy/seatMaps?id=${seatMap.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error('Delete failed.')
      }
      toast.success('Seat map deleted!')
      router.push('/dashboard/seat-map')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete seat map')
    } finally {
      setShowDeleteModal(false)
    }
  }


  // seat double‐click => open seat editor
  function handleSeatDoubleClick(seat: Seat) {
    if (!seat.status || seat.status === 'Seat') {
      setEditingSeat(seat)
      setShowModal(true)
    }
  }

  function updateSeat(updated: Seat) {
    setSeats((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  // example gating => locked if sold < groupMin
  const soldCount = useMemo(() => seats.filter((s) => s.status === 'Sold').length, [seats])

  function isSeatLockedByGroup(seat: Seat) {
    if (!seatMap.groupReleaseOrder || seatMap.groupReleaseOrder <= 0) return false
    if (!seatMap.groupMinToReleaseNext || seatMap.groupMinToReleaseNext <= 0) return false
    return soldCount < seatMap.groupMinToReleaseNext
  }


  // row/col toggles
  function toggleRowSelection(rIndex: number) {
    setRowSelected((prev) => {
      const copy = [...prev]
      copy[rIndex - 1] = !copy[rIndex - 1]
      return copy
    })
    const isSelecting = !rowSelected[rIndex - 1]
    setSelectedSeatIds((prev) => {
      const copy = new Set(prev)
      seats.forEach((seat) => {
        if (seat.pinnedRow === rIndex) {
          if (isSelecting) copy.add(seat.id!)
          else copy.delete(seat.id!)
        }
      })
      return copy
    })
  }

  function toggleColumnSelection(cIndex: number) {
    setColSelected((prev) => {
      const copy = [...prev]
      copy[cIndex - 1] = !copy[cIndex - 1]
      return copy
    })
    const isSelecting = !colSelected[cIndex - 1]
    setSelectedSeatIds((prev) => {
      const copy = new Set(prev)
      seats.forEach((seat) => {
        if (seat.pinnedCol === cIndex) {
          if (isSelecting) copy.add(seat.id!)
          else copy.delete(seat.id!)
        }
      })
      return copy
    })
  }

  function toggleSeatSelection(seatId?: string) {
    if (!seatId) return
    setSelectedSeatIds((prev) => {
      const copy = new Set(prev)
      if (copy.has(seatId)) copy.delete(seatId)
      else copy.add(seatId)
      return copy
    })
  }

  // multi‐edit selection
  function handleApplySelection() {
    setSeats((prev) =>
      prev.map((s) => {
        if (!selectedSeatIds.has(s.id!)) return s
        const updated = { ...s }
        if (selectedStatus) updated.status = selectedStatus
        if (selectedPurpose) updated.purpose = selectedPurpose as Seat['purpose']
        if (selectedGroupLabel.trim() !== '') updated.groupLabel = selectedGroupLabel.trim()
        return updated
      }),
    )
    setSelectedSeatIds(new Set())
    setShowSelectionModal(false)

    // reset
    setSelectedStatus('Seat')
    setSelectedPurpose('')
    setSelectedGroupLabel('')
  }

  // group seats by pinnedRow => pinnedCol => arc offset
  function groupIntoRowsByPinned(all: Seat[], rowCount: number, colCount: number) {
    const out: Seat[][] = []
    for (let r = 1; r <= rowCount; r++) {
      const rowSeats = all.filter((s) => s.pinnedRow === r)
      rowSeats.sort((a, b) => a.pinnedCol - b.pinnedCol)
      out.push(rowSeats)
    }
    return out
  }

  const groupedRows = groupIntoRowsByPinned(seats, rows, columns)

  // seat color
  function getSeatColor(seat: Seat) {
    if (!seat.status || seat.status === 'Seat') {
      return fallbackColorHash(seat.ticketType || '')
    }
    switch (seat.status) {
      case 'Hallway':
        return '#90CAF9'
      case 'Stage':
        return '#FFD54F'
      case 'Empty':
        return '#E0E0E0'
      case 'Sold':
        return '#FF0000'
      default:
        return fallbackColorHash(seat.ticketType || 'fallback')
    }
  }

  function getPurposeSymbol(purpose: string | undefined) {
    if (!purpose || purpose === 'none') return ''
    if (purpose === 'techniek') return '⚙'
    if (purpose === 'ingang') return '🚪'
    if (purpose === 'nooduitgang') {
      return <Image src="/icons/emergency-exit.png" alt="Nooduitgang" width={22} height={22} />
    }
    if (purpose === 'handicap') return '♿'
    return ''
  }

  const fallbackColors = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#607D8B',
  ]

  function fallbackColorHash(key: string) {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash)
      hash |= 0
    }
    return fallbackColors[Math.abs(hash) % fallbackColors.length] || '#66bb6a'
  }

  return (
    <>
      <Toaster position="top-center" />

      <DetailShell
        title={isNew ? 'Nieuw zaalplan' : `Bewerken: ${seatMap.name}`}
        description="Configureer stoelen, vaste posities, rij/kolom labels, enz."
        onBack={() => router.back()}
        onDelete={!isNew ? () => setShowDeleteModal(true) : undefined}
        onDeleteLabel="Verwijderen"
        onSave={handleSave}
        saveDisabled={!isChanged}
        saveLabel="Wijzigingen opslaan"
      >
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md max-w-sm w-full space-y-4">
              <h2 className="text-lg font-semibold">Zaalplan verwijderen</h2>
              <p className="text-sm text-gray-600">
                Weet je zeker dat je <strong>{seatMap.name}</strong> wilt verwijderen? Dit kan niet ongedaan worden
                gemaakt.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buttons for Import / Save-as-Template */}
        <div className="flex gap-2 my-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Importeer template
          </button>
          <button
            onClick={() => {
              setTemplateName(name + ' (Template Copy)') // default
              setShowTemplateModal(true)
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Opslaan als template
          </button>
        </div>


        {/* “Save as Template” modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-md max-w-sm w-full space-y-4">
              <h2 className="text-lg font-semibold">Opslaan als template</h2>

              <div>
                <label className="block text-sm font-medium">Template Naam</label>
                <input
                  className="border rounded p-2 w-full"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Annuleer
                </button>
                <button
                  onClick={handleSaveAsTemplateConfirmed}
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Zaalplan opslaan als template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Basic seat‐map fields */}
        <div className="bg-white border p-4 rounded shadow-sm space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col">
              <label className="font-medium">Naam</label>
              <input
                className="border rounded p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium">Locatie</label>
              <select
                className="border rounded p-2"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
              >
                <option value="">— Selecteer locatie —</option>
                {allVenues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>


          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="font-medium">Rijen</label>
              <input
                type="number"
                className="border rounded p-2"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Kolommen</label>
              <input
                type="number"
                className="border rounded p-2"
                value={columns}
                onChange={(e) => setColumns(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Kromming</label>
              <input
                type="number"
                min="-60"
                max="60"
                className="border rounded p-2"
                value={curve}
                onChange={(e) => setCurve(parseInt(e.target.value, 10))}
              />
            </div>
          </div>


          <div className="flex items-center gap-2 my-2">
            <input
              id="defaultSeatMap"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label htmlFor="defaultSeatMap" className="font-medium">
              Standaard voor deze locatie
            </label>
          </div>

          {/* Row/col format & default ticket type => one row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 mt-4">
            <div className="flex flex-col">
              <label className="font-medium">Rijformaat</label>
              <select
                className="border rounded p-1"
                value={rowFormat}
                onChange={(e) => setRowFormat(e.target.value as FormatOption)}
              >
                <option value="Numeric">Numeric (1,2,3)</option>
                <option value="Letter">Letter (A,B,C)</option>
                <option value="RNumber">R# (R1,R2,...)</option>
                <option value="RowNumber">Row# (Row1,Row2,...)</option>
                <option value="Continuous">Continuous</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Kolomformaat</label>
              <select
                className="border rounded p-1"
                value={colFormat}
                onChange={(e) => setColFormat(e.target.value as FormatOption)}
              >
                <option value="Numeric">Numeric (1,2,3)</option>
                <option value="Letter">Letter (A,B,C)</option>
                <option value="RNumber">C# (C1,C2,...)</option>
                <option value="RowNumber">Col# (Col1,Col2,...)</option>
                <option value="Continuous">Continuous</option>
              </select>
            </div>
          </div>
        </div>


        {/* Group-level gating UI for distinct groupLabel */}
        <GroupGatingByLabel seats={seats} setSeats={setSeats} />

        {/* “Edit Selection” button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowSelectionModal(true)}
            disabled={selectedSeatIds.size === 0}
            className="bg-orange-500 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Bewerk selectie
          </button>
        </div>


        {/* Arc layout with column checkboxes above first row seats */}
        <div
          className="relative"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          }}
        >
          <div
            style={{
              minWidth: `${Math.max(800, columns * 50)}px`,
              padding: '1rem',
              background: '#f9f9fb',
            }}
          >
            {/* Stage label */}
            <div className="flex justify-start mb-4">
              <div
                className="h-10 flex items-end justify-center relative shadow-md rounded-xl"
                style={{
                  width: `${Math.max(140, columns * 30)}px`,
                  background: '#eee',
                }}
              >
                                <span
                                  style={{
                                    position: 'absolute',
                                    bottom: 6,
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    letterSpacing: 4,
                                  }}
                                >
                                    PODIUM
                                </span>
              </div>
            </div>

            {/* Rows of seats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {groupedRows.map((rowSeats, rowIdx) => {
                if (rowSeats.length === 0) return null

                const rowNumber = rowSeats[0].pinnedRow

                return (
                  <div key={rowIdx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {/* For the FIRST row only => show column checkboxes above seats */}
                    {rowIdx === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {/* blank space for row‐label column */}
                        <div style={{ width: 70 }} />
                        {/* Map the seats in row 0 to place column checkboxes above them */}
                        {rowSeats.map((_, colIndex) => (
                          <div key={colIndex} style={{ width: 24, textAlign: 'center' }}>
                            <label className="inline-flex flex-col items-center text-xs text-gray-700">
                              <span>{colIndex + 1}</span>
                              <input
                                type="checkbox"
                                checked={colSelected[colIndex] || false}
                                onChange={() => toggleColumnSelection(colIndex + 1)}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actual row => pinnedRow label + seat circles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {/* Row label & checkbox => pinnedRow X */}
                      <div style={{ width: 70, textAlign: 'right' }}>
                        <label className="inline-flex items-center gap-1 text-sm text-gray-700">
                          <span>Row {rowNumber}</span>
                          <input
                            type="checkbox"
                            checked={rowSelected[rowNumber - 1] || false}
                            onChange={() => toggleRowSelection(rowNumber)}
                          />
                        </label>
                      </div>

                      {/* The seats themselves */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {rowSeats.map((seat, colIdx) => {
                          const N = rowSeats.length
                          const midIndex = (N - 1) / 2
                          const colDelta = colIdx - midIndex
                          const t = N > 1 ? colDelta / midIndex : 0
                          const yOffset = curve * (1 - t * t)

                          const color = getSeatColor(seat)
                          const isSelected = selectedSeatIds.has(seat.id!)
                          const locked = isSeatLockedByGroup(seat)
                          const purposeSymbol = getPurposeSymbol(seat.purpose)

                          return (
                            <div
                              key={seat.id}
                              style={{
                                transform: `translateY(${yOffset}px)`,
                                transition: 'transform 0.18s ease',
                                cursor:
                                  !locked && (seat.status === 'Seat' || !seat.status)
                                    ? 'pointer'
                                    : 'default',
                                outline: isSelected ? '2px solid green' : 'none',
                                borderRadius: '50%',
                                border: locked ? '2px solid red' : 'none',
                              }}
                              onClick={() => {
                                if (!locked) toggleSeatSelection(seat.id)
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation()
                                if (!locked) handleSeatDoubleClick(seat)
                              }}
                            >
                              {/* If there's a special purpose => bigger icon */}
                              {purposeSymbol && seat.purpose !== 'none' ? (
                                <div
                                  style={{
                                    fontSize: 22,
                                    width: 22,
                                    height: 22,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title={`${seat.row}-${seat.seat}`}
                                >
                                  {purposeSymbol}
                                </div>
                              ) : (
                                /* Otherwise, the usual colored circle. */
                                <div
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    border: '1px solid #999',
                                    boxShadow:
                                      seat.status === 'Seat' || !seat.status
                                        ? '0 1px 2px rgba(0,0,0,0.15)'
                                        : 'none',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 10,
                                    color: '#FFF',
                                    fontWeight: 700,
                                  }}
                                  title={`${seat.row}-${seat.seat}`}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Seat Edit Modal */}
        {showModal && editingSeat && (
          <SeatEditModal
            seat={editingSeat}
            onClose={() => setShowModal(false)}
            onSave={(updated) => {
              updateSeat(updated)
              setShowModal(false)
            }}
          />
        )}


        {/* “Edit Selection” Modal */}
        {showSelectionModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md shadow-md w-[400px] max-w-full">
              <h2 className="text-lg font-semibold mb-4">Selectie bewerken</h2>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status instellen</label>
                <select
                  className="border rounded p-2 w-full"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Seat">Seat</option>
                  <option value="Empty">Empty</option>
                  <option value="Hallway">Hallway</option>
                  <option value="Stage">Stage</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>


              {/* Purpose */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Doel instellen</label>
                <select
                  className="border rounded p-2 w-full"
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                >
                  <option value="">— geen wijziging —</option>
                  <option value="none">none</option>
                  <option value="techniek">techniek</option>
                  <option value="ingang">ingang</option>
                  <option value="nooduitgang">nooduitgang</option>
                  <option value="handicap">handicap</option>
                </select>
              </div>

              {/* Group Label */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Groepslabel instellen</label>
                <input
                  type="text"
                  className="border rounded p-2 w-full"
                  placeholder="Laat leeg voor geen wijziging"
                  value={selectedGroupLabel}
                  onChange={(e) => setSelectedGroupLabel(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Als je hier iets invult krijgen alle geselecteerde stoelen dit label.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSelectionModal(false)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleApplySelection}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Toepassen
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Import Template Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-md max-w-sm w-full space-y-4">
              <h2 className="text-lg font-semibold">Importeer zaalplan</h2>

              {/* If we haven't loaded templates yet, fetch them once */}
              {templatesList.length === 0 && (
                <button
                  className="bg-gray-300 px-4 py-2 text-sm rounded"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/payloadProxy/seat-map-templates')
                      const data = await res.json()
                      setTemplatesList(data.docs || [])
                    } catch (err) {
                      console.error(err)
                      toast.error('Could not load templates')
                    }
                  }}
                >
                  Klik hier om templates op te halen
                </button>
              )}

              {/* If we have them, show a select list */}
              {templatesList.length > 0 && (
                <div>
                  <label className="block text-sm font-medium">Kies template</label>
                  <select
                    className="border rounded p-2 w-full"
                    value={selectedTemplateID}
                    onChange={(e) => setSelectedTemplateID(e.target.value)}
                  >
                    <option value="">— selecteer —</option>
                    {templatesList.map((tmpl: any) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name} (R{tmpl.rows} x K{tmpl.columns})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleImportTemplate}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Importeer
                </button>
              </div>
            </div>
          </div>
        )}

      </DetailShell>
    </>
  )
}

/** Group gating UI for distinct groupLabel. */
function GroupGatingByLabel({
                              seats,
                              setSeats,
                            }: {
  seats: Seat[];
  setSeats: React.Dispatch<React.SetStateAction<Seat[]>>;
}) {
  const labels = useMemo(() => {
    const setOfLabels = new Set<string>()
    seats.forEach((s) => {
      if (s.groupLabel) setOfLabels.add(s.groupLabel.trim())
    })
    return Array.from(setOfLabels).filter((lbl) => lbl !== '')
  }, [seats])

  const groupValues = useMemo(() => {
    const out: Record<string, { releaseOrder: number; minNext: number }> = {}
    labels.forEach((lbl) => {
      const seatInGroup = seats.find((s) => s.groupLabel === lbl)
      out[lbl] = {
        releaseOrder: seatInGroup?.groupReleaseOrder ?? 0,
        minNext: seatInGroup?.groupMinToReleaseNext ?? 0,
      }
    })
    return out
  }, [seats, labels])

  function handleChange(label: string, newReleaseOrder: number, newMinNext: number) {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.groupLabel === label) {
          return { ...s, groupReleaseOrder: newReleaseOrder, groupMinToReleaseNext: newMinNext }
        }
        return s
      }),
    )
  }

  if (!labels.length) return null

  return (
    <div className="bg-white p-4 rounded-md shadow mb-4">
      <h3 className="text-md font-semibold mb-2">Groepinstellingen (gating per label)</h3>
      <p className="text-sm text-gray-500 mb-3">
        Stel volgorde en minimumstoelen per label in. Alle stoelen met dat label worden bijgewerkt.
      </p>
      <div className="space-y-3">
        {labels.map((lbl) => {
          const group = groupValues[lbl] || { releaseOrder: 0, minNext: 0 }
          return (
            <div key={lbl} className="flex flex-wrap items-center gap-2">
              <span className="font-semibold w-28">{lbl}:</span>
              <div className="flex items-center gap-2">
                <label className="text-sm">Volgorde:</label>
                <input
                  type="number"
                  className="border rounded p-1 w-16"
                  value={group.releaseOrder}
                  onChange={(e) =>
                    handleChange(lbl, parseInt(e.target.value) || 0, group.minNext)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Min. volgende:</label>
                <input
                  type="number"
                  className="border rounded p-1 w-16"
                  value={group.minNext}
                  onChange={(e) =>
                    handleChange(lbl, group.releaseOrder, parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * finalRenumberSeats etc. are unchanged below
 */
function finalRenumberSeats(seatList: Seat[], rowFmt: FormatOption, colFmt: FormatOption): Seat[] {
  if (colFmt === 'Continuous') {
    return renumberSeatsContinuous(seatList, rowFmt)
  } else {
    return renumberSeatsIgnoringEmpties(seatList, rowFmt, colFmt)
  }
}

function renumberSeatsContinuous(seatList: Seat[], rowFmt: FormatOption): Seat[] {
  const sorted = [...seatList].sort((a, b) => {
    if (a.pinnedRow !== b.pinnedRow) return a.pinnedRow - b.pinnedRow
    return a.pinnedCol - b.pinnedCol
  })

  let seatCounter = 1
  for (const seat of sorted) {
    if (!seat.lockedRowLabel) {
      seat.row = formatRow(seat.pinnedRow, rowFmt)
    }
    if (!seat.lockedSeatLabel) {
      if (seat.status === 'Empty' || seat.status === 'Hallway') {
        seat.seat = `${seatCounter}-empty`
      } else {
        seat.seat = String(seatCounter)
      }
    }
    seatCounter++
  }
  return sorted
}

function renumberSeatsIgnoringEmpties(
  seatList: Seat[],
  rowFmt: FormatOption,
  colFmt: FormatOption,
): Seat[] {
  const rowMap = new Map<number, Seat[]>()
  for (const s of seatList) {
    if (!rowMap.has(s.pinnedRow)) {
      rowMap.set(s.pinnedRow, [])
    }
    rowMap.get(s.pinnedRow)!.push(s)
  }

  for (const [r, seatsInRow] of rowMap.entries()) {
    seatsInRow.sort((a, b) => a.pinnedCol - b.pinnedCol)

    let seatCounter = 1
    for (const st of seatsInRow) {
      if (!st.lockedRowLabel) {
        st.row = formatRow(r, rowFmt)
      }
      if (!st.lockedSeatLabel) {
        if (st.status === 'Empty' || st.status === 'Hallway') {
          st.seat = `${seatCounter}-empty`
        } else {
          st.seat = formatCol(seatCounter, colFmt)
          seatCounter++
        }
      }
    }
  }
  return seatList
}

function normalizeAndSortSeats(rawSeats: Seat[]): Seat[] {
  const copy = [...rawSeats]
  copy.sort((a, b) => {
    if (a.pinnedRow !== b.pinnedRow) return a.pinnedRow - b.pinnedRow
    return a.pinnedCol - b.pinnedCol
  })
  return copy
}

function formatRow(index: number, fmt: FormatOption): string {
  if (fmt === 'Numeric') return String(index)
  if (fmt === 'Letter') return indexToAlpha(index)
  if (fmt === 'RNumber') return `R${index}`
  if (fmt === 'RowNumber') return `Row${index}`
  if (fmt === 'Continuous') {
    return String(index)
  }
  return String(index)
}

function formatCol(index: number, fmt: FormatOption): string {
  if (fmt === 'Numeric') return String(index)
  if (fmt === 'Letter') return indexToAlpha(index)
  if (fmt === 'RNumber') return `C${index}`
  if (fmt === 'RowNumber') return `Col${index}`
  return String(index)
}

function indexToAlpha(num: number): string {
  let n = num
  let alpha = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    alpha = String.fromCharCode(65 + rem) + alpha
    n = Math.floor((n - 1) / 26)
  }
  return alpha || 'A'
}

/** Does continuous or row-based labeling depending on colFmt */
function applyDisplayLabels(seatList: Seat[], rowFmt: string, colFmt: string): Seat[] {
  const rFmt = rowFmt as FormatOption
  const cFmt = colFmt as FormatOption
  if (cFmt === 'Continuous') {
    // continuous
    const sorted = [...seatList].sort((a, b) => {
      if (a.pinnedRow !== b.pinnedRow) return a.pinnedRow - b.pinnedRow
      return a.pinnedCol - b.pinnedCol
    })
    let seatCounter = 1
    for (const seat of sorted) {
      if (!seat.lockedRowLabel) {
        seat.row = formatRow(seat.pinnedRow, rFmt)
      }
      if (!seat.lockedSeatLabel) {
        if (seat.status === 'Empty' || seat.status === 'Hallway') {
          seat.seat = `${seatCounter}-empty`
        } else {
          seat.seat = String(seatCounter)
        }
      }
      seatCounter++
    }
    return sorted
  } else {
    // row-based
    const rowMap = new Map<number, Seat[]>()
    for (const s of seatList) {
      if (!rowMap.has(s.pinnedRow)) rowMap.set(s.pinnedRow, [])
      rowMap.get(s.pinnedRow)!.push(s)
    }
    for (const [r, seatsInRow] of rowMap.entries()) {
      seatsInRow.sort((a, b) => a.pinnedCol - b.pinnedCol)
      let seatCounter = 1
      for (const st of seatsInRow) {
        if (!st.lockedRowLabel) {
          st.row = formatRow(r, rFmt)
        }
        if (!st.lockedSeatLabel) {
          if (st.status === 'Empty' || st.status === 'Hallway') {
            st.seat = `${seatCounter}-empty`
          } else {
            st.seat = formatCol(seatCounter, cFmt)
            seatCounter++
          }
        }
      }
    }
    return seatList
  }
}
