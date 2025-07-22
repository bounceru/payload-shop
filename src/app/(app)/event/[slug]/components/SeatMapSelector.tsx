'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { Check, ChevronLeft, CreditCard, ShoppingCart, Ticket, User } from 'lucide-react'

// Adjust to your real payload types if needed
import type { Addon, Customer } from '@/payload-types'

// Optional helper if you have “special purpose” seats:

function getPurposeSymbol(purpose: string | undefined): React.ReactNode {
  if (!purpose || purpose === 'none') return ''
  if (purpose === 'techniek') return '⚙'
  if (purpose === 'ingang') return '🚪'
  if (purpose === 'nooduitgang') {
    return <Image src="/icons/emergency-exit.png" alt="Nooduitgang" width={22} height={22} />
  }
  if (purpose === 'handicap') return '♿' // NEW

  return ''
}

/** Minimal seat definition. */
type Seat = {
  row: string;
  seat: string;
  ticketType?: {
    id: string;
    name: string;
    price: number;
    color?: string;
  };
  locks?: { eventId: string; lockedUntil: string }[];
  purpose?: 'none' | 'techniek' | 'ingang' | 'nooduitgang' | 'handicap';
  groupLabel?: string;
  groupReleaseOrder?: number;
  status?: string | null; // "Seat","Empty","Hallway","Stage","Sold",...
};

/** For the seat hover tooltip. */
type HoveredSeatInfo = {
  seat: Seat;
  x: number; // Page X
  y: number; // Page Y
};

