import React from "react";
import InvoiceSidebar from "./InvoiceSidebar";
import InvoiceMain from "./InvoiceMain";

export default function Invoice() {
  return (
    <div className="flex flex-col h-full gap-6 sm:gap-5 xl:flex-row">
      {/* <!-- Invoice Sidebar Start --> */}
      <InvoiceSidebar />
      {/* <!-- Invoice Sidebar End --> */}

      {/* <!-- Invoice Mainbox Start --> */}
      <InvoiceMain />
      {/* <!-- Invoice Mainbox End --> */}
    </div>
  );
}
