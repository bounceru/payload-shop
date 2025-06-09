import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import TicketAdminDetail from "./TicketAdminDetail";

export default async function TicketDetailPage({ params: promisedParams }: { params: Promise<{ id: string }> }) {
  const { id } = await promisedParams;
  const payload = await getPayload({ config });

  if (id === "new") {
    return <TicketAdminDetail ticket={{ id: "new" } as any} isNew />;
  }

  const ticketDoc = await payload.findByID({ collection: "tickets", id, depth: 2 });
  if (!ticketDoc) return notFound();

  const tenantId = (await cookies()).get("payload-tenant")?.value;
  const ticketTenant = typeof ticketDoc.tenant === "object" ? ticketDoc.tenant.id : ticketDoc.tenant;
  if (tenantId && ticketTenant !== tenantId) return notFound();

  return <TicketAdminDetail ticket={ticketDoc as any} />;
}