export default function SeatMapSelector({
                                          seatMap,
                                          event,
                                        }: {
  seatMap: any; // e.g. { seats, columns, groupMinToReleaseNext }
  event: any;
}) {
  // Debug log
  console.log('DEBUG seatMap:', seatMap)

  // Build a map of groupLabels -> groupReleaseOrder
  const groupOrders: Record<string, number> = {}
  seatMap.seats?.forEach((seat: Seat) => {
    if (seat.groupLabel && typeof seat.groupReleaseOrder === 'number') {
      groupOrders[seat.groupLabel] = seat.groupReleaseOrder
    }
  })
  const globalMin = seatMap.groupMinToReleaseNext || 0

  const [currentStep, setCurrentStep] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lockedSeats, setLockedSeats] = useState<Set<string>>(new Set())
  const [userLockedSeats, setUserLockedSeats] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Basic user (customer) info for Step 2
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    id: '',
    tenant: event.tenant.id,
    updatedAt: '',
    createdAt: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    date_of_birth: '',
    tags: [],
    enabled: true,
  })

  // Add-ons
  const [addons, setAddons] = useState<Addon[]>([])
  const [selectedAddons, setSelectedAddons] = useState<Map<string, Map<string, number>>>(
    new Map(),
  )

  const lockDuration = 15 * 60 * 1000 // 15 minutes lock
  const [lockExpiration, setLockExpiration] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [hoveredSeat, setHoveredSeat] = useState<HoveredSeatInfo | null>(null)

  const ticketMap = useMemo(() => {
    const map: Record<string, any> = {};
    (event.ticketTypes || []).forEach((tt: any) => {
      if (tt && tt.id) map[tt.id] = tt
    })
    return map
  }, [event.ticketTypes])

  const seatsWithTypes = useMemo(() => {
    return (seatMap.seats || []).map((seat: any) => {
      const ttId = event.seatAssignments?.[seat.id]
      return { ...seat, ticketType: ticketMap[ttId] } as Seat
    })
  }, [seatMap.seats, event.seatAssignments, ticketMap])

  // Lock newly selected seats and release deselected ones
  useEffect(() => {
    const toLock = new Set<string>()
    selected.forEach((id) => {
      if (!userLockedSeats.has(id)) toLock.add(id)
    })
    if (toLock.size > 0) {
      lockSeats(toLock)
    }

    const toUnlock: string[] = []
    userLockedSeats.forEach((id) => {
      if (!selected.has(id)) toUnlock.push(id)
    })
    if (toUnlock.length > 0) {
      unlockSeats(toUnlock)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  // ─────────────────────────────────────────────────────
  // 1) On mount => fetch locked seats & add-ons
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchLockedSeats()
    fetchAddons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.slug])

  // Countdown timer for locked seats
  useEffect(() => {
    if (!lockExpiration) return

    const update = () => {
      const diff = lockExpiration - Date.now()
      if (diff <= 0) {
        setTimeLeft(0)
        setLockExpiration(null)
        unlockSeats()
      } else {
        setTimeLeft(diff)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockExpiration])

  // 2) Build array of selected seats => seat + computed price
  const selectedSeats = useMemo(() => {
    return Array.from(selected)
      .map((id) => {
        const seatObj = findSeatById(seatsWithTypes, id)
        if (!seatObj) return null
        const price = getSeatPrice(seatObj)
        return { ...seatObj, id, price }
      })
      .filter(Boolean) as (Seat & { id: string; price: number })[]
  }, [selected, seatsWithTypes])

  // 3) Summation => seats + add-ons
  const total = useMemo(() => {
    const seatSum = selectedSeats.reduce((sum, s) => sum + s.price, 0)
    const addonSum = Array.from(selectedAddons.entries()).reduce((acc, [_, addonsMap]) => {
      addonsMap.forEach((qty, addonId) => {
        const addon = addons.find((a) => a.id === addonId)
        if (addon) {
          acc += addon.price * qty
        }
      })
      return acc
    }, 0)
    return seatSum + addonSum
  }, [selectedSeats, selectedAddons, addons])

  // Step transitions
  const nextStep = async () => {
    if (currentStep === 1) {
      // Validate seats => remove forcibly selected locked seats
      const cleaned = new Set<string>(selected)
      let foundInvalid = false

      for (const seatId of selected) {
        const seatObj = findSeatById(seatsWithTypes as Seat[], seatId)
        if (!seatObj) {
          cleaned.delete(seatId)
          foundInvalid = true
          continue
        }
        if (
          !isSeatGroupUnlockedPartial(
            seatObj,
            seatMap.seats,
            groupOrders,
            globalMin,
            selected,
          )
        ) {
          cleaned.delete(seatId)
          foundInvalid = true
        }
      }
      if (foundInvalid) {
        alert('Some seats in your selection weren’t unlocked yet; removing them.')
        setSelected(cleaned)
        return // do not proceed
      }
      await lockSeats(selected)
    }
    setCurrentStep((prev) => prev + 1)
  }
  const previousStep = async () => {
    const newStep = currentStep - 1
    if (newStep === 1) {
      await unlockSeats()
      await fetchLockedSeats()
    }
    setCurrentStep(newStep)
  }

  // 4) Lock seats
  async function lockSeats(seats: Set<string>) {
    const seatIds = Array.from(seats)
    if (!seatIds.length) return
    const res = await fetch('/api/lockSeats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventSlug: event.slug,
        seatIds,
        lockDuration,
      }),
    })
    if (res.ok) {
      setLockedSeats((prev) => new Set([...prev, ...seatIds]))
      setUserLockedSeats((prev) => new Set([...prev, ...seatIds]))
      setLockExpiration(Date.now() + lockDuration)
      setTimeLeft(lockDuration)
    } else {
      alert('Failed to lock seats')
    }
  }

  // 5) Unlock seats
  async function unlockSeats(ids?: string[]) {
    const seatIds = ids ?? Array.from(userLockedSeats)
    if (!seatIds.length) return
    const res = await fetch('/api/unlockExpiredSeats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventSlug: event.slug,
        seatIds,
      }),
    })
    if (res.ok) {
      setLockedSeats((prev) => {
        const copy = new Set(prev)
        seatIds.forEach((id) => copy.delete(id))
        return copy
      })
      setUserLockedSeats((prev) => {
        const copy = new Set(prev)
        seatIds.forEach((id) => copy.delete(id))
        return copy
      })
      if (!ids || userLockedSeats.size - seatIds.length <= 0) {
        setLockExpiration(null)
        setTimeLeft(0)
      }
      if (ids) {
        setSelected((prev) => {
          const copy = new Set(prev)
          seatIds.forEach((id) => copy.delete(id))
          return copy
        })
      } else {
        setSelected(new Set())
      }
    } else {
      alert('Failed to unlock seats')
    }
  }

  // Price helper
  function getSeatPrice(seat: Seat): number {
    return seat.ticketType?.price ?? 0
  }

  // 6) Fetch locked seats
  async function fetchLockedSeats() {
    setLoading(true)
    const res = await fetch('/api/getLockedSeats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventSlug: event.slug }),
    })
    const data = await res.json()
    if (res.ok) {
      setLockedSeats(new Set(data.lockedSeats))
    } else {
      alert('Failed to fetch locked seats')
    }
    setLoading(false)
  }

  // 7) Fetch add-ons
  async function fetchAddons() {
    const res = await fetch(`/api/getAddons?eventSlug=${event.slug}`)
    const data = await res.json()
    if (res.ok) {
      setAddons(data.addons)
    } else {
      alert('Failed to fetch add-ons')
    }
  }

  // Step 2 => gather customer info
  function handleCustomerInfo(e: React.FormEvent) {
    e.preventDefault()
    setCurrentStep(3)
  }

  // Hover tooltip
  function handleSeatMouseEnter(e: React.MouseEvent<HTMLDivElement>, seat: Seat) {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredSeat({
      seat,
      x: rect.left + window.scrollX + rect.width + 8,
      y: rect.top + window.scrollY + rect.height / 2,
    })
  }

  function handleSeatMouseLeave() {
    setHoveredSeat(null)
  }

  // Add-ons
  function handleAddonQuantityChange(addonId: string, seatId: string, increment: boolean) {
    setSelectedAddons((prev) => {
      const copy = new Map(prev)
      const seatAddons = copy.get(seatId) || new Map()
      const currentQty = seatAddons.get(addonId) || 0
      const maxQty = addons.find((a) => a.id === addonId)?.maxQuantity || 10
      let newQty = currentQty
      if (increment) {
        if (newQty < maxQty) newQty++
      } else {
        if (newQty > 0) newQty--
      }
      seatAddons.set(addonId, newQty)
      copy.set(seatId, seatAddons)
      return copy
    })
  }

  // Payment
  async function handlePayment() {
    const addonSelections: { seatId: string; addonId: string; quantity: number }[] = []
    selectedAddons.forEach((addonsMap, seatId) => {
      addonsMap.forEach((qty, addonId) => {
        if (qty > 0) {
          addonSelections.push({ seatId, addonId, quantity: qty })
        }
      })
    })

    const orderData = {
      customer: customerInfo,
      tickets: selectedSeats.map((s) => ({
        seatId: s.id,
        ticketType: s.ticketType,
        price: s.price,
        row: s.row,
        seatNumber: s.seat,
      })),
      eventSlug: event.slug,
      tenant: event.tenant.id,
      total,
      addonSelections,
    }

    const res = await fetch('/api/createOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })
    if (res.ok) {
      const { orderId } = await res.json()
      window.location.href = `/afrekenen?orderId=${orderId}`
    } else {
      alert('Order creation failed!')
    }
  }

  // 8) Seat selection => partial gating
  function toggleSeat(seatId: string) {
    if (lockedSeats.has(seatId) && !userLockedSeats.has(seatId)) return

    const seatObj = findSeatById(seatsWithTypes as Seat[], seatId)
    if (!seatObj) return

    // block seats with special purpose or "Empty"/"Hallway"
    if (
      seatObj.purpose === 'techniek' ||
      seatObj.purpose === 'ingang' ||
      seatObj.purpose === 'nooduitgang' ||
      seatObj.status === 'Empty' ||
      seatObj.status === 'Hallway'
    ) {
      return
    }

    // partial gating logic
    if (!isSeatGroupUnlockedPartial(seatObj, seatMap.seats, groupOrders, globalMin, selected)) {
      return
    }

    setSelected((prev) => {
      const copy = new Set(prev)
      if (copy.has(seatId)) copy.delete(seatId)
      else copy.add(seatId)
      return copy
    })
  }

  // 9) Build row chunks for the seat layout
  const curveDepth = seatMap?.curve ?? 24
  const rowChunks = useMemo(() => {
    if (!seatsWithTypes || !Array.isArray(seatsWithTypes)) return []
    const out: Seat[][] = []
    for (let i = 0; i < seatsWithTypes.length; i += seatMap.columns) {
      out.push(seatsWithTypes.slice(i, i + seatMap.columns))
    }
    return out
  }, [seatsWithTypes, seatMap.columns])

  // 10) Unlock seats on unmount
  useEffect(() => {
    const handleUnload = () => {
      if (userLockedSeats.size > 0) {
        navigator.sendBeacon(
          '/api/unlockExpiredSeats',
          JSON.stringify({
            eventSlug: event.slug,
            seatIds: Array.from(userLockedSeats),
          }),
        )
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      handleUnload()
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [userLockedSeats, event.slug])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Progress steps */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between">
          {['Stoelen', 'Klantgegevens', 'Add-ons', 'Betaling'].map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep > index + 1
                  ? 'bg-green-500 text-white'
                  : currentStep === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > index + 1 ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
              </div>
              <span
                className={`text-sm font-medium ${currentStep === index + 1 ? 'text-blue-600' : 'text-gray-500'}`}>{step}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>
        {timeLeft > 0 && (
          <p className="text-center text-md text-gray-600 mt-12">
            Zetels blijven bezet voor {Math.ceil(timeLeft / 60000)} minuten, rond de betaling af om je selectie te
            behouden.
          </p>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center text-lg py-8">Loading seats...</div>
      ) : currentStep === 1 ? (
        // ─────────────────────────────────────────────────
        // STEP 1 => Seat Selection
        // ─────────────────────────────────────────────────
        <div className="flex flex-col md:flex-row gap-6">

          {/* Seat Grid */}
          <div
            className="md:w-2/3 no-scrollbar"
            style={{
              background: '#f9f9fb',
              borderRadius: '18px',
              padding: '1rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              paddingTop: `${30 * (curveDepth / 24)}px`,
              maxWidth: '100%',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: '10px',
                minHeight: '290px',
              }}
              className="ml-64 md:ml-0"
            >
              {/* Stage */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    margin: 'auto',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 8px 24px #0002',
                    borderRadius: '18px',
                    width: '230px',
                    backgroundColor: '#fafafa',
                  }}
                >
                                    <span
                                      style={{
                                        color: 'black',
                                        fontWeight: 700,
                                        fontSize: '18px',
                                        letterSpacing: '8px',
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 8,
                                        textAlign: 'center',
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                      }}
                                    >
                                        PODIUM
                                    </span>
                </div>
              </div>
              {rowChunks.map((rowSeats, rowIdx) => (
                <div
                  key={rowIdx}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {rowSeats.map((seat: Seat, colIdx: number) => {
                    const id = `${seat.row}-${seat.seat}`
                    const isSelected = selected.has(id)
                    const lockedByOthers = lockedSeats.has(id) && !userLockedSeats.has(id)

                    let isAvailable = !!seat.ticketType && !lockedByOthers
                    const needsHidden = seat.status === 'Empty' || seat.status === 'Hallway'
                    if (needsHidden) isAvailable = false

                    const groupUnlocked = isSeatGroupUnlockedPartial(
                      seat,
                      seatMap.seats,
                      groupOrders,
                      globalMin,
                      selected,
                    )

                    // Arc offset logic
                    const N = rowSeats.length
                    const midIndex = (N - 1) / 2
                    const colDelta = colIdx - midIndex
                    const t = N > 1 ? colDelta / midIndex : 0
                    const yOffset = curveDepth * (1 - t * t)

                    return (
                      <div
                        key={id}
                        onMouseEnter={(e) => handleSeatMouseEnter(e, seat)}
                        onMouseLeave={handleSeatMouseLeave}
                        onClick={() => {
                          if (!needsHidden && isAvailable && groupUnlocked) {
                            if (!lockedByOthers) {
                              toggleSeat(id)
                            }
                          }
                        }}
                        style={{
                          transform: `translateY(${yOffset}px)`,
                          transition: 'transform 0.18s ease',
                          cursor: !needsHidden && isAvailable && groupUnlocked ? 'pointer' : 'not-allowed',
                          opacity: !needsHidden && isAvailable && groupUnlocked ? 1 : 0.4,
                          position: 'relative',
                          margin: '0 4px',
                          visibility: needsHidden ? 'hidden' : 'visible',
                        }}
                      >
                        {/*
        If seat has a special purpose => render a larger icon instead of the circle.
        Show an outline if it's selected.
      */}
                        {seat.purpose && seat.purpose !== 'none' ? (
                          <div
                            style={{
                              fontSize: 22,
                              width: 22,
                              height: 22,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: isSelected ? '2px solid #1976d2' : 'none',
                              borderRadius: '4px', // or '50%' if you prefer a circular highlight
                              boxShadow: isSelected ? '0 0 0 2px #1976d244' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                            title={`${seat.row}-${seat.seat}`}
                          >
                            {getPurposeSymbol(seat.purpose)}
                          </div>
                        ) : (
                          // Otherwise, show the usual colored circle
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: seat.ticketType?.color ?? '#ccc',
                              border: isSelected ? '2px solid #1976d2' : '1px solid #999',
                              boxShadow: isSelected ? '0 0 0 2px #1976d244' : undefined,
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFF',
                              fontWeight: 700,
                              fontSize: 10,
                            }}
                          >
                            {/* Show a checkmark (✔) if selected */}
                            {isSelected ? '✔' : null}
                          </div>
                        )}
                      </div>
                    )
                  })}


                </div>
              ))}
            </div>
          </div>

          {/* If seats selected => show summary & button */}
          {selectedSeats.length > 0 && (
            <div
              className="md:w-1/3 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Ticket className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Geselecteerde Stoelen</h3>
                </div>
                <ul className="space-y-2 mb-6">
                  {selectedSeats.map((s) => (
                    <li key={s.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-700">
                                                Rij {s.row} - Zetel {s.seat} <span
                                              className="text-gray-400">→</span> {s.ticketType?.name ?? 'No Ticket'}
                                            </span>
                      <span className="font-medium">€{s.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
                  <span className="font-semibold text-gray-800">Totaal:</span>
                  <span className="text-lg font-bold text-blue-600">€{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={nextStep}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
                >
                  <span>Ga Verder (Klantgegevens)</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Styled Tooltip */}
      {hoveredSeat &&
        createPortal(
          (() => {
            const seatUnlocked = isSeatGroupUnlockedPartial(
              hoveredSeat.seat,
              seatMap.seats,
              groupOrders,
              globalMin,
              selected,
            )
            const isEmptyOrHallway =
              hoveredSeat.seat.status === 'Empty' ||
              hoveredSeat.seat.status === 'Hallway'

            // 1) If seat is forcibly locked by group gating
            if (!seatUnlocked && !isEmptyOrHallway) {
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: hoveredSeat.y,
                    left: hoveredSeat.x,
                    transform: 'translateY(-50%)',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    padding: '8px 12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    minWidth: 140,
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    color: '#444',
                  }}
                >
                  Eerst moeten andere stoelen gekocht worden.
                </div>
              )
            }
              // 2) If seat has a special purpose => show only that
            // 2) If seat has a special purpose AND it's not "handicap" => show only purpose
            else if (
              hoveredSeat.seat.purpose &&
              hoveredSeat.seat.purpose !== 'none' &&
              hoveredSeat.seat.purpose !== 'handicap'
            ) {
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: hoveredSeat.y,
                    left: hoveredSeat.x,
                    transform: 'translateY(-50%)',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    padding: '8px 12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    minWidth: 120,
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    color: '#444',
                  }}
                >
                  {hoveredSeat.seat.purpose}
                </div>
              )
            }
            // 3) Otherwise show the “styled ticket” approach
            else {
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: hoveredSeat.y,
                    left: hoveredSeat.x,
                    transform: 'translateY(-50%)',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 12,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    width: 200,
                    overflow: 'hidden',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {/* Top row: Section / Rij / Zetel */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f8f8f8',
                      padding: '6px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: '#777',
                    }}
                  >
                    <div>DEEL</div>
                    <div>RIJ</div>
                    <div>ZETEL</div>
                  </div>

                  {/* Next row: actual values */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: '#333',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    <div style={{ textTransform: 'uppercase' }}>
                      {hoveredSeat.seat.groupLabel || ''}
                    </div>
                    <div>{hoveredSeat.seat.row}</div>
                    <div>{hoveredSeat.seat.seat}</div>
                  </div>

                  {/* Bottom “ticket name + price” row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#dfd7cf',
                      padding: '6px 8px',
                      fontSize: '0.85rem',
                      color: '#000',
                    }}
                  >
                    <div>{hoveredSeat.seat.ticketType?.name || '–'}</div>
                    <div style={{ fontWeight: 'bold' }}>
                      {getSeatPrice(hoveredSeat.seat).toFixed(2)} €
                    </div>
                  </div>
                </div>
              )
            }
          })(),
          document.body,
        )}

      {/* Step 2 => Customer Info */}
      {currentStep === 2 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-5">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Vul je gegevens in</h3>
              </div>
              <form onSubmit={handleCustomerInfo} className="space-y-4">
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                    Voornaam
                  </label>
                  <input
                    id="firstname"
                    type="text"
                    value={customerInfo.firstname}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, firstname: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                    Achternaam
                  </label>
                  <input
                    id="lastname"
                    type="text"
                    value={customerInfo.lastname}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, lastname: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoonnummer
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={customerInfo.phone ?? ''}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
                  >
                    <span>Verder (Add-ons)</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                  <button
                    onClick={async () => {
                      await unlockSeats()
                      await fetchLockedSeats()
                      setCurrentStep(1)
                    }}
                    type="button"
                    className="py-2.5 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Terug</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 => Add-Ons */}
      {currentStep === 3 && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-5">
                <ShoppingCart className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Selecteer Extra Opties (Add-ons)</h3>
              </div>
              <div className="space-y-5">
                {selectedSeats.map((s) => (
                  <div
                    key={s.id}
                    className="border border-gray-100 rounded-lg p-4 bg-gray-50 transition-all duration-200 hover:shadow-sm"
                  >
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                      <span>Rij {s.row} - Zetel {s.seat}</span>
                      <span className="text-blue-600">{s.ticketType?.name ?? 'Geen'} — €{s.price.toFixed(2)}</span>
                    </h4>
                    <div className="space-y-3">
                      {addons.map((addon) => {
                        const currentQty = selectedAddons.get(s.id)?.get(addon.id) || 0
                        return (
                          <div
                            key={addon.id}
                            className="flex items-center p-3 bg-white rounded-lg border border-gray-100 transition-all duration-200 hover:border-gray-200"
                          >
                            <div
                              className="w-12 h-12 bg-gray-200 rounded-md mr-3 flex items-center justify-center text-gray-400">
                              {addon.name.substring(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-800">{addon.name}</p>
                                <p className="text-blue-600 font-medium">€{addon.price.toFixed(2)}</p>
                              </div>
                              <p className="text-sm text-gray-500 truncate">{addon.description}</p>
                            </div>
                            <div className="flex items-center ml-4">
                              <button
                                onClick={() => handleAddonQuantityChange(addon.id, s.id, false)}
                                disabled={currentQty <= 0}
                                className={`w-8 h-8 flex items-center justify-center rounded-md ${currentQty <= 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors duration-200`}
                              >
                                <span className="text-lg font-medium">-</span>
                              </button>
                              <span className="w-8 text-center font-medium">{currentQty}</span>
                              <button
                                onClick={() => handleAddonQuantityChange(addon.id, s.id, true)}
                                disabled={currentQty >= (addon.maxQuantity || 10)}
                                className={`w-8 h-8 flex items-center justify-center rounded-md ${currentQty >= (addon.maxQuantity || 10) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'} transition-colors duration-200`}
                              >
                                <span className="text-lg font-medium">+</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
                >
                  <span>Ga verder naar Betaling</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
                <button
                  onClick={async () => {
                    await unlockSeats()
                    await fetchLockedSeats()
                    setCurrentStep(1)
                  }}
                  className="py-2.5 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Terug</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 => Payment */}
      {currentStep === 4 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-5">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Bevestig &amp; Betaal</h3>
              </div>
              <p className="text-gray-600 mb-6">Controleer je selectie en rond de betaling af.</p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Tickets:</span>
                  <span
                    className="font-medium">€{selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Add-ons:</span>
                  <span className="font-medium">€0.00</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">Totaal te betalen:</span>
                  <span className="font-bold text-blue-600">€{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handlePayment}
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
                >
                  <span>Nu Betalen</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Terug</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Partial gating logic:
 * If seat.groupLabel is empty => unlocked
 * If seatOrder === 1 => unlocked
 * If seatOrder <= 0 => locked
 * If seatOrder > 1 => all groups with smaller order need >= minCount seats sold or selected
 */
function isSeatGroupUnlockedPartial(
  seat: Seat,
  allSeats: Seat[],
  groupOrders: Record<string, number>,
  minCount: number,
  selectedIds: Set<string>,
): boolean {
  const label = seat.groupLabel?.trim()
  if (!label) return true
  if (!(label in groupOrders)) return false
  const seatOrder = groupOrders[label]
  if (seatOrder === 1) return true
  if (seatOrder <= 0) return false

  // seatOrder>1 => check all groups with order < seatOrder
  for (const grpLabel in groupOrders) {
    const order = groupOrders[grpLabel]
    if (order > 0 && order < seatOrder) {
      const seatsInGroup = allSeats.filter((s) => s.groupLabel?.trim() === grpLabel)
      let countFulfilled = 0
      for (const sg of seatsInGroup) {
        const seatId = `${sg.row}-${sg.seat}`
        if (sg.status === 'Sold' || selectedIds.has(seatId)) {
          countFulfilled++
        }
      }
      if (countFulfilled < minCount) {
        return false
      }
    }
  }
  return true
}

/** Finds seat by "row-seat" ID. */
function findSeatById(seats: Seat[], seatId: string): Seat | undefined {
  const [r, c] = seatId.split('-')
  return seats.find((s) => s.row === r && s.seat === c)
}
