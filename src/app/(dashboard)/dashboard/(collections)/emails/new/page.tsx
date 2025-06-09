import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import EmailAdminDetail from "../[id]/EmailAdminDetail";

export default async function NewEmailPage() {
    const tenantId = (await cookies()).get("payload-tenant")?.value;
    if (!tenantId) {
        return notFound();
    }

    const payload = await getPayload({ config });

    const shopsRes = await payload.find({
        collection: "shops",
        where: { tenant: { equals: tenantId } },
        limit: 100,
        depth: 0,
    });
    const shops = shopsRes.docs.map((s: any) => ({ id: s.id, name: s.name || "" }));

    const customersRes = await payload.find({
        collection: "customers",
        where: { tenant: { equals: tenantId } },
        limit: 100,
        depth: 0,
    });
    const customers = customersRes.docs.map((c: any) => ({
        id: c.id,
        email: c.email || "",
        firstname: c.firstname || "",
        lastname: c.lastname || "",
    }));

    const initialEmail = {
        id: "new",
        tenant: tenantId,
        shops: [],
        allCustomers: false,
        recipients: [],
        extraRecipients: "",
        subject: "",
        body: "",
        send: false,
    };

    return (
        <EmailAdminDetail email={initialEmail} shops={shops} customers={customers} isNew />
    );
}
