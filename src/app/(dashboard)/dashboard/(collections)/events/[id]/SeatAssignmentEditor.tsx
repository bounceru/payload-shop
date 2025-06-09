'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { FaTrash, FaPlus } from 'react-icons/fa'

interface Seat {
  id: string
  pinnedRow: number
  pinnedCol: number
  seat?: string
  status?: string | null
  purpose?: string | null
}

interface TicketType {
  id: string
  name: string
  price: number
  color?: string
}

interface SeatAssignmentEditorProps {
  seatMap: any
  ticketTypes: TicketType[]
  assignments: Record<string, string>
  onChange: (a: Record<string, string>) => void
  onTicketTypesChange?: (t: TicketType[]) => void
}

export default function SeatAssignmentEditor({
  seatMap,
  ticketTypes,
  assignments,
  onChange,
  onTicketTypesChange,
}: SeatAssignmentEditorProps) {
  const [selected, setSelected] = useState<string>('')
  const [ticketTypesState, setTicketTypesState] = useState<TicketType[]>(ticketTypes)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState<number>(0)
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set())
  const [rowSelected, setRowSelected] = useState<boolean[]>(() =>
    Array.from({ length: seatMap?.rows || 0 }, () => false),
  )
  const [colSelected, setColSelected] = useState<boolean[]>(() =>
    Array.from({ length: seatMap?.columns || 0 }, () => false),
  )

  useEffect(() => {
    setRowSelected(Array.from({ length: seatMap?.rows || 0 }, () => false))
    setColSelected(Array.from({ length: seatMap?.columns || 0 }, () => false))
    setSelectedSeatIds(new Set())
  }, [seatMap])

  useEffect(() => {
    setTicketTypesState(ticketTypes)
  }, [ticketTypes])

  function isSeatAssignable(seat: Seat) {
    if (seat.status && seat.status !== 'Seat') return false
    if (seat.purpose && seat.purpose !== 'none' && seat.purpose !== 'handicap') return false
    return true
  }

  function getPurposeSymbol(purpose: string | null | undefined) {
    if (!purpose || purpose === 'none') return ''
    if (purpose === 'techniek') return '⚙'
    if (purpose === 'ingang') return '🚪'
    if (purpose === 'nooduitgang')
      return <Image src="/icons/emergency-exit.png" alt="Nooduitgang" width={22} height={22} />
    if (purpose === 'handicap') return '♿'
    return ''
  }

  function toggleRowSelection(rIndex: number) {
    setRowSelected((prev) => {
      const copy = [...prev]
      copy[rIndex - 1] = !copy[rIndex - 1]
      return copy
    })
    const isSelecting = !rowSelected[rIndex - 1]
    setSelectedSeatIds((prev) => {
      const copy = new Set(prev)
      grouped.forEach((row) => {
        row.forEach((seat) => {
          if (seat.pinnedRow === rIndex && isSeatAssignable(seat)) {
            if (isSelecting) copy.add(seat.id)
            else copy.delete(seat.id)
          }
        })
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
      grouped.forEach((row) => {
        row.forEach((seat) => {
          if (seat.pinnedCol === cIndex && isSeatAssignable(seat)) {
            if (isSelecting) copy.add(seat.id)
            else copy.delete(seat.id)
          }
        })
      })
      return copy
    })
  }

  function handleApplySelection() {
    if (selectedSeatIds.size === 0) return
    const newAssignments = { ...assignments }
    selectedSeatIds.forEach((id) => {
      if (selected) newAssignments[id] = selected
      else delete newAssignments[id]
    })
    onChange(newAssignments)
    setSelectedSeatIds(new Set())
    setRowSelected(Array.from({ length: seatMap?.rows || 0 }, () => false))
    setColSelected(Array.from({ length: seatMap?.columns || 0 }, () => false))
  }

  function handleAddTicketType() {
    if (!newName.trim()) return
    const newTT = {
      id: `tt-${Date.now()}`,
      name: newName,
      price: newPrice,
      color: '#cccccc',
    }
    const arr = [...ticketTypesState, newTT]
    setTicketTypesState(arr)
    onTicketTypesChange && onTicketTypesChange(arr)
    setNewName('')
    setNewPrice(0)
  }

  function handleDeleteTicketType(id: string) {
    const arr = ticketTypesState.filter((t) => t.id !== id)
    setTicketTypesState(arr)
    onTicketTypesChange && onTicketTypesChange(arr)
    if (selected === id) setSelected('')
  }

  const ticketMap = useMemo(() => {
    const map: Record<string, TicketType> = {}
    ticketTypesState.forEach((tt) => {
      map[tt.id] = tt
    })
    return map
  }, [ticketTypesState])

  const grouped = useMemo(() => {
    const rows = seatMap?.rows || 0
    const cols = seatMap?.columns || 0
    const out: Seat[][] = []
    interface SeatMap {
      rows: number
      columns: number
      curve?: number
      seats: Seat[]
    }

    const seats: Seat[] = (seatMap?.seats || []).filter(
      (s: Seat) => s.status !== 'Empty' && s.status !== 'Hallway',
    )
    // Build an index for quick lookup
    const index = new Map<string, Seat>()
    seats.forEach((seat) => {
      index.set(`${seat.pinnedRow}-${seat.pinnedCol}`, seat)
    })
    for (let r = 1; r <= rows; r++) {
      const rowSeats: Seat[] = []
      for (let c = 1; c <= cols; c++) {
        rowSeats.push(
          index.get(`${r}-${c}`) || {
            id: `empty-${r}-${c}`,
            pinnedRow: r,
            pinnedCol: c,
            status: 'Empty',
          }
        )
      }
      out.push(rowSeats)
    }
    return out
  }, [seatMap])

  function handleSeatClick(seat: Seat) {
    if (!isSeatAssignable(seat)) return
    const id = seat.id
    const newAssignments = { ...assignments }
    if (selected) {
      newAssignments[id] = selected
    } else {
      delete newAssignments[id]
    }
    onChange(newAssignments)
  }

  return (
    <div className="flex gap-6">
      <div className="w-48 space-y-2">
        {ticketTypesState.map((tt) => (
          <label key={tt.id} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="ticketType"
              value={tt.id}
              checked={selected === tt.id}
              onChange={() => setSelected(tt.id)}
            />
            <span className="w-4 h-4 rounded" style={{ backgroundColor: tt.color || '#ccc' }} />
            <span>
              {tt.name} (€{tt.price})
            </span>
          </label>
        ))}
        <button
          type="button"
          onClick={() => setSelected('')}
          className="text-xs text-gray-600 mt-2"
        >
          Geen selectie
        </button>
        <div className="mt-4 space-y-1">
          <input
            className="border rounded p-1 w-full text-sm"
            placeholder="Naam"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-1 w-full text-sm"
            placeholder="Prijs"
            value={newPrice}
            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
          />
          <button
            type="button"
            onClick={handleAddTicketType}
            className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm text-gray-700"
          >
            <FaPlus className="h-3 w-3" />
            Add Ticket Type
          </button>
        </div>
        {ticketTypesState.length > 0 && (
          <div className="mt-4 space-y-1">
            {ticketTypesState.map((tt) => (
              <div key={`del-${tt.id}`} className="flex items-center justify-between text-xs">
                <span>{tt.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTicketType(tt.id)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-auto border rounded p-2 bg-gray-50">
        {grouped.map((row, rIdx) => (
          <div key={rIdx} className="flex flex-col">
            {rIdx === 0 && (
              <div className="flex items-center mb-1" style={{ marginLeft: 0 }}>
                <div style={{ width: 36 }} />
                {row.map((_, cIdx) => (
                  <div key={cIdx} style={{ width: 26, textAlign: 'center' }}>
                    <label className="flex flex-col items-center text-xs">
                      <span>{cIdx + 1}</span>
                      <input
                        type="checkbox"
                        checked={colSelected[cIdx] || false}
                        onChange={() => toggleColumnSelection(cIdx + 1)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center">
              <div className="w-8 text-right mr-1">
                <label className="inline-flex items-center text-xs">
                  <span>{row[0]?.pinnedRow}</span>
                  <input
                    type="checkbox"
                    className="ml-1"
                    checked={rowSelected[row[0]?.pinnedRow - 1] || false}
                    onChange={() => toggleRowSelection(row[0]?.pinnedRow)}
                  />
                </label>
              </div>
              {row.map((seat, cIdx) => {
                const assigned = assignments[seat.id]
                const color = ticketMap[assigned]?.color || '#e2e8f0'
                const N = row.length
                const midIndex = (N - 1) / 2
                const t = N > 1 ? (cIdx - midIndex) / midIndex : 0
                const yOffset = (seatMap?.curve || 0) * (1 - t * t)
                const purposeSymbol = getPurposeSymbol(seat.purpose)
                return (
                  <div
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className="m-0.5 flex items-center justify-center cursor-pointer"
                    style={{
                      transform: `translateY(${yOffset}px)`,
                      transition: 'transform 0.18s ease',
                      outline: selectedSeatIds.has(seat.id) ? '2px solid green' : 'none',
                      cursor: isSeatAssignable(seat) ? 'pointer' : 'default',
                      opacity: isSeatAssignable(seat) ? 1 : 0.5,
                    }}
                    title={seat.id}
                  >
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
                      >
                        {purposeSymbol}
                      </div>
                    ) : (
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
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: '#FFF',
                          fontWeight: 700,
                        }}
                      >
                        {seat.seat}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <button
          type="button"
          onClick={handleApplySelection}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Apply to Selection
        </button>
      </div>
    </div>
  )
}
