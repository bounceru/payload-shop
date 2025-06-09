"use client";
import { useRouter } from "next/navigation";
import { DetailShell } from "@/app/(dashboard)/dashboard/components/ui/DetailShell";
import React from "react";
import { Toaster } from "sonner";

interface TicketAdminDetailProps {
  ticket: any;
  isNew?: boolean;
}

export default function TicketAdminDetail({ ticket, isNew = false }: TicketAdminDetailProps) {
  const router = useRouter();

  const eventLabel = typeof ticket.event === "object" ? ticket.event?.title : ticket.event;
  const typeLabel = typeof ticket.ticketType === "object" ? ticket.ticketType?.name : ticket.ticketType;
  const customerLabel = typeof ticket.customer === "object"
    ? `${ticket.customer.firstname || ""} ${ticket.customer.lastname || ""}`.trim()
    : ticket.customer || "";

  return (
    <DetailShell
      title={isNew ? "Nieuw Ticket" : `Ticket ${ticket.barcode || ""}`}
      description="Ticket details"
      onBack={() => router.back()}
    >
      <Toaster position="top-center" />
      <div className="grid gap-4">
        <div>
          <p className="text-sm text-gray-600">Barcode</p>
          <p className="font-medium">{ticket.barcode || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Event</p>
          <p className="font-medium">{eventLabel || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tickettype</p>
          <p className="font-medium">{typeLabel || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Klant</p>
          <p className="font-medium">{customerLabel || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Uitgegeven op</p>
          <p className="font-medium">
            {ticket.issuedAt ? new Date(ticket.issuedAt).toLocaleString() : "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Gescand op</p>
          <p className="font-medium">
            {ticket.scannedAt ? new Date(ticket.scannedAt).toLocaleString() : "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="font-medium capitalize">{ticket.status}</p>
        </div>
      </div>
    </DetailShell>
  );
}
