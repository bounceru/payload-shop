export function getEventLowestPrice(event: any): number | null {
  const seatMap = event?.seatMap;
  if (seatMap && Array.isArray(seatMap.seats)) {
    const ticketMap: Record<string, any> = {};
    (event.ticketTypes || []).forEach((tt: any) => {
      if (tt && tt.id) ticketMap[tt.id] = tt;
    });

    let min: number | null = null;
    for (const seat of seatMap.seats) {
      if (!seat) continue;
      const ttId = event.seatAssignments?.[seat.id];
      const price = ticketMap[ttId]?.price;
      if (typeof price === 'number') {
        if (min === null || price < min) {
          min = price;
        }
      }
    }
    return min;
  }
  return null;
}
