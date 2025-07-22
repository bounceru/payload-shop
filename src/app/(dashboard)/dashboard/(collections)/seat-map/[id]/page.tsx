// File: src/app/(dashboard)/dashboard/(collections)/seatmaps/[id]/page.tsx

import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import SeatMapAdminDetail from './SeatMapAdminDetail'
import type { SeatMap as PayloadSeatMap } from '@/payload-types'

interface EventTicketType {
  id: string;
  name: string;
  price: number;
  color?: string;
}

type CleanSeat = {
  id?: string;
  pinnedRow: number;
  pinnedCol: number;
  row: string;
  seat: string;
  lockedRowLabel?: boolean;
  lockedSeatLabel?: boolean;
  ticketType: string;
  priceModifier?: number | null;
  status?: string;
  locks?: { eventId: string; lockedUntil: string }[];
  purpose?: 'none' | 'techniek' | 'ingang' | 'nooduitgang' | 'handicap';
  groupLabel?: string;
};

type CleanSeatMap = {
  id?: string;
  name: string;
  rows: number;
  columns: number;
  basePrice?: number;
  curve?: number;
  isDefault?: boolean;
  rowFormat?: string;
  colFormat?: string;
  venue?: string | { id: string; name: string };
  tenant?: string | { id: string };
  seats?: CleanSeat[];
};

function normalizeSeatMap(raw: PayloadSeatMap | CleanSeatMap): CleanSeatMap {
  return {
    id: raw.id,
    name: raw.name,
    rows: raw.rows,
    columns: raw.columns,
    curve: raw.curve ?? 24,
    isDefault: raw.isDefault === null ? undefined : raw.isDefault,
    rowFormat: raw.rowFormat ?? 'Numeric',
    colFormat: raw.colFormat ?? 'Numeric',
    venue: raw.venue,
    tenant: raw.tenant,
    seats: raw.seats?.map((seat) => {
      const safeSeat = seat as Record<string, unknown>
      return {
        id: typeof safeSeat.id === 'string' ? safeSeat.id : undefined,
        pinnedRow: Number(safeSeat.pinnedRow ?? 1),
        pinnedCol: Number(safeSeat.pinnedCol ?? 1),
        row: typeof safeSeat.row === 'string' ? safeSeat.row : '',
        seat: typeof safeSeat.seat === 'string' ? safeSeat.seat : '',
        lockedRowLabel: !!safeSeat.lockedRowLabel,
        lockedSeatLabel: !!safeSeat.lockedSeatLabel,
        ticketType:
          typeof safeSeat.ticketType === 'string'
            ? safeSeat.ticketType
            : typeof safeSeat.ticketType === 'object' &&
            safeSeat.ticketType &&
            'id' in safeSeat.ticketType
              ? (safeSeat.ticketType as { id: string }).id
              : '',
        priceModifier: typeof safeSeat.priceModifier === 'number' ? safeSeat.priceModifier : null,
        status: typeof safeSeat.status === 'string' ? safeSeat.status : 'Seat',
        purpose:
          typeof safeSeat.purpose === 'string' &&
          ['none', 'techniek', 'ingang', 'nooduitgang', 'handicap'].includes(safeSeat.purpose)
            ? (safeSeat.purpose as CleanSeat['purpose'])
            : 'none',
        locks: Array.isArray(safeSeat.locks) ? (safeSeat.locks as any[]) : [],
        groupLabel: typeof safeSeat.groupLabel === 'string' ? safeSeat.groupLabel : '',
        groupReleaseOrder: Number(safeSeat.groupReleaseOrder ?? 0),
        groupMinToReleaseNext: Number(safeSeat.groupMinToReleaseNext ?? 0),
      }
    }),
  }
}


export default async function SeatMapEditOrCreatePage({
                                                        params: promiseParams,
                                                      }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promiseParams
  const tenantId = (await cookies()).get('payload-tenant')?.value
  const payload = await getPayload({ config })

  if (id === 'new') {
    if (!tenantId) return notFound()

    const blankMap: CleanSeatMap = {
      name: '',
      rows: 5,
      columns: 10,
      curve: 24,
      isDefault: false,
      rowFormat: 'Numeric',
      colFormat: 'Numeric',
      tenant: tenantId,
      venue: '', // optional
      seats: Array.from({ length: 50 }, (_, i) => {
        const row = Math.floor(i / 10) + 1
        const col = (i % 10) + 1
        return {
          id: `pinned-${row}-${col}`,
          pinnedRow: row,
          pinnedCol: col,
          row: '',
          seat: '',
          lockedRowLabel: false,
          lockedSeatLabel: false,
          ticketType: '',
          status: 'Seat',
          locks: [],
          purpose: 'none',
          groupLabel: '',
          groupReleaseOrder: 0,
          groupMinToReleaseNext: 0,
        }
      }),
    }

    return <SeatMapAdminDetail seatMap={normalizeSeatMap(blankMap)} isNew />
  }

  const seatMap = await payload.findByID({
    collection: 'seatMaps',
    id,
    depth: 2,
  })

  if (!seatMap) return notFound()

  const seatMapTenant =
    typeof seatMap.tenant === 'object' ? seatMap.tenant?.id : seatMap.tenant

  if (tenantId && seatMapTenant !== tenantId) return notFound()

  return <SeatMapAdminDetail seatMap={normalizeSeatMap(seatMap)} />
}
