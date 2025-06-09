// File: src/app/(dashboard)/dashboard/(collections)/emails/page.tsx
import { redirect } from "next/navigation";

export default async function EmailsIndexPage() {
    // By default, redirect the user to the first tab, e.g. “templates”
    redirect("/dashboard/emails/emails");
}
