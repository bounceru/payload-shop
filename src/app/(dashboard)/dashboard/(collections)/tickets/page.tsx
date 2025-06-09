import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

import { CollectionShell } from "@/app/(dashboard)/dashboard/components/ui/CollectionShell";
import TicketsTableClient from "./TicketsTableClient";

export const dynamic = "force-dynamic";

export default async function TicketsListPage() {
  const payload = await getPayload({ config });
  const tenantId = (await cookies()).get("payload-tenant")?.value;

  const eventsRes = await payload.find({
    collection: "events",
    where: {
      ...(tenantId ? { tenant: { equals: tenantId } } : {}),
    },
    limit: 100,
    depth: 0,
  });
  const events = eventsRes.docs;

  const ticketTypesRes = await payload.find({
    collection: "event-ticket-types",
    where: {
      ...(tenantId ? { tenant: { equals: tenantId } } : {}),
    },
    limit: 100,
    depth: 0,
  });
  const ticketTypes = ticketTypesRes.docs;

  const ticketsRes = await payload.find({
    collection: "tickets",
    where: {
      ...(tenantId ? { tenant: { equals: tenantId } } : {}),
    },
    limit: 100,
    depth: 2,
  });
  const tickets = ticketsRes.docs;

  // Build event statistics
  const eventStats: Record<string, { sold: number; scanned: number; capacity: number }> = {};
  events.forEach((ev: any) => {
    eventStats[ev.id] = { sold: 0, scanned: 0, capacity: 0 };
  });
  tickets.forEach((t: any) => {
    const evId = typeof t.event === "object" ? t.event.id : t.event;
    if (!evId) return;
    if (!eventStats[evId]) eventStats[evId] = { sold: 0, scanned: 0, capacity: 0 };
    if (t.status !== "cancelled" && t.status !== "refunded") {
      eventStats[evId].sold += 1;
    }
    if (t.status === "scanned" || t.scannedAt) {
      eventStats[evId].scanned += 1;
    }
  });
  ticketTypes.forEach((tt: any) => {
    const evId = typeof tt.event === "object" ? tt.event.id : tt.event;
    if (!evId) return;
    if (!eventStats[evId]) eventStats[evId] = { sold: 0, scanned: 0, capacity: 0 };
    if (typeof tt.maxAmount === "number") {
      eventStats[evId].capacity += tt.maxAmount;
    }
  });

  return (
    <CollectionShell title="Tickets" description="Overzicht van tickets" createDisabled={true}>
      <TicketsTableClient tickets={tickets} events={events} eventStats={eventStats} />
    </CollectionShell>
  );
}
